/**
 * Contract Tests: Run Lifecycle
 * 
 * Tests the complete lifecycle of stage runs:
 * - Run creation
 * - Worker claiming
 * - Log writing
 * - Artifact creation
 * - Status transitions
 * - Error handling
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { workspaces, projects, stageRuns, runLogs, artifacts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  createRun,
  retryRun,
  claimRun,
  completeRun,
  cancelRun,
  getRunById,
  getRunsForCard,
  getActiveRunForCard,
  addRunLog,
  getRunLogs,
  createArtifact,
  getArtifactsForRun,
  registerWorker,
  updateWorkerHeartbeat,
  hasActiveWorkers,
  rescueStuckRuns,
} from "@/lib/execution";

// Test fixtures
const TEST_WORKSPACE_ID = `test_ws_${nanoid(8)}`;
const TEST_PROJECT_ID = `test_proj_${nanoid(8)}`;
const TEST_WORKER_ID = `test_worker_${nanoid(8)}`;

describe("Run Lifecycle Contract Tests", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Test Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create test project
    await db.insert(projects).values({
      id: TEST_PROJECT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      name: "Test Project",
      stage: "inbox",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(projects).where(eq(projects.id, TEST_PROJECT_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
  });

  describe("Run Creation", () => {
    it("should create a run with queued status", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      expect(runId).toBeDefined();
      expect(runId).toMatch(/^run_/);

      const run = await getRunById(runId);
      expect(run).toBeDefined();
      expect(run?.status).toBe("queued");
      expect(run?.cardId).toBe(TEST_PROJECT_ID);
      expect(run?.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(run?.stage).toBe("inbox");
      expect(run?.attempt).toBe(1);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should prevent duplicate queued runs for same card+stage", async () => {
      const runId1 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      const runId2 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      // Should return existing run ID
      expect(runId2).toBe(runId1);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId1));
    });

    it("should generate unique idempotency keys", async () => {
      const runId1 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      // Complete first run
      await completeRun(runId1, "succeeded");

      // Create another run
      const runId2 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      // Should be different runs
      expect(runId2).not.toBe(runId1);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId1));
      await db.delete(stageRuns).where(eq(stageRuns.id, runId2));
    });
  });

  describe("Worker Claiming", () => {
    it("should allow worker to claim a queued run", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await registerWorker(TEST_WORKER_ID, TEST_WORKSPACE_ID);
      const claimed = await claimRun(runId, TEST_WORKER_ID);

      expect(claimed).toBe(true);

      const run = await getRunById(runId);
      expect(run?.status).toBe("running");
      expect(run?.startedAt).toBeDefined();

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should prevent double-claiming a run", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await registerWorker(TEST_WORKER_ID, TEST_WORKSPACE_ID);
      const claimed1 = await claimRun(runId, TEST_WORKER_ID);
      const claimed2 = await claimRun(runId, `${TEST_WORKER_ID}_2`);

      expect(claimed1).toBe(true);
      expect(claimed2).toBe(false);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });
  });

  describe("Run Completion", () => {
    it("should mark run as succeeded", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await claimRun(runId, TEST_WORKER_ID);
      await completeRun(runId, "succeeded", undefined, { tokensUsed: { input: 100, output: 50 } });

      const run = await getRunById(runId);
      expect(run?.status).toBe("succeeded");
      expect(run?.finishedAt).toBeDefined();
      expect((run?.metadata as Record<string, unknown>)?.tokensUsed).toEqual({ input: 100, output: 50 });

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should mark run as failed with error summary", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await claimRun(runId, TEST_WORKER_ID);
      await completeRun(runId, "failed", "API rate limit exceeded");

      const run = await getRunById(runId);
      expect(run?.status).toBe("failed");
      expect(run?.errorSummary).toBe("API rate limit exceeded");

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should allow retry of failed runs", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await claimRun(runId, TEST_WORKER_ID);
      await completeRun(runId, "failed", "Test error");

      const retryId = await retryRun(runId);
      expect(retryId).toBeDefined();
      expect(retryId).not.toBe(runId);

      const retryRun_ = await getRunById(retryId);
      expect(retryRun_?.status).toBe("queued");
      expect(retryRun_?.attempt).toBe(2);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
      await db.delete(stageRuns).where(eq(stageRuns.id, retryId));
    });
  });

  describe("Run Cancellation", () => {
    it("should cancel a queued run", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await cancelRun(runId, "User cancelled");

      const run = await getRunById(runId);
      expect(run?.status).toBe("cancelled");
      expect(run?.errorSummary).toBe("User cancelled");

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should cancel a running run", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await claimRun(runId, TEST_WORKER_ID);
      await cancelRun(runId, "Cancelled by test");

      const run = await getRunById(runId);
      expect(run?.status).toBe("cancelled");

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });
  });

  describe("Run Logs", () => {
    it("should write and retrieve logs", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await addRunLog(runId, "info", "Starting execution", "step1");
      await addRunLog(runId, "debug", "Processing data", "step2");
      await addRunLog(runId, "error", "Something went wrong", "step3", { errorCode: 123 });

      const logs = await getRunLogs(runId);
      expect(logs.length).toBe(4); // 3 + initial "Run queued" log
      expect(logs.some((l) => l.level === "info" && l.message.includes("Starting"))).toBe(true);
      expect(logs.some((l) => l.level === "error" && l.stepKey === "step3")).toBe(true);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });
  });

  describe("Artifacts", () => {
    it("should create and retrieve artifacts", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      const artifactId = await createArtifact({
        runId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        artifactType: "file",
        label: "Research Document",
        uri: "documents/research.md",
        meta: { documentType: "research" },
      });

      expect(artifactId).toBeDefined();

      const arts = await getArtifactsForRun(runId);
      expect(arts.length).toBe(1);
      expect(arts[0].label).toBe("Research Document");
      expect(arts[0].artifactType).toBe("file");

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });
  });

  describe("Worker Health", () => {
    it("should track worker heartbeats", async () => {
      await registerWorker(TEST_WORKER_ID, TEST_WORKSPACE_ID);
      await updateWorkerHeartbeat(TEST_WORKER_ID, "idle");

      const hasWorkers = await hasActiveWorkers(TEST_WORKSPACE_ID);
      expect(hasWorkers).toBe(true);
    });

    it("should rescue stuck runs", async () => {
      // Create a run and manually make it "stuck"
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      await claimRun(runId, TEST_WORKER_ID);

      // Manually set startedAt to be very old
      await db
        .update(stageRuns)
        .set({ startedAt: new Date(Date.now() - 600000) }) // 10 minutes ago
        .where(eq(stageRuns.id, runId));

      const rescued = await rescueStuckRuns();
      expect(rescued).toBeGreaterThanOrEqual(1);

      const run = await getRunById(runId);
      expect(run?.status).toBe("failed");

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });
  });

  describe("Active Run Queries", () => {
    it("should find active run for a card", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      const activeRun = await getActiveRunForCard(TEST_PROJECT_ID);
      expect(activeRun).toBeDefined();
      expect(activeRun?.id).toBe(runId);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId));
    });

    it("should return null if no active run", async () => {
      const activeRun = await getActiveRunForCard(TEST_PROJECT_ID);
      expect(activeRun).toBeNull();
    });

    it("should get run history for card", async () => {
      const runId1 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });
      await completeRun(runId1, "succeeded");

      const runId2 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "test",
      });

      const runs = await getRunsForCard(TEST_PROJECT_ID);
      expect(runs.length).toBe(2);

      // Cleanup
      await db.delete(stageRuns).where(eq(stageRuns.id, runId1));
      await db.delete(stageRuns).where(eq(stageRuns.id, runId2));
    });
  });
});
