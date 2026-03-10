// NOTE: This file is dead code — no longer imported by application code (only test files). Safe to delete in cleanup phase.

import {
  createConvexInvitation,
  getConvexInvitationByToken,
  acceptConvexInvitation,
  listConvexWorkspaceInvitations,
} from "@/lib/convex/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { nanoid } from "nanoid";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate a secure invitation token
 */
export function generateInviteToken(): string {
  return nanoid(32);
}

/**
 * Create an invitation to a workspace
 */
export async function createInvitation(params: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
}): Promise<{
  id: string;
  token: string;
  email: string;
  role: WorkspaceRole;
  expiresAt: Date;
  inviteUrl: string;
}> {
  const { workspaceId, email, role, invitedBy } = params;

  const result = await createConvexInvitation({
    workspaceId,
    email: email.toLowerCase(),
    role,
    invitedBy,
  }) as { id: string; token: string; email: string; role: string; expiresAt: number };

  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${result.token}`;

  return {
    id: result.id,
    token: result.token,
    email: result.email,
    role: result.role as WorkspaceRole,
    expiresAt: new Date(result.expiresAt),
    inviteUrl,
  };
}

/**
 * Get an invitation by its token
 */
export async function getInvitationByToken(token: string) {
  const invitation = await getConvexInvitationByToken(token) as {
    _id: string;
    token: string;
    email: string;
    role: string;
    workspaceId: string;
    expiresAt: number;
    acceptedAt?: number;
    workspace?: unknown;
    isExpired: boolean;
    isAccepted: boolean;
    isValid: boolean;
  } | null;

  if (!invitation) return null;

  return {
    ...invitation,
    id: invitation._id,
    expiresAt: new Date(invitation.expiresAt),
    acceptedAt: invitation.acceptedAt ? new Date(invitation.acceptedAt) : null,
    role: invitation.role as WorkspaceRole,
  };
}

/**
 * Accept an invitation and add user to workspace
 */
export async function acceptInvitation(params: {
  token: string;
  userId: string;
}): Promise<{ success: boolean; workspaceId?: string; error?: string }> {
  const { token, userId } = params;

  try {
    const result = await acceptConvexInvitation({
      token,
      clerkUserId: userId,
      userId,
      email: "",
    }) as { workspaceId?: string; error?: string };

    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true, workspaceId: result.workspaceId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}

/**
 * Get an invitation by its ID
 */
export async function getInvitationById(invitationId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  const client = new ConvexHttpClient(convexUrl);
  return await client.query(api.invitations.getByToken, { token: invitationId }).catch(() => null);
}

/**
 * Revoke (delete) an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<boolean> {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return false;
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.invitations.revoke, {
      invitationId: invitationId as Id<"invitations">,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all pending invitations for a workspace
 */
export async function getWorkspaceInvitations(workspaceId: string) {
  const invitationList = await listConvexWorkspaceInvitations(workspaceId) as Array<{
    _id: string;
    id?: string;
    email: string;
    role: string;
    token: string;
    expiresAt: number;
    acceptedAt?: number;
    createdAt?: number;
    inviterName?: string;
    inviterEmail?: string;
    invitedBy?: string;
  }>;

  return invitationList.map((inv) => ({
    id: inv._id ?? inv.id,
    email: inv.email,
    role: inv.role,
    token: inv.token,
    expiresAt: new Date(inv.expiresAt),
    acceptedAt: inv.acceptedAt ? new Date(inv.acceptedAt) : null,
    createdAt: inv.createdAt ? new Date(inv.createdAt) : null,
    inviter: {
      id: inv.invitedBy ?? "unknown",
      name: inv.inviterName ?? null,
      email: inv.inviterEmail ?? "",
    },
    status: inv.acceptedAt
      ? "accepted"
      : inv.expiresAt < Date.now()
      ? "expired"
      : "pending",
  }));
}
