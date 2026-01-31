import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Onboarding wizard steps in order of progression
 */
export type OnboardingStep =
  | "welcome"
  | "connect-github"
  | "select-repo"
  | "discover" // Discovery and import step
  | "complete";

/**
 * Step configuration for determining order and navigation
 */
const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "connect-github",
  "select-repo",
  "discover", // After repo selection, before complete
  "complete",
];

/**
 * GitHub repository reference (populated during repo selection step)
 */
export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  owner: string;
  private: boolean;
  defaultBranch: string;
  topics: string[];
  htmlUrl: string;
}

/**
 * Error state for onboarding errors
 */
export interface OnboardingError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: string;
}

/**
 * Onboarding store state shape
 */
export interface OnboardingState {
  // Workspace scoping - ensures state is isolated per workspace
  workspaceId: string | null;

  // Step tracking
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];

  // Repository data (populated by repo step)
  selectedRepo: GitHubRepo | null;
  selectedBranch: string | null;
  useTemplate: boolean;

  // Error state (excluded from persistence)
  lastError: OnboardingError | null;

  // Session tracking
  startedAt: string | null;
  lastUpdatedAt: string | null;

  // Actions
  initForWorkspace: (workspaceId: string) => void;
  setStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep) => void;
  skipStep: (step: OnboardingStep) => void;
  goBack: () => void;
  setRepo: (repo: GitHubRepo, branch: string) => void;
  setTemplate: (enabled: boolean) => void;
  setError: (error: OnboardingError | null) => void;
  reset: () => void;
  getProgress: () => { current: number; total: number; percentage: number };
  getStepIndex: (step: OnboardingStep) => number;
  canGoBack: () => boolean;
  isFirstStep: () => boolean;
  isLastStep: () => boolean;
}

/**
 * Initial state for the onboarding store
 */
const initialState = {
  workspaceId: null as string | null,
  currentStep: "welcome" as OnboardingStep,
  completedSteps: [] as OnboardingStep[],
  skippedSteps: [] as OnboardingStep[],
  selectedRepo: null,
  selectedBranch: null,
  useTemplate: false,
  lastError: null,
  startedAt: null,
  lastUpdatedAt: null,
};

/**
 * Onboarding wizard Zustand store with sessionStorage persistence.
 *
 * State persists across page refreshes during the onboarding session
 * but clears when the browser closes (sessionStorage vs localStorage).
 *
 * Error state is excluded from persistence to avoid stale errors on refresh.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Initialize onboarding for a specific workspace.
       * If the store contains state for a different workspace, it resets.
       * This ensures each workspace gets a fresh onboarding experience.
       */
      initForWorkspace: (workspaceId) => {
        const { workspaceId: currentId } = get();
        if (currentId && currentId !== workspaceId) {
          // Different workspace - reset state completely
          set({
            ...initialState,
            workspaceId,
            lastError: null,
          });
        } else if (!currentId) {
          // No workspace set yet - initialize with this one
          set({ workspaceId });
        }
        // If same workspace, do nothing - keep existing state
      },

      setStep: (step) => {
        const now = new Date().toISOString();
        set((state) => ({
          currentStep: step,
          lastUpdatedAt: now,
          startedAt: state.startedAt ?? now,
        }));
      },

      completeStep: (step) => {
        const now = new Date().toISOString();
        set((state) => {
          const completedSteps = state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step];

          // Remove from skipped if it was previously skipped
          const skippedSteps = state.skippedSteps.filter((s) => s !== step);

          // Move to next step automatically
          const currentIndex = STEP_ORDER.indexOf(step);
          const nextStep = STEP_ORDER[currentIndex + 1] ?? step;

          return {
            completedSteps,
            skippedSteps,
            currentStep: nextStep,
            lastUpdatedAt: now,
            startedAt: state.startedAt ?? now,
          };
        });
      },

      skipStep: (step) => {
        const now = new Date().toISOString();
        set((state) => {
          const skippedSteps = state.skippedSteps.includes(step)
            ? state.skippedSteps
            : [...state.skippedSteps, step];

          // Move to next step automatically
          const currentIndex = STEP_ORDER.indexOf(step);
          const nextStep = STEP_ORDER[currentIndex + 1] ?? step;

          return {
            skippedSteps,
            currentStep: nextStep,
            lastUpdatedAt: now,
            startedAt: state.startedAt ?? now,
          };
        });
      },

      goBack: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex > 0) {
          const previousStep = STEP_ORDER[currentIndex - 1];
          set({
            currentStep: previousStep,
            lastUpdatedAt: new Date().toISOString(),
          });
        }
      },

      setRepo: (repo, branch) => {
        set({
          selectedRepo: repo,
          selectedBranch: branch,
          useTemplate: false,
          lastUpdatedAt: new Date().toISOString(),
        });
      },

      setTemplate: (enabled) => {
        set({
          useTemplate: enabled,
          selectedRepo: null,
          selectedBranch: null,
          lastUpdatedAt: new Date().toISOString(),
        });
      },

      setError: (error) => {
        set({ lastError: error });
      },

      reset: () => {
        set({
          ...initialState,
          lastError: null,
        });
      },

      getProgress: () => {
        const { currentStep, completedSteps, skippedSteps } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);
        const totalSteps = STEP_ORDER.length;
        const processedSteps = completedSteps.length + skippedSteps.length;

        // Calculate percentage based on current position
        // We use current step index for visual progress
        const percentage = Math.round((currentIndex / (totalSteps - 1)) * 100);

        return {
          current: currentIndex + 1,
          total: totalSteps,
          percentage: Math.min(percentage, 100),
        };
      },

      getStepIndex: (step) => {
        return STEP_ORDER.indexOf(step);
      },

      canGoBack: () => {
        const { currentStep } = get();
        return STEP_ORDER.indexOf(currentStep) > 0;
      },

      isFirstStep: () => {
        const { currentStep } = get();
        return STEP_ORDER.indexOf(currentStep) === 0;
      },

      isLastStep: () => {
        const { currentStep } = get();
        return STEP_ORDER.indexOf(currentStep) === STEP_ORDER.length - 1;
      },
    }),
    {
      name: "elmer-onboarding",
      storage: createJSONStorage(() => sessionStorage),
      // Exclude error state from persistence to avoid stale errors on refresh
      // Include workspaceId to detect when switching between workspaces
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        skippedSteps: state.skippedSteps,
        selectedRepo: state.selectedRepo,
        selectedBranch: state.selectedBranch,
        useTemplate: state.useTemplate,
        startedAt: state.startedAt,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    },
  ),
);

/**
 * Export step order for use in components
 */
export { STEP_ORDER };
