import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");
    const client = getConvexClient();
    const questions = await client.query(api.pendingQuestions.listPending, {
      workspaceId: id as Id<"workspaces">,
    });
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to list pending questions:", error);
    return NextResponse.json(
      { error: "Failed to list pending questions" },
      { status: 500 }
    );
  }
}
