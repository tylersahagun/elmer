"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAction,
  useConvexAuth,
  useMutation as useConvexMutation,
  useQuery as useConvexQuery,
} from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canRunConvexQuery } from "@/lib/auth/convex";
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

export function AgentsList({ workspaceId }: AgentsListProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useCurrentUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const canLoadConvexData = canRunConvexQuery({
    isClerkLoaded: isLoaded,
    isSignedIn,
    isConvexAuthenticated,
  });
  const rawAgents = useConvexQuery(
    api.agentDefinitions.list,
    canLoadConvexData
      ? { workspaceId: workspaceId as Id<"workspaces"> }
      : "skip",
  );
  const setEnabled = useConvexMutation(api.agentDefinitions.setEnabled);
  const isLoading = isSignedIn && (!canLoadConvexData || rawAgents === undefined);
  const error: unknown = null;
  const agents: AgentDefinition[] | undefined = rawAgents?.map((agent: {
    _id: string;
    workspaceId: string;
    type: string;
    name: string;
    description?: string | null;
    triggers?: string[] | null;
    content: string;
    metadata?: unknown;
    enabled: boolean;
    _creationTime: number;
  }) => {
    const metadata = (agent.metadata ?? null) as Record<string, unknown> | null;
    const sourcePath =
      (metadata?.filePath as string | undefined) ??
      (metadata?.sourcePath as string | undefined) ??
      `${agent.type}/${agent.name}`;
    const sourceRepo =
      (metadata?.sourceRepo as string | undefined) ?? "tylersahagun/elmer";
    const sourceRef = (metadata?.sourceRef as string | undefined) ?? "main";
    const createdAt = new Date(agent._creationTime).toISOString();
    return {
      id: agent._id,
      workspaceId: agent.workspaceId,
      sourceRepo,
      sourceRef,
      sourcePath,
      type: agent.type as AgentDefinitionType,
      name: agent.name,
      description: agent.description ?? null,
      triggers: agent.triggers ?? null,
      content: agent.content,
      metadata,
      enabled: agent.enabled,
      syncedAt: createdAt,
      createdAt,
    };
  });

  // Convex sync actions
  const syncAgents = useAction(api.agents.syncAgents);
  const syncDocs = useAction(api.agents.syncPmWorkspaceDocs);
  const [syncingAgents, setSyncingAgents] = useState(false);
  const [syncingDocs, setSyncingDocs] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncAgents = async () => {
    setSyncingAgents(true);
    setSyncResult(null);
    try {
      const result = await syncAgents({ workspaceId: workspaceId as Id<"workspaces"> });
      setSyncResult(`✓ Synced ${(result as { synced?: number }).synced ?? 0} agent definitions`);
    } catch (e) {
      setSyncResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSyncingAgents(false);
    }
  };

  const handleSyncDocs = async () => {
    setSyncingDocs(true);
    setSyncResult(null);
    try {
      const result = await syncDocs({ workspaceId: workspaceId as Id<"workspaces"> }) as {
        knowledgebase?: number; projects?: number; documents?: number; errors?: number;
      };
      setSyncResult(
        `✓ Synced ${result.knowledgebase ?? 0} KB entries, ${result.projects ?? 0} projects, ${result.documents ?? 0} documents` +
        (result.errors ? ` (${result.errors} errors)` : ""),
      );
    } catch (e) {
      setSyncResult(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSyncingDocs(false);
    }
  };

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
          <h1 className="text-2xl font-semibold">Agent Catalog</h1>
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
          <h1 className="text-2xl font-semibold">Agent Catalog</h1>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
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
          <h1 className="text-2xl font-semibold">Agent Catalog</h1>
        </div>
        <div className="p-8 rounded-lg bg-muted/30 border text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">No definitions imported yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Connect a repository with .cursor/ configuration to import agent
            definitions. This catalog is for provenance and admin control; daily
            project work should happen from the project cockpit or Elmer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agents-page">
      {/* Header with count + sync buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold" data-testid="agents-header">
              Agent Catalog
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage imported definitions here. Run project work from the project cockpit or Elmer.
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {agents.length} {agents.length === 1 ? "item" : "items"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {syncResult && (
            <span className="text-xs text-muted-foreground font-mono">
              {syncResult}
            </span>
          )}
          <Button
            data-testid="sync-agents-button"
            size="sm"
            variant="outline"
            onClick={handleSyncAgents}
            disabled={syncingAgents || syncingDocs}
            className="gap-1.5 text-xs"
          >
            {syncingAgents
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RefreshCw className="w-3 h-3" />}
            Sync Agents
          </Button>
          <Button
            data-testid="sync-docs-button"
            size="sm"
            variant="outline"
            onClick={handleSyncDocs}
            disabled={syncingAgents || syncingDocs}
            className="gap-1.5 text-xs"
          >
            {syncingDocs
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Database className="w-3 h-3" />}
            Sync PM Workspace
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-mono text-muted-foreground">
              Secondary admin surface
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Use this page to inspect imported definitions, provenance, and
              enablement. Use Projects as the primary cockpit for evidence,
              agent runs, approvals, and artifact handoff.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            Back to Projects
          </Button>
        </div>
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
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
                        onToggleEnabled={async (agentId, enabled) => {
                          await setEnabled({
                            id: agentId as Id<"agentDefinitions">,
                            enabled,
                          });
                        }}
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
