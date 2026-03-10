/**
 * POST /api/signals/[id]/classify
 *
 * Manually trigger (re-)classification of a signal.
 * Useful when projects have been added/updated and user wants fresh classification.
 *
 * Response:
 * - classification: The new classification result
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { classifySignal } from "@/lib/classification";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: id as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    if (!signal.embeddingVector || (signal.embeddingVector as number[]).length === 0) {
      return NextResponse.json(
        { error: "Signal has no embedding. Wait for processing to complete." },
        { status: 400 }
      );
    }

    const classification = await classifySignal(
      id,
      signal.embeddingVector as number[],
      signal.verbatim as string,
      signal.workspaceId as string
    );

    return NextResponse.json({
      success: true,
      signalId: id,
      classification,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Manual classification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Classification failed" },
      { status: 500 }
    );
  }
}
