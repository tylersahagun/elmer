---
status: diagnosed
trigger: "Investigate this bug found during Phase 01 UAT: wizard page blank with progress value error"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:12:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - sessionStorage contains currentStep='configure' from previous session, but STEP_CONFIGS excludes 'configure'. findIndex returns -1, causing Math.round((-1/3)*100) = -33.
test: verified math and step configuration mismatch
expecting: root cause confirmed
next_action: document root cause

## Symptoms

expected: Navigate to /workspace/[id]/onboarding. Wizard page loads showing welcome step with workspace name and progress bar at bottom showing 0% completion.
actual: Page is blank with errors in console
errors:
  - Invalid prop `value` of value `-33` supplied to `Progress`. The `value` prop must be a positive number.
  - Hydration mismatch error
  - Stack trace points to OnboardingProgress.tsx line 54
reproduction: Navigate to /workspace/[id]/onboarding route
started: Phase 01 UAT
severity: blocker

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:05:00Z
  checked: OnboardingProgress.tsx calculation logic (lines 41-48)
  found: |
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    const totalSteps = steps.length;
    const percentage = totalSteps > 1
      ? Math.round((currentIndex / (totalSteps - 1)) * 100)
      : 0;
  implication: If findIndex returns -1 (not found), percentage = Math.round((-1 / 3) * 100) = -33

- timestamp: 2026-01-25T00:06:00Z
  checked: OnboardingWizard.tsx STEP_CONFIGS (lines 42-47)
  found: |
    const STEP_CONFIGS: StepConfig[] = [
      { id: "welcome", label: "Welcome" },
      { id: "connect-github", label: "Connect GitHub" },
      { id: "select-repo", label: "Select Repository" },
      { id: "complete", label: "Complete" },
    ];
    // Note: Comments say "Configure step is hidden for Phase 1"
  implication: STEP_CONFIGS has 4 steps (totalSteps=4, so totalSteps-1=3)

- timestamp: 2026-01-25T00:07:00Z
  checked: onboarding-store.ts STEP_ORDER (lines 17-23)
  found: |
    const STEP_ORDER: OnboardingStep[] = [
      'welcome',
      'connect-github',
      'select-repo',
      'configure',
      'complete',
    ];
  implication: Store has 5 steps including 'configure'

- timestamp: 2026-01-25T00:08:00Z
  checked: Store initialization
  found: |
    const initialState = {
      currentStep: 'welcome' as OnboardingStep,
      ...
    };
  implication: Store starts at 'welcome' which IS in STEP_CONFIGS, so shouldn't be -1

- timestamp: 2026-01-25T00:09:00Z
  checked: Store persistence mechanism (line 236)
  found: storage: createJSONStorage(() => sessionStorage)
  implication: Zustand persists to sessionStorage. Server has no sessionStorage, client does. HYDRATION MISMATCH.

- timestamp: 2026-01-25T00:10:00Z
  checked: Partialize function (lines 238-246)
  found: Only persists specific fields, excludes lastError
  implication: If sessionStorage has old data from previous session, currentStep could be 'configure' which is NOT in STEP_CONFIGS

- timestamp: 2026-01-25T00:11:00Z
  checked: Verified math calculation
  found: |
    If currentStep='configure' (not in STEP_CONFIGS):
    - currentIndex = steps.findIndex((s) => s.id === 'configure') = -1
    - totalSteps = 4 (STEP_CONFIGS.length)
    - percentage = Math.round((-1 / (4-1)) * 100)
    - percentage = Math.round((-1 / 3) * 100)
    - percentage = Math.round(-33.333...)
    - percentage = -33
  implication: EXACT MATCH to error message "value of value `-33`"

- timestamp: 2026-01-25T00:12:00Z
  checked: handleRepoSelected in OnboardingWizard.tsx (lines 108-109)
  found: |
    completeStep("select-repo");
    completeStep("configure");
  implication: Code explicitly completes 'configure' step even though it's not in STEP_CONFIGS. This advances currentStep to 'configure', which gets persisted to sessionStorage.

## Resolution

root_cause: |
  Step configuration mismatch between STEP_CONFIGS (used by UI) and STEP_ORDER (used by store).

  1. OnboardingWizard.tsx defines STEP_CONFIGS with 4 steps (excludes 'configure')
  2. onboarding-store.ts defines STEP_ORDER with 5 steps (includes 'configure')
  3. handleRepoSelected calls completeStep('configure'), advancing currentStep to 'configure'
  4. This gets persisted to sessionStorage
  5. On page reload/navigation, store hydrates from sessionStorage with currentStep='configure'
  6. OnboardingProgress.tsx calls steps.findIndex((s) => s.id === 'configure') where steps=STEP_CONFIGS
  7. findIndex returns -1 because 'configure' is not in STEP_CONFIGS
  8. percentage = Math.round((-1 / 3) * 100) = -33
  9. Progress component rejects negative value, causing error and hydration mismatch

  The code comments say "configure step is hidden for Phase 1" but the store still includes it,
  and the wizard still calls completeStep('configure'), creating this inconsistency.

fix:
verification:
files_changed: []
