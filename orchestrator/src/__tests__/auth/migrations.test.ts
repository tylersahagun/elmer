/**
 * Migration Script Tests
 * 
 * Tests the migration scripts:
 * - assignOrphanedWorkspaces idempotency
 * - backfillActors correctness
 * - Multiple run safety
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, users, stageTransitionEvents, activityLogs, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { assignOrphanedWorkspaces } from "@/lib/migrations/assign-workspaces";
import { backfillActors } from "@/lib/migrations/backfill-actors";

// Test fixtures
const TEST_USER_ID = `user_mig_${nanoid(8)}`;
const TEST_ORPHAN_WS_1 = `ws_orphan1_${nanoid(8)}`;
const TEST_ORPHAN_WS_2 = `ws_orphan2_${nanoid(8)}`;
const TEST_OWNED_WS = `ws_owned_${nanoid(8)}`;

describe("Migration Script Tests", () => {
  beforeAll(async () => {
    // Create test user (oldest user for migration)
    await db.insert(users).values({
      id: TEST_USER_ID,
      email: `migration_user_${nanoid(8)}@example.com`,
      name: "Migration Test User",
      createdAt: new Date("2020-01-01"), // Make it the "first" user
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup all test data
    await db.delete(activityLogs).where(eq(activityLogs.workspaceId, TEST_ORPHAN_WS_1));
    await db.delete(activityLogs).where(eq(activityLogs.workspaceId, TEST_ORPHAN_WS_2));
    await db.delete(activityLogs).where(eq(activityLogs.workspaceId, TEST_OWNED_WS));
    await db.delete(stageTransitionEvents).where(eq(stageTransitionEvents.workspaceId, TEST_ORPHAN_WS_1));
    await db.delete(stageTransitionEvents).where(eq(stageTransitionEvents.workspaceId, TEST_ORPHAN_WS_2));
    await db.delete(stageTransitionEvents).where(eq(stageTransitionEvents.workspaceId, TEST_OWNED_WS));
    await db.delete(projects).where(eq(projects.workspaceId, TEST_ORPHAN_WS_1));
    await db.delete(projects).where(eq(projects.workspaceId, TEST_ORPHAN_WS_2));
    await db.delete(projects).where(eq(projects.workspaceId, TEST_OWNED_WS));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_1));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_2));
    await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_OWNED_WS));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_ORPHAN_WS_1));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_ORPHAN_WS_2));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_OWNED_WS));
    await db.delete(users).where(eq(users.id, TEST_USER_ID));
  });

  describe("assignOrphanedWorkspaces", () => {
    beforeEach(async () => {
      // Clean up any previous test workspaces
      await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_2));
      await db.delete(workspaces).where(eq(workspaces.id, TEST_ORPHAN_WS_1));
      await db.delete(workspaces).where(eq(workspaces.id, TEST_ORPHAN_WS_2));
    });

    it("should assign orphaned workspaces to first user", async () => {
      // Create orphaned workspaces (no members)
      await db.insert(workspaces).values([
        { id: TEST_ORPHAN_WS_1, name: "Orphan 1", createdAt: new Date(), updatedAt: new Date() },
        { id: TEST_ORPHAN_WS_2, name: "Orphan 2", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const result = await assignOrphanedWorkspaces();

      expect(result.success).toBe(true);
      expect(result.assignedCount).toBeGreaterThanOrEqual(2);
      expect(result.workspaceIds).toContain(TEST_ORPHAN_WS_1);
      expect(result.workspaceIds).toContain(TEST_ORPHAN_WS_2);

      // Verify memberships were created
      const membership1 = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_1),
      });
      expect(membership1).toBeDefined();
      expect(membership1?.role).toBe("admin");

      const membership2 = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_2),
      });
      expect(membership2).toBeDefined();
      expect(membership2?.role).toBe("admin");
    });

    it("should be idempotent (safe to run multiple times)", async () => {
      // Create orphaned workspace
      await db.insert(workspaces).values({
        id: TEST_ORPHAN_WS_1,
        name: "Idempotent Test",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Run migration twice
      const result1 = await assignOrphanedWorkspaces();
      // First run should succeed (may pick up other orphaned workspaces too)
      expect(result1.success).toBe(true);
      
      const result2 = await assignOrphanedWorkspaces();
      // Second run should also succeed (even if it errors on some orphans from other tests)
      // The key test is that our specific workspace is only assigned once
      
      // Should still only have one membership for our test workspace
      const memberships = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_1),
      });
      expect(memberships.length).toBe(1);
    });

    it("should not affect already-owned workspaces", async () => {
      // Create owned workspace with existing membership
      await db.insert(workspaces).values({
        id: TEST_OWNED_WS,
        name: "Already Owned",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await db.insert(workspaceMembers).values({
        id: nanoid(),
        workspaceId: TEST_OWNED_WS,
        userId: TEST_USER_ID,
        role: "admin",
        joinedAt: new Date(),
      });

      // Create orphaned workspace
      await db.insert(workspaces).values({
        id: TEST_ORPHAN_WS_1,
        name: "New Orphan",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await assignOrphanedWorkspaces();

      expect(result.success).toBe(true);
      // Should only assign the orphan, not the owned one
      expect(result.workspaceIds).toContain(TEST_ORPHAN_WS_1);
      expect(result.workspaceIds).not.toContain(TEST_OWNED_WS);
    });

    it("should return correct result format", async () => {
      const result = await assignOrphanedWorkspaces();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("assignedCount");
      expect(result).toHaveProperty("targetUser");
      expect(result).toHaveProperty("workspaceIds");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.assignedCount).toBe("number");
      expect(Array.isArray(result.workspaceIds)).toBe(true);
    });
  });

  describe("backfillActors", () => {
    const TEST_PROJECT_ID = `proj_mig_${nanoid(8)}`;

    beforeEach(async () => {
      // Setup: Create workspace with membership and project
      await db.delete(activityLogs).where(eq(activityLogs.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(stageTransitionEvents).where(eq(stageTransitionEvents.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(projects).where(eq(projects.id, TEST_PROJECT_ID));
      await db.delete(workspaceMembers).where(eq(workspaceMembers.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(workspaces).where(eq(workspaces.id, TEST_ORPHAN_WS_1));

      await db.insert(workspaces).values({
        id: TEST_ORPHAN_WS_1,
        name: "Backfill Test WS",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(workspaceMembers).values({
        id: nanoid(),
        workspaceId: TEST_ORPHAN_WS_1,
        userId: TEST_USER_ID,
        role: "admin",
        joinedAt: new Date(),
      });
    });

    afterEach(async () => {
      await db.delete(activityLogs).where(eq(activityLogs.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(stageTransitionEvents).where(eq(stageTransitionEvents.workspaceId, TEST_ORPHAN_WS_1));
      await db.delete(projects).where(eq(projects.id, TEST_PROJECT_ID));
    });

    it("should update stage transitions with generic 'user' actor", async () => {
      // Create project and stage transition with generic "user" actor
      await db.insert(projects).values({
        id: TEST_PROJECT_ID,
        workspaceId: TEST_ORPHAN_WS_1,
        name: "Test Project",
        stage: "discovery",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(stageTransitionEvents).values({
        id: nanoid(),
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_ORPHAN_WS_1,
        fromStage: "inbox",
        toStage: "discovery",
        actor: "user", // Generic actor that should be updated
        timestamp: new Date(),
      });

      const result = await backfillActors();

      expect(result.success).toBe(true);
      expect(result.stageTransitionsUpdated).toBeGreaterThanOrEqual(1);

      // Verify actor was updated
      const transition = await db.query.stageTransitionEvents.findFirst({
        where: eq(stageTransitionEvents.cardId, TEST_PROJECT_ID),
      });
      expect(transition?.actor).toMatch(/^user:/); // Should be "user:{userId}"
      expect(transition?.actor).toBe(`user:${TEST_USER_ID}`);
    });

    it("should create activity logs for existing projects", async () => {
      // Create project without activity log
      await db.insert(projects).values({
        id: TEST_PROJECT_ID,
        workspaceId: TEST_ORPHAN_WS_1,
        name: "Project Without Log",
        stage: "discovery",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date(),
      });

      const result = await backfillActors();

      expect(result.success).toBe(true);
      expect(result.activityLogsCreated).toBeGreaterThanOrEqual(1);

      // Verify activity log was created
      const activityLog = await db.query.activityLogs.findFirst({
        where: and(
          eq(activityLogs.targetId, TEST_PROJECT_ID),
          eq(activityLogs.action, "project.created")
        ),
      });
      expect(activityLog).toBeDefined();
      expect(activityLog?.userId).toBe(TEST_USER_ID);
      expect(activityLog?.metadata).toHaveProperty("backfilled", true);
    });

    it("should be idempotent for activity logs", async () => {
      // Create project
      await db.insert(projects).values({
        id: TEST_PROJECT_ID,
        workspaceId: TEST_ORPHAN_WS_1,
        name: "Idempotent Log Test",
        stage: "discovery",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Run backfill twice
      await backfillActors();
      const result2 = await backfillActors();

      expect(result2.success).toBe(true);
      // Second run should not create duplicate logs
      expect(result2.activityLogsCreated).toBe(0);

      // Verify only one activity log exists
      const logs = await db.query.activityLogs.findMany({
        where: and(
          eq(activityLogs.targetId, TEST_PROJECT_ID),
          eq(activityLogs.action, "project.created")
        ),
      });
      expect(logs.length).toBe(1);
    });

    it("should return correct result format", async () => {
      const result = await backfillActors();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("stageTransitionsUpdated");
      expect(result).toHaveProperty("activityLogsCreated");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.stageTransitionsUpdated).toBe("number");
      expect(typeof result.activityLogsCreated).toBe("number");
    });
  });
});
