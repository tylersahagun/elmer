import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

// Database file location
const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), "data", "orchestrator.db");

// Ensure data directory exists
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Create SQLite connection
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
sqlite.pragma("journal_mode = WAL");

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema types
export * from "./schema";

// Type helpers
export type Workspace = typeof schema.workspaces.$inferSelect;
export type NewWorkspace = typeof schema.workspaces.$inferInsert;

export type Project = typeof schema.projects.$inferSelect;
export type NewProject = typeof schema.projects.$inferInsert;

export type ProjectStage = typeof schema.projectStages.$inferSelect;
export type NewProjectStage = typeof schema.projectStages.$inferInsert;

export type Document = typeof schema.documents.$inferSelect;
export type NewDocument = typeof schema.documents.$inferInsert;

export type Prototype = typeof schema.prototypes.$inferSelect;
export type NewPrototype = typeof schema.prototypes.$inferInsert;

export type Job = typeof schema.jobs.$inferSelect;
export type NewJob = typeof schema.jobs.$inferInsert;

export type MemoryEntry = typeof schema.memoryEntries.$inferSelect;
export type NewMemoryEntry = typeof schema.memoryEntries.$inferInsert;

export type LinearMapping = typeof schema.linearMappings.$inferSelect;
export type NewLinearMapping = typeof schema.linearMappings.$inferInsert;

export type Ticket = typeof schema.tickets.$inferSelect;
export type NewTicket = typeof schema.tickets.$inferInsert;

export type JuryEvaluation = typeof schema.juryEvaluations.$inferSelect;
export type NewJuryEvaluation = typeof schema.juryEvaluations.$inferInsert;

export type ColumnConfig = typeof schema.columnConfigs.$inferSelect;
export type NewColumnConfig = typeof schema.columnConfigs.$inferInsert;
