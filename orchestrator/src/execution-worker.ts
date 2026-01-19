#!/usr/bin/env npx tsx
/**
 * Execution Worker Entry Point
 * 
 * Run with: npm run execution-worker
 * 
 * This script starts the new durable execution worker that:
 * - Polls for queued runs
 * - Executes stage automation
 * - Streams logs in real-time
 * - Creates artifacts
 * - Never leaves cards stuck in "waiting" state
 */

import "dotenv/config";
import { startWorker, stopWorker, getWorker } from "./lib/execution";

const WORKER_ID = process.env.WORKER_ID || undefined;
const WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID || undefined;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "5000", 10);
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || "1", 10);

console.log("🚀 Starting PM Orchestrator Execution Worker...");
console.log(`   Worker ID: ${WORKER_ID || "auto-generated"}`);
console.log(`   Workspace: ${WORKSPACE_ID || "all workspaces"}`);
console.log(`   Poll interval: ${POLL_INTERVAL}ms`);
console.log(`   Max concurrent: ${MAX_CONCURRENT}`);
console.log("");

// Start the worker
async function main() {
  try {
    await startWorker({
      workerId: WORKER_ID,
      workspaceId: WORKSPACE_ID,
      pollIntervalMs: POLL_INTERVAL,
      maxConcurrent: MAX_CONCURRENT,
      heartbeatIntervalMs: 15000,
      rescueIntervalMs: 60000,
    });

    console.log("✅ Worker started successfully");
    console.log("   Press Ctrl+C to stop");
    console.log("");

    // Log status periodically
    setInterval(() => {
      const worker = getWorker();
      if (worker) {
        console.log(`💓 Worker heartbeat - running`);
      }
    }, 30000);

  } catch (error) {
    console.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down...");
  await stopWorker();
  console.log("✅ Worker stopped");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down...");
  await stopWorker();
  console.log("✅ Worker stopped");
  process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", async (error) => {
  console.error("❌ Uncaught exception:", error);
  await stopWorker();
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  console.error("❌ Unhandled rejection:", reason);
  await stopWorker();
  process.exit(1);
});

// Start
main();

// Keep process alive
process.stdin.resume();
