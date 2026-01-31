---
phase: 01-onboarding-foundation-a-repository-connection
plan: 04
subsystem: ui
tags: [tour, zustand, framer-motion, onboarding, spotlight]

# Dependency graph
requires:
  - phase: 01-01
    provides: Wizard foundation with Zustand store pattern
provides:
  - Tour state store with localStorage persistence
  - Tour step definitions for 7 workspace features
  - TourProvider context and components
  - TourSpotlight overlay with animated cutout
  - TourStep navigation UI
affects: [01-05, help-menu, onboarding-completion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SVG mask for spotlight cutout effect
    - Zustand persist with localStorage for tour state
    - Motion spring transitions for spotlight movement

key-files:
  created:
    - src/lib/stores/tour-store.ts
    - src/components/onboarding/tour/tour-steps.ts
    - src/components/onboarding/tour/TourStep.tsx
    - src/components/onboarding/tour/TourSpotlight.tsx
    - src/components/onboarding/tour/TourProvider.tsx
    - src/components/onboarding/tour/index.ts
  modified: []

key-decisions:
  - "localStorage for tour state (persists across sessions, unlike onboarding sessionStorage)"
  - "SVG mask approach for spotlight cutout (cleaner than CSS clip-path)"
  - "Auto-advance with progress bar (8-10 seconds per step)"
  - "Tour prompt with Start/Maybe Later/Decline options (X permanently dismisses)"

patterns-established:
  - "data-tour attributes for targeting tour step elements"
  - "Tour step placement: top/bottom/left/right/center"

# Metrics
duration: 6 min
completed: 2026-01-26
---

# Phase 01 Plan 04: Post-Onboarding Tour System Summary

**Zustand tour store with localStorage persistence, 7-step tour definitions covering kanban/knowledge/personas/signals/agents/GitHub, and React components for spotlight overlay and step navigation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-26T04:31:59Z
- **Completed:** 2026-01-26T04:37:32Z
- **Tasks:** 3
- **Files created:** 6

## Accomplishments

- Tour state store with start/next/previous/skip/end/restart actions
- Tour step definitions for 7 features with targets, titles, content, and examples
- TourProvider wraps app and renders prompt modal + spotlight overlay
- TourSpotlight uses SVG mask for animated spotlight cutout effect
- TourStep displays content with navigation and auto-advance progress bar

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Tour State Store** - `65e3a92` (feat)
2. **Task 2: Define Tour Steps Configuration** - `f8a0c55` (feat)
3. **Task 3: Create Tour Components** - `ee24eb9` (feat)

## Files Created/Modified

- `src/lib/stores/tour-store.ts` - Zustand store for tour state with localStorage persistence
- `src/components/onboarding/tour/tour-steps.ts` - 7 tour step definitions with targets and content
- `src/components/onboarding/tour/TourProvider.tsx` - Context provider with prompt modal and tour overlay
- `src/components/onboarding/tour/TourSpotlight.tsx` - SVG overlay with animated spotlight cutout
- `src/components/onboarding/tour/TourStep.tsx` - Step content with navigation controls
- `src/components/onboarding/tour/index.ts` - Barrel exports for tour system

## Decisions Made

1. **localStorage for tour persistence** - Tour completion should persist across browser sessions (unlike onboarding which uses sessionStorage and clears on close)
2. **SVG mask for spotlight** - Cleaner implementation than CSS clip-path, allows smooth spring animations
3. **Separate dismissal modes** - "Maybe Later" just hides prompt, X button permanently declines (hasDeclinedTour)
4. **data-tour attributes** - Targets use CSS selectors like `[data-tour="kanban-board"]` for element targeting

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Tour infrastructure complete, ready for integration
- Plan 01-05 will trigger tour prompt after onboarding completion via `useTourStore.showPrompt()`
- Help menu can restart tour via `useTourStore.restartTour()`
- Target elements need `data-tour` attributes added to workspace components

---
*Phase: 01-onboarding-foundation-a-repository-connection*
*Completed: 2026-01-26*
