import { test as setup, expect } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
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

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

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
  await page
    .locator('input[type="email"], input[name="identifier"], input[name="emailAddress"]')
    .first()
    .fill(email);
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // Password step
  await page
    .locator('input[name="password"], input[type="password"]')
    .first()
    .fill(password);
  await page.getByRole("button", { name: /^Continue$/ }).click();

  // The signed-in landing page is the workspace selector at `/`.
  await expect
    .poll(() => page.url(), { timeout: 30_000 })
    .toMatch(/\/($|workspace\/)/);
  await expect(page).not.toHaveURL(/\/login|\/sign-in/);

  // Save auth state — reused by all tests
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
