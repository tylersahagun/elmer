import { NextResponse } from "next/server";
import {
  buildEmptyWorkspaceStatusReport,
  buildWorkspaceStatusReport,
} from "@/lib/status/portfolio-status";
import { getConvexWorkspace } from "@/lib/convex/server";
import { writeWorkspaceStatusSnapshot } from "@/lib/status/report-writer";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");

    const report =
      (await buildWorkspaceStatusReport(id)) ??
      buildEmptyWorkspaceStatusReport(
        id,
        ((await getConvexWorkspace(id)) as { name?: string } | null)?.name ??
          "Workspace",
      );

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to build portfolio status:", error);
    return NextResponse.json(
      { error: "Failed to build portfolio status" },
      { status: 500 },
    );
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "member");

    const report =
      (await buildWorkspaceStatusReport(id)) ??
      buildEmptyWorkspaceStatusReport(
        id,
        ((await getConvexWorkspace(id)) as { name?: string } | null)?.name ??
          "Workspace",
      );

    const saved = await writeWorkspaceStatusSnapshot(report);
    return NextResponse.json({
      report,
      saved,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to save portfolio status snapshot:", error);
    return NextResponse.json(
      { error: "Failed to save portfolio status snapshot" },
      { status: 500 },
    );
  }
}
