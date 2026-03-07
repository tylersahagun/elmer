/**
 * Cron handler functions — called by convex/crons.ts on schedule.
 *
 * Stubs return early with a log entry. Full implementations:
 *   runSignalAutomation  → Phase 4 (GTM-50)
 *   runSignalMaintenance → Phase 4 (GTM-52)
 *   runOrchestrator      → Phase 6 (GTM-55)
 */

import { internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const runSignalAutomation = internalAction({
  args: {},
  handler: async (ctx, _args) => {
    // GTM-50d: Process any unprocessed inbox items for all workspaces
    const workspaces = await ctx.runQuery(api.workspaces.list, {});
    let total = 0;
    for (const ws of workspaces) {
      if (!ws) continue;
      const result = await ctx.scheduler.runAfter(
        0,
        internal.inbox.batchProcess,
        { workspaceId: ws._id },
      );
      total++;
    }
    console.log(`[cron] signal-automation: scheduled batch processing for ${total} workspace(s)`);
  },
});

export const runSignalMaintenance = internalAction({
  args: {},
  handler: async (_ctx, _args) => {
    // Phase 4: orphan detection, duplicate detection, auto-archival
    console.log("[cron] signal-maintenance: stub — Phase 4 implementation pending");
  },
});

export const runOrchestrator = internalAction({
  args: {},
  handler: async (_ctx, _args) => {
    // Phase 6: check all active projects across 8 health dimensions,
    // propose next agent actions, schedule fully-auto actions
    console.log("[cron] orchestrator: stub — Phase 6 implementation pending");
  },
});
