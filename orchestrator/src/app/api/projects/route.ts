import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, getWorkspace, createJob } from "@/lib/db/queries";
import { buildFeatureBranchName } from "@/lib/git/branches";

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

    const projects = await getProjects(workspaceId, { includeArchived });
    return NextResponse.json(projects);
  } catch (error) {
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

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const baseBranch = workspace.settings?.baseBranch || "main";
    const preferredBranch = buildFeatureBranchName(name);

    const project = await createProject({
      workspaceId,
      name,
      description,
      stage,
      metadata: {
        gitBranch: preferredBranch,
        baseBranch,
      },
    });

    // Only create feature branch if setting is enabled AND workspace has a GitHub repo configured
    const shouldCreateBranch = workspace.settings?.autoCreateFeatureBranch ?? true;
    if (shouldCreateBranch && workspace.githubRepo) {
      await createJob({
        workspaceId,
        projectId: project?.id,
        type: "create_feature_branch",
        input: {
          preferredBranch,
          baseBranch,
        },
      });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
