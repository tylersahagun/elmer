import { NextRequest, NextResponse } from "next/server";
import {
  createConvexInvitation,
  listConvexWorkspaceInvitations,
  revokeConvexInvitation,
} from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logMemberInvited, logInvitationRevoked } from "@/lib/activity";
import type { WorkspaceRole } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require admin access to view invitations
    await requireWorkspaceAccess(workspaceId, "admin");

    const invitations = await listConvexWorkspaceInvitations(workspaceId) as Array<{
      _id: string;
      email: string;
      role: WorkspaceRole;
      token: string;
      expiresAt: number;
      acceptedAt?: number;
      inviterName?: string;
      inviterEmail?: string;
      _creationTime: number;
    }>;
    return NextResponse.json(
      invitations.map((inv) => ({
        id: inv._id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        expiresAt: new Date(inv.expiresAt).toISOString(),
        acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt).toISOString() : null,
        createdAt: new Date(inv._creationTime).toISOString(),
        inviter: {
          id: inv.inviterEmail ?? "unknown",
          name: inv.inviterName ?? null,
          email: inv.inviterEmail ?? "",
        },
        status: inv.acceptedAt
          ? "accepted"
          : inv.expiresAt < Date.now()
            ? "expired"
            : "pending",
      })),
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get invitations:", error);
    return NextResponse.json(
      { error: "Failed to get invitations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require admin access to send invitations
    const membership = await requireWorkspaceAccess(workspaceId, "admin");

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: WorkspaceRole[] = ["admin", "member", "viewer"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, member, or viewer" },
        { status: 400 }
      );
    }

    const invitation = await createConvexInvitation({
      workspaceId,
      email,
      role: role || "member",
      invitedBy: membership.userId,
      inviterName: null,
      inviterEmail: "",
    }) as {
      id: string;
      token: string;
      email: string;
      role: WorkspaceRole;
      expiresAt: number;
    };

    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
    const responsePayload = {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      role: invitation.role,
      expiresAt: new Date(invitation.expiresAt).toISOString(),
      inviteUrl: `${baseUrl}/invite/${invitation.token}`,
    });

    // Log activity
    await logMemberInvited(workspaceId, membership.userId, email, role || "member");

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    const message = error instanceof Error ? error.message : "Failed to create invitation";
    console.error("Failed to create invitation:", error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;

    // Require admin access to revoke invitations
    const membership = await requireWorkspaceAccess(workspaceId, "admin");

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    await revokeConvexInvitation(invitationId);

    await logInvitationRevoked(workspaceId, membership.userId, invitationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to revoke invitation:", error);
    return NextResponse.json(
      { error: "Failed to revoke invitation" },
      { status: 500 }
    );
  }
}
