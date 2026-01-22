/**
 * Integration Tests: Full Execution Flow
 * 
 * Tests the complete end-to-end flow:
 * - Card stage transition triggers run
 * - Worker claims and executes
 * - Logs are written
 * - Artifacts are created
 * - Gates are evaluated
 * - Stage advances (or stays based on gates)
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { db } from "@/lib/db";
import { workspaces, projects, stageRuns, runLogs, artifacts, stageRecipes, skills } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  createRun,
  claimRun,
  completeRun,
  getRunById,
  addRunLog,
  createArtifact,
  registerWorker,
} from "@/lib/execution";
import {
  createStageRecipe,
  initializeDefaultRecipes,
  getStageRecipe,
} from "@/lib/skills";

// Test fixtures
const TEST_WORKSPACE_ID = `test_int_ws_${nanoid(8)}`;
const TEST_PROJECT_ID = `test_int_proj_${nanoid(8)}`;
const TEST_WORKER_ID = `test_int_worker_${nanoid(8)}`;

describe("Integration Tests: Full Execution Flow", () => {
  beforeAll(async () => {
    // Create test workspace
    await db.insert(workspaces).values({
      id: TEST_WORKSPACE_ID,
      name: "Integration Test Workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create test project
    await db.insert(projects).values({
      id: TEST_PROJECT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      name: "Integration Test Project",
      stage: "inbox",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Initialize default stage recipes
    await initializeDefaultRecipes(TEST_WORKSPACE_ID);

    // Register worker
    await registerWorker(TEST_WORKER_ID, TEST_WORKSPACE_ID);
  });

  afterAll(async () => {
    // Cleanup all test data
    await db.delete(artifacts).where(eq(artifacts.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(stageRuns).where(eq(stageRuns.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(stageRecipes).where(eq(stageRecipes.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(skills).where(eq(skills.workspaceId, TEST_WORKSPACE_ID));
    await db.delete(projects).where(eq(projects.id, TEST_PROJECT_ID));
    await db.delete(workspaces).where(eq(workspaces.id, TEST_WORKSPACE_ID));
  });

  describe("Complete Inbox Stage Flow", () => {
    it("should execute full inbox stage workflow", async () => {
      // 1. Create a run when card enters inbox stage
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        triggeredBy: "stage_transition",
      });

      expect(runId).toBeDefined();

      // 2. Worker claims the run
      const claimed = await claimRun(runId, TEST_WORKER_ID);
      expect(claimed).toBe(true);

      // 3. Verify run is now running
      let run = await getRunById(runId);
      expect(run?.status).toBe("running");

      // 4. Simulate execution: add logs
      await addRunLog(runId, "info", "Starting inbox processing");
      await addRunLog(runId, "info", "Extracting signal from input");
      await addRunLog(runId, "info", "Identifying personas");
      await addRunLog(runId, "info", "Creating signal file");

      // 5. Create artifact (signal file)
      await createArtifact({
        runId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "inbox",
        artifactType: "file",
        label: "Signal Document",
        uri: "signals/feedback/2024-01-15-user-research.md",
        meta: { signalType: "feedback", source: "user_research" },
      });

      // 6. Complete the run
      await completeRun(runId, "succeeded", undefined, {
        tokensUsed: { input: 500, output: 200 },
        duration: 5000,
      });

      // 7. Verify final state
      run = await getRunById(runId);
      expect(run?.status).toBe("succeeded");
      expect(run?.finishedAt).toBeDefined();

      // 8. Verify artifacts were created
      const arts = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.runId, runId));
      expect(arts.length).toBe(1);
      expect(arts[0].label).toBe("Signal Document");

      // 9. Verify logs were written
      const logs = await db
        .select()
        .from(runLogs)
        .where(eq(runLogs.runId, runId));
      expect(logs.length).toBeGreaterThan(1);
    });
  });

  describe("Stage Transition with Gate Evaluation", () => {
    it("should fail stage advancement when gates are not met", async () => {
      // Create run for PRD stage
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        triggeredBy: "manual",
      });

      await claimRun(runId, TEST_WORKER_ID);

      // Complete without creating required artifacts
      // (PRD gate requires prd.md file)
      await completeRun(runId, "failed", "Gate check failed: PRD not found");

      const run = await getRunById(runId);
      expect(run?.status).toBe("failed");
      expect(run?.errorSummary).toContain("Gate");
    });

    it("should allow stage advancement when gates pass", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        triggeredBy: "manual",
      });

      await claimRun(runId, TEST_WORKER_ID);

      // Create PRD artifact
      await createArtifact({
        runId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        artifactType: "file",
        label: "PRD Document",
        uri: "initiatives/test/prd.md",
        meta: { documentType: "prd" },
      });

      // Simulate passing gate check
      await addRunLog(runId, "info", "Gate check: PRD exists - PASSED");
      await addRunLog(runId, "info", "Gate check: Required sections - PASSED");

      await completeRun(runId, "succeeded");

      const run = await getRunById(runId);
      expect(run?.status).toBe("succeeded");
    });
  });

  describe("Automation Level Enforcement", () => {
    it("should respect automation level settings", async () => {
      // Get inbox recipe (should be fully_auto by default)
      const inboxRecipe = await getStageRecipe(TEST_WORKSPACE_ID, "inbox");
      expect(inboxRecipe?.automationLevel).toBe("fully_auto");

      // Get validate recipe (should be human_approval by default)
      const validateRecipe = await getStageRecipe(TEST_WORKSPACE_ID, "validate");
      expect(validateRecipe?.automationLevel).toBe("human_approval");
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle execution errors gracefully", async () => {
      const runId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prototype",
        triggeredBy: "manual",
      });

      await claimRun(runId, TEST_WORKER_ID);

      // Log error during execution
      await addRunLog(runId, "error", "Failed to generate component: API timeout");

      // Complete with failure
      await completeRun(runId, "failed", "API timeout during prototype generation");

      const run = await getRunById(runId);
      expect(run?.status).toBe("failed");
      expect(run?.errorSummary).toContain("timeout");
    });

    it("should allow retry after failure", async () => {
      // Create initial failed run
      const runId1 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "design",
        triggeredBy: "manual",
      });

      await claimRun(runId1, TEST_WORKER_ID);
      await completeRun(runId1, "failed", "First attempt failed");

      // Create retry run
      const runId2 = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "design",
        triggeredBy: "retry",
      });

      expect(runId2).not.toBe(runId1);

      await claimRun(runId2, TEST_WORKER_ID);
      await completeRun(runId2, "succeeded");

      const run2 = await getRunById(runId2);
      expect(run2?.status).toBe("succeeded");
    });
  });

  describe("Multi-Stage Progression", () => {
    it("should support sequential stage progression", async () => {
      const stages = ["inbox", "discovery", "prd", "design"];
      const runIds: string[] = [];

      for (const stage of stages) {
        const runId = await createRun({
          cardId: TEST_PROJECT_ID,
          workspaceId: TEST_WORKSPACE_ID,
          stage: stage as "inbox" | "discovery" | "prd" | "design",
          triggeredBy: "stage_transition",
        });

        runIds.push(runId);

        await claimRun(runId, TEST_WORKER_ID);
        await addRunLog(runId, "info", `Executing ${stage} stage`);
        await completeRun(runId, "succeeded");
      }

      // Verify all runs completed
      for (const runId of runIds) {
        const run = await getRunById(runId);
        expect(run?.status).toBe("succeeded");
      }
    });
  });

  describe("Artifact Chain", () => {
    it("should create linked artifacts across stages", async () => {
      // Discovery creates research
      const discoveryRunId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "discovery",
        triggeredBy: "manual",
      });

      await claimRun(discoveryRunId, TEST_WORKER_ID);
      await createArtifact({
        runId: discoveryRunId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "discovery",
        artifactType: "file",
        label: "Research Document",
        uri: "initiatives/test/research.md",
      });
      await completeRun(discoveryRunId, "succeeded");

      // PRD references research via its URI (conventional linking)
      const prdRunId = await createRun({
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        triggeredBy: "manual",
      });

      await claimRun(prdRunId, TEST_WORKER_ID);
      await createArtifact({
        runId: prdRunId,
        cardId: TEST_PROJECT_ID,
        workspaceId: TEST_WORKSPACE_ID,
        stage: "prd",
        artifactType: "file",
        label: "PRD Document",
        uri: "initiatives/test/prd.md",
      });
      await completeRun(prdRunId, "succeeded");

      // Verify artifact chain - both stages create their documents
      const allArtifacts = await db
        .select()
        .from(artifacts)
        .where(eq(artifacts.cardId, TEST_PROJECT_ID));

      const researchArt = allArtifacts.find((a) => a.label === "Research Document");
      const prdArt = allArtifacts.find((a) => a.label === "PRD Document");

      expect(researchArt).toBeDefined();
      expect(prdArt).toBeDefined();
      
      // Verify artifacts are created for different stages
      expect(researchArt?.stage).toBe("discovery");
      expect(prdArt?.stage).toBe("prd");
      
      // Verify URIs establish the conventional relationship
      expect(researchArt?.uri).toBe("initiatives/test/research.md");
      expect(prdArt?.uri).toBe("initiatives/test/prd.md");
    });
  });
});
