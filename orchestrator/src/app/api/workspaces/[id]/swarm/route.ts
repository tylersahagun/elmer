import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import { buildWorkspaceStatusReport } from "@/lib/status/portfolio-status";
import { writeSwarmReport } from "@/lib/swarm/report-writer";
import { buildSwarmReport, getAvailableSwarmPresets } from "@/lib/swarm/planner";
import type { SwarmPreset, SwarmReport } from "@/lib/swarm/types";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
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
    const presetParam = request.nextUrl.searchParams.get("preset") as
      | SwarmPreset
      | null;
    const preset = getAvailableSwarmPresets().includes(
      (presetParam || "flagship") as SwarmPreset,
    )
      ? ((presetParam || "flagship") as SwarmPreset)
      : "flagship";

    return NextResponse.json(
      buildSwarmReport({
        workspaceId: id,
        workspaceName: workspace.name,
        preset,
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
      preset: body.preset || "flagship",
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
