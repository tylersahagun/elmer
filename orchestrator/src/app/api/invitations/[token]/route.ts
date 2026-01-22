import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInvitationByToken, acceptInvitation } from "@/lib/invitations";
import { logMemberJoined } from "@/lib/activity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Return invitation details (safe to show publicly)
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name,
      },
      inviter: {
        name: invitation.inviter.name,
        email: invitation.inviter.email,
      },
      expiresAt: invitation.expiresAt,
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
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { token } = await params;

    // Get invitation details before accepting for logging
    const invitation = await getInvitationByToken(token);

    const result = await acceptInvitation({
      token,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log activity for member joined
    if (result.workspaceId && invitation) {
      await logMemberJoined(result.workspaceId, session.user.id, invitation.role);
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
