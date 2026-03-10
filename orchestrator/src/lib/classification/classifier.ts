/**
 * Signal Classification Module
 *
 * Two-tier hybrid classification:
 * - Tier 1: Embedding similarity (fast, free)
 * - Tier 2: LLM verification (for ambiguous 0.5-0.75 range)
 *
 * Thresholds:
 * - > 0.75: High confidence, auto-classify to project
 * - 0.5-0.75: Medium confidence, verify with LLM
 * - < 0.5: Low confidence, classify as "new initiative"
 */

import Anthropic from "@anthropic-ai/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { generateEmbedding } from "@/lib/ai/embeddings";
import {
  findBestProjectMatchConvex,
} from "@/lib/signals/similarity";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

// Classification thresholds
const HIGH_CONFIDENCE_THRESHOLD = 0.75;
const LOW_CONFIDENCE_THRESHOLD = 0.5;

export interface SignalClassificationResult {
  projectId?: string;
  projectName?: string;
  confidence: number;
  method: "embedding" | "llm";
  isNewInitiative: boolean;
  reason: string;
  classifiedAt: string;
}

/**
 * Classify a signal to determine if it belongs to an existing project
 * or represents a new initiative.
 *
 * @param signalId - Convex ID of the signal to classify
 * @param signalVector - The signal's embedding vector
 * @param signalVerbatim - The signal's verbatim text (for LLM tier)
 * @param workspaceId - The workspace to search for projects
 * @returns Classification result
 */
export async function classifySignal(
  signalId: string,
  signalVector: number[],
  signalVerbatim: string,
  workspaceId: string
): Promise<SignalClassificationResult> {
  const bestMatch = await findBestProjectMatchConvex(workspaceId, signalVector);

  const now = new Date().toISOString();

  if (!bestMatch) {
    const result: SignalClassificationResult = {
      confidence: 0.9,
      method: "embedding",
      isNewInitiative: true,
      reason: "No projects with embeddings found in workspace",
      classifiedAt: now,
    };

    await updateSignalClassification(signalId, result);
    return result;
  }

  if (bestMatch.similarity > HIGH_CONFIDENCE_THRESHOLD) {
    const result: SignalClassificationResult = {
      projectId: bestMatch.id,
      projectName: bestMatch.name,
      confidence: bestMatch.similarity,
      method: "embedding",
      isNewInitiative: false,
      reason: `High similarity (${(bestMatch.similarity * 100).toFixed(1)}%) to project "${bestMatch.name}"`,
      classifiedAt: now,
    };

    await updateSignalClassification(signalId, result);
    return result;
  }

  if (bestMatch.similarity < LOW_CONFIDENCE_THRESHOLD) {
    const result: SignalClassificationResult = {
      confidence: 1 - bestMatch.similarity,
      method: "embedding",
      isNewInitiative: true,
      reason: `Low similarity (${(bestMatch.similarity * 100).toFixed(1)}%) to any existing project`,
      classifiedAt: now,
    };

    await updateSignalClassification(signalId, result);
    return result;
  }

  // Medium confidence (0.5-0.75) - use LLM verification
  console.log(
    `Signal ${signalId}: Medium confidence (${(bestMatch.similarity * 100).toFixed(1)}%), using LLM verification`
  );

  return llmClassify(signalId, signalVerbatim, bestMatch, now);
}

/**
 * Update signal classification in Convex.
 */
async function updateSignalClassification(
  signalId: string,
  classification: SignalClassificationResult,
): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.signals.update, {
    signalId: signalId as Id<"signals">,
    classification,
  });
}

/**
 * LLM-based classification for ambiguous signals.
 */
async function llmClassify(
  signalId: string,
  signalVerbatim: string,
  bestMatch: {
    id: string;
    name: string;
    description: string | null;
    similarity: number;
  },
  classifiedAt: string
): Promise<SignalClassificationResult> {
  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: `You are a product manager assistant. Determine if user feedback belongs to an existing project.

Return ONLY valid JSON with these fields:
- belongs: boolean (true if feedback relates to the project)
- confidence: number 0-1 (how confident are you)
- reason: string (brief explanation)`,
      messages: [
        {
          role: "user",
          content: `Does this user feedback relate to the project "${bestMatch.name}"?

Project description: ${(bestMatch as { description?: string | null }).description || "No description"}

User feedback:
"${signalVerbatim.slice(0, 500)}"

Return JSON only.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const parsed = JSON.parse(content.text) as {
      belongs: boolean;
      confidence: number;
      reason: string;
    };

    const result: SignalClassificationResult = {
      projectId: parsed.belongs ? bestMatch.id : undefined,
      projectName: parsed.belongs ? bestMatch.name : undefined,
      confidence: parsed.confidence,
      method: "llm",
      isNewInitiative: !parsed.belongs,
      reason: parsed.reason,
      classifiedAt,
    };

    await updateSignalClassification(signalId, result);
    return result;
  } catch (error) {
    console.error("LLM classification failed:", error);

    const result: SignalClassificationResult = {
      projectId: bestMatch.similarity > 0.6 ? bestMatch.id : undefined,
      projectName: bestMatch.similarity > 0.6 ? bestMatch.name : undefined,
      confidence: bestMatch.similarity,
      method: "embedding",
      isNewInitiative: bestMatch.similarity <= 0.6,
      reason: `LLM verification failed, using embedding similarity (${(bestMatch.similarity * 100).toFixed(1)}%)`,
      classifiedAt,
    };

    await updateSignalClassification(signalId, result);
    return result;
  }
}

/**
 * Generate and store embedding for a project.
 * Uses project name + description as input text.
 *
 * @param projectId - Convex ID of the project to generate embedding for
 * @returns The project id, or null if generation failed
 */
export async function generateProjectEmbedding(projectId: string) {
  const client = getConvexClient();

  const project = await client.query(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });

  if (!project) {
    console.warn(`Project ${projectId} not found for embedding generation`);
    return null;
  }

  const text = [
    (project as { name: string }).name,
    (project as { description?: string | null }).description,
  ]
    .filter(Boolean)
    .join(". ");

  if (text.trim().length < 5) {
    console.warn(`Project ${projectId} has insufficient text for embedding`);
    return null;
  }

  try {
    const embedding = await generateEmbedding(text);
    await client.mutation(api.projects.storeEmbedding, {
      projectId: projectId as Id<"projects">,
      embeddingVector: embedding,
    });

    console.log(`Generated embedding for project ${projectId}`);
    return project;
  } catch (error) {
    console.error(`Failed to generate embedding for project ${projectId}:`, error);
    return null;
  }
}
