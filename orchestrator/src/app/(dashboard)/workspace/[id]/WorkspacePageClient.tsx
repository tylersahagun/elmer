"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useKanbanStore, useUIStore, type KanbanColumn, type ProjectCard } from "@/lib/store";
import { KanbanBoard, WorkspaceSettingsModal, ArchivedProjectsModal } from "@/components/kanban";
import { NewProjectDialog } from "@/components/kanban/NewProjectDialog";
import { ProjectDetailModal } from "@/components/kanban/ProjectDetailModal";
import { ChatSidebar } from "@/components/chat";
import { NotificationInbox } from "@/components/inbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { springPresets } from "@/lib/animations";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/glass";
import { BackgroundWrapper, type BackgroundType } from "@/components/animate-ui/backgrounds";
import { useDisplaySettings } from "@/components/display";
import { 
  Plus, 
  Settings, 
  MessageSquare, 
  Loader2,
  AlertCircle,
  Menu,
  BookOpen,
  Users,
} from "lucide-react";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";

interface WorkspacePageClientProps {
  workspaceId: string;
}

export function WorkspacePageClient({ workspaceId }: WorkspacePageClientProps) {
  const router = useRouter();
  const setWorkspace = useKanbanStore((s) => s.setWorkspace);
  const setColumns = useKanbanStore((s) => s.setColumns);
  const setProjects = useKanbanStore((s) => s.setProjects);
  const storeWorkspace = useKanbanStore((s) => s.workspace);
  const openNewProjectModal = useUIStore((s) => s.openNewProjectModal);
  const openSettingsModal = useUIStore((s) => s.openSettingsModal);
  const openArchivedProjectsModal = useUIStore((s) => s.openArchivedProjectsModal);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  
  // Get background settings from workspace - defaults to aurora
  const backgroundSettings = storeWorkspace?.settings?.background || { type: "aurora" as BackgroundType };
  
  // Get display mode for focus-aware styling
  const { isFocusMode } = useDisplaySettings();

  // Get real-time job status for the inbox
  const { summary: jobSummary } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });

  // Handle navigation from notifications
  const handleNotificationNavigate = useCallback((url: string) => {
    router.push(url);
  }, [router]);

  // Fetch workspace data
  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch workspace");
      return res.json();
    },
  });

  // Fetch projects
    const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/projects?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: !!workspace,
  });


  // Update store when data loads
  useEffect(() => {
    if (workspace) {
      setWorkspace({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        githubRepo: workspace.githubRepo,
        contextPath: workspace.contextPath,
        settings: workspace.settings || {},
      });

      // Set columns from workspace config
      if (workspace.columnConfigs) {
        const columns: KanbanColumn[] = workspace.columnConfigs.map((c: {
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
        }) => ({
          id: c.stage,
          configId: c.id,
          displayName: c.displayName,
          color: c.color,
          order: c.order,
          enabled: c.enabled,
          autoTriggerJobs: c.autoTriggerJobs,
          humanInLoop: c.humanInLoop,
          requiredDocuments: c.requiredDocuments,
          requiredApprovals: c.requiredApprovals,
          contextPaths: c.rules?.contextPaths,
          contextNotes: c.rules?.contextNotes,
          loopGroupId: c.rules?.loopGroupId,
          loopTargets: c.rules?.loopTargets,
          dependencyNotes: c.rules?.dependencyNotes,
        }));
        setColumns(columns);
      }
    }
  }, [workspace, setWorkspace, setColumns]);

  useEffect(() => {
    if (projects) {
      const mappedProjects: ProjectCard[] = projects.map((p: {
        id: string;
        name: string;
        description?: string;
        stage: string;
        status: string;
        priority?: number;
        createdAt: string;
        updatedAt: string;
        documents?: unknown[];
        prototypes?: unknown[];
        metadata?: {
          gitBranch?: string;
          baseBranch?: string;
        };
      }) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        stage: p.stage,
        status: p.status,
        priority: p.priority || 0,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        documentCount: p.documents?.length || 0,
        prototypeCount: p.prototypes?.length || 0,
        metadata: p.metadata,
      }));
      setProjects(mappedProjects);
    }
  }, [projects, setProjects]);

  const isLoading = workspaceLoading || projectsLoading;


  if (workspaceError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <GlassPanel className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Workspace Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The workspace you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
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
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: isFocusMode ? 0 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isFocusMode ? { duration: 0.1 } : springPresets.gentle}
        className={cn(
          "sticky top-0 z-50 border-b",
          isFocusMode 
            ? "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm" 
            : "backdrop-blur-2xl bg-black/40 dark:bg-black/50 border-white/10 shadow-xl shadow-black/20"
        )}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openNewProjectModal}
              className={cn(
                "gap-2",
                isFocusMode
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-slate-100"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              )}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openArchivedProjectsModal}
              className={cn(
                isFocusMode
                  ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              Archived
            </Button>
            
            {/* Knowledge Base & Personas Links */}
            <div className={cn("h-4 w-px mx-1", isFocusMode ? "bg-slate-200 dark:bg-zinc-700" : "bg-white/20")} />
            <Link href="/knowledgebase">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5",
                  isFocusMode
                    ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:inline">Files</span>
              </Button>
            </Link>
            <Link href="/personas">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-1.5",
                  isFocusMode
                    ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Users className="w-4 h-4" />
                <span className="hidden lg:inline">Personas</span>
              </Button>
            </Link>
            <div className={cn("h-4 w-px mx-1", isFocusMode ? "bg-slate-200 dark:bg-zinc-700" : "bg-white/20")} />
            
            {/* Notification Inbox */}
            <NotificationInbox
              workspaceId={workspaceId}
              jobSummary={jobSummary}
              onNavigate={handleNotificationNavigate}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                isFocusMode
                  ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  : "text-white/80 hover:text-white hover:bg-white/10",
                sidebarOpen && (isFocusMode ? "text-emerald-600 dark:text-emerald-400" : "text-purple-400")
              )}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={openSettingsModal}
              className={cn(
                isFocusMode
                  ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-1">
            {/* Quick add button always visible */}
            <Button
              variant="outline"
              size="icon"
              onClick={openNewProjectModal}
              className={cn(
                "h-9 w-9",
                isFocusMode
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white hover:bg-slate-800 dark:hover:bg-slate-100"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            {/* Notification Inbox */}
            <NotificationInbox
              workspaceId={workspaceId}
              jobSummary={jobSummary}
              onNavigate={handleNotificationNavigate}
            />
            
            {/* Mobile menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-9 w-9",
                    isFocusMode
                      ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-48",
                  isFocusMode
                    ? "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                    : "bg-black/80 backdrop-blur-xl border-white/10"
                )}
              >
                <DropdownMenuItem onClick={openNewProjectModal} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openArchivedProjectsModal} className="gap-2">
                  Archived Projects
                </DropdownMenuItem>
                <Link href="/knowledgebase" className="w-full">
                  <DropdownMenuItem className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Knowledge Base
                  </DropdownMenuItem>
                </Link>
                <Link href="/personas" className="w-full">
                  <DropdownMenuItem className="gap-2">
                    <Users className="w-4 h-4" />
                    Personas
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={toggleSidebar} className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Assistant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openSettingsModal} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex">
        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <p className="text-muted-foreground">Loading workspace...</p>
              </motion.div>
            </div>
          ) : (
            <KanbanBoard />
          )}
        </div>

        {/* Sidebar */}
        <ChatSidebar />
      </main>

      {/* Modals */}
      <NewProjectDialog />
      <ProjectDetailModal />
      <WorkspaceSettingsModal />
      {workspace?.id && <ArchivedProjectsModal workspaceId={workspace.id} />}
    </BackgroundWrapper>
  );
}
