"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import { cn } from "@/lib/utils";
import { Window } from "@/components/chrome/Window";
import { StatusPill } from "@/components/chrome/StatusPill";
import { CommandChip, CommandText } from "@/components/chrome/CommandChip";
import { useTheme } from "next-themes";
import { 
  Plus, 
  Settings, 
  MessageSquare, 
  Loader2,
  AlertCircle,
  Menu,
  BookOpen,
  Users,
  Sun,
  Moon,
  Archive,
} from "lucide-react";
import { WaveV4D, ElmerWordmark } from "@/components/brand/ElmerLogo";

interface WorkspacePageClientProps {
  workspaceId: string;
}

export function WorkspacePageClient({ workspaceId }: WorkspacePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const setWorkspace = useKanbanStore((s) => s.setWorkspace);
  const setColumns = useKanbanStore((s) => s.setColumns);
  const setProjects = useKanbanStore((s) => s.setProjects);
  const storeWorkspace = useKanbanStore((s) => s.workspace);
  const openNewProjectModal = useUIStore((s) => s.openNewProjectModal);
  const openSettingsModal = useUIStore((s) => s.openSettingsModal);
  const openArchivedProjectsModal = useUIStore((s) => s.openArchivedProjectsModal);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

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

  // Check active state for nav items
  const isKnowledgebaseActive = pathname?.includes('/knowledgebase');
  const isPersonasActive = pathname?.includes('/personas');
  const isWorkspaceActive = !isKnowledgebaseActive && !isPersonasActive;


  if (workspaceError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Window title="error" className="max-w-md">
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Workspace Not Found</h2>
            <p className="text-muted-foreground mb-4 font-mono text-sm">
              The workspace you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
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
      {/* SkillsMP-style Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b",
          "bg-white/95 dark:bg-[#0B0F14]/95",
          "border-[#B8C0CC] dark:border-white/[0.14]",
          "backdrop-blur-sm"
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
          {/* Left: Logo + Status + Path */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <Link href="/">
              <div className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
                <WaveV4D size={32} palette="forest" />
                <ElmerWordmark width={80} height={24} palette="forest" className="hidden sm:block" />
              </div>
            </Link>
            <div className="hidden sm:block h-4 w-px bg-[#B8C0CC] dark:bg-white/[0.14]" />
            <StatusPill status="ready" className="hidden sm:flex" />
            <span className="hidden md:block font-mono text-sm text-muted-foreground truncate max-w-[200px]">
              ~/workspace/{storeWorkspace?.name?.toLowerCase().replace(/\s+/g, '-') || 'loading'}
            </span>
          </div>

          {/* Center: Command chips (Desktop) - Terminal-style nav with colored $ */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 justify-center overflow-x-auto px-4">
            <CommandChip 
              variant="outline" 
              onClick={openNewProjectModal}
            >
              <CommandText command="new" args="--project" />
            </CommandChip>
            
            <Link href="/knowledgebase">
              <CommandChip 
                variant="outline" 
                active={isKnowledgebaseActive}
              >
                <CommandText command="cd" args="/files" />
              </CommandChip>
            </Link>
            
            <Link href="/personas">
              <CommandChip 
                variant="outline" 
                active={isPersonasActive}
              >
                <CommandText command="ls" args="personas/" />
              </CommandChip>
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1.5">
              <Button
                size="sm"
                onClick={openNewProjectModal}
                className="gap-1.5 h-8 lg:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Button>
              
              <CommandChip 
                variant="ghost" 
                onClick={openArchivedProjectsModal}
                className="h-8"
              >
                <Archive className="w-3.5 h-3.5" />
              </CommandChip>
              
              {/* Notification Inbox */}
              <NotificationInbox
                workspaceId={workspaceId}
                jobSummary={jobSummary}
                onNavigate={handleNotificationNavigate}
              />
              
              <CommandChip
                variant="ghost"
                onClick={toggleSidebar}
                className={cn("h-8", sidebarOpen && "bg-accent")}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </CommandChip>
              
              <CommandChip 
                variant="ghost" 
                onClick={openSettingsModal}
                className="h-8"
              >
                <Settings className="w-3.5 h-3.5" />
              </CommandChip>

              <div className="h-4 w-px bg-[#B8C0CC] dark:bg-white/[0.14] mx-1" />
              
              <CommandChip
                variant="ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="w-8 h-8 p-0 justify-center"
              >
                {theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </CommandChip>
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="flex md:hidden items-center gap-1">
              <Button
                size="icon"
                onClick={openNewProjectModal}
                className="h-8 w-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
              
              <NotificationInbox
                workspaceId={workspaceId}
                jobSummary={jobSummary}
                onNavigate={handleNotificationNavigate}
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 rounded-2xl border-border dark:border-[rgba(255,255,255,0.14)]"
                >
                  {/* Primary Actions */}
                  <DropdownMenuItem onClick={openNewProjectModal} className="gap-2 font-mono text-sm">
                    <span className="text-emerald-500">$</span>
                    <span>new --project</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Navigation - with colored command text */}
                  <Link href="/knowledgebase" className="w-full">
                    <DropdownMenuItem className={cn(
                      "gap-2 font-mono text-sm",
                      isKnowledgebaseActive && "bg-accent"
                    )}>
                      <span className="text-emerald-500">$</span>
                      <span>cd</span>
                      <span className="text-muted-foreground">/files</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/personas" className="w-full">
                    <DropdownMenuItem className={cn(
                      "gap-2 font-mono text-sm",
                      isPersonasActive && "bg-accent"
                    )}>
                      <span className="text-emerald-500">$</span>
                      <span>ls</span>
                      <span className="text-muted-foreground">personas/</span>
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Utilities */}
                  <DropdownMenuItem onClick={openArchivedProjectsModal} className="gap-2">
                    <Archive className="w-4 h-4" />
                    Archived Projects
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={toggleSidebar} className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    AI Assistant
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={openSettingsModal} className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    className="gap-2"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex">
        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-57px)]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground font-mono text-sm">Loading workspace...</p>
              </div>
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
    </div>
  );
}
