"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Zap,
  Loader2,
  AlertCircle,
  Save,
  Check,
  ChevronDown,
} from "lucide-react";
import { AutomationRuleEditor, type AgentTrigger } from "./AutomationRuleEditor";

interface ColumnConfig {
  id: string;
  workspaceId: string;
  stage: string;
  displayName: string;
  order: number;
  color: string | null;
  enabled: boolean | null;
  autoTriggerJobs: string[] | null;
  agentTriggers: AgentTrigger[] | null;
  requiredDocuments: string[] | null;
  requiredApprovals: number | null;
  humanInLoop: boolean | null;
  rules: Record<string, unknown> | null;
}

interface ColumnAutomationCardProps {
  workspaceId: string;
}

// Stage color mapping (same as ColumnsSettingsCard)
const stageColors: Record<string, { bg: string; border: string }> = {
  slate: { bg: "bg-slate-400/80", border: "border-slate-400/50" },
  teal: { bg: "bg-teal-400/80", border: "border-teal-400/50" },
  purple: { bg: "bg-purple-400/80", border: "border-purple-400/50" },
  blue: { bg: "bg-blue-400/80", border: "border-blue-400/50" },
  pink: { bg: "bg-pink-400/80", border: "border-pink-400/50" },
  amber: { bg: "bg-amber-400/80", border: "border-amber-400/50" },
  orange: { bg: "bg-orange-400/80", border: "border-orange-400/50" },
  green: { bg: "bg-green-400/80", border: "border-green-400/50" },
  cyan: { bg: "bg-cyan-400/80", border: "border-cyan-400/50" },
  indigo: { bg: "bg-indigo-400/80", border: "border-indigo-400/50" },
  emerald: { bg: "bg-emerald-400/80", border: "border-emerald-400/50" },
};

async function fetchColumns(workspaceId: string): Promise<ColumnConfig[]> {
  const response = await fetch(`/api/columns?workspaceId=${workspaceId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch columns");
  }
  return response.json();
}

async function updateColumnAutomation(
  columnId: string,
  agentTriggers: AgentTrigger[]
): Promise<{ ok: boolean }> {
  const response = await fetch(`/api/columns/${columnId}/automation`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentTriggers }),
  });
  if (!response.ok) {
    throw new Error("Failed to update column automation");
  }
  return response.json();
}

export function ColumnAutomationCard({ workspaceId }: ColumnAutomationCardProps) {
  // Track which columns are expanded
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  // Track pending changes per column
  const [pendingChanges, setPendingChanges] = useState<
    Map<string, AgentTrigger[]>
  >(new Map());

  // Track save success states
  const [saveSuccess, setSaveSuccess] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const {
    data: columns,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["columns", workspaceId],
    queryFn: () => fetchColumns(workspaceId),
  });

  const mutation = useMutation({
    mutationFn: ({
      columnId,
      agentTriggers,
    }: {
      columnId: string;
      agentTriggers: AgentTrigger[];
    }) => updateColumnAutomation(columnId, agentTriggers),
    onSuccess: (_, variables) => {
      // Clear pending changes for this column
      setPendingChanges((prev) => {
        const next = new Map(prev);
        next.delete(variables.columnId);
        return next;
      });

      // Show success indicator
      setSaveSuccess((prev) => new Set(prev).add(variables.columnId));
      setTimeout(() => {
        setSaveSuccess((prev) => {
          const next = new Set(prev);
          next.delete(variables.columnId);
          return next;
        });
      }, 2000);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["columns", workspaceId] });
    },
  });

  const toggleColumn = (columnId: string) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const handleTriggersChange = useCallback(
    (columnId: string, triggers: AgentTrigger[]) => {
      setPendingChanges((prev) => {
        const next = new Map(prev);
        next.set(columnId, triggers);
        return next;
      });
    },
    []
  );

  const handleSave = (columnId: string) => {
    const triggers = pendingChanges.get(columnId);
    if (triggers !== undefined) {
      mutation.mutate({ columnId, agentTriggers: triggers });
    }
  };

  const getColumnTriggers = (column: ColumnConfig): AgentTrigger[] => {
    // Return pending changes if any, otherwise return saved data
    return pendingChanges.get(column.id) ?? column.agentTriggers ?? [];
  };

  const hasPendingChanges = (columnId: string): boolean => {
    return pendingChanges.has(columnId);
  };

  // Filter to enabled columns only
  const enabledColumns = columns?.filter((c) => c.enabled !== false) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Column Automation
        </CardTitle>
        <CardDescription>
          Configure which agents run automatically when projects are moved to
          each column. Agents are executed in priority order (drag to reorder).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load columns. Please try again.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && enabledColumns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No enabled columns found.</p>
            <p className="text-sm mt-1">
              Enable columns in Pipeline Columns settings first.
            </p>
          </div>
        )}

        {/* Column list with collapsible sections */}
        {!isLoading && !error && enabledColumns.length > 0 && (
          <div className="space-y-2">
            {enabledColumns
              .sort((a, b) => a.order - b.order)
              .map((column) => {
                const colorConfig =
                  stageColors[column.color || "slate"] || stageColors.slate;
                const triggers = getColumnTriggers(column);
                const isPending = hasPendingChanges(column.id);
                const isSaving =
                  mutation.isPending &&
                  mutation.variables?.columnId === column.id;
                const showSuccess = saveSuccess.has(column.id);
                const isExpanded = expandedColumns.has(column.id);

                return (
                  <div
                    key={column.id}
                    className={cn(
                      "border rounded-lg overflow-hidden",
                      colorConfig.border
                    )}
                  >
                    {/* Column header - clickable to expand/collapse */}
                    <button
                      type="button"
                      onClick={() => toggleColumn(column.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full shrink-0",
                          colorConfig.bg
                        )}
                      />
                      <span className="font-medium">{column.displayName}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {triggers.length}{" "}
                        {triggers.length === 1 ? "trigger" : "triggers"}
                      </Badge>
                      {isPending && !showSuccess && (
                        <Badge variant="secondary" className="text-xs">
                          Unsaved
                        </Badge>
                      )}
                      {showSuccess && (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-600"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Saved
                        </Badge>
                      )}
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t">
                        <div className="pt-4 space-y-4">
                          <AutomationRuleEditor
                            workspaceId={workspaceId}
                            columnId={column.id}
                            columnName={column.displayName}
                            agentTriggers={triggers}
                            onChange={(newTriggers) =>
                              handleTriggersChange(column.id, newTriggers)
                            }
                          />

                          {/* Save button */}
                          <div className="flex justify-end pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => handleSave(column.id)}
                              disabled={!isPending || isSaving}
                              className="gap-2"
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
