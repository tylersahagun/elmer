import { expect, type Page, type Locator } from "@playwright/test";

export class ElmerPanelPage {
  readonly page: Page;

  readonly toggleBtn: Locator;
  readonly panel: Locator;
  readonly tabChat: Locator;
  readonly tabHub: Locator;
  readonly hitlBadge: Locator;
  readonly input: Locator;
  readonly sendBtn: Locator;
  readonly modelSelect: Locator;
  readonly newThreadBtn: Locator;
  readonly threadList: Locator;
  readonly messages: Locator;
  readonly intentBanner: Locator;
  readonly intentConfirm: Locator;
  readonly mentionDropdown: Locator;
  readonly slashDropdown: Locator;
  readonly messagesScroll: Locator;
  readonly hubFilterBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toggleBtn = page.getByTestId("elmer-toggle-btn");
    this.panel = page.getByTestId("elmer-panel");
    this.tabChat = page.getByTestId("elmer-tab-chat");
    this.tabHub = page.getByTestId("elmer-tab-hub");
    this.hitlBadge = page.getByTestId("elmer-hitl-badge");
    this.input = page.getByTestId("elmer-input");
    this.sendBtn = page.getByTestId("elmer-send-btn");
    this.modelSelect = page.getByTestId("elmer-model-select");
    this.newThreadBtn = page.getByTestId("elmer-new-thread-btn");
    this.threadList = page.getByTestId("elmer-thread-list");
    this.messages = page.getByTestId("elmer-messages");
    this.intentBanner = page.getByTestId("elmer-intent-banner");
    this.intentConfirm = page.getByTestId("elmer-intent-confirm");
    this.mentionDropdown = page.getByTestId("elmer-mention-dropdown");
    this.slashDropdown = page.getByTestId("elmer-slash-dropdown");
    this.messagesScroll = page.getByTestId("elmer-messages-scroll");
    this.hubFilterBar = page.getByTestId("elmer-hub-filter-bar");
  }

  async open() {
    await this.toggleBtn.click();
    await expect(this.panel).toBeVisible();
  }

  async openWithKeyboard() {
    await this.page.keyboard.press("Meta+l");
    await expect(this.panel).toBeVisible();
  }

  async switchToHub() {
    await this.tabHub.click();
    await expect(this.hubFilterBar).toBeVisible();
  }

  async switchToChat() {
    await this.tabChat.click();
    await expect(this.input).toBeVisible();
  }

  async typeMessage(text: string) {
    await this.input.click();
    await this.input.fill(text);
  }

  async sendMessage(text: string) {
    await this.typeMessage(text);
    await this.sendBtn.click();
  }

  async waitForStreamingComplete() {
    await expect(this.sendBtn).toBeEnabled({ timeout: 30000 });
  }

  async getMessageCount() {
    const msgs = this.page.locator('[data-testid="elmer-messages"] .flex.gap-2');
    return msgs.count();
  }
}
