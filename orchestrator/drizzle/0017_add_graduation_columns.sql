-- Migration: 0017_add_graduation_columns.sql
-- Purpose: Add graduation criteria columns to column_configs table

ALTER TABLE "column_configs" ADD COLUMN IF NOT EXISTS "graduation_criteria" jsonb;
ALTER TABLE "column_configs" ADD COLUMN IF NOT EXISTS "enforce_graduation" boolean DEFAULT false;
ALTER TABLE "stage_transition_events" ADD COLUMN IF NOT EXISTS "automation_job_ids" jsonb;
