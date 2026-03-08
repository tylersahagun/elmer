import { NextRequest, NextResponse } from "next/server";
import {
  deleteConvexProject,
  getConvexProjectWithDocuments,
  getConvexWorkspace,
  listConvexProjectPrototypes,
  listConvexProjectSignals,
  updateConvexProject,
} from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

type LegacyProjectStatus = "active" | "paused" | "completed" | "archived";

type ConvexProjectPayload = {
  project: {
    _id: string;
    _creationTime: number;
    workspaceId: string;
    name: string;
    description?: string | null;
    stage: string;
    status?: string | null;
    priority?: string | number | null;
    metadata?: Record<string, unknown> | null;
  } | null;
  documents: Array<{
    _id: string;
    _creationTime: number;
    type: string;
    title: string;
    content: string;
    version?: number | null;
    metadata?: Record<string, unknown> | null;
  }>;
} | null;

type ConvexWorkspace = {
  _id: string;
  settings?: Record<string, unknown> | null;
} | null;

function normalizeProjectStatus(status?: string | null): LegacyProjectStatus {
  switch (status) {
    case "paused":
    case "blocked":
    case "stale":
      return "paused";
    case "completed":
      return "completed";
    case "archived":
      return "archived";
    case "active":
    case "on_track":
    case "at_risk":
    default:
      return "active";
  }
}

function normalizePriority(priority?: string | number | null): number {
  if (typeof priority === "number" && Number.isFinite(priority)) {
    return priority;
  }

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

function serializePriority(priority?: string | number | null): string {
  if (typeof priority === "string" && /^P[0-3]$/.test(priority)) {
    return priority;
  }

  const numeric = typeof priority === "number" ? priority : normalizePriority(priority);
  return `P${Math.min(3, Math.max(0, numeric))}`;
}

async function loadProjectPayload(projectId: string) {
  return (await getConvexProjectWithDocuments(projectId)) as ConvexProjectPayload;
}

async function buildProjectResponse(projectId: string) {
  const payload = await loadProjectPayload(projectId);
  const project = payload?.project;
  if (!project) return null;

  const [workspace, prototypes, linkedSignals] = await Promise.all([
    getConvexWorkspace(project.workspaceId).catch(() => null) as Promise<ConvexWorkspace>,
    listConvexProjectPrototypes(projectId).catch(() => []) as Promise<
      Array<{
        id: string;
        name: string;
        type: string;
        status: string;
        version: number;
        storybookPath?: string;
        chromaticUrl?: string;
        chromaticStorybookUrl?: string;
      }>
    >,
    listConvexProjectSignals(projectId).catch(() => []) as Promise<
      Array<{ id: string }>
    >,
  ]);

  const createdAt = new Date(project._creationTime).toISOString();
  const updatedAt = new Date(
    Math.max(
      project._creationTime,
      ...payload.documents.map((document) => document._creationTime),
    ),
  ).toISOString();
  const settings = (workspace?.settings ?? {}) as Record<string, unknown>;
  const knowledgebaseMapping =
    (settings.knowledgebaseMapping as Record<string, string> | undefined) ?? {};
  const storybookPort =
    typeof settings.storybookPort === "number" ? settings.storybookPort : undefined;

  return {
    id: project._id,
    workspaceId: project.workspaceId,
    name: project.name,
    description: project.description ?? undefined,
    stage: project.stage,
    status: normalizeProjectStatus(project.status),
    priority: normalizePriority(project.priority),
    createdAt,
    updatedAt,
    signalCount: linkedSignals.length,
    documentCount: payload.documents.length,
    prototypeCount: prototypes.length,
    metadata: (project.metadata ?? {}) as Record<string, unknown>,
    documents: payload.documents.map((document) => ({
      id: document._id,
      type: document.type,
      title: document.title,
      content: document.content,
      version: document.version ?? 1,
      createdAt: new Date(document._creationTime).toISOString(),
      updatedAt: new Date(document._creationTime).toISOString(),
      metadata: document.metadata ?? undefined,
    })),
    prototypes,
    linkedSignals,
    tickets: [],
    stages: [
      {
        id: `current-${project._id}`,
        stage: project.stage,
        enteredAt: createdAt,
        triggeredBy: "convex-cutover",
      },
    ],
    juryEvaluations: [],
    workspace: workspace
      ? {
          id: workspace._id,
          settings: {
            storybookPort,
            knowledgebaseMapping,
            composio: settings.composio,
          },
        }
      : undefined,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const project = await buildProjectResponse(id);

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
    const payload = await loadProjectPayload(id);
    const project = payload?.project;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Require member access to update project
    await requireWorkspaceAccess(project.workspaceId, "member");

    const body = await request.json();
    const { stage, status, metadata, description, priority } = body;

    const patch: Record<string, unknown> = {};
    if (typeof stage === "string") patch.stage = stage;
    if (typeof status === "string") patch.status = status;
    if (typeof description === "string") patch.description = description;
    if (priority !== undefined) patch.priority = serializePriority(priority);
    if (metadata && typeof metadata === "object") {
      const existingMetadata =
        (project.metadata as Record<string, unknown> | null) ?? {};
      patch.metadata = { ...existingMetadata, ...metadata };
    }

    if (!Object.keys(patch).length) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 },
      );
    }

    await updateConvexProject(id, patch);
    const updatedProject = await buildProjectResponse(id);
    return NextResponse.json(updatedProject);
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = await loadProjectPayload(id);
    const project = payload?.project;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Require admin access to delete project
    await requireWorkspaceAccess(project.workspaceId, "admin");

    await deleteConvexProject(id);
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
