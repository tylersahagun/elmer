// orchestrator/src/app/api/signals/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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
import { processSignalExtraction } from "@/lib/signals";
import { createConvexWorkspaceActivity } from "@/lib/convex/server";

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

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE_DISPLAY}` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const extension = file.name.toLowerCase().split(".").pop() || "";
    const mimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const extensionValid = ALLOWED_EXTENSIONS.includes(extension);

    if (!mimeValid && !extensionValid) {
      return NextResponse.json(
        { error: "Invalid file type. Accepted: PDF, CSV, TXT" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentValidation = await validateFileContent(buffer, file.type);
    if (!contentValidation.valid) {
      return NextResponse.json(
        { error: contentValidation.error },
        { status: 400 }
      );
    }

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

    if (!extraction.text || extraction.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file. File may be empty or unreadable." },
        { status: 400 }
      );
    }

    const sourceRef = `upload-${Date.now()}-${nanoid(6)}`;
    const client = getConvexClient();
    const signalId = await client.mutation(api.signals.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      verbatim: extraction.text,
      interpretation: interpretation?.trim() || undefined,
      source: "upload",
      sourceRef,
      status: "new",
    });

    after(async () => {
      try {
        await createConvexWorkspaceActivity({
          workspaceId,
          action: "signal.created",
          targetType: "signal",
          targetId: signalId as string,
          metadata: {
            source: "upload",
            fileName: file.name,
            fileType: extraction.metadata.fileType,
            charCount: extraction.metadata.charCount,
          },
        });
      } catch (logError) {
        console.error("Failed to log upload activity:", logError);
      }
    });

    after(async () => {
      try {
        await processSignalExtraction(signalId as string);
      } catch (error) {
        console.error(`Failed to process uploaded signal ${signalId}:`, error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signalId,
          verbatim:
            extraction.text.length > 200
              ? extraction.text.slice(0, 200) + "..."
              : extraction.text,
          source: "upload",
          status: "new",
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

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}
