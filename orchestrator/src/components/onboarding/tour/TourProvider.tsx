"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/stores/tour-store";
import { TourSpotlight } from "./TourSpotlight";
import { TourStep } from "./TourStep";
import {
  tourSteps,
  TOTAL_TOUR_STEPS,
  DEFAULT_AUTO_ADVANCE_MS,
} from "./tour-steps";

/**
 * TourProvider - Wraps the application to enable tour functionality.
 *
 * Features:
 * - Renders tour prompt modal when showTourPrompt is true
 * - Renders spotlight and step content when tour is active
 * - Provides tour context to child components
 * - Manages auto-advance progress tracking
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const {
    currentStep,
    showTourPrompt,
    startTour,
    dismissPrompt,
    nextStep,
    previousStep,
    skipStep,
    endTour,
    setTotalSteps,
  } = useTourStore();

  const [autoAdvanceProgress, setAutoAdvanceProgress] = React.useState(0);

  // Set total steps count on mount
  React.useEffect(() => {
    setTotalSteps(TOTAL_TOUR_STEPS);
  }, [setTotalSteps]);

  // Auto-advance progress tracking
  React.useEffect(() => {
    if (currentStep === null) {
      setAutoAdvanceProgress(0);
      return;
    }

    const step = tourSteps[currentStep];
    if (!step) return;

    const duration = step.autoAdvanceMs ?? DEFAULT_AUTO_ADVANCE_MS;
    const interval = 50; // Update every 50ms for smooth progress
    const increment = (interval / duration) * 100;

    const progressInterval = setInterval(() => {
      setAutoAdvanceProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, interval);

    // Reset progress when step changes
    setAutoAdvanceProgress(0);

    return () => clearInterval(progressInterval);
  }, [currentStep]);

  // Open/close workspace menu based on step needs
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const step = currentStep === null ? null : tourSteps[currentStep];
    const shouldOpen = Boolean(step?.requiresMenuOpen);
    window.dispatchEvent(
      new CustomEvent("tour:menu", { detail: { open: shouldOpen } }),
    );
  }, [currentStep]);

  const isTourActive = currentStep !== null;

  return (
    <>
      {children}

      {/* Tour Prompt Modal */}
      <AnimatePresence>
        {showTourPrompt && (
          <TourPromptModal
            onStart={() => {
              dismissPrompt(false);
              startTour();
            }}
            onMaybeLater={() => dismissPrompt(false)}
            onDismiss={() => dismissPrompt(true)}
          />
        )}
      </AnimatePresence>

      {/* Tour Overlay (spotlight + step content) */}
      <AnimatePresence>
        {isTourActive && !showTourPrompt && (
          <>
            <TourSpotlight />
            {currentStep !== null && tourSteps[currentStep] && (
              <TourStepOverlay
                step={tourSteps[currentStep]}
                currentIndex={currentStep}
                totalSteps={TOTAL_TOUR_STEPS}
                autoAdvanceProgress={autoAdvanceProgress}
                onNext={nextStep}
                onPrevious={previousStep}
                onSkip={skipStep}
                onEndTour={endTour}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Tour prompt modal shown after onboarding completes.
 */
interface TourPromptModalProps {
  onStart: () => void;
  onMaybeLater: () => void;
  onDismiss: () => void;
}

function TourPromptModal({
  onStart,
  onMaybeLater,
  onDismiss,
}: TourPromptModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-popover border rounded-xl shadow-xl p-6 max-w-md mx-4"
      >
        {/* Permanent dismiss button (X) */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Don't show again"
          title="Don't show this again"
        >
          <X className="size-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="size-6 text-primary" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-center mb-2">Take a Tour?</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          See how everything works together in about 2 minutes. We'll show you
          the key features and how to get the most out of your workspace.
        </p>

        {/* Time estimate */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
          <Clock className="size-3" />
          <span>Takes about 2 minutes</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onStart} className="w-full gap-2">
            <Play className="size-4" />
            Start Tour
          </Button>
          <Button variant="ghost" onClick={onMaybeLater} className="w-full">
            Maybe Later
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Tour step overlay - positions step content relative to spotlight
 */
interface TourStepOverlayProps {
  step: (typeof tourSteps)[number];
  currentIndex: number;
  totalSteps: number;
  autoAdvanceProgress: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onEndTour: () => void;
}

function TourStepOverlay({
  step,
  currentIndex,
  totalSteps,
  autoAdvanceProgress,
  onNext,
  onPrevious,
  onSkip,
  onEndTour,
}: TourStepOverlayProps) {
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  // Track target element position for positioning step content
  React.useEffect(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(step.target as string);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [step.target]);

  // Calculate position for step content
  const getStepPosition = (): React.CSSProperties => {
    if (!step.target || !targetRect) {
      // Center for welcome step
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const stepWidth = 384; // max-w-sm

    switch (step.placement) {
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: "translateY(-50%)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + padding,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <div className="fixed z-[10000] max-w-sm" style={getStepPosition()}>
      <TourStep
        step={step}
        currentIndex={currentIndex}
        totalSteps={totalSteps}
        autoAdvanceProgress={autoAdvanceProgress}
        onNext={onNext}
        onPrevious={onPrevious}
        onSkip={onSkip}
        onEndTour={onEndTour}
        placement={step.placement}
      />
    </div>
  );
}

/**
 * Custom hook to access tour functions from child components
 */
export function useTour() {
  return useTourStore();
}

export default TourProvider;
