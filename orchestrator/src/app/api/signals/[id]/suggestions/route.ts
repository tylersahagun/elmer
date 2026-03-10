/**
 * GET /api/signals/[id]/suggestions
 *
 * Returns project association suggestions for an orphan signal.
 * Uses Convex-stored embeddings with in-process cosine similarity
 * (replaces pgvector cosine distance).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { findBestProjectMatchesConvex } from "@/lib/signals/similarity";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: signalId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const embeddingVector = signal.embeddingVector as number[] | undefined;
    if (!embeddingVector || embeddingVector.length === 0) {
      return NextResponse.json({
        suggestions: [],
        reason: "Signal has no embedding - cannot compute similarity",
      });
    }

    const minConfidence = 0.6;
    const matches = await findBestProjectMatchesConvex(workspaceId, embeddingVector, 5);

    const suggestions = matches
      .filter((match) => match.similarity >= minConfidence)
      .map((match) => ({
        projectId: match.id,
        projectName: match.name,
        projectDescription: match.description,
        projectStage: match.stage,
        confidence: match.similarity,
        reason: `${Math.round(match.similarity * 100)}% semantic similarity to "${match.name}"`,
      }));

    return NextResponse.json({
      signalId,
      suggestions,
      minConfidence,
      totalMatches: matches.length,
      filteredCount: suggestions.length,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("[API /signals/suggestions]", error);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}
