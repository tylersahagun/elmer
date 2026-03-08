import { NextRequest, NextResponse } from "next/server";
import { listAgentDefinitions } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "viewer");
    const agents = await listAgentDefinitions(workspaceId).catch((error) => {
      console.warn(
        `[agents:${workspaceId}] Falling back to an empty registry`,
        error,
      );
      return [];
    });
    return NextResponse.json({
      agents,
      degraded: agents.length === 0,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to list agents:", error);
    return NextResponse.json({ error: "Failed to list agents" }, { status: 500 });
  }
}
