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
  clearFailedJobs: () => Promise<number>;
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
  
  // Track which jobs have already had their callbacks triggered to prevent repeated calls
  const notifiedJobsRef = useRef<Set<string>>(new Set());
  
  // Track pending auto-clear timeouts per project to cancel them if a new job starts
  const pendingClearTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Track which completed jobs have already been shown (to prevent "Done" flickering on re-polls)
  const shownCompletedJobsRef = useRef<Set<string>>(new Set());

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
        // Build a set of project IDs that have active jobs (pending/running)
        // to avoid overwriting with stale completed job data
        const projectsWithActiveJobs = new Set<string>();
        
        if (message.activeJobs) {
          setActiveJobs(message.activeJobs);
          
          // Update project cards with job progress and lock state
          message.activeJobs.forEach((job) => {
            if (job.projectId) {
              projectsWithActiveJobs.add(job.projectId);
              
              // Cancel any pending auto-clear timeout for this project
              // since a new job is now active
              const pendingTimeout = pendingClearTimeoutsRef.current.get(job.projectId);
              if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                pendingClearTimeoutsRef.current.delete(job.projectId);
              }
              
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
          // Only trigger callback once per job to prevent repeated notifications
          message.recentCompleted.forEach((job) => {
            const jobKey = `${job.id}-${job.status}`;
            const alreadyNotified = notifiedJobsRef.current.has(jobKey);
            const alreadyShown = shownCompletedJobsRef.current.has(job.id);
            
            if (!alreadyNotified) {
              notifiedJobsRef.current.add(jobKey);
              
              if (job.status === "completed" && onJobComplete) {
                onJobComplete(job);
              }
              if (job.status === "failed" && onJobFailed) {
                onJobFailed(job);
              }
            }
            
            // ONLY update project card if:
            // 1. There's no newer active job for this project
            // 2. We haven't already shown this completed job (prevents flickering)
            if (job.projectId && !projectsWithActiveJobs.has(job.projectId) && !alreadyShown) {
              // Show completion status briefly then clear
              updateProject(job.projectId, {
                activeJobType: job.type,
                activeJobProgress: job.status === "completed" ? 1 : job.progress || 0,
                activeJobStatus: job.status,
                lastJobError: job.status === "failed" ? job.error || "Job failed" : undefined,
                isLocked: false, // Unlock when job completes
              });
              
              // Mark this job as shown so we don't re-show it on future polls
              shownCompletedJobsRef.current.add(job.id);
              
              // Auto-clear the completed indicator after 3 seconds
              // so it doesn't linger and confuse users
              if (job.status === "completed") {
                const projectId = job.projectId;
                
                // Cancel any existing clear timeout for this project
                const existingTimeout = pendingClearTimeoutsRef.current.get(projectId);
                if (existingTimeout) {
                  clearTimeout(existingTimeout);
                }
                
                // Set new timeout and track it - also refresh project data to get updated document count
                const timeoutId = setTimeout(async () => {
                  pendingClearTimeoutsRef.current.delete(projectId);
                  updateProject(projectId, {
                    activeJobType: undefined,
                    activeJobProgress: undefined,
                    activeJobStatus: undefined,
                  });
                  
                  // Refresh project data to get updated document/prototype counts
                  try {
                    const res = await fetch(`/api/projects/${projectId}`);
                    if (res.ok) {
                      const projectData = await res.json();
                      updateProject(projectId, {
                        documentCount: projectData.documents?.length || 0,
                        prototypeCount: projectData.prototypes?.length || 0,
                      });
                    }
                  } catch (err) {
                    console.error("Failed to refresh project data:", err);
                  }
                }, 3000);
                
                pendingClearTimeoutsRef.current.set(projectId, timeoutId);
              }
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

          // Trigger callbacks (only once per job)
          const jobKey = `${job.id}-${job.status}`;
          if (!notifiedJobsRef.current.has(jobKey)) {
            notifiedJobsRef.current.add(jobKey);
            
            if (job.status === "completed" && onJobComplete) {
              onJobComplete(job);
            }
            if (job.status === "failed" && onJobFailed) {
              onJobFailed(job);
            }
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
    
    // Reset notified jobs on reconnect to allow fresh notifications
    notifiedJobsRef.current.clear();
    
    // Reset shown completed jobs on reconnect (so new completions can show "Done")
    shownCompletedJobsRef.current.clear();
    
    // Clear pending auto-clear timeouts on reconnect
    pendingClearTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    pendingClearTimeoutsRef.current.clear();

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
    // Clear all pending auto-clear timeouts
    pendingClearTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    pendingClearTimeoutsRef.current.clear();
    
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

  // Clear failed jobs for the workspace
  const clearFailedJobs = useCallback(async (): Promise<number> => {
    if (!workspaceId) return 0;

    try {
      const res = await fetch(`/api/jobs?workspaceId=${workspaceId}&status=all_terminal`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        const result = await res.json();
        // Clear the notified jobs ref to allow fresh notifications
        notifiedJobsRef.current.clear();
        console.log(`🗑️ Cleared ${result.cleared} failed/cancelled jobs`);
        return result.cleared;
      }
    } catch (err) {
      console.error("Failed to clear failed jobs:", err);
    }
    return 0;
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
    clearFailedJobs,
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
