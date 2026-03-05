import { type Page, type Locator, expect } from "@playwright/test";

export class SignalInboxPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(workspaceId: string) {
    await this.page.goto(`/workspace/${workspaceId}/inbox`);
    await this.page.waitForLoadState("networkidle");
  }

  async getSignalCount(): Promise<number> {
    const cards = this.page.locator("[data-testid='signal-card'], [data-testid='inbox-item']");
    return cards.count();
  }

  async openSignal(titleOrIndex: string | number) {
    if (typeof titleOrIndex === "string") {
      await this.page.getByText(titleOrIndex).first().click();
    } else {
      const cards = this.page.locator("[data-testid='signal-card'], [data-testid='inbox-item']");
      await cards.nth(titleOrIndex).click();
    }
  }

  async getImpactBadgeColor(index = 0): Promise<string | null> {
    const badge = this.page
      .locator("[data-testid='impact-badge'], [class*='impact']")
      .nth(index);
    return badge.getAttribute("data-impact-level");
  }

  async clickReviewImpact() {
    await this.page.getByRole("button", { name: /review impact/i }).click();
  }

  async acceptDirectionChange() {
    await this.page.getByRole("button", { name: /accept/i }).click();
  }

  async ignoreDirectionChange() {
    await this.page.getByRole("button", { name: /ignore/i }).click();
  }
}
