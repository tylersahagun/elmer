"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useKanbanStore, useUIStore, type KanbanColumn, type ProjectCard } from "@/lib/store";
import { KanbanBoard, WorkspaceSettingsModal, ArchivedProjectsModal } from "@/components/kanban";
import { NewProjectDialog } from "@/components/kanban/NewProjectDialog";
import { ProjectDetailModal } from "@/components/kanban/ProjectDetailModal";
import { ChatSidebar } from "@/components/chat";
import { NotificationInbox } from "@/components/inbox";
import { Button } from "@/components/ui/button";
import { springPresets } from "@/lib/animations";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import { 
  Plus, 
  Settings, 
  MessageSquare, 
  Loader2,
  AlertCircle,
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
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springPresets.bouncy}
              className="flex items-center gap-1"
            >
              <WaveV4D size={44} palette="forest" />
              <ElmerWordmark width={100} height={32} palette="forest" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openNewProjectModal}
              className="gap-2 glass-card border-white/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openArchivedProjectsModal}
            >
              Archived
            </Button>
            
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
              className={sidebarOpen ? "text-purple-400" : ""}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={openSettingsModal}
            >
              <Settings className="w-4 h-4" />
            </Button>
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
    </div>
  );
}
