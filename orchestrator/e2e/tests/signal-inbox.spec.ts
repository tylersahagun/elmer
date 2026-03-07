import { test, expect } from "@playwright/test";
import { SignalInboxPage } from "../pages";
import {
  seedDirectionChangeInboxItem,
  seedHighImpactInboxItem,
} from "../fixtures/inbox";

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

  test("seeded high-impact signal appears in the correct section", async ({
    page,
    request,
  }) => {
    const inbox = new SignalInboxPage(page);
    const suffix = `${Date.now()}`;
    const seeded = await seedHighImpactInboxItem(request, suffix);
    await inbox.goto(workspaceId);
    await expect(page.getByText(seeded.title)).toBeVisible();
    await expect(page.locator("[data-testid='high-impact-section']")).toContainText(
      seeded.title,
    );
  });

  test("seeded direction-change signal opens review panel and can be ignored", async ({
    page,
    request,
  }) => {
    const inbox = new SignalInboxPage(page);
    const suffix = `${Date.now()}`;
    const seeded = await seedDirectionChangeInboxItem(request, suffix);
    await inbox.goto(workspaceId);

    const seededCard = page.locator("[data-testid='inbox-item']").filter({
      hasText: seeded.title,
    });
    await expect(seededCard).toBeVisible();
    await seededCard.getByTestId("review-impact-button").click();

    await expect(page.getByTestId("review-impact-panel")).toBeVisible();
    await expect(page.getByTestId("review-impact-panel")).toContainText(
      "Seeded by Playwright to validate review-impact UX.",
    );
    await page.getByTestId("ignore-direction-change").click();
  });
});
