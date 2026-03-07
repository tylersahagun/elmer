import { NextRequest, NextResponse } from "next/server";
import { getConvexWorkspace, listConvexKnowledge, upsertConvexKnowledge } from "@/lib/convex/server";
import { resolveKnowledgePath, writeKnowledgeFile } from "@/lib/knowledgebase";
import { runSecondaryExport } from "@/lib/export-sync";
import type { KnowledgebaseType } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const { type } = await params;

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
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
  const entries = await listConvexKnowledge(workspaceId, type) as Array<{
    _id: string;
    title: string;
    content: string;
    filePath?: string;
    version?: number;
    _creationTime?: number;
  }>;
  const entry = entries[0];

  return NextResponse.json({
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
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const body = await request.json();
  const { type } = await params;
  const { workspaceId, title, content, filePath } = body;

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
      entry,
      authority: "convex",
      export: exportResult,
    },
    { status: exportResult.status === "failed" ? 207 : 200 },
  );
}
