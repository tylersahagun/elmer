"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  /** Additional className for the container */
  className?: string;
  /** Grid line size in pixels */
  gridSize?: number;
  /** Grid line opacity (0-1) */
  gridOpacity?: number;
  /** Whether to apply vignette fade effect */
  vignette?: boolean;
  /** Children to render on top */
  children?: React.ReactNode;
}

export function GridBackground({
  className,
  gridSize = 24,
  gridOpacity = 0.04,
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
      {/* Grid pattern layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, ${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, ${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      
      {/* Dark mode grid overlay */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, ${gridOpacity * 0.8}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, ${gridOpacity * 0.8}) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      
      {/* Hide light mode grid in dark mode */}
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

      {/* Vignette fade - stronger at top and bottom, lighter in center */}
      {vignette && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            // Light mode vignette
            "bg-gradient-to-b from-[#FBFBF7]/80 via-transparent to-[#FBFBF7]/80",
            // Dark mode vignette
            "dark:from-[#0B0F14]/80 dark:via-transparent dark:to-[#0B0F14]/80"
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
  vignette = true,
}: {
  className?: string;
  dotSize?: number;
  dotSpacing?: number;
  dotOpacity?: number;
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
      {/* Dot pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, ${dotOpacity}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      />
      
      {/* Dark mode dots */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, ${dotOpacity * 0.6}) ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
        }}
      />

      {vignette && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-b from-[#FBFBF7]/70 via-transparent to-[#FBFBF7]/70",
            "dark:from-[#0B0F14]/70 dark:via-transparent dark:to-[#0B0F14]/70"
          )}
        />
      )}
    </div>
  );
}
