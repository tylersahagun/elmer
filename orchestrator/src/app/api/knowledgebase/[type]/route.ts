import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, getKnowledgebaseEntryByType, upsertKnowledgebaseEntry } from "@/lib/db/queries";
import { resolveKnowledgePath, readKnowledgeFile, writeKnowledgeFile } from "@/lib/knowledgebase";

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

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const contextRoot =
    workspace.settings?.contextPaths?.[0] ||
    workspace.contextPath ||
    "elmer-docs/";
  const filePath = resolveKnowledgePath(contextRoot, type);
  const content = await readKnowledgeFile(filePath);
  const entry = await getKnowledgebaseEntryByType(workspaceId, type);

  return NextResponse.json({
    type,
    content,
    filePath,
    entry: entry
      ? {
          id: entry.id,
          title: entry.title,
          updatedAt: entry.updatedAt,
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

  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const contextRoot =
    workspace.settings?.contextPaths?.[0] ||
    workspace.contextPath ||
    "elmer-docs/";
  const resolvedPath = resolveKnowledgePath(contextRoot, type, filePath);
  await writeKnowledgeFile(resolvedPath, content || "");

  const entry = await upsertKnowledgebaseEntry({
    workspaceId,
    type,
    title,
    content: content || "",
    filePath: resolvedPath,
  });

  return NextResponse.json(entry);
}
