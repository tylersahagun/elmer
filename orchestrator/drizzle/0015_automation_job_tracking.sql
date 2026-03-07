-- Migration: 0015_automation_job_tracking.sql
-- Purpose: Track automation job IDs in stage transition events (AUTO-02, AUTO-05)

-- Add automation_job_ids column to track which jobs were triggered by column automation
ALTER TABLE "stage_transition_events"
ADD COLUMN IF NOT EXISTS "automation_job_ids" jsonb;

-- Comment explaining the column purpose
COMMENT ON COLUMN "stage_transition_events"."automation_job_ids" IS 'Array of job IDs triggered by column automation for this transition';
