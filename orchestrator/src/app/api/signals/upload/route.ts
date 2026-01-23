// orchestrator/src/app/api/signals/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import {
  extractTextFromFile,
  validateFileContent,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_DISPLAY,
} from "@/lib/files";
import { createSignal } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { processSignalExtraction } from "@/lib/signals";

const ALLOWED_MIME_TYPES = ["application/pdf", "text/csv", "text/plain"];
const ALLOWED_EXTENSIONS = ["pdf", "csv", "txt"];

/**
 * POST /api/signals/upload
 * Upload a file (PDF, CSV, TXT), extract text, create signal
 *
 * FormData fields:
 * - file: File (required) - The file to process
 * - workspaceId: string (required) - Workspace to create signal in
 * - interpretation: string (optional) - User's interpretation of the content
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const workspaceId = formData.get("workspaceId") as string | null;
    const interpretation = formData.get("interpretation") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}` },
        { status: 400 }
      );
    }

    // Validate file size > 0
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    // Validate file type (MIME and/or extension)
    const extension = file.name.toLowerCase().split(".").pop() || "";
    const mimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const extensionValid = ALLOWED_EXTENSIONS.includes(extension);

    if (!mimeValid && !extensionValid) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: PDF, CSV, TXT" },
        { status: 400 }
      );
    }

    // Require member access to create signals
    await requireWorkspaceAccess(workspaceId, "member");

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Server-side content validation (magic bytes for PDFs)
    const contentValidation = await validateFileContent(buffer, file.type);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

    // Extract text from file
    let extraction;
    try {
      extraction = await extractTextFromFile(buffer, file.name, file.type);
    } catch (extractionError) {
      const message =
        extractionError instanceof Error
          ? extractionError.message
          : "Could not extract text from file";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // Verify extraction produced text
    if (!extraction.text || extraction.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file. File may be empty or unreadable." },
        { status: 400 }
      );
    }

    // Create signal with extracted text
    const sourceRef = `upload-${Date.now()}-${nanoid(6)}`;
    const signal = await createSignal({
      workspaceId,
      verbatim: extraction.text,
      interpretation: interpretation?.trim() || undefined,
      source: "upload",
      sourceRef,
      sourceMetadata: {
        sourceName: file.name,
        rawPayload: {
          fileName: file.name,
          fileSize: file.size,
          fileType: extraction.metadata.fileType,
          originalFileName: extraction.metadata.originalFileName,
          charCount: extraction.metadata.charCount,
          pageCount: extraction.metadata.pageCount,
          rowCount: extraction.metadata.rowCount,
        },
      },
    });

    // Log activity asynchronously (queue-first pattern from Phase 13)
    after(async () => {
      try {
        await db.insert(activityLogs).values({
          id: nanoid(),
          workspaceId,
          action: "signal.created",
          targetType: "signal",
          targetId: signal!.id,
          metadata: {
            source: "upload",
            fileName: file.name,
            fileType: extraction.metadata.fileType,
            charCount: extraction.metadata.charCount,
          },
          createdAt: new Date(),
        });
      } catch (logError) {
        // Never throw in after() context - log errors for debugging (Phase 13 pattern)
        console.error("Failed to log upload activity:", logError);
      }
    });

    // Queue AI extraction and embedding (Phase 15)
    after(async () => {
      try {
        await processSignalExtraction(signal!.id);
      } catch (error) {
        console.error(`Failed to process uploaded signal ${signal!.id}:`, error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signal!.id,
          verbatim:
            signal!.verbatim.length > 200
              ? signal!.verbatim.slice(0, 200) + "..."
              : signal!.verbatim,
          source: signal!.source,
          status: signal!.status,
        },
        extraction: {
          fileType: extraction.metadata.fileType,
          fileName: extraction.metadata.originalFileName,
          charCount: extraction.metadata.charCount,
          pageCount: extraction.metadata.pageCount,
          rowCount: extraction.metadata.rowCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
