/**
 * Invitation System Tests
 *
 * Tests the invitation system functions backed by Convex.
 * Uses mocked Convex helpers — no Drizzle/Postgres dependency.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { nanoid } from "nanoid";

// Mock Convex server helpers
vi.mock("@/lib/convex/server", () => ({
  createConvexInvitation: vi.fn(),
  getConvexInvitationByToken: vi.fn(),
  acceptConvexInvitation: vi.fn(),
  listConvexWorkspaceInvitations: vi.fn(),
}));

// Mock ConvexHttpClient
vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    mutation: vi.fn(),
  })),
}));

import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
  getWorkspaceInvitations,
} from "@/lib/invitations";
import {
  createConvexInvitation,
  getConvexInvitationByToken,
  acceptConvexInvitation,
  listConvexWorkspaceInvitations,
} from "@/lib/convex/server";
import { ConvexHttpClient } from "convex/browser";

const mockCreateConvexInvitation = vi.mocked(createConvexInvitation);
const mockGetConvexInvitationByToken = vi.mocked(getConvexInvitationByToken);
const mockAcceptConvexInvitation = vi.mocked(acceptConvexInvitation);
const mockListConvexWorkspaceInvitations = vi.mocked(listConvexWorkspaceInvitations);

const TEST_WORKSPACE_ID = `ws_${nanoid(8)}`;
const TEST_ADMIN_ID = `user_admin_${nanoid(8)}`;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";
  process.env.AUTH_URL = "http://localhost:3000";
});

describe("Invitation System Tests", () => {
  describe("Invitation Creation", () => {
    it("should create an invitation with valid data", async () => {
      const mockToken = nanoid(32);
      const mockExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      mockCreateConvexInvitation.mockResolvedValue({
        id: nanoid(),
        token: mockToken,
        email: "newuser@example.com",
        role: "member",
        expiresAt: mockExpiry,
      });

      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "newuser@example.com",
        role: "member",
        invitedBy: TEST_ADMIN_ID,
      });

      expect(invitation).toBeDefined();
      expect(invitation.id).toBeDefined();
      expect(invitation.token).toBe(mockToken);
      expect(invitation.email).toBe("newuser@example.com");
      expect(invitation.role).toBe("member");
      expect(invitation.expiresAt).toBeInstanceOf(Date);
      expect(invitation.inviteUrl).toContain(mockToken);
    });

    it("should generate unique tokens", async () => {
      const token1 = nanoid(32);
      const token2 = nanoid(32);
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      mockCreateConvexInvitation
        .mockResolvedValueOnce({ id: nanoid(), token: token1, email: "u1@example.com", role: "member", expiresAt })
        .mockResolvedValueOnce({ id: nanoid(), token: token2, email: "u2@example.com", role: "member", expiresAt });

      const inv1 = await createInvitation({ workspaceId: TEST_WORKSPACE_ID, email: "u1@example.com", role: "member", invitedBy: TEST_ADMIN_ID });
      const inv2 = await createInvitation({ workspaceId: TEST_WORKSPACE_ID, email: "u2@example.com", role: "member", invitedBy: TEST_ADMIN_ID });

      expect(inv1.token).not.toBe(inv2.token);
    });

    it("should set correct expiration (7 days)", async () => {
      const now = Date.now();
      const expiresAtMs = now + 7 * 24 * 60 * 60 * 1000;
      mockCreateConvexInvitation.mockResolvedValue({
        id: nanoid(),
        token: nanoid(32),
        email: "expiry@example.com",
        role: "viewer",
        expiresAt: expiresAtMs,
      });

      const invitation = await createInvitation({
        workspaceId: TEST_WORKSPACE_ID,
        email: "expiry@example.com",
        role: "viewer",
        invitedBy: TEST_ADMIN_ID,
      });

      const expiresAt = invitation.expiresAt;
      const sixDays = now + 6 * 24 * 60 * 60 * 1000;
      const eightDays = now + 8 * 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThan(sixDays);
      expect(expiresAt.getTime()).toBeLessThan(eightDays);
    });

    it("should support all role types", async () => {
      const roles = ["admin", "member", "viewer"] as const;
      for (const role of roles) {
        mockCreateConvexInvitation.mockResolvedValueOnce({
          id: nanoid(),
          token: nanoid(32),
          email: `role_${role}@example.com`,
          role,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        const invitation = await createInvitation({ workspaceId: TEST_WORKSPACE_ID, email: `role_${role}@example.com`, role, invitedBy: TEST_ADMIN_ID });
        expect(invitation.role).toBe(role);
      }
    });
  });

  describe("Token Lookup", () => {
    it("should find invitation by valid token", async () => {
      const token = nanoid(32);
      mockGetConvexInvitationByToken.mockResolvedValue({
        _id: nanoid(),
        token,
        email: "lookup@example.com",
        role: "member",
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        isExpired: false,
        isAccepted: false,
        isValid: true,
      });

      const invitation = await getInvitationByToken(token);

      expect(invitation).toBeDefined();
      expect(invitation?.token).toBe(token);
      expect(invitation?.email).toBe("lookup@example.com");
    });

    it("should return null for invalid token", async () => {
      mockGetConvexInvitationByToken.mockResolvedValue(null);

      const invitation = await getInvitationByToken("invalid_token_123");

      expect(invitation).toBeNull();
    });
  });

  describe("Invitation Acceptance", () => {
    it("should accept valid invitation", async () => {
      mockAcceptConvexInvitation.mockResolvedValue({
        workspaceId: TEST_WORKSPACE_ID,
      });

      const result = await acceptInvitation({
        token: nanoid(32),
        userId: "user_123",
      });

      expect(result.success).toBe(true);
      expect(result.workspaceId).toBe(TEST_WORKSPACE_ID);
    });

    it("should reject already-used invitation", async () => {
      mockAcceptConvexInvitation.mockResolvedValue({
        error: "Invitation has already been accepted",
      });

      const result = await acceptInvitation({
        token: nanoid(32),
        userId: "user_123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already");
    });

    it("should reject expired invitation", async () => {
      mockAcceptConvexInvitation.mockRejectedValue(new Error("Invitation has expired"));

      const result = await acceptInvitation({
        token: nanoid(32),
        userId: "user_123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
    });
  });

  describe("Invitation Revocation", () => {
    it("should revoke pending invitation", async () => {
      const mockMutation = vi.fn().mockResolvedValue({ ok: true });
      vi.mocked(ConvexHttpClient).mockImplementation(() => ({
        query: vi.fn(),
        mutation: mockMutation,
      }) as unknown as ConvexHttpClient);

      const success = await revokeInvitation("invitation_id_123");
      expect(success).toBe(true);
    });

    it("should return false for non-existent invitation", async () => {
      const mockMutation = vi.fn().mockRejectedValue(new Error("Not found"));
      vi.mocked(ConvexHttpClient).mockImplementation(() => ({
        query: vi.fn(),
        mutation: mockMutation,
      }) as unknown as ConvexHttpClient);

      const success = await revokeInvitation("nonexistent_id");
      expect(success).toBe(false);
    });
  });

  describe("Workspace Invitations List", () => {
    it("should list pending invitations for workspace", async () => {
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      mockListConvexWorkspaceInvitations.mockResolvedValue([
        { _id: nanoid(), email: "list1@example.com", role: "member", token: nanoid(32), expiresAt, invitedBy: TEST_ADMIN_ID },
        { _id: nanoid(), email: "list2@example.com", role: "viewer", token: nanoid(32), expiresAt, invitedBy: TEST_ADMIN_ID },
      ]);

      const pendingInvitations = await getWorkspaceInvitations(TEST_WORKSPACE_ID);

      expect(pendingInvitations.length).toBeGreaterThanOrEqual(2);
      expect(pendingInvitations.some((i) => i.email === "list1@example.com")).toBe(true);
      expect(pendingInvitations.some((i) => i.email === "list2@example.com")).toBe(true);
    });
  });
});
