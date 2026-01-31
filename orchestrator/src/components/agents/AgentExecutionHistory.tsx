"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  History,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUIStore } from "@/lib/store";
import type { JobStatus } from "@/lib/db/schema";

interface Execution {
  id: string;
  jobId: string | null;
  projectId: string | null;
  tokensUsed: number | null;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  } | null;
  job?: {
    id: string;
    status: JobStatus;
  } | null;
}

interface ExecutionHistoryResponse {
  executions: Execution[];
}

interface AgentExecutionHistoryProps {
  agentId: string;
  workspaceId: string;
}

// Status badge config
const STATUS_CONFIG: Record<
  JobStatus,
  { icon: typeof CheckCircle; label: string; className: string }
> = {
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  },
  running: {
    icon: Loader2,
    label: "Running",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  },
  waiting_input: {
    icon: Clock,
    label: "Waiting",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200",
  },
};

// Format duration in human readable form
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function AgentExecutionHistory({
  agentId,
  workspaceId,
}: AgentExecutionHistoryProps) {
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);

  const { data, isLoading, error } = useQuery<ExecutionHistoryResponse>({
    queryKey: ["agent-executions", agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/executions`);
      if (!response.ok) throw new Error("Failed to fetch executions");
      return response.json();
    },
  });

  // Handle click on execution row - open job logs drawer
  const handleExecutionClick = (execution: Execution) => {
    if (execution.jobId) {
      const projectName = execution.project?.name || undefined;
      openJobLogsDrawer(execution.jobId, projectName);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <History className="h-4 w-4" />
          Execution History
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2 p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <History className="h-4 w-4" />
          Execution History
        </div>
        <p className="text-sm text-muted-foreground">
          Failed to load execution history
        </p>
      </div>
    );
  }

  const executions = data?.executions || [];

  return (
    <div className="space-y-3 p-4 border-t border-border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <History className="h-4 w-4" />
        Execution History
        {executions.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {executions.length}
          </Badge>
        )}
      </div>

      {executions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No executions yet
        </p>
      ) : (
        <div className="space-y-2">
          {executions.map((execution) => {
            const status = execution.job?.status || "pending";
            const config = STATUS_CONFIG[status];
            const StatusIcon = config.icon;

            return (
              <button
                key={execution.id}
                onClick={() => handleExecutionClick(execution)}
                disabled={!execution.jobId}
                className="w-full flex items-center justify-between rounded-lg border border-border p-3 text-left hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  {/* Status and timestamp row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${config.className}`}
                    >
                      <StatusIcon
                        className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`}
                      />
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(execution.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Context row */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {execution.project ? (
                      <span className="flex items-center gap-1 truncate">
                        <FolderOpen className="h-3 w-3 flex-shrink-0" />
                        {execution.project.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">No project context</span>
                    )}
                    {execution.durationMs && (
                      <>
                        <span className="text-muted-foreground/50">|</span>
                        <span>{formatDuration(execution.durationMs)}</span>
                      </>
                    )}
                    {execution.tokensUsed && (
                      <>
                        <span className="text-muted-foreground/50">|</span>
                        <span>{execution.tokensUsed.toLocaleString()} tokens</span>
                      </>
                    )}
                  </div>
                </div>

                {/* View logs button */}
                {execution.jobId && (
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
