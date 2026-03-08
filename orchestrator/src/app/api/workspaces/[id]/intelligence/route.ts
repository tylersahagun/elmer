import { NextResponse } from "next/server";
import {
  getConvexWorkspace,
  listConvexKnowledge,
  listConvexPersonas,
  listConvexProjects,
  listConvexWorkspaceRuntimeContext,
} from "@/lib/convex/server";
import {
  PermissionError,
  handlePermissionError,
  requireWorkspaceAccess,
} from "@/lib/permissions";

type IntelligenceNode = {
  id: string;
  label: string;
  type: "workspace" | "project" | "signal" | "knowledge" | "persona" | "memory";
  projectId?: string;
};

type IntelligenceEdge = {
  source: string;
  target: string;
  label: string;
};

type IntelligenceFeedItem = {
  id: string;
  kind: "project" | "signal" | "knowledge" | "persona" | "memory";
  title: string;
  preview: string;
  href: string;
  projectId?: string;
  projectName?: string;
};

function truncate(value: string | null | undefined, limit = 180) {
  const content = value?.trim() ?? "";
  if (!content) return "";
  return content.length > limit ? `${content.slice(0, limit - 3)}...` : content;
}

function buildGraph(params: {
  workspaceId: string;
  workspaceName: string;
  projects: Array<{ _id: string; name: string }>;
  knowledge: Array<{
    _id?: string;
    id?: string;
    title?: string;
    type?: string;
    filePath?: string;
    projectId?: string;
  }>;
  personas: Array<{
    _id?: string;
    id?: string;
    archetype_id?: string;
    name?: string;
  }>;
  runtimeItems: Array<{
    id?: string;
    title?: string;
    entityType?: string;
    projectId?: string;
  }>;
}) {
  const nodes: IntelligenceNode[] = [
    {
      id: params.workspaceId,
      label: params.workspaceName,
      type: "workspace",
    },
  ];
  const edges: IntelligenceEdge[] = [];

  for (const project of params.projects) {
    nodes.push({
      id: project._id,
      label: project.name,
      type: "project",
    });
    edges.push({
      source: params.workspaceId,
      target: project._id,
      label: "contains",
    });
  }

  for (const knowledge of params.knowledge.slice(0, 12)) {
    const id = knowledge._id ?? knowledge.id ?? `knowledge:${knowledge.title ?? "entry"}`;
    nodes.push({
      id,
      label: knowledge.title ?? knowledge.filePath ?? "Knowledge entry",
      type: "knowledge",
      projectId: knowledge.projectId,
    });
    edges.push({
      source: knowledge.projectId ?? params.workspaceId,
      target: id,
      label: knowledge.projectId ? "supports" : "informs",
    });
  }

  for (const persona of params.personas.slice(0, 12)) {
    const id = persona._id ?? persona.id ?? `persona:${persona.archetype_id ?? persona.name ?? "persona"}`;
    nodes.push({
      id,
      label: persona.name ?? persona.archetype_id ?? "Persona",
      type: "persona",
    });
    edges.push({
      source: params.workspaceId,
      target: id,
      label: "serves",
    });
  }

  for (const item of params.runtimeItems.slice(0, 18)) {
    const id = item.id ?? `runtime:${item.title ?? item.entityType ?? "item"}`;
    nodes.push({
      id,
      label: item.title ?? item.entityType ?? "Runtime context",
      type: item.entityType === "signal" ? "signal" : "memory",
      projectId: item.projectId,
    });
    edges.push({
      source: item.projectId ?? params.workspaceId,
      target: id,
      label: item.projectId ? "grounds" : "shapes",
    });
  }

  return { nodes, edges };
}

function buildFeed(params: {
  workspaceId: string;
  projects: Array<{
    _id: string;
    name: string;
    description?: string | null;
  }>;
  knowledge: Array<{
    _id?: string;
    id?: string;
    title?: string;
    content?: string;
    type?: string;
    filePath?: string;
    projectId?: string;
  }>;
  personas: Array<{
    _id?: string;
    id?: string;
    archetype_id?: string;
    name?: string;
    description?: string;
  }>;
  runtimeItems: Array<{
    id?: string;
    title?: string;
    content?: string;
    entityType?: string;
    projectId?: string;
  }>;
}) {
  const projectNameById = new Map(
    params.projects.map((project) => [project._id, project.name]),
  );

  const projectFeed: IntelligenceFeedItem[] = params.projects.map((project) => ({
    id: project._id,
    kind: "project",
    title: project.name,
    preview: truncate(project.description, 140) || "Project shell",
    href: `/projects/${project._id}`,
  }));

  const knowledgeFeed: IntelligenceFeedItem[] = params.knowledge.map((entry) => ({
    id: entry._id ?? entry.id ?? `knowledge:${entry.title ?? "entry"}`,
    kind: "knowledge",
    title: entry.title ?? entry.filePath ?? "Knowledge entry",
    preview: truncate(entry.content, 160) || "Knowledge artifact",
    href: `/workspace/${params.workspaceId}/knowledgebase`,
    projectId: entry.projectId,
    projectName: entry.projectId
      ? projectNameById.get(entry.projectId)
      : undefined,
  }));

  const personaFeed: IntelligenceFeedItem[] = params.personas.map((persona) => ({
    id: persona._id ?? persona.id ?? `persona:${persona.archetype_id ?? persona.name ?? "persona"}`,
    kind: "persona",
    title: persona.name ?? persona.archetype_id ?? "Persona",
    preview: truncate(persona.description, 160) || "Synthetic persona lens",
    href: `/workspace/${params.workspaceId}/personas`,
  }));

  const runtimeFeed: IntelligenceFeedItem[] = params.runtimeItems.map((item) => ({
    id: item.id ?? `runtime:${item.title ?? item.entityType ?? "item"}`,
    kind: item.entityType === "signal" ? "signal" : "memory",
    title: item.title ?? item.entityType ?? "Runtime context",
    preview: truncate(item.content, 160) || "Workspace runtime context",
    href: item.projectId
      ? `/projects/${item.projectId}`
      : `/workspace/${params.workspaceId}/intelligence`,
    projectId: item.projectId,
    projectName: item.projectId ? projectNameById.get(item.projectId) : undefined,
  }));

  return [...projectFeed, ...knowledgeFeed, ...personaFeed, ...runtimeFeed];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");

    const [workspace, projects, personas, knowledge, runtimeContext] =
      await Promise.all([
        getConvexWorkspace(id),
        listConvexProjects(id).catch(() => []),
        listConvexPersonas(id).catch(() => []),
        listConvexKnowledge(id).catch(() => []),
        listConvexWorkspaceRuntimeContext(id).catch(() => ({ items: [] })),
      ]);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const runtimeItems = Array.isArray(runtimeContext?.items)
      ? runtimeContext.items
      : [];
    const feed = buildFeed({
      workspaceId: id,
      projects,
      personas,
      knowledge,
      runtimeItems,
    });

    return NextResponse.json({
      workspace: {
        id: workspace._id,
        name: workspace.name,
      },
      summary: {
        projects: projects.length,
        personas: personas.length,
        knowledge: knowledge.length,
        runtimeItems: runtimeItems.length,
        signals: runtimeItems.filter(
          (item: { entityType?: string }) => item.entityType === "signal",
        ).length,
      },
      degraded: {
        personas: personas.length === 0,
        knowledge: knowledge.length === 0,
        runtimeItems: runtimeItems.length === 0,
      },
      feed,
      graph: buildGraph({
        workspaceId: id,
        workspaceName: workspace.name,
        projects,
        personas,
        knowledge,
        runtimeItems,
      }),
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to load workspace intelligence:", error);
    return NextResponse.json(
      { error: "Failed to load workspace intelligence" },
      { status: 500 },
    );
  }
}
