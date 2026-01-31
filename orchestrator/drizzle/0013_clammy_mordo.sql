CREATE TABLE "agent_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"source_repo" text NOT NULL,
	"source_ref" text NOT NULL,
	"source_path" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"triggers" jsonb,
	"content" text NOT NULL,
	"metadata" jsonb,
	"synced_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_executions" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text,
	"agent_definition_id" text,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"input_context" jsonb,
	"prompt_used" text,
	"output" jsonb,
	"tokens_used" integer,
	"duration_ms" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_knowledge_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"source_repo" text NOT NULL,
	"source_ref" text NOT NULL,
	"source_path" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"content" text,
	"content_hash" text,
	"synced_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_write_ops" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"repo_full_name" text NOT NULL,
	"base_branch" text NOT NULL,
	"write_branch" text NOT NULL,
	"commit_sha" text,
	"pr_number" integer,
	"pr_url" text,
	"status" text NOT NULL,
	"proposed_changes" jsonb,
	"created_by" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text,
	"workspace_id" text NOT NULL,
	"project_id" text,
	"question_type" text NOT NULL,
	"question_text" text NOT NULL,
	"choices" jsonb,
	"context" jsonb,
	"tool_call_id" text NOT NULL,
	"tool_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"response" jsonb,
	"responded_by" text,
	"responded_at" timestamp,
	"timeout_at" timestamp,
	"default_response" jsonb,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "column_configs" ADD COLUMN "agent_triggers" jsonb;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "onboarding_data" jsonb;--> statement-breakpoint
ALTER TABLE "agent_definitions" ADD CONSTRAINT "agent_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_agent_definition_id_agent_definitions_id_fk" FOREIGN KEY ("agent_definition_id") REFERENCES "public"."agent_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_executions" ADD CONSTRAINT "agent_executions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_knowledge_sources" ADD CONSTRAINT "agent_knowledge_sources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_write_ops" ADD CONSTRAINT "github_write_ops_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_questions" ADD CONSTRAINT "pending_questions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_questions" ADD CONSTRAINT "pending_questions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pending_questions" ADD CONSTRAINT "pending_questions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;