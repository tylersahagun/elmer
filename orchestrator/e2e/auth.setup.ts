import { test as setup, expect } from "@playwright/test";
import path from "path";

/**
 * Auth setup — runs once before all tests.
 * Logs in via Clerk and saves session to e2e/.auth/user.json
 * so all subsequent tests skip the login flow.
 *
 * Requires env vars:
 *   E2E_TEST_EMAIL    — test account email (@askelephant.ai)
 *   E2E_TEST_PASSWORD — test account password
 */

const authFile = path.join(__dirname, ".auth/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set in .env.local"
    );
  }

  await page.goto("/login");

  // Clerk renders an email input — fill and continue
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /continue|next|sign in/i }).first().click();

  // Password step
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|continue/i }).first().click();

  // Wait for successful redirect to workspace
  await page.waitForURL(/\/workspace\//, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/workspace\//);

  // Save auth state — reused by all tests
  await page.context().storageState({ path: authFile });
});
