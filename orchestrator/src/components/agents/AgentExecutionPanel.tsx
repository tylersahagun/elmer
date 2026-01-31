"use client";

import { useState } from "react";
import { Play, Loader2, X, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextSelector } from "./ContextSelector";
import type { AgentDefinitionType } from "@/lib/db/schema";

type ContextType = "none" | "project" | "signal";

interface FeedbackState {
  type: "success" | "error";
  message: string;
  jobId?: string;
}

interface AgentExecutionPanelProps {
  agent: {
    id: string;
    name: string;
    type: AgentDefinitionType;
    description: string | null;
  };
  workspaceId: string;
  onExecute: (jobId: string) => void;
  onCancel: () => void;
}

// Badge styling by agent type (matches AgentCard.tsx patterns)
const TYPE_BADGES: Record<AgentDefinitionType, { label: string; className: string }> = {
  agents_md: {
    label: "AGENTS.md",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  },
  skill: {
    label: "Skill",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  },
  command: {
    label: "Command",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800",
  },
  subagent: {
    label: "Subagent",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800",
  },
  rule: {
    label: "Rule",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  },
};

export function AgentExecutionPanel({
  agent,
  workspaceId,
  onExecute,
  onCancel,
}: AgentExecutionPanelProps) {
  const [contextType, setContextType] = useState<ContextType>("none");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const badge = TYPE_BADGES[agent.type];

  const handleContextSelect = (type: ContextType, id: string | null) => {
    setContextType(type);
    setSelectedId(id);
    setFeedback(null); // Clear feedback on context change
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setFeedback(null);

    try {
      const body: {
        workspaceId: string;
        agentDefinitionId: string;
        projectId?: string;
        signalId?: string;
      } = {
        workspaceId,
        agentDefinitionId: agent.id,
      };

      // Add context based on selection
      if (contextType === "project" && selectedId) {
        body.projectId = selectedId;
      } else if (contextType === "signal" && selectedId) {
        body.signalId = selectedId;
      }

      const response = await fetch("/api/agents/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to execute agent");
      }

      const job = await response.json();

      // Show success feedback
      setFeedback({
        type: "success",
        message: `Job ${job.id.slice(0, 8)} created for ${agent.name}`,
        jobId: job.id,
      });

      // Call callback after short delay to show feedback
      setTimeout(() => {
        onExecute(job.id);
      }, 1500);
    } catch (error) {
      console.error("Failed to execute agent:", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="border-t border-border bg-muted/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">Execute Agent</span>
            <Badge variant="outline" className={`text-xs ${badge.className}`}>
              {badge.label}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">{agent.name}</h3>
          {agent.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {agent.description}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Context selector */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Execution Context
        </label>
        <ContextSelector
          workspaceId={workspaceId}
          contextType={contextType}
          selectedId={selectedId}
          onSelect={handleContextSelect}
        />
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-3 rounded-md ${
            feedback.type === "success"
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="text-sm flex-1">{feedback.message}</span>
          {feedback.type === "success" && feedback.jobId && (
            <a
              href={`/workspace/${workspaceId}?tab=jobs`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View Logs
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          onClick={handleExecute}
          disabled={isExecuting || feedback?.type === "success"}
          className="flex-1"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Execute Agent
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isExecuting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
