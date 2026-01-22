/**
 * Invitation System Tests
 * 
 * Tests the invitation system:
 * - Invitation creation and validation
 * - Token generation
 * - Acceptance flow
 * - Expiration handling
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users, invitations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
  getWorkspaceInvitations,
} from "@/lib/invitations";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_inv_${nanoid(8)}`;
const TEST_ADMIN_ID = `user_admin_${nanoid(8)}`;
const TEST_INVITEE_ID = `user_invitee_${nanoid(8)}`;

describe("Invitation System Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Invitation Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create admin user
    await db.insert(users).values({
      id: TEST_ADMIN_ID,
      email: `admin_${nanoid(8)}@example.com`,
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create invitee user
    await db.insert(users).values({
      id: TEST_INVITEE_ID,
      email: `invitee_${nanoid(8)}@example.com`,
      name: "Invitee User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Add admin membership
    await db.insert(workspaceMembers).values({
      id: nanoid(),
      workspaceId: TEST_WORKSPACE_ID,
      userId: TEST_ADMIN_ID,
      role: "admin",
      joinedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup in correct order (foreign key constraints)
    await db.delete(invitations).where(eq(invitations.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
    await db.delete(users).where(eq(users.id, TEST_ADMIN_ID));
    await db.delete(users).where(eq(users.id, TEST_INVITEE_ID));
  });

  describe("Invitation Creation", () => {
    it("should create an invitation with valid data", async () => {
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "newuser@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      expect(invitation).toBeDefined();
      expect(invitation.id).toBeDefined();
      expect(invitation.token).toBeDefined();
      expect(invitation.email).toBe("newuser@example.com");
      expect(invitation.role).toBe("member");
      expect(invitation.expiresAt).toBeDefined();

      // Cleanup
      await db.delete(invitations).where(eq(invitations.id, invitation.id));
    });

    it("should generate unique tokens", async () => {
      const invitation1 = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "unique1@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      const invitation2 = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "unique2@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      expect(invitation1.token).not.toBe(invitation2.token);

      // Cleanup
      await db.delete(invitations).where(eq(invitations.id, invitation1.id));
      await db.delete(invitations).where(eq(invitations.id, invitation2.id));
    });

    it("should set correct expiration (7 days)", async () => {
      const beforeCreate = new Date();
      
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "expiry@example.com",
        role: "viewer",
        invitedBy: TEST_ADMIN_ID,
      });

      const expiresAt = new Date(invitation.expiresAt);
      const expectedMin = new Date(beforeCreate.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days
      const expectedMax = new Date(beforeCreate.getTime() + 8 * 24 * 60 * 60 * 1000); // 8 days

      expect(expiresAt.getTime()).toBeGreaterThan(expectedMin.getTime());
      expect(expiresAt.getTime()).toBeLessThan(expectedMax.getTime());

      // Cleanup
      await db.delete(invitations).where(eq(invitations.id, invitation.id));
    });

    it("should support all role types", async () => {
      const roles = ["admin", "member", "viewer"] as const;
      const createdIds: string[] = [];

      for (const role of roles) {
        const invitation = await createInvitation({
          workspaceId: TEST_WORKSPACE_ID,
          email: `role_${role}@example.com`,
          role,
          invitedBy: TEST_ADMIN_ID,
        });

        expect(invitation.role).toBe(role);
        createdIds.push(invitation.id);
      }

      // Cleanup
      for (const id of createdIds) {
        await db.delete(invitations).where(eq(invitations.id, id));
      }
    });
  });

  describe("Token Lookup", () => {
    let testToken: string;
    let testInvitationId: string;

    beforeAll(async () => {
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "lookup@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });
      testToken = invitation.token;
      testInvitationId = invitation.id;
    });

    afterAll(async () => {
      await db.delete(invitations).where(eq(invitations.id, testInvitationId));
    });

    it("should find invitation by valid token", async () => {
      const invitation = await getInvitationByToken(testToken);

      expect(invitation).toBeDefined();
      expect(invitation?.token).toBe(testToken);
      expect(invitation?.email).toBe("lookup@example.com");
    });

    it("should return null for invalid token", async () => {
      const invitation = await getInvitationByToken("invalid_token_123");

      expect(invitation).toBeNull();
    });
  });

  describe("Invitation Acceptance", () => {
    it("should accept valid invitation", async () => {
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "accept@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      const result = await acceptInvitation({
        token: invitation.token,
        userId: TEST_INVITEE_ID,
      });

      expect(result.success).toBe(true);
      expect(result.workspaceId).toBe(TEST_WORKSPACE_ID);

      // Verify membership was created
      const membership = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, TEST_WORKSPACE_ID),
          eq(workspaceMembers.userId, TEST_INVITEE_ID)
        ),
      });

      expect(membership).toBeDefined();
      expect(membership?.role).toBe("member");

      // Verify invitation was marked as used
      const usedInvitation = await getInvitationByToken(invitation.token);
      expect(usedInvitation?.usedAt).toBeDefined();

      // Cleanup
      await db.delete(workspaceMembers).where(
        and(
          eq(workspaceMembers.workspaceId, TEST_WORKSPACE_ID),
          eq(workspaceMembers.userId, TEST_INVITEE_ID)
        )
      );
      await db.delete(invitations).where(eq(invitations.id, invitation.id));
    });

    it("should reject already-used invitation", async () => {
      // Create and accept an invitation
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "reuse@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      await acceptInvitation({
        token: invitation.token,
        userId: TEST_INVITEE_ID,
      });

      // Try to accept again
      const result = await acceptInvitation({
        token: invitation.token,
        userId: TEST_INVITEE_ID,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already");

      // Cleanup
      await db.delete(workspaceMembers).where(
        and(
          eq(workspaceMembers.workspaceId, TEST_WORKSPACE_ID),
          eq(workspaceMembers.userId, TEST_INVITEE_ID)
        )
      );
      await db.delete(invitations).where(eq(invitations.id, invitation.id));
    });

    it("should reject expired invitation", async () => {
      // Create invitation with past expiration
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      
      const [invitation] = await db.insert(invitations).values({
        id: nanoid(),
        workspaceId: TEST_WORKSPACE_ID,
        email: "expired@example.com",
        role: "member",
        token: nanoid(32),
        invitedBy: TEST_ADMIN_ID,
        expiresAt: expiredDate,
        createdAt: new Date(),
      }).returning();

      const result = await acceptInvitation({
        token: invitation.token,
        userId: TEST_INVITEE_ID,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");

      // Cleanup
      await db.delete(invitations).where(eq(invitations.id, invitation.id));
    });

    it("should reject invalid token", async () => {
      const result = await acceptInvitation({
        token: "completely_invalid_token",
        userId: TEST_INVITEE_ID,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("Invitation Revocation", () => {
    it("should revoke pending invitation", async () => {
      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "revoke@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      const success = await revokeInvitation(invitation.id);
      expect(success).toBe(true);

      // Verify invitation no longer valid
      const found = await getInvitationByToken(invitation.token);
      expect(found).toBeNull();
    });

    it("should return false for non-existent invitation", async () => {
      const success = await revokeInvitation("nonexistent_id");
      expect(success).toBe(false);
    });
  });

  describe("Workspace Invitations List", () => {
    beforeAll(async () => {
      // Create multiple invitations
      await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "list1@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });
      await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "list2@example.com",
        role: "viewer",
        invitedBy: TEST_ADMIN_ID,
      });
    });

    it("should list pending invitations for workspace", async () => {
      const pendingInvitations = await getWorkspaceInvitations(TEST_WORKSPACE_ID);

      expect(pendingInvitations.length).toBeGreaterThanOrEqual(2);
      expect(pendingInvitations.some((i) => i.email === "list1@example.com")).toBe(true);
      expect(pendingInvitations.some((i) => i.email === "list2@example.com")).toBe(true);
    });
  });
});
