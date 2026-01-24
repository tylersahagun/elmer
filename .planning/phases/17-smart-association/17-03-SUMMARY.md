---
phase: 17-smart-association
plan: 03
subsystem: ui
tags: [react, signals, suggestions, ai, tanstack-query]

# Dependency graph
requires:
  - phase: 17-01
    provides: Suggestions API endpoint (/api/signals/suggestions, /api/signals/[id]/suggestions/dismiss)
  - phase: 12.5
    provides: ProjectLinkCombobox component for project selection
provides:
  - SuggestionCard component for displaying individual AI suggestions
  - SignalSuggestionsBanner component for collapsible suggestions list
  - Integration of suggestions UI into signals page
affects: [17-04, 18-prd-creation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Collapsible banner pattern for optional UI sections
    - Pending state tracking per-item for mutations
    - Session-based dismiss all (not persisted)

key-files:
  created:
    - orchestrator/src/components/signals/SuggestionCard.tsx
    - orchestrator/src/components/signals/SignalSuggestionsBanner.tsx
  modified:
    - orchestrator/src/app/(dashboard)/workspace/[id]/signals/SignalsPageClient.tsx

key-decisions:
  - "Accept mutation uses linkReason 'AI-suggested association accepted by user'"
  - "Dismiss All is session-only (not persisted via API)"
  - "Confidence color thresholds: green >= 80%, amber >= 60%, gray below"
  - "5-minute staleTime for suggestions query cache"

patterns-established:
  - "Suggestion cards with inline edit mode for modifying target"
  - "Pending state tracking with signalId for individual loading indicators"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 17 Plan 03: Review UI Summary

**Collapsible AI suggestions banner with SuggestionCard accept/reject/modify actions integrated into signals page**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T23:58:54Z
- **Completed:** 2026-01-24T00:01:40Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created SuggestionCard component with accept/reject/edit actions and loading states
- Created SignalSuggestionsBanner with collapsible list and React Query integration
- Integrated banner into signals page above SignalsTable
- Banner auto-hides when no suggestions available

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SuggestionCard Component** - `6ab5e33` (feat)
2. **Task 2: Create SignalSuggestionsBanner Component** - `1d92961` (feat)
3. **Task 3: Integrate Banner into Signals Page** - `4f5c720` (feat)

## Files Created/Modified

- `orchestrator/src/components/signals/SuggestionCard.tsx` - Individual suggestion display with accept/reject/edit actions (182 lines)
- `orchestrator/src/components/signals/SignalSuggestionsBanner.tsx` - Collapsible banner with React Query fetch and mutations (173 lines)
- `orchestrator/src/app/(dashboard)/workspace/[id]/signals/SignalsPageClient.tsx` - Added banner import and render

## Decisions Made

- **linkReason for AI acceptance:** Using "AI-suggested association accepted by user" as the reason when accepting a suggestion
- **Session-only dismiss all:** The "Dismiss All" button only hides the banner for the current session, does not call API to dismiss each suggestion
- **Confidence color thresholds:** Green for >= 80%, amber for >= 60%, gray otherwise
- **Query cache staleTime:** 5 minutes for suggestions query to reduce API calls

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Suggestions UI complete and integrated
- Users can accept/reject/modify AI suggestions
- Ready for Phase 17-04 (Suggestions UI - bulk operations) if not already complete
- Ready for Phase 18 (PRD Creation) which can use linked signals

---
*Phase: 17-smart-association*
*Completed: 2026-01-24*
