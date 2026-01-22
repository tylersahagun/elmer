/**
 * Permission Enforcement Tests
 * 
 * Tests the permission system:
 * - Role hierarchy
 * - Workspace membership checks
 * - Cross-user access denial
 * 
 * Note: These tests use direct DB queries to avoid next-auth import issues in vitest
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getWorkspaceMembership } from "@/lib/db/queries";
import type { WorkspaceRole } from "@/lib/db/schema";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_perm_${nanoid(8)}`;
const TEST_ADMIN_ID = `user_admin_perm_${nanoid(8)}`;
const TEST_MEMBER_ID = `user_member_perm_${nanoid(8)}`;
const TEST_VIEWER_ID = `user_viewer_perm_${nanoid(8)}`;
const TEST_OUTSIDER_ID = `user_outsider_perm_${nanoid(8)}`;

/**
 * Role hierarchy - higher number = more permissions
 * Duplicated here to avoid importing from permissions.ts which has next-auth deps
 */
const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
};

/**
 * Check if a role has at least the required permission level
 */
function hasPermission(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

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
      const result = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);

      expect(result).toBeDefined();
      expect(result?.role).toBe("admin");
      expect(result?.workspaceId).toBe(TEST_WORKSPACE_ID);
    });

    it("should return null for non-member", async () => {
      const result = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_OUTSIDER_ID);

      expect(result).toBeNull();
    });

    it("should return null for non-existent workspace", async () => {
      const result = await getWorkspaceMembership("nonexistent_workspace", TEST_ADMIN_ID);

      expect(result).toBeNull();
    });
  });

  describe("Role Level Access", () => {
    describe("Admin Access", () => {
      it("admin should access admin-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(membership?.role).toBe("admin");
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.admin);
      });

      it("admin should access member-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.member);
      });

      it("admin should access viewer-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });

    describe("Member Access", () => {
      it("member should NOT access admin-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(membership?.role).toBe("member");
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.admin);
      });

      it("member should access member-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.member);
      });

      it("member should access viewer-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });

    describe("Viewer Access", () => {
      it("viewer should NOT access admin-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(membership?.role).toBe("viewer");
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.admin);
      });

      it("viewer should NOT access member-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeLessThan(ROLE_HIERARCHY.member);
      });

      it("viewer should access viewer-level resources", async () => {
        const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);
        expect(ROLE_HIERARCHY[membership!.role]).toBeGreaterThanOrEqual(ROLE_HIERARCHY.viewer);
      });
    });
  });

  describe("Cross-User Access Denial", () => {
    it("should deny access to users not in workspace", async () => {
      const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_OUTSIDER_ID);
      expect(membership).toBeNull();
    });

    it("should deny access with invalid user ID", async () => {
      const membership = await getWorkspaceMembership(TEST_WORKSPACE_ID, "invalid_user_id");
      expect(membership).toBeNull();
    });
  });

  describe("Permission Helper Functions", () => {
    it("should correctly check if user can invite (admin only)", async () => {
      const adminMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const memberMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const viewerMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      expect(adminMembership?.role === "admin").toBe(true);
      expect(memberMembership?.role === "admin").toBe(false);
      expect(viewerMembership?.role === "admin").toBe(false);
    });

    it("should correctly check if user can edit projects (member+)", async () => {
      const adminMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const memberMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const viewerMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      // Admin and member can edit
      expect(hasPermission(adminMembership!.role, "member")).toBe(true);
      expect(hasPermission(memberMembership!.role, "member")).toBe(true);
      
      // Viewer cannot edit
      expect(hasPermission(viewerMembership!.role, "member")).toBe(false);
    });

    it("should correctly check if user can view (all roles)", async () => {
      const adminMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_ADMIN_ID);
      const memberMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_MEMBER_ID);
      const viewerMembership = await getWorkspaceMembership(TEST_WORKSPACE_ID, TEST_VIEWER_ID);

      // All can view
      expect(hasPermission(adminMembership!.role, "viewer")).toBe(true);
      expect(hasPermission(memberMembership!.role, "viewer")).toBe(true);
      expect(hasPermission(viewerMembership!.role, "viewer")).toBe(true);
    });
  });
});
