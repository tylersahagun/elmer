/**
 * useJobPolling - Hook for polling job status and triggering processing
 * 
 * This hook provides:
 * 1. Automatic polling for job status updates
 * 2. Trigger job processing after stage changes
 * 3. Real-time progress updates for active jobs
 * 
 * OPTIMIZATION: Uses adaptive polling and visibility detection to minimize
 * serverless function invocations:
 * - Fast polling (5s) when jobs are actively running
 * - Slow polling (60s) when idle
 * - No polling when tab is hidden
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useKanbanStore } from "@/lib/store";
import type { JobStatus, JobType } from "@/lib/db/schema";

// ============================================
// VISIBILITY DETECTION HOOK
// ============================================

function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => {
    // SSR safety: default to visible
    if (typeof document === "undefined") return true;
    return document.visibilityState === "visible";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// ============================================
// POLLING INTERVALS
// ============================================

const POLL_INTERVAL_ACTIVE = 5000;   // 5s when jobs are running
const POLL_INTERVAL_IDLE = 60000;    // 60s when no active jobs

interface Job {
  id: string;
  projectId: string | null;
  workspaceId: string;
  type: JobType;
  status: JobStatus;
  progress: number | null;
  error: string | null;
  output: Record<string, unknown> | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

interface JobStatusSummary {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

interface UseJobPollingOptions {
  workspaceId: string;
  enabled?: boolean;
  /** @deprecated Use adaptive polling instead. This is ignored. */
  pollInterval?: number;
  autoProcess?: boolean; // Automatically trigger processing when pending jobs exist
}

interface UseJobPollingReturn {
  jobs: Job[];
  summary: JobStatusSummary | null;
  isPolling: boolean;
  isProcessing: boolean;
  isTabVisible: boolean;
  error: string | null;
  // Actions
  startPolling: () => void;
  stopPolling: () => void;
  triggerProcessing: () => Promise<void>;
  processJob: (jobId: string) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

export function useJobPolling(options: UseJobPollingOptions): UseJobPollingReturn {
  const { workspaceId, enabled = true, autoProcess = false } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<JobStatusSummary | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isTabVisible = usePageVisibility();
  const updateProject = useKanbanStore((s) => s.updateProject);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  
  // Track if we have active jobs to determine polling speed
  const hasActiveJobs = summary ? (summary.pending > 0 || summary.running > 0) : false;

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const response = await fetch(`/api/jobs?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
        
        // Update project cards with active job info
        const runningJobs = data.filter((j: Job) => j.status === "running");
        for (const job of runningJobs) {
          if (job.projectId) {
            updateProject(job.projectId, {
              activeJobType: job.type,
              activeJobProgress: job.progress || 0,
            });
          }
        }

        // Clear active job info for completed jobs
        const completedJobs = data.filter((j: Job) => 
          j.status === "completed" || j.status === "failed" || j.status === "cancelled"
        );
        for (const job of completedJobs) {
          if (job.projectId) {
            // Only clear if this was the active job
            updateProject(job.projectId, {
              activeJobType: undefined,
              activeJobProgress: undefined,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  }, [workspaceId, updateProject]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const response = await fetch(`/api/jobs/process?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  }, [workspaceId]);

  // Refresh all job data
  const refreshJobs = useCallback(async () => {
    await Promise.all([fetchJobs(), fetchSummary()]);
  }, [fetchJobs, fetchSummary]);

  // Trigger job processing
  const triggerProcessing = useCallback(async () => {
    if (!workspaceId || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          workspaceId,
          maxJobs: 5,
          concurrency: 2,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Processing failed");
      }

      const result = await response.json();
      console.log("📊 Processing result:", result);

      // Refresh jobs after processing
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [workspaceId, refreshJobs]);

  // Process specific job
  const processJob = useCallback(async (jobId: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Processing failed");
      }

      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    }
  }, [refreshJobs]);

  // Cancel job
  const cancelJob = useCallback(async (jobId: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Cancel failed");
      }

      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  }, [refreshJobs]);

  // Retry job
  const retryJob = useCallback(async (jobId: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Retry failed");
      }

      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry failed");
    }
  }, [refreshJobs]);

  // Calculate current poll interval based on active jobs
  const getCurrentPollInterval = useCallback(() => {
    return hasActiveJobs ? POLL_INTERVAL_ACTIVE : POLL_INTERVAL_IDLE;
  }, [hasActiveJobs]);

  // Start polling with adaptive interval
  const startPolling = useCallback(() => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    setIsPolling(true);
    
    // Initial fetch when starting
    refreshJobs();

    const pollInterval = getCurrentPollInterval();
    console.log(`📊 Polling started (interval: ${pollInterval / 1000}s, active jobs: ${hasActiveJobs})`);

    // Set up interval with current speed
    pollIntervalRef.current = setInterval(async () => {
      await refreshJobs();

      // Auto-process pending jobs if enabled
      if (autoProcess && summary && summary.pending > 0 && !processingRef.current) {
        console.log(`🔄 Auto-processing ${summary.pending} pending jobs`);
        triggerProcessing();
      }
    }, pollInterval);
  }, [refreshJobs, getCurrentPollInterval, hasActiveJobs, autoProcess, summary, triggerProcessing]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Restart polling when active job status changes (to adjust interval)
  useEffect(() => {
    if (isPolling && isTabVisible && enabled && workspaceId) {
      // Restart with new interval when hasActiveJobs changes
      startPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveJobs]);

  // Main effect: Start/stop polling based on enabled, visibility, and workspace
  useEffect(() => {
    if (enabled && workspaceId && isTabVisible) {
      console.log("👁️ Tab visible - starting polling");
      startPolling();
    } else {
      if (!isTabVisible && isPolling) {
        console.log("👁️ Tab hidden - pausing polling");
      }
      stopPolling();
    }

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, workspaceId, isTabVisible]);

  // Immediate refresh when tab becomes visible again
  useEffect(() => {
    if (isTabVisible && enabled && workspaceId && !isPolling) {
      console.log("👁️ Tab visible again - refreshing immediately");
      refreshJobs();
    }
  }, [isTabVisible, enabled, workspaceId, isPolling, refreshJobs]);

  return {
    jobs,
    summary,
    isPolling,
    isProcessing,
    isTabVisible,
    error,
    startPolling,
    stopPolling,
    triggerProcessing,
    processJob,
    cancelJob,
    retryJob,
    refreshJobs,
  };
}

// ============================================
// HOOK FOR SINGLE PROJECT JOBS
// ============================================

interface UseProjectJobsOptions {
  projectId: string;
  enabled?: boolean;
}

export function useProjectJobs(options: UseProjectJobsOptions) {
  const { projectId, enabled = true } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const isTabVisible = usePageVisibility();
  const updateProject = useKanbanStore((s) => s.updateProject);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProjectJobs = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      // We'd need a project-specific endpoint, but for now filter from workspace jobs
      // In production, add GET /api/projects/[id]/jobs
      const response = await fetch(`/api/jobs?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);

        // Find active (running) job
        const running = data.find((j: Job) => j.status === "running");
        setActiveJob(running || null);

        // Update project card
        if (running) {
          updateProject(projectId, {
            activeJobType: running.type,
            activeJobProgress: running.progress || 0,
          });
        } else {
          updateProject(projectId, {
            activeJobType: undefined,
            activeJobProgress: undefined,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch project jobs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, updateProject]);

  // Calculate poll interval: fast when job is active, slow when idle
  const pollInterval = activeJob ? POLL_INTERVAL_ACTIVE : POLL_INTERVAL_IDLE;

  useEffect(() => {
    // Don't poll if disabled, no project, or tab is hidden
    if (!enabled || !projectId || !isTabVisible) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchProjectJobs();

    // Set up polling with adaptive interval
    pollIntervalRef.current = setInterval(fetchProjectJobs, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [enabled, projectId, isTabVisible, pollInterval, fetchProjectJobs]);

  // Immediate refresh when tab becomes visible
  useEffect(() => {
    if (isTabVisible && enabled && projectId) {
      fetchProjectJobs();
    }
  }, [isTabVisible, enabled, projectId, fetchProjectJobs]);

  return {
    jobs,
    activeJob,
    isLoading,
    isTabVisible,
    hasActiveJob: !!activeJob,
    refresh: fetchProjectJobs,
  };
}
