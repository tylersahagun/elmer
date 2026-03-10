import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";
import { composioService } from "@/lib/composio/service";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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

    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      _id: string;
      workspaceId: string;
      settings?: { composio?: { enabled?: boolean; connectedServices?: string[] } } | null;
    };

    await requireWorkspaceAccess(project.workspaceId, "member");

    const client = getConvexClient();
    const document = (await client.query(api.documents.get, {
      documentId: docId as Id<"documents">,
    })) as {
      _id: string;
      projectId: string;
      title: string;
      content: string;
    } | null;

    if (!document || document.projectId !== id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const workspaceData = projectData as {
      workspace?: { settings?: { composio?: { enabled?: boolean; connectedServices?: string[] } } };
    };
    const composio = workspaceData.workspace?.settings?.composio;
    const connected = composio?.connectedServices || [];
    if (!composio?.enabled || !connected.includes("notion")) {
      return NextResponse.json(
        { error: "Notion is not connected" },
        { status: 400 },
      );
    }

    const toolsResult = await composioService.listTools(project.workspaceId, ["notion"]);
    const rawItems =
      (toolsResult as { items?: unknown[] }).items ||
      (toolsResult as { data?: { items?: unknown[] } })?.data?.items ||
      (toolsResult as { tools?: unknown[] })?.tools ||
      (Array.isArray(toolsResult) ? toolsResult : []);
    const tool = findNotionCreatePageTool(rawItems as Array<Record<string, unknown>>);

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
      targetId: id,
      metadata: {
        documentId: document._id,
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
