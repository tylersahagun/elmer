"use client";

import { cn } from "@/lib/utils";

interface TrafficLightsProps {
  className?: string;
  size?: number;
  interactive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  /** Show only specific lights: 'all' | 'close' | 'minimize' | 'maximize' | array like ['maximize'] */
  showOnly?: 'all' | 'close' | 'minimize' | 'maximize' | ('close' | 'minimize' | 'maximize')[];
}

export function TrafficLights({
  className,
  size = 10,
  interactive = false,
  onClose,
  onMinimize,
  onMaximize,
  showOnly = 'all',
}: TrafficLightsProps) {
  const buttonClass = interactive
    ? "cursor-pointer hover:opacity-80 transition-opacity"
    : "";

  const shouldShow = (light: 'close' | 'minimize' | 'maximize') => {
    if (showOnly === 'all') return true;
    if (typeof showOnly === 'string') return showOnly === light;
    return showOnly.includes(light);
  };

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      {shouldShow('close') && (
        <div
          className={cn(
            "rounded-full bg-[#FF5F57] shrink-0",
            buttonClass
          )}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            maxWidth: `${size}px`,
            maxHeight: `${size}px`,
          }}
          onClick={interactive ? onClose : undefined}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? "Close" : undefined}
        />
      )}
      {shouldShow('minimize') && (
        <div
          className={cn(
            "rounded-full bg-[#FEBC2E] shrink-0",
            buttonClass
          )}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            maxWidth: `${size}px`,
            maxHeight: `${size}px`,
          }}
          onClick={interactive ? onMinimize : undefined}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? "Minimize" : undefined}
        />
      )}
      {shouldShow('maximize') && (
        <div
          className={cn(
            "rounded-full bg-[#28C840] shrink-0",
            buttonClass
          )}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            maxWidth: `${size}px`,
            maxHeight: `${size}px`,
          }}
          onClick={interactive ? onMaximize : undefined}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? "Maximize" : undefined}
        />
      )}
    </div>
  );
}
