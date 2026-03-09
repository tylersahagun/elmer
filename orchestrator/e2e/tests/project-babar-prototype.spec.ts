import { test, expect } from "@playwright/test";

test.describe("Project Babar prototype route", () => {
  test("renders the public prototype and supports the trust-gated share flow", async ({
    browser,
  }) => {
    const freshContext = await browser.newContext({ storageState: undefined });
    const page = await freshContext.newPage();

    await page.goto("/prototype/project-babar", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/prototype\/project-babar$/);
    await expect(page.getByTestId("project-babar-prototype")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /A clickable Project Babar prototype built from the active Meeting Summary brief\./,
      }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText("500");

    await page.getByTestId("view-inline-chat").click();
    await expect(page.getByText("Inline learning agent", { exact: true })).toBeVisible();

    await page
      .getByTestId("prototype-prompt-input")
      .fill("Focus this summary on risks for leadership review.");
    await page.getByTestId("prototype-apply-prompt").click();

    await expect(page.getByText("Sales leader", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Open risks", { exact: true })).toBeVisible();

    await page.getByTestId("prototype-share-button").click();
    const confirmShare = page.getByTestId("prototype-share-confirm");
    await expect(confirmShare).toBeDisabled();

    await page.getByTestId("prototype-share-privacy").click();
    await expect(confirmShare).toBeEnabled();
    await confirmShare.click();

    await expect(page.getByTestId("prototype-share-success")).toBeVisible();

    await freshContext.close();
  });
});
