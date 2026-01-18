/**
 * useRealtimeJobs - Hook for real-time job status via Server-Sent Events
 * 
 * Provides truly real-time updates without polling overhead.
 * 
 * OPTIMIZATION: Disconnects SSE when tab is hidden to avoid wasting
 * server resources and bandwidth.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useKanbanStore } from "@/lib/store";
import type { JobStatus, JobType } from "@/lib/db/schema";

// ============================================
// VISIBILITY DETECTION HOOK
// ============================================

function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => {
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

interface Job {
  id: string;
  projectId: string | null;
  workspaceId: string;
  type: JobType;
  status: JobStatus;
  progress: number | null;
  error: string | null;
  output: Record<string, unknown> | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface JobSummary {
  pending: number;
  running: number;
}

interface SSEMessage {
  type: "connected" | "initial" | "poll" | "job_update" | "job_completed";
  workspaceId?: string;
  jobs?: Job[];
  activeJobs?: Job[];
  summary?: JobSummary;
  recentCompleted?: Job[];
  job?: Job;
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
  // Actions
  reconnect: () => void;
  triggerProcessing: () => Promise<void>;
}

export function useRealtimeJobs(options: UseRealtimeJobsOptions): UseRealtimeJobsReturn {
  const { workspaceId, enabled = true, onJobComplete, onJobFailed } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<JobSummary>({ pending: 0, running: 0 });
  const [recentlyCompleted, setRecentlyCompleted] = useState<Job[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTabVisible = usePageVisibility();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<() => void>(() => {});
  const updateProject = useKanbanStore((s) => s.updateProject);

  // Process incoming message
  const processMessage = useCallback((message: SSEMessage) => {
    switch (message.type) {
      case "connected":
        setIsConnected(true);
        setError(null);
        console.log("🔌 SSE connected to workspace:", message.workspaceId);
        break;

      case "initial":
        if (message.jobs) {
          setJobs(message.jobs);
          const active = message.jobs.filter(j => 
            j.status === "pending" || j.status === "running"
          );
          setActiveJobs(active);
          
          // Update project cards with initial job state
          message.jobs.forEach((job) => {
            if (job.projectId) {
              const isActive = job.status === "pending" || job.status === "running";
              updateProject(job.projectId, {
                activeJobType: job.type,
                activeJobProgress: job.progress || 0,
                activeJobStatus: job.status,
                lastJobError: job.status === "failed" ? job.error || "Job failed" : undefined,
                isLocked: isActive,
              });
            }
          });
        }
        break;

      case "poll":
        if (message.activeJobs) {
          setActiveJobs(message.activeJobs);
          
          // Update project cards with job progress and lock state
          message.activeJobs.forEach((job) => {
            if (job.projectId) {
              updateProject(job.projectId, {
                activeJobType: job.type,
                activeJobProgress: job.progress || 0,
                activeJobStatus: job.status,
                isLocked: job.status === "running" || job.status === "pending",
              });
            }
          });
        }
        if (message.summary) {
          setSummary(message.summary);
        }
        if (message.recentCompleted) {
          setRecentlyCompleted(message.recentCompleted);
          
          // Check for newly completed jobs and trigger callbacks
          message.recentCompleted.forEach((job) => {
            if (job.status === "completed" && onJobComplete) {
              onJobComplete(job);
            }
            if (job.status === "failed" && onJobFailed) {
              onJobFailed(job);
            }
            
            // Update project card with final job status
            if (job.projectId) {
              updateProject(job.projectId, {
                activeJobType: job.type,
                activeJobProgress: job.status === "completed" ? 1 : job.progress || 0,
                activeJobStatus: job.status,
                lastJobError: job.status === "failed" ? job.error || "Job failed" : undefined,
                isLocked: false, // Unlock when job completes
              });
            }
          });
        }
        break;

      case "job_update":
        if (message.job) {
          const job = message.job;
          setJobs((prev) => {
            const existing = prev.findIndex((j) => j.id === job.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = job;
              return updated;
            }
            return [...prev, job];
          });

          // Update project card
          if (job.projectId && job.status === "running") {
            updateProject(job.projectId, {
              activeJobType: job.type,
              activeJobProgress: job.progress || 0,
            });
          }
        }
        break;

      case "job_completed":
        if (message.job) {
          const job = message.job;
          setJobs((prev) => {
            const existing = prev.findIndex((j) => j.id === job.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = job;
              return updated;
            }
            return prev;
          });

          // Clear from active jobs
          setActiveJobs((prev) => prev.filter((j) => j.id !== job.id));

          // Clear project card
          if (job.projectId) {
            updateProject(job.projectId, {
              activeJobType: undefined,
              activeJobProgress: undefined,
            });
          }

          // Trigger callbacks
          if (job.status === "completed" && onJobComplete) {
            onJobComplete(job);
          }
          if (job.status === "failed" && onJobFailed) {
            onJobFailed(job);
          }
        }
        break;
    }
  }, [updateProject, onJobComplete, onJobFailed]);

  // Connect to SSE
  const connect = useCallback(() => {
    if (!workspaceId || !enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log("🔄 Connecting to SSE stream...");
    const eventSource = new EventSource(`/api/jobs/stream?workspaceId=${workspaceId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as SSEMessage;
        processMessage(message);
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection lost");
      eventSource.close();

      // Attempt reconnect after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Attempting SSE reconnect...");
        connectRef.current();
      }, 5000);
    };
  }, [workspaceId, enabled, processMessage]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      console.log("🔌 SSE disconnected (tab hidden)");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connectRef.current();
  }, []);

  // Trigger job processing
  const triggerProcessing = useCallback(async () => {
    if (!workspaceId) return;

    try {
      await fetch("/api/jobs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, maxJobs: 5, concurrency: 2 }),
      });
    } catch (err) {
      console.error("Failed to trigger processing:", err);
    }
  }, [workspaceId]);

  // Keep connect ref updated
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Connect/disconnect based on visibility
  // NOTE: We intentionally exclude `connect` from deps to prevent infinite reconnection loops.
  // The connect function is stored in connectRef and called from there.
  useEffect(() => {
    if (enabled && workspaceId && isTabVisible) {
      console.log("👁️ Tab visible - connecting SSE");
      connectRef.current();
    } else if (!isTabVisible) {
      // Disconnect when tab is hidden to save resources
      disconnect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, workspaceId, isTabVisible, disconnect]);

  return {
    jobs,
    activeJobs,
    summary,
    isConnected,
    error,
    recentlyCompleted,
    reconnect,
    triggerProcessing,
  };
}

// ============================================
// CONNECTION STATUS COMPONENT
// ============================================

export function useSSEConnectionStatus(workspaceId: string) {
  const { isConnected, error, reconnect } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });

  return { isConnected, error, reconnect };
}
