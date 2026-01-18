#!/usr/bin/env npx tsx
/**
 * Standalone Worker Entry Point
 * 
 * Run with: npm run worker
 * 
 * This script starts the background job worker as a standalone process.
 * It polls for pending jobs and executes them using the AgentExecutor.
 */

import "dotenv/config";
import { startWorker, stopWorker } from "./lib/agent";

const WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID;

console.log("🚀 Starting PM Orchestrator Worker...");
console.log(`   Workspace: ${WORKSPACE_ID || "all workspaces"}`);
console.log(`   Poll interval: 2000ms`);
console.log(`   Rate limit: 50 requests/min, 80K tokens/min`);
console.log("");

// Start the worker
const worker = startWorker(WORKSPACE_ID, {
  pollIntervalMs: 2000,
  rateLimit: {
    requestsPerMinute: 50,
    tokensPerMinute: 80000,
  },
  timeoutMs: 30 * 60 * 1000,
});

// Log status periodically
const statusInterval = setInterval(() => {
  const status = worker.getStatus();
  if (status.activeJobs > 0 || status.processedCount > 0 || status.failedCount > 0) {
    console.log(
      `📊 Active: ${status.activeJobs} | Processed: ${status.processedCount} | Failed: ${status.failedCount} | ` +
      `Rate limit: ${status.rateLimitRemaining.requests} reqs, ${status.rateLimitRemaining.tokens} tokens`
    );
  }
}, 10000);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down worker...");
  clearInterval(statusInterval);
  await stopWorker();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down worker...");
  clearInterval(statusInterval);
  await stopWorker();
  process.exit(0);
});

// Keep process alive
process.stdin.resume();
