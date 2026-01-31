---
status: diagnosed
trigger: "welcome tour pops up but is behind a black transparent layer that I cannot click through and doesn't go away"
created: 2026-01-26T05:30:00Z
updated: 2026-01-26T05:45:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - z-index conflict where TourSpotlight (z-9999) renders on top of TourPromptModal (z-50) when both states are true due to localStorage persistence
test: Analyzed component code and state persistence
expecting: Found that both showTourPrompt and currentStep can be non-null simultaneously
next_action: Return diagnosis to orchestrator

## Symptoms

expected: After onboarding completes, tour prompt modal appears and user can interact with Start Tour / Maybe Later / X buttons
actual: Tour prompt modal appears BUT is behind a black transparent layer that blocks all interaction
errors: None reported - visual/interaction issue
reproduction: Complete onboarding wizard, tour prompt appears blocked on main page and all other pages
started: After onboarding completion flow implemented (01-05)

## Eliminated

## Evidence

- timestamp: 2026-01-26T05:30:00Z
  checked: UAT report and phase summaries
  found: Issue confirmed - "welcome tour pops up but is behind a black transparent layer that I cannot click through"
  implication: Tour prompt modal renders but something (likely spotlight overlay) is rendering on top blocking interaction

- timestamp: 2026-01-26T05:35:00Z
  checked: TourProvider.tsx rendering logic
  found: TourPromptModal renders with z-50 when showTourPrompt=true. TourSpotlight renders with z-[9999] when currentStep !== null (isTourActive)
  implication: If both conditions are true simultaneously, spotlight overlay (z-9999) appears on top of modal (z-50)

- timestamp: 2026-01-26T05:38:00Z
  checked: TourSpotlight.tsx overlay details
  found: Spotlight creates full-screen overlay with rgba(0,0,0,0.75) fill at z-[9999] with pointerEvents:auto
  implication: This is the "black transparent layer that cannot be clicked through" - it captures all clicks

- timestamp: 2026-01-26T05:40:00Z
  checked: tour-store.ts persistence configuration
  found: Both showTourPrompt AND currentStep are persisted to localStorage via Zustand persist
  implication: These states can get out of sync across sessions, allowing both to be true simultaneously

- timestamp: 2026-01-26T05:42:00Z
  checked: State mutation flow
  found: showPrompt() only sets showTourPrompt:true without resetting currentStep. startTour() sets currentStep:0 and showTourPrompt:false.
  implication: If user had a previous tour session (currentStep persisted), then triggers showPrompt() again, both states become true

- timestamp: 2026-01-26T05:44:00Z
  checked: Hydration scenario
  found: User could have currentStep from previous session in localStorage, then complete onboarding again (or on different workspace), calling showPrompt() which sets showTourPrompt:true without clearing currentStep
  implication: Root cause confirmed - states are not mutually exclusive and both can be true after hydration

## Resolution

root_cause: |
  **Z-INDEX CONFLICT DUE TO NON-MUTUALLY-EXCLUSIVE STATE**

  The TourSpotlight component renders at z-index 9999 while TourPromptModal renders at z-index 50.
  Both can render simultaneously because:

  1. Both `showTourPrompt` and `currentStep` are persisted to localStorage independently
  2. `showPrompt()` only sets `showTourPrompt: true` without clearing `currentStep`
  3. If a user has `currentStep` persisted from a previous tour session, then triggers `showPrompt()`
     (via completing onboarding again or on a different workspace), BOTH states become true
  4. TourProvider renders both components when their respective conditions are met:
     - `showTourPrompt && <TourPromptModal />` (z-50)
     - `isTourActive && <TourSpotlight />` (z-9999)
  5. The spotlight's black overlay (75% opacity) appears on top, blocking all interaction with the modal

fix: |
  Two options (recommend Option 1):

  **Option 1: Ensure mutual exclusivity in showPrompt()**
  In tour-store.ts, modify showPrompt() to also reset currentStep:
  ```typescript
  showPrompt: () => {
    const { hasSeenTour, hasDeclinedTour } = get();
    if (!hasSeenTour && !hasDeclinedTour) {
      set({
        showTourPrompt: true,
        currentStep: null  // ADD THIS - ensure spotlight doesn't render
      });
    }
  },
  ```

  **Option 2: Make rendering mutually exclusive in TourProvider**
  In TourProvider.tsx, only render spotlight if prompt is NOT showing:
  ```tsx
  {/* Tour Overlay (spotlight + step content) */}
  <AnimatePresence>
    {isTourActive && !showTourPrompt && (  // ADD !showTourPrompt check
      <>
        <TourSpotlight />
        ...
      </>
    )}
  </AnimatePresence>
  ```

verification:
files_changed: []
