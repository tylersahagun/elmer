import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getProject, getTickets } from "@/lib/db/queries";
import { composioService } from "@/lib/composio/service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { eq } from "drizzle-orm";

function findCreateIssueTool(
  tools: Array<Record<string, unknown>>,
  toolkit: string,
) {
  const candidates = tools.filter((tool) => {
    const name = String(tool.name || tool.toolName || tool.id || "");
    const toolkitName = String(tool.toolkit || tool.app || tool.appName || "");
    return (
      toolkitName.toLowerCase().includes(toolkit) ||
      name.toLowerCase().includes(toolkit)
    );
  });

  const createIssue = candidates.find((tool) => {
    const name = String(tool.name || tool.toolName || tool.id || "");
    return /create.*(issue|ticket)|issue.*create/i.test(name);
  });

  return createIssue || candidates[0] || null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const toolkit = (searchParams.get("toolkit") || "linear").toLowerCase();
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      project.workspaceId,
      "member",
    );
    const composio = project.workspace?.settings?.composio;
    const connected = composio?.connectedServices || [];

    if (!composio?.enabled || !connected.includes(toolkit)) {
      return NextResponse.json(
        { error: `${toolkit} is not connected` },
        { status: 400 },
      );
    }

    const ticketsToSync = await getTickets(id);
    if (ticketsToSync.length === 0) {
      return NextResponse.json({ ok: true, synced: 0 });
    }

    const toolsResult = await composioService.listTools(project.workspaceId, [
      toolkit,
    ]);
    const rawItems =
      (toolsResult as { items?: unknown[] }).items ||
      (toolsResult as { data?: { items?: unknown[] } })?.data?.items ||
      (toolsResult as { tools?: unknown[] })?.tools ||
      (Array.isArray(toolsResult) ? toolsResult : []);
    const tool = findCreateIssueTool(
      rawItems as Array<Record<string, unknown>>,
      toolkit,
    );

    if (!tool) {
      return NextResponse.json(
        { error: "No Linear create-issue tool available" },
        { status: 400 },
      );
    }

    const toolName = String(tool.name || tool.toolName || tool.id);
    let synced = 0;
    for (const ticket of ticketsToSync) {
      if (ticket.linearId) continue;
      try {
        const response = await composioService.executeTool(
          project.workspaceId,
          toolName,
          {
            title: ticket.title,
            description: ticket.description || "",
          },
        );
        const linearId =
          (response as { data?: { id?: string } })?.data?.id ||
          (response as { id?: string })?.id ||
          null;
        const identifier =
          (response as { data?: { identifier?: string } })?.data?.identifier ||
          (response as { identifier?: string })?.identifier ||
          null;

        await db
          .update(tickets)
          .set({
            linearId: linearId || undefined,
            linearIdentifier: identifier || undefined,
            metadata: {
              ...(ticket.metadata || {}),
              linearSyncStatus: toolkit === "linear" ? "synced" : undefined,
              jiraSyncStatus: toolkit === "jira" ? "synced" : undefined,
            },
            updatedAt: new Date(),
          })
          .where(eq(tickets.id, ticket.id));
        synced += 1;
      } catch (error) {
        await db
          .update(tickets)
          .set({
            metadata: {
              ...(ticket.metadata || {}),
              linearSyncStatus: toolkit === "linear" ? "failed" : undefined,
              jiraSyncStatus: toolkit === "jira" ? "failed" : undefined,
            },
            updatedAt: new Date(),
          })
          .where(eq(tickets.id, ticket.id));
        console.error("Failed to sync ticket:", error);
      }
    }

    await logActivity(
      project.workspaceId,
      membership.userId,
      "tickets.synced",
      {
        targetType: "project",
        targetId: project.id,
        metadata: { synced, toolName },
      },
    );

    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync tickets:", error);
    return NextResponse.json(
      { error: "Failed to sync tickets" },
      { status: 500 },
    );
  }
}
