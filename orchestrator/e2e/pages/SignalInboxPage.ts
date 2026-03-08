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
    const cards = this.page.locator("[data-testid='inbox-item']");
    return cards.count();
  }

  signalCard(title: string): Locator {
    return this.page.locator("[data-testid='inbox-item']").filter({
      hasText: title,
    });
  }

  async openSignal(titleOrIndex: string | number) {
    if (typeof titleOrIndex === "string") {
      await this.page.getByText(titleOrIndex).first().click();
    } else {
      const cards = this.page.locator("[data-testid='inbox-item']");
      await cards.nth(titleOrIndex).click();
    }
  }

  async getImpactBadgeColor(index = 0): Promise<string | null> {
    const badge = this.page
      .locator("[data-testid='impact-badge']")
      .nth(index);
    return badge.getAttribute("data-impact-level");
  }

  async clickReviewImpact() {
    await this.page.getByRole("button", { name: /review impact/i }).click();
  }

  async openLinkedProject(title: string) {
    await this.signalCard(title)
      .locator("button")
      .filter({ hasText: /E2E project/ })
      .first()
      .click();
  }

  async acceptDirectionChange() {
    await this.page.getByRole("button", { name: /accept/i }).click();
  }

  async ignoreDirectionChange() {
    await this.page.getByRole("button", { name: /ignore/i }).click();
  }
}
