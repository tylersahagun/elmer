import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Tour state store for the post-onboarding tour system.
 *
 * Uses localStorage (not sessionStorage) so tour completion persists across
 * browser sessions - once a user has seen the tour, we remember it.
 */

export interface TourState {
  // Tour progress
  hasSeenTour: boolean;
  currentStep: number | null; // null = tour not active
  completedSteps: number[];

  // Prompt state
  hasDeclinedTour: boolean;
  showTourPrompt: boolean;

  // Actions
  startTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  endTour: () => void;
  dismissPrompt: (declined: boolean) => void;
  restartTour: () => void;
  showPrompt: () => void;

  // Helpers
  isStepCompleted: (step: number) => boolean;
  getTotalSteps: () => number;
  setTotalSteps: (total: number) => void;
}

/**
 * Internal state for tracking total steps (set by tour steps configuration)
 */
let totalStepsCount = 7; // Default, will be updated when tour-steps.ts is loaded

/**
 * Initial state for the tour store
 */
const initialState = {
  hasSeenTour: false,
  currentStep: null as number | null,
  completedSteps: [] as number[],
  hasDeclinedTour: false,
  showTourPrompt: false,
};

/**
 * Tour state Zustand store with localStorage persistence.
 *
 * State persists across browser sessions so we remember if the user
 * has seen or declined the tour. This is different from onboarding-store
 * which uses sessionStorage.
 */
export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Start the tour from the beginning
       */
      startTour: () => {
        set({
          currentStep: 0,
          completedSteps: [],
          showTourPrompt: false,
        });
      },

      /**
       * Advance to the next step, marking current step as completed
       */
      nextStep: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep === null) return;

        const newCompleted = completedSteps.includes(currentStep)
          ? completedSteps
          : [...completedSteps, currentStep];

        const nextStepIndex = currentStep + 1;

        // If we've reached the end, complete the tour
        if (nextStepIndex >= totalStepsCount) {
          set({
            hasSeenTour: true,
            currentStep: null,
            completedSteps: newCompleted,
          });
        } else {
          set({
            currentStep: nextStepIndex,
            completedSteps: newCompleted,
          });
        }
      },

      /**
       * Go back to the previous step
       */
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep === null || currentStep === 0) return;

        set({
          currentStep: currentStep - 1,
        });
      },

      /**
       * Skip the current step without marking it as completed
       */
      skipStep: () => {
        const { currentStep } = get();
        if (currentStep === null) return;

        const nextStepIndex = currentStep + 1;

        // If we've reached the end, complete the tour
        if (nextStepIndex >= totalStepsCount) {
          set({
            hasSeenTour: true,
            currentStep: null,
          });
        } else {
          set({
            currentStep: nextStepIndex,
          });
        }
      },

      /**
       * End the tour early, marking it as seen
       */
      endTour: () => {
        set({
          hasSeenTour: true,
          currentStep: null,
        });
      },

      /**
       * Dismiss the tour prompt
       * @param declined - If true, permanently decline the tour (don't show prompt again)
       */
      dismissPrompt: (declined: boolean) => {
        set({
          showTourPrompt: false,
          hasDeclinedTour: declined,
        });
      },

      /**
       * Restart the tour from the beginning (for help menu)
       * Keeps hasSeenTour true but resets progress
       */
      restartTour: () => {
        set({
          currentStep: 0,
          completedSteps: [],
          showTourPrompt: false,
        });
      },

      /**
       * Show the tour prompt (called after onboarding completes)
       */
      showPrompt: () => {
        const { hasSeenTour, hasDeclinedTour } = get();
        // Only show prompt if user hasn't seen or declined the tour
        if (!hasSeenTour && !hasDeclinedTour) {
          set({
            showTourPrompt: true,
            currentStep: null,  // Ensure spotlight doesn't render when prompt is showing
          });
        }
      },

      /**
       * Check if a specific step has been completed
       */
      isStepCompleted: (step: number) => {
        return get().completedSteps.includes(step);
      },

      /**
       * Get the total number of steps
       */
      getTotalSteps: () => {
        return totalStepsCount;
      },

      /**
       * Set the total number of steps (called by tour-steps.ts)
       */
      setTotalSteps: (total: number) => {
        totalStepsCount = total;
      },
    }),
    {
      name: 'elmer-tour',
      storage: createJSONStorage(() => localStorage),
      // Only persist the essential state, not functions or transient state
      partialize: (state) => ({
        hasSeenTour: state.hasSeenTour,
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        hasDeclinedTour: state.hasDeclinedTour,
        showTourPrompt: state.showTourPrompt,
      }),
    }
  )
);
