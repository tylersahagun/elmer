import { db } from "@/lib/db";
import { invitations, workspaceMembers, users } from "@/lib/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { WorkspaceRole } from "@/lib/db/schema";

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate a secure invitation token
 */
export function generateInviteToken(): string {
  // Use nanoid for URL-safe, unique tokens
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
  
  // Check if there's already a pending invitation for this email
  const existingInvitation = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.workspaceId, workspaceId),
      eq(invitations.email, email.toLowerCase()),
      isNull(invitations.acceptedAt),
      gt(invitations.expiresAt, new Date())
    ),
  });

  if (existingInvitation) {
    throw new Error("An invitation for this email is already pending");
  }

  // Check if user is already a member
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    const existingMembership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, existingUser.id)
      ),
    });

    if (existingMembership) {
      throw new Error("This user is already a member of the workspace");
    }
  }

  const token = generateInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  const [invitation] = await db
    .insert(invitations)
    .values({
      workspaceId,
      email: email.toLowerCase(),
      role,
      token,
      invitedBy,
      expiresAt,
    })
    .returning();

  // Generate the invite URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${token}`;

  return {
    id: invitation.id,
    token: invitation.token,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    inviteUrl,
  };
}

/**
 * Get an invitation by its token
 */
export async function getInvitationByToken(token: string) {
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
    with: {
      workspace: true,
      inviter: true,
    },
  });

  if (!invitation) {
    return null;
  }

  // Check if expired
  const isExpired = invitation.expiresAt < new Date();
  
  // Check if already accepted
  const isAccepted = invitation.acceptedAt !== null;

  return {
    ...invitation,
    isExpired,
    isAccepted,
    isValid: !isExpired && !isAccepted,
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

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  if (invitation.isExpired) {
    return { success: false, error: "This invitation has expired" };
  }

  if (invitation.isAccepted) {
    return { success: false, error: "This invitation has already been used" };
  }

  // Check if user is already a member
  const existingMembership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, invitation.workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (existingMembership) {
    // Mark invitation as accepted even if already a member
    await db
      .update(invitations)
      .set({ acceptedAt: new Date() })
      .where(eq(invitations.id, invitation.id));
    
    return { success: true, workspaceId: invitation.workspaceId };
  }

  // Add user to workspace
  await db.insert(workspaceMembers).values({
    workspaceId: invitation.workspaceId,
    userId,
    role: invitation.role,
  });

  // Mark invitation as accepted
  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  return { success: true, workspaceId: invitation.workspaceId };
}

/**
 * Revoke (delete) an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<boolean> {
  const result = await db
    .delete(invitations)
    .where(eq(invitations.id, invitationId))
    .returning();
  
  return result.length > 0;
}

/**
 * Get all pending invitations for a workspace
 */
export async function getWorkspaceInvitations(workspaceId: string) {
  const invitationList = await db.query.invitations.findMany({
    where: eq(invitations.workspaceId, workspaceId),
    with: {
      inviter: true,
    },
    orderBy: (invitations, { desc }) => [desc(invitations.createdAt)],
  });

  return invitationList.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    token: inv.token,
    expiresAt: inv.expiresAt,
    acceptedAt: inv.acceptedAt,
    createdAt: inv.createdAt,
    inviter: {
      id: inv.inviter.id,
      name: inv.inviter.name,
      email: inv.inviter.email,
    },
    status: inv.acceptedAt
      ? "accepted"
      : inv.expiresAt < new Date()
      ? "expired"
      : "pending",
  }));
}
