"use client";

/**
 * useJobLogs — Convex-backed replacement for the SSE job log stream.
 *
 * useQuery is a reactive subscription: Convex pushes new log rows the
 * moment appendLog writes them, with no polling or EventSource needed.
 */

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface JobLogEntry {
  _id: string;
  jobId: string;
  level: string;
  message: string;
  stepKey?: string | null;
  meta?: Record<string, unknown> | null;
  _creationTime: number;
}

export interface JobState {
  _id: string;
  type: string;
  status:
    | "pending"
    | "running"
    | "waiting_input"
    | "completed"
    | "failed"
    | "cancelled";
  progress?: number | null;
  errorMessage?: string | null;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  initiatedBy?: string | null;
  initiatedByName?: string | null;
  rootInitiator?: string | null;
  rootInitiatorName?: string | null;
  parentJobId?: string | null;
}

interface UseJobLogsReturn {
  logs: JobLogEntry[];
  job: JobState | null;
  isLoading: boolean;
}

/**
 * Subscribe to live logs and status for a single job.
 * Pass `null` or `undefined` to skip (hook is always called but returns empty).
 */
export function useJobLogs(jobId: string | null | undefined): UseJobLogsReturn {
  const job = useQuery(
    api.jobs.get,
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip",
  ) as JobState | null | undefined;

  const logs = useQuery(
    api.jobs.getLogs,
    jobId ? { jobId: jobId as Id<"jobs"> } : "skip",
  ) as JobLogEntry[] | undefined;

  return {
    logs: logs ?? [],
    job: job ?? null,
    isLoading: jobId ? logs === undefined || job === undefined : false,
  };
}
