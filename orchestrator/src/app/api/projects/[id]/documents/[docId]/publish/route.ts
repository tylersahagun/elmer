import { NextRequest, NextResponse } from "next/server";
import { getDocument, getProject } from "@/lib/db/queries";
import { composioService } from "@/lib/composio/service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";

function findNotionCreatePageTool(tools: Array<Record<string, unknown>>) {
  const candidates = tools.filter((tool) => {
    const name = String(tool.name || tool.toolName || tool.id || "");
    const toolkit = String(tool.toolkit || tool.app || tool.appName || "");
    return (
      toolkit.toLowerCase().includes("notion") ||
      name.toLowerCase().includes("notion")
    );
  });

  const createPage = candidates.find((tool) => {
    const name = String(tool.name || tool.toolName || tool.id || "");
    return /create.*page|page.*create/i.test(name);
  });

  return createPage || candidates[0] || null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  try {
    const { id, docId } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(project.workspaceId, "member");

    const document = await getDocument(docId);
    if (!document || document.projectId !== project.id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const composio = project.workspace?.settings?.composio;
    const connected = composio?.connectedServices || [];
    if (!composio?.enabled || !connected.includes("notion")) {
      return NextResponse.json(
        { error: "Notion is not connected" },
        { status: 400 },
      );
    }

    const toolsResult = await composioService.listTools(project.workspaceId, [
      "notion",
    ]);
    const rawItems =
      (toolsResult as { items?: unknown[] }).items ||
      (toolsResult as { data?: { items?: unknown[] } })?.data?.items ||
      (toolsResult as { tools?: unknown[] })?.tools ||
      (Array.isArray(toolsResult) ? toolsResult : []);
    const tool = findNotionCreatePageTool(
      rawItems as Array<Record<string, unknown>>,
    );

    if (!tool) {
      return NextResponse.json(
        { error: "No Notion create-page tool available" },
        { status: 400 },
      );
    }

    const toolName = String(tool.name || tool.toolName || tool.id);
    const result = await composioService.executeTool(
      project.workspaceId,
      toolName,
      {
        title: document.title,
        content: document.content,
      },
    );

    await logActivity(project.workspaceId, null, "documents.published", {
      targetType: "project",
      targetId: project.id,
      metadata: {
        documentId: document.id,
        documentTitle: document.title,
        toolName,
        service: "notion",
        result,
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to publish document:", error);
    return NextResponse.json(
      { error: "Failed to publish document" },
      { status: 500 },
    );
  }
}
