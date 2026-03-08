import { NextRequest, NextResponse } from "next/server";
import { getProjectsWithCounts } from "@/lib/db/queries";
import { buildFeatureBranchName } from "@/lib/git/branches";
import {
  createConvexProject,
  createConvexWorkspaceActivity,
  getConvexWorkspace,
} from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const includeArchived = searchParams.get("includeArchived") === "true";

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Require viewer access to list projects
    await requireWorkspaceAccess(workspaceId, "viewer");

    const projects = await getProjectsWithCounts(workspaceId, { includeArchived });
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get projects:", error);
    return NextResponse.json(
      { error: "Failed to get projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, stage } = body;
    const sanitizedName = typeof name === "string" ? name.trim() : "";
    const sanitizedDescription =
      typeof description === "string" && description.trim().length > 0
        ? description.trim()
        : undefined;
    const sanitizedStage =
      typeof stage === "string" && stage.trim().length > 0 ? stage : undefined;

    if (typeof workspaceId !== "string" || sanitizedName.length === 0) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    // Require member access to create projects
    const membership = await requireWorkspaceAccess(workspaceId, "member");

    const workspace = await getConvexWorkspace(workspaceId) as {
      _id: string;
      settings?: Record<string, unknown>;
    } | null;
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const baseBranch =
      typeof workspace.settings?.baseBranch === "string"
        ? workspace.settings.baseBranch
        : "main";
    const preferredBranch = buildFeatureBranchName(sanitizedName);
    const createdAt = new Date().toISOString();
    const created = await createConvexProject({
      workspaceId,
      name: sanitizedName,
      description: sanitizedDescription,
      stage: sanitizedStage,
      priority: "P2",
      metadata: {
        gitBranch: preferredBranch,
        baseBranch,
      },
    });
    const projectId =
      (created as { id?: string } | null)?.id ??
      (typeof created === "string" ? created : null);

    if (!projectId) {
      throw new Error("Convex project creation did not return an id");
    }

    void createConvexWorkspaceActivity({
      workspaceId,
      userId: membership.userId,
      action: "project_created",
      targetType: "project",
      targetId: projectId,
      metadata: {
        name: sanitizedName,
        stage: sanitizedStage || "inbox",
        source: "api.projects.create",
      },
    }).catch((error) => {
      console.warn("Failed to log project creation activity:", error);
    });

    // The shell must stay trustworthy even if downstream automation is unavailable.
    return NextResponse.json(
      {
        id: projectId,
        workspaceId,
        name: sanitizedName,
        description: sanitizedDescription,
        stage: sanitizedStage || "inbox",
        status: "active",
        priority: 2,
        createdAt,
        updatedAt: createdAt,
        metadata: {
          gitBranch: preferredBranch,
          baseBranch,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
