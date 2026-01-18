"use client";

import { cn } from "@/lib/utils";

interface TrafficLightsProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function TrafficLights({
  className,
  size = 10,
  interactive = false,
  onClose,
  onMinimize,
  onMaximize,
}: TrafficLightsProps) {
  const buttonClass = interactive
    ? "cursor-pointer hover:opacity-80 transition-opacity"
    : "";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className={cn(
          "rounded-full bg-[#FF5F57]",
          buttonClass
        )}
        style={{ width: size, height: size }}
        onClick={interactive ? onClose : undefined}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? "Close" : undefined}
      />
      <div
        className={cn(
          "rounded-full bg-[#FEBC2E]",
          buttonClass
        )}
        style={{ width: size, height: size }}
        onClick={interactive ? onMinimize : undefined}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? "Minimize" : undefined}
      />
      <div
        className={cn(
          "rounded-full bg-[#28C840]",
          buttonClass
        )}
        style={{ width: size, height: size }}
        onClick={interactive ? onMaximize : undefined}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? "Maximize" : undefined}
      />
    </div>
  );
}
