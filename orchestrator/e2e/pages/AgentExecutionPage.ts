import { type Page, type Locator } from "@playwright/test";

export class AgentExecutionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(workspaceId: string) {
    await this.page.goto(`/workspace/${workspaceId}/agents`);
    await this.page.waitForLoadState("networkidle");
  }

  async gotoTrace(workspaceId: string, jobId: string) {
    await this.page.goto(`/workspace/${workspaceId}/agents/${jobId}`);
  }

  traceRoot(): Locator {
    return this.page.locator(
      '[data-testid="agent-trace-page"], [data-testid="agent-trace-root"]',
    );
  }

  executionPanel(): Locator {
    return this.page.locator(
      '[data-testid="execution-panel"], [data-testid="agent-execution-panel"]',
    );
  }

  executionLogs(): Locator {
    return this.page.locator(
      '[data-testid="execution-log-list"], [data-testid="execution-logs"]',
    );
  }

  executionOutput(): Locator {
    return this.page.getByTestId("execution-output");
  }

  async getActiveJobCount(): Promise<number> {
    const jobs = this.page.locator("[data-testid='agent-card'][data-status='running'], [data-testid='agent-card'][data-status='waiting_input']");
    return jobs.count();
  }

  async getHITLBannerCount(): Promise<number> {
    return this.page.locator("[data-testid='hitl-banner'], [data-testid='pending-question']").count();
  }

  async answerHITLQuestion(answer: string) {
    const input = this.page.locator("[data-testid='hitl-input'], textarea[placeholder*='answer']");
    await input.fill(answer);
    await this.page.getByRole("button", { name: /submit|answer|reply/i }).click();
  }

  async waitForJobStatus(status: "completed" | "failed" | "waiting_input", timeout = 30_000) {
    await this.page.waitForSelector(
      `[data-testid='agent-card'][data-status='${status}']`,
      { timeout }
    );
  }
}
