"use client";

/**
 * WorkerHealthBanner - Shows worker status at top of board
 * 
 * Warns users when:
 * - No workers are connected
 * - Workers are overloaded
 * - Runs are queued without workers
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  X,
} from "lucide-react";

interface WorkerHealth {
  workersActive: boolean;
  workerCount: number;
  activeRuns: number;
  queuedRuns: number;
  totalProcessed: number;
  totalFailed: number;
  failureRate: number;
}

interface WorkerHealthBannerProps {
  workspaceId: string;
  className?: string;
}

export function WorkerHealthBanner({
  workspaceId,
  className,
}: WorkerHealthBannerProps) {
  const [health, setHealth] = useState<WorkerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRescuing, setIsRescuing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`/api/workers?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error("Failed to fetch worker health");
      const data = await response.json();
      setHealth(data.health);
      setError(null);
    } catch (err) {
      console.error("[WorkerHealthBanner] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch health");
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleRescue = async () => {
    setIsRescuing(true);
    try {
      await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rescue" }),
      });
      await fetchHealth();
    } catch (err) {
      console.error("[WorkerHealthBanner] Rescue error:", err);
    } finally {
      setIsRescuing(false);
    }
  };

  // Don't show if dismissed or healthy
  if (dismissed) return null;
  if (!health) return null;
  if (health.workersActive && health.queuedRuns === 0) return null;

  const isWarning = !health.workersActive && health.queuedRuns > 0;
  const isInfo = !health.workersActive && health.queuedRuns === 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 text-sm",
        isWarning && "bg-yellow-500/10 border-b border-yellow-500/20",
        isInfo && "bg-blue-500/10 border-b border-blue-500/20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {isWarning ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <Activity className="h-4 w-4 text-blue-500" />
        )}

        <span className={cn(isWarning ? "text-yellow-500" : "text-blue-500")}>
          {isWarning
            ? `No workers connected — ${health.queuedRuns} run${health.queuedRuns !== 1 ? "s" : ""} waiting`
            : "No workers connected"}
        </span>

        {health.workersActive && health.queuedRuns > 0 && (
          <span className="text-gray-400">
            {health.workerCount} worker{health.workerCount !== 1 ? "s" : ""} ·{" "}
            {health.activeRuns} active · {health.queuedRuns} queued
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isWarning && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRescue}
            disabled={isRescuing}
            className="h-7 text-yellow-500 hover:text-yellow-400"
          >
            {isRescuing ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Rescue Stuck
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={fetchHealth}
          disabled={isLoading}
          className="h-7"
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="h-7"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

/**
 * WorkerHealthIndicator - Compact indicator for header/footer
 */
export function WorkerHealthIndicator({
  workspaceId,
  className,
}: WorkerHealthBannerProps) {
  const [health, setHealth] = useState<WorkerHealth | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`/api/workers?workspaceId=${workspaceId}`);
        if (response.ok) {
          const data = await response.json();
          setHealth(data.health);
        }
      } catch {
        // Ignore errors for indicator
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  if (!health) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs",
        className
      )}
      title={`${health.workerCount} workers, ${health.queuedRuns} queued`}
    >
      {health.workersActive ? (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-green-500">{health.workerCount}</span>
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 text-red-500" />
          <span className="text-red-500">Offline</span>
        </>
      )}
    </div>
  );
}

export default WorkerHealthBanner;
