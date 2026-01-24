import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";
import { getResolvedPaths } from "@/lib/knowledgebase/sync";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require at least viewer access to see workspace details
    await requireWorkspaceAccess(id, "viewer");

    const workspace = await getWorkspace(id);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Calculate resolved absolute paths for UI display
    const resolvedPaths = getResolvedPaths({
      githubRepo: workspace.githubRepo,
      contextPath: workspace.contextPath,
      settings: workspace.settings,
    });

    return NextResponse.json({
      ...workspace,
      resolvedPaths,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get workspace:", error);
    return NextResponse.json(
      { error: "Failed to get workspace" },
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

    // Require admin access to update workspace settings
    await requireWorkspaceAccess(id, "admin");

    const body = await request.json();
    const { name, description, githubRepo, contextPath, settings } = body;

    const updated = await updateWorkspace(id, {
      name,
      description,
      githubRepo,
      contextPath,
      settings,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update workspace:", errorMessage, error);
    return NextResponse.json(
      { error: `Failed to update workspace: ${errorMessage}` },
      { status: 500 }
    );
  }
}
