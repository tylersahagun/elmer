---
phase: 01-onboarding-foundation-a-repository-connection
plan: 07
subsystem: ui
tags: [zustand, tour, z-index, state-management, modal]

# Dependency graph
requires:
  - phase: 01-04
    provides: Tour store with showPrompt() action
  - phase: 01-05
    provides: TourProvider with spotlight rendering
provides:
  - Mutually exclusive tour prompt and spotlight states
  - Defensive rendering preventing overlay blocking modal
  - Fully interactive tour prompt modal after onboarding
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "State mutual exclusivity: setting showTourPrompt also resets currentStep"
    - "Defensive rendering: double-check state in render condition"

key-files:
  created: []
  modified:
    - src/lib/stores/tour-store.ts
    - src/components/onboarding/tour/TourProvider.tsx

key-decisions:
  - "Belt-and-suspenders approach: fix root cause AND add defensive check"

patterns-established:
  - "When showing UI A, explicitly disable conflicting UI B in same set() call"

# Metrics
duration: 3min
completed: 2026-01-26
---

# Phase 1 Plan 7: Gap Closure - Tour Modal Z-Index Fix Summary

**Fixed z-index conflict where TourSpotlight (z-9999) rendered on top of TourPromptModal (z-50) by ensuring mutual exclusivity in state and adding defensive render check**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-26
- **Completed:** 2026-01-26
- **Tasks:** 3 (2 with code changes, 1 verification-only)
- **Files modified:** 2

## Accomplishments
- Modified showPrompt() to set currentStep: null when showing tour prompt
- Added !showTourPrompt condition to TourSpotlight rendering in TourProvider
- Fixed UAT Test 12 blocker: tour prompt modal was behind black overlay

## Task Commits

Each task was committed atomically:

1. **Task 1: Ensure mutual exclusivity in showPrompt()** - `d065230` (fix)
2. **Task 2: Add defensive rendering check in TourProvider** - `2e7bc74` (fix)
3. **Task 3: Verify the fix works end-to-end** - No commit (verification only)

## Files Created/Modified
- `src/lib/stores/tour-store.ts` - showPrompt() now sets { showTourPrompt: true, currentStep: null }
- `src/components/onboarding/tour/TourProvider.tsx` - Tour overlay condition changed to {isTourActive && !showTourPrompt && (...)}

## Root Cause Analysis

The bug occurred because:
1. localStorage persisted `currentStep` value from previous tour sessions
2. When `showPrompt()` was called after onboarding, it only set `showTourPrompt: true`
3. With a lingering `currentStep` value, `isTourActive` (currentStep !== null) remained true
4. Both TourPromptModal (z-50) and TourSpotlight (z-9999) rendered simultaneously
5. TourSpotlight's higher z-index blocked all interaction with the modal

## The Fix

**Primary fix (tour-store.ts):**
```typescript
showPrompt: () => {
  if (!hasSeenTour && !hasDeclinedTour) {
    set({
      showTourPrompt: true,
      currentStep: null,  // Clears any lingering state
    });
  }
}
```

**Defensive fix (TourProvider.tsx):**
```tsx
{isTourActive && !showTourPrompt && (
  <>
    <TourSpotlight />
    ...
  </>
)}
```

## Decisions Made
- Belt-and-suspenders approach: Fixed root cause (state mutation) AND added defensive check (render condition). Either fix alone would solve the issue, but both together provide robustness against edge cases.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in codebase (GitHub API route) unrelated to tour components

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 gap closure complete (both 01-06 and 01-07)
- Tour prompt modal now fully interactive after onboarding
- Ready for Phase 2: Discovery & Population

---
*Phase: 01-onboarding-foundation-a-repository-connection*
*Plan: 07 (gap closure)*
*Completed: 2026-01-26*
