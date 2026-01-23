// orchestrator/src/app/api/signals/ingest/route.ts

/**
 * POST /api/signals/ingest
 *
 * Ingest endpoint for creating signals from raw text input.
 * Creates signal and queues AI extraction processing via after().
 *
 * Uses queue-first pattern: return 201 immediately, process asynchronously.
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { createSignal } from "@/lib/db/queries";
import { processSignalExtraction } from "@/lib/signals";
import type { SignalSource } from "@/lib/db/schema";

interface IngestRequestBody {
  workspaceId: string;
  rawInput: string;
  source?: SignalSource;
  interpretation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequestBody = await request.json();
    const { workspaceId, rawInput, source, interpretation } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!rawInput || rawInput.trim() === "") {
      return NextResponse.json(
        { error: "rawInput is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Require member access to create signals
    await requireWorkspaceAccess(workspaceId, "member");

    // Create signal with verbatim = trimmed rawInput
    const sourceRef = `ingest-${Date.now()}-${nanoid(6)}`;
    const signal = await createSignal({
      workspaceId,
      verbatim: rawInput.trim(),
      interpretation: interpretation?.trim() || undefined,
      source: source || "paste", // Default to "paste" if not provided
      sourceRef,
    });

    // Queue AI extraction and embedding (Phase 15)
    after(async () => {
      try {
        await processSignalExtraction(signal!.id);
      } catch (error) {
        console.error(`Failed to process signal ${signal!.id}:`, error);
      }
    });

    // Return 201 with signal info
    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signal!.id,
          status: "processing", // Indicates extraction in progress
        },
        message: "Signal created. Extraction in progress.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Ingest failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 }
    );
  }
}
