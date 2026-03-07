import { NextRequest, NextResponse } from "next/server";
import { ensureConvexColumns, listConvexColumns } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: workspaceId } = await params;
    await requireWorkspaceAccess(workspaceId, "viewer");
    let columns = await listConvexColumns(workspaceId);
    if (!Array.isArray(columns) || columns.length === 0) {
      columns = await ensureConvexColumns(workspaceId);
    }
    return NextResponse.json(columns);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get workspace columns:", error);
    return NextResponse.json(
      { error: "Failed to get workspace columns" },
      { status: 500 },
    );
  }
}
