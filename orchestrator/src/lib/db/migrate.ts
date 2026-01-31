import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migrateNeon } from "drizzle-orm/neon-http/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

// Load .env.local for local development
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Non-null assertion since we've already checked above
const DB_URL: string = DATABASE_URL;

// Detect if we're using Neon (serverless) or standard PostgreSQL
const isNeonDatabase = DB_URL.includes("neon.tech") || DB_URL.includes("neon.database");

async function runMigrations() {
  console.log("Running migrations...");
  console.log(`Database type: ${isNeonDatabase ? "Neon (serverless)" : "PostgreSQL (standard)"}`);

  if (isNeonDatabase) {
    // Use Neon serverless driver
    const sql = neon(DB_URL);
    const db = drizzleNeon(sql);
    await migrateNeon(db, { migrationsFolder: "./drizzle" });
  } else {
    // Use standard pg driver
    const pool = new pg.Pool({
      connectionString: DB_URL,
    });
    const db = drizzlePg(pool);
    await migratePg(db, { migrationsFolder: "./drizzle" });
    await pool.end();
  }

  console.log("Migrations complete!");
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
