import { NextRequest, NextResponse } from "next/server";
import { createConvexColumn, listConvexColumns } from "@/lib/convex/server";
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
    const columns = await listConvexColumns(workspaceId);
    return NextResponse.json(columns);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get columns:", error);
    return NextResponse.json({ error: "Failed to get columns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }
    await requireWorkspaceAccess(body.workspaceId, "admin");
    const column = await createConvexColumn(body);
    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to create column:", error);
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}
