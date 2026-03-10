import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { composioService } from "@/lib/composio/service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { getConvexProjectWithDocuments, getConvexWorkspace } from "@/lib/convex/server";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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

    // Get project from Convex
    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as {
      _id: string;
      workspaceId: string;
      name: string;
    };

    const membership = await requireWorkspaceAccess(
      project.workspaceId,
      "member",
    );

    // Get workspace settings from Convex
    const workspaceData = await getConvexWorkspace(project.workspaceId) as {
      settings?: {
        composio?: {
          enabled?: boolean;
          connectedServices?: string[];
        };
      };
    } | null;

    const composio = workspaceData?.settings?.composio;
    const connected = composio?.connectedServices || [];

    if (!composio?.enabled || !connected.includes(toolkit)) {
      return NextResponse.json(
        { error: `${toolkit} is not connected` },
        { status: 400 },
      );
    }

    // Get tickets from Convex
    const client = getConvexClient();
    const allTickets = await client.query(api.tickets.listByProject, {
      projectId: id as Id<"projects">,
    });

    const pendingTickets = allTickets.filter((t: { linearId?: string; jiraId?: string }) =>
      toolkit === "linear" ? !t.linearId : !t.jiraId
    );

    if (pendingTickets.length === 0) {
      return NextResponse.json({ ok: true, synced: 0 });
    }

    let body: { confirm?: string } = {};
    try {
      body = (await request.json()) as { confirm?: string };
    } catch {
      body = {};
    }

    const expectedConfirmation = `sync ${pendingTickets.length} ${toolkit} ticket${pendingTickets.length === 1 ? "" : "s"}`;
    if (body.confirm !== expectedConfirmation) {
      return NextResponse.json(
        {
          error: `Confirmation required. Re-submit with confirm="${expectedConfirmation}" to sync tickets.`,
        },
        { status: 400 },
      );
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

    for (const ticket of pendingTickets) {
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

        await client.mutation(api.tickets.updateLinearSync, {
          ticketId: ticket._id as Id<"tickets">,
          linearId: linearId || undefined,
          linearIdentifier: identifier || undefined,
          syncStatus: "synced",
          toolkit,
        });
        synced += 1;
      } catch (error) {
        await client.mutation(api.tickets.updateLinearSync, {
          ticketId: ticket._id as Id<"tickets">,
          syncStatus: "failed",
          toolkit,
        });
        console.error("Failed to sync ticket:", error);
      }
    }

    await logActivity(
      project.workspaceId,
      membership.userId,
      "tickets.synced",
      {
        targetType: "project",
        targetId: project._id,
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
