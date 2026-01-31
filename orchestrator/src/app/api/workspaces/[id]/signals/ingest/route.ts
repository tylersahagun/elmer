import { NextRequest, NextResponse } from "next/server";
import { createSignal, getWorkspace } from "@/lib/db/queries";
import { composioService } from "@/lib/composio/service";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { commitToGitHub } from "@/lib/github/writeback-service";

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
    const workspace = await getWorkspace(id);
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
      const composio = workspace.settings?.composio;
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

    let created = 0;
    for (const item of body.items || []) {
      await createSignal({
        workspaceId: id,
        verbatim: String(item.verbatim || ""),
        interpretation: item.interpretation
          ? String(item.interpretation)
          : undefined,
        source: source as "slack" | "hubspot" | "other",
        sourceRef: item.sourceRef ? String(item.sourceRef) : undefined,
        sourceMetadata: item.sourceMetadata || undefined,
      });
      created += 1;
    }

    await logActivity(id, null, "signals.ingested", {
      targetType: "workspace",
      targetId: id,
      metadata: { source, created },
    });

    // Write signals index to repo (best-effort)
    if (workspace.githubRepo && membership?.userId) {
      try {
        const [owner, repo] = workspace.githubRepo.split("/");
        if (!owner || !repo) {
          throw new Error("Invalid github repo format");
        }
        const allSignals = await db.query.signals.findMany({
          where: eq(signals.workspaceId, id),
        });

        const contextRoot =
          workspace.contextPath &&
          workspace.contextPath !== "elmer-docs/" &&
          workspace.contextPath !== "elmer-docs"
            ? workspace.contextPath
            : "pm-workspace-docs/";
        const rootPath = contextRoot.endsWith("/")
          ? contextRoot
          : `${contextRoot}/`;
        const indexPath = `${rootPath}signals/_index.json`;

        const indexPayload = allSignals.map((signal) => ({
          id: signal.id,
          source: signal.source,
          sourceRef: signal.sourceRef,
          status: signal.status,
          severity: signal.severity,
          frequency: signal.frequency,
          createdAt: signal.createdAt,
          tags: signal.tags || [],
        }));

        await commitToGitHub(
          {
            workspaceId: id,
            projectId: undefined,
            projectName: workspace.name,
            owner,
            repo,
            branch: workspace.settings?.baseBranch || "main",
          },
          [
            {
              path: indexPath,
              content: JSON.stringify(indexPayload, null, 2),
            },
          ],
          {
            projectId: undefined,
            projectName: workspace.name,
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
