import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages";
import { createProject } from "../fixtures/projects";
import { cleanupSeededData } from "../fixtures/jobs";

test.describe("Project and task flows", () => {
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

  test("seeded project deep link renders the project detail page", async ({
    page,
    request,
  }) => {
    seedTag = `project-${Date.now()}`;
    const project = await createProject(request, workspaceId, seedTag);

    await page.goto(`/projects/${project.id}`);

    await expect(page).toHaveURL(new RegExp(`/projects/${project.id}$`));
    await expect(page.getByText(project.name, { exact: true }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace tasks can create and complete a task", async ({ page }) => {
    const taskTitle = `[task-${Date.now()}] E2E task`;

    await page.goto(`/workspace/${workspaceId}/tasks`);
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();

    await page.getByTestId("new-task-button").click();
    await page.getByTestId("task-title-input").fill(taskTitle);
    await page.getByTestId("add-task-submit").click();

    const taskRow = page.getByTestId("task-row").filter({ hasText: taskTitle });
    await expect(taskRow).toBeVisible();

    await taskRow.getByTestId("toggle-task-status").click();
    await expect(taskRow.getByText(taskTitle)).toHaveClass(/line-through/);
    await taskRow.getByTestId("remove-task").click();
    await expect(taskRow).toHaveCount(0);
  });
});
