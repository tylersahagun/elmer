// @vitest-environment edge-runtime

import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../convex/schema";
import { api, internal } from "../../../convex/_generated/api";
import { buildStubJobInput } from "../../../convex/e2eHelpers";

const modules = import.meta.glob("../../../convex/**/*.{ts,js}");

function createBackend() {
  return convexTest(schema, modules);
}

async function seedWorkspace(t: ReturnType<typeof createBackend>) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("workspaces", {
      name: "E2E Workspace",
      slug: "e2e-workspace",
      settings: {},
    });
  });
}

async function seedProject(
  t: ReturnType<typeof createBackend>,
  workspaceId: string,
  seedTag: string,
) {
  return await t.run(async (ctx) => {
    return await ctx.db.insert("projects", {
      workspaceId: workspaceId as never,
      name: `[${seedTag}] Project`,
      description: "Seeded project",
      stage: "inbox",
      status: "on_track",
      priority: "P2",
      metadata: { e2eTag: seedTag },
    });
  });
}

describe("Convex stub agent execution", () => {
  it("runs and resumes the deterministic HITL stub path", async () => {
    const t = createBackend();
    const seedTag = "stub-run";
    const workspaceId = await seedWorkspace(t);
    const projectId = await seedProject(t, workspaceId, seedTag);

    const jobId = await t.run(async (ctx) => {
      return await ctx.db.insert("jobs", {
        workspaceId: workspaceId as never,
        projectId: projectId as never,
        type: "execute_agent_definition",
        status: "pending",
        input: buildStubJobInput(seedTag),
        output: null,
        attempt: 0,
        initiatedBy: "system",
        initiatedByName: "test",
        rootInitiator: "system",
        rootInitiatorName: "test",
      });
    });

    await t.action(internal.agents.run, { jobId });

    const waitingJob = await t.query(internal.mcp.getJob, { jobId });
    const initialLogs = await t.query(internal.mcp.getJobLogs, { jobId });
    const questions = await t.query(internal.pendingQuestions.getByJobInternal, {
      jobId,
    });
    const execution = await t.query(internal.agentExecutions.getByJobInternal, {
      jobId,
    });

    expect(waitingJob?.status).toBe("waiting_input");
    expect(questions).toHaveLength(1);
    expect(execution?.inputContext).toMatchObject({ seedTag });
    expect(initialLogs.map((log) => log.stepKey)).toEqual([
      "seeded",
      "planning",
      "awaiting_input",
    ]);

    vi.useFakeTimers();
    try {
      await t.withIdentity({ subject: "user-1" }).mutation(
        api.pendingQuestions.answer,
        {
          questionId: questions[0]._id,
          response: "approve",
        },
      );
      await t.finishAllScheduledFunctions(() => {
        vi.runAllTimers();
      });
    } finally {
      vi.useRealTimers();
    }

    const completedJob = await t.query(internal.mcp.getJob, { jobId });
    const completedLogs = await t.query(internal.mcp.getJobLogs, { jobId });
    const answeredQuestions = await t.query(
      internal.pendingQuestions.getByJobInternal,
      { jobId },
    );
    const completedExecution = await t.query(
      internal.agentExecutions.getByJobInternal,
      { jobId },
    );

    expect(completedJob?.status).toBe("completed");
    expect(completedJob?.output).toMatchObject({
      seedTag,
      response: "approve",
    });
    expect(answeredQuestions[0]?.status).toBe("answered");
    expect(completedExecution?.output).toMatchObject({
      seedTag,
      response: "approve",
    });
    expect(completedLogs.map((log) => log.stepKey)).toContain("completed");
  });

  it("cleans up tagged seeded documents, tasks, jobs, and projects", async () => {
    const t = createBackend();
    const seedTag = "cleanup-seed";
    const workspaceId = await seedWorkspace(t);
    const projectId = await seedProject(t, workspaceId, seedTag);

    const [documentId, taskId, jobId] = await t.run(async (ctx) => {
      const docId = await ctx.db.insert("documents", {
        workspaceId: workspaceId as never,
        projectId: projectId as never,
        type: "prd",
        title: `[${seedTag}] Seeded document`,
        content: `Seeded content for ${seedTag}`,
        version: 1,
        reviewStatus: "draft",
        generatedByAgent: "e2e-seed",
      });
      const createdTaskId = await ctx.db.insert("tasks", {
        workspaceId: workspaceId as never,
        projectId: projectId as never,
        title: `[${seedTag}] Seeded task`,
        status: "todo",
        createdBy: "agent",
      });
      const createdJobId = await ctx.db.insert("jobs", {
        workspaceId: workspaceId as never,
        projectId: projectId as never,
        type: "execute_agent_definition",
        status: "waiting_input",
        input: buildStubJobInput(seedTag),
        output: null,
        attempt: 0,
      });
      return [docId, createdTaskId, createdJobId];
    });

    const result = await t.mutation(internal.mcp.cleanupSeededData, {
      workspaceId,
      seedTag,
    });

    const cleanedProject = await t.query(internal.mcp.getProject, { projectId });
    const cleanedJob = await t.query(internal.mcp.getJob, { jobId });
    const cleanedDocument = await t.query(internal.mcp.getDocument, {
      documentId,
    });
    const cleanedTask = await t.run(async (ctx) => ctx.db.get(taskId as never));

    expect(result).toMatchObject({
      cleanedDocuments: 1,
      cleanedJobs: 1,
      cleanedProjects: 1,
      cleanedTasks: 1,
      seedTag,
    });
    expect(cleanedProject?.name).toContain(`[cleanup:${seedTag}]`);
    expect(cleanedJob?.status).toBe("cancelled");
    expect(cleanedDocument).toBeNull();
    expect(cleanedTask).toBeNull();
  });
});
