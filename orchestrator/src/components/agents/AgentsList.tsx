"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AgentCard } from "./AgentCard";
import type { AgentDefinitionType } from "@/lib/db/schema";

interface AgentsListProps {
  workspaceId: string;
}

interface AgentDefinition {
  id: string;
  workspaceId: string;
  sourceRepo: string;
  sourceRef: string;
  sourcePath: string;
  type: AgentDefinitionType;
  name: string;
  description: string | null;
  triggers: string[] | null;
  content: string;
  metadata: Record<string, unknown> | null;
  enabled: boolean | null;
  syncedAt: string;
  createdAt: string;
}

// Ordered list of agent types for display grouping
const TYPE_ORDER: Array<{
  type: AgentDefinitionType;
  label: string;
  labelSingular: string;
}> = [
  { type: "agents_md", label: "AGENTS.md", labelSingular: "AGENTS.md" },
  { type: "skill", label: "Skills", labelSingular: "Skill" },
  { type: "command", label: "Commands", labelSingular: "Command" },
  { type: "subagent", label: "Subagents", labelSingular: "Subagent" },
  { type: "rule", label: "Rules", labelSingular: "Rule" },
];

async function fetchAgents(workspaceId: string): Promise<AgentDefinition[]> {
  const response = await fetch(`/api/agents?workspaceId=${workspaceId}`);
  if (!response.ok) {
    // Extract actual error message from API response
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || `Failed to fetch agents (${response.status})`;
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return data.agents;
}

export function AgentsList({ workspaceId }: AgentsListProps) {
  const {
    data: agents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agents", workspaceId],
    queryFn: () => fetchAgents(workspaceId),
  });

  // Track which sections are expanded (all expanded by default)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(TYPE_ORDER.map((t) => t.type)),
  );

  // Group agents by type
  const groupedAgents = useMemo(() => {
    if (!agents) return [];

    const groups = new Map<AgentDefinitionType, AgentDefinition[]>();

    // Initialize all groups to preserve order
    TYPE_ORDER.forEach(({ type }) => {
      groups.set(type, []);
    });

    // Group agents
    agents.forEach((agent) => {
      const group = groups.get(agent.type);
      if (group) {
        group.push(agent);
      }
    });

    // Filter out empty groups and return as ordered array
    return TYPE_ORDER.map(({ type, label, labelSingular }) => ({
      type,
      label,
      labelSingular,
      agents: groups.get(type) || [],
    })).filter((group) => group.agents.length > 0);
  }, [agents]);

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Agents</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load agents";
    const isAuthError =
      errorMessage.includes("401") ||
      errorMessage.includes("Authentication") ||
      errorMessage.includes("Unauthorized");
    const isPermissionError =
      errorMessage.includes("403") ||
      errorMessage.includes("permission") ||
      errorMessage.includes("member");

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Agents</h1>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm font-medium text-destructive">
              {isAuthError
                ? "Authentication Required"
                : isPermissionError
                  ? "Access Denied"
                  : "Failed to load agents"}
            </p>
          </div>
          <p className="text-sm text-destructive/80 ml-7">
            {isAuthError
              ? "Please sign in to view agents."
              : isPermissionError
                ? "You don't have permission to view agents in this workspace."
                : errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!agents || agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Agents</h1>
        </div>
        <div className="p-8 rounded-lg bg-muted/30 border text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">No agents imported</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Connect a repository with .cursor/ configuration to import agent
            definitions. Agents include skills, commands, subagents, rules, and
            AGENTS.md files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Agents</h1>
        <Badge variant="secondary" className="text-sm">
          {agents.length} {agents.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      {/* Grouped sections */}
      <div className="space-y-4">
        {groupedAgents.map(
          ({ type, label, labelSingular, agents: groupAgents }) => {
            const isExpanded = expandedSections.has(type);
            const count = groupAgents.length;
            const displayLabel = count === 1 ? labelSingular : label;

            return (
              <div key={type} className="border rounded-lg bg-card">
                {/* Section header (clickable to expand/collapse) */}
                <button
                  onClick={() => toggleSection(type)}
                  className="w-full flex items-center gap-2 p-4 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium">{displayLabel}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {count}
                  </Badge>
                </button>

                {/* Section content (collapsible) */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {groupAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        workspaceId={workspaceId}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
