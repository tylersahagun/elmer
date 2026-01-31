import { NextRequest, NextResponse, after } from "next/server";
import {
  getProject,
  updateProjectStage,
  updateProjectStatus,
  updateProjectMetadata,
  deleteProject,
} from "@/lib/db/queries";
import { validateStageTransition } from "@/lib/rules/engine";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logProjectStageChanged } from "@/lib/activity";
import { triggerColumnAutomation } from "@/lib/automation/column-automation";
import type { ProjectStage, ProjectStatus } from "@/lib/db/schema";

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

    // Require viewer access to view project
    await requireWorkspaceAccess(project.workspaceId, "viewer");

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Require member access to update project
    const membership = await requireWorkspaceAccess(
      project.workspaceId,
      "member",
    );

    const body = await request.json();
    const { stage, status, metadata, triggeredBy } = body;

    // Handle metadata update (merge with existing)
    if (metadata && typeof metadata === "object") {
      const existingMetadata =
        (project.metadata as Record<string, unknown>) || {};
      const mergedMetadata = { ...existingMetadata, ...metadata };
      const updatedProject = await updateProjectMetadata(id, mergedMetadata);
      return NextResponse.json(updatedProject);
    }

    // Handle stage update
    if (stage) {
      const validation = await validateStageTransition(
        id,
        stage as ProjectStage,
      );
      if (!validation.allowed) {
        return NextResponse.json(
          { error: validation.reason || "Stage transition blocked by rules" },
          { status: 400 },
        );
      }
      const previousStage = project.stage;
      const updatedProject = await updateProjectStage(
        id,
        stage as ProjectStage,
        triggeredBy || "user",
      );

      // Log activity for stage change
      await logProjectStageChanged(
        project.workspaceId,
        membership.userId,
        id,
        project.name,
        previousStage,
        stage as ProjectStage,
      );

      // Trigger column automation (non-blocking via after())
      after(async () => {
        try {
          const automationTriggeredBy = `user:${membership.userId}`;
          const result = await triggerColumnAutomation(
            project.workspaceId,
            id,
            stage as ProjectStage,
            automationTriggeredBy,
          );
          if (result.triggered) {
            console.log(
              `[ColumnAutomation] Triggered ${result.jobIds.length} jobs for project ${id}`,
            );
          }
        } catch (error) {
          console.error(
            "[ColumnAutomation] Error triggering automation:",
            error,
          );
        }
      });

      return NextResponse.json(updatedProject);
    }

    // Handle status update
    if (status) {
      const updatedProject = await updateProjectStatus(
        id,
        status as ProjectStatus,
      );
      return NextResponse.json(updatedProject);
    }

    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Require admin access to delete project
    await requireWorkspaceAccess(project.workspaceId, "admin");

    await deleteProject(id);
    return NextResponse.json({ id }, { status: 200 });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
