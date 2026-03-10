/**
 * Duplicate Signal Detector
 *
 * Identifies signals that are semantically very similar and may be duplicates.
 * Uses in-process cosine similarity over Convex-stored embeddings (replaces pgvector).
 *
 * Migrated to Convex (replaces Drizzle/pgvector).
 */

import { getSignalsWithEmbeddings, cosineSimilarity as calcCosineSimilarity } from "@/lib/signals/similarity";

export interface DuplicatePair {
  id: string;
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

const DEFAULT_SIMILARITY_THRESHOLD = 0.9;


/**
 * Find potential duplicate signal pairs using in-process cosine similarity.
 */
export async function findDuplicateSignals(
  workspaceId: string,
  similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD,
  limit = 20
): Promise<DuplicateDetectionResult> {
  const candidates = await getSignalsWithEmbeddings(workspaceId);

  const active = (candidates as Array<{
    _id: string;
    verbatim: string;
    source?: string;
    status: string;
    embeddingVector?: number[];
    _creationTime: number;
  }>).filter((s) => s.status !== "archived" && s.embeddingVector && s.embeddingVector.length > 0);

  const pairs: DuplicatePair[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < active.length && pairs.length < limit; i++) {
    const s1 = active[i];
    if (!s1.embeddingVector) continue;

    for (let j = i + 1; j < active.length && pairs.length < limit; j++) {
      const s2 = active[j];
      if (!s2.embeddingVector) continue;

      const pairId = [s1._id, s2._id].sort().join("-");
      if (seenPairs.has(pairId)) continue;
      seenPairs.add(pairId);

      const similarity = calcCosineSimilarity(s1.embeddingVector, s2.embeddingVector);
      if (similarity >= similarityThreshold) {
        pairs.push({
          id: pairId,
          signal1: {
            id: s1._id,
            verbatim: s1.verbatim,
            source: s1.source || "unknown",
            createdAt: new Date(s1._creationTime),
          },
          signal2: {
            id: s2._id,
            verbatim: s2.verbatim,
            source: s2.source || "unknown",
            createdAt: new Date(s2._creationTime),
          },
          similarity,
        });
      }
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity);

  return { pairs, total: pairs.length };
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
