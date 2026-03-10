import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { buildFeatureBranchName } from "@/lib/git/branches";
import {
  createConvexProject,
  getConvexWorkspace,
  listConvexProjects,
} from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logProjectCreated } from "@/lib/activity";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type ConvexProjectRow = {
  _id: string;
  _creationTime: number;
  workspaceId: string;
  name: string;
  description?: string | null;
  stage?: string;
  status?: string | null;
  priority?: string | number | null;
  metadata?: Record<string, unknown> | null;
};

function normalizePriority(priority?: string | number | null): number {
  if (typeof priority === "number" && Number.isFinite(priority)) return priority;

  switch (priority) {
    case "P0":
      return 0;
    case "P1":
      return 1;
    case "P3":
      return 3;
    case "P2":
    default:
      return 2;
  }
}

function buildProjectListResponse(convexProjects: ConvexProjectRow[]) {
  return convexProjects.map((project) => ({
    id: project._id,
    workspaceId: project.workspaceId,
    name: project.name,
    description: project.description ?? null,
    stage: project.stage ?? "inbox",
    status: project.status ?? "active",
    priority: normalizePriority(project.priority),
    createdAt: new Date(project._creationTime).toISOString(),
    updatedAt: new Date(project._creationTime).toISOString(),
    metadata: project.metadata ?? {},
    documentCount: 0,
    prototypeCount: 0,
    signalCount: 0,
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const convexProjects = (await listConvexProjects(workspaceId)) as ConvexProjectRow[];

    return NextResponse.json(buildProjectListResponse(convexProjects));
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

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const membership = await requireWorkspaceAccess(workspaceId, "member");

    const workspace = (await getConvexWorkspace(workspaceId)) as {
      _id: string;
      githubRepo?: string | null;
      settings?: {
        baseBranch?: string;
        autoCreateFeatureBranch?: boolean;
      } | null;
    } | null;
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const baseBranch = workspace.settings?.baseBranch || "main";
    const preferredBranch = buildFeatureBranchName(name);

    const created = (await createConvexProject({
      workspaceId,
      name,
      description,
      stage: stage || "inbox",
      priority: "P2",
      metadata: {
        gitBranch: preferredBranch,
        baseBranch,
      },
    })) as { id: string };

    if (created?.id) {
      await logProjectCreated(workspaceId, membership.userId, created.id, name);
    }

    const shouldCreateBranch = workspace.settings?.autoCreateFeatureBranch ?? true;
    if (shouldCreateBranch && workspace.githubRepo) {
      const client = getConvexClient();
      await client.mutation(api.jobs.create, {
        workspaceId: workspaceId as Id<"workspaces">,
        projectId: created?.id as Id<"projects">,
        type: "create_feature_branch",
        input: {
          preferredBranch,
          baseBranch,
        },
      });
    }

    return NextResponse.json(
      {
        id: created.id,
        workspaceId,
        name,
        description: description || null,
        stage: stage || "inbox",
        status: "active",
        priority: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          gitBranch: preferredBranch,
          baseBranch,
        },
        documentCount: 0,
        prototypeCount: 0,
        signalCount: 0,
      },
      { status: 201 }
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
