import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import { buildWorkspaceStatusReport } from "@/lib/status/portfolio-status";
import { writeSwarmReport } from "@/lib/swarm/report-writer";
import type { SwarmReport } from "@/lib/swarm/types";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

function buildDefaultSwarmReport(params: {
  workspaceId: string;
  workspaceName: string;
  backlog: string[];
}): SwarmReport {
  return {
    workspaceId: params.workspaceId,
    workspaceName: params.workspaceName,
    generatedAt: new Date().toISOString(),
    objective:
      "Coordinate agent lanes to move priority initiatives forward with clear owners, blockers, and evidence.",
    backlog: params.backlog,
    lanes: [
      {
        id: "memory-platform",
        name: "Memory Platform",
        owner: "workspace-admin",
        focus: "Knowledge, context, and durable workspace artifacts",
        blockers: [],
      },
      {
        id: "integrations",
        name: "Integrations",
        owner: "signals-processor",
        focus: "Inbox, sync, and external signal ingestion",
        blockers: [],
      },
      {
        id: "agent-runtime",
        name: "Agent Runtime",
        owner: "validator",
        focus: "Execution quality, approvals, and observability",
        blockers: [],
      },
      {
        id: "desktop-experience",
        name: "Desktop Experience",
        owner: "proto-builder",
        focus: "Control-plane UX, status visibility, and project workflows",
        blockers: [],
      },
    ],
    blockers: [],
    validationChecks: [
      { label: "Status dashboard builds", evidence: "Workspace status routes" },
      { label: "Execution UI renders", evidence: "Execution panel and project cards" },
    ],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const status = await buildWorkspaceStatusReport(id);
    const backlog =
      status?.actionQueue.map(
        (item) => `${item.projectName}: ${item.reason} → ${item.command}`,
      ) ?? [];

    return NextResponse.json(
      buildDefaultSwarmReport({
        workspaceId: id,
        workspaceName: workspace.name,
        backlog,
      }),
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to build swarm report:", error);
    return NextResponse.json(
      { error: "Failed to build swarm report" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "member");

    const body = (await request.json()) as SwarmReport;
    const report: SwarmReport = {
      ...body,
      workspaceId: id,
      generatedAt: new Date().toISOString(),
    };
    const saved = await writeSwarmReport(report);
    return NextResponse.json({ report, saved });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to save swarm report:", error);
    return NextResponse.json(
      { error: "Failed to save swarm report" },
      { status: 500 },
    );
  }
}
