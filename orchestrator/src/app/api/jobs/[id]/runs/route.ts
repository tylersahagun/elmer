/**
 * GET /api/jobs/[id]/runs - Get stage runs for a job
 * Migrated to Convex (replaces Drizzle jobRuns table).
 *
 * Stage runs are managed by the execution worker agent.
 * This endpoint returns an empty array as a stub until stageRuns
 * are queried via the execution worker's Convex integration.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params;
  return NextResponse.json([]);
}
