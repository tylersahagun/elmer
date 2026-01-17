import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================
// WORKSPACES
// ============================================

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  githubRepo: text("github_repo"),
  contextPath: text("context_path").default("elmer-docs/"),
  settings: text("settings", { mode: "json" }).$type<WorkspaceSettings>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export interface WorkspaceSettings {
  prototypesPath?: string;
  storybookPort?: number;
  linearTeamId?: string;
  notionWorkspaceId?: string;
  posthogProjectId?: string;
}

// ============================================
// PROJECTS
// ============================================

export type ProjectStage = 
  | "inbox"
  | "discovery"
  | "prd"
  | "design"
  | "prototype"
  | "validate"
  | "tickets"
  | "build"
  | "alpha"
  | "beta"
  | "ga";

export type ProjectStatus = "active" | "paused" | "completed" | "archived";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  stage: text("stage").$type<ProjectStage>().notNull().default("inbox"),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
  priority: integer("priority").default(0),
  metadata: text("metadata", { mode: "json" }).$type<ProjectMetadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export interface ProjectMetadata {
  personas?: string[];
  hypothesis?: string;
  linkedIssues?: string[];
  tags?: string[];
}

// ============================================
// PROJECT STAGES (History)
// ============================================

export const projectStages = sqliteTable("project_stages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  enteredAt: integer("entered_at", { mode: "timestamp" }).notNull(),
  exitedAt: integer("exited_at", { mode: "timestamp" }),
  triggeredBy: text("triggered_by"), // "user" | "automation" | job_id
  notes: text("notes"),
});

// ============================================
// DOCUMENTS
// ============================================

export type DocumentType = 
  | "research"
  | "prd"
  | "design_brief"
  | "engineering_spec"
  | "gtm_brief"
  | "prototype_notes"
  | "jury_report";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").$type<DocumentType>().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  version: integer("version").notNull().default(1),
  filePath: text("file_path"), // Path in elmer-docs/
  metadata: text("metadata", { mode: "json" }).$type<DocumentMetadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export interface DocumentMetadata {
  generatedBy?: "user" | "ai";
  model?: string;
  promptVersion?: string;
  reviewStatus?: "draft" | "reviewed" | "approved";
}

// ============================================
// PROTOTYPES
// ============================================

export type PrototypeType = "standalone" | "context";

export const prototypes = sqliteTable("prototypes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").$type<PrototypeType>().notNull(),
  name: text("name").notNull(),
  storybookPath: text("storybook_path"), // e.g., "src/components/CRMConfig/"
  chromaticUrl: text("chromatic_url"),
  chromaticBuildId: text("chromatic_build_id"),
  version: integer("version").notNull().default(1),
  status: text("status").$type<"building" | "ready" | "failed">().default("building"),
  metadata: text("metadata", { mode: "json" }).$type<PrototypeMetadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export interface PrototypeMetadata {
  stories?: string[];
  components?: string[];
  placementAnalysis?: {
    suggestedLocation?: string;
    existingPatterns?: string[];
  };
}

// ============================================
// JOBS (Background Tasks)
// ============================================

export type JobType = 
  | "generate_prd"
  | "generate_design_brief"
  | "generate_engineering_spec"
  | "generate_gtm_brief"
  | "analyze_transcript"
  | "run_jury_evaluation"
  | "build_prototype"
  | "iterate_prototype"
  | "generate_tickets"
  | "validate_tickets"
  | "deploy_chromatic";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<JobType>().notNull(),
  status: text("status").$type<JobStatus>().notNull().default("pending"),
  input: text("input", { mode: "json" }).$type<Record<string, unknown>>(),
  output: text("output", { mode: "json" }).$type<Record<string, unknown>>(),
  error: text("error"),
  progress: real("progress").default(0), // 0-1
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// MEMORY ENTRIES
// ============================================

export type MemoryType = "decision" | "feedback" | "context" | "artifact" | "conversation";

export const memoryEntries = sqliteTable("memory_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  type: text("type").$type<MemoryType>().notNull(),
  content: text("content").notNull(),
  embedding: blob("embedding", { mode: "buffer" }), // Vector embedding for semantic search
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// LINEAR INTEGRATION
// ============================================

export const linearMappings = sqliteTable("linear_mappings", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linearProjectId: text("linear_project_id").notNull(),
  linearTeamId: text("linear_team_id").notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp" }),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
});

export const tickets = sqliteTable("tickets", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linearId: text("linear_id"),
  linearIdentifier: text("linear_identifier"), // e.g., "ENG-123"
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("backlog"),
  priority: integer("priority"),
  prototypeComponentLink: text("prototype_component_link"), // Link to specific Storybook component
  estimatedPoints: integer("estimated_points"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// JURY EVALUATIONS
// ============================================

export const juryEvaluations = sqliteTable("jury_evaluations", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: text("phase").$type<"research" | "prd" | "prototype">().notNull(),
  jurySize: integer("jury_size").notNull(),
  approvalRate: real("approval_rate"),
  conditionalRate: real("conditional_rate"),
  rejectionRate: real("rejection_rate"),
  verdict: text("verdict").$type<"pass" | "fail" | "conditional">(),
  topConcerns: text("top_concerns", { mode: "json" }).$type<string[]>(),
  topSuggestions: text("top_suggestions", { mode: "json" }).$type<string[]>(),
  rawResults: text("raw_results", { mode: "json" }),
  reportPath: text("report_path"), // Path to markdown report
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// COLUMN CONFIGURATIONS (Kanban)
// ============================================

export const columnConfigs = sqliteTable("column_configs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  displayName: text("display_name").notNull(),
  order: integer("order").notNull(),
  color: text("color"),
  autoTriggerJobs: text("auto_trigger_jobs", { mode: "json" }).$type<JobType[]>(),
  requiredApprovals: integer("required_approvals").default(0),
  aiIterations: integer("ai_iterations").default(0),
  humanInLoop: integer("human_in_loop", { mode: "boolean" }).default(false),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
});

// ============================================
// RELATIONS
// ============================================

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
  jobs: many(jobs),
  memoryEntries: many(memoryEntries),
  columnConfigs: many(columnConfigs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  stages: many(projectStages),
  documents: many(documents),
  prototypes: many(prototypes),
  tickets: many(tickets),
  juryEvaluations: many(juryEvaluations),
  linearMapping: one(linearMappings),
}));

export const projectStagesRelations = relations(projectStages, ({ one }) => ({
  project: one(projects, {
    fields: [projectStages.projectId],
    references: [projects.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
}));

export const prototypesRelations = relations(prototypes, ({ one }) => ({
  project: one(projects, {
    fields: [prototypes.projectId],
    references: [projects.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  project: one(projects, {
    fields: [jobs.projectId],
    references: [projects.id],
  }),
  workspace: one(workspaces, {
    fields: [jobs.workspaceId],
    references: [workspaces.id],
  }),
}));

export const memoryEntriesRelations = relations(memoryEntries, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [memoryEntries.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [memoryEntries.projectId],
    references: [projects.id],
  }),
}));

export const linearMappingsRelations = relations(linearMappings, ({ one }) => ({
  project: one(projects, {
    fields: [linearMappings.projectId],
    references: [projects.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  project: one(projects, {
    fields: [tickets.projectId],
    references: [projects.id],
  }),
}));

export const juryEvaluationsRelations = relations(juryEvaluations, ({ one }) => ({
  project: one(projects, {
    fields: [juryEvaluations.projectId],
    references: [projects.id],
  }),
}));

export const columnConfigsRelations = relations(columnConfigs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [columnConfigs.workspaceId],
    references: [workspaces.id],
  }),
}));
