import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db/queries";
import { checkGraduationCriteria } from "@/lib/graduation/criteria-service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

/**
 * GET /api/projects/[id]/graduation
 *
 * Check if a project meets graduation criteria for its current stage.
 * Returns detailed check results including which criteria passed/failed.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(project.workspaceId, "viewer");

    const result = await checkGraduationCriteria(id);

    return NextResponse.json({
      projectId: id,
      currentStage: project.stage,
      ...result,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to check graduation criteria:", error);
    return NextResponse.json(
      { error: "Failed to check graduation criteria" },
      { status: 500 },
    );
  }
}
