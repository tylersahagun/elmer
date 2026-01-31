'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TourStepDefinition, TourStepPlacement } from './tour-steps';

/**
 * Props for the TourStep component
 */
export interface TourStepProps {
  /** The step definition */
  step: TourStepDefinition;
  /** Current step index (0-based) */
  currentIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Progress through auto-advance (0-100) */
  autoAdvanceProgress: number;
  /** Called when user clicks Next or step auto-advances */
  onNext: () => void;
  /** Called when user clicks Previous */
  onPrevious: () => void;
  /** Called when user clicks Skip */
  onSkip: () => void;
  /** Called when user clicks End Tour (X button) */
  onEndTour: () => void;
  /** Position relative to spotlight */
  placement: TourStepPlacement;
  /** Additional class names */
  className?: string;
}

/**
 * Get positioning styles based on placement relative to the spotlight target
 */
function getPlacementStyles(placement: TourStepPlacement): string {
  switch (placement) {
    case 'top':
      return 'bottom-full mb-4';
    case 'bottom':
      return 'top-full mt-4';
    case 'left':
      return 'right-full mr-4';
    case 'right':
      return 'left-full ml-4';
    case 'center':
    default:
      return '';
  }
}

/**
 * TourStep displays the content for a single tour step.
 *
 * Features:
 * - Title, description, and optional example text
 * - Navigation buttons (Previous, Next/Finish)
 * - Skip button for optional steps
 * - Step indicator (e.g., "Step 3 of 7")
 * - Auto-advance progress bar
 * - End tour button (X)
 */
export function TourStep({
  step,
  currentIndex,
  totalSteps,
  autoAdvanceProgress,
  onNext,
  onPrevious,
  onSkip,
  onEndTour,
  placement,
  className,
}: TourStepProps) {
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 shadow-2xl p-5 max-w-sm w-full',
        placement !== 'center' && getPlacementStyles(placement),
        className
      )}
    >
      {/* Close button */}
      <button
        onClick={onEndTour}
        className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="End tour"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Auto-advance progress bar */}
      {step.autoAdvanceMs && autoAdvanceProgress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${autoAdvanceProgress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      {/* Step indicator */}
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
        Step {currentIndex + 1} of {totalSteps}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {step.title}
      </h3>

      {/* Content */}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        {step.content}
      </p>

      {/* Example (if provided) */}
      {step.example && (
        <div className="text-sm text-primary dark:text-primary/90 bg-primary/5 dark:bg-primary/10 rounded-lg px-3 py-2 mb-4 border border-primary/10 dark:border-primary/20">
          <span className="font-medium">Try it:</span> {step.example}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 mt-4">
        {/* Left side: Previous / Skip */}
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {step.optional && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-slate-500 dark:text-slate-400"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          )}
        </div>

        {/* Right side: Next/Finish */}
        <Button
          variant="default"
          size="sm"
          onClick={onNext}
          className="min-w-[80px]"
        >
          {isLastStep ? 'Finish' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
