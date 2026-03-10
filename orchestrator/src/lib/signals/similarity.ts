/**
 * Signal Embedding Similarity — Convex-backed replacement for pgvector
 *
 * Instead of pgvector's native KNN index scan, this module:
 * 1. Fetches signals with embeddings from Convex
 * 2. Computes cosine similarity in-process
 * 3. Returns top-K results sorted by similarity
 *
 * Quality: Identical to pgvector cosine similarity (same math, same model).
 * Performance: Acceptable for <50K signals per workspace. For very large
 *   corpora an external vector index (e.g. Upstash Vector) could be layered
 *   in, but is not required at current scale.
 *
 * This file replaces the pgvector-dependent functions in src/lib/db/queries.ts:
 *   - findSimilarSignals
 *   - findBestProjectMatch
 *   - findBestProjectMatches
 *   - getUnlinkedSignalsWithEmbeddings
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

/**
 * Compute cosine similarity between two embedding vectors.
 * Returns a value in [-1, 1], where 1 = identical direction.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export interface SimilarSignal {
  id: string;
  verbatim: string;
  interpretation: string | null;
  severity: string | null;
  frequency: string | null;
  status: string;
  source: string;
  similarity: number;
  distance: number;
}

/**
 * Find signals similar to a given embedding vector.
 * Replaces: queries.findSimilarSignals (pgvector)
 */
export async function findSimilarSignalsConvex(
  workspaceId: string,
  targetVector: number[],
  limit = 10,
  excludeId?: string,
): Promise<SimilarSignal[]> {
  const client = getConvexClient();
  const signals = await client.query(api.signals.listWithEmbeddings, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  const scored = signals
    .filter((s: { _id: string; embeddingVector?: number[] }) =>
      s._id !== excludeId && s.embeddingVector && s.embeddingVector.length > 0,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => {
      const similarity = cosineSimilarity(targetVector, s.embeddingVector as number[]);
      return {
        id: s._id as string,
        verbatim: s.verbatim as string,
        interpretation: (s.interpretation ?? null) as string | null,
        severity: (s.severity ?? null) as string | null,
        frequency: (s.frequency ?? null) as string | null,
        status: s.status as string,
        source: s.source as string,
        similarity,
        distance: 1 - similarity,
      };
    })
    .sort((a: SimilarSignal, b: SimilarSignal) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

export interface ProjectMatch {
  id: string;
  name: string;
  description: string | null;
  stage: string;
  similarity: number;
  distance: number;
}

/**
 * Find the best matching project for a signal embedding.
 * Replaces: queries.findBestProjectMatch (pgvector)
 */
export async function findBestProjectMatchConvex(
  workspaceId: string,
  signalVector: number[],
): Promise<ProjectMatch | null> {
  const matches = await findBestProjectMatchesConvex(workspaceId, signalVector, 1);
  return matches[0] ?? null;
}

/**
 * Find the top N matching projects for a signal embedding.
 * Replaces: queries.findBestProjectMatches (pgvector)
 */
export async function findBestProjectMatchesConvex(
  workspaceId: string,
  signalVector: number[],
  limit = 5,
): Promise<ProjectMatch[]> {
  const client = getConvexClient();
  const projects = await client.query(api.projects.listWithEmbeddings, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  if (!projects || projects.length === 0) return [];

  const scored = projects
    .filter((p: { embeddingVector?: number[] }) =>
      p.embeddingVector && p.embeddingVector.length > 0,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => {
      const similarity = cosineSimilarity(signalVector, p.embeddingVector as number[]);
      return {
        id: p._id as string,
        name: p.name as string,
        description: (p.description ?? null) as string | null,
        stage: p.stage as string,
        similarity,
        distance: 1 - similarity,
      };
    })
    .sort((a: ProjectMatch, b: ProjectMatch) => b.similarity - a.similarity)
    .slice(0, limit);

  return scored;
}

/**
 * Get unlinked signals with embeddings for clustering.
 * Replaces: queries.getUnlinkedSignalsWithEmbeddings (Drizzle)
 */
export async function getUnlinkedSignalsWithEmbeddingsConvex(
  workspaceId: string,
  limit = 100,
) {
  const client = getConvexClient();
  const signals = await client.query(api.signals.listWithEmbeddings, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  return signals
    .filter((s: {
      embeddingVector?: number[];
      status: string;
      signalProjectCount?: number;
    }) =>
      s.embeddingVector &&
      s.embeddingVector.length > 0 &&
      (s.status === "new" || s.status === "reviewed"),
    )
    .slice(0, limit);
}

/**
 * Get all non-archived signals with embeddings for a workspace.
 * Used by duplicate detection.
 */
export async function getSignalsWithEmbeddings(workspaceId: string) {
  const client = getConvexClient();
  const signals = await client.query(api.signals.listWithEmbeddings, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  return (signals as Array<{ status: string; embeddingVector?: number[] }>)
    .filter((s) => s.status !== "archived");
}
