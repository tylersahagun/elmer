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
  ExternalLink,
  Maximize2,
  Code2,
  Terminal,
} from "lucide-react";
import { CommandExecutionPanel } from "@/components/commands";
import { PrototypeFeedbackPanel } from "@/components/prototypes";
import { LinkedSignalsSection } from "@/components/projects/LinkedSignalsSection";
import { SignalPickerModal } from "@/components/projects/SignalPickerModal";

interface ProjectDetailPageProps {
  projectId: string;
}

export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSignalPickerOpen, setIsSignalPickerOpen] = useState(false);

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

  // Handle document save
  const handleDocumentSave = useCallback(async (content: string) => {
    if (!selectedDoc) return;
    
    const res = await fetch(`/api/documents/${selectedDoc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    
    if (!res.ok) {
      throw new Error("Failed to save document");
    }
    
    // Refresh project data to get updated document
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  }, [selectedDoc, queryClient, projectId]);

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

        {/* Linked Signals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <LinkedSignalsSection
            projectId={projectId}
            workspaceId={project.workspaceId}
            onOpenPicker={() => setIsSignalPickerOpen(true)}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8 pb-2">
              <TabsList className={cn(
                "inline-flex h-9 w-fit items-center justify-start sm:justify-center rounded-2xl p-1",
                "bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)]"
              )}>
                <TabsTrigger value="documents" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Documents</span>
                </TabsTrigger>
                <TabsTrigger value="prototypes" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Prototypes</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <FolderGit2 className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Files</span>
                </TabsTrigger>
                <TabsTrigger value="metrics" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Metrics</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">History</span>
                </TabsTrigger>
                <TabsTrigger value="validation" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Validation</span>
                </TabsTrigger>
                <TabsTrigger value="commands" className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap">
                  <Terminal className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">Commands</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="documents" className="mt-6">
              <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-320px)]">
                <DocumentSidebar
                  documents={(project.documents || []).map((doc: { id: string; title: string; type: string; content: string; version: number; createdAt: string; updatedAt: string; metadata?: { generatedBy?: "user" | "ai"; model?: string; reviewStatus?: "draft" | "reviewed" | "approved" } }) => ({
                    ...doc,
                    createdAt: new Date(doc.createdAt),
                    updatedAt: new Date(doc.updatedAt),
                  }))}
                  selectedId={selectedDocId || project.documents?.[0]?.id}
                  onSelect={(doc) => setSelectedDocId(doc.id)}
                  onUpload={() => setIsUploadDialogOpen(true)}
                  className="h-auto lg:h-full"
                />
                <Window title="document-viewer" className="flex-1 min-h-[400px] lg:min-h-0 h-full" contentClassName="p-0">
                  {selectedDoc ? (
                    <DocumentViewer
                      document={{
                        ...selectedDoc,
                        createdAt: new Date(selectedDoc.createdAt),
                        updatedAt: new Date(selectedDoc.updatedAt),
                      }}
                      onSave={handleDocumentSave}
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
              <PrototypesSection 
                prototypes={project.prototypes || []} 
                projectId={projectId}
                projectName={project.name}
                workspaceId={project.workspaceId}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {project.metadata?.gitBranch ? (
                <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-320px)]">
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
                    className="h-auto lg:h-full"
                  />
                  <Window title="file-viewer" className="flex-1 min-h-[400px] lg:min-h-0 h-full" contentClassName="p-0">
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

            <TabsContent value="commands" className="mt-6">
              <Window title="elmer --commands">
                {project.workspaceId && (
                  <CommandExecutionPanel
                    projectId={projectId}
                    projectName={project.name}
                    workspaceId={project.workspaceId}
                    currentStage={project.stage || "inbox"}
                  />
                )}
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

      {/* Signal Picker Modal */}
      {project?.workspaceId && (
        <SignalPickerModal
          isOpen={isSignalPickerOpen}
          onClose={() => setIsSignalPickerOpen(false)}
          projectId={projectId}
          projectName={project.name}
          workspaceId={project.workspaceId}
        />
      )}
    </div>
  );
}

// ============================================
// Prototypes Section with Storybook/Chromatic Embed
// ============================================

interface IterationEntry {
  version: string;
  date: string;
  prototype_type?: string;
  focus?: string;
  feedback_source?: string;
}

interface Prototype {
  id: string;
  name: string;
  type: string;
  status: string;
  chromaticUrl?: string;
  chromaticStorybookUrl?: string;
  chromaticBuildId?: string;
  storybookPath?: string;
  metadata?: {
    stories?: string[];
    components?: string[];
    iterationHistory?: IterationEntry[];
  };
}

interface PrototypesSectionProps {
  prototypes: Prototype[];
  projectId: string;
  projectName: string;
  workspaceId: string;
}

function PrototypesSection({ prototypes, projectId, projectName, workspaceId }: PrototypesSectionProps) {
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(
    prototypes.find(p => p.chromaticStorybookUrl) || prototypes[0] || null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if there's any prototype with a Storybook URL
  const hasStorybookUrl = prototypes.some(p => p.chromaticStorybookUrl);

  if (prototypes.length === 0) {
    return (
      <Window title="ls ./prototypes">
        <div className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Prototypes Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-mono">
            // Run the prototype command to generate a Storybook component.
          </p>
        </div>
      </Window>
    );
  }

  return (
    <div className="space-y-4">
      {/* Prototype selector if multiple */}
      {prototypes.length > 1 && (
        <Window title="ls ./prototypes">
          <div className="flex flex-wrap gap-2">
            {prototypes.map((proto) => (
              <Button
                key={proto.id}
                variant={selectedPrototype?.id === proto.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPrototype(proto)}
                className="gap-2 font-mono text-xs"
              >
                <Code2 className="w-3 h-3" />
                {proto.name}
                {proto.chromaticStorybookUrl && (
                  <span className="w-2 h-2 rounded-full bg-green-400" title="Has Storybook preview" />
                )}
              </Button>
            ))}
          </div>
        </Window>
      )}

      {/* Selected prototype details */}
      {selectedPrototype && (
        <Window 
          title={`cat ${selectedPrototype.name.toLowerCase().replace(/\s+/g, '-')}/info`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{selectedPrototype.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{selectedPrototype.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]">
                {selectedPrototype.status}
              </Badge>
              {selectedPrototype.chromaticUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 font-mono text-xs"
                >
                  <a href={selectedPrototype.chromaticUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                    Chromatic
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Storybook iframe embed */}
          {selectedPrototype.chromaticStorybookUrl ? (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  asChild
                >
                  <a 
                    href={selectedPrototype.chromaticStorybookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-xl overflow-hidden border border-border dark:border-[rgba(255,255,255,0.08)]",
                  isFullscreen && "fixed inset-4 z-50 bg-background"
                )}
              >
                {isFullscreen && (
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => setIsFullscreen(false)}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <iframe
                  src={selectedPrototype.chromaticStorybookUrl}
                  className={cn(
                    "w-full bg-white",
                    isFullscreen ? "h-full" : "h-[400px] sm:h-[500px] lg:h-[600px]"
                  )}
                  title={`${selectedPrototype.name} Storybook Preview`}
                  allow="fullscreen"
                />
              </motion.div>
              {isFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  onClick={() => setIsFullscreen(false)}
                />
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Code2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground font-mono mb-2">
                // No Storybook preview available
              </p>
              <p className="text-xs text-muted-foreground">
                Deploy to Chromatic to enable live preview embedding.
              </p>
            </div>
          )}
        </Window>
      )}

      {/* Prototype list (for single prototype without Storybook or additional info) */}
      {!hasStorybookUrl && prototypes.length === 1 && (
        <Window title="ls ./prototypes">
          <div className="space-y-3">
            {prototypes.map((proto) => (
              <div key={proto.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]">
                <div>
                  <p className="text-sm font-medium">{proto.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{proto.type}</p>
                </div>
                <Badge variant="outline" className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]">
                  {proto.status}
                </Badge>
              </div>
            ))}
          </div>
        </Window>
      )}

      {/* Prototype Feedback & Iteration */}
      <PrototypeFeedbackPanel
        projectId={projectId}
        projectName={projectName}
        workspaceId={workspaceId}
        prototypeId={selectedPrototype?.id}
        prototypeName={selectedPrototype?.name}
        iterationHistory={selectedPrototype?.metadata?.iterationHistory}
      />
    </div>
  );
}
