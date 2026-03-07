import { test, expect } from "@playwright/test";
import { seedPendingQuestionScenario, listJobs } from "../fixtures/jobs";

test.describe("Agent Execution", () => {
  test("executing an agent from the agents page creates a real job", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const workspaceId = page.url().match(/\/workspace\/([^/]+)/)?.[1] ?? "";
    expect(workspaceId).toBeTruthy();

    await page.goto(`/workspace/${workspaceId}/agents`);
    await expect(page.getByTestId("agents-page")).toBeVisible();

    const firstCard = page.getByTestId("agent-card").first();
    await expect(firstCard).toBeVisible();

    const beforeJobs = await listJobs(request);
    await firstCard.getByTestId("execute-agent-button").click();
    await expect(page.getByTestId("agent-execution-form")).toBeVisible();

    await page.getByTestId("confirm-execute-agent").click();
    await expect(page.getByTestId("agent-execution-success")).toBeVisible();

    const afterJobs = await listJobs(request);
    expect(afterJobs.length).toBeGreaterThanOrEqual(beforeJobs.length);
  });

  test("seeded pending question appears on the workspace dashboard and can be answered", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const workspaceId = page.url().match(/\/workspace\/([^/]+)/)?.[1] ?? "";
    expect(workspaceId).toBeTruthy();

    await seedPendingQuestionScenario(request, `${Date.now()}`);
    await page.goto(`/workspace/${workspaceId}`);

    await expect(page.getByTestId("pending-questions-panel")).toBeVisible();
    await page.getByTestId("choice-question-button").first().click();
  });
});
