---
phase: 12-signal-management-ui
plan: 01
subsystem: api
tags: [signals, crud, rest-api, drizzle, pagination, filtering]

# Dependency graph
requires:
  - phase: 11-signal-schema
    provides: signals table schema with status, source, and metadata fields
provides:
  - Signal CRUD API endpoints with filtering and pagination
  - Query functions for getSignals, createSignal, updateSignal, deleteSignal
  - Permission-protected endpoints requiring workspace membership
affects: [12-02-signal-list-ui, 12-03-signal-entry, signal-processing, signal-intelligence]

# Tech tracking
tech-stack:
  added: [date-fns]
  patterns: [signal-query-pattern, signal-api-pattern]

key-files:
  created:
    - orchestrator/src/app/api/signals/route.ts
    - orchestrator/src/app/api/signals/[id]/route.ts
  modified:
    - orchestrator/src/lib/db/queries.ts

key-decisions:
  - "Default source to 'paste' for manual signal entry"
  - "Use ILIKE for search across verbatim and interpretation fields"
  - "Viewer access for GET, member access for POST/PATCH/DELETE"

patterns-established:
  - "Signal query pattern: getSignals with filter options object, getSignalsCount for pagination totals"
  - "Signal API pattern: workspace permission checks using requireWorkspaceAccess"

# Metrics
duration: 12min
completed: 2026-01-22
---

# Phase 12 Plan 01: Signal CRUD API Summary

**REST API endpoints for signals with pagination, filtering, and search - backend foundation for Signal Management UI**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-22T21:51:24Z
- **Completed:** 2026-01-22T22:03:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Complete Signal CRUD API with GET (list), GET (single), POST, PATCH, DELETE operations
- Filtering by status, source, date range with ILIKE search across verbatim and interpretation
- Pagination with total count for "Showing X of Y" UI patterns
- Permission-protected endpoints following existing workspace access patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Add signal query functions to queries.ts** - `77a2a8f` (feat)
2. **Task 2: Create /api/signals route (GET list, POST create)** - `7e65ec9` (feat)
3. **Task 3: Create /api/signals/[id] route (GET, PATCH, DELETE)** - `a0805cb` (feat)

## Files Created/Modified
- `orchestrator/src/lib/db/queries.ts` - Added getSignals, getSignalsCount, getSignal, createSignal, updateSignal, deleteSignal functions
- `orchestrator/src/app/api/signals/route.ts` - GET (list with filters), POST (create) endpoints
- `orchestrator/src/app/api/signals/[id]/route.ts` - GET (single), PATCH (update), DELETE endpoints
- `orchestrator/package.json` - Added date-fns dependency
- `orchestrator/src/app/api/auth/signup/route.ts` - Fixed drizzle-orm returning() compatibility
- `orchestrator/src/app/login/page.tsx` - Fixed Suspense boundary for useSearchParams

## Decisions Made
- Default source to "paste" for manual signal entry (most common use case for Signal Management UI)
- Viewer access required for GET endpoints, member access for POST/PATCH/DELETE
- Search uses ILIKE on both verbatim and interpretation fields for comprehensive results
- Sort defaults to createdAt desc, pageSize defaults to 20

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing date-fns dependency**
- **Found during:** Task 1 (build verification)
- **Issue:** date-fns was imported in activity-feed.tsx but not in package.json
- **Fix:** Ran `npm install date-fns`
- **Files modified:** package.json, package-lock.json
- **Verification:** Build passes
- **Committed in:** 77a2a8f (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed signup route drizzle-orm compatibility**
- **Found during:** Task 1 (build verification)
- **Issue:** `.returning()` call had incorrect signature for drizzle-orm version
- **Fix:** Changed to `.returning()` without arguments, then extract fields from result
- **Files modified:** orchestrator/src/app/api/auth/signup/route.ts
- **Verification:** Build passes
- **Committed in:** 77a2a8f (Task 1 commit)

**3. [Rule 3 - Blocking] Fixed login page Suspense boundary**
- **Found during:** Task 1 (build verification)
- **Issue:** useSearchParams() requires Suspense boundary in Next.js 16
- **Fix:** Wrapped LoginForm in Suspense with loading fallback
- **Files modified:** orchestrator/src/app/login/page.tsx
- **Verification:** Build passes
- **Committed in:** 77a2a8f (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes were pre-existing issues blocking the build. No scope creep.

## Issues Encountered
None - plan executed as specified after fixing pre-existing blocking issues.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Signal CRUD API complete and ready for UI integration
- Plan 12-02 can build signal list UI consuming these endpoints
- Plan 12-03 can build signal entry form using POST endpoint

---
*Phase: 12-signal-management-ui*
*Completed: 2026-01-22*
