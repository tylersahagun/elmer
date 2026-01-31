/**
 * Onboarding wizard components
 *
 * Provides the foundation for the multi-step onboarding wizard including:
 * - State management with session persistence
 * - Progress visualization
 * - Step navigation with back/skip capabilities
 * - Error handling with retry functionality
 * - Complete wizard orchestration
 */

// Components
export { OnboardingWizard } from "./OnboardingWizard";
export { OnboardingProgress, type StepConfig } from "./OnboardingProgress";
export { OnboardingStepWrapper } from "./OnboardingStepWrapper";
export { OnboardingErrorBoundary } from "./OnboardingErrorBoundary";
export { ImportProgressModal } from "./ImportProgressModal";

// Step components
export { ConnectGitHubStep } from "./steps/ConnectGitHubStep";
export { SelectRepoStep } from "./steps/SelectRepoStep";

// Store and types (re-export for convenience)
export {
  useOnboardingStore,
  STEP_ORDER,
  type OnboardingStep,
  type OnboardingState,
  type OnboardingError,
  type GitHubRepo,
} from "@/lib/stores/onboarding-store";
