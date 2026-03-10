import { NextRequest, NextResponse } from "next/server";
import { getConvexWorkspace, listConvexKnowledge, upsertConvexKnowledge } from "@/lib/convex/server";
import { resolveKnowledgePath, writeKnowledgeFile } from "@/lib/knowledgebase";
import { runSecondaryExport } from "@/lib/export-sync";
type KnowledgebaseType = "company_context" | "strategic_guardrails" | "personas" | "roadmap" | "rules";

const KNOWLEDGEBASE_SURFACE = {
  runtimeAuthority: "convex_graph",
  surfaceRole: "lens",
  mirrorRole: "compatibility_export",
} as const;

function buildHypothesesLensContent(workspaceId: string) {
  return `# Hypotheses Lens

Hypotheses are no longer treated as a standalone workspace file.

Use the Workspace Intelligence surface to review:
- linked signals
- runtime context and memory
- related projects and tasks
- knowledge and persona lenses together

Open: \`/workspace/${workspaceId}/intelligence\`
`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const { type } = await params;

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }

  if (type === "hypotheses") {
    return NextResponse.json({
      authority: KNOWLEDGEBASE_SURFACE,
      type,
      content: buildHypothesesLensContent(workspaceId),
      filePath: `/workspace/${workspaceId}/intelligence`,
      entry: null,
      degraded: true,
      readOnly: true,
    });
  }

  const workspace = await getConvexWorkspace(workspaceId) as {
    contextPath?: string | null;
    settings?: { contextPaths?: string[] } | null;
  } | null;
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const contextRoot =
    workspace.settings?.contextPaths?.[0] ||
    workspace.contextPath ||
    "elmer-docs/";
  const filePath = resolveKnowledgePath(contextRoot, type as KnowledgebaseType);
  const entries = await listConvexKnowledge(workspaceId, type).catch((error) => {
    console.warn(`[knowledgebase:${type}] Falling back to empty content`, error);
    return [];
  }) as Array<{
    _id: string;
    title: string;
    content: string;
    filePath?: string;
    version?: number;
    _creationTime?: number;
  }>;
  const entry = entries[0];

  return NextResponse.json({
    authority: KNOWLEDGEBASE_SURFACE,
    type,
    content: entry?.content ?? "",
    filePath: entry?.filePath ?? filePath,
    entry: entry
      ? {
          id: entry._id,
          title: entry.title,
          updatedAt: entry._creationTime
            ? new Date(entry._creationTime).toISOString()
            : new Date().toISOString(),
        }
      : null,
    degraded: entries.length === 0,
  });
  } catch (error) {
    console.error("[knowledgebase] Failed to fetch entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledgebase entry" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const body = await request.json();
  const { type } = await params;
  const { workspaceId, title, content, filePath } = body;

  if (type === "hypotheses") {
    return NextResponse.json(
      {
        error:
          "Hypotheses are now a read-only Workspace Intelligence lens. Open /intelligence to review them.",
      },
      { status: 409 },
    );
  }

  if (!workspaceId || !title) {
    return NextResponse.json({ error: "workspaceId and title are required" }, { status: 400 });
  }

  const workspace = await getConvexWorkspace(workspaceId) as {
    contextPath?: string | null;
    settings?: { contextPaths?: string[] } | null;
  } | null;
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const contextRoot =
    workspace.settings?.contextPaths?.[0] ||
    workspace.contextPath ||
    "elmer-docs/";
  const resolvedPath = resolveKnowledgePath(contextRoot, type as KnowledgebaseType, filePath);
  const entry = await upsertConvexKnowledge({
    workspaceId,
    type: type as KnowledgebaseType,
    title,
    content: content || "",
    filePath: resolvedPath,
  });

  const exportResult = await runSecondaryExport("knowledgebase", async () => {
    await writeKnowledgeFile(resolvedPath, content || "");
  });

  return NextResponse.json(
    {
      authority: KNOWLEDGEBASE_SURFACE,
      entry,
      export: exportResult,
    },
    { status: exportResult.status === "failed" ? 207 : 200 },
  );
}
