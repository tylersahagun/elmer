/**
 * GET /api/cron/signal-automation — MIGRATED TO CONVEX
 *
 * Signal automation (auto-processing, classification, linking) will be
 * re-implemented as a Convex scheduled function in Phase 1 (GTM-43):
 *
 *   crons.hourly("signal-automation", { minuteUTC: 0 }, internal.signals.runAutomation)
 *
 * This stub exists so any existing Vercel cron config pointing here doesn't error.
 * Remove this file and the vercel.json cron entry once convex/crons.ts is live.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    message: "Signal automation migrated to Convex cron (Phase 1, GTM-43). No-op until convex/crons.ts is deployed.",
  });
}
