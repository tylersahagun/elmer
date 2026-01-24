---
phase: 17-smart-association
plan: 02
subsystem: api
tags: [drizzle, rest-api, bulk-operations, signal-management]

# Dependency graph
requires:
  - phase: 12.5-manual-association
    provides: Signal-project linking APIs, junction table patterns
provides:
  - Bulk signal-project linking API endpoint
  - Bulk signal-project unlinking API endpoint
  - Atomic batch operations with duplicate handling
affects: [17-03-review-ui, 17-04-suggestions-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Batch insert with duplicate detection via Set
    - Status invariant enforcement in bulk operations
    - Iterative status reversion for unlink operations

key-files:
  created:
    - orchestrator/src/app/api/signals/bulk/route.ts
  modified:
    - orchestrator/src/lib/db/queries.ts

key-decisions:
  - "Bulk link skips signals already linked to target project"
  - "Bulk unlink reverts status to 'reviewed' only when signal has no remaining project links"
  - "Maximum 50 signals per bulk operation to prevent timeout"
  - "Response includes linked/unlinked and skipped counts for user feedback"

patterns-established:
  - "Bulk operations endpoint at /api/signals/bulk with action discriminator"
  - "Return both success count and skip count for idempotent operations"

# Metrics
duration: 2min
completed: 2026-01-23
---

# Phase 17 Plan 02: Bulk Operations API Summary

**REST API endpoint for efficient batch signal-project linking and unlinking with duplicate handling and status invariants**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-23T23:53:59Z
- **Completed:** 2026-01-23T23:56:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Two bulk query functions for batch link/unlink operations
- Single endpoint supporting both link and unlink actions via discriminator
- Duplicate detection that skips already-linked signals
- Status invariant enforcement (linked/reviewed transitions)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Bulk Query Functions** - `43f376d` (feat)
   - bulkLinkSignalsToProject: batch insert, skip duplicates, update status to "linked"
   - bulkUnlinkSignalsFromProject: batch delete, revert to "reviewed" when no links remain

2. **Task 2: Create Bulk Operations API Endpoint** - `db4a457` (feat)
   - POST /api/signals/bulk with action: "link" | "unlink"
   - 50 signal limit per operation
   - Returns linked/unlinked and skipped counts

## Files Created/Modified

- `orchestrator/src/lib/db/queries.ts` - Added 2 bulk query functions
- `orchestrator/src/app/api/signals/bulk/route.ts` - POST endpoint for bulk operations

## API Contract

### POST /api/signals/bulk

**Request (Link):**
```json
{
  "action": "link",
  "signalIds": ["signal-1", "signal-2"],
  "projectId": "project-123",
  "linkReason": "Bulk linked from review UI"
}
```

**Request (Unlink):**
```json
{
  "action": "unlink",
  "signalIds": ["signal-1", "signal-2"],
  "projectId": "project-123"
}
```

**Response:**
```json
{
  "success": true,
  "action": "link",
  "linked": 2,
  "skipped": 0,
  "message": "Linked 2 signals"
}
```

## Decisions Made

- **Duplicate handling:** Silently skip already-linked signals rather than error
- **Status management:** Only update to "linked" when signal wasn't already linked to any project
- **Unlink status reversion:** Check remaining links per signal before reverting to "reviewed"
- **Batch size limit:** 50 signals to prevent serverless function timeout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Bulk operations ready for UI integration
- Plan 03 can implement signal review UI with multi-select
- Plan 04 can implement suggestions UI with accept-all action

---
*Phase: 17-smart-association*
*Completed: 2026-01-23*
