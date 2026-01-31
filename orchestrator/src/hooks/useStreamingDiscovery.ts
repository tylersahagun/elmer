/**
 * useStreamingDiscovery - Hook for real-time discovery via SSE
 *
 * Provides streaming progress updates during repository scanning.
 * Supports cancellation and handles reconnection on error.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  DiscoveryResult,
  DiscoveryProgress,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveredAgent,
  DiscoveredSubmodule,
} from "@/lib/discovery/types";
import type { DiscoveryStreamEvent } from "@/lib/discovery/streaming";

interface UseStreamingDiscoveryOptions {
  workspaceId: string;
  enabled?: boolean;
  onInitiativeFound?: (initiative: DiscoveredInitiative) => void;
  onContextPathFound?: (contextPath: DiscoveredContextPath) => void;
  onAgentFound?: (agent: DiscoveredAgent) => void;
  onComplete?: (result: DiscoveryResult) => void;
  onError?: (error: string) => void;
}

interface UseStreamingDiscoveryReturn {
  // State
  isScanning: boolean;
  progress: DiscoveryProgress | null;
  result: DiscoveryResult | null;
  error: string | null;

  // Incremental results (for live preview)
  initiatives: DiscoveredInitiative[];
  contextPaths: DiscoveredContextPath[];
  agents: DiscoveredAgent[];

  // Submodule support
  submodules: DiscoveredSubmodule[];
  scanningSubmodules: Set<string>;

  // Actions
  startDiscovery: () => void;
  cancelDiscovery: () => void;
}

export function useStreamingDiscovery(
  options: UseStreamingDiscoveryOptions
): UseStreamingDiscoveryReturn {
  const {
    workspaceId,
    enabled = true,
    onInitiativeFound,
    onContextPathFound,
    onAgentFound,
    onComplete,
    onError,
  } = options;

  // State
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Incremental results
  const [initiatives, setInitiatives] = useState<DiscoveredInitiative[]>([]);
  const [contextPaths, setContextPaths] = useState<DiscoveredContextPath[]>([]);
  const [agents, setAgents] = useState<DiscoveredAgent[]>([]);

  // Submodule state
  const [submodules, setSubmodules] = useState<DiscoveredSubmodule[]>([]);
  const [scanningSubmodules, setScanningSubmodules] = useState<Set<string>>(new Set());

  // Refs for cleanup
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Process incoming SSE event
  const processEvent = useCallback(
    (event: DiscoveryStreamEvent) => {
      switch (event.type) {
        case "connected":
          // Connection established - wait for scanning_started
          break;

        case "scanning_started":
          setIsScanning(true);
          setError(null);
          setResult(null);
          setInitiatives([]);
          setContextPaths([]);
          setAgents([]);
          setProgress({
            foldersScanned: 0,
            totalFolders: event.data.totalFolders || 0,
            currentFolder: null,
            initiativesFound: 0,
            contextPathsFound: 0,
            agentsFound: 0,
            elapsedMs: 0,
            estimatedRemainingMs: null,
          });
          break;

        case "progress":
          setProgress((prev) => ({
            foldersScanned: event.data.foldersScanned ?? prev?.foldersScanned ?? 0,
            totalFolders: event.data.totalFolders ?? prev?.totalFolders ?? 0,
            currentFolder: event.data.currentFolder ?? prev?.currentFolder ?? null,
            initiativesFound: prev?.initiativesFound ?? 0,
            contextPathsFound: prev?.contextPathsFound ?? 0,
            agentsFound: prev?.agentsFound ?? 0,
            elapsedMs: event.data.elapsedMs ?? prev?.elapsedMs ?? 0,
            estimatedRemainingMs: event.data.estimatedRemainingMs ?? prev?.estimatedRemainingMs ?? null,
          }));
          break;

        case "initiative_found":
          if (event.data.initiative) {
            setInitiatives((prev) => [...prev, event.data.initiative!]);
            setProgress((prev) =>
              prev
                ? { ...prev, initiativesFound: prev.initiativesFound + 1 }
                : prev
            );
            onInitiativeFound?.(event.data.initiative);
          }
          break;

        case "context_path_found":
          if (event.data.contextPath) {
            setContextPaths((prev) => [...prev, event.data.contextPath!]);
            setProgress((prev) =>
              prev
                ? { ...prev, contextPathsFound: prev.contextPathsFound + 1 }
                : prev
            );
            onContextPathFound?.(event.data.contextPath);
          }
          break;

        case "agent_found":
          if (event.data.agent) {
            setAgents((prev) => [...prev, event.data.agent!]);
            setProgress((prev) =>
              prev ? { ...prev, agentsFound: prev.agentsFound + 1 } : prev
            );
            onAgentFound?.(event.data.agent);
          }
          break;

        case "completed":
          setIsScanning(false);
          if (event.data.result) {
            setResult(event.data.result);
            // Update progress with final values
            setProgress((prev) =>
              prev
                ? {
                    ...prev,
                    foldersScanned: prev.totalFolders,
                    elapsedMs: event.data.elapsedMs ?? prev.elapsedMs,
                    estimatedRemainingMs: 0,
                  }
                : prev
            );
            onComplete?.(event.data.result);
          }
          break;

        case "error":
          setIsScanning(false);
          const errorMessage = event.data.error || "Discovery failed";
          setError(errorMessage);
          onError?.(errorMessage);
          break;

        case "cancelled":
          setIsScanning(false);
          // Preserve partial results on cancel
          break;

        case "submodule_detected":
          if (event.data.submodule) {
            setSubmodules((prev) => [...prev, event.data.submodule!]);
          }
          break;

        case "submodule_scanning":
          if (event.data.submodulePath) {
            setScanningSubmodules((prev) => new Set([...prev, event.data.submodulePath!]));
          }
          break;

        case "submodule_scanned":
          if (event.data.submodulePath) {
            setScanningSubmodules((prev) => {
              const next = new Set(prev);
              next.delete(event.data.submodulePath!);
              return next;
            });
          }
          if (event.data.submodule) {
            setSubmodules((prev) =>
              prev.map((s) =>
                s.path === event.data.submodule!.path ? event.data.submodule! : s
              )
            );
          }
          break;

        case "submodule_error":
          if (event.data.submodulePath) {
            setScanningSubmodules((prev) => {
              const next = new Set(prev);
              next.delete(event.data.submodulePath!);
              return next;
            });
            setSubmodules((prev) =>
              prev.map((s) =>
                s.path === event.data.submodulePath
                  ? { ...s, scanError: event.data.error || "Unknown error", canScan: false }
                  : s
              )
            );
          }
          break;
      }
    },
    [onInitiativeFound, onContextPathFound, onAgentFound, onComplete, onError]
  );

  // Start discovery
  const startDiscovery = useCallback(() => {
    if (!workspaceId || !enabled) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Reset state
    setIsScanning(true);
    setError(null);
    setResult(null);
    setInitiatives([]);
    setContextPaths([]);
    setAgents([]);
    setSubmodules([]);
    setScanningSubmodules(new Set());
    setProgress(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Create EventSource connection
    const eventSource = new EventSource(
      `/api/discovery/stream?workspaceId=${encodeURIComponent(workspaceId)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as DiscoveryStreamEvent;
        processEvent(message);
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    eventSource.onerror = () => {
      // EventSource error - connection lost or failed
      eventSource.close();
      eventSourceRef.current = null;

      // Only set error if we were scanning (not if cancelled)
      if (isScanning && !abortControllerRef.current?.signal.aborted) {
        setIsScanning(false);
        setError("Connection lost during discovery");
        onError?.("Connection lost during discovery");
      }
    };
  }, [workspaceId, enabled, processEvent, isScanning, onError]);

  // Cancel discovery
  const cancelDiscovery = useCallback(() => {
    // Signal abort
    abortControllerRef.current?.abort();

    // Close EventSource (this will trigger server-side cancellation)
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsScanning(false);
    // Partial results are preserved in initiatives, contextPaths, agents
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    isScanning,
    progress,
    result,
    error,
    initiatives,
    contextPaths,
    agents,
    submodules,
    scanningSubmodules,
    startDiscovery,
    cancelDiscovery,
  };
}
