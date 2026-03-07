-- Add metadata column to skills table for storing AI summaries
ALTER TABLE skills ADD COLUMN IF NOT EXISTS metadata JSONB;
