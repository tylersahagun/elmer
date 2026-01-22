import { NextRequest, NextResponse } from "next/server";
import {
  createInvitation,
  getWorkspaceInvitations,
  revokeInvitation,
  getInvitationById,
} from "@/lib/invitations";
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

    const invitations = await getWorkspaceInvitations(workspaceId);
    return NextResponse.json(invitations);
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

    const invitation = await createInvitation({
      workspaceId,
      email,
      role: role || "member",
      invitedBy: membership.userId,
    });

    // Log activity
    await logMemberInvited(workspaceId, membership.userId, email, role || "member");

    return NextResponse.json(invitation, { status: 201 });
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

    // Get invitation details before revoking for logging
    const invitation = await getInvitationById(invitationId);

    const success = await revokeInvitation(invitationId);

    if (!success) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Log activity
    if (invitation) {
      await logInvitationRevoked(workspaceId, membership.userId, invitation.email);
    }

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
