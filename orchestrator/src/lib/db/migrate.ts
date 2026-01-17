import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), "data", "orchestrator.db");

// Ensure data directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

console.log("Running migrations...");
migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations complete!");

sqlite.close();
