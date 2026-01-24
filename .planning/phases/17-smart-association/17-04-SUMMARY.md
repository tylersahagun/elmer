---
phase: 17-smart-association
plan: 04
subsystem: ui
tags: [react, signals, bulk-operations, multi-select, tanstack-query]

# Dependency graph
requires:
  - phase: 17-02
    provides: Bulk operations API endpoint (/api/signals/bulk)
  - phase: 12.5
    provides: ProjectLinkCombobox component for project selection
provides:
  - BulkOperationsToolbar component for bulk action UI
  - BulkLinkModal for bulk project linking
  - BulkUnlinkModal for bulk project unlinking
  - Multi-select capability in SignalsTable with checkbox column
affects: [17-smart-association, signals-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Set<string> for multi-select state management
    - Selection reset on data change via useEffect dependency

key-files:
  created:
    - orchestrator/src/components/signals/BulkOperationsToolbar.tsx
    - orchestrator/src/components/signals/BulkLinkModal.tsx
    - orchestrator/src/components/signals/BulkUnlinkModal.tsx
  modified:
    - orchestrator/src/components/signals/SignalsTable.tsx
    - orchestrator/src/components/signals/SignalRow.tsx

key-decisions:
  - "Use Set<string> for selectedSignals state (O(1) add/remove/check)"
  - "Selection clears on data change to prevent stale references"
  - "Toolbar only shows when signals selected (progressive disclosure)"
  - "Checkbox click stops propagation to prevent row click handler"

patterns-established:
  - "Bulk operation flow: toolbar -> modal -> API -> clear selection"
  - "Optional props pattern for conditional row features (isSelected, onToggleSelect)"

# Metrics
duration: 3min
completed: 2026-01-23
---

# Phase 17 Plan 04: Bulk Operations UI Summary

**Multi-select signals with checkbox column, bulk toolbar, and link/unlink modals calling /api/signals/bulk**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-23T23:58:35Z
- **Completed:** 2026-01-24T00:01:41Z
- **Tasks:** 3
- **Files created:** 3
- **Files modified:** 2

## Accomplishments

- BulkOperationsToolbar shows selection count with Link/Unlink/Clear actions
- BulkLinkModal and BulkUnlinkModal with project selection via ProjectLinkCombobox
- SignalsTable has checkbox column with header select-all toggle
- SignalRow renders optional checkbox when selection enabled
- Selection automatically clears after successful bulk operation or page change

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BulkOperationsToolbar Component** - `4edd64a` (feat)
2. **Task 2: Create Bulk Link and Unlink Modals** - `eb9282d` (feat)
3. **Task 3: Add Multi-Select to SignalsTable and SignalRow** - `2893f16` (feat)

## Files Created/Modified

- `orchestrator/src/components/signals/BulkOperationsToolbar.tsx` - Selection count display and bulk action buttons
- `orchestrator/src/components/signals/BulkLinkModal.tsx` - Modal for selecting project to bulk link signals
- `orchestrator/src/components/signals/BulkUnlinkModal.tsx` - Modal for selecting project to bulk unlink signals
- `orchestrator/src/components/signals/SignalsTable.tsx` - Added selection state, toolbar, modals, and checkbox column header
- `orchestrator/src/components/signals/SignalRow.tsx` - Added optional checkbox with isSelected/onToggleSelect props

## Decisions Made

- **Set<string> for selection state:** O(1) operations for checking, adding, removing signal IDs
- **Selection clears on data?.signals change:** Prevents stale IDs when page/filters change
- **e.stopPropagation() on checkbox click:** Prevents row click handler from firing when selecting
- **Toolbar conditional render:** Only shows when selectedSignals.size > 0 for cleaner UI
- **Mutation reset on modal close:** Clears error/success state for fresh modal reopening

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Block-scoped variable 'data' used before declaration:** Initially placed useEffect that depends on `data?.signals` before the useQuery call. Fixed by moving the useEffect after the query definition.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Bulk operations UI complete and integrated with Phase 17-02 API
- Phase 17 (Smart Association) now complete with all 4 plans finished
- Ready for Phase 18 (PRD Generation)

---
*Phase: 17-smart-association*
*Completed: 2026-01-23*
