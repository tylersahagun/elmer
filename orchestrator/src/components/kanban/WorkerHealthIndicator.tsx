"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Play,
  Square,
  Server,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkerStatus {
  isRunning: boolean;
  activeJobs: number;
  processedCount: number;
  failedCount: number;
  lastPollAt: string | null;
  rateLimitRemaining: {
    requests: number;
    tokens: number;
  };
}

interface WorkerHealthIndicatorProps {
  workspaceId?: string;
  className?: string;
  compact?: boolean;
}

export function WorkerHealthIndicator({
  workspaceId,
  className,
  compact = false,
}: WorkerHealthIndicatorProps) {
  const queryClient = useQueryClient();

  // Fetch worker status
  const { data: status, isLoading, error } = useQuery<WorkerStatus>({
    queryKey: ["worker-status"],
    queryFn: async () => {
      const res = await fetch("/api/worker");
      if (!res.ok) throw new Error("Failed to fetch worker status");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 2000,
  });

  // Start worker mutation
  const startWorker = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", workspaceId }),
      });
      if (!res.ok) throw new Error("Failed to start worker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-status"] });
    },
  });

  // Stop worker mutation
  const stopWorker = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      if (!res.ok) throw new Error("Failed to stop worker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-status"] });
    },
  });

  // Calculate time since last poll
  const lastPollAge = status?.lastPollAt
    ? Math.round((Date.now() - new Date(status.lastPollAt).getTime()) / 1000)
    : null;

  const isHealthy = status?.isRunning && lastPollAge !== null && lastPollAge < 10;
  const isStale = status?.isRunning && lastPollAge !== null && lastPollAge >= 10;

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {!compact && <span className="text-xs">Checking worker...</span>}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-red-400", className)}>
        <AlertTriangle className="w-4 h-4" />
        {!compact && <span className="text-xs">Worker error</span>}
      </div>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1.5", className)}>
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isHealthy && "bg-green-400 animate-pulse",
                  isStale && "bg-amber-400",
                  !status?.isRunning && "bg-red-400"
                )}
              />
              <Server className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1 text-xs">
              <div className="font-medium">
                Worker: {status?.isRunning ? "Running" : "Stopped"}
              </div>
              {status?.isRunning && (
                <>
                  <div>Active jobs: {status.activeJobs}</div>
                  <div>Processed: {status.processedCount}</div>
                  {status.failedCount > 0 && (
                    <div className="text-red-400">Failed: {status.failedCount}</div>
                  )}
                  {lastPollAge !== null && (
                    <div className={isStale ? "text-amber-400" : ""}>
                      Last poll: {lastPollAge}s ago
                    </div>
                  )}
                </>
              )}
              {!status?.isRunning && (
                <div className="text-amber-400">
                  Jobs will not process automatically
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg border",
          isHealthy && "bg-green-500/10 border-green-500/20",
          isStale && "bg-amber-500/10 border-amber-500/20",
          !status?.isRunning && "bg-red-500/10 border-red-500/20",
          className
        )}
      >
        {/* Status icon */}
        <div className="relative">
          {isHealthy ? (
            <Activity className="w-5 h-5 text-green-400" />
          ) : isStale ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <Square className="w-5 h-5 text-red-400" />
          )}
          {isHealthy && (
            <motion.div
              className="absolute inset-0 rounded-full bg-green-400/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">
            {status?.isRunning ? (
              <span className={isStale ? "text-amber-300" : "text-green-300"}>
                Worker {isStale ? "Stale" : "Running"}
              </span>
            ) : (
              <span className="text-red-300">Worker Stopped</span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {status?.isRunning ? (
              <>
                {status.activeJobs > 0
                  ? `${status.activeJobs} active`
                  : "Idle"}{" "}
                | {status.processedCount} processed
                {status.failedCount > 0 && ` | ${status.failedCount} failed`}
              </>
            ) : (
              "Jobs will queue but not process"
            )}
          </div>
        </div>

        {/* Control button */}
        {status?.isRunning ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => stopWorker.mutate()}
            disabled={stopWorker.isPending}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-red-400"
          >
            {stopWorker.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startWorker.mutate()}
            disabled={startWorker.isPending}
            className="h-7 px-2 text-xs text-green-400 hover:text-green-300"
          >
            {startWorker.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Start
              </>
            )}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Simple badge version for headers/navbars
 */
export function WorkerStatusBadge({ className }: { className?: string }) {
  const { data: status } = useQuery<WorkerStatus>({
    queryKey: ["worker-status"],
    queryFn: async () => {
      const res = await fetch("/api/worker");
      if (!res.ok) throw new Error("Failed to fetch worker status");
      return res.json();
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  if (!status) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium",
        status.isRunning
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400",
        className
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status.isRunning ? "bg-green-400 animate-pulse" : "bg-red-400"
        )}
      />
      {status.isRunning ? (
        status.activeJobs > 0 ? (
          <span>{status.activeJobs} active</span>
        ) : (
          <span>Ready</span>
        )
      ) : (
        <span>Stopped</span>
      )}
    </div>
  );
}
