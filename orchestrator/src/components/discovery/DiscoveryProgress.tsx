"use client";

import { Loader2, Clock, Folder, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DiscoveryProgress as ProgressData } from "@/lib/discovery/types";

interface DiscoveryProgressProps {
  progress: ProgressData;
  onCancel?: () => void;
  canCancel?: boolean;
}

/**
 * DiscoveryProgress - Real-time progress display during repository scanning
 *
 * Shows:
 * - Progress bar with percentage
 * - Current folder being scanned
 * - Items found counts (initiatives, context paths, agents)
 * - Elapsed and estimated remaining time
 * - Cancel button for long-running scans
 */
export function DiscoveryProgress({
  progress,
  onCancel,
  canCancel = true,
}: DiscoveryProgressProps) {
  const {
    foldersScanned,
    totalFolders,
    currentFolder,
    initiativesFound,
    contextPathsFound,
    agentsFound,
    elapsedMs,
    estimatedRemainingMs,
  } = progress;

  const percentComplete =
    totalFolders > 0 ? Math.round((foldersScanned / totalFolders) * 100) : 0;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      {/* Header with spinner and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">Scanning repository...</span>
        </div>
        {canCancel && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground hover:text-destructive"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={percentComplete} className="h-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            <Folder className="inline h-4 w-4 mr-1" />
            Analyzing folder {foldersScanned} of {totalFolders}
          </span>
          <span>{percentComplete}%</span>
        </div>
      </div>

      {/* Current folder */}
      {currentFolder && (
        <div className="text-sm text-muted-foreground truncate">
          Scanning: <span className="font-mono">{currentFolder}</span>
        </div>
      )}

      {/* Found items */}
      <div className="flex gap-4 text-sm">
        <span>
          <strong>{initiativesFound}</strong> initiative
          {initiativesFound === 1 ? "" : "s"}
        </span>
        <span>
          <strong>{contextPathsFound}</strong> context path
          {contextPathsFound === 1 ? "" : "s"}
        </span>
        <span>
          <strong>{agentsFound}</strong> agent{agentsFound === 1 ? "" : "s"}
        </span>
      </div>

      {/* Timing */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <Clock className="inline h-3 w-3 mr-1" />
          Elapsed: {formatTime(elapsedMs)}
        </span>
        {estimatedRemainingMs !== null && estimatedRemainingMs > 0 && (
          <span>Est. remaining: {formatTime(estimatedRemainingMs)}</span>
        )}
      </div>
    </div>
  );
}
