/**
 * GET /api/workspaces/[id]/import/status
 *
 * Check the status of a recent import by verifying what data exists in the workspace.
 * This endpoint is useful for recovering from network timeouts during import.
 *
 * Response:
 * {
 *   hasData: boolean,          // Whether the workspace has any projects
 *   projectCount: number,      // Total number of projects
 *   recentlyCreated: number,   // Projects created in last 5 minutes
 *   agentCount: number,        // Total agent definitions
 *   knowledgeCount: number,    // Total knowledge sources
 *   lastProjectCreatedAt: string | null  // ISO timestamp of most recent project
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  projects,
  agentDefinitions,
  agentKnowledgeSources,
} from "@/lib/db/schema";
import { eq, and, gte, count, max } from "drizzle-orm";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: workspaceId } = await params;

    // Require read access to check status
    await requireWorkspaceAccess(workspaceId, "read");

    // Get project counts
    const [projectStats] = await db
      .select({
        total: count(),
        lastCreatedAt: max(projects.createdAt),
      })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));

    // Count projects created in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [recentProjects] = await db
      .select({ count: count() })
      .from(projects)
      .where(
        and(
          eq(projects.workspaceId, workspaceId),
          gte(projects.createdAt, fiveMinutesAgo),
        ),
      );

    // Get agent definition count
    const [agentStats] = await db
      .select({ count: count() })
      .from(agentDefinitions)
      .where(eq(agentDefinitions.workspaceId, workspaceId));

    // Get knowledge source count
    const [knowledgeStats] = await db
      .select({ count: count() })
      .from(agentKnowledgeSources)
      .where(eq(agentKnowledgeSources.workspaceId, workspaceId));

    return NextResponse.json({
      hasData: (projectStats?.total ?? 0) > 0,
      projectCount: projectStats?.total ?? 0,
      recentlyCreated: recentProjects?.count ?? 0,
      agentCount: agentStats?.count ?? 0,
      knowledgeCount: knowledgeStats?.count ?? 0,
      lastProjectCreatedAt: projectStats?.lastCreatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Import status check failed:", message);

    return NextResponse.json(
      { error: `Failed to check import status: ${message}` },
      { status: 500 },
    );
  }
}
