import { NextRequest, NextResponse } from "next/server";
import {
  AppAuthenticationError,
  requireCurrentAppUser,
} from "@/lib/auth/server";
import { getConvexInvitationByToken, acceptConvexInvitation } from "@/lib/convex/server";
import { logMemberJoined } from "@/lib/activity";
import type { WorkspaceRole } from "@/lib/db/schema";

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
    const appUser = await requireCurrentAppUser();

    const { token } = await params;

    // Get invitation details before accepting for logging
    const invitation = await getConvexInvitationByToken(token) as {
      role: WorkspaceRole;
    } | null;

    const result = await acceptConvexInvitation({
      token,
      userId: appUser.id,
      clerkUserId: appUser.clerkUserId,
      email: appUser.email,
      name: appUser.name ?? undefined,
      image: appUser.image ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Log activity for member joined
    if ((result as { workspaceId?: string }).workspaceId && invitation) {
      await logMemberJoined(result.workspaceId, appUser.id, invitation.role);
    }

    return NextResponse.json({
      success: true,
      workspaceId: result.workspaceId,
    });
  } catch (error) {
    if (error instanceof AppAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
