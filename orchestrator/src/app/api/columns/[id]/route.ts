import { NextRequest, NextResponse } from "next/server";
import {
  updateColumnConfig,
  deleteColumnConfig,
  getColumnConfigById,
} from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const column = await getColumnConfigById(id);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(column.workspaceId, "member");

    const body = await request.json();
    const updatedColumn = await updateColumnConfig(id, body);
    return NextResponse.json(updatedColumn);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update column:", error);
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const column = await getColumnConfigById(id);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(column.workspaceId, "admin");

    await deleteColumnConfig(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to delete column:", error);
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
