-- Migration: Add execution system tables
-- Date: 2026-01-18
-- Description: Adds stage_runs, run_logs, artifacts, skills, stage_recipes, worker_heartbeats, and stage_transition_events tables

-- Stage Runs (Execution Tracking)
CREATE TABLE IF NOT EXISTS "stage_runs" (
  "id" text PRIMARY KEY NOT NULL,
  "card_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "stage" text NOT NULL,
  "status" text NOT NULL DEFAULT 'queued',
  "automation_level" text NOT NULL DEFAULT 'human_approval',
  "provider" text,
  "attempt" integer NOT NULL DEFAULT 1,
  "idempotency_key" text UNIQUE,
  "error_summary" text,
  "triggered_by" text,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL,
  "started_at" timestamp,
  "finished_at" timestamp
);

-- Run Logs (Step-by-step Execution Logs)
CREATE TABLE IF NOT EXISTS "run_logs" (
  "id" text PRIMARY KEY NOT NULL,
  "run_id" text NOT NULL REFERENCES "stage_runs"("id") ON DELETE CASCADE,
  "timestamp" timestamp NOT NULL,
  "level" text NOT NULL DEFAULT 'info',
  "message" text NOT NULL,
  "step_key" text,
  "meta" jsonb
);

-- Artifacts (Produced Outputs)
CREATE TABLE IF NOT EXISTS "artifacts" (
  "id" text PRIMARY KEY NOT NULL,
  "run_id" text REFERENCES "stage_runs"("id") ON DELETE SET NULL,
  "card_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "stage" text NOT NULL,
  "artifact_type" text NOT NULL,
  "label" text NOT NULL,
  "uri" text,
  "meta" jsonb,
  "created_at" timestamp NOT NULL
);

-- Skills (Global Skills Catalog)
CREATE TABLE IF NOT EXISTS "skills" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "source" text NOT NULL DEFAULT 'local',
  "name" text NOT NULL,
  "description" text,
  "version" text,
  "entrypoint" text,
  "prompt_template" text,
  "trust_level" text NOT NULL DEFAULT 'community',
  "remote_metadata" jsonb,
  "input_schema" jsonb,
  "output_schema" jsonb,
  "tags" jsonb DEFAULT '[]',
  "last_synced" timestamp,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

-- Stage Recipes (Per-Stage Automation Config)
CREATE TABLE IF NOT EXISTS "stage_recipes" (
  "id" text PRIMARY KEY NOT NULL,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "stage" text NOT NULL,
  "automation_level" text NOT NULL DEFAULT 'human_approval',
  "recipe_steps" jsonb NOT NULL DEFAULT '[]',
  "gates" jsonb DEFAULT '[]',
  "on_fail_behavior" text DEFAULT 'stay',
  "provider" text DEFAULT 'anthropic',
  "enabled" boolean DEFAULT true,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  UNIQUE("workspace_id", "stage")
);

-- Worker Heartbeats (Worker Health Tracking)
CREATE TABLE IF NOT EXISTS "worker_heartbeats" (
  "worker_id" text PRIMARY KEY NOT NULL,
  "workspace_id" text REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "last_heartbeat" timestamp NOT NULL,
  "status" text NOT NULL DEFAULT 'idle',
  "active_run_id" text,
  "processed_count" integer DEFAULT 0,
  "failed_count" integer DEFAULT 0,
  "metadata" jsonb
);

-- Stage Transition Events (Audit Trail)
CREATE TABLE IF NOT EXISTS "stage_transition_events" (
  "id" text PRIMARY KEY NOT NULL,
  "card_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "from_stage" text,
  "to_stage" text NOT NULL,
  "actor" text NOT NULL,
  "reason" text,
  "run_id" text REFERENCES "stage_runs"("id") ON DELETE SET NULL,
  "timestamp" timestamp NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "stage_runs_card_id_idx" ON "stage_runs"("card_id");
CREATE INDEX IF NOT EXISTS "stage_runs_workspace_id_idx" ON "stage_runs"("workspace_id");
CREATE INDEX IF NOT EXISTS "stage_runs_status_idx" ON "stage_runs"("status");
CREATE INDEX IF NOT EXISTS "stage_runs_idempotency_key_idx" ON "stage_runs"("idempotency_key");

CREATE INDEX IF NOT EXISTS "run_logs_run_id_idx" ON "run_logs"("run_id");
CREATE INDEX IF NOT EXISTS "run_logs_timestamp_idx" ON "run_logs"("timestamp");

CREATE INDEX IF NOT EXISTS "artifacts_card_id_idx" ON "artifacts"("card_id");
CREATE INDEX IF NOT EXISTS "artifacts_run_id_idx" ON "artifacts"("run_id");
CREATE INDEX IF NOT EXISTS "artifacts_stage_idx" ON "artifacts"("stage");

CREATE INDEX IF NOT EXISTS "skills_workspace_id_idx" ON "skills"("workspace_id");
CREATE INDEX IF NOT EXISTS "skills_source_idx" ON "skills"("source");
CREATE INDEX IF NOT EXISTS "skills_trust_level_idx" ON "skills"("trust_level");

CREATE INDEX IF NOT EXISTS "stage_recipes_workspace_id_idx" ON "stage_recipes"("workspace_id");

CREATE INDEX IF NOT EXISTS "worker_heartbeats_workspace_id_idx" ON "worker_heartbeats"("workspace_id");
CREATE INDEX IF NOT EXISTS "worker_heartbeats_last_heartbeat_idx" ON "worker_heartbeats"("last_heartbeat");

CREATE INDEX IF NOT EXISTS "stage_transition_events_card_id_idx" ON "stage_transition_events"("card_id");
CREATE INDEX IF NOT EXISTS "stage_transition_events_timestamp_idx" ON "stage_transition_events"("timestamp");
