"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Columns3,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import type { JobType, DocumentType } from "@/lib/db/schema";

// Stage color mapping
const stageColors: Record<string, { bg: string; text: string; glow: string }> = {
  slate: { bg: "bg-slate-400/80", text: "text-slate-700", glow: "shadow-[0_0_8px_rgba(148,163,184,0.5)]" },
  teal: { bg: "bg-teal-400/80", text: "text-teal-700", glow: "shadow-[0_0_8px_rgba(45,212,191,0.5)]" },
  purple: { bg: "bg-purple-400/80", text: "text-purple-700", glow: "shadow-[0_0_8px_rgba(192,132,252,0.5)]" },
  blue: { bg: "bg-blue-400/80", text: "text-blue-700", glow: "shadow-[0_0_8px_rgba(96,165,250,0.5)]" },
  pink: { bg: "bg-pink-400/80", text: "text-pink-700", glow: "shadow-[0_0_8px_rgba(244,114,182,0.5)]" },
  amber: { bg: "bg-amber-400/80", text: "text-amber-700", glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]" },
  orange: { bg: "bg-orange-400/80", text: "text-orange-700", glow: "shadow-[0_0_8px_rgba(251,146,60,0.5)]" },
  green: { bg: "bg-green-400/80", text: "text-green-700", glow: "shadow-[0_0_8px_rgba(74,222,128,0.5)]" },
  cyan: { bg: "bg-cyan-400/80", text: "text-cyan-700", glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]" },
  indigo: { bg: "bg-indigo-400/80", text: "text-indigo-700", glow: "shadow-[0_0_8px_rgba(129,140,248,0.5)]" },
  emerald: { bg: "bg-emerald-400/80", text: "text-emerald-700", glow: "shadow-[0_0_8px_rgba(52,211,153,0.5)]" },
};

const jobTypeOptions: Array<{ value: JobType; label: string; description?: string }> = [
  { value: "analyze_transcript", label: "Analyze Transcript", description: "Extract insights from user research" },
  { value: "process_signal", label: "Process Signal", description: "Ingest and normalize incoming signals" },
  { value: "synthesize_signals", label: "Synthesize Signals", description: "Cluster and summarize related signals" },
  { value: "generate_prd", label: "Generate PRD", description: "Create product requirements document" },
  { value: "generate_design_brief", label: "Generate Design Brief", description: "Create design specifications" },
  { value: "generate_engineering_spec", label: "Generate Engineering Spec", description: "Create technical specifications" },
  { value: "generate_gtm_brief", label: "Generate GTM Brief", description: "Create go-to-market plan" },
  { value: "run_jury_evaluation", label: "Run Jury Evaluation", description: "Evaluate with synthetic personas" },
  { value: "build_prototype", label: "Build Prototype", description: "Generate prototype components" },
  { value: "iterate_prototype", label: "Iterate Prototype", description: "Improve existing prototype" },
  { value: "generate_tickets", label: "Generate Tickets", description: "Create engineering tickets" },
  { value: "validate_tickets", label: "Validate Tickets", description: "Review and validate tickets" },
  { value: "execute_agent_definition", label: "Execute Agent Definition", description: "Run imported skill/command/subagent" },
  { value: "deploy_chromatic", label: "Deploy to Chromatic", description: "Deploy Storybook to Chromatic" },
  { value: "create_feature_branch", label: "Create Feature Branch", description: "Create a git branch" },
];

const documentTypeOptions: Array<{ value: DocumentType; label: string }> = [
  { value: "research", label: "Research" },
  { value: "prd", label: "PRD" },
  { value: "design_brief", label: "Design Brief" },
  { value: "engineering_spec", label: "Engineering Spec" },
  { value: "gtm_brief", label: "GTM Brief" },
  { value: "prototype_notes", label: "Prototype Notes" },
  { value: "jury_report", label: "Jury Report" },
];

export interface KanbanColumn {
  id: string;
  configId?: string;
  displayName: string;
  color: string;
  order: number;
  enabled: boolean;
  autoTriggerJobs?: string[];
  agentTriggers?: Array<{
    agentDefinitionId: string;
    priority: number;
    conditions?: Record<string, unknown>;
  }>;
  humanInLoop?: boolean;
  requiredDocuments?: string[];
  requiredApprovals?: number;
  contextPaths?: string[];
  contextNotes?: string;
  loopGroupId?: string;
  loopTargets?: string[];
  dependencyNotes?: string;
}

interface ColumnsSettingsCardProps {
  columns: KanbanColumn[];
  setColumns: (columns: KanbanColumn[]) => void;
  workspaceId: string;
  onColumnChange?: () => void;
}

export function ColumnsSettingsCard({
  columns,
  setColumns,
  workspaceId,
  onColumnChange,
}: ColumnsSettingsCardProps) {
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [columnEdits, setColumnEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [newColumnStage, setNewColumnStage] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("slate");

  const colorKeys = Object.keys(stageColors);

  const toggleColumnExpanded = (columnId: string) => {
    setExpandedColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const getColumnEdit = (id: string, key: string, fallback: unknown) =>
    columnEdits[id]?.[key] ?? fallback;

  const updateColumnEdit = (id: string, key: string, value: unknown) => {
    setColumnEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }));
  };

  const getColumnContextPaths = (column: KanbanColumn) => {
    const value = getColumnEdit(column.id, "contextPaths", column.contextPaths || []);
    return Array.isArray(value) ? value : [];
  };

  const updateColumnContextPath = (column: KanbanColumn, index: number, value: string) => {
    const paths = getColumnContextPaths(column);
    const next = paths.map((item, idx) => (idx === index ? value : item));
    updateColumnEdit(column.id, "contextPaths", next);
  };

  const addColumnContextPath = (column: KanbanColumn) => {
    const paths = getColumnContextPaths(column);
    updateColumnEdit(column.id, "contextPaths", [...paths, ""]);
  };

  const removeColumnContextPath = (column: KanbanColumn, index: number) => {
    const paths = getColumnContextPaths(column);
    updateColumnEdit(column.id, "contextPaths", paths.filter((_, idx) => idx !== index));
  };

  const moveColumnContextPath = (column: KanbanColumn, from: number, to: number) => {
    const paths = getColumnContextPaths(column);
    if (to < 0 || to >= paths.length) return;
    const next = [...paths];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateColumnEdit(column.id, "contextPaths", next);
  };

  const buildColumnPayload = (column: KanbanColumn, updates: Record<string, unknown>) => {
    const {
      contextPaths: updatedPaths,
      contextNotes: updatedNotes,
      loopGroupId: updatedLoopGroupId,
      loopTargets: updatedLoopTargets,
      dependencyNotes: updatedDependencyNotes,
      ...rest
    } = updates as {
      contextPaths?: string[];
      contextNotes?: string;
      loopGroupId?: string;
      loopTargets?: string[];
      dependencyNotes?: string;
    };
    const payload: Record<string, unknown> = { ...rest };
    if (updates.agentTriggers !== undefined) {
      payload.agentTriggers = updates.agentTriggers;
    }
    if (
      updatedPaths !== undefined ||
      updatedNotes !== undefined ||
      updatedLoopGroupId !== undefined ||
      updatedLoopTargets !== undefined ||
      updatedDependencyNotes !== undefined
    ) {
      payload.rules = {
        contextPaths: updatedPaths ?? column.contextPaths ?? [],
        contextNotes: updatedNotes ?? column.contextNotes ?? "",
        loopGroupId: updatedLoopGroupId ?? column.loopGroupId ?? "",
        loopTargets: updatedLoopTargets ?? column.loopTargets ?? [],
        dependencyNotes: updatedDependencyNotes ?? column.dependencyNotes ?? "",
      };
    }
    return payload;
  };

  const mapColumnToState = (column: {
    id: string;
    stage: string;
    displayName: string;
    color: string;
    order: number;
    enabled: boolean;
    autoTriggerJobs?: string[];
    agentTriggers?: Array<{
      agentDefinitionId: string;
      priority: number;
      conditions?: Record<string, unknown>;
    }>;
    humanInLoop?: boolean;
    requiredDocuments?: string[];
    requiredApprovals?: number;
    rules?: {
      contextPaths?: string[];
      contextNotes?: string;
      loopGroupId?: string;
      loopTargets?: string[];
      dependencyNotes?: string;
    };
  }): KanbanColumn => ({
    id: column.stage,
    configId: column.id,
    displayName: column.displayName,
    color: column.color,
    order: column.order,
    enabled: column.enabled,
    autoTriggerJobs: column.autoTriggerJobs,
    agentTriggers: column.agentTriggers || [],
    humanInLoop: column.humanInLoop,
    requiredDocuments: column.requiredDocuments,
    requiredApprovals: column.requiredApprovals,
    contextPaths: column.rules?.contextPaths,
    contextNotes: column.rules?.contextNotes,
    loopGroupId: column.rules?.loopGroupId,
    loopTargets: column.rules?.loopTargets,
    dependencyNotes: column.rules?.dependencyNotes,
  });

  const persistColumnUpdates = async (column: KanbanColumn, updates: Record<string, unknown>) => {
    if (!column) return;
    try {
      const columnId = column.configId || column.id;
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildColumnPayload(column, updates)),
      });
      if (!res.ok) throw new Error("Failed to update column");
      const updated = await res.json();
      const mapped = mapColumnToState(updated);
      setColumns(
        columns.map((existing) =>
          existing.id === mapped.id ? { ...existing, ...mapped } : existing
        )
      );
      setColumnEdits((prev) => {
        const next = { ...prev };
        delete next[column.id];
        return next;
      });
      onColumnChange?.();
    } catch (error) {
      console.error("Failed to update column:", error);
    }
  };

  const handleSaveColumn = async (column: KanbanColumn) => {
    const updates = columnEdits[column.id];
    if (!updates) return;
    await persistColumnUpdates(column, updates);
  };

  const handleAddColumn = async () => {
    if (!workspaceId || !newColumnStage.trim() || !newColumnName.trim()) return;
    try {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          stage: newColumnStage.trim(),
          displayName: newColumnName.trim(),
          color: newColumnColor,
          order: columns.length,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const mapped = mapColumnToState(created);
        setColumns([...columns, mapped].sort((a, b) => a.order - b.order));
        onColumnChange?.();
      }
      setNewColumnStage("");
      setNewColumnName("");
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Columns3 className="w-5 h-5" />
          Pipeline Columns
        </CardTitle>
        <CardDescription>
          Configure your pipeline columns. Click a column to expand and edit its settings.
          Toggle visibility instantly. Other changes require clicking Save.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {columns.sort((a, b) => a.order - b.order).map((column) => {
            const colorKey = String(getColumnEdit(column.id, "color", column.color || "slate"));
            const colorConfig = stageColors[colorKey] || stageColors.slate;
            const isExpanded = expandedColumns.has(column.id);
            const contextPathsValue = getColumnContextPaths(column);
            const contextNotesValue = String(
              getColumnEdit(column.id, "contextNotes", column.contextNotes || "")
            );
            const loopGroupIdValue = String(
              getColumnEdit(column.id, "loopGroupId", column.loopGroupId || "")
            );
            const loopTargetsValue = String(
              getColumnEdit(
                column.id,
                "loopTargets",
                (column.loopTargets || []).join(", ")
              )
            );
            const dependencyNotesValue = String(
              getColumnEdit(column.id, "dependencyNotes", column.dependencyNotes || "")
            );
            const colorOptions = colorKeys.includes(colorKey)
              ? colorKeys
              : [...colorKeys, colorKey];
            const displayNameValue = String(getColumnEdit(column.id, "displayName", column.displayName));

            return (
              <div
                key={column.id}
                className={cn(
                  "rounded-lg border transition-colors",
                  isExpanded
                    ? "border-primary/50 bg-muted/30"
                    : "border-border hover:border-primary/30 bg-card"
                )}
              >
                {/* Collapsed Header */}
                <button
                  type="button"
                  onClick={() => toggleColumnExpanded(column.id)}
                  className="w-full p-3 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("w-3 h-3 rounded-full shrink-0", colorConfig.bg)} />
                    <div className="min-w-0">
                      <span className="font-medium text-sm block truncate">
                        {displayNameValue || column.id}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {column.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-muted-foreground">
                        {column.enabled ? "Visible" : "Hidden"}
                      </span>
                      <Switch
                        checked={column.enabled}
                        onCheckedChange={(checked) => persistColumnUpdates(column, { enabled: checked })}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-4 space-y-4 border-t border-border">
                    {/* Basic Settings */}
                    <div className="pt-4">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Basic Settings
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Display Name</Label>
                          <Input
                            value={displayNameValue}
                            onChange={(e) => updateColumnEdit(column.id, "displayName", e.target.value)}
                            placeholder="Display name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Color</Label>
                          <Select
                            value={colorKey}
                            onValueChange={(value) => updateColumnEdit(column.id, "color", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map((key) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", stageColors[key]?.bg || "bg-slate-400")} />
                                    <span className="capitalize">{key}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Required Approvals</Label>
                          <Input
                            value={String(
                              getColumnEdit(
                                column.id,
                                "requiredApprovals",
                                column.requiredApprovals || 0
                              )
                            )}
                            onChange={(e) =>
                              updateColumnEdit(column.id, "requiredApprovals", Number(e.target.value))
                            }
                            type="number"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Jobs & Requirements */}
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Jobs & Requirements
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Auto-trigger Jobs</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between h-auto min-h-9 py-2">
                                <span className="text-left truncate text-sm">
                                  {(() => {
                                    const selectedJobs = getColumnEdit(
                                      column.id,
                                      "autoTriggerJobs",
                                      column.autoTriggerJobs || []
                                    ) as string[];
                                    if (selectedJobs.length === 0) return "Select jobs...";
                                    if (selectedJobs.length <= 2) {
                                      return selectedJobs
                                        .map(j => jobTypeOptions.find(o => o.value === j)?.label || j)
                                        .join(", ");
                                    }
                                    return `${selectedJobs.length} jobs selected`;
                                  })()}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto">
                              <DropdownMenuLabel>Available Jobs</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {jobTypeOptions.map((job) => {
                                const selectedJobs = (getColumnEdit(
                                  column.id,
                                  "autoTriggerJobs",
                                  column.autoTriggerJobs || []
                                ) as string[]);
                                const isSelected = selectedJobs.includes(job.value);
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={job.value}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const newJobs = checked
                                        ? [...selectedJobs, job.value]
                                        : selectedJobs.filter(j => j !== job.value);
                                      updateColumnEdit(column.id, "autoTriggerJobs", newJobs);
                                    }}
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <div className="flex flex-col">
                                      <span>{job.label}</span>
                                      {job.description && (
                                        <span className="text-xs text-muted-foreground">{job.description}</span>
                                      )}
                                    </div>
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <p className="text-xs text-muted-foreground">
                            Jobs that run automatically when a project enters this stage
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Required Documents</Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between h-auto min-h-9 py-2">
                                <span className="text-left truncate text-sm">
                                  {(() => {
                                    const selectedDocs = (getColumnEdit(
                                      column.id,
                                      "requiredDocuments",
                                      column.requiredDocuments || []
                                    ) as string[]);
                                    if (selectedDocs.length === 0) return "Select documents...";
                                    if (selectedDocs.length <= 2) {
                                      return selectedDocs
                                        .map(d => documentTypeOptions.find(o => o.value === d)?.label || d)
                                        .join(", ");
                                    }
                                    return `${selectedDocs.length} documents required`;
                                  })()}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 max-h-72 overflow-y-auto">
                              <DropdownMenuLabel>Document Types</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {documentTypeOptions.map((doc) => {
                                const selectedDocs = (getColumnEdit(
                                  column.id,
                                  "requiredDocuments",
                                  column.requiredDocuments || []
                                ) as string[]);
                                const isSelected = selectedDocs.includes(doc.value);
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={doc.value}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const newDocs = checked
                                        ? [...selectedDocs, doc.value]
                                        : selectedDocs.filter(d => d !== doc.value);
                                      updateColumnEdit(column.id, "requiredDocuments", newDocs);
                                    }}
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    {doc.label}
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <p className="text-xs text-muted-foreground">
                            Documents that must exist before moving to this stage
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm">Agent Triggers</Label>
                        {(() => {
                          const triggers = (getColumnEdit(
                            column.id,
                            "agentTriggers",
                            column.agentTriggers || []
                          ) as Array<{ agentDefinitionId: string; priority: number }>);

                          return (
                            <div className="space-y-2">
                              {triggers.map((trigger, idx) => (
                                <div key={`agent-trigger-${idx}`} className="flex items-center gap-2">
                                  <Input
                                    placeholder="agent_definition_id"
                                    value={trigger.agentDefinitionId}
                                    onChange={(e) => {
                                      const next = [...triggers];
                                      next[idx] = { ...next[idx], agentDefinitionId: e.target.value };
                                      updateColumnEdit(column.id, "agentTriggers", next);
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    className="w-24"
                                    value={String(trigger.priority ?? 0)}
                                    onChange={(e) => {
                                      const next = [...triggers];
                                      next[idx] = {
                                        ...next[idx],
                                        priority: Number(e.target.value || 0),
                                      };
                                      updateColumnEdit(column.id, "agentTriggers", next);
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      const next = triggers.filter((_, tIdx) => tIdx !== idx);
                                      updateColumnEdit(column.id, "agentTriggers", next);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  const next = [...triggers, { agentDefinitionId: "", priority: 0 }];
                                  updateColumnEdit(column.id, "agentTriggers", next);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                                Add Agent Trigger
                              </Button>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-muted-foreground">
                          Agent definitions run automatically when a project enters this stage.
                        </p>
                      </div>
                    </div>

                    {/* Context Settings */}
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Context
                      </h5>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Context Paths</Label>
                          <div className="space-y-2">
                            {contextPathsValue.map((path, idx) => (
                              <div key={`${column.id}-context-${idx}`} className="flex items-center gap-2">
                                <Input
                                  value={path}
                                  onChange={(e) => updateColumnContextPath(column, idx, e.target.value)}
                                  placeholder="elmer-docs/"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveColumnContextPath(column, idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="h-9 w-9"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveColumnContextPath(column, idx, idx + 1)}
                                  disabled={idx === contextPathsValue.length - 1}
                                  className="h-9 w-9"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeColumnContextPath(column, idx)}
                                  className="h-9 w-9"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => addColumnContextPath(column)}
                            >
                              <Plus className="w-4 h-4" />
                              Add Path
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Context Notes</Label>
                          <Textarea
                            value={contextNotesValue}
                            onChange={(e) => updateColumnEdit(column.id, "contextNotes", e.target.value)}
                            className="min-h-[100px]"
                            placeholder="Optional notes or instructions for this stage"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Iteration Loops */}
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Iteration Loops
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Loop Group ID</Label>
                          <Input
                            value={loopGroupIdValue}
                            onChange={(e) =>
                              updateColumnEdit(column.id, "loopGroupId", e.target.value.trim())
                            }
                            placeholder="e.g. discovery-prd-loop"
                          />
                          <p className="text-xs text-muted-foreground">
                            Group stages that can iterate together
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Loop Targets</Label>
                          <Input
                            value={loopTargetsValue}
                            onChange={(e) =>
                              updateColumnEdit(
                                column.id,
                                "loopTargets",
                                e.target.value
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean)
                              )
                            }
                            placeholder="e.g. discovery, prd"
                          />
                          <p className="text-xs text-muted-foreground">
                            Stage IDs this column can loop back to
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm">Dependency Notes</Label>
                        <Textarea
                          value={dependencyNotesValue}
                          onChange={(e) =>
                            updateColumnEdit(column.id, "dependencyNotes", e.target.value)
                          }
                          className="min-h-[72px]"
                          placeholder="Describe validation criteria or dependency behavior"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveColumn(column)}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Column
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Column */}
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20">
          <h4 className="text-sm font-medium mb-3">Add New Column</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Stage ID</Label>
              <Input
                placeholder="e.g. review"
                value={newColumnStage}
                onChange={(e) => setNewColumnStage(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Display Name</Label>
              <Input
                placeholder="e.g. In Review"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <Select
                value={newColumnColor}
                onValueChange={setNewColumnColor}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", stageColors[key]?.bg || "bg-slate-400")} />
                        <span className="capitalize">{key}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddColumn} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Column
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
