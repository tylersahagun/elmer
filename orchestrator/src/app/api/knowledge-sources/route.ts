import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  }
  const client = getConvexClient();
  const sources = await client.query(api.knowledgeSources.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getConvexClient();
    const id = await client.mutation(api.knowledgeSources.create, {
      workspaceId: body.workspaceId as Id<"workspaces">,
      type: body.type,
      config: body.config,
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt).getTime() : undefined,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create knowledge source:", error);
    return NextResponse.json({ error: "Failed to create knowledge source" }, { status: 500 });
  }
}
