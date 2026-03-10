import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";

/**
 * POST /api/admin/migrate
 *
 * Data migration endpoint. The one-time Postgres → Convex migrations
 * (assignOrphanedWorkspaces, backfillActors) have been run and their
 * scripts deleted. This endpoint now returns a completed status.
 */
export async function POST(request: NextRequest) {
  const { userId } = await clerkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "All migrations have already been run. Postgres has been fully removed.",
    migrations: {
      assignWorkspaces: { success: true, assignedCount: 28, note: "Run 2026-03-10" },
      backfillActors: { success: true, stageTransitionsUpdated: 0, activityLogsCreated: 0, note: "Run 2026-03-10" },
    },
  });
}

export async function GET(request: NextRequest) {
  const { userId } = await clerkAuth();
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return NextResponse.json({
    status: "complete",
    message: "All Postgres → Convex migrations have been run. Drizzle/Neon removed.",
    completed_on: "2026-03-10",
  });
}
