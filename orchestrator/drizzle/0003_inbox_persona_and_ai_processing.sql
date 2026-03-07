-- Add persona assignment and AI processing fields to inbox_items table
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS assigned_persona_id TEXT;
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS extracted_problems JSONB;
ALTER TABLE inbox_items ADD COLUMN IF NOT EXISTS hypothesis_matches JSONB;
