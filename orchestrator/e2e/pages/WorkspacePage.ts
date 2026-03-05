import { type Page, type Locator } from "@playwright/test";

export class WorkspacePage {
  readonly page: Page;
  readonly nav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator("nav, [data-testid='sidebar']");
  }

  async goto(workspaceId: string) {
    await this.page.goto(`/workspace/${workspaceId}`);
  }

  async navigateTo(tab: "agents" | "inbox" | "signals" | "tasks" | "knowledgebase" | "settings") {
    await this.page.goto(`/workspace/${await this.getWorkspaceId()}/${tab}`);
  }

  async getWorkspaceId(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/\/workspace\/([^/]+)/);
    return match?.[1] ?? "";
  }

  async getTitle(): Promise<string | null> {
    return this.page.title();
  }
}
