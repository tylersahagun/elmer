/**
 * GET /api/signals/[id]/similar
 *
 * Find signals semantically similar to the given signal.
 * Uses in-process cosine similarity over Convex-stored embeddings
 * (replaces pgvector cosine distance).
 *
 * Query params:
 * - limit?: number (default 10, max 50)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { findSimilarSignalsConvex } from "@/lib/signals/similarity";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: id as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "viewer");

    if (!signal.embeddingVector || (signal.embeddingVector as number[]).length === 0) {
      return NextResponse.json(
        { error: "Signal has no embedding. Wait for processing to complete." },
        { status: 400 },
      );
    }

    const similarSignals = await findSimilarSignalsConvex(
      signal.workspaceId as string,
      signal.embeddingVector as number[],
      limit,
      id,
    );

    return NextResponse.json({
      success: true,
      signalId: id,
      similar: similarSignals,
      count: similarSignals.length,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[API /signals/similar]", error);
    return NextResponse.json({ error: "Failed to find similar signals" }, { status: 500 });
  }
}
