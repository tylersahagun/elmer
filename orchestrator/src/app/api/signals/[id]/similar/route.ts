/**
 * GET /api/signals/[id]/similar
 *
 * Find signals semantically similar to the given signal.
 *
 * Query params:
 * - limit?: number (default 10, max 50)
 *
 * Response:
 * - signals: Array of similar signals with similarity scores
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getSignal, findSimilarSignals } from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // Get the signal
    const signal = await getSignal(id);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Check access
    await requireWorkspaceAccess(signal.workspaceId, "viewer");

    // Check if signal has embedding
    if (!signal.embeddingVector) {
      return NextResponse.json(
        { error: "Signal has no embedding. Wait for processing to complete." },
        { status: 400 }
      );
    }

    // Find similar signals
    const similarSignals = await findSimilarSignals(
      signal.workspaceId,
      signal.embeddingVector,
      limit,
      id
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

    console.error("Find similar signals failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to find similar signals" },
      { status: 500 }
    );
  }
}
