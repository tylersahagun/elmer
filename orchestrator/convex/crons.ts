/**
 * Convex Cron Jobs
 *
 * Replaces all Vercel cron routes (now stubbed in api/cron/).
 * Once this file is deployed, the Vercel cron endpoints can be deleted.
 *
 * Schedule reference:
 *   crons.interval(name, { minutes }, fn)  — every N minutes
 *   crons.daily(name, { hourUTC, minuteUTC }, fn)  — once per day
 *   crons.weekly(name, { dayOfWeek, hourUTC, minuteUTC }, fn)
 *
 * Phase 1 (current): signal automation + maintenance stubs
 * Phase 6: orchestrator health checks, scheduled agent runs
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ── Signal automation — hourly ────────────────────────────────────────────────
// Auto-processes pending signals: classification, TL;DR, impact scoring.
// Full implementation lands in Phase 4 (GTM-50).
crons.interval(
  "signal-automation",
  { minutes: 60 },
  internal.cron.runSignalAutomation,
);

// ── Signal maintenance — daily at midnight UTC ────────────────────────────────
// Orphan detection, duplicate detection, auto-archival.
// Full implementation lands in Phase 4 (GTM-52).
crons.daily(
  "signal-maintenance",
  { hourUTC: 0, minuteUTC: 0 },
  internal.cron.runSignalMaintenance,
);

// ── Orchestrator health check — every 2 hours ────────────────────────────────
// Checks each active project across 8 health dimensions.
// Proposes next agent actions. Full implementation in Phase 6 (GTM-55).
crons.interval(
  "orchestrator",
  { minutes: 120 },
  internal.cron.runOrchestrator,
);

export default crons;
