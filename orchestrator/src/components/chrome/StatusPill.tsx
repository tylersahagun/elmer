"use client";

import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type StatusType = "ready" | "loading" | "error" | "online" | "offline";

interface StatusPillProps extends HTMLAttributes<HTMLDivElement> {
  /** Status type determines the dot color */
  status: StatusType;
  /** Label text (optional, defaults based on status) */
  label?: string;
  /** Show the dot animation for loading state */
  animate?: boolean;
}

const statusConfig: Record<StatusType, { color: string; defaultLabel: string }> = {
  ready: { color: "bg-emerald-500", defaultLabel: "ready" },
  online: { color: "bg-emerald-500", defaultLabel: "online" },
  loading: { color: "bg-amber-500", defaultLabel: "loading" },
  error: { color: "bg-red-500", defaultLabel: "error" },
  offline: { color: "bg-gray-400", defaultLabel: "offline" },
};

export function StatusPill({
  status,
  label,
  animate = false,
  className,
  ...props
}: StatusPillProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.defaultLabel;
  const shouldAnimate = animate || status === "loading";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 h-[34px] px-3 rounded-full border",
        "bg-white border-[#B8C0CC]",
        "dark:bg-[#0F1620] dark:border-white/[0.14]",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          config.color,
          shouldAnimate && "animate-pulse"
        )}
      />
      <span className="font-mono text-xs text-muted-foreground">
        {displayLabel}
      </span>
    </div>
  );
}
