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
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { listConvexKnowledge } from "@/lib/convex/server";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: workspaceId } = await params;

    // Require read access to check status
    await requireWorkspaceAccess(workspaceId, "viewer");

    const client = getConvexClient();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Fetch projects, agents, and knowledge concurrently
    const [projects, agents, knowledge] = await Promise.all([
      client.query(api.projects.list, {
        workspaceId: workspaceId as Id<"workspaces">,
      }),
      client.query(api.agentDefinitions.list, {
        workspaceId: workspaceId as Id<"workspaces">,
      }),
      listConvexKnowledge(workspaceId),
    ]);

    const typedProjects = projects as Array<{
      _id: string;
      _creationTime: number;
    }>;

    const recentlyCreated = typedProjects.filter(
      (p) => p._creationTime >= fiveMinutesAgo,
    ).length;

    const sortedByCreation = [...typedProjects].sort(
      (a, b) => b._creationTime - a._creationTime,
    );
    const lastProjectCreatedAt =
      sortedByCreation[0]
        ? new Date(sortedByCreation[0]._creationTime).toISOString()
        : null;

    return NextResponse.json({
      hasData: typedProjects.length > 0,
      projectCount: typedProjects.length,
      recentlyCreated,
      agentCount: (agents as unknown[]).length,
      knowledgeCount: (knowledge as unknown[]).length,
      lastProjectCreatedAt,
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
