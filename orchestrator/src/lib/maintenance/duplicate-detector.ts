/**
 * Duplicate Signal Detector
 *
 * Identifies signals that are semantically very similar and may be duplicates.
 * Uses pgvector cosine similarity with high threshold (0.9+).
 *
 * Definition: Two signals are potential duplicates when:
 * - Cosine similarity > 0.9 (configurable)
 * - Neither is already archived
 * - Both have embeddings
 */

import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq, and, ne, isNotNull, sql } from "drizzle-orm";

export interface DuplicatePair {
  id: string; // Unique pair ID (sorted signal IDs joined)
  signal1: {
    id: string;
    verbatim: string;
    source: string;
    createdAt: Date;
  };
  signal2: {
    id: string;
    verbatim: string;
    source: string;
    createdAt: Date;
  };
  similarity: number;
}

export interface DuplicateDetectionResult {
  pairs: DuplicatePair[];
  total: number;
}

// Default threshold - very high to minimize false positives
const DEFAULT_SIMILARITY_THRESHOLD = 0.9; // cosine similarity > 0.9

/**
 * Find potential duplicate signal pairs.
 *
 * Algorithm:
 * 1. Get signals with embeddings that are not archived
 * 2. For each signal, find very similar signals via pgvector
 * 3. Deduplicate pairs (A-B same as B-A)
 * 4. Return pairs sorted by similarity
 *
 * @param workspaceId - Workspace to search
 * @param similarityThreshold - Min similarity (0-1, default 0.9)
 * @param limit - Max pairs to return (default 20)
 */
export async function findDuplicateSignals(
  workspaceId: string,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
  limit = 20
): Promise<DuplicateDetectionResult> {
  // Convert similarity to distance threshold
  const distanceThreshold = 1 - similarityThreshold;

  // Get signals with embeddings that are not archived
  const candidates = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      createdAt: signals.createdAt,
      embeddingVector: signals.embeddingVector,
    })
    .from(signals)
    .where(
      and(
        eq(signals.workspaceId, workspaceId),
        ne(signals.status, "archived"),
        isNotNull(signals.embeddingVector)
      )
    )
    .limit(100); // Process up to 100 signals for performance

  const pairs: DuplicatePair[] = [];
  const seenPairs = new Set<string>();

  for (const signal of candidates) {
    if (!signal.embeddingVector) continue;

    // Find similar signals using pgvector cosine distance
    const vectorStr = `[${signal.embeddingVector.join(",")}]`;
    const similar = await db.execute(sql`
      SELECT
        id,
        verbatim,
        source,
        created_at,
        embedding_vector <=> ${vectorStr}::vector AS distance
      FROM signals
      WHERE workspace_id = ${workspaceId}
        AND id != ${signal.id}
        AND status != 'archived'
        AND embedding_vector IS NOT NULL
        AND embedding_vector <=> ${vectorStr}::vector < ${distanceThreshold}
      ORDER BY embedding_vector <=> ${vectorStr}::vector
      LIMIT 5
    `);

    for (const row of similar.rows) {
      const match = row as {
        id: string;
        verbatim: string;
        source: string;
        created_at: Date;
        distance: number;
      };

      // Create canonical pair ID to avoid A-B and B-A duplicates
      const pairId = [signal.id, match.id].sort().join("-");
      if (seenPairs.has(pairId)) continue;
      seenPairs.add(pairId);

      pairs.push({
        id: pairId,
        signal1: {
          id: signal.id,
          verbatim: signal.verbatim,
          source: signal.source || "unknown",
          createdAt: signal.createdAt,
        },
        signal2: {
          id: match.id,
          verbatim: match.verbatim,
          source: match.source || "unknown",
          createdAt: match.created_at,
        },
        similarity: 1 - match.distance,
      });

      if (pairs.length >= limit) break;
    }

    if (pairs.length >= limit) break;
  }

  // Sort by similarity (highest first)
  pairs.sort((a, b) => b.similarity - a.similarity);

  return {
    pairs,
    total: pairs.length,
  };
}

/**
 * Get count of duplicate pairs for dashboard display.
 */
export async function getDuplicateCount(
  workspaceId: string,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD
): Promise<number> {
  const result = await findDuplicateSignals(workspaceId, similarityThreshold, 50);
  return result.total;
}
