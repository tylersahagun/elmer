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

import { getSignal, updateSignalProcessing } from "@/lib/db/queries";
import {
  extractSignalFields,
  generateEmbedding,
  embeddingToBase64,
} from "@/lib/ai";
import { classifySignal } from "@/lib/classification";

/**
 * Process a single signal: extract fields and generate embedding.
 *
 * @param signalId - ID of the signal to process
 * @returns void - results are stored in database
 *
 * Idempotency: Returns early if signal.processedAt is already set.
 * Error handling: Resets processedAt to null on failure to allow retry.
 */
export async function processSignalExtraction(signalId: string): Promise<void> {
  // Fetch signal
  const signal = await getSignal(signalId);

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
  await updateSignalProcessing(signalId, {
    processedAt: new Date(),
  });

  try {
    // Extract structured fields using Claude
    const extraction = await extractSignalFields(signal.verbatim);

    // Generate embedding using OpenAI
    const embeddingVector = await generateEmbedding(signal.verbatim);
    const embeddingBase64 = embeddingToBase64(embeddingVector);

    // Update signal with all processed data
    await updateSignalProcessing(signalId, {
      severity: extraction.severity,
      frequency: extraction.frequency,
      userSegment: extraction.userSegment,
      // Only set interpretation if not already provided by user
      interpretation: signal.interpretation || extraction.interpretation,
      embedding: embeddingBase64,
      processedAt: new Date(), // Update to actual completion time
    });

    console.info(`Signal ${signalId} processed successfully`);

    // Classify signal if embedding was generated
    if (embeddingVector && embeddingVector.length === 1536) {
      try {
        // Get the signal's workspace for classification context
        const updatedSignal = await getSignal(signalId);
        if (updatedSignal) {
          await classifySignal(
            signalId,
            embeddingVector,
            signal.verbatim,
            updatedSignal.workspaceId
          );
          console.info(`Signal ${signalId} classified`);
        }
      } catch (classifyError) {
        // Classification failure should not fail the overall processing
        console.error(`Classification failed for signal ${signalId}:`, classifyError);
      }
    }
  } catch (error) {
    // Reset processedAt to allow retry
    await updateSignalProcessing(signalId, {
      processedAt: null,
    });

    // Log error but don't throw (we're in after() context)
    console.error(`Failed to process signal ${signalId}:`, error);
    throw error; // Re-throw so caller can handle if needed
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

  // Process in batches
  for (let i = 0; i < signalIds.length; i += BATCH_SIZE) {
    const batch = signalIds.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map((id) => processSignalExtraction(id))
    );

    // Count results
    for (const result of results) {
      if (result.status === "fulfilled") {
        processed++;
      } else {
        failed++;
        // Error already logged in processSignalExtraction
      }
    }

    // Delay between batches (except for last batch)
    if (i + BATCH_SIZE < signalIds.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.info(
    `Batch processing complete: ${processed} processed, ${failed} failed`
  );

  return { processed, failed };
}
