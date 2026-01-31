"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Wand2,
  Loader2,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AgentTrigger } from "./AutomationRuleEditor";

// Types
type AgentDefinitionType =
  | "agents_md"
  | "skill"
  | "command"
  | "subagent"
  | "rule";

interface AgentDefinition {
  id: string;
  name: string;
  type: AgentDefinitionType;
  description: string | null;
  content: string;
  triggers: string[] | null;
  enabled: boolean | null;
}

interface ColumnConfig {
  id: string;
  stage: string;
  displayName: string;
  order: number;
  color: string | null;
  enabled: boolean | null;
  agentTriggers: AgentTrigger[] | null;
}

interface PipelineSuggestion {
  columnId: string;
  columnName: string;
  columnStage: string;
  agentId: string;
  agentName: string;
  agentType: AgentDefinitionType;
  confidence: number;
  reason: string;
  selected: boolean;
}

interface PipelineWizardProps {
  workspaceId: string;
}

// Stage keywords to look for in agent content
const STAGE_KEYWORDS: Record<string, string[]> = {
  inbox: ["inbox", "triage", "new signal", "incoming", "unprocessed"],
  research: ["research", "analyze", "investigate", "discovery", "explore"],
  prd: ["prd", "requirements", "product requirements", "spec", "specification"],
  design: [
    "design",
    "design brief",
    "ux",
    "ui",
    "wireframe",
    "mockup",
    "prototype",
  ],
  prototype: ["prototype", "build", "implement", "develop", "code"],
  review: ["review", "validate", "test", "qa", "verify", "jury"],
  done: ["done", "complete", "ship", "release", "deploy", "launch"],
};

// Action keywords that suggest what an agent does
const ACTION_KEYWORDS: Record<string, string[]> = {
  ingest: ["ingest", "process", "parse", "extract"],
  analyze: ["analyze", "evaluate", "assess", "review"],
  generate: ["generate", "create", "write", "produce"],
  transform: ["transform", "convert", "translate"],
  validate: ["validate", "verify", "check", "test"],
};

/**
 * Analyze agent content to suggest column mappings
 */
function analyzeAgentForPipeline(
  agent: AgentDefinition,
  columns: ColumnConfig[],
): PipelineSuggestion[] {
  const suggestions: PipelineSuggestion[] = [];
  const contentLower = agent.content.toLowerCase();
  const nameLower = agent.name.toLowerCase();

  // Check for stage keywords in agent content and name
  for (const column of columns) {
    if (!column.enabled) continue;

    const stageLower = column.stage.toLowerCase();
    const displayNameLower = column.displayName.toLowerCase();
    const keywords = STAGE_KEYWORDS[stageLower] || [];

    let confidence = 0;
    let reasons: string[] = [];

    // Check if agent name mentions the stage
    if (
      nameLower.includes(stageLower) ||
      nameLower.includes(displayNameLower)
    ) {
      confidence += 0.4;
      reasons.push(`Name mentions "${column.displayName}"`);
    }

    // Check content for stage keywords
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) {
        confidence += 0.2;
        reasons.push(`Content mentions "${keyword}"`);
        break; // Only count once per stage
      }
    }

    // Check explicit triggers in agent definition
    if (agent.triggers?.length) {
      for (const trigger of agent.triggers) {
        const triggerLower = trigger.toLowerCase();
        if (
          triggerLower.includes(stageLower) ||
          triggerLower.includes(displayNameLower)
        ) {
          confidence += 0.3;
          reasons.push(`Trigger: "${trigger}"`);
        }
      }
    }

    // Check for action patterns
    for (const [action, actionKeywords] of Object.entries(ACTION_KEYWORDS)) {
      for (const keyword of actionKeywords) {
        if (contentLower.includes(keyword)) {
          // Map actions to likely stages
          if (
            action === "ingest" &&
            (stageLower === "inbox" || stageLower === "research")
          ) {
            confidence += 0.15;
            reasons.push(`${action} action likely for ${column.displayName}`);
          }
          if (action === "generate" && stageLower === "prd") {
            confidence += 0.15;
            reasons.push(`${action} action likely for ${column.displayName}`);
          }
          if (
            action === "validate" &&
            (stageLower === "review" || stageLower === "validate")
          ) {
            confidence += 0.15;
            reasons.push(`${action} action likely for ${column.displayName}`);
          }
          break;
        }
      }
    }

    // Only suggest if confidence is above threshold
    if (confidence >= 0.3 && reasons.length > 0) {
      suggestions.push({
        columnId: column.id,
        columnName: column.displayName,
        columnStage: column.stage,
        agentId: agent.id,
        agentName: agent.name,
        agentType: agent.type,
        confidence: Math.min(confidence, 1),
        reason: reasons.slice(0, 2).join("; "),
        selected: confidence >= 0.5, // Pre-select high confidence suggestions
      });
    }
  }

  return suggestions;
}

/**
 * Dedupe and rank suggestions - keep only best suggestion per column-agent pair
 */
function dedupeAndRankSuggestions(
  suggestions: PipelineSuggestion[],
): PipelineSuggestion[] {
  const grouped = new Map<string, PipelineSuggestion[]>();

  // Group by column
  for (const suggestion of suggestions) {
    const key = suggestion.columnId;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(suggestion);
  }

  // Sort each group by confidence and flatten
  const result: PipelineSuggestion[] = [];
  for (const [, columnSuggestions] of grouped) {
    const sorted = columnSuggestions.sort(
      (a, b) => b.confidence - a.confidence,
    );
    result.push(...sorted);
  }

  return result.sort((a, b) => {
    // Sort by column order first, then by confidence
    const orderA = parseInt(a.columnStage) || 0;
    const orderB = parseInt(b.columnStage) || 0;
    if (orderA !== orderB) return orderA - orderB;
    return b.confidence - a.confidence;
  });
}

// Stage color mapping
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

export function PipelineWizard({ workspaceId }: PipelineWizardProps) {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<PipelineSuggestion[]>([]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set(),
  );
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["agents", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/agents?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      return data.agents as AgentDefinition[];
    },
  });

  // Fetch columns
  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ["columns", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/columns?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch columns");
      return res.json() as Promise<ColumnConfig[]>;
    },
  });

  // Analyze agents when data loads
  useEffect(() => {
    if (!agents || !columns) return;

    // Only analyze executable agents (commands and skills)
    const executableAgents = agents.filter(
      (a) =>
        (a.type === "command" || a.type === "skill") && a.enabled !== false,
    );

    const allSuggestions: PipelineSuggestion[] = [];

    for (const agent of executableAgents) {
      const agentSuggestions = analyzeAgentForPipeline(agent, columns);
      allSuggestions.push(...agentSuggestions);
    }

    const ranked = dedupeAndRankSuggestions(allSuggestions);
    setSuggestions(ranked);

    // Auto-expand columns with suggestions
    const columnsWithSuggestions = new Set(ranked.map((s) => s.columnId));
    setExpandedColumns(columnsWithSuggestions);
  }, [agents, columns]);

  // Group suggestions by column
  const suggestionsByColumn = useMemo(() => {
    const grouped = new Map<string, PipelineSuggestion[]>();
    for (const suggestion of suggestions) {
      if (!grouped.has(suggestion.columnId)) {
        grouped.set(suggestion.columnId, []);
      }
      grouped.get(suggestion.columnId)!.push(suggestion);
    }
    return grouped;
  }, [suggestions]);

  // Apply mutations
  const applyMutation = useMutation({
    mutationFn: async () => {
      // Group selected suggestions by column
      const selectedByColumn = new Map<string, PipelineSuggestion[]>();
      for (const suggestion of suggestions.filter((s) => s.selected)) {
        if (!selectedByColumn.has(suggestion.columnId)) {
          selectedByColumn.set(suggestion.columnId, []);
        }
        selectedByColumn.get(suggestion.columnId)!.push(suggestion);
      }

      // Apply each column's configuration
      const results = [];
      for (const [columnId, columnSuggestions] of selectedByColumn) {
        // Get existing triggers for this column
        const column = columns?.find((c) => c.id === columnId);
        const existingTriggers = column?.agentTriggers || [];

        // Build new triggers (avoid duplicates)
        const existingAgentIds = new Set(
          existingTriggers.map((t) => t.agentDefinitionId),
        );
        const newTriggers = columnSuggestions
          .filter((s) => !existingAgentIds.has(s.agentId))
          .map((s, i) => ({
            agentDefinitionId: s.agentId,
            priority: existingTriggers.length + i + 1,
            enabled: true,
          }));

        const allTriggers = [...existingTriggers, ...newTriggers];

        const res = await fetch(`/api/columns/${columnId}/automation`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentTriggers: allTriggers }),
        });

        if (!res.ok) {
          throw new Error(`Failed to update column ${columnId}`);
        }

        results.push({ columnId, triggers: allTriggers.length });
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns", workspaceId] });
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    },
  });

  // Toggle suggestion selection
  const toggleSuggestion = (agentId: string, columnId: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.agentId === agentId && s.columnId === columnId
          ? { ...s, selected: !s.selected }
          : s,
      ),
    );
  };

  // Select all
  const selectAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, selected: true })));
  };

  // Deselect all
  const deselectAll = () => {
    setSuggestions((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  // Count selected
  const selectedCount = suggestions.filter((s) => s.selected).length;

  const isLoading = agentsLoading || columnsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Pipeline Setup Wizard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!agents?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Pipeline Setup Wizard
          </CardTitle>
          <CardDescription>
            Auto-configure your pipeline based on imported agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
            <p className="text-muted-foreground">
              No agents imported yet. Import agents from a repository first to
              use the pipeline wizard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Pipeline Setup Wizard
          </CardTitle>
          <CardDescription>
            Auto-configure your pipeline based on imported agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-slate-500 mb-3" />
            <p className="text-muted-foreground">
              No automatic mappings found. Your agents may need more specific
              stage-related content (like "inbox", "prd", "research") for
              auto-detection.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You can still configure column automation manually in the
              Automation tab.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Pipeline Setup Wizard
            </CardTitle>
            <CardDescription className="mt-1">
              Auto-generated configuration from your imported agents
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
          <div>
            <span className="text-muted-foreground">Agents analyzed:</span>{" "}
            <span className="font-medium">{agents?.length || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Suggestions:</span>{" "}
            <span className="font-medium">{suggestions.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Selected:</span>{" "}
            <span className="font-medium text-primary">{selectedCount}</span>
          </div>
        </div>

        {/* Suggestions grouped by column */}
        <div className="space-y-3">
          {columns
            ?.filter((c) => c.enabled)
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const columnSuggestions =
                suggestionsByColumn.get(column.id) || [];
              const isExpanded = expandedColumns.has(column.id);
              const colorConfig = stageColors[column.color || "slate"];
              const hasSelectedSuggestions = columnSuggestions.some(
                (s) => s.selected,
              );

              if (columnSuggestions.length === 0) return null;

              return (
                <Collapsible
                  key={column.id}
                  open={isExpanded}
                  onOpenChange={(open) => {
                    const newExpanded = new Set(expandedColumns);
                    if (open) {
                      newExpanded.add(column.id);
                    } else {
                      newExpanded.delete(column.id);
                    }
                    setExpandedColumns(newExpanded);
                  }}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-3 h-3 rounded-full",
                              colorConfig.bg,
                            )}
                          />
                          <span className="font-medium">
                            {column.displayName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {columnSuggestions.length} suggestion
                            {columnSuggestions.length !== 1 ? "s" : ""}
                          </Badge>
                          {hasSelectedSuggestions && (
                            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                              <Check className="w-3 h-3 mr-1" />
                              Will configure
                            </Badge>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t p-3 space-y-2 bg-muted/30">
                        {columnSuggestions.map((suggestion) => (
                          <div
                            key={`${suggestion.columnId}-${suggestion.agentId}`}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer",
                              suggestion.selected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted/50",
                            )}
                            onClick={() =>
                              toggleSuggestion(
                                suggestion.agentId,
                                suggestion.columnId,
                              )
                            }
                          >
                            <Checkbox
                              checked={suggestion.selected}
                              onCheckedChange={() =>
                                toggleSuggestion(
                                  suggestion.agentId,
                                  suggestion.columnId,
                                )
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span className="font-medium text-sm truncate">
                                  {suggestion.agentName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase"
                                >
                                  {suggestion.agentType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                {suggestion.reason}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}%
                              confidence
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <>
              {selectedCount} agent{selectedCount !== 1 ? "s" : ""} will be
              configured to run automatically
            </>
          ) : (
            "Select suggestions to configure your pipeline"
          )}
        </p>
        <Button
          onClick={() => applyMutation.mutate()}
          disabled={
            selectedCount === 0 || applyMutation.isPending || applySuccess
          }
        >
          {applyMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : applySuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Applied!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Apply Configuration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
