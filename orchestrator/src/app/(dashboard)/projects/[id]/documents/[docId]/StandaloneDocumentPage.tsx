"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentType } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { getDocumentTypeLabel } from "@/lib/documentTypes";
import {
  getProjectDocumentRoute,
  getProjectRoute,
  getProjectRouteWithTab,
} from "@/lib/projects/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Bot,
  Clock,
  ChevronRight,
  ExternalLink,
  Loader2,
  Link2,
  CheckSquare,
  History,
  PanelRight,
  PanelRightClose,
  Signal,
} from "lucide-react";

interface StandaloneDocumentPageProps {
  projectId: string;
  docId: string;
}

export function StandaloneDocumentPage({
  projectId,
  docId,
}: StandaloneDocumentPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<"tasks" | "signals" | "history">("tasks");

  // Load data reactively from Convex
  const document = useQuery(api.documents.get, {
    documentId: docId as Id<"documents">,
  });
  const project = useQuery(api.projects.get, {
    projectId: projectId as Id<"projects">,
  });
  const allDocs = useQuery(api.documents.byProject, {
    projectId: projectId as Id<"projects">,
  });

  useEffect(() => {
    if (!project?.workspaceId || !pathname.startsWith("/projects/")) {
      return;
    }

    const nextHref = getProjectDocumentRoute(
      projectId,
      docId,
      project.workspaceId,
    );
    const query = searchParams.toString();
    router.replace(query ? `${nextHref}?${query}` : nextHref, { scroll: false });
  }, [docId, pathname, project?.workspaceId, projectId, router, searchParams]);

  // Right panel data
  const tasks = useQuery(
    api.tasks.byProject,
    project ? { projectId: project._id } : "skip",
  );
  const signals = useQuery(
    api.signals.list,
    project ? { workspaceId: project.workspaceId } : "skip",
  );

  const updateDoc = useMutation(api.documents.update);

  const handleSave = async (content: string) => {
    if (!document) return;
    setSaving(true);
    try {
      await updateDoc({ documentId: document._id, content });
    } finally {
      setSaving(false);
    }
  };

  if (!document || !project) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleNavbar path="~/document" />
        <div className="flex items-center justify-center h-[calc(100vh-57px)]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const typeLabel = getDocumentTypeLabel(document.type);
  const agentName =
    typeof document.generatedByAgent === "string"
      ? document.generatedByAgent
      : null;

  const sortedDocs = [...(allDocs ?? [])].sort((a, b) =>
    a.type.localeCompare(b.type),
  );

  // Tasks linked to this document or this project
  const linkedTasks = (tasks ?? []).filter(
    (t: { linkedDocumentId?: string | null; projectId?: string | null; _id: string; title: string; status: string }) =>
      (t.linkedDocumentId && t.linkedDocumentId === document._id) ||
      t.projectId === project._id,
  );

  // Recent signals for the project workspace (show latest 10)
  const recentSignals = (signals ?? []).slice(0, 10);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleNavbar
        path={`~/${project.name}/${typeLabel}`}
        rightContent={
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving…
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRightPanelOpen((v) => !v)}
              className="gap-1.5 text-xs"
              title={rightPanelOpen ? "Hide context panel" : "Show context panel"}
            >
              {rightPanelOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRight className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                router.push(getProjectRoute(projectId, project?.workspaceId))
              }
              className="gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3 h-3" />
              Project
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — document navigation */}
        <aside className="w-56 shrink-0 border-r border-border bg-card/50 hidden md:flex flex-col">
          <div className="p-3 border-b border-border">
            <button
              onClick={() =>
                router.push(getProjectRoute(projectId, project?.workspaceId))
              }
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors w-full text-left truncate"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{project.name}</span>
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide px-2 py-1.5">
                Documents
              </p>
              {sortedDocs.map((d) => (
                <button
                  key={d._id}
                  onClick={() =>
                    router.push(
                      getProjectDocumentRoute(
                        projectId,
                        d._id,
                        project?.workspaceId,
                      ),
                    )
                  }
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-colors",
                    d._id === document._id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate text-xs">
                    {getDocumentTypeLabel(d.type)}
                  </span>
                  {d._id === document._id && (
                    <ChevronRight className="w-3 h-3 ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Document header */}
          <div className="px-6 py-4 border-b border-border bg-card/30 shrink-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="text-xs font-mono uppercase tracking-wide"
                  >
                    {typeLabel}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      document.reviewStatus === "approved"
                        ? "border-emerald-500/50 text-emerald-500"
                        : document.reviewStatus === "reviewed"
                          ? "border-blue-500/50 text-blue-500"
                          : "border-muted-foreground/30 text-muted-foreground",
                    )}
                  >
                    {document.reviewStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    v{document.version}
                  </span>
                </div>
                <h1 className="text-xl font-semibold leading-tight">
                  {document.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {agentName && (
                    <span className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      Generated by {agentName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(document._creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Link2 className="w-3 h-3" />
                  Copy link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    router.push(
                      getProjectRouteWithTab(
                        projectId,
                        "documents",
                        project?.workspaceId,
                      ),
                    )
                  }
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Project
                </Button>
              </div>
            </div>
          </div>

          {/* Document body */}
          <div className="flex-1 overflow-hidden p-6">
            <DocumentViewer
              document={{
                id: document._id,
                type: document.type as DocumentType,
                title: document.title,
                content: document.content,
                version: document.version,
                metadata: {
                  reviewStatus: document.reviewStatus as
                    | "draft"
                    | "reviewed"
                    | "approved"
                    | undefined,
                },
                createdAt: new Date(document._creationTime),
                updatedAt: new Date(document._creationTime),
              }}
              workspaceId={project.workspaceId}
              presenceDocumentId={document._id}
              onSave={handleSave}
              className="h-full"
            />
          </div>
        </main>

        {/* Right panel — tasks, signals, history */}
        {rightPanelOpen && (
          <aside className="w-72 shrink-0 border-l border-border bg-card/30 hidden lg:flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-border shrink-0">
              {(
                [
                  { id: "tasks" as const, Icon: CheckSquare, label: "Tasks", count: linkedTasks.length },
                  { id: "signals" as const, Icon: Signal, label: "Signals", count: recentSignals.length },
                  { id: "history" as const, Icon: History, label: "History", count: undefined as number | undefined },
                ]
              ).map(({ id, Icon, label, count }) => (
                <button
                  key={id}
                  onClick={() => setRightTab(id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
                    rightTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0 text-[10px] font-mono">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">

                {/* Tasks tab */}
                {rightTab === "tasks" && (
                  <>
                    {linkedTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No tasks for this project</p>
                      </div>
                    ) : (
                      linkedTasks.map((task: { _id: string; title: string; status: string; linkedDocumentId?: string | null }) => (
                        <div
                          key={task._id}
                          className="p-2.5 rounded-lg border border-border/50 bg-card/30 space-y-1"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs mt-0.5">
                              {task.status === "done" ? "✓" : "○"}
                            </span>
                            <p
                              className={cn(
                                "text-xs leading-snug flex-1",
                                task.status === "done" &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {task.title}
                            </p>
                          </div>
                          {task.linkedDocumentId === document._id && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 border-blue-500/30 text-blue-400"
                            >
                              this doc
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* Signals tab */}
                {rightTab === "signals" && (
                  <>
                    {recentSignals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Signal className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">No signals yet</p>
                      </div>
                    ) : (
                      recentSignals.map((signal: { _id: string; verbatim: string; source: string; severity?: string | null }) => (
                        <div
                          key={signal._id}
                          className="p-2.5 rounded-lg border border-border/50 bg-card/30 space-y-1"
                        >
                          <p className="text-xs leading-snug line-clamp-3">
                            {signal.verbatim}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {signal.source}
                            </span>
                            {signal.severity && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1 py-0",
                                  signal.severity === "critical" &&
                                    "border-red-500/40 text-red-400",
                                  signal.severity === "high" &&
                                    "border-orange-500/40 text-orange-400",
                                )}
                              >
                                {signal.severity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* History tab */}
                {rightTab === "history" && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg border border-border/50 bg-card/30">
                      <div className="flex items-center gap-2 mb-1">
                        <History className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium">Current version</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          v{document.version}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(document._creationTime).toLocaleString()}
                      </p>
                      {agentName && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {agentName}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center py-2">
                      Version diff view coming in Phase 6
                    </p>
                  </div>
                )}

              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}
