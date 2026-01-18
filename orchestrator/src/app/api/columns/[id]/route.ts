import { NextRequest, NextResponse } from "next/server";
import { updateColumnConfig, deleteColumnConfig } from "@/lib/db/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const column = await updateColumnConfig(id, body);
    return NextResponse.json(column);
  } catch (error) {
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
    await deleteColumnConfig(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete column:", error);
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
