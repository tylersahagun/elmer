"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** @deprecated No longer used - blur is removed */
  blur?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  noPadding?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      className,
      blur: _blur, // Ignored - no blur in new design
      interactive = false,
      noPadding = false,
      ...props
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          // Base glass surface
          "glass-card rounded-2xl",
          // Transitions
          "transition-all duration-200",
          // Padding
          !noPadding && "p-4",
          // Interactive states
          interactive && [
            "cursor-pointer",
            "hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
            "dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
            "hover:border-[#A0A8B4]",
            "dark:hover:border-white/20",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        // Base glass panel surface
        "glass-panel rounded-2xl p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GlassOverlayProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassOverlay({
  children,
  className,
  ...props
}: GlassOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        // Solid dark overlay (no blur)
        "bg-black/40 dark:bg-black/60",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
