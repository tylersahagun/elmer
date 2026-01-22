import { NextRequest, NextResponse } from "next/server";
import { getProject, getSignalsForProject } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/signals
 * List all signals linked to a project with pagination
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get project to verify it exists and get workspaceId
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify membership (viewer can read)
    await requireWorkspaceAccess(project.workspaceId, "viewer");

    // Get signals for project
    const signals = await getSignalsForProject(projectId, { limit, offset });

    return NextResponse.json({ signals });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get project signals:", error);
    return NextResponse.json(
      { error: "Failed to get project signals" },
      { status: 500 }
    );
  }
}
