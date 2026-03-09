import { test, expect } from "@playwright/test";
import { SignalInboxPage, WorkspacePage } from "../pages";
import {
  seedDirectionChangeInboxItem,
  seedHighImpactInboxItem,
} from "../fixtures/inbox";
import { cleanupSeededData } from "../fixtures/jobs";

/**
 * Signal Inbox E2E tests — supersedes GTM-68
 * Tests the full signal pipeline: display → classify → review impact
 */

test.describe("Signal Inbox", () => {
  let workspaceId: string;
  const cleanupTags = new Set<string>();

  test.beforeEach(async ({ page }) => {
    const workspace = new WorkspacePage(page);
    workspaceId = await workspace.openWorkspace(process.env.E2E_WORKSPACE_ID);
    expect(workspaceId).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    for (const seedTag of cleanupTags) {
      await cleanupSeededData(request, workspaceId, seedTag);
    }
    cleanupTags.clear();
  });

  test("inbox page loads without errors", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);
    await expect(page.getByTestId("inbox-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("body")).not.toContainText("Something went wrong");
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("inbox renders signal list or empty state", async ({ page }) => {
    const inbox = new SignalInboxPage(page);
    await inbox.goto(workspaceId);

    await expect
      .poll(async () => {
        const hasSignals = (await inbox.getSignalCount()) > 0;
        const hasEmptyState = await page
          .locator("[data-testid='empty-inbox'], [class*='empty']")
          .count()
          .then((c) => c > 0);
        return hasSignals || hasEmptyState;
      }, { timeout: 30_000 })
      .toBe(true);
  });

  test("seeded high-impact signal appears in the correct section", async ({
    page,
    request,
  }) => {
    const inbox = new SignalInboxPage(page);
    const seedTag = `signal-${Date.now()}`;
    cleanupTags.add(seedTag);
    const seeded = await seedHighImpactInboxItem(request, workspaceId, seedTag);
    await inbox.goto(workspaceId);
    await expect(page.getByText(seeded.title)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(`High-impact issue reported for ${seedTag}`)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator("[data-testid='high-impact-section']")).toContainText(
      seeded.title,
      { timeout: 30_000 },
    );
    await expect(
      inbox.signalCard(seeded.title).locator("[data-testid='impact-badge']"),
    ).toHaveAttribute("data-impact-level", "high");
  });

  test("seeded direction-change signal opens review panel and can be ignored", async ({
    page,
    request,
  }) => {
    const inbox = new SignalInboxPage(page);
    const seedTag = `direction-${Date.now()}`;
    cleanupTags.add(seedTag);
    const seeded = await seedDirectionChangeInboxItem(
      request,
      workspaceId,
      seedTag,
    );
    await inbox.goto(workspaceId);

    const seededCard = page.locator("[data-testid='inbox-item']").filter({
      hasText: seeded.title,
    });
    await expect(seededCard).toBeVisible({ timeout: 30_000 });
    await seededCard.getByTestId("review-impact-button").click();

    await expect(page.getByTestId("review-impact-panel")).toBeVisible();
    await expect(page.getByTestId("review-impact-panel")).toContainText(
      "Seeded by Playwright to validate review-impact UX.",
    );
    await page.getByTestId("ignore-direction-change").click();
  });

  test("seeded direction-change signal links back to the seeded project detail page", async ({
    page,
    request,
  }) => {
    const inbox = new SignalInboxPage(page);
    const seedTag = `direction-nav-${Date.now()}`;
    cleanupTags.add(seedTag);
    const seeded = await seedDirectionChangeInboxItem(
      request,
      workspaceId,
      seedTag,
    );

    await inbox.goto(workspaceId);
    await expect(inbox.signalCard(seeded.title)).toContainText(
      seeded.projectName,
      { timeout: 30_000 },
    );

    await inbox.openLinkedProject(seeded.title);

    await expect(page).toHaveURL(
      new RegExp(`/(workspace/${workspaceId}/)?projects/${seeded.projectId}$`),
    );
    await expect(page.getByText(seeded.projectName, { exact: true }).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
