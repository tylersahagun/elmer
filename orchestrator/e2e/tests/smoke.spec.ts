import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { WorkspacePage, type WorkspaceRoute } from "../pages";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

test("unauthenticated /login renders Clerk sign-in @smoke", async ({
  browser,
}) => {
  const freshCtx = await browser.newContext({ storageState: undefined });
  const page = await freshCtx.newPage();

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("body")).not.toContainText("500");
  await expect(page.locator("body")).not.toContainText(
    "Runtime configuration error",
  );
  await expect(page.locator("body")).not.toContainText("Internal Server Error");

  await expect
    .poll(
      async () => {
        const emailFieldVisible = await page
          .locator(
            'input[type="email"], input[name="identifier"], input[name="emailAddress"]',
          )
          .first()
          .isVisible()
          .catch(() => false);
        const continueVisible = await page
          .getByRole("button", { name: /^Continue$/ })
          .isVisible()
          .catch(() => false);

        return emailFieldVisible || continueVisible;
      },
      { timeout: 30_000 },
    )
    .toBe(true);

  await freshCtx.close();
});

/**
 * Smoke tests — @smoke
 * Fast, broad validation that the app is up and all major routes load.
 * Runs post-deploy on Vercel production to catch regressions within 30s.
 */

test.describe("Smoke: Core routes @smoke", () => {
  let workspaceId: string;

  test.beforeEach(async ({ page }) => {
    const workspace = new WorkspacePage(page);
    workspaceId = await workspace.openWorkspace(process.env.E2E_WORKSPACE_ID);
    expect(workspaceId).toBeTruthy();
  });

  test("authenticated home opens the first workspace dashboard", async ({
    page,
  }) => {
    const workspace = new WorkspacePage(page);
    await workspace.expectRouteLoaded("dashboard");
  });

  test("project cockpit exposes the alpha operator loop", async ({ page }) => {
    const workspace = new WorkspacePage(page);
    await workspace.goto(workspaceId);
    await workspace.expectRouteLoaded("dashboard");
    await workspace.openFirstProject();

    await expect(
      page.getByRole("heading", { name: "Active Work", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Evidence status", { exact: true })).toBeVisible();
    await expect(page.getByText("Agent visibility", { exact: true })).toBeVisible();
    await expect(page.getByText("Human gates", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Internal alpha feedback", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /copy issue template/i }),
    ).toBeVisible();
  });

  const routeCoverage: Array<{
    route: Exclude<WorkspaceRoute, "dashboard">;
    label: string;
  }> = [
    { route: "agents", label: "Agent Catalog" },
    { route: "inbox", label: "Signal Inbox" },
    { route: "signals", label: "signals table" },
    { route: "tasks", label: "tasks page" },
    { route: "knowledgebase", label: "knowledge base" },
    { route: "settings", label: "settings" },
    { route: "personas", label: "personas page" },
    { route: "commands", label: "commands page" },
    { route: "onboarding", label: "onboarding route" },
  ];

  for (const { route, label } of routeCoverage) {
    test(`workspace/${route} renders ${label}`, async ({ page }) => {
      const workspace = new WorkspacePage(page);
      await workspace.navigateTo(route, workspaceId);
    });
  }

  test("unauthenticated home exposes sign-in entry points", async ({
    browser,
  }) => {
    // Use a fresh context with NO storageState to simulate logged-out user
    const freshCtx = await browser.newContext({ storageState: undefined });
    const page = await freshCtx.newPage();
    const workspace = new WorkspacePage(page);
    await workspace.gotoHome();
    await workspace.expectUnauthenticatedHome();
    await freshCtx.close();
  });
});
