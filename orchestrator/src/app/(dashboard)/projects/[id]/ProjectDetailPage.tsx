"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DocumentViewer, DocumentSidebar, UploadDocumentDialog } from "@/components/documents";
import { MetricsDashboard } from "@/components/metrics";
import { ProjectFilesView, type FileNode } from "@/components/files";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/glass";
import { BackgroundWrapper, type BackgroundType } from "@/components/animate-ui/backgrounds";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";
import { springPresets } from "@/lib/animations";
import { 
  FileText, 
  Layers, 
  BarChart3, 
  Clock, 
  Users, 
  ArrowLeft, 
  Loader2,
  AlertCircle,
  FolderGit2,
} from "lucide-react";

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  // Fetch workspace data for background settings
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ["workspace", project?.workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${project.workspaceId}`);
      if (!res.ok) throw new Error("Failed to load workspace");
      return res.json();
    },
    enabled: !!project?.workspaceId,
  });

  const selectedDoc = project?.documents?.find((d: { id: string }) => d.id === selectedDocId)
    || project?.documents?.[0];

  // Get background settings from workspace
  const backgroundSettings = workspace?.settings?.background || { type: "aurora" as BackgroundType };

  const isLoading = projectLoading || (project?.workspaceId && workspaceLoading);

  // Handle document upload success
  const handleUploadSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  }, [queryClient, projectId]);

  // Mock file structure for the Files tab - in production this would come from git
  const projectFiles: FileNode[] = project?.metadata?.gitBranch ? [
    {
      name: "docs",
      path: "docs",
      type: "directory",
      children: [
        { name: "README.md", path: "docs/README.md", type: "file", content: "# Project Documentation\n\nThis folder contains project documentation." },
        { name: "notes.md", path: "docs/notes.md", type: "file", content: "# Notes\n\nProject notes and observations.", gitStatus: "modified" },
      ],
    },
    {
      name: "research",
      path: "research",
      type: "directory",
      children: [
        { name: "interviews.md", path: "research/interviews.md", type: "file", content: "# User Interviews\n\nSummary of user interviews.", gitStatus: "untracked" },
      ],
    },
    { name: "prd.md", path: "prd.md", type: "file", content: "# Product Requirements Document\n\n## Overview\n\nThis document outlines the requirements for the project." },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-muted-foreground">Loading project...</p>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-black">
        <GlassPanel className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Go Home
          </Button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <BackgroundWrapper
      type={backgroundSettings.type as BackgroundType}
      primaryColor={backgroundSettings.primaryColor}
      secondaryColor={backgroundSettings.secondaryColor}
      speed={backgroundSettings.speed}
      interactive={backgroundSettings.interactive}
      className="min-h-screen"
    >
      {/* Header - Same as Workspace */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 dark:bg-black/50 border-b border-white/10 shadow-xl shadow-black/20"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springPresets.bouncy}
                className="flex items-center gap-0.5 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <WaveV4D size={36} palette="forest" className="sm:w-11 sm:h-11" />
                <ElmerWordmark width={80} height={26} palette="forest" className="hidden sm:block sm:w-[100px] sm:h-8" />
              </motion.div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {project?.workspaceId && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={`/workspace/${project.workspaceId}`}>
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Workspace</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="p-4 sm:p-8 space-y-6">
        {/* Project Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-white/60 mt-1">{project.description}</p>
            )}
          </div>
          <Badge 
            variant="outline" 
            className="self-start sm:self-auto bg-white/10 border-white/20 text-white"
          >
            {project.stage?.charAt(0).toUpperCase() + project.stage?.slice(1)}
          </Badge>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] glass-card border-white/20">
              <TabsTrigger value="documents" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="prototypes" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Prototypes</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <FolderGit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="validation" className="gap-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Validation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-6">
              <div className="flex gap-4">
                <DocumentSidebar
                  documents={(project.documents || []).map((doc: { id: string; title: string; type: string; content: string; version: number; createdAt: string; updatedAt: string; metadata?: { generatedBy?: "user" | "ai"; model?: string; reviewStatus?: "draft" | "reviewed" | "approved" } }) => ({
                    ...doc,
                    createdAt: new Date(doc.createdAt),
                    updatedAt: new Date(doc.updatedAt),
                  }))}
                  selectedId={selectedDocId || project.documents?.[0]?.id}
                  onSelect={(doc) => setSelectedDocId(doc.id)}
                  onUpload={() => setIsUploadDialogOpen(true)}
                />
                <GlassPanel className="flex-1 p-0 overflow-hidden min-h-[600px]">
                  {selectedDoc ? (
                    <DocumentViewer
                      document={{
                        ...selectedDoc,
                        createdAt: new Date(selectedDoc.createdAt),
                        updatedAt: new Date(selectedDoc.updatedAt),
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-6 text-white/50">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-white/30" />
                        <p>Select a document to view</p>
                      </div>
                    </div>
                  )}
                </GlassPanel>
              </div>
            </TabsContent>

            <TabsContent value="prototypes" className="mt-6">
              <GlassPanel className="p-4 space-y-3">
                {project.prototypes?.length > 0 ? (
                  project.prototypes.map((proto: { id: string; name: string; type: string; status: string }) => (
                    <div key={proto.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{proto.name}</p>
                        <p className="text-xs text-white/60">{proto.type}</p>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white/70">{proto.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50">No prototypes yet.</p>
                )}
              </GlassPanel>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {project.metadata?.gitBranch ? (
                <ProjectFilesView
                  projectId={projectId}
                  branchName={project.metadata.gitBranch}
                  files={projectFiles}
                  onFileSave={async (path, content) => {
                    // TODO: Implement file save via git
                    console.log("Save file:", path, content);
                  }}
                  onFileCreate={async (path, content) => {
                    // TODO: Implement file create via git
                    console.log("Create file:", path, content);
                  }}
                  className="min-h-[600px]"
                />
              ) : (
                <GlassPanel className="p-8 text-center">
                  <FolderGit2 className="w-12 h-12 mx-auto mb-4 text-white/30" />
                  <h3 className="text-lg font-medium text-white mb-2">No Git Branch</h3>
                  <p className="text-sm text-white/50 max-w-md mx-auto">
                    This project doesn&apos;t have a git branch associated with it yet.
                    Create a branch to start managing files.
                  </p>
                </GlassPanel>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <MetricsDashboard projectName={project.name} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <GlassPanel className="p-4 space-y-2">
                {project.stages?.length > 0 ? (
                  project.stages.map((s: { id: string; stage: string; enteredAt: string }) => (
                    <div key={s.id} className="text-sm text-white/70">
                      <span className="text-white">{s.stage}</span>
                      <span className="text-white/50"> · {new Date(s.enteredAt).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50">No stage history yet.</p>
                )}
              </GlassPanel>
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <GlassPanel className="p-4 space-y-3">
                {project.juryEvaluations?.length > 0 ? (
                  project.juryEvaluations.map((j: { id: string; phase: string; verdict: string }) => (
                    <div key={j.id} className="flex items-center justify-between text-sm">
                      <span className="text-white">{j.phase}</span>
                      <Badge variant="outline" className="border-white/20 text-white/70">{j.verdict}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50">No validation results yet.</p>
                )}
              </GlassPanel>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Upload Document Dialog */}
      {project?.workspaceId && (
        <UploadDocumentDialog
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          projectId={projectId}
          workspaceId={project.workspaceId}
          onSuccess={handleUploadSuccess}
        />
      )}
    </BackgroundWrapper>
  );
}
