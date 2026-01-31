/**
 * Tour system for post-onboarding feature walkthrough.
 *
 * Exports:
 * - TourProvider: Wrap app to enable tour functionality
 * - useTour: Hook to access tour state and actions
 * - TourSpotlight: Overlay component that highlights elements
 * - TourStep: Step content component
 * - tourSteps: Step definitions
 * - Types: TourStepDefinition, TourStepPlacement
 */

export { TourProvider, useTour } from "./TourProvider";
export { TourSpotlight } from "./TourSpotlight";
export { TourStep, type TourStepProps } from "./TourStep";
export {
  tourSteps,
  TOTAL_TOUR_STEPS,
  DEFAULT_AUTO_ADVANCE_MS,
  getTourStepById,
  getTourStepByIndex,
  validateTourSteps,
  type TourStepDefinition,
  type TourStepPlacement,
} from "./tour-steps";
