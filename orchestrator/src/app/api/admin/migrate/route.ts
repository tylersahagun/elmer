import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { assignOrphanedWorkspaces } from "@/lib/migrations/assign-workspaces";
import { backfillActors } from "@/lib/migrations/backfill-actors";

/**
 * POST /api/admin/migrate
 * 
 * Runs data migration to:
 * 1. Assign orphaned workspaces to first user
 * 2. Backfill actor attribution in stage transitions
 * 
 * Requires authentication. In production, this should be admin-only.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Run workspace assignment migration
    const workspaceResult = await assignOrphanedWorkspaces();

    // Run actor backfill migration
    const backfillResult = await backfillActors();

    const overallSuccess = workspaceResult.success && backfillResult.success;

    const result = {
      success: overallSuccess,
      migrations: {
        assignWorkspaces: workspaceResult,
        backfillActors: backfillResult,
      },
      summary: {
        workspacesAssigned: workspaceResult.assignedCount,
        targetUser: workspaceResult.targetUser?.email || null,
        stageTransitionsUpdated: backfillResult.stageTransitionsUpdated,
        activityLogsCreated: backfillResult.activityLogsCreated,
      },
    };

    if (!overallSuccess) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/migrate
 * 
 * Returns migration status/info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      available_migrations: [
        {
          name: "assignOrphanedWorkspaces",
          description: "Assigns workspaces without members to the first user",
          idempotent: true,
          status: "ready",
        },
        {
          name: "backfillActors",
          description: "Backfills actor attribution in stage transitions and creates activity logs for existing projects",
          idempotent: true,
          status: "ready",
        },
      ],
      usage: "POST /api/admin/migrate to run all migrations",
      note: "All migrations are idempotent and safe to run multiple times",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get migration status" },
      { status: 500 }
    );
  }
}
