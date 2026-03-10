/**
 * POST /api/workspaces/[id]/signals/ingest
 * Ingest signals from connected sources (Slack, HubSpot, etc.) or direct items.
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { composioService } from "@/lib/composio/service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { createConvexWorkspaceActivity } from "@/lib/convex/server";
import { getConvexWorkspace } from "@/lib/convex/server";
import { commitToGitHub } from "@/lib/github/writeback-service";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

async function getAuthenticatedClient() {
  const auth = await clerkAuth();
  const token = await auth.getToken({ template: "convex" });
  const client = getConvexClient();
  if (token) client.setAuth(token);
  return client;
}

function findIngestTool(
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

  const listTool = candidates.find((tool) => {
    const name = String(tool.name || tool.toolName || tool.id || "");
    return /list|search|fetch/i.test(name);
  });

  return listTool || candidates[0] || null;
}

function extractItems(result: Record<string, unknown>) {
  return (
    (result.data as { items?: unknown[] })?.items ||
    (result as { items?: unknown[] })?.items ||
    (result as { messages?: unknown[] })?.messages ||
    (result as { results?: unknown[] })?.results ||
    []
  );
}

function extractVerbatim(item: Record<string, unknown>) {
  return (
    item.text ||
    item.body ||
    item.content ||
    item.message ||
    item.note ||
    JSON.stringify(item)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const membership = await requireWorkspaceAccess(id, "member");

    const workspace = await getConvexWorkspace(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const source = String(body.source || "").toLowerCase();
    const items = Array.isArray(body.items) ? body.items : [];

    if (!source) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 },
      );
    }

    if (items.length === 0) {
      const composio = (workspace as { settings?: { composio?: { enabled?: boolean; connectedServices?: string[] } } }).settings?.composio;
      const connected = composio?.connectedServices || [];
      if (!composio?.enabled || !connected.includes(source)) {
        return NextResponse.json(
          { error: `${source} is not connected` },
          { status: 400 },
        );
      }

      const toolsResult = await composioService.listTools(id, [source]);
      const rawItems =
        (toolsResult as { items?: unknown[] }).items ||
        (toolsResult as { data?: { items?: unknown[] } })?.data?.items ||
        (toolsResult as { tools?: unknown[] })?.tools ||
        (Array.isArray(toolsResult) ? toolsResult : []);
      const tool = findIngestTool(
        rawItems as Array<Record<string, unknown>>,
        source,
      );
      if (!tool) {
        return NextResponse.json(
          { error: `No ${source} ingestion tool available` },
          { status: 400 },
        );
      }

      const toolName = String(tool.name || tool.toolName || tool.id);
      const result = (await composioService.executeTool(
        id,
        toolName,
        {},
      )) as Record<string, unknown>;
      const toolItems = extractItems(result as Record<string, unknown>);
      body.items = toolItems.map((item) => ({
        verbatim: extractVerbatim(item as Record<string, unknown>),
        sourceRef: String(
          (item as { id?: string }).id || (item as { ts?: string }).ts || "",
        ),
        sourceMetadata: item,
      }));
    }

    const client = await getAuthenticatedClient();
    let created = 0;

    for (const item of body.items || []) {
      await client.mutation(api.signals.create, {
        workspaceId: id as Id<"workspaces">,
        verbatim: String(item.verbatim || ""),
        interpretation: item.interpretation
          ? String(item.interpretation)
          : undefined,
        source: source,
        sourceRef: item.sourceRef ? String(item.sourceRef) : undefined,
      });
      created += 1;
    }

    await createConvexWorkspaceActivity({
      workspaceId: id,
      userId: membership.userId,
      action: "signals.ingested",
      targetType: "workspace",
      targetId: id,
      metadata: { source, created },
    }).catch(() => {});

    // Write signals index to repo (best-effort)
    const workspaceData = workspace as {
      githubRepo?: string;
      settings?: { baseBranch?: string };
      contextPath?: string;
      name?: string;
    };
    if (workspaceData.githubRepo && membership?.userId) {
      try {
        const [owner, repo] = workspaceData.githubRepo.split("/");
        if (!owner || !repo) {
          throw new Error("Invalid github repo format");
        }

        const allSignals = await client.query(api.signals.list, {
          workspaceId: id as Id<"workspaces">,
        });

        const contextRoot =
          workspaceData.contextPath &&
          workspaceData.contextPath !== "elmer-docs/" &&
          workspaceData.contextPath !== "elmer-docs"
            ? workspaceData.contextPath
            : "pm-workspace-docs/";
        const rootPath = contextRoot.endsWith("/")
          ? contextRoot
          : `${contextRoot}/`;
        const indexPath = `${rootPath}signals/_index.json`;

        const indexPayload = allSignals.map(
          (signal: {
            _id: string;
            source: string;
            sourceRef?: string;
            status: string;
            severity?: string;
            frequency?: string;
            _creationTime: number;
            tags?: string[];
          }) => ({
            id: signal._id,
            source: signal.source,
            sourceRef: signal.sourceRef,
            status: signal.status,
            severity: signal.severity,
            frequency: signal.frequency,
            createdAt: new Date(signal._creationTime).toISOString(),
            tags: signal.tags || [],
          }),
        );

        await commitToGitHub(
          {
            workspaceId: id,
            projectId: undefined,
            projectName: workspaceData.name ?? "workspace",
            owner,
            repo,
            branch: workspaceData.settings?.baseBranch || "main",
          },
          [
            {
              path: indexPath,
              content: JSON.stringify(indexPayload, null, 2),
            },
          ],
          {
            projectId: undefined,
            projectName: workspaceData.name ?? "workspace",
            documentType: "signals_index",
            triggeredBy: "signals.ingest",
          },
          membership.userId,
          "update",
        );
      } catch (error) {
        console.warn("Failed to write signals index:", error);
      }
    }

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to ingest signals:", error);
    return NextResponse.json(
      { error: "Failed to ingest signals" },
      { status: 500 },
    );
  }
}
