/**
 * Vitest Test Setup
 * 
 * This file runs before all tests to set up the test environment.
 */

import { vi } from "vitest";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Fallback for CI/CD or environments without .env.local
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - integration tests will fail");
  console.warn("   Run: export DATABASE_URL=\"postgresql://elmer:elmer_local_dev@127.0.0.1:5432/orchestrator\"");
}
if (!process.env.ANTHROPIC_API_KEY) {
  process.env.ANTHROPIC_API_KEY = "test-key"; // Mock for unit tests
}

// Mock console.error to reduce noise in tests (optional)
// vi.spyOn(console, "error").mockImplementation(() => {});

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
