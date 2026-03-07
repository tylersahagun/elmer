import { NextRequest, NextResponse } from "next/server";
import { buildWorkspaceStatusReport } from "@/lib/status/portfolio-status";
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

    const report = await buildWorkspaceStatusReport(id);
    if (!report) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const projectName = searchParams.get("projectName")?.toLowerCase();

    if (projectId || projectName) {
      const initiative = report.initiatives.find((item) =>
        projectId ? item.id === projectId : item.name.toLowerCase().includes(projectName || ""),
      );
      if (!initiative) {
        return NextResponse.json(
          { error: "Initiative not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        workspaceId: report.workspaceId,
        workspaceName: report.workspaceName,
        generatedAt: report.generatedAt,
        initiative,
      });
    }

    return NextResponse.json({
      workspaceId: report.workspaceId,
      workspaceName: report.workspaceName,
      generatedAt: report.generatedAt,
      summary: report.summary,
      healthScore: report.healthScore,
      attentionRequired: report.attentionRequired,
      readyToAdvance: report.readyToAdvance,
      actionQueue: report.actionQueue,
      measurementCoverage: report.measurementCoverage,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to build workspace status:", error);
    return NextResponse.json(
      { error: "Failed to build workspace status" },
      { status: 500 },
    );
  }
}
