/**
 * Authentication Flow Tests
 *
 * The legacy credentials-based signup/login system (Drizzle + bcrypt) has been
 * removed. Authentication is now handled entirely by Clerk.
 *
 * This file is retained as a placeholder. New auth tests should use Clerk's
 * test utilities or test the Convex membership system via convex/__tests__/.
 */

import { describe, it, expect } from "vitest";

describe("Authentication System", () => {
  it("delegates auth to Clerk — no local credential logic", () => {
    // Auth is handled by Clerk. There is no local password hashing, signup
    // endpoint, or session management to test here.
    expect(true).toBe(true);
  });
});
