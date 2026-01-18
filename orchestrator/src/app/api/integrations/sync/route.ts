import { NextRequest, NextResponse } from "next/server";
import { storeMemory, getWorkspace } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, sourceType } = body;

    if (!workspaceId || !sourceType) {
      return NextResponse.json({ error: "workspaceId and sourceType are required" }, { status: 400 });
    }

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Stub sync: record a memory entry that sync was requested.
    await storeMemory({
      workspaceId,
      type: "artifact",
      content: `Sync requested for ${sourceType}`,
      metadata: { sourceType, status: "pending" },
    });

    return NextResponse.json({ ok: true, status: "queued" });
  } catch (error) {
    console.error("Failed to sync integration:", error);
    return NextResponse.json({ error: "Failed to sync integration" }, { status: 500 });
  }
}
