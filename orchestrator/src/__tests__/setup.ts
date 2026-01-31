/**
 * Vitest Test Setup
 *
 * This file runs before all tests to set up the test environment.
 */

import { vi, beforeAll } from "vitest";
import dotenv from "dotenv";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Fallback for CI/CD or environments without .env.local
if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set - integration tests will fail");
  console.warn(
    '   Run: export DATABASE_URL="postgresql://elmer:elmer_local_dev@127.0.0.1:5432/orchestrator"',
  );
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

let migrationsApplied = false;
const MIGRATION_LOCK_ID = 782134;

beforeAll(async () => {
  if (migrationsApplied) return;
  if (!process.env.DATABASE_URL) return;

  const dbUrl = process.env.DATABASE_URL;
  const isNeonDatabase =
    dbUrl.includes("neon.tech") || dbUrl.includes("neon.database");

  if (isNeonDatabase) {
    const sql = neon(dbUrl);
    const db = drizzleNeon(sql);
    await sql`select pg_advisory_lock(${MIGRATION_LOCK_ID})`;
    await migrateNeon(db, { migrationsFolder: "./drizzle" });
    await sql`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`;
  } else {
    const pool = new pg.Pool({ connectionString: dbUrl });
    const db = drizzlePg(pool);
    await pool.query("select pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
    await migratePg(db, { migrationsFolder: "./drizzle" });
    await pool.query("select pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]);
    await pool.end();
  }

  migrationsApplied = true;
});

// Type augmentation for global test utils
declare global {
  var testUtils: {
    createMockRequest: (url: string, options?: RequestInit) => Request;
  };
}

export {};
