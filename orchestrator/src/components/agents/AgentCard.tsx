"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileCode, Bot, Zap, ScrollText, BookOpen, ChevronRight, Play } from "lucide-react";
import { AgentDetailCard } from "./AgentDetailCard";
import { AgentExecutionPanel } from "./AgentExecutionPanel";
import type { AgentDefinitionType } from "@/lib/db/schema";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    type: AgentDefinitionType;
    description: string | null;
    sourcePath: string;
    content: string;
    metadata?: Record<string, unknown> | null;
    enabled?: boolean | null;
  };
  workspaceId: string;
  onExecute?: (jobId: string) => void;
}

// Icon mapping by agent type
const TYPE_ICONS: Record<AgentDefinitionType, React.ElementType> = {
  agents_md: BookOpen,
  skill: Zap,
  command: FileCode,
  subagent: Bot,
  rule: ScrollText,
};

// Badge styling by agent type (matches AgentItem.tsx patterns)
const TYPE_BADGES: Record<AgentDefinitionType, { label: string; className: string }> = {
  agents_md: {
    label: 'AGENTS.md',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800'
  },
  skill: {
    label: 'Skill',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800'
  },
  command: {
    label: 'Command',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800'
  },
  subagent: {
    label: 'Subagent',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800'
  },
  rule: {
    label: 'Rule',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200 border-gray-200 dark:border-gray-700'
  },
};

export function AgentCard({ agent, workspaceId, onExecute }: AgentCardProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [isEnabled, setIsEnabled] = useState(agent.enabled !== false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { type, name, sourcePath, description, metadata } = agent;
  const Icon = TYPE_ICONS[type];
  const badge = TYPE_BADGES[type];

  const handleToggleEnabled = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expand/collapse
    if (isUpdating) return;

    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled); // Optimistic update
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent");
      }

      // Invalidate agents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["agents", workspaceId] });
    } catch {
      // Revert on error
      setIsEnabled(!newEnabled);
      console.error("Failed to toggle agent enabled state");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExecuteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expand/collapse
    if (!isEnabled) return; // Disabled agents cannot be executed
    setShowExecutionPanel(true);
    setIsExpanded(false); // Close detail card if open
  };

  const handleExecutionComplete = (jobId: string) => {
    setShowExecutionPanel(false);
    onExecute?.(jobId);
  };

  return (
    <div className={`rounded-lg border border-border bg-card overflow-hidden transition-opacity ${!isEnabled ? "opacity-50" : ""}`}>
      {/* Header - clickable to expand */}
      <div className="flex items-start">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            setShowExecutionPanel(false); // Close execution panel when expanding
          }}
          className="flex-1 flex items-start gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
        >
          {/* Expand/collapse chevron with rotation animation */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 mt-0.5"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>

          {/* Type icon */}
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Agent name */}
              <span className="font-medium truncate">{name}</span>

              {/* Type badge */}
              <Badge
                variant="outline"
                className={`text-xs ${badge.className}`}
              >
                {badge.label}
              </Badge>

              {/* Disabled label when agent is disabled */}
              {!isEnabled && (
                <span className="text-xs text-muted-foreground">Disabled</span>
              )}
            </div>

            {/* Source path */}
            <div className="text-sm text-muted-foreground truncate mt-0.5">
              {sourcePath}
            </div>

            {/* Description (if available) */}
            {description && (
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </div>
            )}
          </div>
        </button>

        {/* Toggle and Execute buttons */}
        <div className="p-4 flex-shrink-0 flex items-center gap-3">
          {/* Enable/disable toggle */}
          <div onClick={handleToggleEnabled} className="cursor-pointer">
            <Switch
              checked={isEnabled}
              disabled={isUpdating}
              aria-label={isEnabled ? "Disable agent" : "Enable agent"}
            />
          </div>

          {/* Execute button with tooltip when disabled */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExecuteClick}
                    disabled={!isEnabled}
                    className="h-8 w-8 p-0"
                    title={isEnabled ? "Execute agent" : "Agent is disabled"}
                  >
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Execute</span>
                  </Button>
                </span>
              </TooltipTrigger>
              {!isEnabled && (
                <TooltipContent>
                  <p>Agent is disabled</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Expanded detail card with animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <AgentDetailCard
              agent={{
                ...agent,
                metadata: metadata || null,
              }}
              workspaceId={workspaceId}
              onClose={() => setIsExpanded(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution panel with animation */}
      <AnimatePresence>
        {showExecutionPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <AgentExecutionPanel
              agent={agent}
              workspaceId={workspaceId}
              onExecute={handleExecutionComplete}
              onCancel={() => setShowExecutionPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
