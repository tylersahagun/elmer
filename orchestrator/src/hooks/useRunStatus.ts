/**
 * useRunStatus - Hook for real-time run status updates
 * 
 * Provides:
 * - Current run status for a card
 * - Real-time log streaming
 * - Worker health status
 * - Actions (create run, retry, cancel)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { ProjectStage, StageRunStatus, RunLogLevel } from "@/lib/db/schema";

interface Run {
  id: string;
  cardId: string;
  workspaceId: string;
  stage: ProjectStage;
  status: StageRunStatus;
  automationLevel: string;
  provider: string | null;
  attempt: number;
  errorSummary: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

interface RunLog {
  id: string;
  runId: string;
  timestamp: string;
  level: RunLogLevel;
  message: string;
  stepKey: string | null;
  meta: Record<string, unknown> | null;
}

interface Artifact {
  id: string;
  runId: string | null;
  cardId: string;
  stage: ProjectStage;
  artifactType: string;
  label: string;
  uri: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface WorkerHealth {
  workersActive: boolean;
  workerCount: number;
  activeRuns: number;
  queuedRuns: number;
}

export interface UseRunStatusResult {
  // Current run state
  activeRun: Run | null;
  runs: Run[];
  logs: RunLog[];
  artifacts: Artifact[];
  
  // Health status
  workerHealth: WorkerHealth | null;
  isWorkerHealthy: boolean;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  createRun: (stage: ProjectStage) => Promise<string | null>;
  retryRun: (runId: string) => Promise<string | null>;
  cancelRun: (runId: string) => Promise<boolean>;
  refreshRuns: () => Promise<void>;
  refreshWorkerHealth: () => Promise<void>;
}

export function useRunStatus(
  cardId: string | null,
  workspaceId: string,
  options: {
    pollInterval?: number;
    streamLogs?: boolean;
  } = {}
): UseRunStatusResult {
  const { pollInterval = 5000, streamLogs = true } = options;
  
  const [runs, setRuns] = useState<Run[]>([]);
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [workerHealth, setWorkerHealth] = useState<WorkerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch runs for a card
  const fetchRuns = useCallback(async () => {
    if (!cardId) return;
    
    try {
      const response = await fetch(`/api/runs?cardId=${cardId}`);
      if (!response.ok) throw new Error("Failed to fetch runs");
      
      const data = await response.json();
      setRuns(data.runs || []);
      
      // Find active run
      const active = data.runs.find(
        (r: Run) => r.status === "queued" || r.status === "running"
      );
      setActiveRun(active || null);
      
    } catch (err) {
      console.error("[useRunStatus] Fetch runs error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch runs");
    }
  }, [cardId]);

  // Fetch worker health
  const refreshWorkerHealth = useCallback(async () => {
    try {
      const response = await fetch(`/api/workers?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error("Failed to fetch worker health");
      
      const data = await response.json();
      setWorkerHealth(data.health || null);
    } catch (err) {
      console.error("[useRunStatus] Fetch worker health error:", err);
    }
  }, [workspaceId]);

  // Fetch run details with logs
  const fetchRunDetails = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/runs/${runId}`);
      if (!response.ok) throw new Error("Failed to fetch run details");
      
      const data = await response.json();
      setLogs(data.logs || []);
      setArtifacts(data.artifacts || []);
      
      if (data.run) {
        setActiveRun(data.run);
      }
    } catch (err) {
      console.error("[useRunStatus] Fetch run details error:", err);
    }
  }, []);

  // Stream logs for active run
  useEffect(() => {
    if (!activeRun || !streamLogs) return;
    if (activeRun.status !== "queued" && activeRun.status !== "running") return;
    
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Open SSE connection
    const url = `/api/runs/${activeRun.id}/logs?stream=true`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "complete") {
          // Run completed, update status
          setActiveRun((prev) => prev ? { ...prev, status: data.status } : null);
          eventSource.close();
        } else {
          // New log entry
          setLogs((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("[useRunStatus] SSE parse error:", err);
      }
    };
    
    eventSource.onerror = () => {
      console.warn("[useRunStatus] SSE connection error, will retry");
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [activeRun?.id, activeRun?.status, streamLogs]);

  // Poll for updates
  useEffect(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    
    const poll = async () => {
      await fetchRuns();
      await refreshWorkerHealth();
    };
    
    poll();
    pollTimerRef.current = setInterval(poll, pollInterval);
    
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [fetchRuns, refreshWorkerHealth, pollInterval]);

  // Create a new run
  const createRun = useCallback(async (stage: ProjectStage): Promise<string | null> => {
    if (!cardId) return null;
    
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          workspaceId,
          stage,
          triggeredBy: "user",
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create run");
      }
      
      const data = await response.json();
      
      // Refresh runs
      await fetchRuns();
      
      return data.runId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create run");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [cardId, workspaceId, fetchRuns]);

  // Retry a run
  const retryRun = useCallback(async (runId: string): Promise<string | null> => {
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/runs/${runId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to retry run");
      }
      
      const data = await response.json();
      
      // Refresh runs
      await fetchRuns();
      
      return data.newRunId;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry run");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [fetchRuns]);

  // Cancel a run
  const cancelRun = useCallback(async (runId: string): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await fetch(`/api/runs/${runId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel run");
      }
      
      // Refresh runs
      await fetchRuns();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel run");
      return false;
    }
  }, [fetchRuns]);

  return {
    activeRun,
    runs,
    logs,
    artifacts,
    workerHealth,
    isWorkerHealthy: workerHealth?.workersActive ?? false,
    isLoading,
    isCreating,
    error,
    createRun,
    retryRun,
    cancelRun,
    refreshRuns: fetchRuns,
    refreshWorkerHealth,
  };
}

export default useRunStatus;
