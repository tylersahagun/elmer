import { NextRequest, NextResponse } from "next/server";
import { getConvexWorkspace, listConvexKnowledge } from "@/lib/convex/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  const workspace = await getConvexWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }
  const entries = await listConvexKnowledge(workspaceId);
  return NextResponse.json(entries);
}
