import { NextRequest, NextResponse } from "next/server";
import { storeMemory } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, type, content, metadata } = body;

    if (!workspaceId || !type || !content) {
      return NextResponse.json(
        { error: "workspaceId, type, and content are required" },
        { status: 400 }
      );
    }

    const memory = await storeMemory({
      workspaceId,
      projectId,
      type,
      content,
      metadata,
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Failed to store memory:", error);
    return NextResponse.json(
      { error: "Failed to store memory" },
      { status: 500 }
    );
  }
}
