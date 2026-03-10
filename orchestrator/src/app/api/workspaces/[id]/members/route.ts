import { NextRequest, NextResponse } from "next/server";
import { listConvexWorkspaceMembers } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
type WorkspaceRole = "admin" | "member" | "viewer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require at least viewer access to see members
    await requireWorkspaceAccess(workspaceId, "viewer");

    const members = await listConvexWorkspaceMembers(workspaceId) as Array<{
      _id: string;
      userId?: string;
      clerkUserId: string;
      role: WorkspaceRole;
      joinedAt: number;
      displayName?: string;
      email?: string;
      image?: string;
    }>;
    return NextResponse.json(
      members.map((m) => ({
        id: m._id,
        userId: m.userId ?? m.clerkUserId,
        role: m.role,
        joinedAt: new Date(m.joinedAt).toISOString(),
        user: {
          id: m.userId ?? m.clerkUserId,
          name: m.displayName ?? null,
          email: m.email ?? "",
          image: m.image ?? null,
        },
      })),
    );
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
