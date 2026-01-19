"use client";

import { cn } from "@/lib/utils";
import { TrafficLights } from "./TrafficLights";
import { forwardRef, type ReactNode, type HTMLAttributes } from "react";

interface WindowProps extends HTMLAttributes<HTMLDivElement> {
  /** Title displayed in the window header (monospace) */
  title?: string;
  /** Content to display on the right side of the header */
  rightMeta?: ReactNode;
  /** Window content */
  children: ReactNode;
  /** Additional classes for the outer container */
  className?: string;
  /** Additional classes for the content area */
  contentClassName?: string;
  /** Variant affects padding and header visibility */
  variant?: "default" | "compact" | "minimal";
  /** Whether to show the header */
  showHeader?: boolean;
  /** Whether to show traffic lights */
  showTrafficLights?: boolean;
  /** Interactive hover states */
  interactive?: boolean;
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(
  function Window(
    {
      title,
      rightMeta,
      children,
      className,
      contentClassName,
      variant = "default",
      showHeader = true,
      showTrafficLights = true,
      interactive = false,
      ...props
    },
    ref
  ) {
    const hasHeader = showHeader && (title || showTrafficLights || rightMeta);

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-2xl border flex flex-col",
          // Light mode
          "bg-white border-[#B8C0CC]",
          // Dark mode
          "dark:bg-[#0F1620] dark:border-white/[0.14]",
          // Shadow (very subtle)
          "shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]",
          // Interactive states
          interactive && "cursor-pointer transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:border-[#A0A8B4] dark:hover:border-white/20",
          className
        )}
        {...props}
      >
        {/* Header / Titlebar */}
        {hasHeader && (
          <div
            className={cn(
              "flex items-center h-9 px-3.5 border-b shrink-0",
              // Light mode
              "bg-[#FAFBFC] border-[#B8C0CC]",
              // Dark mode
              "dark:bg-[#0B0F14]/50 dark:border-white/[0.14]",
              // Rounded top corners
              "rounded-t-2xl"
            )}
          >
            {showTrafficLights && (
              <TrafficLights className="mr-3" size={10} />
            )}
            
            {title && (
              <span className="font-mono text-xs text-muted-foreground truncate">
                {title}
              </span>
            )}
            
            {rightMeta && (
              <div className="ml-auto flex items-center">
                {rightMeta}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0",
            variant === "default" && "p-4 sm:p-6",
            variant === "compact" && "p-3 sm:p-4",
            variant === "minimal" && "p-0",
            !hasHeader && "rounded-t-2xl",
            "rounded-b-2xl",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

// Mini window variant for KPI cards, stats, etc.
interface MiniWindowProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function MiniWindow({
  title,
  children,
  className,
  contentClassName,
  ...props
}: MiniWindowProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        "bg-white border-[#B8C0CC]",
        "dark:bg-[#0F1620] dark:border-white/[0.14]",
        "shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]",
        className
      )}
      {...props}
    >
      {title && (
        <div className="px-3 py-2 border-b border-[#B8C0CC] dark:border-white/[0.14]">
          <span className="font-mono text-xs text-muted-foreground">
            {title}
          </span>
        </div>
      )}
      <div className={cn("p-3", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
