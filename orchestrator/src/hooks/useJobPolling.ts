/**
 * useJobPolling - Hook for polling job status and triggering processing
 * 
 * This hook provides:
 * 1. Automatic polling for job status updates
 * 2. Trigger job processing after stage changes
 * 3. Real-time progress updates for active jobs
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useKanbanStore } from "@/lib/store";
import type { JobStatus, JobType } from "@/lib/db/schema";

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
  pollInterval?: number; // ms
  autoProcess?: boolean; // Automatically trigger processing when pending jobs exist
}

interface UseJobPollingReturn {
  jobs: Job[];
  summary: JobStatusSummary | null;
  isPolling: boolean;
  isProcessing: boolean;
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
  const { workspaceId, enabled = true, pollInterval = 2000, autoProcess = true } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<JobStatusSummary | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateProject = useKanbanStore((s) => s.updateProject);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

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

  // Start polling
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    setIsPolling(true);
    
    // Initial fetch
    refreshJobs();

    // Set up interval
    pollIntervalRef.current = setInterval(async () => {
      await refreshJobs();

      // Auto-process pending jobs if enabled
      if (autoProcess && summary && summary.pending > 0 && !processingRef.current) {
        console.log(`🔄 Auto-processing ${summary.pending} pending jobs`);
        triggerProcessing();
      }
    }, pollInterval);
  }, [refreshJobs, pollInterval, autoProcess, summary, triggerProcessing]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Start/stop polling based on enabled prop
  useEffect(() => {
    if (enabled && workspaceId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, workspaceId, startPolling, stopPolling]);

  return {
    jobs,
    summary,
    isPolling,
    isProcessing,
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
  pollInterval?: number;
}

export function useProjectJobs(options: UseProjectJobsOptions) {
  const { projectId, enabled = true, pollInterval = 2000 } = options;
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const updateProject = useKanbanStore((s) => s.updateProject);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProjectJobs = useCallback(async () => {
    if (!projectId) return;

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
    }
  }, [projectId, updateProject]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    setIsLoading(true);
    fetchProjectJobs().finally(() => setIsLoading(false));

    pollIntervalRef.current = setInterval(fetchProjectJobs, pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [enabled, projectId, pollInterval, fetchProjectJobs]);

  return {
    jobs,
    activeJob,
    isLoading,
    hasActiveJob: !!activeJob,
    refresh: fetchProjectJobs,
  };
}
