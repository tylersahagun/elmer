import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, updateWorkspace } from "@/lib/db/queries";
import { getResolvedPaths } from "@/lib/knowledgebase/sync";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update workspace:", errorMessage, error);
    return NextResponse.json(
      { error: `Failed to update workspace: ${errorMessage}` },
      { status: 500 }
    );
  }
}
