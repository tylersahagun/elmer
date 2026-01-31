"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, SkipForward, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useOnboardingStore,
  type OnboardingStep,
  STEP_ORDER,
} from "@/lib/stores/onboarding-store";

interface OnboardingStepWrapperProps {
  /** Current step identifier */
  step: OnboardingStep;
  /** Step title displayed at the top */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Handler called when user clicks Next/Continue */
  onNext: () => Promise<void> | void;
  /** Validation function - returns true if step is valid and Next should be enabled */
  onValidate?: () => boolean;
  /** Step content */
  children: React.ReactNode;
  /** External loading state (e.g., from async operations) */
  isLoading?: boolean;
  /** Custom next button text */
  nextButtonText?: string;
}

/**
 * Step wrapper component providing consistent layout and navigation.
 *
 * Features:
 * - Back button (if not first step)
 * - Next/Continue button with loading state
 * - Skip button for optional steps
 * - Resume detection on mount (shows toast if resuming)
 * - Consistent header with title and description
 * - Animated transitions between steps
 */
export function OnboardingStepWrapper({
  step,
  title,
  description,
  optional = false,
  onNext,
  onValidate,
  children,
  isLoading = false,
  nextButtonText,
}: OnboardingStepWrapperProps) {
  const {
    currentStep,
    goBack,
    skipStep,
    isFirstStep,
    isLastStep,
    startedAt,
    lastUpdatedAt,
    getStepIndex,
  } = useOnboardingStore();

  const [internalLoading, setInternalLoading] = React.useState(false);
  const [hasShownResume, setHasShownResume] = React.useState(false);

  const loading = isLoading || internalLoading;
  const canGoBack = !isFirstStep();
  const isValid = onValidate ? onValidate() : true;
  const isComplete = step === "complete";

  // Determine button text
  const buttonText = nextButtonText ?? (isComplete ? "Finish" : "Continue");

  // Check for resume on mount
  React.useEffect(() => {
    // Only show resume prompt once per session
    if (hasShownResume) return;

    // If we have startedAt and this isn't the first step, user is resuming
    const stepIndex = getStepIndex(currentStep);
    if (startedAt && stepIndex > 0) {
      // Show resume notification - in a real app this would be a toast
      // For now we'll just log it; toast library can be added later
      console.info(
        `[Onboarding] Resumed from step ${stepIndex + 1}: ${currentStep}`
      );
      setHasShownResume(true);
    }
  }, [startedAt, currentStep, getStepIndex, hasShownResume]);

  const handleNext = async () => {
    if (!isValid || loading) return;

    try {
      setInternalLoading(true);
      await onNext();
    } catch (error) {
      // Error handling will be caught by the error boundary
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const handleSkip = () => {
    if (optional && !loading) {
      skipStep(step);
    }
  };

  const handleBack = () => {
    if (canGoBack && !loading) {
      goBack();
    }
  };

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight"
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-muted-foreground"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t">
        {/* Back button */}
        <div>
          {canGoBack && (
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={loading}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
        </div>

        {/* Right side: Skip and Next buttons */}
        <div className="flex items-center gap-3">
          {/* Skip button for optional steps */}
          {optional && !isComplete && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="gap-2 text-muted-foreground"
            >
              <SkipForward className="size-4" />
              I'll do this later
            </Button>
          )}

          {/* Next/Continue button */}
          <Button
            onClick={handleNext}
            disabled={!isValid || loading}
            className="gap-2 min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {buttonText}
                {!isComplete && <ArrowRight className="size-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default OnboardingStepWrapper;
