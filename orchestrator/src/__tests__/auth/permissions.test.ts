/**
 * Permission Enforcement Tests
 * 
 * Tests the permission system:
 * - requireWorkspaceAccess helper
 * - Cross-user access denial
 * - Role hierarchy enforcement
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  checkWorkspaceAccess,
  ROLE_HIERARCHY,
  type WorkspaceRole,
} from "@/lib/permissions";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_perm_${nanoid(8)}`;
const TEST_ADMIN_ID = `user_admin_perm_${nanoid(8)}`;
const TEST_MEMBER_ID = `user_member_perm_${nanoid(8)}`;
const TEST_VIEWER_ID = `user_viewer_perm_${nanoid(8)}`;
const TEST_OUTSIDER_ID = `user_outsider_perm_${nanoid(8)}`;

describe("Permission Enforcement Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Permission Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create test users
    const testUsers = [
      { id: TEST_ADMIN_ID, email: `admin_perm_${nanoid(8)}@example.com`, name: "Admin User" },
      { id: TEST_MEMBER_ID, email: `member_perm_${nanoid(8)}@example.com`, name: "Member User" },
      { id: TEST_VIEWER_ID, email: `viewer_perm_${nanoid(8)}@example.com`, name: "Viewer User" },
      { id: TEST_OUTSIDER_ID, email: `outsider_perm_${nanoid(8)}@example.com`, name: "Outsider User" },
    ];

    for (const user of testUsers) {
      await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create memberships
    await db.insert(workspaceMembers).values([
      { id: nanoid(), workspaceId: TEST_WORKSPACE_ID, userId: TEST_ADMIN_ID, role: "admin", joinedAt: new Date() },
      { id: nanoid(), workspaceId: TEST_WORKSPACE_ID, userId: TEST_MEMBER_ID, role: "member", joinedAt: new Date() },
      { id: nanoid(), workspaceId: TEST_WORKSPACE_ID, userId: TEST_VIEWER_ID, role: "viewer", joinedAt: new Date() },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
    await db.delete(users).where(eq(users.id, TEST_ADMIN_ID));
    await db.delete(users).where(eq(users.id, TEST_MEMBER_ID));
    await db.delete(users).where(eq(users.id, TEST_VIEWER_ID));
    await db.delete(users).where(eq(users.id, TEST_OUTSIDER_ID));
  });

  describe("Role Hierarchy", () => {
    it("should define correct role hierarchy", () => {
      expect(ROLE_HIERARCHY.admin).toBe(3);
      expect(ROLE_HIERARCHY.member).toBe(2);
      expect(ROLE_HIERARCHY.viewer).toBe(1);
    });

    it("should have admin > member > viewer", () => {
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.member);
      expect(ROLE_HIERARCHY.member).toBeGreaterThan(ROLE_HIERARCHY.viewer);
    });
  });

  describe("Workspace Access Check", () => {
    it("should return membership for valid user", async () => {
      const result = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);

      expect(result).toBeDefined();
      expect(result?.role).toBe("admin");
      expect(result?.userId).toBe(TEST_ADMIN_ID);
      expect(result?.workspaceId).toBe(TEST_WORKSPACE_ID);
    });

    it("should return null for non-member", async () => {
      const result = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_OUTSIDER_ID);

      expect(result).toBeNull();
    });

    it("should return null for non-existent workspace", async () => {
      const result = await checkWorkspaceAccess("nonexistent_workspace", TEST_ADMIN_ID);

      expect(result).toBeNull();
    });
  });

  describe("Role Level Access", () => {
    describe("Admin Access", () => {
      it("admin should access admin-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(membership?.role).toBe("admin");
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.admin);
      });

      it("admin should access member-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.member);
      });

      it("admin should access viewer-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });

    describe("Member Access", () => {
      it("member should NOT access admin-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(membership?.role).toBe("member");
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.admin);
      });

      it("member should access member-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.member);
      });

      it("member should access viewer-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });

    describe("Viewer Access", () => {
      it("viewer should NOT access admin-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(membership?.role).toBe("viewer");
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.admin);
      });

      it("viewer should NOT access member-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.member);
      });

      it("viewer should access viewer-level resources", async () => {
        const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });
  });

  describe("Cross-User Access Denial", () => {
    it("should deny access to users not in workspace", async () => {
      const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_OUTSIDER_ID);
      expect(membership).toBeNull();
    });

    it("should deny access with invalid user ID", async () => {
      const membership = await checkWorkspaceAccess(TEST_WORKSPACE_ID, "invalid_user_id");
      expect(membership).toBeNull();
    });
  });

  describe("Permission Helper Functions", () => {
    it("should correctly check if user can invite (admin only)", async () => {
      const canAdminInvite = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const canMemberInvite = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const canViewerInvite = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      expect(canAdminInvite?.role === "admin").toBe(true);
      expect(canMemberInvite?.role === "admin").toBe(false);
      expect(canViewerInvite?.role === "admin").toBe(false);
    });

    it("should correctly check if user can edit projects (member+)", async () => {
      const adminAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const memberAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const viewerAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      // Admin and member can edit
      expect(ROLE_HIERARCHY[adminAccess!.role] >= ROLE_HIERARCHY.member).toBe(true);
      expect(ROLE_HIERARCHY[memberAccess!.role] >= ROLE_HIERARCHY.member).toBe(true);
      
      // Viewer cannot edit
      expect(ROLE_HIERARCHY[viewerAccess!.role] >= ROLE_HIERARCHY.member).toBe(false);
    });

    it("should correctly check if user can view (all roles)", async () => {
      const adminAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const memberAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const viewerAccess = await checkWorkspaceAccess(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      // All can view
      expect(ROLE_HIERARCHY[adminAccess!.role] >= ROLE_HIERARCHY.viewer).toBe(true);
      expect(ROLE_HIERARCHY[memberAccess!.role] >= ROLE_HIERARCHY.viewer).toBe(true);
      expect(ROLE_HIERARCHY[viewerAccess!.role] >= ROLE_HIERARCHY.viewer).toBe(true);
    });
  });
});
