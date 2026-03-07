-- Migration: pgvector extension and classification columns
-- Phase 16: Classification & Clustering
-- Purpose: Enable native vector operations for similarity search and classification

-- 1. Enable pgvector extension (Neon-provided)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add native vector columns for similarity search (keep existing Base64 as backup)
ALTER TABLE signals ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS embedding_updated_at timestamp;

-- 3. Add classification JSONB column to signals
ALTER TABLE signals ADD COLUMN IF NOT EXISTS classification jsonb;

-- 4. Create HNSW indexes for cosine similarity (O(log n) search)
CREATE INDEX IF NOT EXISTS signals_embedding_vector_idx
ON signals USING hnsw (embedding_vector vector_cosine_ops);

CREATE INDEX IF NOT EXISTS projects_embedding_vector_idx
ON projects USING hnsw (embedding_vector vector_cosine_ops);
