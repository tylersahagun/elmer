"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";
import {
  useKanbanStore,
  useUIStore,
  type KanbanColumn,
  type ProjectCard,
} from "@/lib/store";
import { KanbanBoard, ArchivedProjectsModal } from "@/components/kanban";
import { NewProjectDialog } from "@/components/kanban/NewProjectDialog";
import { ProjectDetailModal } from "@/components/kanban/ProjectDetailModal";
import { ElmerPanel } from "@/components/chat";
import { NotificationInbox } from "@/components/inbox";
import { InboxPanel } from "@/components/inbox";
import { Button } from "@/components/ui/button";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { Window } from "@/components/chrome/Window";
import { canRunConvexQuery } from "@/lib/auth/convex";
import { getWorkspacePathSegment } from "@/lib/workspaces/path";
import {
  Plus,
  Loader2,
  AlertCircle,
  Archive,
  Inbox,
} from "lucide-react";

interface WorkspacePageClientProps {
  workspaceId: string;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "inbox", displayName: "Inbox", color: "slate", order: 0, enabled: true },
  { id: "discovery", displayName: "Discovery", color: "teal", order: 1, enabled: true },
  { id: "prd", displayName: "PRD", color: "purple", order: 2, enabled: true },
  { id: "design", displayName: "Design", color: "blue", order: 3, enabled: true },
  { id: "prototype", displayName: "Prototype", color: "pink", order: 4, enabled: true },
  { id: "validate", displayName: "Validate", color: "amber", order: 5, enabled: true },
  { id: "tickets", displayName: "Tickets", color: "orange", order: 6, enabled: true },
  { id: "build", displayName: "Build", color: "green", order: 7, enabled: true },
  { id: "alpha", displayName: "Alpha", color: "cyan", order: 8, enabled: true },
  { id: "beta", displayName: "Beta", color: "indigo", order: 9, enabled: true },
  { id: "ga", displayName: "GA", color: "emerald", order: 10, enabled: true },
];

export function WorkspacePageClient({ workspaceId }: WorkspacePageClientProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useCurrentUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const canLoadConvexData = canRunConvexQuery({
    isClerkLoaded: isLoaded,
    isSignedIn,
    isConvexAuthenticated,
  });

  const [inboxOpen, setInboxOpen] = useState(false);
  const setWorkspace = useKanbanStore((s) => s.setWorkspace);
  const setColumns = useKanbanStore((s) => s.setColumns);
  const setProjects = useKanbanStore((s) => s.setProjects);
  const storeWorkspace = useKanbanStore((s) => s.workspace);
  const openNewProjectModal = useUIStore((s) => s.openNewProjectModal);
  const openArchivedProjectsModal = useUIStore(
    (s) => s.openArchivedProjectsModal,
  );

  // Get real-time job status for the inbox
  const { summary: jobSummary } = useRealtimeJobs({
    workspaceId,
    enabled: !!workspaceId,
  });

  // Get user's role in this workspace
  const { isAdmin, canEdit } = useWorkspaceRole(workspaceId);

  // Handle navigation from notifications
  const handleNotificationNavigate = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router],
  );

  useEffect(() => {
    const handleTourMenu = (event: Event) => {
      const detail = (event as CustomEvent<{ open: boolean }>).detail;
      if (typeof detail?.open === "boolean") {
        setMenuOpen(detail.open);
      }
    };

    window.addEventListener("tour:menu", handleTourMenu);
    return () => {
      window.removeEventListener("tour:menu", handleTourMenu);
    };
  }, []);

  const workspace = useConvexQuery(
    api.workspaces.get,
    canLoadConvexData
      ? { workspaceId: workspaceId as Id<"workspaces"> }
      : "skip",
  );
  const projects = useConvexQuery(
    api.projects.list,
    canLoadConvexData
      ? { workspaceId: workspaceId as Id<"workspaces"> }
      : "skip",
  );

  // Update store when data loads
  useEffect(() => {
    if (workspace) {
      setWorkspace({
        id: workspace._id,
        name: workspace.name,
        githubRepo: workspace.githubRepo,
        settings: workspace.settings || {},
      });

      setColumns(DEFAULT_COLUMNS);
    }
  }, [workspace, setWorkspace, setColumns]);

  useEffect(() => {
    if (projects) {
      const mappedProjects: ProjectCard[] = projects.map(
        (p: {
          _id: string;
          name: string;
          description?: string;
          stage: string;
          status: string;
          priority?: string;
          _creationTime: number;
          metadata?: {
            gitBranch?: string;
            baseBranch?: string;
            tldr?: string;
          };
        }) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          stage: p.stage as ProjectCard["stage"],
          status: "active",
          priority:
            p.priority === "P0" ? 0 : p.priority === "P1" ? 1 : p.priority === "P2" ? 2 : 3,
          createdAt: new Date(p._creationTime),
          updatedAt: new Date(p._creationTime),
          documentCount: 0,
          prototypeCount: 0,
          metadata: p.metadata,
        }),
      );
      setProjects(mappedProjects);
    }
  }, [projects, setProjects]);

  const isLoading =
    isSignedIn &&
    (!canLoadConvexData || workspace === undefined || projects === undefined);
  const workspaceSlug = getWorkspacePathSegment({
    slug: workspace?.slug,
    name: workspace?.name ?? storeWorkspace?.name ?? workspaceId,
  });

  if (workspace === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Window title="error" className="max-w-md">
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Workspace Not Found</h2>
            <p className="text-muted-foreground mb-4 font-mono text-sm">
              The workspace you&apos;re looking for doesn&apos;t exist or you
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
      <SimpleNavbar
        path={`~/workspace/${workspaceSlug}`}
        rightContent={
          <>
            <Dialog open={inboxOpen} onOpenChange={setInboxOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Inbox className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Inbox</DialogTitle>
                </DialogHeader>
                <InboxPanel
                  workspaceId={workspaceId}
                  className="max-h-[70vh]"
                />
              </DialogContent>
            </Dialog>
            <NotificationInbox
              workspaceId={workspaceId}
              jobSummary={jobSummary}
              onNavigate={handleNotificationNavigate}
            />
          </>
        }
        menuItems={
          <>
            {canEdit && (
              <DropdownMenuItem
                onClick={openNewProjectModal}
                className="gap-2 font-mono text-sm"
              >
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>New Project</span>
              </DropdownMenuItem>
            )}
            {canEdit && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={openArchivedProjectsModal}
              className="gap-2"
            >
              <Archive className="w-4 h-4" />
              Archived Projects
            </DropdownMenuItem>
            {isAdmin && (
              <Link
                href={`/workspace/${workspaceId}/settings`}
                className="w-full"
              >
                <DropdownMenuItem
                  data-tour="github-settings"
                  className="gap-2 font-mono text-sm"
                >
                  <span className="text-emerald-500">$</span>
                  <span>vim</span>
                  <span className="text-muted-foreground">settings</span>
                </DropdownMenuItem>
              </Link>
            )}
          </>
        }
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
      />

      {/* Main Content */}
      <main className="flex">
        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-57px)]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground font-mono text-sm">
                  Loading workspace...
                </p>
              </div>
            </div>
          ) : (
            <KanbanBoard />
          )}
        </div>

        {/* Sidebar */}
        <ElmerPanel workspaceId={workspaceId} />
      </main>

      {/* Modals */}
      <NewProjectDialog />
      <ProjectDetailModal />
      {workspace?._id && <ArchivedProjectsModal workspaceId={workspace._id} />}
    </div>
  );
}
