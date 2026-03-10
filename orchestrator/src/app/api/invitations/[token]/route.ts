import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getConvexInvitationByToken, acceptConvexInvitation } from "@/lib/convex/server";
import { logMemberJoined } from "@/lib/activity";
type WorkspaceRole = "admin" | "member" | "viewer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await getConvexInvitationByToken(token) as {
      _id: string;
      email: string;
      role: WorkspaceRole;
      workspace?: { _id: string; name: string } | null;
      inviterName?: string;
      inviterEmail?: string;
      expiresAt: number;
      isExpired: boolean;
      isAccepted: boolean;
      isValid: boolean;
    } | null;

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Return invitation details (safe to show publicly)
    return NextResponse.json({
      id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      workspace: {
        id: invitation.workspace?._id ?? "",
        name: invitation.workspace?.name ?? "",
      },
      inviter: {
        name: invitation.inviterName ?? null,
        email: invitation.inviterEmail ?? "",
      },
      expiresAt: new Date(invitation.expiresAt).toISOString(),
      isExpired: invitation.isExpired,
      isAccepted: invitation.isAccepted,
      isValid: invitation.isValid,
    });
  } catch (error) {
    console.error("Failed to get invitation:", error);
    return NextResponse.json(
      { error: "Failed to get invitation" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId: clerkUserId } = await clerkAuth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email =
      clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      null;

    if (!clerkUser || !email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { token } = await params;

    // Get invitation details before accepting for logging
    const invitation = await getConvexInvitationByToken(token) as {
      role: WorkspaceRole;
    } | null;

    const result = await acceptConvexInvitation({
      token,
      userId: clerkUserId,
      clerkUserId,
      email,
      name: clerkUser.fullName ?? clerkUser.username ?? undefined,
      image: clerkUser.imageUrl ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log activity for member joined
    if ((result as { workspaceId?: string }).workspaceId && invitation) {
      await logMemberJoined(result.workspaceId, clerkUserId, invitation.role);
    }

    return NextResponse.json({
      success: true,
      workspaceId: result.workspaceId,
    });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
