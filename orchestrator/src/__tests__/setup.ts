/**
 * Vitest Test Setup
 *
 * Postgres/Drizzle has been removed. The app now uses Convex as its sole backend.
 * This setup file is intentionally minimal — no database migrations needed.
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Ensure AI keys have test fallbacks so unit tests don't require real credentials
if (!process.env.ANTHROPIC_API_KEY) {
  process.env.ANTHROPIC_API_KEY = "test-key";
}
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = "test-key";
}

// Global test utilities
global.testUtils = {
  createMockRequest: (url: string, options?: RequestInit) => {
    return new Request(`http://localhost:3000${url}`, options);
  },
};

// Type augmentation for global test utils
declare global {
  var testUtils: {
    createMockRequest: (url: string, options?: RequestInit) => Request;
  };
}

export {};
