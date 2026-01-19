"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUIStore, useKanbanStore, type KanbanColumn } from "@/lib/store";
import type { ProjectStage } from "@/lib/db/schema";
import { popInVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { DocumentType, KnowledgebaseType } from "@/lib/db/schema";
import {
  Settings,
  Columns3,
  Workflow,
  Info,
  Save,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Users,
  Bot,
  Sparkles,
  Bell,
} from "lucide-react";

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

const knowledgebaseOptions: Array<{ value: KnowledgebaseType; label: string }> = [
  { value: "company_context", label: "Company Context" },
  { value: "strategic_guardrails", label: "Guardrails" },
  { value: "personas", label: "Personas" },
  { value: "roadmap", label: "Roadmap" },
  { value: "rules", label: "Rules" },
];

const documentTypeLabels: Record<DocumentType, string> = {
  research: "Research",
  prd: "PRD",
  design_brief: "Design Brief",
  engineering_spec: "Engineering Spec",
  gtm_brief: "GTM Brief",
  prototype_notes: "Prototype Notes",
  jury_report: "Jury Report",
};

export function WorkspaceSettingsModal() {
  const isOpen = useUIStore((s) => s.settingsModalOpen);
  const closeModal = useUIStore((s) => s.closeSettingsModal);
  const workspace = useKanbanStore((s) => s.workspace);
  const updateWorkspace = useKanbanStore((s) => s.updateWorkspace);
  const setColumns = useKanbanStore((s) => s.setColumns);
  const columns = useKanbanStore((s) => s.columns);

  const [githubRepo, setGithubRepo] = useState("");
  const [contextPaths, setContextPaths] = useState<string[]>(["elmer-docs/"]);
  const [prototypesPath, setPrototypesPath] = useState("");
  const [storybookPort, setStorybookPort] = useState("6006");
  const [baseBranch, setBaseBranch] = useState("main");
  const [autoCreateFeatureBranch, setAutoCreateFeatureBranch] = useState(true);
  const [autoCommitJobs, setAutoCommitJobs] = useState(false);
  const [cursorDeepLinkTemplate, setCursorDeepLinkTemplate] = useState("");
  const [aiExecutionMode, setAiExecutionMode] = useState<"cursor" | "server" | "hybrid">(
    "hybrid"
  );
  const [aiValidationMode, setAiValidationMode] = useState<"none" | "light" | "schema">("schema");
  const [aiFallbackAfterMinutes, setAiFallbackAfterMinutes] = useState("30");
  const [knowledgebaseMapping, setKnowledgebaseMapping] = useState<Record<string, string>>({});
  const [automationMode, setAutomationMode] = useState<"manual" | "auto_to_stage" | "auto_all">(
    "manual"
  );
  const [automationStopStage, setAutomationStopStage] = useState("");
  const [automationNotifyStage, setAutomationNotifyStage] = useState("");
  // Background Worker Settings
  const [workerEnabled, setWorkerEnabled] = useState(true);
  const [workerMaxConcurrency, setWorkerMaxConcurrency] = useState("10");
  // Browser Notification Settings
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [notifyOnJobComplete, setNotifyOnJobComplete] = useState(true);
  const [notifyOnJobFailed, setNotifyOnJobFailed] = useState(true);
  const [notifyOnApprovalRequired, setNotifyOnApprovalRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [columnEdits, setColumnEdits] = useState<Record<string, Record<string, unknown>>>({});
  const [newColumnStage, setNewColumnStage] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("slate");

  const colorKeys = Object.keys(stageColors);

  // Use ref to access latest settings without triggering effect re-runs
  const workspaceSettingsRef = useRef(workspace?.settings);
  useEffect(() => {
    workspaceSettingsRef.current = workspace?.settings;
  }, [workspace?.settings]);

  useEffect(() => {
    if (workspace) {
      setGithubRepo(workspace.githubRepo || "");
      const workspaceContextPaths =
        workspace.settings?.contextPaths?.length
          ? workspace.settings.contextPaths
          : workspace.contextPath
            ? [workspace.contextPath]
            : ["elmer-docs/"];
      setContextPaths(workspaceContextPaths);
      setPrototypesPath(workspace.settings?.prototypesPath || "");
      setStorybookPort(
        workspace.settings?.storybookPort ? String(workspace.settings.storybookPort) : "6006"
      );
      setBaseBranch(workspace.settings?.baseBranch || "main");
      setAutoCreateFeatureBranch(workspace.settings?.autoCreateFeatureBranch ?? true);
      setAutoCommitJobs(workspace.settings?.autoCommitJobs ?? false);
      setCursorDeepLinkTemplate(workspace.settings?.cursorDeepLinkTemplate || "");
      setAiExecutionMode(workspace.settings?.aiExecutionMode || "hybrid");
      setAiValidationMode(workspace.settings?.aiValidationMode || "schema");
      setAiFallbackAfterMinutes(
        workspace.settings?.aiFallbackAfterMinutes
          ? String(workspace.settings.aiFallbackAfterMinutes)
          : "30"
      );
      setKnowledgebaseMapping(workspace.settings?.knowledgebaseMapping || {});
      setAutomationMode(workspace.settings?.automationMode || "manual");
      setAutomationStopStage(workspace.settings?.automationStopStage || "");
      setAutomationNotifyStage(workspace.settings?.automationNotifyStage || "");
      // Background Worker Settings
      setWorkerEnabled(workspace.settings?.workerEnabled ?? true);
      setWorkerMaxConcurrency(
        workspace.settings?.workerMaxConcurrency
          ? String(workspace.settings.workerMaxConcurrency)
          : "10"
      );
      // Browser Notification Settings
      setBrowserNotificationsEnabled(workspace.settings?.browserNotificationsEnabled ?? true);
      setNotifyOnJobComplete(workspace.settings?.notifyOnJobComplete ?? true);
      setNotifyOnJobFailed(workspace.settings?.notifyOnJobFailed ?? true);
      setNotifyOnApprovalRequired(workspace.settings?.notifyOnApprovalRequired ?? true);
    }
  }, [workspace]);

  const sortedDocumentTypes = useMemo(
    () => (Object.keys(documentTypeLabels) as DocumentType[]).sort(),
    []
  );

  const normalizePath = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  };

  const normalizePaths = (paths: string[]) => {
    const normalized = paths.map(normalizePath).filter(Boolean);
    return normalized.length ? normalized : ["elmer-docs/"];
  };

  const updateContextPath = (index: number, value: string) => {
    setContextPaths((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addContextPath = () => {
    setContextPaths((prev) => [...prev, ""]);
  };

  const removeContextPath = (index: number) => {
    setContextPaths((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveContextPath = (from: number, to: number) => {
    setContextPaths((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
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

  const getColumnContextPaths = (column: (typeof columns)[number]) => {
    const value = getColumnEdit(column.id, "contextPaths", column.contextPaths || []);
    return Array.isArray(value) ? value : [];
  };

  const updateColumnContextPath = (
    column: (typeof columns)[number],
    index: number,
    value: string
  ) => {
    const paths = getColumnContextPaths(column);
    const next = paths.map((item, idx) => (idx === index ? value : item));
    updateColumnEdit(column.id, "contextPaths", next);
  };

  const addColumnContextPath = (column: (typeof columns)[number]) => {
    const paths = getColumnContextPaths(column);
    updateColumnEdit(column.id, "contextPaths", [...paths, ""]);
  };

  const removeColumnContextPath = (column: (typeof columns)[number], index: number) => {
    const paths = getColumnContextPaths(column);
    updateColumnEdit(
      column.id,
      "contextPaths",
      paths.filter((_, idx) => idx !== index)
    );
  };

  const moveColumnContextPath = (
    column: (typeof columns)[number],
    from: number,
    to: number
  ) => {
    const paths = getColumnContextPaths(column);
    if (to < 0 || to >= paths.length) return;
    const next = [...paths];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateColumnEdit(column.id, "contextPaths", next);
  };

  const mapColumnToState = (column: {
    id: string;
    stage: string;
    displayName: string;
    color: string;
    order: number;
    enabled: boolean;
    autoTriggerJobs?: string[];
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
    id: column.stage as ProjectStage,
    configId: column.id,
    displayName: column.displayName,
    color: column.color,
    order: column.order,
    enabled: column.enabled,
    autoTriggerJobs: column.autoTriggerJobs,
    humanInLoop: column.humanInLoop,
    requiredDocuments: column.requiredDocuments,
    requiredApprovals: column.requiredApprovals,
    contextPaths: column.rules?.contextPaths,
    contextNotes: column.rules?.contextNotes,
    loopGroupId: column.rules?.loopGroupId,
    loopTargets: column.rules?.loopTargets,
    dependencyNotes: column.rules?.dependencyNotes,
  });

  const buildColumnPayload = (column: (typeof columns)[number], updates: Record<string, unknown>) => {
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

  const persistColumnUpdates = async (
    column: (typeof columns)[number],
    updates: Record<string, unknown>
  ) => {
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
    } catch (error) {
      console.error("Failed to update column:", error);
    }
  };

  const handleSaveColumn = async (column: (typeof columns)[number]) => {
    const updates = columnEdits[column.id];
    if (!updates) return;
    await persistColumnUpdates(column, updates);
  };

  const handleAddColumn = async () => {
    if (!workspace?.id || !newColumnStage.trim() || !newColumnName.trim()) return;
    try {
      const res = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
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
      }
      setNewColumnStage("");
      setNewColumnName("");
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };

  const handleSave = async () => {
    if (!workspace?.id) return;
    setIsSaving(true);
    try {
      const normalizedContextPaths = normalizePaths(contextPaths);
      const sanitizedMapping = Object.fromEntries(
        Object.entries(knowledgebaseMapping).filter(([, value]) => value)
      );
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubRepo: githubRepo.trim() || null,
          contextPath: normalizedContextPaths[0],
          settings: {
            prototypesPath: prototypesPath.trim() || undefined,
            storybookPort: storybookPort ? Number(storybookPort) : undefined,
            contextPaths: normalizedContextPaths,
            baseBranch: baseBranch.trim() || "main",
            autoCreateFeatureBranch,
            autoCommitJobs,
            cursorDeepLinkTemplate: cursorDeepLinkTemplate.trim() || undefined,
            aiExecutionMode,
            aiValidationMode,
            aiFallbackAfterMinutes: aiFallbackAfterMinutes
              ? Number(aiFallbackAfterMinutes)
              : undefined,
            knowledgebaseMapping: sanitizedMapping,
            automationMode,
            automationStopStage: automationStopStage || undefined,
            automationNotifyStage: automationNotifyStage || undefined,
            // Background Worker Settings
            workerEnabled,
            workerMaxConcurrency: workerMaxConcurrency
              ? Number(workerMaxConcurrency)
              : undefined,
            // Browser Notification Settings
            browserNotificationsEnabled,
            notifyOnJobComplete,
            notifyOnJobFailed,
            notifyOnApprovalRequired,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update workspace");
      const updated = await res.json();
      updateWorkspace({
        githubRepo: updated.githubRepo,
        contextPath: updated.contextPath,
        settings: updated.settings || {},
      });
    } catch (error) {
      console.error("Failed to save workspace settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] bg-card dark:bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)] max-w-[90vw] w-[1400px] !p-0 !gap-0 h-[90vh] overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={popInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-[85vh]"
            >
              {/* Header - macOS window style */}
              <DialogHeader className="flex-shrink-0 h-10 px-4 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/50 dark:bg-muted/20 flex flex-row items-center rounded-t-2xl">
                <div className="flex items-center gap-1.5 mr-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <DialogTitle className="text-sm font-mono text-muted-foreground">
                    workspace-settings
                  </DialogTitle>
                </div>
                <DialogDescription className="sr-only">
                  {workspace?.name || "Workspace"} configuration and stage pipeline
                </DialogDescription>
              </DialogHeader>

              {/* Content with Tabs */}
              <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-shrink-0 px-6 pt-4">
                  <TabsList className="bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)] rounded-xl grid w-full grid-cols-5">
                    <TabsTrigger value="general" className="gap-1.5 text-xs">
                      <Settings className="w-3.5 h-3.5" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="pipeline" className="gap-1.5 text-xs">
                      <Workflow className="w-3.5 h-3.5" />
                      Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="columns" className="gap-1.5 text-xs">
                      <Columns3 className="w-3.5 h-3.5" />
                      Columns
                    </TabsTrigger>
                    <TabsTrigger value="personas" className="gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      Personas
                    </TabsTrigger>
                    <TabsTrigger value="about" className="gap-1.5 text-xs">
                      <Info className="w-3.5 h-3.5" />
                      About
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-6 pt-4">
                    {/* General Tab - Basic workspace config */}
                    <TabsContent value="general" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <h4 className="text-sm font-medium mb-3">Repository Settings</h4>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="githubRepo">GitHub Repo Path</Label>
                              <Input
                                id="githubRepo"
                                placeholder="product-repos/ask-elephant"
                                value={githubRepo}
                                onChange={(e) => setGithubRepo(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="baseBranch">Base Branch</Label>
                              <Input
                                id="baseBranch"
                                placeholder="main"
                                value={baseBranch}
                                onChange={(e) => setBaseBranch(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="cursorDeepLinkTemplate">Cursor Deep Link Template</Label>
                              <Input
                                id="cursorDeepLinkTemplate"
                                placeholder="cursor://open?repo={repo}&branch={branch}"
                                value={cursorDeepLinkTemplate}
                                onChange={(e) => setCursorDeepLinkTemplate(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Supports {"{repo}"} and {"{branch}"} placeholders.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <h4 className="text-sm font-medium mb-3">Prototypes & Storybook</h4>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="prototypesPath">Prototypes Path</Label>
                              <Input
                                id="prototypesPath"
                                placeholder="src/components/prototypes/"
                                value={prototypesPath}
                                onChange={(e) => setPrototypesPath(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="storybookPort">Storybook Port</Label>
                              <Input
                                id="storybookPort"
                                type="number"
                                min="1"
                                max="65535"
                                value={storybookPort}
                                onChange={(e) => setStorybookPort(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)] lg:col-span-2">
                          <h4 className="text-sm font-medium mb-3">Context Paths</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            The first path is used as the default knowledge base root.
                          </p>
                          <div className="space-y-2">
                            {contextPaths.map((path, idx) => (
                              <div key={`context-path-${idx}`} className="flex items-center gap-2">
                                <Input
                                  placeholder="elmer-docs/"
                                  value={path}
                                  onChange={(e) => updateContextPath(idx, e.target.value)}
                                />
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveContextPath(idx, idx - 1)}
                                  disabled={idx === 0}
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => moveContextPath(idx, idx + 1)}
                                  disabled={idx === contextPaths.length - 1}
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeContextPath(idx)}
                                  disabled={contextPaths.length === 1}
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
                              onClick={addContextPath}
                            >
                              <Plus className="w-4 h-4" />
                              Add Context Path
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)] lg:col-span-2">
                          <h4 className="text-sm font-medium mb-3">Git Automation</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Auto-create feature branch</Label>
                                <p className="text-xs text-muted-foreground">
                                  Create a new branch when projects are added.
                                </p>
                              </div>
                              <Switch
                                checked={autoCreateFeatureBranch}
                                onCheckedChange={setAutoCreateFeatureBranch}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Auto-commit job output</Label>
                                <p className="text-xs text-muted-foreground">
                                  Commit and push files from automation jobs.
                                </p>
                              </div>
                              <Switch
                                checked={autoCommitJobs}
                                onCheckedChange={setAutoCommitJobs}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    {/* Pipeline Tab - Automation and AI settings */}
                    <TabsContent value="pipeline" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Bot className="w-4 h-4 text-purple-500" />
                            <h4 className="text-sm font-medium">AI Job Execution</h4>
                          </div>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="aiExecutionMode">Execution Mode</Label>
                              <select
                                id="aiExecutionMode"
                                value={aiExecutionMode}
                                onChange={(e) =>
                                  setAiExecutionMode(e.target.value as "cursor" | "server" | "hybrid")
                                }
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="cursor">Cursor runner</option>
                                <option value="server">Server runner</option>
                                <option value="hybrid">Hybrid (Cursor + fallback)</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="aiValidationMode">Validation Mode</Label>
                              <select
                                id="aiValidationMode"
                                value={aiValidationMode}
                                onChange={(e) =>
                                  setAiValidationMode(e.target.value as "none" | "light" | "schema")
                                }
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="schema">Schema (strict)</option>
                                <option value="light">Light</option>
                                <option value="none">None</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="aiFallbackAfterMinutes">Fallback After (minutes)</Label>
                              <Input
                                id="aiFallbackAfterMinutes"
                                type="number"
                                min="1"
                                value={aiFallbackAfterMinutes}
                                onChange={(e) => setAiFallbackAfterMinutes(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Workflow className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-sm font-medium">Automation Depth</h4>
                          </div>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="automationMode">Automation Mode</Label>
                              <select
                                id="automationMode"
                                value={automationMode}
                                onChange={(e) =>
                                  setAutomationMode(
                                    e.target.value as "manual" | "auto_to_stage" | "auto_all"
                                  )
                                }
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="manual">Manual</option>
                                <option value="auto_to_stage">Auto until stage</option>
                                <option value="auto_all">Auto all stages</option>
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="automationStopStage">Stop Stage</Label>
                              <select
                                id="automationStopStage"
                                value={automationStopStage}
                                onChange={(e) => setAutomationStopStage(e.target.value)}
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                                disabled={automationMode !== "auto_to_stage"}
                              >
                                <option value="">Select stage</option>
                                {columns
                                  .filter((column) => column.enabled)
                                  .sort((a, b) => a.order - b.order)
                                  .map((column) => (
                                    <option key={column.id} value={column.id}>
                                      {column.displayName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="automationNotifyStage">Notify At Stage</Label>
                              <select
                                id="automationNotifyStage"
                                value={automationNotifyStage}
                                onChange={(e) => setAutomationNotifyStage(e.target.value)}
                                className="h-9 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="">Always notify</option>
                                {columns
                                  .filter((column) => column.enabled)
                                  .sort((a, b) => a.order - b.order)
                                  .map((column) => (
                                    <option key={column.id} value={column.id}>
                                      {column.displayName}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)] lg:col-span-2">
                          <h4 className="text-sm font-medium mb-2">Knowledge Base Publishing</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Map document types to knowledge base sections. Leave as &quot;None&quot; to disable publish.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sortedDocumentTypes.map((docType) => (
                              <div key={docType} className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground w-24 flex-shrink-0">
                                  {documentTypeLabels[docType]}
                                </Label>
                                <select
                                  value={knowledgebaseMapping[docType] || ""}
                                  onChange={(e) =>
                                    setKnowledgebaseMapping((prev) => ({
                                      ...prev,
                                      [docType]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs"
                                >
                                  <option value="">None</option>
                                  {knowledgebaseOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Background Worker Settings */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <h4 className="text-sm font-medium">Background Worker</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Configure the background agent that automatically processes jobs.
                          </p>
                          <div className="grid gap-4">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Enable Auto-Execution</Label>
                                <p className="text-xs text-muted-foreground">
                                  Automatically process jobs when projects move stages.
                                </p>
                              </div>
                              <Switch
                                checked={workerEnabled}
                                onCheckedChange={setWorkerEnabled}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="workerMaxConcurrency">Max Concurrent Jobs</Label>
                              <Input
                                id="workerMaxConcurrency"
                                type="number"
                                min="1"
                                max="50"
                                value={workerMaxConcurrency}
                                onChange={(e) => setWorkerMaxConcurrency(e.target.value)}
                                disabled={!workerEnabled}
                              />
                              <p className="text-xs text-muted-foreground">
                                Maximum number of jobs to run simultaneously.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Browser Notification Settings */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                          <div className="flex items-center gap-2 mb-3">
                            <Bell className="w-4 h-4 text-blue-500" />
                            <h4 className="text-sm font-medium">Browser Notifications</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Configure when to receive browser notifications.
                          </p>
                          <div className="grid gap-3">
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Enable Notifications</Label>
                                <p className="text-xs text-muted-foreground">
                                  Show browser notifications for job events.
                                </p>
                              </div>
                              <Switch
                                checked={browserNotificationsEnabled}
                                onCheckedChange={setBrowserNotificationsEnabled}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Job Completed</Label>
                                <p className="text-xs text-muted-foreground">
                                  Notify when a job finishes successfully.
                                </p>
                              </div>
                              <Switch
                                checked={notifyOnJobComplete}
                                onCheckedChange={setNotifyOnJobComplete}
                                disabled={!browserNotificationsEnabled}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Job Failed</Label>
                                <p className="text-xs text-muted-foreground">
                                  Notify when a job fails or errors out.
                                </p>
                              </div>
                              <Switch
                                checked={notifyOnJobFailed}
                                onCheckedChange={setNotifyOnJobFailed}
                                disabled={!browserNotificationsEnabled}
                              />
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 p-3">
                              <div>
                                <Label className="text-sm">Approval Required</Label>
                                <p className="text-xs text-muted-foreground">
                                  Notify when human input is needed.
                                </p>
                              </div>
                              <Switch
                                checked={notifyOnApprovalRequired}
                                onCheckedChange={setNotifyOnApprovalRequired}
                                disabled={!browserNotificationsEnabled}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Columns Tab */}
                    <TabsContent value="columns" className="mt-0 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Manage which columns are visible in your Kanban board.
                        All stages are currently enabled.
                      </p>
                      
                      <div className="space-y-2 overflow-x-auto">
                        {columns.sort((a, b) => a.order - b.order).map((column) => {
                          const colorKey = String(getColumnEdit(column.id, "color", column.color || "slate"));
                          const colorConfig = stageColors[colorKey] || stageColors.slate;
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
                          return (
                            <div
                              key={column.id}
                              className="p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-700/30"
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("w-2.5 h-2.5 rounded-full", colorConfig.bg)} />
                                      <span className="text-sm font-medium">{column.id}</span>
                                    </div>
                                    <Input
                                      value={String(getColumnEdit(column.id, "displayName", column.displayName))}
                                      onChange={(e) => updateColumnEdit(column.id, "displayName", e.target.value)}
                                      className="h-8"
                                      placeholder="Display name"
                                    />
                                    <select
                                      value={colorKey}
                                      onChange={(e) => updateColumnEdit(column.id, "color", e.target.value)}
                                      className="h-8 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                      {colorOptions.map((key) => (
                                        <option key={key} value={key}>
                                          {key}
                                        </option>
                                      ))}
                                    </select>
                                    <Input
                                      value={String(
                                        getColumnEdit(
                                          column.id,
                                          "autoTriggerJobs",
                                          (column.autoTriggerJobs || []).join(", ")
                                        )
                                      )}
                                      onChange={(e) =>
                                        updateColumnEdit(
                                          column.id,
                                          "autoTriggerJobs",
                                          e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                                        )
                                      }
                                      className="h-8"
                                      placeholder="Auto jobs"
                                    />
                                    <Input
                                      value={String(
                                        getColumnEdit(
                                          column.id,
                                          "requiredDocuments",
                                          (column as { requiredDocuments?: string[] }).requiredDocuments?.join(", ") || ""
                                        )
                                      )}
                                      onChange={(e) =>
                                        updateColumnEdit(
                                          column.id,
                                          "requiredDocuments",
                                          e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                                        )
                                      }
                                      className="h-8"
                                      placeholder="Required docs"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
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
                                      className="h-8 w-20"
                                      type="number"
                                      min="0"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSaveColumn(column)}
                                    >
                                      Save
                                    </Button>
                                    <Label htmlFor={`col-${column.id}`} className="text-xs text-muted-foreground">
                                      {column.enabled ? "Visible" : "Hidden"}
                                    </Label>
                                    <Switch
                                      id={`col-${column.id}`}
                                      checked={column.enabled}
                                      onCheckedChange={(checked) => persistColumnUpdates(column, { enabled: checked })}
                                      className="data-[state=checked]:bg-purple-500"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Column Context Paths</Label>
                                    {contextPathsValue.map((path, idx) => (
                                      <div key={`${column.id}-context-${idx}`} className="flex items-center gap-2">
                                        <Input
                                          value={path}
                                          onChange={(e) => updateColumnContextPath(column, idx, e.target.value)}
                                          className="h-8"
                                          placeholder="elmer-docs/"
                                        />
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => moveColumnContextPath(column, idx, idx - 1)}
                                          disabled={idx === 0}
                                        >
                                          <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => moveColumnContextPath(column, idx, idx + 1)}
                                          disabled={idx === contextPathsValue.length - 1}
                                        >
                                          <ArrowDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => removeColumnContextPath(column, idx)}
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
                                      Add Context Path
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Context Notes</Label>
                                    <Textarea
                                      value={contextNotesValue}
                                      onChange={(e) => updateColumnEdit(column.id, "contextNotes", e.target.value)}
                                      className="min-h-[88px]"
                                      placeholder="Optional notes for this stage"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Iteration Loop Group</Label>
                                    <Input
                                      value={loopGroupIdValue}
                                      onChange={(e) =>
                                        updateColumnEdit(column.id, "loopGroupId", e.target.value.trim())
                                      }
                                      className="h-8"
                                      placeholder="e.g. discovery-prd-loop"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Loop Targets (stage ids)</Label>
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
                                      className="h-8"
                                      placeholder="e.g. discovery, prd"
                                    />
                                  </div>
                                  <div className="space-y-2 lg:col-span-2">
                                    <Label className="text-xs text-muted-foreground">Dependency Notes</Label>
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
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-700/30">
                        <p className="text-sm font-medium mb-2">Add Column</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <Input
                            placeholder="Stage id"
                            value={newColumnStage}
                            onChange={(e) => setNewColumnStage(e.target.value)}
                            className="h-8"
                          />
                          <Input
                            placeholder="Display name"
                            value={newColumnName}
                            onChange={(e) => setNewColumnName(e.target.value)}
                            className="h-8"
                          />
                            <select
                              value={newColumnColor}
                              onChange={(e) => setNewColumnColor(e.target.value)}
                              className="h-8 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                            {colorKeys.map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                          <Button size="sm" onClick={handleAddColumn}>
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground italic">
                        Visibility changes save immediately. Use Save to persist other edits.
                      </p>
                    </TabsContent>

                    {/* Personas Tab - Redirect to dedicated page */}
                    <TabsContent value="personas" className="mt-0 space-y-6">
                      <div className="p-6 rounded-2xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-muted border border-border dark:border-[rgba(255,255,255,0.08)]">
                            <Users className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold">Synthetic User Personas</h4>
                            <p className="text-sm text-muted-foreground">
                              Manage personas for jury validation
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">
                          Personas have moved to their own dedicated page with a file browser interface.
                          Create, edit, and organize your synthetic user personas with full markdown support.
                        </p>
                        <a href="/personas">
                          <Button className="gap-2">
                            <Users className="w-4 h-4" />
                            Open Personas Page
                          </Button>
                        </a>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <h4 className="text-sm font-medium mb-3">Jury Configuration</h4>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Minimum Jury Size</Label>
                            <Input type="number" min="1" max="10" defaultValue="3" className="w-32" />
                            <p className="text-xs text-muted-foreground">
                              Number of personas to include in each validation jury.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label>Approval Threshold</Label>
                            <Input type="number" min="50" max="100" defaultValue="70" className="w-32" />
                            <p className="text-xs text-muted-foreground">
                              Percentage of positive votes required to pass validation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* About Tab */}
                    <TabsContent value="about" className="mt-0 space-y-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <Label htmlFor="workspaceName" className="text-xs text-muted-foreground mb-2 block">Workspace Name</Label>
                        <Input
                          id="workspaceName"
                          value={workspace?.name || ""}
                          onChange={(e) => updateWorkspace({ name: e.target.value })}
                          onBlur={handleSave}
                          placeholder="Workspace name"
                          className="font-medium"
                        />
                      </div>
                      
                      <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <Label htmlFor="workspaceDescription" className="text-xs text-muted-foreground mb-2 block">Description</Label>
                        <Textarea
                          id="workspaceDescription"
                          value={workspace?.description || ""}
                          onChange={(e) => updateWorkspace({ description: e.target.value })}
                          onBlur={handleSave}
                          placeholder="Add a description for your workspace..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <p className="text-xs text-muted-foreground mb-1">Workspace ID</p>
                        <p className="text-sm font-mono text-xs">{workspace?.id || "N/A"}</p>
                      </div>
                      
                      <div className="p-4 rounded-2xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <p className="text-xs text-muted-foreground font-mono mb-1">// About Elmer</p>
                        <p className="text-sm text-muted-foreground">
                          Elmer is an AI-powered PM orchestrator that helps you move projects from idea to launch.
                          Drag projects through stages to trigger automated AI jobs that generate PRDs, design briefs, and more.
                        </p>
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
