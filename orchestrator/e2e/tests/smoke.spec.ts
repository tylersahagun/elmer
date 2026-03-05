import { test, expect } from "@playwright/test";

/**
 * Smoke tests — @smoke
 * Fast, broad validation that the app is up and all major routes load.
 * Runs post-deploy on Vercel production to catch regressions within 30s.
 */

test.describe("Smoke: Core routes @smoke", () => {
  test("workspace dashboard loads after auth", async ({ page }) => {
    await page.goto("/");
    // Should redirect to workspace, not login (auth storageState is active)
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/workspace\//);
  });

  test("workspace/agents renders Agent Hub", async ({ page }) => {
    await page.goto("/");
    const workspaceUrl = page.url();
    const wsId = workspaceUrl.match(/\/workspace\/([^/]+)/)?.[1];
    expect(wsId).toBeTruthy();

    await page.goto(`/workspace/${wsId}/agents`);
    await expect(page).not.toHaveURL(/\/login/);
    // Page title or key element should be present
    await expect(page.locator("h1, h2, [data-testid='agents-header']").first()).toBeVisible();
  });

  test("workspace/inbox renders Signal Inbox", async ({ page }) => {
    await page.goto("/");
    const wsId = page.url().match(/\/workspace\/([^/]+)/)?.[1];
    await page.goto(`/workspace/${wsId}/inbox`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace/signals renders signals table", async ({ page }) => {
    await page.goto("/");
    const wsId = page.url().match(/\/workspace\/([^/]+)/)?.[1];
    await page.goto(`/workspace/${wsId}/signals`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace/tasks renders tasks page", async ({ page }) => {
    await page.goto("/");
    const wsId = page.url().match(/\/workspace\/([^/]+)/)?.[1];
    await page.goto(`/workspace/${wsId}/tasks`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace/knowledgebase renders KB", async ({ page }) => {
    await page.goto("/");
    const wsId = page.url().match(/\/workspace\/([^/]+)/)?.[1];
    await page.goto(`/workspace/${wsId}/knowledgebase`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("workspace/settings renders settings", async ({ page }) => {
    await page.goto("/");
    const wsId = page.url().match(/\/workspace\/([^/]+)/)?.[1];
    await page.goto(`/workspace/${wsId}/settings`);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("unauthenticated request redirects to login", async ({ browser }) => {
    // Use a fresh context with NO storageState to simulate logged-out user
    const freshCtx = await browser.newContext({ storageState: undefined });
    const page = await freshCtx.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/login|\/sign-in/);
    await freshCtx.close();
  });
});
