/**
 * Next.js Instrumentation Hook
 *
 * The background job worker (lib/agent/worker.ts) has been removed as part of
 * the Convex migration. Agent execution now happens as Convex Actions scheduled
 * via ctx.scheduler — no long-running server process needed.
 *
 * This file is intentionally empty. Convex handles all background work.
 */

export async function register() {
  // No-op: worker replaced by Convex Actions (Phase 1, GTM-38)
}
