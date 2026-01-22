import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { assignOrphanedWorkspaces } from "@/lib/migrations/assign-workspaces";

/**
 * POST /api/admin/migrate
 * 
 * Runs data migration to:
 * 1. Assign orphaned workspaces to first user
 * 2. (Future) Backfill actor attribution
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

    const result = {
      success: workspaceResult.success,
      migrations: {
        assignWorkspaces: workspaceResult,
      },
      summary: {
        workspacesAssigned: workspaceResult.assignedCount,
        targetUser: workspaceResult.targetUser?.email || null,
      },
    };

    if (!workspaceResult.success) {
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
        },
        {
          name: "backfillActors",
          description: "Backfills actor attribution in stage transitions",
          idempotent: true,
          status: "coming soon",
        },
      ],
      usage: "POST /api/admin/migrate to run migrations",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get migration status" },
      { status: 500 }
    );
  }
}
