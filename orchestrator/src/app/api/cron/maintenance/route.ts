/**
 * GET /api/cron/maintenance — MIGRATED TO CONVEX
 *
 * Signal maintenance (orphan detection, duplicate detection, archival) will be
 * re-implemented as a Convex scheduled function in Phase 1 (GTM-43):
 *
 *   crons.daily("signal-maintenance", { hourUTC: 0, minuteUTC: 0 }, internal.signals.runMaintenance)
 *
 * This stub exists so any existing Vercel cron config pointing here doesn't error.
 * Remove this file and the vercel.json cron entry once convex/crons.ts is live.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Signal maintenance migrated to Convex cron (Phase 1, GTM-43). No-op until convex/crons.ts is deployed.",
  });
}
