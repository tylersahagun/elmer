import { NextRequest, NextResponse } from "next/server";
import { updateKnowledgeSource, deleteKnowledgeSource } from "@/lib/db/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const source = await updateKnowledgeSource(id, body);
    return NextResponse.json(source);
  } catch (error) {
    console.error("Failed to update knowledge source:", error);
    return NextResponse.json({ error: "Failed to update knowledge source" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteKnowledgeSource(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete knowledge source:", error);
    return NextResponse.json({ error: "Failed to delete knowledge source" }, { status: 500 });
  }
}
