import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { WorkspacePage, type WorkspaceRoute } from "../pages";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

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

  const routeCoverage: Array<{
    route: Exclude<WorkspaceRoute, "dashboard">;
    label: string;
  }> = [
    { route: "agents", label: "Agent Hub" },
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
