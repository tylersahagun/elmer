"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { getProjectRoute } from "@/lib/projects/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Inbox,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
  FolderOpen,
  CheckSquare,
  Loader2,
  ArrowRight,
  FileText,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface InboxItem {
  _id: Id<"inboxItems">;
  _creationTime: number;
  workspaceId: Id<"workspaces">;
  type: string;
  source: string;
  title: string;
  rawContent: string;
  processedContent?: string | null;
  status: string;
  tldr?: string | null;
  impactScore?: number | null;
  aiSummary?: string | null;
  suggestsVisionUpdate?: boolean | null;
  projectDirectionChange?: {
    projectId?: string;
    changeType: string;
    rationale: string;
    affectedArea: string;
    confidence?: number;
  } | null;
  extractedProblems?: Array<{
    problem: string;
    severity: string;
    quote?: string;
  }> | null;
  assignedProjectId?: Id<"projects"> | null;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  transcript: MessageSquare,
  document: FileText,
  signal: AlertTriangle,
  feedback: Users,
};

const TYPE_COLORS: Record<string, string> = {
  transcript: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  document: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  signal: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  feedback: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

// ── Impact score bar ──────────────────────────────────────────────────────────

function ImpactBar({ score }: { score: number }) {
  const color =
    score > 85
      ? "bg-red-500"
      : score > 70
        ? "bg-orange-500"
        : score > 50
          ? "bg-yellow-500"
          : "bg-slate-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{score}</span>
    </div>
  );
}

// ── Review Impact slide-over (GTM-52b) ────────────────────────────────────────

function ReviewImpactPanel({
  item,
  projects,
  onClose,
  onAccept,
  onIgnore,
}: {
  item: InboxItem;
  projects: Array<{ _id: string; name: string }>;
  onClose: () => void;
  onAccept: (itemId: Id<"inboxItems">) => void;
  onIgnore: (itemId: Id<"inboxItems">) => void;
}) {
  const dc = item.projectDirectionChange;
  const matchedProject = projects.find((p) => p._id === dc?.projectId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="review-impact-panel">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-[480px] max-w-full bg-card border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Review Direction Change</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This signal suggests a change to project direction. Accept to log
              it, or ignore to dismiss.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-5">
            {/* Signal */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Signal
              </p>
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-sm leading-relaxed">{item.rawContent.slice(0, 400)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Source: {item.source}
                </p>
              </div>
            </div>

            {/* TL;DR */}
            {item.tldr && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  TL;DR
                </p>
                <p className="text-sm font-medium leading-snug">{item.tldr}</p>
              </div>
            )}

            {/* Affected project */}
            {matchedProject && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Affects project
                </p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card">
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{matchedProject.name}</span>
                </div>
              </div>
            )}

            {/* Direction change */}
            {dc && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggested change
                </p>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      dc.changeType === "pivot" && "border-red-500/40 text-red-400",
                      dc.changeType === "scope_expansion" && "border-orange-500/40 text-orange-400",
                      dc.changeType === "deprioritize" && "border-yellow-500/40 text-yellow-400",
                    )}
                  >
                    {dc.changeType?.replace("_", " ")}
                  </Badge>
                  {dc.affectedArea && (
                    <span className="text-xs text-muted-foreground">
                      → {dc.affectedArea}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-sm leading-relaxed">{dc.rationale}</p>
                </div>
              </div>
            )}

            {/* Extracted problems */}
            {item.extractedProblems && item.extractedProblems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Problems identified
                </p>
                <div className="space-y-1.5">
                  {item.extractedProblems.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span
                        className={cn(
                          "shrink-0 font-mono mt-0.5",
                          p.severity === "critical" && "text-red-400",
                          p.severity === "high" && "text-orange-400",
                          p.severity === "medium" && "text-yellow-400",
                          p.severity === "low" && "text-slate-400",
                        )}
                      >
                        [{p.severity}]
                      </span>
                      <span className="text-muted-foreground leading-snug">{p.problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            data-testid="accept-direction-change"
            className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onAccept(item._id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept
          </Button>
          <Button
            data-testid="ignore-direction-change"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => onIgnore(item._id)}
          >
            <X className="w-4 h-4" />
            Ignore
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Inbox item card ───────────────────────────────────────────────────────────

function InboxCard({
  item,
  projects,
  workspaceId,
  onDismiss,
  onAssign,
  onReviewImpact,
  onCreateTask,
}: {
  item: InboxItem;
  projects: Array<{ _id: string; name: string }>;
  workspaceId: string;
  onDismiss: (id: Id<"inboxItems">) => void;
  onAssign: (id: Id<"inboxItems">, projectId: Id<"projects">) => void;
  onReviewImpact: (item: InboxItem) => void;
  onCreateTask: (item: InboxItem) => void;
}) {
  const router = useRouter();
  const [showRaw, setShowRaw] = useState(false);
  const TypeIcon = TYPE_ICONS[item.type] ?? AlertTriangle;
  const typeColor = TYPE_COLORS[item.type] ?? TYPE_COLORS.signal;
  const matchedProject = projects.find((p) => p._id === item.assignedProjectId);
  const isProcessing = item.status === "processing";

  return (
    <div
      data-testid="inbox-item"
      data-impact-level={
        item.suggestsVisionUpdate ? "direction-change" : (item.impactScore ?? 0) > 70 ? "high" : "normal"
      }
      className={cn(
        "rounded-2xl border p-4 space-y-3 transition-colors",
        item.suggestsVisionUpdate
          ? "border-amber-500/30 bg-amber-500/5"
          : (item.impactScore ?? 0) > 70
            ? "border-red-500/20 bg-red-500/5"
            : "border-border bg-card/30",
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn("text-xs gap-1", typeColor)}>
            <TypeIcon className="w-3 h-3" />
            {item.type}
          </Badge>
          {item.suggestsVisionUpdate && (
            <Badge
              variant="outline"
              className="text-xs border-amber-500/50 text-amber-400 bg-amber-500/10 gap-1"
            >
              <Zap className="w-3 h-3" />
              direction signal
            </Badge>
          )}
          {(item.impactScore ?? 0) > 70 && !item.suggestsVisionUpdate && (
            <Badge
              variant="outline"
              className="text-xs border-red-500/40 text-red-400 bg-red-500/10"
            >
              high impact
            </Badge>
          )}
          {isProcessing && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              analyzing…
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.impactScore != null && (
            <div data-testid="impact-badge" data-impact-level={(item.impactScore ?? 0) > 70 ? "high" : "normal"}>
              <ImpactBar score={item.impactScore} />
            </div>
          )}
          <button
            data-testid="dismiss-inbox-item"
            onClick={() => onDismiss(item._id)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        {item.tldr ? (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {item.tldr}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
            {item.rawContent.slice(0, 120)}
          </p>
        )}
      </div>

      {/* Matched project */}
      {matchedProject && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FolderOpen className="w-3 h-3" />
          <button
            onClick={() =>
              router.push(getProjectRoute(String(matchedProject._id), workspaceId))
            }
            className="hover:text-primary transition-colors"
          >
            {matchedProject.name}
          </button>
          {item.projectDirectionChange?.confidence != null && (
            <span className="font-mono">
              ({Math.round(item.projectDirectionChange.confidence * 100)}% match)
            </span>
          )}
        </div>
      )}

      {/* Raw content toggle */}
      <button
        data-testid="toggle-raw-content"
        onClick={() => setShowRaw((v) => !v)}
        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      >
        {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showRaw ? "Hide" : "Show"} raw content
      </button>
      {showRaw && (
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap">
            {item.rawContent.slice(0, 600)}
            {item.rawContent.length > 600 && "…"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Source: {item.source}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        {item.suggestsVisionUpdate && item.projectDirectionChange && (
          <Button
            data-testid="review-impact-button"
            size="sm"
            variant="outline"
            onClick={() => onReviewImpact(item)}
            className="gap-1.5 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 h-7"
          >
            <Zap className="w-3 h-3" />
            Review Impact
          </Button>
        )}
        <Button
          data-testid="create-task-button"
          size="sm"
          variant="outline"
          onClick={() => onCreateTask(item)}
          className="gap-1.5 text-xs h-7"
        >
          <CheckSquare className="w-3 h-3" />
          Create Task
        </Button>
        {!matchedProject && projects.length > 0 && (
          <select
            data-testid="link-project-select"
            className="text-xs rounded-lg border border-border bg-background px-2 h-7 text-muted-foreground hover:text-foreground transition-colors"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value)
                onAssign(item._id, e.target.value as Id<"projects">);
            }}
          >
            <option value="" disabled>
              Link to project…
            </option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function InboxPageClient({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [reviewItem, setReviewItem] = useState<InboxItem | null>(null);

  const items = useQuery(api.inboxItems.listByPriority, {
    workspaceId: workspaceId as Id<"workspaces">,
  }) as InboxItem[] | undefined;

  const counts = useQuery(api.inboxItems.counts, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  const projects = useQuery(api.projects.list, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  const dismissMutation = useMutation(api.inboxItems.dismiss);
  const assignMutation = useMutation(api.inboxItems.assignToProject);
  const acceptMutation = useMutation(api.inboxItems.acceptDirectionChange);
  const createTask = useMutation(api.tasks.create);

  const handleDismiss = async (id: Id<"inboxItems">) => {
    await dismissMutation({ itemId: id });
    toast.success("Dismissed");
  };

  const handleAssign = async (id: Id<"inboxItems">, projectId: Id<"projects">) => {
    await assignMutation({ itemId: id, projectId });
    toast.success("Linked to project");
  };

  const handleAcceptDirectionChange = async (id: Id<"inboxItems">) => {
    await acceptMutation({ itemId: id });
    setReviewItem(null);
    toast.success("Direction change accepted");
  };

  const handleIgnoreDirectionChange = async (id: Id<"inboxItems">) => {
    await dismissMutation({ itemId: id });
    setReviewItem(null);
    toast.success("Dismissed");
  };

  const handleCreateTask = async (item: InboxItem) => {
    if (!item.assignedProjectId) {
      toast.error("Link to a project first");
      return;
    }
    await createTask({
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: item.assignedProjectId,
      title: item.tldr ?? item.title,
      description: item.rawContent.slice(0, 300),
      sourceSignalId: undefined,
    });
    toast.success("Task created");
  };

  const activeItems = items?.filter((i) => i.status !== "dismissed") ?? [];
  const directionItems = activeItems.filter((i) => i.suggestsVisionUpdate);
  const highImpactItems = activeItems.filter(
    (i) => !i.suggestsVisionUpdate && (i.impactScore ?? 0) > 70,
  );
  const standardItems = activeItems.filter(
    (i) => !i.suggestsVisionUpdate && (i.impactScore ?? 0) <= 70,
  );

  const projectList = (projects ?? []).map((p: { _id: string; name: string }) => ({
    _id: p._id,
    name: p.name,
  }));

  const cardProps = {
    projects: projectList,
    workspaceId,
    onDismiss: handleDismiss,
    onAssign: handleAssign,
    onReviewImpact: setReviewItem,
    onCreateTask: handleCreateTask,
  };

  return (
    <div className="min-h-screen bg-background" data-testid="inbox-page">
      <SimpleNavbar
        path="~/inbox"
        rightContent={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
            className="text-xs gap-1.5"
          >
            <ArrowRight className="w-3 h-3 rotate-180" />
            Workspace
          </Button>
        }
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap" data-testid="inbox-header">
          <div className="flex items-center gap-3">
            <Inbox className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Inbox</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {counts?.highImpact != null && counts.highImpact > 0 && (
              <Badge variant="outline" className="text-xs border-red-500/40 text-red-400 gap-1">
                <AlertTriangle className="w-3 h-3" />
                {counts.highImpact} high impact
              </Badge>
            )}
            {counts?.directionChange != null && counts.directionChange > 0 && (
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 gap-1">
                <Zap className="w-3 h-3" />
                {counts.directionChange} direction signal{counts.directionChange > 1 ? "s" : ""}
              </Badge>
            )}
            {counts?.pending != null && (
              <Badge variant="secondary" className="text-xs">
                {counts.pending} pending
              </Badge>
            )}
          </div>
        </div>

        {/* Loading */}
        {items === undefined && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {items?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground" data-testid="empty-inbox">
            <Inbox className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Inbox is empty</p>
            <p className="text-xs mt-1 opacity-70">
              New signals are automatically analyzed and appear here
            </p>
          </div>
        )}

        {/* ⚡ SUGGESTS DIRECTION CHANGE */}
        {directionItems.length > 0 && (
          <section className="space-y-3" data-testid="direction-change-section">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                Suggests Direction Change
              </h2>
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">
                {directionItems.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {directionItems.map((item) => (
                <InboxCard key={item._id} item={item} {...cardProps} />
              ))}
            </div>
          </section>
        )}

        {/* 🔴 HIGH IMPACT */}
        {highImpactItems.length > 0 && (
          <section className="space-y-3" data-testid="high-impact-section">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide">
                High Impact
              </h2>
              <Badge variant="outline" className="text-xs border-red-500/40 text-red-400">
                {highImpactItems.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {highImpactItems.map((item) => (
                <InboxCard key={item._id} item={item} {...cardProps} />
              ))}
            </div>
          </section>
        )}

        {/* Standard items */}
        {standardItems.length > 0 && (
          <section className="space-y-3" data-testid="standard-inbox-section">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                New
              </h2>
              <Badge variant="secondary" className="text-xs">
                {standardItems.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {standardItems.map((item) => (
                <InboxCard key={item._id} item={item} {...cardProps} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Review Impact slide-over (GTM-52b) */}
      {reviewItem && (
        <ReviewImpactPanel
          item={reviewItem}
          projects={projectList}
          onClose={() => setReviewItem(null)}
          onAccept={handleAcceptDirectionChange}
          onIgnore={handleIgnoreDirectionChange}
        />
      )}
    </div>
  );
}
