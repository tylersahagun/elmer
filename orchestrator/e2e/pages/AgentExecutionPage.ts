import { expect, type Page, type Locator } from "@playwright/test";

export class AgentExecutionPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(workspaceId: string) {
    const path = `/workspace/${workspaceId}/agents`;
    try {
      await this.page.goto(path, {
        waitUntil: "domcontentloaded",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/ERR_ABORTED|frame was detached/i.test(message)) {
        throw error;
      }

      await expect
        .poll(() => this.page.url(), { timeout: 10_000 })
        .toContain(path);
    }
  }

  async gotoTrace(workspaceId: string, jobId: string) {
    const path = `/workspace/${workspaceId}/agents/${jobId}`;
    try {
      await this.page.goto(path, {
        waitUntil: "domcontentloaded",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/ERR_ABORTED|frame was detached/i.test(message)) {
        throw error;
      }

      await expect
        .poll(() => this.page.url(), { timeout: 10_000 })
        .toContain(path);
    }
  }

  traceRoot(): Locator {
    return this.page
      .locator('[data-testid="agent-trace-page"], [data-testid="agent-trace-root"]')
      .first();
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
