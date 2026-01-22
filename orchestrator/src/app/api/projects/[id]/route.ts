import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProjectStage, updateProjectStatus, deleteProject } from "@/lib/db/queries";
import { validateStageTransition } from "@/lib/rules/engine";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import type { ProjectStage, ProjectStatus } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
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
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Require member access to update project
    await requireWorkspaceAccess(project.workspaceId, "member");

    const body = await request.json();
    const { stage, status, triggeredBy } = body;

    // Handle stage update
    if (stage) {
      const validation = await validateStageTransition(id, stage as ProjectStage);
      if (!validation.allowed) {
        return NextResponse.json(
          { error: validation.reason || "Stage transition blocked by rules" },
          { status: 400 }
        );
      }
      const updatedProject = await updateProjectStage(
        id,
        stage as ProjectStage,
        triggeredBy || "user"
      );
      return NextResponse.json(updatedProject);
    }

    // Handle status update
    if (status) {
      const updatedProject = await updateProjectStatus(
        id,
        status as ProjectStatus
      );
      return NextResponse.json(updatedProject);
    }

    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
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
      { status: 500 }
    );
  }
}
