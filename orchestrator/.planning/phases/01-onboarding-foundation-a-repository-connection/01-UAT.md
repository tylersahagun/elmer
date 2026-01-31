---
status: diagnosed
phase: 01-onboarding-foundation-a-repository-connection
source:
  - 01-01-SUMMARY.md
  - 01-02-SUMMARY.md
  - 01-03-SUMMARY.md
  - 01-04-SUMMARY.md
  - 01-05-SUMMARY.md
  - 01-06-SUMMARY.md
started: 2026-01-26T04:50:00Z
updated: 2026-01-26T05:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to onboarding wizard
expected: Navigate to /workspace/[id]/onboarding. Wizard page loads showing welcome step with workspace name and progress bar at bottom showing 0% completion.
result: pass
note: Fixed by Plan 01-06 (step configuration sync)

### 2. Progress bar displays correctly
expected: Progress bar appears at bottom of wizard (not top), shows only progress percentage (no circles, checkmarks, or "Step X of Y" text), updates as you move through steps.
result: pass

### 3. Welcome step to Connect GitHub
expected: Click "Get Started" or "Continue" on welcome step. Wizard advances to Connect GitHub step. Progress bar increases.
result: pass
note: Fixed by Plan 01-06 (wizard now renders correctly)

### 4. Connect GitHub OAuth
expected: Click "Connect GitHub" button. OAuth flow initiates. After authentication, returns to wizard showing connected status with user avatar/username and green checkmark.
result: pass

### 5. Continue requires manual click
expected: After GitHub connection is validated, wizard does NOT auto-advance. "Continue" button becomes enabled. Must click Continue to proceed to next step.
result: pass

### 6. Select repository step
expected: After clicking Continue, see repository selection step with searchable list. "Recently Updated" section shows repos pushed within 7 days at top. Can search/filter repositories.
result: pass

### 7. Select branch
expected: After selecting a repository, branch selector appears below showing available branches with default branch pre-selected (e.g., "main").
result: pass

### 8. Complete onboarding
expected: After selecting repo and branch, click Continue. Wizard advances to completion step showing summary of configuration (repo name, branch). "Go to Workspace" button appears.
result: pass

### 9. Tour prompt appears
expected: After onboarding completes, tour prompt modal appears with "Take a Tour?" message. Shows "Start Tour", "Maybe Later", and X button options.
result: pass

### 10. State persists across refresh
expected: During onboarding (before completion), refresh the page. Wizard should return to the same step you were on, with progress preserved.
result: pass

### 11. Back navigation works
expected: Click Back button during wizard. Returns to previous step. Clicking Continue again advances forward without auto-skipping.
result: pass

### 12. Settings page shows onboarding status
expected: After onboarding complete, navigate to workspace settings. See "Onboarding Status" card showing completion date and "Re-sync from GitHub" button.
result: issue
reported: "I can't get to the settings page because the welcome tour pops up but is behind a black transparent layer that I cannot click through and doesn't go away. This is on the main page, and all other pages after onboarding is complete"
severity: blocker

## Summary

total: 12
passed: 11
issues: 1
pending: 0
skipped: 0

## Gaps

Previous gaps closed by Plan 01-06 (Step Configuration Sync):

- truth: "Wizard page loads showing welcome step with workspace name and progress bar at bottom showing 0% completion"
  status: fixed
  fixed_by: "Plan 01-06"
  test: 1

- truth: "Click Get Started or Continue on welcome step and wizard advances to Connect GitHub step with progress bar increasing"
  status: fixed
  fixed_by: "Plan 01-06"
  test: 3

New gap found:

- truth: "After onboarding completes, user can navigate to other pages without obstruction"
  status: failed
  reason: "User reported: I can't get to the settings page because the welcome tour pops up but is behind a black transparent layer that I cannot click through and doesn't go away. This is on the main page, and all other pages after onboarding is complete"
  severity: blocker
  test: 12
  root_cause: "Z-index conflict due to non-mutually-exclusive state in tour system. Both showTourPrompt and currentStep can be true simultaneously due to localStorage persistence. TourSpotlight (z-index 9999) renders on top of TourPromptModal (z-index 50). showPrompt() sets showTourPrompt: true without clearing currentStep, causing spotlight's black overlay to block modal interaction."
  artifacts:
    - path: "src/lib/stores/tour-store.ts"
      issue: "showPrompt() doesn't reset currentStep to null (lines 174-180)"
    - path: "src/components/onboarding/tour/TourProvider.tsx"
      issue: "Both modals can render simultaneously (lines 82-114)"
    - path: "src/components/onboarding/tour/TourSpotlight.tsx"
      issue: "High z-index (9999) overlay blocks lower z-index content"
  missing:
    - "Modify showPrompt() in tour-store.ts to set currentStep: null"
    - "Add conditional check to prevent spotlight rendering when prompt is showing"
  debug_session: ".planning/debug/tour-modal-blocked-by-overlay.md"
