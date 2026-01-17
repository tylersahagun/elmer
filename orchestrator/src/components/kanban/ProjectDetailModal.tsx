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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore, useKanbanStore } from "@/lib/store";
import { popInVariants, springPresets } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/documents";
import type { DocumentType } from "@/lib/db/schema";
import {
  FileText,
  Layers,
  Clock,
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Archive,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Users,
  Repeat,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

// Job status colors
const jobStatusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-400", icon: Clock },
  running: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", icon: Loader2 },
  completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", icon: CheckCircle2 },
  failed: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", icon: AlertCircle },
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
  workspace?: {
    id: string;
    name: string;
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

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!selectedDocument) return;
    await saveDocumentMutation.mutateAsync({ docId: selectedDocument.id, content });
    // Update local state
    setSelectedDocument((prev) => prev ? { ...prev, content } : null);
  }, [selectedDocument, saveDocumentMutation]);

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
      <DialogContent className="glass-panel border-white/20 max-w-3xl !p-0 !gap-0 max-h-[85vh]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={popInVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full max-h-[85vh]"
            >
              {/* Header */}
              <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-shrink-0 px-6 pt-4">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50">
                      <TabsTrigger value="overview" className="gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Documents
                        {project.documents.length > 0 && (
                          <span className="ml-1 text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-1.5 rounded-full">
                            {project.documents.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="prototypes" className="gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Prototypes
                        {project.prototypes.length > 0 && (
                          <span className="ml-1 text-xs bg-pink-500/20 text-pink-600 dark:text-pink-400 px-1.5 rounded-full">
                            {project.prototypes.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        History
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 pt-4">
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <p className="text-xs text-muted-foreground mb-1">Created</p>
                            <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                            <p className="text-sm font-medium">{formatDate(project.updatedAt)}</p>
                          </div>
                        </div>

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
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {project.documents.length}
                            </p>
                            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Documents</p>
                          </div>
                          <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-center">
                            <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                              {project.prototypes.length}
                            </p>
                            <p className="text-xs text-pink-600/70 dark:text-pink-400/70">Prototypes</p>
                          </div>
                          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-center">
                            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                              {project.stages.length}
                            </p>
                            <p className="text-xs text-teal-600/70 dark:text-teal-400/70">Stage Changes</p>
                          </div>
                        </div>

                        {/* Iteration Loop Section */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-500/20">
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
                              className="h-[500px]"
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
                              {project.documents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                  <p className="text-sm">No documents yet</p>
                                  <p className="text-xs mt-1">Documents will be generated as the project progresses</p>
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
                                      <a href={`http://localhost:6006/?path=/story/${proto.storybookPath}`} target="_blank">
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
                    </div>
                  </ScrollArea>
                </Tabs>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
