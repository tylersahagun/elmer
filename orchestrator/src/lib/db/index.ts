import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import * as schema from "./schema";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Non-null assertion since we've already checked above
const DB_URL: string = DATABASE_URL;

// Detect if we're using Neon (serverless) or standard PostgreSQL
// Neon URLs contain "neon.tech" or start with specific patterns
const isNeonDatabase = DB_URL.includes("neon.tech") || DB_URL.includes("neon.database");

// Create the appropriate Drizzle instance based on the database URL
function createDb() {
  if (isNeonDatabase) {
    // Use Neon serverless HTTP driver (optimized for edge/serverless)
    console.log("Using Neon serverless database driver");
    const sql = neon(DB_URL);
    return drizzleNeon(sql, { schema });
  } else {
    // Use standard pg driver (for local development or self-hosted PostgreSQL)
    console.log("Using standard PostgreSQL driver");
    const pool = new pg.Pool({
      connectionString: DB_URL,
    });
    return drizzlePg(pool, { schema });
  }
}

// Create Drizzle instance with schema
export const db = createDb();

// Export the detection flag for use in migrations, etc.
export const isServerless = isNeonDatabase;

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
export type JobRun = typeof schema.jobRuns.$inferSelect;
export type NewJobRun = typeof schema.jobRuns.$inferInsert;

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

export type KnowledgebaseEntry = typeof schema.knowledgebaseEntries.$inferSelect;
export type NewKnowledgebaseEntry = typeof schema.knowledgebaseEntries.$inferInsert;

export type KnowledgeSource = typeof schema.knowledgeSources.$inferSelect;
export type NewKnowledgeSource = typeof schema.knowledgeSources.$inferInsert;

export type PrototypeVersion = typeof schema.prototypeVersions.$inferSelect;
export type NewPrototypeVersion = typeof schema.prototypeVersions.$inferInsert;

// Signal types (Phase 11+)
export type Signal = typeof schema.signals.$inferSelect;
export type NewSignal = typeof schema.signals.$inferInsert;

export type SignalProject = typeof schema.signalProjects.$inferSelect;
export type NewSignalProject = typeof schema.signalProjects.$inferInsert;

export type SignalPersona = typeof schema.signalPersonas.$inferSelect;
export type NewSignalPersona = typeof schema.signalPersonas.$inferInsert;

// Webhook Keys
export type WebhookKey = typeof schema.webhookKeys.$inferSelect;
export type NewWebhookKey = typeof schema.webhookKeys.$inferInsert;

// Integrations (Phase 14.6+)
export type Integration = typeof schema.integrations.$inferSelect;
export type NewIntegration = typeof schema.integrations.$inferInsert;

// Re-export integration types from schema
export type { IntegrationPlatform, IntegrationConfig } from "./schema";
