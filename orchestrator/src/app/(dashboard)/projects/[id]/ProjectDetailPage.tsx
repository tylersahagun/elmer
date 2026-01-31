"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DocumentViewer,
  DocumentSidebar,
  UploadDocumentDialog,
} from "@/components/documents";
import { MetricsDashboard } from "@/components/metrics";
import { FilesSidebar, FileViewer, type FileNode } from "@/components/files";
import { Badge } from "@/components/ui/badge";
import { Window } from "@/components/chrome/Window";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { Progress } from "@/components/ui/progress";
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
  Radio,
  GitBranch,
  Check,
  X,
  Pencil,
  Plus,
  Trash2,
  Link2,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommandExecutionPanel } from "@/components/commands";
import { PrototypeFeedbackPanel } from "@/components/prototypes";
import { SignalPickerModal } from "@/components/projects/SignalPickerModal";
import { ProjectCommitHistory } from "@/components/projects/ProjectCommitHistory";
import { useProjectFiles, fetchFileContent } from "@/hooks/useProjectFiles";

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
  const [ticketSyncing, setTicketSyncing] = useState<string | null>(null);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  const { data: columns } = useQuery({
    queryKey: ["columns", project?.workspaceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/columns?workspaceId=${project.workspaceId}`,
      );
      if (!res.ok) throw new Error("Failed to load columns");
      return res.json();
    },
    enabled: Boolean(project?.workspaceId),
  });

  const currentColumn = useMemo(() => {
    if (!columns || !project?.stage) return null;
    return columns.find(
      (column: { stage: string }) => column.stage === project.stage,
    );
  }, [columns, project?.stage]);

  const { data: graduationCheck } = useQuery({
    queryKey: ["graduation-check", projectId, project?.stage],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/graduation`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(project?.id),
  });

  const stageConfidence = useMemo(() => {
    if (!project?.metadata) return null;
    const quality = (
      project.metadata as {
        stageQuality?: Record<string, { score: number; summary?: string }>;
        stageConfidence?: Record<string, { score: number }>;
      }
    )?.stageQuality?.[project.stage];
    if (quality && typeof quality.score === "number") {
      return {
        score: quality.score,
        label: quality.summary ?? "Quality score",
      };
    }
    const confidence = (
      project.metadata as {
        stageConfidence?: Record<string, { score: number }>;
      }
    )?.stageConfidence?.[project.stage];
    if (confidence && typeof confidence.score === "number") {
      return { score: confidence.score, label: "Confidence" };
    }
    const checks = graduationCheck?.checks as
      | Array<{ passed: boolean }>
      | undefined;
    if (checks && checks.length > 0) {
      const passed = checks.filter((c) => c.passed).length;
      return { score: passed / checks.length, label: "Confidence (criteria)" };
    }
    return null;
  }, [project?.metadata, project?.stage, graduationCheck]);

  const triggerJob = useCallback(
    async (type: string) => {
      if (!project) return;
      try {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: project.workspaceId,
            projectId: project.id,
            type,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create job");
        }
        toast.success(`Job queued: ${type.replace(/_/g, " ")}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create job",
        );
      }
    },
    [project],
  );

  const handleSyncTickets = useCallback(
    async (toolkit: string) => {
      if (!project) return;
      setTicketSyncing(toolkit);
      try {
        const res = await fetch(
          `/api/projects/${project.id}/tickets/sync?toolkit=${toolkit}`,
          {
            method: "POST",
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to sync tickets");
        }
        const data = await res.json();
        toast.success(`Synced ${data.synced ?? 0} tickets`);
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to sync tickets",
        );
      } finally {
        setTicketSyncing(null);
      }
    },
    [project, projectId, queryClient],
  );

  const selectedDoc =
    project?.documents?.find((d: { id: string }) => d.id === selectedDocId) ||
    project?.documents?.[0];

  const handlePublishNotion = useCallback(async () => {
    if (!project || !selectedDoc) return;
    const res = await fetch(
      `/api/projects/${project.id}/documents/${selectedDoc.id}/publish`,
      {
        method: "POST",
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to publish document");
    }
    toast.success("Published to Notion");
  }, [project, selectedDoc]);

  // Handle document upload success
  const handleUploadSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  }, [queryClient, projectId]);

  // Extract GitHub repo info for file fetching
  const githubInfo = useMemo(() => {
    const githubRepo = project?.workspace?.githubRepo;
    const sourcePath = project?.metadata?.sourcePath as string | undefined;
    const baseBranch = project?.workspace?.settings?.baseBranch as
      | string
      | undefined;

    if (!githubRepo) return null;

    // Parse owner/repo from githubRepo (e.g., "tylersahagun/pm-workspace")
    const [owner, repo] = githubRepo.split("/");
    if (!owner || !repo) return null;

    return {
      owner,
      repo,
      path: sourcePath || null,
      ref: baseBranch || "main",
    };
  }, [project]);

  // Handle document save
  const resolveRepoFilePath = useCallback((filePath?: string | null) => {
    if (!filePath) return null;
    if (filePath.includes(":")) {
      return filePath.split(":").slice(1).join(":");
    }
    const match = filePath.match(/elmer-docs\/(.+)$/);
    if (match?.[1]) {
      return `elmer-docs/${match[1]}`;
    }
    return filePath.replace(/^\/+/, "");
  }, []);

  const handleDocumentSave = useCallback(
    async (content: string) => {
      if (!selectedDoc) return;

      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("Failed to save document");
      }

      const repoPath = resolveRepoFilePath(selectedDoc.filePath);
      if (githubInfo && repoPath) {
        const commitRes = await fetch("/api/github/write/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner: githubInfo.owner,
            repo: githubInfo.repo,
            branch: githubInfo.ref || "main",
            message: `docs: update ${repoPath}`,
            files: [{ path: repoPath, content }],
          }),
        });

        if (!commitRes.ok) {
          const err = await commitRes.json().catch(() => ({}));
          throw new Error(err.error || "Failed to write document to GitHub");
        }
      }

      // Refresh project data to get updated document
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Document saved");
    },
    [selectedDoc, queryClient, projectId, githubInfo, resolveRepoFilePath],
  );

  // Fetch files from GitHub
  const {
    data: projectFiles = [],
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useProjectFiles({
    owner: githubInfo?.owner ?? null,
    repo: githubInfo?.repo ?? null,
    path: githubInfo?.path ?? null,
    ref: githubInfo?.ref,
    enabled: !!githubInfo && activeTab === "files",
  });

  // Load file content on-demand when a file is selected
  const handleFileSelect = useCallback(
    async (file: FileNode) => {
      if (file.type === "directory") {
        setSelectedFile(file);
        return;
      }

      // If file already has content, just select it
      if (file.content) {
        setSelectedFile(file);
        return;
      }

      // Fetch content from GitHub
      if (githubInfo) {
        try {
          const content = await fetchFileContent(
            githubInfo.owner,
            githubInfo.repo,
            file.path,
            githubInfo.ref,
          );
          setSelectedFile({ ...file, content: content ?? undefined });
        } catch (error) {
          console.error("Failed to fetch file content:", error);
          setSelectedFile({
            ...file,
            content: `// Error loading file: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      } else {
        setSelectedFile(file);
      }
    },
    [githubInfo],
  );

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-sm">
            Loading project...
          </p>
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
              The project you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access.
            </p>
            <Button onClick={() => (window.location.href = "/")}>
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
        path={`~/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
      />

      {/* Main Content */}
      <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Window
            title={`cat ${project.name.toLowerCase().replace(/\s+/g, "-")}/info`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {"// "}
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "self-start sm:self-auto font-mono",
                      "border-border dark:border-[rgba(255,255,255,0.14)]",
                    )}
                  >
                    {project.stage?.charAt(0).toUpperCase() +
                      project.stage?.slice(1)}
                  </Badge>
                  {currentColumn?.loopGroupId && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      Loop: {currentColumn.loopGroupId}
                    </Badge>
                  )}
                </div>
                {stageConfidence && (
                  <div className="w-48">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{stageConfidence.label}</span>
                      <span>{Math.round(stageConfidence.score * 100)}%</span>
                    </div>
                    <Progress
                      value={stageConfidence.score * 100}
                      className="mt-1 h-1.5 [&>div]:bg-linear-to-r [&>div]:from-emerald-400 [&>div]:to-teal-400"
                    />
                  </div>
                )}
              </div>
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
            <div className="overflow-x-auto -mx-4 sm:-mx-8 px-4 sm:px-8 pb-2">
              <TabsList
                className={cn(
                  "inline-flex h-9 w-fit items-center justify-start sm:justify-center rounded-2xl p-1",
                  "bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.14)]",
                )}
              >
                <TabsTrigger
                  value="documents"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Documents
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="signals"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Radio className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Signals
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="prototypes"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Prototypes
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Files
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="metrics"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Metrics
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    History
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="validation"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Validation
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="tickets"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Ticket className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Tickets
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="commands"
                  className="gap-1.5 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm whitespace-nowrap"
                >
                  <Terminal className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-xs">
                    Commands
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="documents" className="mt-6">
              <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-320px)]">
                <DocumentSidebar
                  documents={(project.documents || []).map(
                    (doc: {
                      id: string;
                      title: string;
                      type: string;
                      content: string;
                      version: number;
                      createdAt: string;
                      updatedAt: string;
                      metadata?: {
                        generatedBy?: "user" | "ai";
                        model?: string;
                        reviewStatus?: "draft" | "reviewed" | "approved";
                      };
                    }) => ({
                      ...doc,
                      createdAt: new Date(doc.createdAt),
                      updatedAt: new Date(doc.updatedAt),
                    }),
                  )}
                  selectedId={selectedDocId || project.documents?.[0]?.id}
                  onSelect={(doc) => setSelectedDocId(doc.id)}
                  onUpload={() => setIsUploadDialogOpen(true)}
                  className="h-auto lg:h-full"
                />
                <Window
                  title="document-viewer"
                  className="flex-1 min-h-[400px] lg:min-h-0 h-full"
                  contentClassName="p-0"
                >
                  {selectedDoc ? (
                    <DocumentViewer
                      document={{
                        ...selectedDoc,
                        createdAt: new Date(selectedDoc.createdAt),
                        updatedAt: new Date(selectedDoc.updatedAt),
                      }}
                      onSave={handleDocumentSave}
                      onPublish={handlePublishNotion}
                      publishLabel="Publish to Notion"
                      publishDisabled={
                        !project.workspace?.settings?.composio?.enabled ||
                        !project.workspace?.settings?.composio?.connectedServices?.includes(
                          "notion",
                        )
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-6 text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="font-mono text-sm">
                          Select a document to view
                        </p>
                      </div>
                    </div>
                  )}
                </Window>
              </div>
            </TabsContent>

            <TabsContent value="signals" className="mt-6">
              <SignalsSection
                projectId={projectId}
                workspaceId={project.workspaceId}
                onOpenPicker={() => setIsSignalPickerOpen(true)}
              />
            </TabsContent>

            <TabsContent value="prototypes" className="mt-6">
              <PrototypesSection
                prototypes={project.prototypes || []}
                projectId={projectId}
                projectName={project.name}
                workspaceId={project.workspaceId}
                gitBranch={project.metadata?.gitBranch as string | undefined}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              {githubInfo?.path ? (
                <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-320px)]">
                  <FilesSidebar
                    projectId={projectId}
                    branchName={githubInfo.ref || "main"}
                    files={projectFiles}
                    selectedPath={selectedFile?.path}
                    onFileSelect={handleFileSelect}
                    onFileCreate={() => {
                      console.log("Create file dialog");
                    }}
                    onRefresh={() => {
                      refetchFiles();
                    }}
                    isLoading={filesLoading}
                    className="h-auto lg:h-full"
                  />
                  <Window
                    title="file-viewer"
                    className="flex-1 min-h-[400px] lg:min-h-0 h-full"
                    contentClassName="p-0"
                  >
                    {filesLoading && !selectedFile ? (
                      <div className="flex items-center justify-center h-full py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filesError ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                        <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                        <p className="text-sm text-destructive text-center font-mono">
                          {filesError instanceof Error
                            ? filesError.message
                            : "Failed to load files"}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => refetchFiles()}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <FileViewer
                        file={selectedFile}
                        onSave={async (path, content) => {
                          if (!githubInfo) {
                            toast.error("Connect a GitHub repo to save files.");
                            return;
                          }

                          try {
                            const res = await fetch(
                              "/api/github/write/commit",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  owner: githubInfo.owner,
                                  repo: githubInfo.repo,
                                  branch: githubInfo.ref || "main",
                                  message: `chore(files): update ${path}`,
                                  files: [{ path, content }],
                                }),
                              },
                            );

                            if (!res.ok) {
                              const err = await res.json().catch(() => ({}));
                              throw new Error(
                                err.error || "Failed to save file to GitHub",
                              );
                            }

                            setSelectedFile((prev) =>
                              prev ? { ...prev, content } : prev,
                            );
                            await refetchFiles();
                            toast.success("File saved to GitHub.");
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Failed to save file",
                            );
                          }
                        }}
                      />
                    )}
                  </Window>
                </div>
              ) : (
                <Window title="git status">
                  <div className="py-8 text-center">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Source Path</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto font-mono">
                      {
                        "// This project doesn't have a source path in GitHub. Import from a repository to view files."
                      }
                    </p>
                  </div>
                </Window>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <MetricsDashboard
                projectName={project.name}
                projectId={project.id}
                projectStage={project.stage}
                activity={{
                  documents: project.documents?.length ?? 0,
                  prototypes: project.prototypes?.length ?? 0,
                  signals: project.signalCount ?? 0,
                }}
                posthogConnected={Boolean(
                  project.workspace?.settings?.integrations?.posthog?.enabled,
                )}
                releaseMetrics={
                  (
                    project.metadata as {
                      releaseMetrics?: {
                        thresholds?: {
                          alpha?: {
                            users: number;
                            engagement: number;
                            errors: number;
                            satisfaction: number;
                          };
                          beta?: {
                            users: number;
                            engagement: number;
                            errors: number;
                            satisfaction: number;
                          };
                          ga?: {
                            users: number;
                            engagement: number;
                            errors: number;
                            satisfaction: number;
                          };
                        };
                        current?: {
                          users: number;
                          engagement: number;
                          errors: number;
                          satisfaction: number;
                        };
                        autoAdvance?: boolean;
                      };
                    }
                  )?.releaseMetrics
                }
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-6">
                <Window title="git log --oneline">
                  <div className="space-y-2">
                    {project.stages?.length > 0 ? (
                      project.stages.map(
                        (s: {
                          id: string;
                          stage: string;
                          enteredAt: string;
                        }) => (
                          <div
                            key={s.id}
                            className="text-sm font-mono flex items-center gap-2"
                          >
                            <span className="text-emerald-500">→</span>
                            <span>{s.stage}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {new Date(s.enteredAt).toLocaleString()}
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground font-mono">
                        {"// No stage history yet."}
                      </p>
                    )}
                  </div>
                </Window>

                {/* GitHub Commit History */}
                <ProjectCommitHistory projectId={projectId} />
              </div>
            </TabsContent>

            <TabsContent value="validation" className="mt-6">
              <Window title="jury --status">
                <div className="space-y-3">
                  {project.juryEvaluations?.length > 0 ? (
                    project.juryEvaluations.map(
                      (j: { id: string; phase: string; verdict: string }) => (
                        <div
                          key={j.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]"
                        >
                          <span className="font-mono text-sm">{j.phase}</span>
                          <Badge
                            variant="outline"
                            className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]"
                          >
                            {j.verdict}
                          </Badge>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">
                      {"// No validation results yet."}
                    </p>
                  )}
                </div>
              </Window>
            </TabsContent>

            <TabsContent value="tickets" className="mt-6">
              <Window title="tickets">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">Ticket Generation</h3>
                      <p className="text-xs text-muted-foreground">
                        Generate and validate tickets from PRD + engineering
                        spec.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => triggerJob("generate_tickets")}
                      >
                        Generate Tickets
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => triggerJob("validate_tickets")}
                      >
                        Validate Tickets
                      </Button>
                      {project.workspace?.settings?.composio?.enabled &&
                        project.workspace?.settings?.composio?.connectedServices?.includes(
                          "linear",
                        ) && (
                          <Button
                            onClick={() => handleSyncTickets("linear")}
                            disabled={ticketSyncing === "linear"}
                          >
                            {ticketSyncing === "linear"
                              ? "Syncing..."
                              : "Sync to Linear"}
                          </Button>
                        )}
                      {project.workspace?.settings?.composio?.enabled &&
                        project.workspace?.settings?.composio?.connectedServices?.includes(
                          "jira",
                        ) && (
                          <Button
                            variant="outline"
                            onClick={() => handleSyncTickets("jira")}
                            disabled={ticketSyncing === "jira"}
                          >
                            {ticketSyncing === "jira"
                              ? "Syncing..."
                              : "Sync to Jira"}
                          </Button>
                        )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(project.tickets || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground font-mono">
                        {"// No tickets generated yet."}
                      </p>
                    ) : (
                      (project.tickets || []).map(
                        (ticket: {
                          id: string;
                          title: string;
                          status: string | null;
                          estimatedPoints?: number | null;
                          linearIdentifier?: string | null;
                          metadata?: Record<string, unknown> | null;
                        }) => (
                          <div
                            key={ticket.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {ticket.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.linearIdentifier
                                  ? `Linear: ${ticket.linearIdentifier}`
                                  : (
                                        ticket.metadata as {
                                          jiraSyncStatus?: string;
                                        }
                                      )?.jiraSyncStatus
                                    ? "Synced to Jira"
                                    : "Not synced"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {ticket.estimatedPoints !== null &&
                                ticket.estimatedPoints !== undefined && (
                                  <Badge variant="outline">
                                    {ticket.estimatedPoints} pts
                                  </Badge>
                                )}
                              {ticket.status && (
                                <Badge variant="secondary">
                                  {ticket.status}
                                </Badge>
                              )}
                              {(
                                ticket.metadata as { linearSyncStatus?: string }
                              )?.linearSyncStatus && (
                                <Badge variant="outline">
                                  {
                                    (
                                      ticket.metadata as {
                                        linearSyncStatus?: string;
                                      }
                                    ).linearSyncStatus
                                  }
                                </Badge>
                              )}
                              {(ticket.metadata as { jiraSyncStatus?: string })
                                ?.jiraSyncStatus && (
                                <Badge variant="outline">
                                  {
                                    (
                                      ticket.metadata as {
                                        jiraSyncStatus?: string;
                                      }
                                    ).jiraSyncStatus
                                  }
                                </Badge>
                              )}
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
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
    placementAnalysis?: {
      suggestedLocation?: string;
      existingPatterns?: string[];
    };
  };
}

interface PrototypesSectionProps {
  prototypes: Prototype[];
  projectId: string;
  projectName: string;
  workspaceId: string;
  gitBranch?: string;
}

/**
 * Build a Chromatic Storybook URL from branch name.
 * Uses the default Chromatic app ID.
 */
function buildChromaticUrl(branch: string): string {
  const CHROMATIC_APP_ID = "696c2c54e35ea5bca2a772d8";
  const sanitizedBranch = branch
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://${sanitizedBranch}--${CHROMATIC_APP_ID}.chromatic.com`;
}

/**
 * Get the effective Storybook URL for a prototype.
 * Falls back to constructing from git branch if no direct URL.
 */
function getPrototypeStorybookUrl(
  prototype: Prototype,
  gitBranch?: string,
): string | null {
  // Use direct URL if available
  if (prototype.chromaticStorybookUrl) {
    return prototype.chromaticStorybookUrl;
  }

  // Fall back to constructing from git branch
  if (gitBranch && prototype.storybookPath) {
    return buildChromaticUrl(gitBranch);
  }

  // Check metadata for branch info
  const metadataBranch = (prototype.metadata as Record<string, unknown>)
    ?.branch as string | undefined;
  if (metadataBranch) {
    return buildChromaticUrl(metadataBranch);
  }

  return null;
}

/**
 * Editable Git Branch field for linking prototypes to Chromatic.
 */
function GitBranchEditor({
  projectId,
  currentBranch,
  onBranchUpdated,
}: {
  projectId: string;
  currentBranch?: string;
  onBranchUpdated: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [branchValue, setBranchValue] = useState(currentBranch || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!branchValue.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { gitBranch: branchValue.trim() } }),
      });

      if (res.ok) {
        setIsEditing(false);
        onBranchUpdated();
      }
    } catch (error) {
      console.error("Failed to update branch:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBranchValue(currentBranch || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-muted-foreground" />
        <Input
          value={branchValue}
          onChange={(e) => setBranchValue(e.target.value)}
          placeholder="e.g., feat/my-feature"
          className="h-8 w-48 font-mono text-xs"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleSave}
          disabled={isSaving || !branchValue.trim()}
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
    >
      <GitBranch className="w-4 h-4" />
      {currentBranch ? (
        <span className="font-mono">{currentBranch}</span>
      ) : (
        <span className="italic">Set branch for Chromatic</span>
      )}
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

/**
 * Dialog for linking a new prototype to the project.
 */
function LinkPrototypeDialog({
  projectId,
  gitBranch,
  onPrototypeLinked,
}: {
  projectId: string;
  gitBranch?: string;
  onPrototypeLinked: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "standalone" as "standalone" | "context",
    storybookPath: "",
    chromaticStorybookUrl: "",
    versionLabel: "",
    branch: gitBranch || "",
    placementLocation: "",
    placementPatterns: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/prototypes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          storybookPath: formData.storybookPath.trim() || undefined,
          chromaticStorybookUrl:
            formData.chromaticStorybookUrl.trim() || undefined,
          versionLabel: formData.versionLabel.trim() || undefined,
          branch: formData.branch.trim() || undefined,
          placement:
            formData.placementLocation.trim() ||
            formData.placementPatterns.trim()
              ? {
                  suggestedLocation:
                    formData.placementLocation.trim() || undefined,
                  existingPatterns: formData.placementPatterns
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }
              : undefined,
        }),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({
          name: "",
          type: "standalone",
          storybookPath: "",
          chromaticStorybookUrl: "",
          versionLabel: "",
          branch: gitBranch || "",
          placementLocation: "",
          placementPatterns: "",
        });
        onPrototypeLinked();
      }
    } catch (error) {
      console.error("Failed to link prototype:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-3 h-3" />
          Link Prototype
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link Prototype
            </DialogTitle>
            <DialogDescription>
              Manually link a prototype to this project. Useful for prototypes
              that weren&apos;t discovered during import.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Flagship Meeting Recap"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "standalone" | "context") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">Standalone</SelectItem>
                    <SelectItem value="context">Context</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Version Label</Label>
                <Input
                  id="version"
                  placeholder="e.g., v1, v2"
                  value={formData.versionLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, versionLabel: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch">Git Branch</Label>
              <Input
                id="branch"
                placeholder="e.g., feat/flagship-recap"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Used to construct the Chromatic preview URL
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storybook">Storybook Path</Label>
              <Input
                id="storybook"
                placeholder="e.g., prototypes-flagshipmeetingrecap--default"
                value={formData.storybookPath}
                onChange={(e) =>
                  setFormData({ ...formData, storybookPath: e.target.value })
                }
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                The story ID in Storybook (found in URL after ?path=/story/)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chromatic">Direct Chromatic URL (optional)</Label>
              <Input
                id="chromatic"
                placeholder="https://branch--appid.chromatic.com/?path=..."
                value={formData.chromaticStorybookUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    chromaticStorybookUrl: e.target.value,
                  })
                }
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Override the auto-constructed URL with a direct link
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="placement">Suggested Placement</Label>
              <Input
                id="placement"
                placeholder="e.g., src/app/(dashboard)/projects/[id]"
                value={formData.placementLocation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placementLocation: e.target.value,
                  })
                }
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patterns">
                Existing Patterns (comma separated)
              </Label>
              <Input
                id="patterns"
                placeholder="e.g., ProjectDetailPage, PrototypeFeedbackPanel"
                value={formData.placementPatterns}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placementPatterns: e.target.value,
                  })
                }
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link Prototype"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PrototypesSection({
  prototypes,
  projectId,
  projectName,
  workspaceId,
  gitBranch,
}: PrototypesSectionProps) {
  const queryClient = useQueryClient();
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(
    prototypes.find((p) => getPrototypeStorybookUrl(p, gitBranch)) ||
      prototypes[0] ||
      null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleBranchUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  }, [queryClient, projectId]);

  const [deletingProtoId, setDeletingProtoId] = useState<string | null>(null);

  const handleDeletePrototype = useCallback(
    async (protoId: string) => {
      if (!confirm("Are you sure you want to unlink this prototype?")) return;

      setDeletingProtoId(protoId);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/prototypes/${protoId}`,
          {
            method: "DELETE",
          },
        );
        if (res.ok) {
          // If we deleted the selected prototype, clear selection
          if (selectedPrototype?.id === protoId) {
            setSelectedPrototype(
              prototypes.find((p) => p.id !== protoId) || null,
            );
          }
          handleBranchUpdated();
        }
      } catch (error) {
        console.error("Failed to delete prototype:", error);
      } finally {
        setDeletingProtoId(null);
      }
    },
    [projectId, selectedPrototype, prototypes, handleBranchUpdated],
  );

  // Check if there's any prototype with a Storybook URL (direct or constructed)
  const hasStorybookUrl = prototypes.some(
    (p) => getPrototypeStorybookUrl(p, gitBranch) !== null,
  );

  if (prototypes.length === 0) {
    return (
      <Window title="ls ./prototypes">
        <div className="py-12 text-center">
          <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Prototypes Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-mono mb-4">
            {"// Run the prototype command or link an existing prototype."}
          </p>
          <div className="flex flex-col items-center gap-4">
            <GitBranchEditor
              projectId={projectId}
              currentBranch={gitBranch}
              onBranchUpdated={handleBranchUpdated}
            />
            <LinkPrototypeDialog
              projectId={projectId}
              gitBranch={gitBranch}
              onPrototypeLinked={handleBranchUpdated}
            />
          </div>
        </div>
      </Window>
    );
  }

  return (
    <div className="space-y-4">
      {/* Git branch setting and link prototype */}
      <Window title="git branch">
        <div className="flex items-center justify-between">
          <GitBranchEditor
            projectId={projectId}
            currentBranch={gitBranch}
            onBranchUpdated={handleBranchUpdated}
          />
          <div className="flex items-center gap-3">
            {gitBranch && (
              <a
                href={buildChromaticUrl(gitBranch)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View on Chromatic
              </a>
            )}
            <LinkPrototypeDialog
              projectId={projectId}
              gitBranch={gitBranch}
              onPrototypeLinked={handleBranchUpdated}
            />
          </div>
        </div>
      </Window>

      {/* Prototype selector if multiple */}
      {prototypes.length > 1 && (
        <Window title="ls ./prototypes">
          <div className="flex flex-wrap gap-2">
            {prototypes.map((proto) => {
              const versionLabel = (proto.metadata as Record<string, unknown>)
                ?.versionLabel as string | undefined;
              return (
                <Button
                  key={proto.id}
                  variant={
                    selectedPrototype?.id === proto.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedPrototype(proto)}
                  className="gap-2 font-mono text-xs"
                >
                  <Code2 className="w-3 h-3" />
                  {proto.name}
                  {versionLabel && (
                    <span className="text-muted-foreground">
                      ({versionLabel})
                    </span>
                  )}
                  {getPrototypeStorybookUrl(proto, gitBranch) && (
                    <span
                      className="w-2 h-2 rounded-full bg-green-400"
                      title="Has Storybook preview"
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </Window>
      )}

      {/* Selected prototype details */}
      {selectedPrototype && (
        <Window
          title={`cat ${selectedPrototype.name.toLowerCase().replace(/\s+/g, "-")}/info`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">{selectedPrototype.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedPrototype.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]"
              >
                {selectedPrototype.status}
              </Badge>
              {(() => {
                const vLabel = (
                  selectedPrototype.metadata as Record<string, unknown>
                )?.versionLabel;
                return typeof vLabel === "string" ? (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {vLabel}
                  </Badge>
                ) : null;
              })()}
              {selectedPrototype.chromaticUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 font-mono text-xs"
                >
                  <a
                    href={selectedPrototype.chromaticUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Chromatic
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeletePrototype(selectedPrototype.id)}
                disabled={deletingProtoId === selectedPrototype.id}
                title="Unlink prototype"
              >
                {deletingProtoId === selectedPrototype.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {selectedPrototype.metadata?.placementAnalysis && (
            <div className="mb-4 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-mono text-muted-foreground mb-2">
                placement-analysis
              </p>
              {selectedPrototype.metadata.placementAnalysis
                .suggestedLocation && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Suggested:</span>{" "}
                  <span className="font-mono">
                    {
                      selectedPrototype.metadata.placementAnalysis
                        .suggestedLocation
                    }
                  </span>
                </p>
              )}
              {selectedPrototype.metadata.placementAnalysis.existingPatterns
                ?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPrototype.metadata.placementAnalysis.existingPatterns.map(
                    (pattern) => (
                      <Badge
                        key={pattern}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        {pattern}
                      </Badge>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Storybook iframe embed */}
          {(() => {
            const storybookUrl = getPrototypeStorybookUrl(
              selectedPrototype,
              gitBranch,
            );
            if (storybookUrl) {
              return (
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
                        href={storybookUrl}
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
                      isFullscreen && "fixed inset-4 z-50 bg-background",
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
                      src={storybookUrl}
                      className={cn(
                        "w-full bg-white",
                        isFullscreen
                          ? "h-full"
                          : "h-[400px] sm:h-[500px] lg:h-[600px]",
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
              );
            }
            return (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Code2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground font-mono mb-2">
                  {"// No Storybook preview available"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gitBranch
                    ? "Deploy this branch to Chromatic to enable live preview."
                    : "Set a git branch or deploy to Chromatic to enable preview."}
                </p>
              </div>
            );
          })()}
        </Window>
      )}

      {/* Prototype list (for single prototype without Storybook or additional info) */}
      {!hasStorybookUrl && prototypes.length === 1 && (
        <Window title="ls ./prototypes">
          <div className="space-y-3">
            {prototypes.map((proto) => (
              <div
                key={proto.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)]"
              >
                <div>
                  <p className="text-sm font-medium">{proto.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {proto.type}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="font-mono border-border dark:border-[rgba(255,255,255,0.14)]"
                >
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

// ============================================
// Signals Section - Tab View
// ============================================

interface LinkedSignal {
  id: string;
  verbatim: string;
  source: string;
  severity?: string | null;
  linkedAt: string;
  linkReason?: string | null;
  confidence?: number | null;
  linkedBy?: {
    id: string;
    name: string | null;
  } | null;
}

interface SignalsSectionProps {
  projectId: string;
  workspaceId: string;
  onOpenPicker: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  paste: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  webhook: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  upload: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  slack: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  pylon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  email: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  interview: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function SignalsSection({
  projectId,
  workspaceId,
  onOpenPicker,
}: SignalsSectionProps) {
  const queryClient = useQueryClient();

  // Fetch linked signals
  const { data: signalsData, isLoading } = useQuery({
    queryKey: ["project-signals", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/signals`);
      if (!res.ok) throw new Error("Failed to load signals");
      return res.json();
    },
  });

  // Unlink mutation
  const unlinkMutation = useMutation({
    mutationFn: async (signalId: string) => {
      const res = await fetch(`/api/signals/${signalId}/projects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error("Failed to unlink signal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-signals", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const signals: LinkedSignal[] = signalsData?.signals || [];

  if (isLoading) {
    return (
      <Window title="ls ./signals">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Window>
    );
  }

  if (signals.length === 0) {
    return (
      <Window title="ls ./signals">
        <div className="py-12 text-center">
          <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Signals Linked</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-mono mb-4">
            {
              "// Link signals from user feedback, interviews, and support tickets to inform this project."
            }
          </p>
          <Button onClick={onOpenPicker} className="gap-2">
            <Radio className="w-4 h-4" />
            Link Signals
          </Button>
        </div>
      </Window>
    );
  }

  return (
    <div className="space-y-4">
      <Window title={`cat signals --count=${signals.length}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground font-mono">
            {"// Signals that informed this project"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenPicker}
            className="gap-2 font-mono text-xs"
          >
            <Radio className="w-3 h-3" />
            Link More
          </Button>
        </div>

        <div className="space-y-3">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="group flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border dark:border-[rgba(255,255,255,0.08)] hover:bg-muted/70 transition-colors"
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">{signal.verbatim}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    className={cn(
                      "text-[10px]",
                      SOURCE_COLORS[signal.source] || SOURCE_COLORS.other,
                    )}
                  >
                    {signal.source}
                  </Badge>
                  {signal.severity && (
                    <Badge
                      className={cn(
                        "text-[10px]",
                        SEVERITY_COLORS[signal.severity] ||
                          SEVERITY_COLORS.medium,
                      )}
                    >
                      {signal.severity}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Linked {new Date(signal.linkedAt).toLocaleDateString()}
                    {signal.linkedBy?.name && ` by ${signal.linkedBy.name}`}
                    {signal.confidence != null && (
                      <span className="ml-1">
                        ({Math.round(signal.confidence * 100)}% AI confidence)
                      </span>
                    )}
                  </span>
                </div>
                {signal.linkReason && (
                  <p className="text-[10px] text-muted-foreground italic mt-1">
                    Reason: {signal.linkReason}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    window.open(
                      `/workspace/${workspaceId}/signals?id=${signal.id}`,
                      "_blank",
                    );
                  }}
                  title="View signal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => unlinkMutation.mutate(signal.id)}
                  disabled={unlinkMutation.isPending}
                  title="Unlink signal"
                >
                  {unlinkMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Window>
    </div>
  );
}
