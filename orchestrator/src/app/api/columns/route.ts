import { NextRequest, NextResponse } from "next/server";
import { getColumnConfigs, createColumnConfig } from "@/lib/db/queries";
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
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const columns = await getColumnConfigs(workspaceId);
    return NextResponse.json(columns);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(body.workspaceId, "member");

    const column = await createColumnConfig(body);
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
