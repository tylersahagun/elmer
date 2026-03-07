-- Migration: Signal Automation Schema
-- Phase 19: Workflow Automation
-- Purpose: Add automation_actions table for tracking signal-driven automation

-- 1. Create automation_actions table for rate limiting and cooldown tracking
CREATE TABLE IF NOT EXISTS "automation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"cluster_id" text NOT NULL,
	"action_type" text NOT NULL,
	"project_id" text,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);

-- 2. Add foreign key constraints
ALTER TABLE "automation_actions"
ADD CONSTRAINT "automation_actions_workspace_id_workspaces_id_fk"
FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id")
ON DELETE cascade ON UPDATE no action;

ALTER TABLE "automation_actions"
ADD CONSTRAINT "automation_actions_project_id_projects_id_fk"
FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id")
ON DELETE set null ON UPDATE no action;

-- 3. Create indexes for efficient queries
-- Index for cooldown checks: (workspace_id, cluster_id)
CREATE INDEX IF NOT EXISTS "automation_actions_workspace_cluster_idx"
ON "automation_actions" ("workspace_id", "cluster_id");

-- Index for daily rate limit checks: (workspace_id, triggered_at DESC)
CREATE INDEX IF NOT EXISTS "automation_actions_workspace_triggered_idx"
ON "automation_actions" ("workspace_id", "triggered_at" DESC);
