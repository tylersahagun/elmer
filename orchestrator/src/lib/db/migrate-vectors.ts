/**
 * Vector Migration Script
 *
 * Migrates existing Base64-encoded embeddings in signals.embedding
 * to native pgvector format in signals.embedding_vector.
 *
 * Run with: npx tsx src/lib/db/migrate-vectors.ts
 *
 * Prerequisites:
 * - Run database migration first: npx drizzle-kit migrate
 * - Ensure pgvector extension is enabled
 */

import { db } from "./index";
import { signals } from "./schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";
import { base64ToEmbedding } from "@/lib/ai/embeddings";

const BATCH_SIZE = 100;

async function migrateSignalVectors() {
  console.log("Starting signal vector migration...");
  console.log(`Batch size: ${BATCH_SIZE}`);

  let migrated = 0;
  let failed = 0;
  let skipped = 0;
  let hasMore = true;

  while (hasMore) {
    // Find signals with Base64 embedding but no native vector
    const batch = await db
      .select({
        id: signals.id,
        embedding: signals.embedding,
      })
      .from(signals)
      .where(
        and(
          isNotNull(signals.embedding),
          isNull(signals.embeddingVector)
        )
      )
      .limit(BATCH_SIZE);

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Processing batch of ${batch.length} signals...`);

    for (const signal of batch) {
      try {
        if (!signal.embedding) {
          skipped++;
          continue;
        }

        // Convert Base64 to number array
        const vector = base64ToEmbedding(signal.embedding);

        // Validate vector dimensions
        if (vector.length !== 1536) {
          console.warn(`Signal ${signal.id}: Invalid vector dimension ${vector.length}, expected 1536`);
          failed++;
          continue;
        }

        // Validate vector values (check for NaN or Infinity)
        const hasInvalidValues = vector.some((v) => !Number.isFinite(v));
        if (hasInvalidValues) {
          console.warn(`Signal ${signal.id}: Vector contains invalid values (NaN or Infinity)`);
          failed++;
          continue;
        }

        // Update with native vector
        await db
          .update(signals)
          .set({ embeddingVector: vector })
          .where(eq(signals.id, signal.id));

        migrated++;
      } catch (error) {
        console.error(`Failed to migrate signal ${signal.id}:`, error);
        failed++;
      }
    }

    console.log(`Progress: ${migrated} migrated, ${failed} failed, ${skipped} skipped`);
  }

  console.log("\n========================================");
  console.log("Migration complete!");
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log("========================================\n");

  if (failed > 0) {
    console.log("Some signals failed to migrate. Check logs above for details.");
    console.log("Failed signals will retain their Base64 embeddings.");
  }
}

// Run if called directly
migrateSignalVectors()
  .then(() => {
    console.log("Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
