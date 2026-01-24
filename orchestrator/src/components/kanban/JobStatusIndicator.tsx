"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  WifiOff,
  Settings,
  Server,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/glass";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import { useKanbanStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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

interface JobStatusIndicatorProps {
  workspaceId: string;
  className?: string;
}

export function JobStatusIndicator({
  workspaceId,
  className,
}: JobStatusIndicatorProps) {
  const { summary, isConnected, error, reconnect, activeJobs, triggerProcessing } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });
  const workspace = useKanbanStore((s) => s.workspace);
  // Default to "server" mode now (matching the worker change)
  const executionMode = workspace?.settings?.aiExecutionMode || "server";
  const validationMode = workspace?.settings?.aiValidationMode || "schema";
  const workerEnabled = workspace?.settings?.workerEnabled ?? true;
  const fallbackAfterMinutes = workspace?.settings?.aiFallbackAfterMinutes ?? 30;
  const [now, setNow] = useState(() => Date.now());

  // Fetch worker status to show health
  const { data: workerStatus } = useQuery<WorkerStatus>({
    queryKey: ["worker-status"],
    queryFn: async () => {
      const res = await fetch("/api/worker");
      if (!res.ok) throw new Error("Failed to fetch worker status");
      return res.json();
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const isWorkerRunning = workerStatus?.isRunning ?? false;
  const workerLastPollAge = workerStatus?.lastPollAt
    ? Math.round((Date.now() - new Date(workerStatus.lastPollAt).getTime()) / 1000)
    : null;
  const isWorkerHealthy = isWorkerRunning && workerLastPollAge !== null && workerLastPollAge < 10;

  useEffect(() => {
    if (summary.pending === 0) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, [summary.pending]);

  const hasActivity = summary.pending > 0 || summary.running > 0;
  const oldestPending = activeJobs
    .filter((job) => job.status === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
  const pendingAgeMinutes = oldestPending
    ? Math.max(0, Math.round((now - new Date(oldestPending.createdAt).getTime()) / 60000))
    : 0;
  const fallbackInMinutes = Math.max(0, fallbackAfterMinutes - pendingAgeMinutes);

  return (
    <AnimatePresence>
      {(hasActivity || !isConnected) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn("fixed top-4 right-4 z-50", className)}
        >
          <GlassCard className="p-3 flex items-center gap-3">
            {/* Connection status */}
            <div className="relative">
              {!isConnected ? (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <WifiOff className="w-5 h-5 text-amber-400" />
                </motion.div>
              ) : summary.running > 0 ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 text-purple-400" />
                </motion.div>
              ) : summary.pending > 0 ? (
                <Clock className="w-5 h-5 text-amber-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}

              {/* Pulse effect for running jobs */}
              {summary.running > 0 && isConnected && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-purple-400/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* Status text */}
            <div className="text-sm">
              {!isConnected ? (
                <button
                  onClick={reconnect}
                  className="text-amber-300 hover:text-amber-200 transition-colors"
                >
                  Reconnecting... Click to retry
                </button>
              ) : summary.running > 0 ? (
                <span className="text-purple-300">
                  Processing {summary.running} job
                  {summary.running > 1 ? "s" : ""}
                </span>
              ) : summary.pending > 0 ? (
                <span className="text-amber-300">
                  {summary.pending} job{summary.pending > 1 ? "s" : ""} queued
                  {executionMode === "cursor" && " (Cursor runner)"}
                  {executionMode === "server" && " (Server runner)"}
                  {executionMode === "hybrid" && " (Hybrid)"}
                </span>
              ) : null}
              {summary.pending > 0 && executionMode === "hybrid" && (
                <div className="text-[11px] text-muted-foreground">
                  Server fallback in ~{fallbackInMinutes}m
                </div>
              )}
              {summary.pending > 0 && executionMode === "server" && (
                <div className="text-[11px] text-muted-foreground">
                  Server runner enabled
                </div>
              )}
              {summary.pending > 0 && executionMode === "cursor" && (
                <div className="text-[11px] text-muted-foreground">
                  Waiting for Cursor runner
                </div>
              )}
            </div>

            {/* Live indicator */}
            {isConnected && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400/70">LIVE</span>
              </div>
            )}

            {/* Sparkle effect */}
            {summary.running > 0 && isConnected && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
            )}
          </GlassCard>

          {/* Worker status warning */}
          {summary.pending > 0 && !isWorkerRunning && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <GlassCard className="p-2 flex items-center gap-2 bg-amber-500/10 border-amber-500/20">
                <Server className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-300">Worker not running</span>
              </GlassCard>
            </motion.div>
          )}

          {/* Worker disabled warning */}
          {summary.pending > 0 && !workerEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <GlassCard className="p-2 flex items-center gap-2 bg-amber-500/10 border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-300">Auto-execution disabled</span>
                <Link
                  href={`/workspace/${workspaceId}/settings`}
                  className="ml-auto text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Settings
                </Link>
              </GlassCard>
            </motion.div>
          )}

          {/* Run server now button */}
          {summary.pending > 0 && workerEnabled && (executionMode === "server" || executionMode === "hybrid") && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isWorkerHealthy && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Worker ready
                  </span>
                )}
              </div>
              <button
                onClick={triggerProcessing}
                className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
              >
                Run now
              </button>
            </div>
          )}

          {/* Settings info */}
          {summary.pending > 0 && (
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Mode: {executionMode}</span>
              <span>Validation: {validationMode}</span>
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <GlassCard className="p-2 flex items-center gap-2 bg-red-500/10 border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-300">{error}</span>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact version for inline use
export function JobStatusBadge({ workspaceId }: { workspaceId: string }) {
  const { summary, isConnected } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });

  if (summary.pending === 0 && summary.running === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs"
    >
      {!isConnected ? (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      ) : summary.running > 0 ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>{summary.running} running</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>{summary.pending} pending</span>
        </>
      )}
    </motion.div>
  );
}
