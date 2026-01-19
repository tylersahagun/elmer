-- Migration: Add chromatic_storybook_url to prototypes table
-- Date: 2026-01-19
-- Description: Adds embeddable Storybook URL for Chromatic deployments

-- Add chromatic_storybook_url column to prototypes table
ALTER TABLE "prototypes" ADD COLUMN IF NOT EXISTS "chromatic_storybook_url" text;
