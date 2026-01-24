import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceActivityLogs } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require viewer access to view activity logs
    await requireWorkspaceAccess(workspaceId, "viewer");

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const logs = await getWorkspaceActivityLogs(workspaceId, { limit, offset });

    return NextResponse.json(logs);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get activity logs:", error);
    return NextResponse.json(
      { error: "Failed to get activity logs" },
      { status: 500 }
    );
  }
}
