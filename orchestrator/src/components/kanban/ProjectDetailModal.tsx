"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
import { popInVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/documents";
import { buildCursorDeepLink } from "@/lib/cursor/links";
import type { DocumentType, KnowledgebaseType } from "@/lib/db/schema";
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
} from "lucide-react";
import { WaveV4D } from "@/components/brand/ElmerLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  workspaceId: string;
  metadata?: {
    gitBranch?: string;
    baseBranch?: string;
    stageConfidence?: Record<
      string,
      {
        score: number;
        summary?: string;
        strengths?: string[];
        gaps?: string[];
        updatedAt: string;
      }
    >;
  };
  workspace?: {
    id: string;
    name: string;
    githubRepo?: string | null;
    settings?: {
      storybookPort?: number;
      cursorDeepLinkTemplate?: string;
      knowledgebaseMapping?: Partial<Record<DocumentType, KnowledgebaseType>>;
    };
  };
  documents: ProjectDocument[];
  prototypes: Array<{
    id: string;
    type: string;
    name: string;
    storybookPath?: string;
    chromaticUrl?: string;
    status: string;
    version: number;
    createdAt: string;
  }>;
  stages: Array<{
    id: string;
    stage: string;
    enteredAt: string;
    exitedAt?: string;
    triggeredBy?: string;
  }>;
  tickets: Array<{
    id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: number;
    estimatedPoints?: number;
  }>;
  juryEvaluations: Array<{
    id: string;
    phase: "research" | "prd" | "prototype";
    approvalRate: number | null;
    conditionalRate: number | null;
    rejectionRate: number | null;
    verdict: "pass" | "fail" | "conditional" | null;
    topConcerns?: string[] | null;
    topSuggestions?: string[] | null;
    createdAt: string;
  }>;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDocType(type: string): string {
  const typeMap: Record<string, string> = {
    research: "Research",
    prd: "PRD",
    design_brief: "Design Brief",
    engineering_spec: "Engineering Spec",
    gtm_brief: "GTM Brief",
    prototype_notes: "Prototype Notes",
    jury_report: "Jury Report",
  };
  return typeMap[type] || type;
}

export function ProjectDetailModal() {
  const isOpen = useUIStore((s) => s.projectDetailModalOpen);
  const closeModal = useUIStore((s) => s.closeProjectDetailModal);
  const activeProjectId = useKanbanStore((s) => s.activeProjectId);
  const updateProject = useKanbanStore((s) => s.updateProject);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDocument, setSelectedDocument] = useState<ProjectDocument | null>(null);
  const [iterationCount, setIterationCount] = useState(5);
  const [isRunningIterations, setIsRunningIterations] = useState(false);
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);

  // Fetch project details
  const { data: project, isLoading, error, refetch } = useQuery<ProjectDetails>({
    queryKey: ["project", activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) throw new Error("No project selected");
      const res = await fetch(`/api/projects/${activeProjectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: isOpen && !!activeProjectId,
  });

  // Reset tab and selected document when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
      setSelectedDocument(null);
    }
  }, [isOpen]);

  // Document save mutation
  const saveDocumentMutation = useMutation({
    mutationFn: async ({ docId, content }: { docId: string; content: string }) => {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save document");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", activeProjectId] });
    },
  });

  const publishDocumentMutation = useMutation({
    mutationFn: async ({
      workspaceId,
      targetType,
      title,
      content,
    }: {
      workspaceId: string;
      targetType: KnowledgebaseType;
      title: string;
      content: string;
    }) => {
      const res = await fetch(`/api/knowledgebase/${targetType}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, title, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to publish to knowledge base");
      }
      return res.json();
    },
  });

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!selectedDocument || !project) return;
    await saveDocumentMutation.mutateAsync({ docId: selectedDocument.id, content });
    // Update local state
    setSelectedDocument((prev) => (prev ? { ...prev, content } : null));

    const workspaceId = project.workspaceId || project.workspace?.id;
    if (!workspaceId) return;
    const stageForScoring = documentStageMap[selectedDocument.type] || project.stage;

    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        projectId: activeProjectId,
        type: "score_stage_alignment",
        input: { stage: stageForScoring },
      }),
    });
    await fetch("/api/jobs/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
  }, [selectedDocument, project, activeProjectId, saveDocumentMutation]);

  const handlePublishDocument = useCallback(async () => {
    if (!selectedDocument || !project) return;
    const mapping = project.workspace?.settings?.knowledgebaseMapping as
      | Partial<Record<DocumentType, KnowledgebaseType>>
      | undefined;
    const targetType = mapping?.[selectedDocument.type];
    if (!targetType) return;
    await publishDocumentMutation.mutateAsync({
      workspaceId: project.workspaceId,
      targetType,
      title: selectedDocument.title,
      content: selectedDocument.content,
    });
  }, [selectedDocument, project, publishDocumentMutation]);

  const handleCopyBranch = useCallback(() => {
    const branch = project?.metadata?.gitBranch;
    if (!branch) return;
    navigator.clipboard?.writeText(branch).catch(() => {});
  }, [project]);

  const cursorLink = buildCursorDeepLink({
    template: project?.workspace?.settings?.cursorDeepLinkTemplate,
    repo: project?.workspace?.githubRepo,
    branch: project?.metadata?.gitBranch,
  });

  const handleRegenerateDocument = useCallback(async () => {
    if (!selectedDocument || !activeProjectId || !project) return;
    // Trigger regeneration job based on document type
    const jobTypeMap: Record<DocumentType, string> = {
      research: "analyze_transcript",
      prd: "generate_prd",
      design_brief: "generate_design_brief",
      engineering_spec: "generate_engineering_spec",
      gtm_brief: "generate_gtm_brief",
      prototype_notes: "build_prototype",
      jury_report: "run_jury_evaluation",
    };
    
    const jobType = jobTypeMap[selectedDocument.type];
    if (!jobType) return;

    const workspaceId = project.workspaceId || project.workspace?.id;
    if (!workspaceId) return;

    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        projectId: activeProjectId,
        type: jobType,
      }),
    });
    
    // Trigger processing
    await fetch("/api/jobs/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
  }, [selectedDocument, activeProjectId, project]);

  const handleScoreAlignment = useCallback(async () => {
    if (!activeProjectId || !project) return;
    const workspaceId = project.workspaceId || project.workspace?.id;
    if (!workspaceId) return;
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        projectId: activeProjectId,
        type: "score_stage_alignment",
        input: { stage: project.stage },
      }),
    });
    await fetch("/api/jobs/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
  }, [activeProjectId, project]);

  const handleStatusChange = async (newStatus: "active" | "paused" | "archived") => {
    if (!activeProjectId) return;
    
    try {
      const res = await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        updateProject(activeProjectId, { status: newStatus });
        if (newStatus === "archived") {
          closeModal();
          return;
        }
        refetch();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Run N iterations with jury evaluation
  const handleRunIterations = async () => {
    if (!activeProjectId || !project) return;
    
    const workspaceId = project.workspaceId || project.workspace?.id;
    if (!workspaceId) return;

    setIsRunningIterations(true);
    
    try {
      // Queue jury evaluation jobs for each iteration
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
      
      // Update project to show iterations are running
      updateProject(activeProjectId, {
        activeJobType: "run_jury_evaluation",
        activeJobProgress: 0,
        activeJobStatus: "pending",
        isLocked: true,
      });
      
      // Trigger processing
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
      <DialogContent className="glass-panel border-white/20 w-[95vw] max-w-3xl p-0! gap-0! max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={popInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <DialogHeader className="shrink-0 p-4 sm:p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="text-muted-foreground">Loading project...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span>Failed to load project</span>
                  </div>
                ) : project ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <WaveV4D size={40} palette="forest" />
                        <div>
                          <DialogTitle className="text-xl">{project.name}</DialogTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={cn("text-xs", stageColor.bg, stageColor.text)}>
                              {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
                            </Badge>
                            <Badge variant={project.status === "active" ? "default" : "secondary"} className="text-xs">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (cursorLink) {
                              window.location.href = cursorLink;
                            }
                          }}
                          disabled={!cursorLink}
                          className="h-9 w-9"
                        >
                          <Image
                            src="/cursor/cursor-cube-light.svg"
                            alt=""
                            width={16}
                            height={16}
                            className="w-4 h-4 dark:invert"
                          />
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
                    
                    {project.description && (
                      <DialogDescription className="mt-3">
                        {project.description}
                      </DialogDescription>
                    )}
                  </>
                ) : null}
              </DialogHeader>

              {/* Content with Tabs */}
              {project && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="shrink-0 px-4 sm:px-6 pt-4 overflow-x-auto">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 w-max sm:w-auto">
                      <TabsTrigger value="overview" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Overview</span>
                        <span className="sm:hidden">Info</span>
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Documents</span>
                        <span className="sm:hidden">Docs</span>
                        {project.documents.length > 0 && (
                          <span className="ml-1 text-[10px] sm:text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1 sm:px-1.5 rounded-full">
                            {project.documents.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="prototypes" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Prototypes</span>
                        <span className="sm:hidden">Proto</span>
                        {project.prototypes.length > 0 && (
                          <span className="ml-1 text-[10px] sm:text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-1 sm:px-1.5 rounded-full">
                            {project.prototypes.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        History
                      </TabsTrigger>
                      <TabsTrigger value="tickets" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Tickets
                        {project.tickets.length > 0 && (
                          <span className="ml-1 text-[10px] sm:text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1 sm:px-1.5 rounded-full">
                            {project.tickets.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="validation" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">Validation</span>
                        <span className="sm:hidden">Valid</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-4 sm:p-6 pt-4">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-4">
                        {project.metadata?.stageConfidence?.[project.stage] ? (
                          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
                                  Alignment Score
                                </p>
                                <p className="text-sm font-medium text-emerald-800/90 dark:text-emerald-200/90">
                                  {Math.round(
                                    project.metadata.stageConfidence[project.stage].score * 100
                                  )}
                                  %
                                </p>
                              </div>
                              <Button size="sm" variant="outline" onClick={handleScoreAlignment}>
                                Re-score
                              </Button>
                            </div>
                            <div className="h-2 rounded-full bg-emerald-200/60 dark:bg-emerald-800/40 overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-emerald-400 via-purple-400 to-pink-400"
                                style={{
                                  width: `${Math.round(
                                    project.metadata.stageConfidence[project.stage].score * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            {project.metadata.stageConfidence[project.stage].summary && (
                              <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 mt-2">
                                {project.metadata.stageConfidence[project.stage].summary}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Alignment Score</p>
                              <p className="text-sm">No score yet for this stage</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={handleScoreAlignment}>
                              Score Now
                            </Button>
                          </div>
                        )}
                        {/* Summary Section */}
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

                        {/* Time & Status Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <p className="text-xs text-muted-foreground mb-1">Created</p>
                            <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                            <p className="text-sm font-medium">{formatDate(project.updatedAt)}</p>
                          </div>
                        </div>

                        {project.metadata?.gitBranch && (
                          <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <p className="text-xs text-muted-foreground mb-2">Git Branch</p>
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

                        {/* Stage Progress */}
                        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                          <p className="text-xs text-muted-foreground mb-2">Stage Progress</p>
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          <button 
                            onClick={() => setActiveTab("documents")}
                            className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer"
                          >
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {project.documents.length}
                            </p>
                            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Documents</p>
                          </button>
                          <button 
                            onClick={() => setActiveTab("prototypes")}
                            className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-center hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors cursor-pointer"
                          >
                            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                              {project.prototypes.length}
                            </p>
                            <p className="text-xs text-pink-600/70 dark:text-pink-400/70">Prototypes</p>
                          </button>
                          <button 
                            onClick={() => setActiveTab("history")}
                            className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-center hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors cursor-pointer"
                          >
                            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                              {project.stages.length}
                            </p>
                            <p className="text-xs text-teal-600/70 dark:text-teal-400/70">Stage Changes</p>
                          </button>
                        </div>
                        
                        {/* Next Actions Suggestion */}
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

                        {/* Iteration Loop Section */}
                        <div className="p-4 rounded-xl bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-500/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100">
                                Jury Iteration Loop
                              </h4>
                              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                                Run synthetic user jury evaluations to validate and iterate on your work.
                                Each iteration generates feedback that Cursor AI can use to improve the content.
                              </p>
                              
                              <div className="flex items-end gap-3 mt-4">
                                <div className="flex-1 max-w-[120px]">
                                  <Label htmlFor="iterations" className="text-xs text-amber-700 dark:text-amber-300">
                                    Iterations
                                  </Label>
                                  <Input
                                    id="iterations"
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={iterationCount}
                                    onChange={(e) => setIterationCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="h-9 bg-white/50 dark:bg-slate-800/50 border-amber-200 dark:border-amber-500/30"
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
                                      Run {iterationCount} Iteration{iterationCount !== 1 ? "s" : ""}
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
                              className="h-[60vh] sm:h-[500px]"
                            >
                              {/* Back button */}
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
                              
                              {/* Document Viewer */}
                              <div className="h-[calc(100%-48px)] rounded-xl border border-white/10 overflow-hidden bg-black/20">
                                <DocumentViewer
                                  document={{
                                    ...selectedDocument,
                                    createdAt: new Date(selectedDocument.createdAt),
                                    updatedAt: new Date(selectedDocument.updatedAt),
                                  }}
                                  onSave={handleSaveDocument}
                                  onRegenerate={handleRegenerateDocument}
                                  onPublish={handlePublishDocument}
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
                              {/* Add Document Button - Always visible */}
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
                                <div className="text-center py-8 text-muted-foreground border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
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
                                    className="w-full text-left p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors"
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
                          <div className="text-center py-12 text-muted-foreground">
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
                              className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
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

                      {/* History Tab */}
                      <TabsContent value="history" className="mt-0">
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
                          
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
                                  {/* Timeline dot */}
                                  <div className={cn(
                                    "absolute left-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900",
                                    color.bg
                                  )} />
                                  
                                  <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
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

                      {/* Tickets Tab */}
                      <TabsContent value="tickets" className="mt-0 space-y-3">
                        {project.tickets.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
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
                              className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
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
                          <div className="text-center py-12 text-muted-foreground">
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
                              className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
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
                    </div>
                  </div>
                </Tabs>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
