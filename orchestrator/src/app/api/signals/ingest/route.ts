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
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { processSignalExtraction } from "@/lib/signals";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

interface IngestRequestBody {
  workspaceId: string;
  rawInput: string;
  source?: string;
  interpretation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequestBody = await request.json();
    const { workspaceId, rawInput, source, interpretation } = body;

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

    await requireWorkspaceAccess(workspaceId, "member");

    const sourceRef = `ingest-${Date.now()}-${nanoid(6)}`;
    const client = getConvexClient();
    const signalId = await client.mutation(api.signals.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      verbatim: rawInput.trim(),
      interpretation: interpretation?.trim() || undefined,
      source: source || "paste",
      sourceRef,
      status: "new",
    });

    after(async () => {
      try {
        await processSignalExtraction(signalId as string);
      } catch (error) {
        console.error(`Failed to process signal ${signalId}:`, error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        signal: {
          id: signalId,
          status: "processing",
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
