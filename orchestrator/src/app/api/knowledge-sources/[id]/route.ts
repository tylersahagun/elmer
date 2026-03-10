import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getConvexClient();
    const updated = await client.mutation(api.knowledgeSources.update, {
      id: id as Id<"knowledgeSources">,
      type: body.type,
      config: body.config,
      lastSyncedAt: body.lastSyncedAt ? new Date(body.lastSyncedAt).getTime() : undefined,
    });
    return NextResponse.json(updated);
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
    const client = getConvexClient();
    await client.mutation(api.knowledgeSources.remove, {
      id: id as Id<"knowledgeSources">,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete knowledge source:", error);
    return NextResponse.json({ error: "Failed to delete knowledge source" }, { status: 500 });
  }
}
