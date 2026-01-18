"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  /** Additional className for the container */
  className?: string;
  /** Grid line size in pixels */
  gridSize?: number;
  /** Grid line opacity (0-1) for light mode */
  gridOpacity?: number;
  /** Grid line opacity (0-1) for dark mode */
  darkGridOpacity?: number;
  /** Whether to apply vignette fade effect */
  vignette?: boolean;
  /** Children to render on top */
  children?: React.ReactNode;
}

export function GridBackground({
  className,
  gridSize = 24,
  gridOpacity = 0.08,
  darkGridOpacity = 0.06,
  vignette = true,
  children,
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden",
        // Base background color
        "bg-[#FBFBF7] dark:bg-[#0B0F14]",
        className
      )}
      aria-hidden="true"
    >
      {/* Light mode grid - black lines on warm white */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      
      {/* Dark mode grid - white lines on dark background */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, ${darkGridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, ${darkGridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Subtle vignette fade - gentle at edges */}
      {vignette && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            // Light mode vignette - subtle
            "bg-gradient-to-b from-[#FBFBF7]/40 via-transparent to-[#FBFBF7]/40",
            // Dark mode vignette - subtle
            "dark:from-[#0B0F14]/40 dark:via-transparent dark:to-[#0B0F14]/40"
          )}
        />
      )}

      {children}
    </div>
  );
}

// Alternative: Dot grid pattern (like SkillsMP uses in some areas)
export function DotGridBackground({
  className,
  dotSize = 1,
  dotSpacing = 20,
  dotOpacity = 0.15,
  darkDotOpacity = 0.10,
  vignette = true,
}: {
  className?: string;
  dotSize?: number;
  dotSpacing?: number;
  dotOpacity?: number;
  darkDotOpacity?: number;
  vignette?: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden",
        "bg-[#FBFBF7] dark:bg-[#0B0F14]",
        className
      )}
      aria-hidden="true"
    >
      {/* Light mode dots */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, ${dotOpacity}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      />
      
      {/* Dark mode dots */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, ${darkDotOpacity}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      />

      {vignette && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-b from-[#FBFBF7]/40 via-transparent to-[#FBFBF7]/40",
            "dark:from-[#0B0F14]/40 dark:via-transparent dark:to-[#0B0F14]/40"
          )}
        />
      )}
    </div>
  );
}
