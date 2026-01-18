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
  contextPaths?: string[];
  baseBranch?: string;
  autoCreateFeatureBranch?: boolean;
  autoCommitJobs?: boolean;
  cursorDeepLinkTemplate?: string;
  aiExecutionMode?: "cursor" | "server" | "hybrid";
  aiValidationMode?: "none" | "light" | "schema";
  aiFallbackAfterMinutes?: number;
  knowledgebaseMapping?: Record<string, string>;
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
  gitBranch?: string;
  baseBranch?: string;
  stageConfidence?: Record<
    string,
    {
      score: number;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
      updatedAt: string;
    }
  >;
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
  | "score_stage_alignment"
  | "deploy_chromatic"
  | "create_feature_branch";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<JobType>().notNull(),
  status: text("status").$type<JobStatus>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  priority: integer("priority").default(0),
  input: text("input", { mode: "json" }).$type<Record<string, unknown>>(),
  output: text("output", { mode: "json" }).$type<Record<string, unknown>>(),
  error: text("error"),
  progress: real("progress").default(0), // 0-1
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const jobRuns = sqliteTable("job_runs", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: text("status").$type<JobStatus>().notNull(),
  attempt: integer("attempt").notNull(),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  error: text("error"),
});

// ============================================
// NOTIFICATIONS (Human-in-the-Loop Inbox)
// ============================================

export type NotificationType = 
  | "job_failed"           // A background job failed and needs attention
  | "job_completed"        // A job completed successfully (info)
  | "missing_transcript"   // Project needs a transcript to proceed
  | "missing_document"     // Project needs a document to proceed
  | "approval_required"    // Stage transition needs human approval
  | "jury_failed"          // Jury evaluation didn't pass
  | "integration_error"    // External integration failed (Linear, Notion, etc.)
  | "stage_blocked"        // Project is blocked from progressing
  | "action_required";     // Generic action needed

export type NotificationPriority = "low" | "medium" | "high" | "urgent";
export type NotificationStatus = "unread" | "read" | "actioned" | "dismissed";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
  
  type: text("type").$type<NotificationType>().notNull(),
  priority: text("priority").$type<NotificationPriority>().notNull().default("medium"),
  status: text("status").$type<NotificationStatus>().notNull().default("unread"),
  
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Action configuration
  actionType: text("action_type"), // "navigate" | "approve" | "retry" | "provide_input" | "dismiss"
  actionLabel: text("action_label"), // Button text
  actionUrl: text("action_url"), // Where to navigate or what to do
  actionData: text("action_data", { mode: "json" }).$type<Record<string, unknown>>(), // Additional action context
  
  // Metadata
  metadata: text("metadata", { mode: "json" }).$type<NotificationMetadata>(),
  
  readAt: integer("read_at", { mode: "timestamp" }),
  actionedAt: integer("actioned_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }), // Auto-dismiss after this time
});

export interface NotificationMetadata {
  errorDetails?: string;
  suggestedFix?: string;
  relatedEntity?: {
    type: "document" | "prototype" | "ticket" | "integration";
    id: string;
    name?: string;
  };
  context?: Record<string, unknown>;
}

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
  requiredDocuments: text("required_documents", { mode: "json" }).$type<DocumentType[]>(),
  requiredApprovals: integer("required_approvals").default(0),
  aiIterations: integer("ai_iterations").default(0),
  rules: text("rules", { mode: "json" }).$type<Record<string, unknown>>(),
  humanInLoop: integer("human_in_loop", { mode: "boolean" }).default(false),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
});

// ============================================
// KNOWLEDGEBASE ENTRIES
// ============================================

export type KnowledgebaseType =
  | "company_context"
  | "strategic_guardrails"
  | "personas"
  | "roadmap"
  | "rules";

export const knowledgebaseEntries = sqliteTable("knowledgebase_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<KnowledgebaseType>().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  filePath: text("file_path"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// KNOWLEDGE SOURCES (Integrations)
// ============================================

export const knowledgeSources = sqliteTable("knowledge_sources", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "notion" | "confluence" | "drive"
  config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// PROTOTYPE VERSIONS
// ============================================

export const prototypeVersions = sqliteTable("prototype_versions", {
  id: text("id").primaryKey(),
  prototypeId: text("prototype_id").notNull().references(() => prototypes.id, { onDelete: "cascade" }),
  storybookPath: text("storybook_path"),
  chromaticUrl: text("chromatic_url"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  projects: many(projects),
  jobs: many(jobs),
  memoryEntries: many(memoryEntries),
  columnConfigs: many(columnConfigs),
  knowledgebaseEntries: many(knowledgebaseEntries),
  knowledgeSources: many(knowledgeSources),
  notifications: many(notifications),
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
  notifications: many(notifications),
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

export const prototypeVersionsRelations = relations(prototypeVersions, ({ one }) => ({
  prototype: one(prototypes, {
    fields: [prototypeVersions.prototypeId],
    references: [prototypes.id],
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

export const jobRunsRelations = relations(jobRuns, ({ one }) => ({
  job: one(jobs, {
    fields: [jobRuns.jobId],
    references: [jobs.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notifications.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
  job: one(jobs, {
    fields: [notifications.jobId],
    references: [jobs.id],
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

export const knowledgebaseEntriesRelations = relations(knowledgebaseEntries, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [knowledgebaseEntries.workspaceId],
    references: [workspaces.id],
  }),
}));

export const knowledgeSourcesRelations = relations(knowledgeSources, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [knowledgeSources.workspaceId],
    references: [workspaces.id],
  }),
}));
