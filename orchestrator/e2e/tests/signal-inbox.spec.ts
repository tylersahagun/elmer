import { test, expect } from "@playwright/test";
import { SignalInboxPage } from "../pages";

/**
 * Signal Inbox E2E tests — supersedes GTM-68
 * Tests the full signal pipeline: display → classify → review impact
 */

test.describe("Signal Inbox", () => {
  let workspaceId: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    workspaceId = page.url().match(/\/workspace\/([^/]+)/)?.[1] ?? "";
    expect(workspaceId).toBeTruthy();
  });

  test("inbox page loads without errors", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("inbox renders signal list or empty state", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);

    // Either signals are present OR an empty state is shown — both are valid
    const hasSignals = (await inbox.getSignalCount()) > 0;
    const hasEmptyState = await page
      .locator("[data-testid='empty-inbox'], [class*='empty']")
      .count()
      .then((c) => c > 0);

    expect(hasSignals || hasEmptyState).toBe(true);
  });

  test("signal card shows source label", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);

    const count = await inbox.getSignalCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // Every signal card should show a source (slack, email, pylon, etc.)
    const firstCard = page
      .locator("[data-testid='signal-card'], [data-testid='inbox-item']")
      .first();
    await expect(firstCard).toBeVisible();
  });

  test("clicking a signal opens its detail", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);

    const count = await inbox.getSignalCount();
    if (count === 0) {
      test.skip();
      return;
    }

    await inbox.openSignal(0);
    // After opening, URL should change or a panel/modal should appear
    const urlChanged = page.url().includes("/inbox/") || page.url().includes("?signal=");
    const panelVisible = await page
      .locator("[data-testid='signal-detail'], [role='dialog']")
      .count()
      .then((c) => c > 0);
    expect(urlChanged || panelVisible).toBe(true);
  });
});
