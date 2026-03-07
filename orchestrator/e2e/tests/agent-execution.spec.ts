import { test, expect } from "@playwright/test";
import { AgentExecutionPage, WorkspacePage } from "../pages";
import { cleanupSeededData, getJob, seedStubAgentRun } from "../fixtures/jobs";

test.describe("Agent execution", () => {
  let workspaceId: string;
  let seedTag: string | null = null;

  test.beforeEach(async ({ page }) => {
    const workspace = new WorkspacePage(page);
    workspaceId = await workspace.openWorkspace(process.env.E2E_WORKSPACE_ID);
    expect(workspaceId).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    if (!seedTag) return;
    await cleanupSeededData(request, workspaceId, seedTag);
    seedTag = null;
  });

  test("seeded HITL approval completes deterministically and exposes a trace", async ({
    page,
    request,
  }) => {
    seedTag = `agent-${Date.now()}`;
    const execution = await seedStubAgentRun(request, workspaceId, seedTag, {
      projectName: `[${seedTag}] Agent approval project`,
    });

    await page.goto(`/projects/${execution.projectId}`);

    const approvals = page.getByTestId("project-pending-approvals");
    await expect(approvals).toBeVisible();
    await expect(approvals).toContainText(seedTag);

    const pendingCard = page.getByTestId("project-pending-approval-card").filter({
      hasText: seedTag,
    });
    await expect(pendingCard).toBeVisible();
    await pendingCard.getByTestId("approve-pending-question").click();

    await expect.poll(async () => {
      const payload = await getJob(request, execution.jobId);
      return payload.job.status;
    }, {
      timeout: 30_000,
      intervals: [500, 1000, 2000],
    }).toBe("completed");

    await expect(pendingCard).toHaveCount(0, { timeout: 15_000 });

    const trace = new AgentExecutionPage(page);
    await trace.gotoTrace(workspaceId, execution.jobId);
    await expect(trace.traceRoot()).toBeVisible();
    await expect(trace.executionPanel()).toBeVisible();
    await expect(trace.executionLogs()).toContainText(
      "Stub HITL scenario seeded for deterministic E2E validation",
    );
    await expect(trace.executionLogs()).toContainText(
      "Completed after deterministic HITL approval",
    );
    await expect(trace.executionOutput()).toContainText(
      "Deterministic HITL stub completed successfully",
    );
  });
});
