"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AutomationStatusBadgeProps {
  hasActive: boolean;
  runningCount: number;
  lastStatus?: "succeeded" | "failed" | "queued" | "running";
  lastAgentName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function AutomationStatusBadge({
  hasActive,
  runningCount,
  lastStatus,
  lastAgentName,
  onClick
}: AutomationStatusBadgeProps) {
  if (!hasActive && !lastStatus) return null;

  const isRunning = hasActive || lastStatus === "running" || lastStatus === "queued";
  const succeeded = lastStatus === "succeeded";
  const failed = lastStatus === "failed";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors",
              isRunning && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              succeeded && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              failed && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
            {succeeded && !isRunning && <CheckCircle2 className="w-3 h-3" />}
            {failed && !isRunning && <XCircle className="w-3 h-3" />}
            {runningCount > 1 && <span>{runningCount}</span>}
            {!isRunning && !succeeded && !failed && <Zap className="w-3 h-3" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>
            {isRunning && `Running: ${lastAgentName || "automation"}`}
            {succeeded && !isRunning && `Completed: ${lastAgentName || "automation"}`}
            {failed && !isRunning && `Failed: ${lastAgentName || "automation"}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
