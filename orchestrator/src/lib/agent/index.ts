/**
 * Agent Module — legacy job worker removed.
 * The execution worker now uses Convex (see src/lib/execution/).
 * This file is a stub kept for compatibility with src/worker.ts.
 */

// Legacy worker stub — kept because src/worker.ts imports from here.
// src/worker.ts itself is the old standalone worker entry point and
// can be deleted once it is confirmed no npm scripts reference it.
export function startWorker(_workspaceId?: string, _options?: Record<string, unknown>) {
  console.warn("Legacy agent worker is a no-op. Use the Convex execution worker instead.");
  return {
    getStatus: () => ({ activeJobs: 0, processedCount: 0, failedCount: 0, rateLimitRemaining: { requests: 0, tokens: 0 } }),
  };
}

export function stopWorker(): Promise<void> {
  return Promise.resolve();
}
