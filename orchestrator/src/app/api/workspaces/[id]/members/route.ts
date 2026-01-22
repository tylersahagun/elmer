import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspaceMembers, getWorkspaceMembership } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: workspaceId } = await params;

    // Check if user is a member of this workspace
    const membership = await getWorkspaceMembership(workspaceId, session.user.id);
    
    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this workspace" },
        { status: 403 }
      );
    }

    const members = await getWorkspaceMembers(workspaceId);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to get workspace members:", error);
    return NextResponse.json(
      { error: "Failed to get workspace members" },
      { status: 500 }
    );
  }
}
