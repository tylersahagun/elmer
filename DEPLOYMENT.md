# v1.1 Signals System Deployment Guide

**Milestone:** v1.1 Signals System (Phases 11-20)
**Status:** Ready to deploy ✓
**Date:** 2026-01-24

## Pre-Deployment Checklist

### Code Readiness
- [x] All 10 phases complete (45 plans executed)
- [x] All 40 requirements satisfied
- [x] Critical gap closed (Plan 15-04, commit a0f93fd)
- [x] TypeScript compiles without errors
- [x] Integration quality: 100%
- [x] E2E workflows: 4/4 functional

### Database Migrations
- [ ] Verify PostgreSQL has pgvector extension available
- [ ] Run migrations 0006-0010 in sequence
- [ ] Verify migration 0009 (pgvector) succeeds

**Migrations to apply:**
```bash
# In orchestrator directory
npm run db:migrate

# Or manually via drizzle-kit
npx drizzle-kit push:pg
```

**Required migrations:**
1. 0006_brave_purifiers.sql - signals, signalProjects, signalPersonas tables
2. 0007_mute_warbird.sql - webhookKeys table
3. 0008_colossal_havok.sql - integrations table
4. 0009_pgvector_classification.sql - **REQUIRES pgvector extension**, embeddingVector columns, HNSW indexes
5. 0010_signal_automation.sql - automationActions table

### Environment Variables

**Required (Must be set):**

```bash
# Database (must support pgvector extension)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Authentication
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=https://your-production-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# AI Services (Phase 15 requirements)
ANTHROPIC_API_KEY=<for signal extraction>
OPENAI_API_KEY=<for embeddings via text-embedding-3-small>

# Automation Cron (Phase 19 requirement)
CRON_SECRET=<generate with: openssl rand -base64 32>
```

**Optional:**
```bash
# Integrations (Phase 14.6)
# Add these if using Slack/Pylon integrations
SLACK_CLIENT_ID=<if using Slack integration>
SLACK_CLIENT_SECRET=<if using Slack integration>
PYLON_WEBHOOK_SECRET=<if using Pylon integration>

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=<optional>
NEXT_PUBLIC_POSTHOG_HOST=<optional>
```

### Database Requirements

**Critical:** Your PostgreSQL database MUST have pgvector extension:

```sql
-- Test if pgvector is available
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**If using Neon:** Pgvector is supported on Neon (automatically available)
**If using other providers:** Check provider documentation for pgvector support

### Vercel Configuration

**Cron Jobs (configured in vercel.json):**
- `/api/cron/signal-automation` - Runs hourly (0 * * * *)
- Protected by `CRON_SECRET` header

**Vercel Environment Variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required environment variables listed above
3. Set variables for Production environment
4. Redeploy after adding variables

## Deployment Steps

### Option 1: Merge via Pull Request (Recommended)

```bash
# 1. Push feature branch to remote
git push origin feat/orchestrator-job-processing

# 2. Create pull request via GitHub CLI
gh pr create \
  --base main \
  --head feat/orchestrator-job-processing \
  --title "Release v1.1: Signals System (Phases 11-20)" \
  --body "$(cat <<'EOF'
# v1.1 Signals System Release

This PR delivers the complete Signals System milestone with all 10 phases (11-20) implemented and verified.

## Overview

The Signals System transforms Elmer from a project management tool into a user evidence platform. Signals flow in from multiple sources (webhooks, uploads, manual entry), get processed through an intelligence layer (extraction, classification, clustering), and link to projects with full provenance tracking.

## What's Included

### Foundation (Phase 11)
- Signal schema with source attribution and status tracking
- Junction tables for project/persona associations

### Ingestion (Phases 12-14.6)
- Manual signal entry UI with search, filters, pagination
- Manual association (link signals to projects/personas)
- Webhook ingestion with dual authentication (API key + HMAC)
- File upload (PDF, CSV, TXT) with text extraction
- Video caption fetch (YouTube)
- Third-party integrations (Pylon, Slack)

### Intelligence (Phases 15-16)
- AI extraction (severity, frequency, user segment via Claude)
- Embedding generation (OpenAI text-embedding-3-small)
- pgvector-based classification and clustering
- Two-tier hybrid classifier (embedding similarity + LLM fallback)

### Integration (Phases 17-20)
- Smart association with AI-suggested links
- Provenance tracking and PRD citation
- Workflow automation (suggest/auto-create/full-auto modes)
- Maintenance agents (orphan detection, duplicate detection, archival)

## Deployment Requirements

### Critical: Database Must Support pgvector
- Migration 0009 requires pgvector extension
- Neon databases have pgvector by default
- Other providers: verify pgvector support before deploying

### Environment Variables
See DEPLOYMENT.md for full list. Required:
- DATABASE_URL (with pgvector support)
- AUTH_SECRET, AUTH_URL
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- ANTHROPIC_API_KEY, OPENAI_API_KEY
- CRON_SECRET

### Migrations
Run `npm run db:migrate` to apply migrations 0006-0010

## Verification

- ✓ All 10 phases complete (45 plans executed)
- ✓ All 40 requirements satisfied
- ✓ Integration quality: 100% (16/16 connections)
- ✓ E2E workflows: 4/4 functional
- ✓ TypeScript compiles without errors
- ✓ Critical gap closed via Plan 15-04

## Commits
277 commits including:
- Phase implementations (11-20)
- Gap closure (Plan 15-04, commit a0f93fd)
- Integration testing and verification
- Complete documentation

## Testing Plan
1. Verify migrations apply successfully
2. Test manual signal creation (primary workflow)
3. Test webhook ingestion (if configured)
4. Verify automation cron job runs
5. Confirm PRD generation cites signals

## Rollback Plan
If issues arise, revert to previous main branch. The feature branch will remain available for debugging.

---
Closes #[issue-number-if-applicable]
Release notes: https://github.com/[your-repo]/releases/tag/v1.1.0
EOF
)"

# 3. Get PR URL and share with team for review
```

### Option 2: Direct Merge (Use with caution)

```bash
# 1. Switch to main and pull latest
git checkout main
git pull origin main

# 2. Merge feature branch
git merge feat/orchestrator-job-processing

# 3. Push to main (triggers deployment)
git push origin main
```

## Post-Deployment Verification

### 1. Database Migration Check
```bash
# Connect to production database
# Verify tables exist:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'signal%'
ORDER BY table_name;

# Should return:
# - signal_personas
# - signal_projects
# - signals

# Verify pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 2. Environment Variables Check
```bash
# Via Vercel CLI
vercel env ls

# Verify all required variables are set
```

### 3. Cron Job Check
```bash
# Check Vercel dashboard → Cron Jobs
# Verify /api/cron/signal-automation is scheduled hourly

# Test cron endpoint manually:
curl -X GET https://your-domain.com/api/cron/signal-automation \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 4. E2E Workflow Tests

**Test 1: Manual Signal Creation (Primary Workflow)**
1. Navigate to Signals page
2. Click "Add Signal"
3. Paste some feedback text
4. Submit form
5. Verify signal appears in list
6. Wait 5 seconds, refresh page
7. Check signal has severity/frequency populated (AI processing worked)

**Test 2: Signal Classification**
1. Create a signal mentioning an existing project
2. Wait 5-10 seconds for processing
3. Check if suggestion appears in suggestions banner
4. Accept suggestion
5. Verify signal appears in project's linked signals section

**Test 3: File Upload**
1. Click "Add Signal" → Upload tab
2. Upload a PDF or CSV file
3. Verify signal created with extracted text
4. Check AI processing runs automatically

**Test 4: PRD Generation with Citations**
1. Create a new project
2. Link 2-3 signals to the project
3. Trigger PRD generation
4. Verify PRD includes "Supporting User Evidence" section
5. Verify signals are cited with sources

## Rollback Procedure

If critical issues are found in production:

```bash
# 1. Identify last good commit on main before merge
git log main --oneline | head -20

# 2. Revert to last good commit
git checkout main
git reset --hard <commit-hash-before-merge>
git push origin main --force

# 3. Notify team and investigate issue on feature branch

# 4. Fix issue, test thoroughly, then re-deploy
```

## Monitoring

### Key Metrics to Watch

1. **Signal Processing Success Rate**
   - Monitor logs for "Failed to process signal" errors
   - Check that signals have processedAt timestamps

2. **API Response Times**
   - /api/signals endpoints should respond < 200ms
   - Processing happens async, so shouldn't slow down UI

3. **Classification Accuracy**
   - Monitor suggestion acceptance rate
   - Check classification confidence scores

4. **Automation Actions**
   - Watch automationActions table for action counts
   - Verify thresholds aren't triggering too frequently

5. **Database Performance**
   - pgvector similarity queries should use HNSW indexes
   - Monitor query times for /api/signals/similar endpoint

### Recommended Observability

- Set up error tracking (Sentry, LogRocket, etc.)
- Add performance monitoring for AI API calls
- Track processing pipeline success/failure rates
- Monitor cron job execution

## Known Limitations

1. **Phase 13 (Webhook Ingestion):** Requires runtime testing with real webhook payloads
2. **Phase 12 (Signal UI):** 10 manual UI tests recommended for visual behavior verification
3. **Loom Video Support:** Deferred pending official API (shows "coming soon" message)

## Support

If issues arise during deployment:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Confirm database migrations applied successfully
4. Test API endpoints directly via curl/Postman
5. Check audit report: `.planning/v1.1-MILESTONE-AUDIT.md`

---

**Deployment Guide Version:** 1.0
**Last Updated:** 2026-01-24
**Milestone:** v1.1 Signals System
**Status:** Ready to deploy ✓
