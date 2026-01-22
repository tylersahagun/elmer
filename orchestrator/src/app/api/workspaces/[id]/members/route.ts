import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceMembers } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require at least viewer access to see members
    await requireWorkspaceAccess(workspaceId, "viewer");

    const members = await getWorkspaceMembers(workspaceId);
    return NextResponse.json(members);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get workspace members:", error);
    return NextResponse.json(
      { error: "Failed to get workspace members" },
      { status: 500 }
    );
  }
}
