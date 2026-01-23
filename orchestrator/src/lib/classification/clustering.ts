/**
 * Signal Clustering Module
 *
 * Uses K-NN queries via pgvector to find semantic clusters in unlinked signals.
 * Clusters are generated on-demand for /synthesize command.
 *
 * Pattern:
 * 1. Get unlinked signals with embeddings
 * 2. For each seed signal, find K nearest neighbors
 * 3. Filter by distance threshold
 * 4. Deduplicate overlapping clusters
 * 5. Generate themes for clusters via LLM
 */

import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";
import {
  findSimilarSignals,
  getUnlinkedSignalsWithEmbeddings,
} from "@/lib/db/queries";
import type { SignalSeverity, SignalFrequency } from "@/lib/db/schema";

// Clustering parameters
const NEIGHBOR_LIMIT = 10;
const DISTANCE_THRESHOLD = 0.3; // cosine distance < 0.3 = similarity > 0.7
const MIN_CLUSTER_SIZE = 2;

export interface ClusterSignal {
  id: string;
  verbatim: string;
  interpretation: string | null;
  severity: SignalSeverity | null;
  frequency: SignalFrequency | null;
  distance: number;
  similarity: number;
}

export interface SignalCluster {
  id: string;
  signals: ClusterSignal[];
  theme: string;
  severity: SignalSeverity;
  frequency: SignalFrequency;
  suggestedAction: "new_project" | "link_to_existing" | "review";
  confidence: number;
  signalCount: number;
}

/**
 * Find clusters of semantically similar unlinked signals.
 *
 * @param workspaceId - Workspace to search
 * @param minClusterSize - Minimum signals to form a cluster (default 2)
 * @returns Array of signal clusters with themes and suggested actions
 */
export async function findSignalClusters(
  workspaceId: string,
  minClusterSize = MIN_CLUSTER_SIZE
): Promise<SignalCluster[]> {
  // Get unlinked signals with embeddings
  const seeds = await getUnlinkedSignalsWithEmbeddings(workspaceId, 100);

  if (seeds.length === 0) {
    return [];
  }

  const clusters: SignalCluster[] = [];
  const processedIds = new Set<string>();

  for (const seed of seeds) {
    // Skip if already part of a cluster
    if (processedIds.has(seed.id)) continue;

    // Skip if no embedding vector
    if (!seed.embeddingVector) continue;

    // Find similar signals
    const neighbors = await findSimilarSignals(
      workspaceId,
      seed.embeddingVector,
      NEIGHBOR_LIMIT,
      seed.id
    );

    // Filter by distance threshold
    const closeNeighbors = neighbors.filter(
      (n) => n.distance < DISTANCE_THRESHOLD
    );

    // Check minimum cluster size (seed + neighbors)
    if (closeNeighbors.length + 1 < minClusterSize) continue;

    // Build cluster signals array
    const clusterSignals: ClusterSignal[] = [
      {
        id: seed.id,
        verbatim: seed.verbatim,
        interpretation: seed.interpretation,
        severity: seed.severity as SignalSeverity | null,
        frequency: seed.frequency as SignalFrequency | null,
        distance: 0,
        similarity: 1,
      },
      ...closeNeighbors.map((n) => ({
        id: n.id,
        verbatim: n.verbatim,
        interpretation: n.interpretation,
        severity: n.severity as SignalSeverity | null,
        frequency: n.frequency as SignalFrequency | null,
        distance: n.distance,
        similarity: n.similarity,
      })),
    ];

    // Mark all signals as processed
    clusterSignals.forEach((s) => processedIds.add(s.id));

    // Generate theme for cluster
    const theme = await generateClusterTheme(clusterSignals);

    // Aggregate severity and frequency
    const severity = aggregateSeverity(clusterSignals);
    const frequency = aggregateFrequency(clusterSignals);

    // Calculate confidence (average similarity of neighbors)
    const avgSimilarity =
      closeNeighbors.reduce((sum, n) => sum + n.similarity, 0) /
      closeNeighbors.length;

    clusters.push({
      id: nanoid(),
      signals: clusterSignals,
      theme,
      severity,
      frequency,
      suggestedAction: determineSuggestedAction(clusterSignals.length, severity),
      confidence: avgSimilarity,
      signalCount: clusterSignals.length,
    });
  }

  // Sort by signal count (largest clusters first)
  return clusters.sort((a, b) => b.signalCount - a.signalCount);
}

/**
 * Generate a theme summary for a cluster of signals.
 */
export async function generateClusterTheme(
  signals: ClusterSignal[]
): Promise<string> {
  try {
    const anthropic = new Anthropic();

    const verbatims = signals
      .slice(0, 5) // Use first 5 for context
      .map((s, i) => `${i + 1}. "${s.verbatim.slice(0, 200)}"`)
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      system:
        "Generate a short (5-10 word) theme that summarizes what these user feedback signals have in common. Return ONLY the theme, no explanation.",
      messages: [
        {
          role: "user",
          content: `Signals:\n${verbatims}\n\nTheme:`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text.trim();
    }

    return "Related user feedback";
  } catch (error) {
    console.error("Failed to generate cluster theme:", error);
    return "Related user feedback";
  }
}

/**
 * Aggregate severity from cluster signals (take highest)
 */
function aggregateSeverity(signals: ClusterSignal[]): SignalSeverity {
  const severityOrder: SignalSeverity[] = ["critical", "high", "medium", "low"];

  for (const severity of severityOrder) {
    if (signals.some((s) => s.severity === severity)) {
      return severity;
    }
  }

  return "medium";
}

/**
 * Aggregate frequency from cluster signals (take highest)
 */
function aggregateFrequency(signals: ClusterSignal[]): SignalFrequency {
  const frequencyOrder: SignalFrequency[] = ["common", "occasional", "rare"];

  for (const frequency of frequencyOrder) {
    if (signals.some((s) => s.frequency === frequency)) {
      return frequency;
    }
  }

  return "occasional";
}

/**
 * Determine suggested action based on cluster characteristics
 */
function determineSuggestedAction(
  signalCount: number,
  severity: SignalSeverity
): "new_project" | "link_to_existing" | "review" {
  // Large clusters with high severity = new project
  if (signalCount >= 5 && (severity === "critical" || severity === "high")) {
    return "new_project";
  }

  // Medium clusters = review for potential project
  if (signalCount >= 3) {
    return "new_project";
  }

  // Small clusters = review
  return "review";
}
