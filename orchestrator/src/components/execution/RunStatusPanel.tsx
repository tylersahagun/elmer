"use client";

/**
 * RunStatusPanel - Shows run status, logs, and controls for a card
 * 
 * Displays:
 * - Current run status (queued, running, succeeded, failed)
 * - Real-time logs (streamed via SSE)
 * - Artifacts produced
 * - Control buttons (run, retry, cancel)
 */

import { useState, useEffect, useRef } from "react";
import { useRunStatus } from "@/hooks/useRunStatus";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Link,
  TicketCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ProjectStage } from "@/lib/db/schema";

interface RunStatusPanelProps {
  cardId: string;
  workspaceId: string;
  stage: ProjectStage;
  className?: string;
  compact?: boolean;
}

export function RunStatusPanel({
  cardId,
  workspaceId,
  stage,
  className,
  compact = false,
}: RunStatusPanelProps) {
  const {
    activeRun,
    runs,
    logs,
    artifacts,
    workerHealth,
    isWorkerHealthy,
    isCreating,
    error,
    createRun,
    retryRun,
    cancelRun,
  } = useRunStatus(cardId, workspaceId);

  const [showLogs, setShowLogs] = useState(!compact);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current && showLogs) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showLogs]);

  const handleRunNow = async () => {
    await createRun(stage);
  };

  const handleRetry = async () => {
    if (activeRun) {
      await retryRun(activeRun.id);
    }
  };

  const handleCancel = async () => {
    if (activeRun) {
      await cancelRun(activeRun.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "succeeded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "running":
        return "Running...";
      case "succeeded":
        return "Completed";
      case "failed":
        return "Failed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "debug":
        return "text-gray-500";
      default:
        return "text-gray-300";
    }
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="h-3 w-3" />;
      case "url":
      case "chromatic":
        return <Link className="h-3 w-3" />;
      case "ticket":
        return <TicketCheck className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeRun ? (
            <>
              {getStatusIcon(activeRun.status)}
              <span className="text-sm font-medium">
                {getStatusText(activeRun.status)}
              </span>
              {activeRun.attempt > 1 && (
                <span className="text-xs text-gray-500">
                  (attempt {activeRun.attempt})
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">No active run</span>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          {!activeRun && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunNow}
              disabled={isCreating || !isWorkerHealthy}
              className="h-7"
            >
              {isCreating ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Run Now
            </Button>
          )}

          {activeRun?.status === "running" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="h-7 text-red-500 hover:text-red-600"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}

          {(activeRun?.status === "failed" || activeRun?.status === "cancelled") && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isCreating}
              className="h-7"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Worker Health Warning */}
      {!isWorkerHealthy && (
        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-md border border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-yellow-500">
            No workers available - runs will queue until a worker connects
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-md border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-500">{error}</span>
        </div>
      )}

      {/* Error Summary */}
      {activeRun?.errorSummary && (
        <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-md border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <span className="text-xs text-red-400">{activeRun.errorSummary}</span>
        </div>
      )}

      {/* Logs Section */}
      {logs.length > 0 && (
        <div className="border border-white/10 rounded-md overflow-hidden">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between p-2 bg-black/20 hover:bg-black/30 transition-colors"
          >
            <span className="text-xs font-medium">
              Logs ({logs.length})
            </span>
            {showLogs ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showLogs && (
            <ScrollArea className="h-48 bg-black/30 p-2">
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-gray-600 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={cn("shrink-0 uppercase w-12", getLogLevelColor(log.level))}>
                      [{log.level}]
                    </span>
                    <span className={getLogLevelColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Artifacts Section */}
      {artifacts.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-gray-400">Artifacts</span>
          <div className="flex flex-wrap gap-2">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs"
              >
                {getArtifactIcon(artifact.artifactType)}
                <span>{artifact.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run History (compact view) */}
      {compact && runs.length > 1 && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{runs.length} previous runs</span>
        </div>
      )}
    </div>
  );
}

export default RunStatusPanel;
