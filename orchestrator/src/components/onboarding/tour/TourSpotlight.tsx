'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTourStore } from '@/lib/stores/tour-store';
import { tourSteps, DEFAULT_AUTO_ADVANCE_MS } from './tour-steps';

/**
 * Padding around the spotlight target element
 */
const SPOTLIGHT_PADDING = 8;

/**
 * TourSpotlight - Overlay that highlights tour target elements.
 *
 * Features:
 * - Darkens screen except for highlighted target
 * - Smooth transitions between targets via Framer Motion
 * - Click overlay to advance to next step
 *
 * Note: Auto-advance timer and TourStep content are managed by TourProvider.
 * TourSpotlight only handles the visual spotlight overlay.
 */
export function TourSpotlight() {
  const { currentStep, nextStep } = useTourStore();
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);

  const step = currentStep !== null ? tourSteps[currentStep] : null;

  // Find and track target element position
  React.useEffect(() => {
    if (!step?.target) {
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

    // Update on resize/scroll
    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step?.target]);

  if (currentStep === null || !step) return null;

  // Handle overlay click (advance to next step)
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only advance if clicking on the overlay itself, not on TourStep
    if (e.target === e.currentTarget) {
      nextStep();
    }
  };

  // Calculate spotlight position and size
  const hasTarget = step.target && targetRect;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-spotlight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] cursor-pointer"
        onClick={handleOverlayClick}
      >
        {/* Dark overlay with spotlight hole */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {hasTarget && (
                <motion.rect
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    x: targetRect.x - SPOTLIGHT_PADDING,
                    y: targetRect.y - SPOTLIGHT_PADDING,
                    width: targetRect.width + SPOTLIGHT_PADDING * 2,
                    height: targetRect.height + SPOTLIGHT_PADDING * 2,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  rx={8}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            style={{ pointerEvents: 'auto' }}
          />
        </svg>

        {/* Spotlight ring/glow effect */}
        {hasTarget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              left: targetRect.x - SPOTLIGHT_PADDING,
              top: targetRect.y - SPOTLIGHT_PADDING,
              width: targetRect.width + SPOTLIGHT_PADDING * 2,
              height: targetRect.height + SPOTLIGHT_PADDING * 2,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background"
            style={{ pointerEvents: 'none' }}
          />
        )}

      </motion.div>
    </AnimatePresence>
  );
}

export default TourSpotlight;
