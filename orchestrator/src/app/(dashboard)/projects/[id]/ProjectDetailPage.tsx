"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DocumentViewer, DocumentSidebar, UploadDocumentDialog } from "@/components/documents";
import { MetricsDashboard } from "@/components/metrics";
import { FilesSidebar, FileViewer, type FileNode } from "@/components/files";
import { Badge } from "@/components/ui/badge";
import { Window } from "@/components/chrome/Window";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Layers, 
  BarChart3, 
  Clock, 
  Users, 
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
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
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

  const selectedDoc = project?.documents?.find((d: { id: string }) => d.id === selectedDocId)
    || project?.documents?.[0];

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

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-sm">Loading project...</p>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Window title="error" className="max-w-md">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Go Home
            </Button>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <SimpleNavbar
        path={`~/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
      />

      {/* Main Content */}
      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Project Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Window title={`cat ${project.name.toLowerCase().replace(/\s+/g, '-')}/info`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    // {project.description}
                  </p>
                )}
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "self-start sm:self-auto font-mono",
                  "border-border dark:border-[rgba(255,255,255,0.14)]"
                )}
              >
                {project.stage?.charAt(0).toUpperCase() + project.stage?.slice(1)}
              </Badge>
            </div>
          </Window>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={cn(
              "inline-flex h-9 w-fit items-center justify-center rounded-2xl p-1",
              "bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)]"
            )}>
              <TabsTrigger value="documents" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="prototypes" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">Prototypes</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <FolderGit2 className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">Files</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">History</span>
              </TabsTrigger>
              <TabsTrigger value="validation" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline font-mono text-xs">Validation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-6">
              <div className="flex gap-4 min-h-[calc(100vh-320px)]">
                <DocumentSidebar
                  documents={(project.documents || []).map((doc: { id: string; title: string; type: string; content: string; version: number; createdAt: string; updatedAt: string; metadata?: { generatedBy?: "user" | "ai"; model?: string; reviewStatus?: "draft" | "reviewed" | "approved" } }) => ({
                    ...doc,
                    createdAt: new Date(doc.createdAt),
                    updatedAt: new Date(doc.updatedAt),
                  }))}
                  selectedId={selectedDocId || project.documents?.[0]?.id}
                  onSelect={(doc) => setSelectedDocId(doc.id)}
                  onUpload={() => setIsUploadDialogOpen(true)}
                  className="h-full"
                />
                <Window title="document-viewer" className="flex-1 h-full" contentClassName="p-0">
                  {selectedDoc ? (
                    <DocumentViewer
                      document={{
                        ...selectedDoc,
                        createdAt: new Date(selectedDoc.createdAt),
                        updatedAt: new Date(selectedDoc.updatedAt),
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="font-mono text-sm">Select a document to view</p>
                      </div>
                    </div>
                  )}
                </Window>
              </div>
            </TabsContent>

            <TabsContent value="prototypes" className="mt-6">
              <Window title="ls ./prototypes">
                <div className="space-y-3">
                  {project.prototypes?.length > 0 ? (
                    project.prototypes.map((proto: { id: string; name: string; type: string; status: string }) => (
                      <div key={proto.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <div>
                          <p className="text-sm font-medium">{proto.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{proto.type}</p>
                        </div>
                        <Badge variant="outline" className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]">
                          {proto.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">// No prototypes yet.</p>
                  )}
                </div>
              </Window>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {project.metadata?.gitBranch ? (
                <div className="flex gap-4 min-h-[calc(100vh-320px)]">
                  <FilesSidebar
                    projectId={projectId}
                    branchName={project.metadata.gitBranch}
                    files={projectFiles}
                    selectedPath={selectedFile?.path}
                    onFileSelect={(file) => setSelectedFile(file)}
                    onFileCreate={() => {
                      console.log("Create file dialog");
                    }}
                    onRefresh={() => {
                      console.log("Refresh files");
                    }}
                    className="h-full"
                  />
                  <Window title="file-viewer" className="flex-1 h-full" contentClassName="p-0">
                    <FileViewer
                      file={selectedFile}
                      onSave={async (path, content) => {
                        console.log("Save file:", path, content);
                      }}
                    />
                  </Window>
                </div>
              ) : (
                <Window title="git status">
                  <div className="py-8 text-center">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Git Branch</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto font-mono">
                      // This project doesn&apos;t have a git branch associated with it yet.
                    </p>
                  </div>
                </Window>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <MetricsDashboard projectName={project.name} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Window title="git log --oneline">
                <div className="space-y-2">
                  {project.stages?.length > 0 ? (
                    project.stages.map((s: { id: string; stage: string; enteredAt: string }) => (
                      <div key={s.id} className="text-sm font-mono flex items-center gap-2">
                        <span className="text-emerald-500">→</span>
                        <span>{s.stage}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{new Date(s.enteredAt).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">// No stage history yet.</p>
                  )}
                </div>
              </Window>
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <Window title="jury --status">
                <div className="space-y-3">
                  {project.juryEvaluations?.length > 0 ? (
                    project.juryEvaluations.map((j: { id: string; phase: string; verdict: string }) => (
                      <div key={j.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]">
                        <span className="font-mono text-sm">{j.phase}</span>
                        <Badge variant="outline" className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]">
                          {j.verdict}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">// No validation results yet.</p>
                  )}
                </div>
              </Window>
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
    </div>
  );
}
