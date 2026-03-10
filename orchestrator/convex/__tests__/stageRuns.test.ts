/**
 * Contract Tests: Stage Runs (Convex)
 *
 * Tests the run lifecycle using convex-test:
 * - Run creation with idempotency
 * - Worker claiming (atomic, safe for parallel workers)
 * - Log writing
 * - Artifact creation
 * - Status transitions
 * - Heartbeat registration
 */

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

const modules = import.meta.glob("../**/*.ts");

async function setupWorkspace(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("workspaces", {
      name: `Test Workspace ${Date.now()}`,
      slug: `test-ws-${Date.now()}`,
      settings: {},
    });
  });
}

describe("Stage Runs — Convex contract tests", () => {
  it("creates a run and returns a stable ID", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_001",
      workspaceId: wsId,
      stage: "discovery",
      triggeredBy: "user_test",
    });

    expect(runId).toBeTruthy();

    const run = await at.query(api.stageRuns.get, { runId });
    expect(run).not.toBeNull();
    expect(run?.status).toBe("queued");
    expect(run?.cardId).toBe("card_001");
    expect(run?.stage).toBe("discovery");
  });

  it("returns existing run for same card+stage (idempotency)", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId1 = await at.mutation(api.stageRuns.create, {
      cardId: "card_002",
      workspaceId: wsId,
      stage: "define",
      triggeredBy: "system",
    });

    const runId2 = await at.mutation(api.stageRuns.create, {
      cardId: "card_002",
      workspaceId: wsId,
      stage: "define",
      triggeredBy: "system",
    });

    expect(runId1).toBe(runId2);
  });

  it("claim sets status to running atomically", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_003",
      workspaceId: wsId,
      stage: "build",
      triggeredBy: "system",
    });

    // claim mutation doesn't require auth (called by external worker)
    const claimedRun = await t.mutation(api.stageRuns.claim, {
      runId,
      workerId: "worker_001",
    });

    expect(claimedRun).not.toBeNull();

    const updatedRun = await at.query(api.stageRuns.get, { runId });
    expect(updatedRun?.status).toBe("running");
    expect(updatedRun?.claimedBy).toBe("worker_001");
  });

  it("second claim on running run returns null (safe parallel claim)", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_004",
      workspaceId: wsId,
      stage: "validate",
      triggeredBy: "system",
    });

    await t.mutation(api.stageRuns.claim, { runId, workerId: "worker_A" });

    const result = await t.mutation(api.stageRuns.claim, {
      runId,
      workerId: "worker_B",
    });
    expect(result).toBeNull();
  });

  it("complete marks run as succeeded", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_005",
      workspaceId: wsId,
      stage: "launch",
      triggeredBy: "user_abc",
    });

    await t.mutation(api.stageRuns.claim, { runId, workerId: "worker_001" });
    await t.mutation(api.stageRuns.complete, { runId, status: "succeeded" });

    const run = await at.query(api.stageRuns.get, { runId });
    expect(run?.status).toBe("succeeded");
    expect(run?.completedAt).toBeDefined();
  });

  it("adds run logs that can be queried", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_006",
      workspaceId: wsId,
      stage: "discovery",
      triggeredBy: "system",
    });

    await t.mutation(api.stageRuns.addLog, {
      runId,
      workspaceId: wsId,
      level: "info",
      message: "Starting discovery stage",
      stepKey: "start",
    });

    await t.mutation(api.stageRuns.addLog, {
      runId,
      workspaceId: wsId,
      level: "info",
      message: "Discovery complete",
      stepKey: "done",
    });

    const logs = await at.query(api.stageRuns.getLogs, { runId });
    expect(logs).toHaveLength(2);
    expect(logs[0].message).toBe("Starting discovery stage");
    expect(logs[1].stepKey).toBe("done");
  });

  it("adds artifacts that can be queried", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId = await at.mutation(api.stageRuns.create, {
      cardId: "card_007",
      workspaceId: wsId,
      stage: "build",
      triggeredBy: "system",
    });

    await t.mutation(api.stageRuns.addArtifact, {
      runId,
      workspaceId: wsId,
      cardId: "card_007",
      type: "document",
      content: "# PRD Content",
      metadata: { title: "Product Requirements" },
    });

    const artifacts = await at.query(api.stageRuns.getArtifacts, { runId });
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].type).toBe("document");
    expect(artifacts[0].content).toBe("# PRD Content");
  });

  it("listQueued returns only queued runs for a workspace", async () => {
    const t = convexTest(schema, modules);
    const at = t.withIdentity({ name: "test-user" });
    const wsId = await setupWorkspace(t);

    const runId1 = await at.mutation(api.stageRuns.create, {
      cardId: "card_008a",
      workspaceId: wsId,
      stage: "discovery",
      triggeredBy: "system",
    });
    await at.mutation(api.stageRuns.create, {
      cardId: "card_008b",
      workspaceId: wsId,
      stage: "define",
      triggeredBy: "system",
    });

    // Claim first run so it's running
    await t.mutation(api.stageRuns.claim, { runId: runId1, workerId: "worker_x" });

    const queued = await at.query(api.stageRuns.listQueued, {
      workspaceId: wsId,
    });

    // Only the second run should be queued
    expect(queued.length).toBe(1);
    expect(queued[0].cardId).toBe("card_008b");
  });
});
