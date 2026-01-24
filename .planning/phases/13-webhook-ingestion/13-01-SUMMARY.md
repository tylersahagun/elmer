---
phase: 13-webhook-ingestion
plan: 01
subsystem: database
tags: [drizzle, postgres, webhook, authentication, api-keys, hmac]

# Dependency graph
requires:
  - phase: 11-signals-schema
    provides: signals table and workspace-scoped schema pattern
provides:
  - webhookKeys table for storing workspace-scoped API keys
  - HMAC secret storage for webhook signature verification
  - WebhookKey and NewWebhookKey TypeScript types
  - Database migration 0007_mute_warbird.sql
affects: [13-02-webhook-endpoint, webhook-authentication, api-security]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - workspace-scoped credentials with cascade delete
    - user reference with SET NULL on delete for audit trail
    - unique constraint on API keys

key-files:
  created:
    - orchestrator/drizzle/0007_mute_warbird.sql
  modified:
    - orchestrator/src/lib/db/schema.ts
    - orchestrator/src/lib/db/index.ts

key-decisions:
  - "Unique constraint on apiKey ensures no duplicate keys across workspaces"
  - "createdBy uses SET NULL to preserve key records after user deletion"
  - "isActive flag allows deactivation without deletion for audit trail"

patterns-established:
  - "Webhook credentials follow workspace-scoped pattern with cascade delete"
  - "Secret field for HMAC verification stored alongside API key"

# Metrics
duration: 5min
completed: 2026-01-22
---

# Phase 13 Plan 01: Webhook Keys Schema Summary

**webhookKeys table with workspace-scoped API keys and HMAC secrets for webhook authentication**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-22T12:00:00Z
- **Completed:** 2026-01-22T12:05:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- webhookKeys table definition with all required fields (id, workspaceId, name, apiKey, secret, isActive, lastUsedAt, createdAt, createdBy)
- Foreign keys to workspaces (cascade) and users (set null)
- Unique constraint on apiKey for API key authentication
- Relations defined for workspace and creator lookups
- TypeScript types exported for type-safe database operations
- Migration file generated for database deployment

## Task Commits

Each task was committed atomically:

1. **Task 1: Add webhookKeys table definition** - `8e358c9` (feat)
2. **Task 2: Export types and generate migration** - `fe827f6` (feat)

## Files Created/Modified
- `orchestrator/src/lib/db/schema.ts` - Added webhookKeys table, relations, and updated workspacesRelations
- `orchestrator/src/lib/db/index.ts` - Added WebhookKey and NewWebhookKey type exports
- `orchestrator/drizzle/0007_mute_warbird.sql` - Migration for webhook_keys table creation

## Decisions Made
- **Unique apiKey constraint:** Ensures each API key is globally unique, enabling simple X-API-Key header authentication
- **SET NULL for createdBy:** Preserves webhook key records for audit trail even after user deletion
- **isActive flag:** Allows key deactivation without deletion, supporting security revocation while maintaining history
- **lastUsedAt tracking:** Enables monitoring of key usage for security auditing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- webhookKeys schema ready for use in 13-02-PLAN.md (webhook endpoint)
- Migration file ready for deployment (run `npm run db:push` when database available)
- Types available for endpoint implementation

---
*Phase: 13-webhook-ingestion*
*Completed: 2026-01-22*
