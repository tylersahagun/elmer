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
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getSignal } from "@/lib/db/queries";
import { classifySignal } from "@/lib/classification";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Get the signal
    const signal = await getSignal(id);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Require member access for classification
    await requireWorkspaceAccess(signal.workspaceId, "member");

    // Check if signal has embedding
    if (!signal.embeddingVector) {
      return NextResponse.json(
        { error: "Signal has no embedding. Wait for processing to complete." },
        { status: 400 }
      );
    }

    // Run classification
    const classification = await classifySignal(
      id,
      signal.embeddingVector,
      signal.verbatim,
      signal.workspaceId
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
