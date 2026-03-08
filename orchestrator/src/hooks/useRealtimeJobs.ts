"use client";

/**
 * useRealtimeJobs — Convex-backed replacement for the old SSE-based hook.
 *
 * useQuery from convex/react is a reactive subscription: Convex pushes
 * updates whenever the underlying data changes. No polling, no EventSource,
 * no connection management needed.
 */

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Job {
  _id: string;
  projectId?: string | null;
  workspaceId: string;
  type: string;
  status: string;
  progress?: number | null;
  errorMessage?: string | null;
  output?: Record<string, unknown> | null;
  _creationTime: number;
}

interface JobSummary {
  pending: number;
  running: number;
}

interface UseRealtimeJobsOptions {
  workspaceId: string;
  enabled?: boolean;
  onJobComplete?: (job: Job) => void;
  onJobFailed?: (job: Job) => void;
}

interface UseRealtimeJobsReturn {
  jobs: Job[];
  activeJobs: Job[];
  summary: JobSummary;
  isConnected: boolean;
  error: string | null;
  recentlyCompleted: Job[];
  reconnect: () => void;
  triggerProcessing: () => Promise<void>;
  clearFailedJobs: () => Promise<number>;
}

export function getRealtimeJobsQueryArgs(params: {
  workspaceId: string;
  enabled?: boolean;
  isConvexAuthenticated: boolean;
}) {
  const { workspaceId, enabled = true, isConvexAuthenticated } = params;

  if (!enabled || !workspaceId || !isConvexAuthenticated) {
    return "skip" as const;
  }

  return { workspaceId: workspaceId as Id<"workspaces"> };
}

export function useRealtimeJobs({
  workspaceId,
  enabled = true,
}: UseRealtimeJobsOptions): UseRealtimeJobsReturn {
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();

  // Convex reactive queries — automatically re-run when data changes
  const allJobs = useQuery(
    api.jobs.list,
    getRealtimeJobsQueryArgs({
      workspaceId,
      enabled,
      isConvexAuthenticated,
    }),
  ) as Job[] | undefined;

  const jobs = useMemo(() => allJobs ?? [], [allJobs]);

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "pending" || j.status === "running"),
    [jobs],
  );

  const recentlyCompleted = useMemo(
    () =>
      jobs
        .filter(
          (j) =>
            j.status === "completed" ||
            j.status === "failed" ||
            j.status === "cancelled",
        )
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, 10),
    [jobs],
  );

  const summary: JobSummary = useMemo(
    () => ({
      pending: activeJobs.filter((j) => j.status === "pending").length,
      running: activeJobs.filter((j) => j.status === "running").length,
    }),
    [activeJobs],
  );

  // Convex is always "connected" when the query is running
  const isConnected = allJobs !== undefined;

  // no-ops kept for interface compatibility with old SSE hook
  const reconnect = () => {};
  const triggerProcessing = async () => {};
  const clearFailedJobs = async () => 0;

  return {
    jobs,
    activeJobs,
    summary,
    isConnected,
    error: null,
    recentlyCompleted,
    reconnect,
    triggerProcessing,
    clearFailedJobs,
  };
}

export function useSSEConnectionStatus(workspaceId: string) {
  const { isConnected, error, reconnect } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });
  return { isConnected, error, reconnect };
}
