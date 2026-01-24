---
phase: 20
plan: 04
subsystem: maintenance
tags: [signals, api, cron, maintenance, orphans, duplicates, archival, merge, suggestions]
dependency-graph:
  requires: [20-01, 20-02]
  provides: [maintenance-cron, maintenance-api-endpoints, cleanup-suggestions]
  affects: [maintenance-ui]
tech-stack:
  added: []
  patterns: [requireWorkspaceAccess-auth, cron-secret-protection, maintenance-settings-queries]
key-files:
  created:
    - orchestrator/src/app/api/cron/maintenance/route.ts
    - orchestrator/src/app/api/signals/orphans/route.ts
    - orchestrator/src/app/api/signals/duplicates/route.ts
    - orchestrator/src/app/api/signals/archive/route.ts
    - orchestrator/src/app/api/signals/merge/route.ts
    - orchestrator/src/app/api/signals/[id]/suggestions/route.ts
  modified:
    - orchestrator/src/lib/db/queries.ts
decisions:
  - pattern: "requireWorkspaceAccess for auth"
    reason: "Project-wide pattern for workspace permission checks"
  - pattern: "Viewer for GET, member for POST/DELETE"
    reason: "Consistent with signal API access control"
  - pattern: "MAINT-01 suggestions via embedding similarity"
    reason: "Reuses Phase 17 classification infrastructure"
metrics:
  duration: 6m
  completed: 2026-01-24
---

# Phase 20 Plan 04: Maintenance Cron and API Endpoints Summary

Maintenance cron job and 6 API endpoints for signal hygiene operations including MAINT-01 cleanup agent suggestions

## One-liner

Daily cron for orphan/duplicate detection with REST APIs for orphan listing, duplicate detection, archival, merge, and embedding-based project suggestions

## What Was Built

### 1. Query Functions (`queries.ts`)

Added two new query functions following existing patterns:

```typescript
// Get workspace maintenance settings merged with defaults
getWorkspaceMaintenanceSettings(workspaceId) -> MaintenanceSettings

// Find multiple best matching projects for signal embedding (MAINT-01)
findBestProjectMatches(workspaceId, signalVector, limit) -> Array<ProjectMatch>
```

### 2. Maintenance Cron (`/api/cron/maintenance`)

Daily cron endpoint that iterates all workspaces and:
- Runs orphan detection if enabled
- Runs duplicate detection if enabled
- Auto-archives signals if enabled
- Sends notifications when thresholds exceeded

Configuration:
- Schedule: `0 0 * * *` (daily at midnight)
- Max duration: 5 minutes
- Protected by CRON_SECRET in production

### 3. Orphans API (`/api/signals/orphans`)

**GET** - Returns orphan signals for a workspace
- Query params: workspaceId, thresholdDays (optional), limit (optional)
- Viewer access required
- Uses workspace maintenance settings for default thresholds

### 4. Duplicates API (`/api/signals/duplicates`)

**GET** - Returns potential duplicate signal pairs
- Query params: workspaceId, similarity (optional), limit (optional)
- Viewer access required
- Uses pgvector cosine similarity from 20-02

### 5. Archive API (`/api/signals/archive`)

**POST** - Archives signals by ID or time criteria
- Body: `{ workspaceId, signalIds?, linkedOlderThanDays?, reviewedOlderThanDays? }`
- Member access required

**DELETE** - Unarchives (restores) signals
- Body: `{ workspaceId, signalIds }`
- Member access required

### 6. Merge API (`/api/signals/merge`)

**POST** - Merges duplicate signals or dismisses pair
- Body: `{ workspaceId, primarySignalId, secondarySignalId, action? }`
- Actions: `merge` (default) or `dismiss`
- Member access required

### 7. Suggestions API (`/api/signals/[id]/suggestions`)

**GET** - Returns project association suggestions (MAINT-01)
- Query params: workspaceId
- Uses signal embedding to find similar projects
- Filters by minSuggestionConfidence from settings
- Returns up to 5 project matches with confidence scores

## Key Patterns

### Pattern: requireWorkspaceAccess

All endpoints use the project-wide `requireWorkspaceAccess` pattern instead of manual session/membership checks:

```typescript
const membership = await requireWorkspaceAccess(workspaceId, "viewer");
```

### Pattern: Settings-based Defaults

API endpoints read workspace-level maintenance settings for defaults:

```typescript
const settings = await getWorkspaceMaintenanceSettings(workspaceId);
const thresholdDays = parseInt(param || "") || settings.orphanThresholdDays;
```

### Pattern: Cron Secret Protection

Production cron endpoints require Bearer token authentication:

```typescript
if (process.env.NODE_ENV === "production" && cronSecret) {
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

## Decisions Made

| Decision | Context | Rationale |
|----------|---------|-----------|
| Use requireWorkspaceAccess | Auth pattern | Project-wide consistency |
| Viewer for GET, member for POST/DELETE | Access levels | Consistent with signals API |
| MAINT-01 via embedding similarity | Suggestion algorithm | Reuses Phase 17 infrastructure |
| 5-minute cron timeout | Performance | Matches signal-automation cron |
| Daily schedule (0 0 * * *) | Frequency | Reasonable for maintenance tasks |

## Files Created

| File | Purpose | LOC |
|------|---------|-----|
| `orchestrator/src/app/api/cron/maintenance/route.ts` | Daily maintenance cron | 163 |
| `orchestrator/src/app/api/signals/orphans/route.ts` | Orphan listing API | 44 |
| `orchestrator/src/app/api/signals/duplicates/route.ts` | Duplicate detection API | 44 |
| `orchestrator/src/app/api/signals/archive/route.ts` | Archive/unarchive API | 77 |
| `orchestrator/src/app/api/signals/merge/route.ts` | Merge/dismiss API | 54 |
| `orchestrator/src/app/api/signals/[id]/suggestions/route.ts` | MAINT-01 suggestions | 91 |

## Files Modified

| File | Changes |
|------|---------|
| `orchestrator/src/lib/db/queries.ts` | Added getWorkspaceMaintenanceSettings, findBestProjectMatches |

## Verification Results

- [x] TypeScript compiles without errors
- [x] getWorkspaceMaintenanceSettings exists in queries.ts
- [x] findBestProjectMatches exists in queries.ts
- [x] /api/cron/maintenance endpoint handles GET requests
- [x] /api/signals/orphans returns orphan signals
- [x] /api/signals/duplicates returns duplicate pairs
- [x] /api/signals/archive handles POST (archive) and DELETE (unarchive)
- [x] /api/signals/merge handles POST for merge and dismiss
- [x] /api/signals/[id]/suggestions returns project suggestions (MAINT-01)
- [x] All endpoints check authentication and workspace membership

## Deviations from Plan

None - plan executed exactly as written. The archival and merge functions were already created by Plan 20-03.

## Commits

1. `ed033b2` - feat(20-04): add getWorkspaceMaintenanceSettings and findBestProjectMatches queries
2. `86bc08f` - feat(20-04): create maintenance cron endpoint
3. `b77837c` - feat(20-04): create maintenance API endpoints

## Next Phase Readiness

**Ready for UI implementation:**
- All API endpoints available for frontend consumption
- Cron runs daily for automated maintenance
- MAINT-01 cleanup agent suggestions implemented

**Integration points:**
- Frontend can call `/api/signals/orphans` to display orphan list
- Frontend can call `/api/signals/duplicates` to show merge candidates
- Frontend can use `/api/signals/[id]/suggestions` for one-click project linking
- Cron notifications appear in workspace notification center
