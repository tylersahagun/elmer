/**
 * Worker Control API — MIGRATED TO CONVEX
 *
 * The background job worker has been replaced by Convex Actions.
 * Agent execution is now scheduled via ctx.scheduler (Phase 1, GTM-38).
 *
 * This route returns the new worker status model so any UI components
 * polling /api/worker continue to work without errors.
 */

import { NextResponse } from "next/server";

const MIGRATED_STATUS = {
  running: true,
  engine: "convex",
  message: "Agent execution handled by Convex Actions — no local worker process needed.",
};

export async function GET() {
  return NextResponse.json(MIGRATED_STATUS);
}

export async function POST() {
  return NextResponse.json({
    success: true,
    ...MIGRATED_STATUS,
  });
}
