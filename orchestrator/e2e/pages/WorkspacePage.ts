import { expect, type Page, type Locator } from "@playwright/test";

export type WorkspaceRoute =
  | "dashboard"
  | "agents"
  | "inbox"
  | "signals"
  | "tasks"
  | "knowledgebase"
  | "settings"
  | "personas"
  | "commands"
  | "onboarding";

export class WorkspacePage {
  readonly page: Page;
  readonly nav: Locator;
  readonly workspaceSelectorText: Locator;
  readonly firstWorkspaceButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator("nav, [data-testid='sidebar']");
    this.workspaceSelectorText = page.getByText(
      "Select a workspace or create a new one",
    );
    this.firstWorkspaceButton = page.getByRole("button", {
      name: "Create Your First Workspace",
    });
  }

  async gotoHome() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async goto(workspaceId: string) {
    await this.page.goto(`/workspace/${workspaceId}`);
  }

  async navigateTo(route: WorkspaceRoute, workspaceId?: string) {
    const resolvedWorkspaceId = workspaceId ?? (await this.getWorkspaceId());
    const path =
      route === "dashboard"
        ? `/workspace/${resolvedWorkspaceId}`
        : `/workspace/${resolvedWorkspaceId}/${route}`;
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
    await this.expectRouteLoaded(route);
  }

  async getWorkspaceId(): Promise<string> {
    const url = this.page.url();
    const match = url.match(/\/workspace\/([^/]+)/);
    return match?.[1] ?? "";
  }

  async getTitle(): Promise<string | null> {
    return this.page.title();
  }

  async expectAuthenticatedHome() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page.locator("body")).not.toContainText("500");
    await expect(this.page.locator("body")).not.toContainText(
      "Something went wrong",
    );
    await expect
      .poll(
        async () =>
          (await this.workspaceSelectorText.isVisible()) ||
          (await this.firstWorkspaceButton.isVisible()),
        { timeout: 30_000 },
      )
      .toBeTruthy();
  }

  async isAuthenticatedHomeReady() {
    return (
      (await this.workspaceSelectorText.isVisible().catch(() => false)) ||
      (await this.firstWorkspaceButton.isVisible().catch(() => false))
    );
  }

  async expectUnauthenticatedHome() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(
      this.page.getByRole("heading", { name: "PM Orchestrator" }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: /sign in/i }),
    ).toBeVisible();
  }

  async isUnauthenticatedHomeReady() {
    return (
      (await this.page
        .getByRole("heading", { name: "PM Orchestrator" })
        .isVisible()
        .catch(() => false)) &&
      (await this.page
        .getByRole("link", { name: /sign in/i })
        .isVisible()
        .catch(() => false))
    );
  }

  async signIn(email: string, password: string) {
    await this.page.goto("/login");
    await this.page
      .locator(
        'input[type="email"], input[name="identifier"], input[name="emailAddress"]',
      )
      .first()
      .fill(email);
    await this.page.getByRole("button", { name: /^Continue$/ }).click();
    await this.page
      .locator('input[name="password"], input[type="password"]')
      .first()
      .fill(password);
    await this.page.getByRole("button", { name: /^Continue$/ }).click();
    await expect
      .poll(() => this.page.url(), { timeout: 30_000 })
      .toMatch(/\/($|workspace\/)/);
  }

  async openWorkspace(preferredWorkspaceId?: string) {
    if (preferredWorkspaceId) {
      await this.goto(preferredWorkspaceId);
      if (!/\/login|\/sign-in/.test(this.page.url())) {
        await this.expectRouteLoaded("dashboard");
        return preferredWorkspaceId;
      }
    }

    await this.gotoHome();

    let homeState: "authenticated" | "unauthenticated" | "loading" = "loading";
    await expect
      .poll(
        async () => {
          if (await this.isAuthenticatedHomeReady()) {
            homeState = "authenticated";
            return homeState;
          }
          if (await this.isUnauthenticatedHomeReady()) {
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
          "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set to recover an expired Playwright session",
        );
      }

      await this.signIn(email, password);
    }

    if (preferredWorkspaceId) {
      await this.goto(preferredWorkspaceId);
      await this.expectRouteLoaded("dashboard");
      return preferredWorkspaceId;
    }

    await this.expectAuthenticatedHome();
    return await this.openFirstWorkspaceFromHome();
  }

  async openFirstWorkspaceFromHome() {
    const firstWorkspaceCard = this.page
      .locator("div.grid div.group.cursor-pointer.rounded-2xl")
      .first();

    await expect
      .poll(
        async () =>
          ((await firstWorkspaceCard.count()) > 0 &&
            (await firstWorkspaceCard.isVisible())) ||
          (await this.firstWorkspaceButton.isVisible()),
        { timeout: 30_000 },
      )
      .toBeTruthy();

    if (
      (await firstWorkspaceCard.count()) > 0 &&
      (await firstWorkspaceCard.isVisible())
    ) {
      await firstWorkspaceCard.evaluate((element: HTMLElement) => {
        element.click();
      });
      await this.page.waitForURL(/\/workspace\/[^/]+$/, { timeout: 30_000 });
      await this.expectRouteLoaded("dashboard");
      return this.getWorkspaceId();
    }

    return this.createFirstWorkspaceFromHome();
  }

  async createFirstWorkspaceFromHome() {
    await expect(this.firstWorkspaceButton).toBeVisible();
    await this.firstWorkspaceButton.click();

    const workspaceName = `Smoke Workspace ${Date.now()}`;
    await this.page.getByLabel("Workspace Name").fill(workspaceName);
    await this.page.getByRole("button", { name: "Create" }).click();

    await expect(this.page).toHaveURL(/\/workspace\/[^/]+\/onboarding$/);
    const workspaceId = await this.getWorkspaceId();
    expect(workspaceId).toBeTruthy();

    await this.goto(workspaceId);
    await this.expectRouteLoaded("dashboard");
    return workspaceId;
  }

  async expectRouteLoaded(route: WorkspaceRoute) {
    await expect(this.page).not.toHaveURL(/\/login|\/sign-in/);
    await expect(this.page.locator("body")).not.toContainText("500");
    await expect(this.page.locator("body")).not.toContainText(
      "Something went wrong",
    );

    switch (route) {
      case "dashboard":
        await expect(this.page).toHaveURL(/\/workspace\/[^/]+$/);
        await expect(this.page.locator("main")).toBeVisible();
        break;
      case "agents":
        await expect(
          this.page.getByRole("heading", { name: "Agents", exact: true }),
        ).toBeVisible();
        break;
      case "inbox":
        await expect(this.page.getByTestId("inbox-page")).toBeVisible();
        break;
      case "signals":
        await expect(
          this.page.getByRole("heading", { name: "Signals" }).first(),
        ).toBeVisible();
        break;
      case "tasks":
        await expect(
          this.page.getByRole("heading", { name: "Tasks" }),
        ).toBeVisible();
        break;
      case "knowledgebase":
        await expect
          .poll(
            async () => {
              if (
                await this.page
                  .getByText("Loading knowledge base...", { exact: true })
                  .isVisible()
                  .catch(() => false)
              ) {
                return "loading";
              }

              return (await this.page
                .getByText("Knowledge Base", { exact: true })
                .isVisible()
                .catch(() => false))
                ? "ready"
                : "pending";
            },
            { timeout: 30_000 },
          )
          .toMatch(/loading|ready/);
        break;
      case "settings":
        await expect(
          this.page.getByRole("heading", { name: "Workspace Settings" }),
        ).toBeVisible();
        break;
      case "personas":
        await expect
          .poll(
            async () => {
              if (
                await this.page
                  .getByText("Loading personas...", { exact: true })
                  .isVisible()
                  .catch(() => false)
              ) {
                return "loading";
              }

              const hasTitle = await this.page
                .getByText("Synthetic Personas", { exact: true })
                .first()
                .isVisible()
                .catch(() => false);
              const hasDescription = await this.page
                .getByText(
                  "For jury validation of prototypes and PRDs",
                  { exact: true },
                )
                .isVisible()
                .catch(() => false);

              return hasTitle && hasDescription ? "ready" : "pending";
            },
            { timeout: 30_000 },
          )
          .toMatch(/loading|ready/);
        break;
      case "commands":
        await expect(
          this.page.getByRole("heading", { name: "Commands & Automation" }),
        ).toBeVisible();
        break;
      case "onboarding":
        await expect
          .poll(
            async () => {
              const url = this.page.url();
              if (/\/workspace\/[^/]+\/onboarding$/.test(url)) {
                return "onboarding";
              }
              if (/\/workspace\/[^/]+$/.test(url)) {
                return "dashboard";
              }
              return "pending";
            },
            { timeout: 30_000 },
          )
          .toMatch(/onboarding|dashboard/);

        if (/\/workspace\/[^/]+\/onboarding$/.test(this.page.url())) {
          await expect(
            this.page.getByText("Let's set up your workspace"),
          ).toBeVisible();
        } else {
          await expect(this.page.locator("main")).toBeVisible();
        }
        break;
    }
  }
}
