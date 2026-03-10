/**
 * GET /api/signals/duplicates
 *
 * Returns potential duplicate signal pairs for a workspace.
 * Uses in-process cosine similarity over Convex-stored embeddings
 * (replaces pgvector duplicate detection).
 *
 * Query params: workspaceId, similarity (optional), limit (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getConvexWorkspace } from "@/lib/convex/server";
import { cosineSimilarity } from "@/lib/signals/similarity";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

const DEFAULT_SIMILARITY_THRESHOLD = 0.9;
const DEFAULT_MAINTENANCE_DUPLICATE_THRESHOLD = 0.9;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    // Get workspace maintenance settings from Convex
    const workspace = await getConvexWorkspace(workspaceId);
    const maintenanceSettings = workspace?.settings?.maintenance;
    const defaultThreshold =
      maintenanceSettings?.duplicateSimilarityThreshold ??
      DEFAULT_MAINTENANCE_DUPLICATE_THRESHOLD;

    const similarityThreshold =
      parseFloat(searchParams.get("similarity") || "") || defaultThreshold;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Fetch signals with embeddings from Convex
    const client = getConvexClient();
    const signalsWithEmbeddings = await client.query(
      api.signals.listWithEmbeddings,
      { workspaceId: workspaceId as Id<"workspaces"> }
    );

    type SignalWithEmbedding = {
      _id: string;
      verbatim: string;
      source: string;
      _creationTime: number;
      status: string;
      embeddingVector: number[];
    };

    const candidates = (signalsWithEmbeddings as SignalWithEmbedding[]).filter(
      (s) => s.status !== "archived"
    );

    // Find duplicate pairs using in-process cosine similarity
    const pairs: Array<{
      id: string;
      signal1: { id: string; verbatim: string; source: string; createdAt: string };
      signal2: { id: string; verbatim: string; source: string; createdAt: string };
      similarity: number;
    }> = [];
    const seenPairs = new Set<string>();

    for (const signal of candidates) {
      if (pairs.length >= limit) break;
      if (!signal.embeddingVector) continue;

      for (const other of candidates) {
        if (pairs.length >= limit) break;
        if (other._id === signal._id) continue;
        if (!other.embeddingVector) continue;

        const pairId = [signal._id, other._id].sort().join("-");
        if (seenPairs.has(pairId)) continue;

        const similarity = cosineSimilarity(
          signal.embeddingVector,
          other.embeddingVector
        );

        if (similarity >= similarityThreshold) {
          seenPairs.add(pairId);
          pairs.push({
            id: pairId,
            signal1: {
              id: signal._id,
              verbatim: signal.verbatim,
              source: signal.source || "unknown",
              createdAt: new Date(signal._creationTime).toISOString(),
            },
            signal2: {
              id: other._id,
              verbatim: other.verbatim,
              source: other.source || "unknown",
              createdAt: new Date(other._creationTime).toISOString(),
            },
            similarity,
          });
        }
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ pairs, total: pairs.length });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to find duplicate signals:", error);
    return NextResponse.json(
      { error: "Failed to find duplicate signals" },
      { status: 500 }
    );
  }
}
