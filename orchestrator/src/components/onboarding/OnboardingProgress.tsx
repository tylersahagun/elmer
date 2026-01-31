"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  useOnboardingStore,
  type OnboardingStep,
} from "@/lib/stores/onboarding-store";

/**
 * Step configuration for the progress indicator
 */
export interface StepConfig {
  id: OnboardingStep;
  label: string;
  optional?: boolean;
}

interface OnboardingProgressProps {
  steps: StepConfig[];
  className?: string;
}

/**
 * Simple progress indicator showing only a progress bar.
 *
 * Features:
 * - Clean progress bar with percentage
 * - Animated percentage changes
 * - Minimal design (no step circles, checkmarks, or step text)
 */
export function OnboardingProgress({
  steps,
  className,
}: OnboardingProgressProps) {
  const { currentStep, completedSteps, skippedSteps } = useOnboardingStore();

  // Calculate progress based on visible steps only
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const totalSteps = steps.length;

  // Defensive: if currentStep not found in steps array, default to 0
  // This handles stale sessionStorage values or edge cases during hydration
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;

  // Calculate percentage based on current position in the visible steps
  // We use safeCurrentIndex for visual progress (0% at start, 100% at end)
  const percentage = totalSteps > 1
    ? Math.round((safeCurrentIndex / (totalSteps - 1)) * 100)
    : 0;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar only */}
      <div className="relative">
        <Progress
          value={percentage}
          className="h-1.5"
        />
        {/* Percentage indicator - appears at the end of the bar */}
        <motion.div
          key={percentage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-6 text-xs text-muted-foreground tabular-nums"
          style={{
            left: `${Math.min(percentage, 95)}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {percentage}%
        </motion.div>
      </div>
    </div>
  );
}

export default OnboardingProgress;
