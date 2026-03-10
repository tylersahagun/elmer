/**
 * Signal Processor Module
 *
 * Orchestrates AI extraction and embedding generation for signals.
 * Uses queue-first pattern - called from after() blocks in signal creation endpoints.
 *
 * Key patterns:
 * - Idempotency via processedAt check
 * - Optimistic processedAt setting before processing
 * - Reset processedAt on failure (allows retry)
 * - Never throw in after() context - log errors for debugging
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  extractSignalFields,
  generateEmbedding,
} from "@/lib/ai";
import { classifySignal } from "@/lib/classification";
import { checkSignalAutomationForNewSignal } from "@/lib/automation/signal-automation";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

/**
 * Process a single signal: extract fields and generate embedding.
 *
 * @param signalId - Convex ID of the signal to process
 * @returns void - results are stored in Convex
 *
 * Idempotency: Returns early if signal.processedAt is already set.
 * Error handling: Resets processedAt to null on failure to allow retry.
 */
export async function processSignalExtraction(signalId: string): Promise<void> {
  const client = getConvexClient();

  const signal = await client.query(api.signals.get, {
    signalId: signalId as Id<"signals">,
  });

  if (!signal) {
    console.warn(`Signal ${signalId} not found for processing`);
    return;
  }

  // Idempotency check - already processed
  if (signal.processedAt) {
    console.info(`Signal ${signalId} already processed at ${signal.processedAt}`);
    return;
  }

  // Set processedAt optimistically BEFORE processing (prevents duplicate processing)
  await client.mutation(api.signals.update, {
    signalId: signalId as Id<"signals">,
    processedAt: Date.now(),
  });

  try {
    // Extract structured fields using Claude
    const extraction = await extractSignalFields(signal.verbatim as string);

    // Generate embedding using OpenAI
    const embeddingVector = await generateEmbedding(signal.verbatim as string);

    // Update signal with extracted fields + processedAt
    // Convert null values to undefined for Convex mutation compatibility
    await client.mutation(api.signals.update, {
      signalId: signalId as Id<"signals">,
      severity: extraction.severity ?? undefined,
      frequency: extraction.frequency ?? undefined,
      userSegment: extraction.userSegment ?? undefined,
      interpretation:
        (signal.interpretation as string | undefined) ||
        extraction.interpretation ||
        undefined,
      processedAt: Date.now(),
    });

    // Store embedding separately
    if (embeddingVector && embeddingVector.length > 0) {
      await client.mutation(api.signals.storeEmbedding, {
        signalId: signalId as Id<"signals">,
        embeddingVector,
      });
    }

    console.info(`Signal ${signalId} processed successfully`);

    // Classify signal if embedding was generated
    if (embeddingVector && embeddingVector.length === 1536) {
      try {
        const updatedSignal = await client.query(api.signals.get, {
          signalId: signalId as Id<"signals">,
        });
        if (updatedSignal) {
          await classifySignal(
            signalId,
            embeddingVector,
            signal.verbatim as string,
            updatedSignal.workspaceId as string
          );
          console.info(`Signal ${signalId} classified`);
        }
      } catch (classifyError) {
        console.error(`Classification failed for signal ${signalId}:`, classifyError);
      }
    }

    // Check if automation thresholds are now met
    try {
      const signalForAutomation = await client.query(api.signals.get, {
        signalId: signalId as Id<"signals">,
      });
      if (signalForAutomation) {
        await checkSignalAutomationForNewSignal(
          signalForAutomation.workspaceId as string,
          signalId
        );
      }
    } catch (autoError) {
      console.error(`Automation check failed for signal ${signalId}:`, autoError);
    }
  } catch (error) {
    // Reset processedAt to allow retry
    await client.mutation(api.signals.update, {
      signalId: signalId as Id<"signals">,
      processedAt: null,
    });

    console.error(`Failed to process signal ${signalId}:`, error);
    throw error;
  }
}

/**
 * Batch process multiple signals.
 * Processes in batches of 10 with 100ms delay between batches.
 *
 * @param signalIds - Array of signal IDs to process
 * @returns { processed: number, failed: number }
 */
export async function batchProcessSignals(
  signalIds: string[]
): Promise<{ processed: number; failed: number }> {
  const BATCH_SIZE = 10;
  const BATCH_DELAY_MS = 100;

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < signalIds.length; i += BATCH_SIZE) {
    const batch = signalIds.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((id) => processSignalExtraction(id))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        processed++;
      } else {
        failed++;
      }
    }

    if (i + BATCH_SIZE < signalIds.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.info(
    `Batch processing complete: ${processed} processed, ${failed} failed`
  );

  return { processed, failed };
}
