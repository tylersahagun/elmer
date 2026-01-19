import { pgTable, text, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// WORKSPACES
// ============================================

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  githubRepo: text("github_repo"),
  contextPath: text("context_path").default("elmer-docs/"),
  settings: jsonb("settings").$type<WorkspaceSettings>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export interface BackgroundSettings {
  type: "stars" | "bubble" | "gradient" | "gravity-stars" | "hole" | "aurora" | "none";
  primaryColor?: string;
  secondaryColor?: string;
  speed?: number;
  interactive?: boolean;
}

export type DisplayMode = "immersive" | "focus";

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
  automationMode?: "manual" | "auto_to_stage" | "auto_all";
  automationStopStage?: string;
  automationNotifyStage?: string;
  // Background Worker Settings
  workerEnabled?: boolean;
  workerMaxConcurrency?: number;
  workerPollIntervalMs?: number;
  // Browser Notification Settings
  browserNotificationsEnabled?: boolean;
  notifyOnJobComplete?: boolean;
  notifyOnJobFailed?: boolean;
  notifyOnApprovalRequired?: boolean;
  // UI Personalization
  background?: BackgroundSettings;
  columnGradients?: boolean;
  compactMode?: boolean;
  // Display Mode: "immersive" for glassmorphism/animations, "focus" for solid/clean UI
  displayMode?: DisplayMode;
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

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  stage: text("stage").$type<ProjectStage>().notNull().default("inbox"),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
  priority: integer("priority").default(0),
  metadata: jsonb("metadata").$type<ProjectMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const projectStages = pgTable("project_stages", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  enteredAt: timestamp("entered_at").notNull(),
  exitedAt: timestamp("exited_at"),
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

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").$type<DocumentType>().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  version: integer("version").notNull().default(1),
  filePath: text("file_path"), // Path in elmer-docs/
  metadata: jsonb("metadata").$type<DocumentMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const prototypes = pgTable("prototypes", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").$type<PrototypeType>().notNull(),
  name: text("name").notNull(),
  storybookPath: text("storybook_path"), // e.g., "src/components/CRMConfig/"
  chromaticUrl: text("chromatic_url"),
  chromaticBuildId: text("chromatic_build_id"),
  version: integer("version").notNull().default(1),
  status: text("status").$type<"building" | "ready" | "failed">().default("building"),
  metadata: jsonb("metadata").$type<PrototypeMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<JobType>().notNull(),
  status: text("status").$type<JobStatus>().notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  priority: integer("priority").default(0),
  input: jsonb("input").$type<Record<string, unknown>>(),
  output: jsonb("output").$type<Record<string, unknown>>(),
  error: text("error"),
  progress: real("progress").default(0), // 0-1
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull(),
});

export const jobRuns = pgTable("job_runs", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  status: text("status").$type<JobStatus>().notNull(),
  attempt: integer("attempt").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
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

export const notifications = pgTable("notifications", {
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
  actionData: jsonb("action_data").$type<Record<string, unknown>>(), // Additional action context
  
  // Metadata
  metadata: jsonb("metadata").$type<NotificationMetadata>(),
  
  readAt: timestamp("read_at"),
  actionedAt: timestamp("actioned_at"),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"), // Auto-dismiss after this time
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

export const memoryEntries = pgTable("memory_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  type: text("type").$type<MemoryType>().notNull(),
  content: text("content").notNull(),
  embedding: text("embedding"), // Vector embedding for semantic search (base64 encoded)
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
});

// ============================================
// LINEAR INTEGRATION
// ============================================

export const linearMappings = pgTable("linear_mappings", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  linearProjectId: text("linear_project_id").notNull(),
  linearTeamId: text("linear_team_id").notNull(),
  syncedAt: timestamp("synced_at"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const tickets = pgTable("tickets", {
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
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// ============================================
// JURY EVALUATIONS
// ============================================

export const juryEvaluations = pgTable("jury_evaluations", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: text("phase").$type<"research" | "prd" | "prototype">().notNull(),
  jurySize: integer("jury_size").notNull(),
  approvalRate: real("approval_rate"),
  conditionalRate: real("conditional_rate"),
  rejectionRate: real("rejection_rate"),
  verdict: text("verdict").$type<"pass" | "fail" | "conditional">(),
  topConcerns: jsonb("top_concerns").$type<string[]>(),
  topSuggestions: jsonb("top_suggestions").$type<string[]>(),
  rawResults: jsonb("raw_results"),
  reportPath: text("report_path"), // Path to markdown report
  createdAt: timestamp("created_at").notNull(),
});

// ============================================
// COLUMN CONFIGURATIONS (Kanban)
// ============================================

export const columnConfigs = pgTable("column_configs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  displayName: text("display_name").notNull(),
  order: integer("order").notNull(),
  color: text("color"),
  autoTriggerJobs: jsonb("auto_trigger_jobs").$type<JobType[]>(),
  requiredDocuments: jsonb("required_documents").$type<DocumentType[]>(),
  requiredApprovals: integer("required_approvals").default(0),
  aiIterations: integer("ai_iterations").default(0),
  rules: jsonb("rules").$type<Record<string, unknown>>(),
  humanInLoop: boolean("human_in_loop").default(false),
  enabled: boolean("enabled").default(true),
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

export const knowledgebaseEntries = pgTable("knowledgebase_entries", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<KnowledgebaseType>().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  filePath: text("file_path"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// ============================================
// KNOWLEDGE SOURCES (Integrations)
// ============================================

export const knowledgeSources = pgTable("knowledge_sources", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "notion" | "confluence" | "drive"
  config: jsonb("config").$type<Record<string, unknown>>(),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull(),
});

// ============================================
// PROTOTYPE VERSIONS
// ============================================

export const prototypeVersions = pgTable("prototype_versions", {
  id: text("id").primaryKey(),
  prototypeId: text("prototype_id").notNull().references(() => prototypes.id, { onDelete: "cascade" }),
  storybookPath: text("storybook_path"),
  chromaticUrl: text("chromatic_url"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull(),
});

// ============================================
// STAGE RUNS (Execution Tracking)
// ============================================

export type StageRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AutomationLevel = "fully_auto" | "auto_notify" | "human_approval" | "manual";
export type ExecutionProvider = "anthropic" | "openai" | "cli" | "cursor";

export const stageRuns = pgTable("stage_runs", {
  id: text("id").primaryKey(),
  cardId: text("card_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  status: text("status").$type<StageRunStatus>().notNull().default("queued"),
  automationLevel: text("automation_level").$type<AutomationLevel>().notNull().default("human_approval"),
  provider: text("provider").$type<ExecutionProvider>(),
  attempt: integer("attempt").notNull().default(1),
  idempotencyKey: text("idempotency_key").unique(),
  errorSummary: text("error_summary"),
  triggeredBy: text("triggered_by"), // "user" | "automation" | "retry"
  metadata: jsonb("metadata").$type<StageRunMetadata>(),
  createdAt: timestamp("created_at").notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
});

export interface StageRunMetadata {
  skillsExecuted?: string[];
  gateResults?: Record<string, { passed: boolean; message?: string }>;
  tokensUsed?: { input: number; output: number };
  durationMs?: number;
}

// ============================================
// RUN LOGS (Step-by-step Execution Logs)
// ============================================

export type RunLogLevel = "info" | "warn" | "error" | "debug";

export const runLogs = pgTable("run_logs", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => stageRuns.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull(),
  level: text("level").$type<RunLogLevel>().notNull().default("info"),
  message: text("message").notNull(),
  stepKey: text("step_key"), // skill execution step identifier
  meta: jsonb("meta").$type<Record<string, unknown>>(),
});

// ============================================
// ARTIFACTS (Produced Outputs)
// ============================================

export type ArtifactType = "file" | "url" | "pr" | "ticket" | "metric" | "chromatic";

export const artifacts = pgTable("artifacts", {
  id: text("id").primaryKey(),
  runId: text("run_id").references(() => stageRuns.id, { onDelete: "set null" }),
  cardId: text("card_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  artifactType: text("artifact_type").$type<ArtifactType>().notNull(),
  label: text("label").notNull(),
  uri: text("uri"), // file path or URL
  meta: jsonb("meta").$type<ArtifactMetadata>(),
  createdAt: timestamp("created_at").notNull(),
});

export interface ArtifactMetadata {
  fileSize?: number;
  mimeType?: string;
  chromaticBuildId?: string;
  prNumber?: number;
  ticketId?: string;
  version?: number;
}

// ============================================
// SKILLS (Global Skills Catalog)
// ============================================

export type SkillSource = "local" | "skillsmp";
export type TrustLevel = "vetted" | "community" | "experimental";

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  source: text("source").$type<SkillSource>().notNull().default("local"),
  name: text("name").notNull(),
  description: text("description"),
  version: text("version"),
  entrypoint: text("entrypoint"), // file path for local skills
  promptTemplate: text("prompt_template"), // system prompt content
  trustLevel: text("trust_level").$type<TrustLevel>().notNull().default("community"),
  remoteMetadata: jsonb("remote_metadata").$type<SkillRemoteMetadata>(),
  inputSchema: jsonb("input_schema").$type<Record<string, unknown>>(),
  outputSchema: jsonb("output_schema").$type<Record<string, unknown>>(),
  tags: jsonb("tags").$type<string[]>().default([]),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export interface SkillRemoteMetadata {
  skillsmpId?: string;
  author?: string;
  url?: string;
  downloads?: number;
  rating?: number;
  pinnedVersion?: string;
}

// ============================================
// STAGE RECIPES (Per-Stage Automation Config)
// ============================================

export const stageRecipes = pgTable("stage_recipes", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stage: text("stage").$type<ProjectStage>().notNull(),
  automationLevel: text("automation_level").$type<AutomationLevel>().notNull().default("human_approval"),
  recipeSteps: jsonb("recipe_steps").$type<RecipeStep[]>().notNull().default([]),
  gates: jsonb("gates").$type<GateDefinition[]>().default([]),
  onFailBehavior: text("on_fail_behavior").$type<"stay" | "revert" | "create_questions">().default("stay"),
  provider: text("provider").$type<ExecutionProvider>().default("anthropic"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export interface RecipeStep {
  skillId: string;
  order: number;
  params?: Record<string, unknown>;
  inputsMapping?: Record<string, string>; // where to read from
  outputsMapping?: Record<string, string>; // where to write to
  timeout?: number; // ms
  retryCount?: number;
  continueOnError?: boolean;
}

export interface GateDefinition {
  id: string;
  type: "file_exists" | "sections_exist" | "jury_score" | "custom";
  config: Record<string, unknown>;
  required: boolean;
  message?: string; // failure message
}

// ============================================
// WORKER HEARTBEATS (Worker Health Tracking)
// ============================================

export type WorkerHealthStatus = "idle" | "processing" | "stale";

export const workerHeartbeats = pgTable("worker_heartbeats", {
  workerId: text("worker_id").primaryKey(),
  workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
  lastHeartbeat: timestamp("last_heartbeat").notNull(),
  status: text("status").$type<WorkerHealthStatus>().notNull().default("idle"),
  activeRunId: text("active_run_id"),
  processedCount: integer("processed_count").default(0),
  failedCount: integer("failed_count").default(0),
  metadata: jsonb("metadata").$type<WorkerMetadata>(),
});

export interface WorkerMetadata {
  hostname?: string;
  pid?: number;
  version?: string;
  startedAt?: string;
  rateLimitRemaining?: { requests: number; tokens: number };
}

// ============================================
// STAGE TRANSITION EVENTS (Audit Trail)
// ============================================

export const stageTransitionEvents = pgTable("stage_transition_events", {
  id: text("id").primaryKey(),
  cardId: text("card_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  fromStage: text("from_stage").$type<ProjectStage>(),
  toStage: text("to_stage").$type<ProjectStage>().notNull(),
  actor: text("actor").notNull(), // "user:{id}" | "automation" | "worker:{id}"
  reason: text("reason"),
  runId: text("run_id").references(() => stageRuns.id, { onDelete: "set null" }),
  timestamp: timestamp("timestamp").notNull(),
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

// New execution system relations

export const stageRunsRelations = relations(stageRuns, ({ one, many }) => ({
  card: one(projects, {
    fields: [stageRuns.cardId],
    references: [projects.id],
  }),
  workspace: one(workspaces, {
    fields: [stageRuns.workspaceId],
    references: [workspaces.id],
  }),
  logs: many(runLogs),
  artifacts: many(artifacts),
  transitionEvent: one(stageTransitionEvents),
}));

export const runLogsRelations = relations(runLogs, ({ one }) => ({
  run: one(stageRuns, {
    fields: [runLogs.runId],
    references: [stageRuns.id],
  }),
}));

export const artifactsRelations = relations(artifacts, ({ one }) => ({
  run: one(stageRuns, {
    fields: [artifacts.runId],
    references: [stageRuns.id],
  }),
  card: one(projects, {
    fields: [artifacts.cardId],
    references: [projects.id],
  }),
  workspace: one(workspaces, {
    fields: [artifacts.workspaceId],
    references: [workspaces.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [skills.workspaceId],
    references: [workspaces.id],
  }),
}));

export const stageRecipesRelations = relations(stageRecipes, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [stageRecipes.workspaceId],
    references: [workspaces.id],
  }),
}));

export const workerHeartbeatsRelations = relations(workerHeartbeats, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workerHeartbeats.workspaceId],
    references: [workspaces.id],
  }),
}));

export const stageTransitionEventsRelations = relations(stageTransitionEvents, ({ one }) => ({
  card: one(projects, {
    fields: [stageTransitionEvents.cardId],
    references: [projects.id],
  }),
  workspace: one(workspaces, {
    fields: [stageTransitionEvents.workspaceId],
    references: [workspaces.id],
  }),
  run: one(stageRuns, {
    fields: [stageTransitionEvents.runId],
    references: [stageRuns.id],
  }),
}));
