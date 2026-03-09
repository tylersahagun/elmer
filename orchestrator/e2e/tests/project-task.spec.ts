import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages";
import { createProject, seedProjectDocument } from "../fixtures/projects";
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

    await page.goto(`/projects/${project.id}`, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(
      new RegExp(`/(workspace/${workspaceId}/)?projects/${project.id}$`),
    );
    await expect(page.getByText(project.name, { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace tasks can create and complete a task", async ({ page }) => {
    const taskTitle = `[task-${Date.now()}] E2E task`;

    await page.goto(`/workspace/${workspaceId}/tasks`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible({
      timeout: 30_000,
    });

    await expect(page.getByTestId("task-title-input")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("task-title-input").fill(taskTitle);
    await expect(page.getByTestId("task-title-input")).toHaveValue(taskTitle);
    await expect(page.getByTestId("add-task-submit")).toBeEnabled({
      timeout: 30_000,
    });
    await page.getByTestId("add-task-submit").click();

    const taskRow = page.getByTestId("task-row").filter({ hasText: taskTitle });
    await expect(taskRow).toBeVisible({ timeout: 30_000 });

    await taskRow.getByTestId("toggle-task-status").click();
    await expect
      .poll(() => taskRow.getAttribute("data-status"))
      .toBe("done");
    await page
      .getByTestId("task-row")
      .filter({ hasText: taskTitle })
      .getByTestId("remove-task")
      .first()
      .click();
    await expect(taskRow).toHaveCount(0);
  });

  test("project detail tasks can create and complete a task", async ({
    page,
    request,
  }) => {
    seedTag = `project-detail-task-${Date.now()}`;
    const project = await createProject(request, workspaceId, seedTag);
    const taskTitle = `[${seedTag}] Project detail task`;

    await page.goto(`/projects/${project.id}?tab=tasks`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).not.toContainText("Loading project...", {
      timeout: 30_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/(workspace/${workspaceId}/)?projects/${project.id}\\?tab=tasks$`),
    );
    await page.getByTestId("new-task-button").click();
    await page.getByTestId("task-title-input").fill(taskTitle);
    await expect(page.getByTestId("task-title-input")).toHaveValue(taskTitle);
    await expect(page.getByTestId("add-task-submit")).toBeEnabled({
      timeout: 30_000,
    });
    await page.getByTestId("add-task-submit").click();

    const taskRow = page.getByTestId("task-row").filter({ hasText: taskTitle });
    await expect(taskRow).toBeVisible({ timeout: 30_000 });

    await taskRow.getByTestId("toggle-task-status").click();
    await expect
      .poll(async () => {
        const row = page.getByTestId("task-row").filter({ hasText: taskTitle }).first();
        return (await row.textContent())?.includes(taskTitle) ?? false;
      })
      .toBe(true);
    await page
      .getByTestId("task-row")
      .filter({ hasText: taskTitle })
      .getByTestId("remove-task")
      .first()
      .click();
    await expect(taskRow).toHaveCount(0);
  });

  test("project detail documents can edit and persist seeded content", async ({
    page,
    request,
  }) => {
    seedTag = `project-doc-${Date.now()}`;
    const project = await createProject(request, workspaceId, seedTag);
    const documentTitle = `[${seedTag}] Seeded PRD`;
    const updatedContent = `# [${seedTag}] Updated PRD\n\nEditor update for ${seedTag}.`;

    await seedProjectDocument(request, workspaceId, project.id, seedTag, {
      title: documentTitle,
      content: `# [${seedTag}] Seeded PRD\n\nInitial document content for ${seedTag}.`,
    });

    await page.goto(`/projects/${project.id}?tab=documents`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("body")).not.toContainText("Loading project...", {
      timeout: 30_000,
    });
    await expect(page).toHaveURL(
      new RegExp(`/(workspace/${workspaceId}/)?projects/${project.id}\\?tab=documents$`),
    );
    await expect(page.getByTestId("document-viewer")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(documentTitle, { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("edit-document-button").click();
    const editor = page
      .getByTestId("rich-text-editor-content")
      .locator('[contenteditable="true"]')
      .first();
    await editor.fill(updatedContent);
    await page.getByTestId("save-document-button").click();

    await expect(page.getByTestId("document-preview")).toContainText(
      `Editor update for ${seedTag}.`,
    );

    await page.reload();
    await expect(page.getByTestId("document-preview")).toContainText(
      `Editor update for ${seedTag}.`,
    );
  });
});
