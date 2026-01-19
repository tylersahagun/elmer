"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore, useKanbanStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/documents";
import type { DocumentType, KnowledgebaseType, ProjectStatus } from "@/lib/db/schema";
import {
  FileText,
  Layers,
  Clock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Play,
  Pause,
  Archive,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Users,
  Repeat,
  Plus,
  Copy,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AddDocumentDialog } from "./AddDocumentDialog";

// Stage color mapping
const stageColors: Record<string, { bg: string; text: string }> = {
  inbox: { bg: "bg-slate-100 dark:bg-slate-500/20", text: "text-slate-700 dark:text-slate-300" },
  discovery: { bg: "bg-teal-100 dark:bg-teal-500/20", text: "text-teal-700 dark:text-teal-300" },
  prd: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300" },
  design: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300" },
  prototype: { bg: "bg-pink-100 dark:bg-pink-500/20", text: "text-pink-700 dark:text-pink-300" },
  validate: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300" },
  tickets: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-300" },
  build: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-300" },
  alpha: { bg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-700 dark:text-cyan-300" },
  beta: { bg: "bg-indigo-100 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-300" },
  ga: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" },
};

const documentStageMap: Partial<Record<DocumentType, string>> = {
  research: "discovery",
  prd: "prd",
  design_brief: "design",
  prototype_notes: "prototype",
  jury_report: "validate",
  engineering_spec: "tickets",
  gtm_brief: "prd",
};

const knowledgebaseLabels: Record<KnowledgebaseType, string> = {
  company_context: "Company Context",
  strategic_guardrails: "Guardrails",
  personas: "Personas",
  roadmap: "Roadmap",
  rules: "Rules",
};

interface ProjectDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    generatedBy?: "user" | "ai";
    model?: string;
    reviewStatus?: "draft" | "reviewed" | "approved";
  };
}

interface ProjectDetails {
  id: string;
  name: string;
  description?: string;
  stage: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    gitBranch?: string;
    stageConfidence?: Record<string, { score: number; summary?: string }>;
  };
  documents: ProjectDocument[];
  prototypes: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    version: number;
    storybookPath?: string;
    chromaticUrl?: string;
  }>;
  tickets: Array<{
    id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: number;
    estimatedPoints?: number;
  }>;
  stages: Array<{
    id: string;
    stage: string;
    enteredAt: string;
    exitedAt?: string;
    triggeredBy?: string;
  }>;
  juryEvaluations: Array<{
    id: string;
    phase: string;
    verdict?: string;
    approvalRate?: number;
    conditionalRate?: number;
    rejectionRate?: number;
    topConcerns?: string[];
    topSuggestions?: string[];
    createdAt: string;
  }>;
  workspace?: {
    settings?: {
      storybookPort?: number;
      knowledgebaseMapping?: Record<DocumentType, KnowledgebaseType>;
    };
  };
}

export function ProjectDetailModal() {
  const isOpen = useUIStore((s) => s.projectDetailModalOpen);
  const closeModal = useUIStore((s) => s.closeProjectDetailModal);
  const activeProjectId = useKanbanStore((s) => s.activeProjectId);
  const updateProject = useKanbanStore((s) => s.updateProject);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [iterationCount, setIterationCount] = useState(3);
  const [isRunningIterations, setIsRunningIterations] = useState(false);
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: project, isLoading, error, refetch } = useQuery<ProjectDetails>({
    queryKey: ["project", activeProjectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${activeProjectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!activeProjectId && isOpen,
  });

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("overview");
      setSelectedDocument(null);
    }
  }, [isOpen]);

  const handleStatusChange = async (newStatus: string) => {
    if (!activeProjectId) return;
    
    try {
      await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (newStatus === "archived") {
        closeModal();
      } else {
        refetch();
      }
      
      updateProject(activeProjectId, { status: newStatus as ProjectStatus });
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  };

  const handleScoreAlignment = async () => {
    if (!activeProjectId || !project) return;
    
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: project.workspace?.settings ? undefined : undefined,
          projectId: activeProjectId,
          type: "score_alignment",
          input: { stage: project.stage },
        }),
      });
      
      refetch();
    } catch (error) {
      console.error("Failed to score alignment:", error);
    }
  };

  const handleCopyBranch = () => {
    if (project?.metadata?.gitBranch) {
      navigator.clipboard.writeText(project.metadata.gitBranch);
    }
  };

  const handleSaveDocument = useCallback(async (docId: string, content: string) => {
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      refetch();
    } catch (error) {
      console.error("Failed to save document:", error);
    }
  }, [refetch]);

  const handleRegenerateDocument = useCallback(async (docId: string) => {
    if (!activeProjectId) return;
    
    const doc = project?.documents.find(d => d.id === docId);
    if (!doc) return;

    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          type: "regenerate_document",
          input: { documentId: docId, documentType: doc.type },
        }),
      });
      refetch();
    } catch (error) {
      console.error("Failed to regenerate document:", error);
    }
  }, [activeProjectId, project, refetch]);

  const handlePublishDocument = useCallback(async (docId: string) => {
    if (!activeProjectId || !project) return;
    
    const doc = project.documents.find(d => d.id === docId);
    if (!doc) return;

    const targetKnowledgebase = project.workspace?.settings?.knowledgebaseMapping?.[doc.type];
    if (!targetKnowledgebase) return;

    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          type: "publish_to_knowledgebase",
          input: { 
            documentId: docId, 
            knowledgebaseType: targetKnowledgebase 
          },
        }),
      });
      refetch();
    } catch (error) {
      console.error("Failed to publish document:", error);
    }
  }, [activeProjectId, project, refetch]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDocType = (type: string) => {
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const handleRunIterations = async () => {
    if (!activeProjectId || !project) return;
    
    const workspaceId = project.workspace?.settings ? undefined : undefined;
    
    setIsRunningIterations(true);
    
    try {
      for (let i = 0; i < iterationCount; i++) {
        await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            projectId: activeProjectId,
            type: "run_jury_evaluation",
            input: {
              iteration: i + 1,
              totalIterations: iterationCount,
              phase: project.stage === "prototype" ? "prototype" : "prd",
            },
          }),
        });
      }
      
      updateProject(activeProjectId, {
        activeJobType: "run_jury_evaluation",
        activeJobProgress: 0,
        activeJobStatus: "pending",
        isLocked: true,
      });
      
      await fetch("/api/jobs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      
      refetch();
    } catch (error) {
      console.error("Failed to start iterations:", error);
    } finally {
      setIsRunningIterations(false);
    }
  };

  const stageColor = project ? stageColors[project.stage] || stageColors.inbox : stageColors.inbox;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent 
        showCloseButton={false}
        className="rounded-2xl border border-border dark:border-[rgba(255,255,255,0.14)] bg-card dark:bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)] max-w-[90vw] w-[1200px] !p-0 !gap-0 h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-[85vh]">
              {/* Header - macOS window style */}
              <DialogHeader className="flex-shrink-0 h-10 px-4 border-b border-border dark:border-[rgba(255,255,255,0.14)] bg-muted/50 dark:bg-muted/20 flex flex-row items-center rounded-t-2xl">
                <div className="flex items-center gap-1.5 mr-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-mono">Failed to load</span>
                  </div>
                ) : project ? (
                  <div className="flex items-center gap-2">
                    <Layers className={cn("w-4 h-4", stageColor.text)} />
                    <DialogTitle className="text-sm font-mono text-muted-foreground">
                      {project.name}
                    </DialogTitle>
                    <Badge className={cn("text-xs h-5", stageColor.bg, stageColor.text)}>
                      {project.stage}
                    </Badge>
                  </div>
                ) : null}
                <DialogDescription className="sr-only">
                  {project?.name || "Project"} details and management
                </DialogDescription>
              </DialogHeader>

              {/* Content with Tabs */}
              {project && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="flex-shrink-0 px-6 pt-4">
                    <TabsList className="bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)] rounded-xl grid w-full grid-cols-6">
                      <TabsTrigger value="overview" className="gap-1.5 text-xs">
                        <Info className="w-3.5 h-3.5" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="gap-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        Documents
                        {project.documents.length > 0 && (
                          <span className="ml-1 text-[10px] bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 rounded-full">
                            {project.documents.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="prototypes" className="gap-1.5 text-xs">
                        <Layers className="w-3.5 h-3.5" />
                        Prototypes
                        {project.prototypes.length > 0 && (
                          <span className="ml-1 text-[10px] bg-pink-500/20 text-pink-600 dark:text-pink-400 px-1.5 rounded-full">
                            {project.prototypes.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="tickets" className="gap-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        Tickets
                        {project.tickets.length > 0 && (
                          <span className="ml-1 text-[10px] bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 rounded-full">
                            {project.tickets.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="validation" className="gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5" />
                        Validation
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-1.5 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        History
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6 pt-4">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-6">
                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-6">
                            {/* Project Actions Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <h4 className="text-sm font-medium mb-3">Project Actions</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                                  className="gap-1.5"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Open Full Page
                                </Button>
                                {project.status === "active" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange("paused")}
                                    className="gap-1.5"
                                  >
                                    <Pause className="w-3.5 h-3.5" />
                                    Pause
                                  </Button>
                                ) : project.status === "paused" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange("active")}
                                    className="gap-1.5"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                    Resume
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusChange("archived")}
                                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  Archive
                                </Button>
                              </div>
                            </div>

                            {/* Alignment Score Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <h4 className="text-sm font-medium mb-3">Alignment Score</h4>
                              {project.metadata?.stageConfidence?.[project.stage] ? (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-2xl font-heading">
                                      {Math.round(project.metadata.stageConfidence[project.stage].score * 100)}%
                                    </p>
                                    <Button size="sm" variant="outline" onClick={handleScoreAlignment}>
                                      Re-score
                                    </Button>
                                  </div>
                                  <Progress 
                                    value={Math.round(project.metadata.stageConfidence[project.stage].score * 100)}
                                    className="h-2 bg-muted [&>div]:bg-linear-to-r [&>div]:from-emerald-400 [&>div]:via-purple-400 [&>div]:to-pink-400"
                                  />
                                  {project.metadata.stageConfidence[project.stage].summary && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {project.metadata.stageConfidence[project.stage].summary}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-muted-foreground">No score yet for this stage</p>
                                  <Button size="sm" variant="outline" onClick={handleScoreAlignment}>
                                    Score Now
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Timestamps Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                                  <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                                  <p className="text-sm font-medium">{formatDate(project.updatedAt)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Git Branch Card */}
                            {project.metadata?.gitBranch && (
                              <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                                <h4 className="text-sm font-medium mb-3">Git Branch</h4>
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={project.metadata.gitBranch}
                                    readOnly
                                    className="h-9"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={handleCopyBranch}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-6">
                            {/* Stage Progress Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <h4 className="text-sm font-medium mb-3">Stage Progress</h4>
                              <div className="flex items-center gap-1 flex-wrap">
                                {project.stages.slice().reverse().map((stage, idx) => (
                                  <div key={stage.id} className="flex items-center">
                                    <Badge 
                                      className={cn(
                                        "text-xs",
                                        stageColors[stage.stage]?.bg || "bg-slate-100",
                                        stageColors[stage.stage]?.text || "text-slate-700"
                                      )}
                                    >
                                      {stage.stage}
                                    </Badge>
                                    {idx < project.stages.length - 1 && (
                                      <ArrowRight className="w-3 h-3 mx-1 text-muted-foreground" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              {project.stages.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Current stage: <span className="font-medium capitalize">{project.stage}</span>
                                  {project.stages[0]?.enteredAt && (
                                    <> · Started {formatDate(project.stages[0].enteredAt)}</>
                                  )}
                                </p>
                              )}
                            </div>

                            {/* Quick Stats Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
                              <div className="grid grid-cols-3 gap-3">
                                <button 
                                  onClick={() => setActiveTab("documents")}
                                  className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                                >
                                  <p className="text-2xl font-heading text-purple-600 dark:text-purple-400">
                                    {project.documents.length}
                                  </p>
                                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Documents</p>
                                </button>
                                <button 
                                  onClick={() => setActiveTab("prototypes")}
                                  className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-center hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer"
                                >
                                  <p className="text-2xl font-heading text-pink-600 dark:text-pink-400">
                                    {project.prototypes.length}
                                  </p>
                                  <p className="text-xs text-pink-600/70 dark:text-pink-400/70">Prototypes</p>
                                </button>
                                <button 
                                  onClick={() => setActiveTab("history")}
                                  className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-center hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors cursor-pointer"
                                >
                                  <p className="text-2xl font-heading text-teal-600 dark:text-teal-400">
                                    {project.stages.length}
                                  </p>
                                  <p className="text-xs text-teal-600/70 dark:text-teal-400/70">Stage Changes</p>
                                </button>
                              </div>
                            </div>

                            {/* Jury Iteration Loop Card */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                  <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">Jury Iteration Loop</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Run synthetic user jury evaluations to validate and iterate.
                                  </p>
                                  
                                  <div className="flex items-end gap-3 mt-4">
                                    <div className="flex-1 max-w-[120px]">
                                      <Label htmlFor="iterations" className="text-xs text-muted-foreground">
                                        Iterations
                                      </Label>
                                      <Input
                                        id="iterations"
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={iterationCount}
                                        onChange={(e) => setIterationCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="h-9"
                                      />
                                    </div>
                                    <Button
                                      onClick={handleRunIterations}
                                      disabled={isRunningIterations || project.documents.length === 0}
                                      className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                      {isRunningIterations ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Starting...
                                        </>
                                      ) : (
                                        <>
                                          <Repeat className="w-4 h-4" />
                                          Run {iterationCount}
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  
                                  {project.documents.length === 0 && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                      Generate documents first before running jury evaluations.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Full Width - Next Actions (if no documents) */}
                        {project.documents.length === 0 && (
                          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">
                                Suggested Next Step
                              </h4>
                            </div>
                            <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
                              Add research documents or transcripts to get started. Click the Documents tab to add your first document.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveTab("documents");
                                setAddDocumentDialogOpen(true);
                              }}
                              className="mt-3 gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:text-blue-300"
                            >
                              <Plus className="w-4 h-4" />
                              Add Document
                            </Button>
                          </div>
                        )}

                        {/* Full Width - Project Summary (if has documents) */}
                        {project.documents.length > 0 && (
                          <div className="p-4 rounded-xl bg-linear-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100">
                                Project Summary
                              </h4>
                            </div>
                            <p className="text-sm text-purple-800/80 dark:text-purple-200/80 line-clamp-3">
                              {project.documents[0]?.content?.slice(0, 300) || "No content available yet."}
                              {(project.documents[0]?.content?.length || 0) > 300 && "..."}
                            </p>
                            {project.documents.length > 1 && (
                              <p className="text-xs text-purple-600/60 dark:text-purple-400/60 mt-2">
                                + {project.documents.length - 1} more document{project.documents.length > 2 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        )}
                      </TabsContent>

                      {/* Documents Tab */}
                      <TabsContent value="documents" className="mt-0">
                        <AnimatePresence mode="wait">
                          {selectedDocument ? (
                            <motion.div
                              key="viewer"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="h-[60vh]"
                            >
                              <div className="mb-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedDocument(null)}
                                  className="gap-1.5"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                  Back to Documents
                                </Button>
                              </div>
                              
                              <div className="h-[calc(100%-48px)] rounded-xl border border-border dark:border-[rgba(255,255,255,0.08)] overflow-hidden bg-muted/30">
                                <DocumentViewer
                                  document={{
                                    ...selectedDocument,
                                    createdAt: new Date(selectedDocument.createdAt),
                                    updatedAt: new Date(selectedDocument.updatedAt),
                                  }}
                                  onSave={(content) => handleSaveDocument(selectedDocument.id, content)}
                                  onRegenerate={() => handleRegenerateDocument(selectedDocument.id)}
                                  onPublish={() => handlePublishDocument(selectedDocument.id)}
                                  publishLabel={
                                    project?.workspace?.settings?.knowledgebaseMapping?.[selectedDocument.type]
                                      ? `Publish to ${
                                          knowledgebaseLabels[
                                            project.workspace.settings
                                              .knowledgebaseMapping[selectedDocument.type] as KnowledgebaseType
                                          ] ||
                                          project.workspace.settings.knowledgebaseMapping[selectedDocument.type]
                                        }`
                                      : "Publish"
                                  }
                                  publishDisabled={
                                    !project?.workspace?.settings?.knowledgebaseMapping?.[selectedDocument.type]
                                  }
                                />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="list"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="space-y-3"
                            >
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAddDocumentDialogOpen(true)}
                                  className="gap-1.5"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Document
                                </Button>
                              </div>
                              
                              {project.documents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                  <p className="text-sm">No documents yet</p>
                                  <p className="text-xs mt-1 mb-4">Add research notes, transcripts, or other documentation</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAddDocumentDialogOpen(true)}
                                    className="gap-1.5"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Your First Document
                                  </Button>
                                </div>
                              ) : (
                                project.documents.map((doc) => (
                                  <motion.button
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedDocument(doc)}
                                    className="w-full text-left p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)] hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm">{doc.title}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted-foreground">
                                              {formatDocType(doc.type)} · v{doc.version}
                                            </span>
                                            {doc.metadata?.generatedBy === "ai" && (
                                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                <Sparkles className="w-2.5 h-2.5 mr-1" />
                                                AI
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(doc.createdAt)}
                                      </span>
                                    </div>
                                    {doc.content && (
                                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                        {doc.content.slice(0, 150)}...
                                      </p>
                                    )}
                                  </motion.button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TabsContent>

                      {/* Prototypes Tab */}
                      <TabsContent value="prototypes" className="mt-0 space-y-3">
                        {project.prototypes.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                            <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No prototypes yet</p>
                            <p className="text-xs mt-1">Prototypes will appear when built in the Prototype stage</p>
                          </div>
                        ) : (
                          project.prototypes.map((proto) => (
                            <motion.div
                              key={proto.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                    <Layers className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{proto.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {proto.type} · v{proto.version}
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  className={cn(
                                    "text-xs",
                                    proto.status === "ready" 
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : proto.status === "building"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  )}
                                >
                                  {proto.status}
                                </Badge>
                              </div>
                              
                              {(proto.storybookPath || proto.chromaticUrl) && (
                                <div className="mt-3 flex items-center gap-2">
                                  {proto.storybookPath && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      asChild
                                    >
                                      <a
                                        href={`http://localhost:${project.workspace?.settings?.storybookPort || 6006}/?path=/story/${proto.storybookPath}`}
                                        target="_blank"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Storybook
                                      </a>
                                    </Button>
                                  )}
                                  {proto.chromaticUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs"
                                      asChild
                                    >
                                      <a href={proto.chromaticUrl} target="_blank">
                                        <ExternalLink className="w-3 h-3" />
                                        Chromatic
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </TabsContent>

                      {/* Tickets Tab */}
                      <TabsContent value="tickets" className="mt-0 space-y-3">
                        {project.tickets.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No tickets generated yet</p>
                            <p className="text-xs mt-1">Move the project to Tickets stage to generate them</p>
                          </div>
                        ) : (
                          project.tickets.map((ticket) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm">{ticket.title}</p>
                                  {ticket.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {ticket.description}
                                    </p>
                                  )}
                                </div>
                                {ticket.estimatedPoints && (
                                  <Badge variant="outline" className="text-xs">
                                    {ticket.estimatedPoints} pts
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {ticket.status && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {ticket.status}
                                  </Badge>
                                )}
                                {ticket.priority !== undefined && (
                                  <Badge variant="outline" className="text-xs">
                                    Priority {ticket.priority}
                                  </Badge>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </TabsContent>

                      {/* Validation Tab */}
                      <TabsContent value="validation" className="mt-0 space-y-4">
                        {project.juryEvaluations.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No validation results yet</p>
                            <p className="text-xs mt-1">Run a jury evaluation to see results</p>
                          </div>
                        ) : (
                          project.juryEvaluations.map((evaluation) => (
                            <motion.div
                              key={evaluation.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className="capitalize">{evaluation.phase}</Badge>
                                  {evaluation.verdict && (
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        evaluation.verdict === "pass" && "border-green-500/50 text-green-400",
                                        evaluation.verdict === "fail" && "border-red-500/50 text-red-400",
                                        evaluation.verdict === "conditional" && "border-amber-500/50 text-amber-400"
                                      )}
                                    >
                                      {evaluation.verdict}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(evaluation.createdAt)}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Approval</p>
                                  <p className="font-medium">
                                    {Math.round((evaluation.approvalRate || 0) * 100)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Conditional</p>
                                  <p className="font-medium">
                                    {Math.round((evaluation.conditionalRate || 0) * 100)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Rejection</p>
                                  <p className="font-medium">
                                    {Math.round((evaluation.rejectionRate || 0) * 100)}%
                                  </p>
                                </div>
                              </div>
                              {(evaluation.topConcerns?.length || evaluation.topSuggestions?.length) && (
                                <div className="mt-3 text-xs text-muted-foreground">
                                  {evaluation.topConcerns?.length ? (
                                    <p>Top concerns: {evaluation.topConcerns.join(", ")}</p>
                                  ) : null}
                                  {evaluation.topSuggestions?.length ? (
                                    <p>Top suggestions: {evaluation.topSuggestions.join(", ")}</p>
                                  ) : null}
                                </div>
                              )}
                            </motion.div>
                          ))
                        )}
                      </TabsContent>

                      {/* History Tab */}
                      <TabsContent value="history" className="mt-0">
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                          
                          <div className="space-y-4">
                            {project.stages.map((stage, idx) => {
                              const color = stageColors[stage.stage] || stageColors.inbox;
                              return (
                                <motion.div
                                  key={stage.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="relative pl-10"
                                >
                                  <div className={cn(
                                    "absolute left-2 w-5 h-5 rounded-full border-2 border-card",
                                    color.bg
                                  )} />
                                  
                                  <div className="p-3 rounded-lg bg-muted/30 border border-border dark:border-[rgba(255,255,255,0.08)]">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Badge className={cn("text-xs", color.bg, color.text)}>
                                          {stage.stage}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {stage.triggeredBy === "user" ? "Manual" : stage.triggeredBy || "System"}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(stage.enteredAt)}
                                      </span>
                                    </div>
                                    {stage.exitedAt && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Duration: {Math.round((new Date(stage.exitedAt).getTime() - new Date(stage.enteredAt).getTime()) / (1000 * 60 * 60))}h
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>
              )}
        </div>
      </DialogContent>
      
      {/* Add Document Dialog */}
      {activeProjectId && (
        <AddDocumentDialog
          open={addDocumentDialogOpen}
          onOpenChange={setAddDocumentDialogOpen}
          projectId={activeProjectId}
          onDocumentAdded={() => {
            refetch();
            setActiveTab("documents");
          }}
        />
      )}
    </Dialog>
  );
}
