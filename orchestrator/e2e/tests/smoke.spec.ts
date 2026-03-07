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
    await workspace.gotoHome();

    let homeState: "authenticated" | "unauthenticated" | "loading" = "loading";
    await expect
      .poll(
        async () => {
          if (await workspace.isAuthenticatedHomeReady()) {
            homeState = "authenticated";
            return homeState;
          }
          if (await workspace.isUnauthenticatedHomeReady()) {
            homeState = "unauthenticated";
            return homeState;
          }
          homeState = "loading";
          return homeState;
        },
        { timeout: 30_000 },
      )
      .not.toBe("loading");

    if (homeState === "unauthenticated") {
      const email = process.env.E2E_TEST_EMAIL;
      const password = process.env.E2E_TEST_PASSWORD;

      if (!email || !password) {
        throw new Error(
          "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local for smoke auth recovery",
        );
      }

      await workspace.signIn(email, password);
    }

    await workspace.expectAuthenticatedHome();
    workspaceId = await workspace.openFirstWorkspaceFromHome();
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
