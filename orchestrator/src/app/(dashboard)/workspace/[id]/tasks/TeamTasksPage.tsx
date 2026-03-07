"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { getProjectRoute } from "@/lib/projects/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Circle,
  Plus,
  Loader2,
  Trash2,
  Filter,
  FolderOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamTasksPageProps {
  workspaceId: string;
}

const STATUS_ICONS = {
  todo: <Square className="w-4 h-4 text-muted-foreground" />,
  in_progress: <Circle className="w-4 h-4 text-blue-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  blocked: <AlertCircle className="w-4 h-4 text-red-400" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-slate-400",
};

export function TeamTasksPage({ workspaceId }: TeamTasksPageProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("open");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const tasks = useQuery(api.tasks.byWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  const projects = useQuery(api.projects.list, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of projects ?? []) m[p._id] = p.name;
    return m;
  }, [projects]);

  const filtered = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      const statusMatch =
        filterStatus === "all"
          ? true
          : filterStatus === "open"
            ? t.status !== "done"
            : t.status === filterStatus;
      const projectMatch =
        filterProject === "all" ? true : t.projectId === filterProject;
      return statusMatch && projectMatch;
    });
  }, [tasks, filterStatus, filterProject]);

  // Group by project
  const grouped = useMemo(() => {
    const g: Record<string, typeof filtered> = { _none: [] };
    for (const task of filtered) {
      const key = task.projectId ?? "_none";
      if (!g[key]) g[key] = [];
      g[key].push(task);
    }
    return g;
  }, [filtered]);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await createTask({
        workspaceId: workspaceId as Id<"workspaces">,
        title: newTitle.trim(),
      });
      setNewTitle("");
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (taskId: Id<"tasks">, currentStatus: string) => {
    if (currentStatus === "done") {
      await updateTask({ taskId, status: "todo" });
    } else {
      await completeTask({ taskId });
    }
  };

  const openCount = tasks?.filter((t) => t.status !== "done").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar
        path={`~/tasks`}
        rightContent={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New task
          </Button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Tasks</h1>
            {openCount > 0 && (
              <Badge variant="secondary">{openCount} open</Badge>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="flex gap-2 p-3 rounded-xl border border-border bg-card/50">
            <Input
              autoFocus
              placeholder="Task title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setNewTitle("");
                }
              }}
              className="text-sm"
            />
            <Button size="sm" onClick={handleAdd} disabled={adding || !newTitle.trim()}>
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Add"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowAddForm(false); setNewTitle(""); }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Loading */}
        {tasks === undefined && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {tasks?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <CheckSquare className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1 opacity-70">
              Create tasks manually or agents will create them as they work
            </p>
          </div>
        )}

        {/* Grouped task lists */}
        {Object.entries(grouped).map(([projectId, projectTasks]) => {
          if (projectTasks.length === 0) return null;
          const projectName =
            projectId === "_none"
              ? "No project"
              : (projectMap[projectId] ?? "Unknown project");

          return (
            <div key={projectId} className="space-y-2">
              {/* Group header */}
              <button
                onClick={() =>
                  projectId !== "_none" &&
                  router.push(getProjectRoute(projectId, workspaceId))
                }
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  projectId !== "_none" && "hover:text-primary transition-colors",
                )}
              >
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <span>{projectName}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({projectTasks.length})
                </span>
              </button>

              {/* Tasks */}
              <div className="space-y-1.5 ml-6">
                {projectTasks.map((task) => (
                  <div
                    key={task._id}
                    className="group flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                  >
                    <button
                      onClick={() => handleToggle(task._id, task.status)}
                      className="mt-0.5 shrink-0"
                    >
                      {STATUS_ICONS[task.status as keyof typeof STATUS_ICONS] ??
                        STATUS_ICONS.todo}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          task.status === "done" &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {task.priority && (
                          <span
                            className={cn(
                              "text-[10px] font-mono",
                              PRIORITY_COLORS[task.priority] ?? "text-muted-foreground",
                            )}
                          >
                            {task.priority}
                          </span>
                        )}
                        {task.createdBy === "agent" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400"
                          >
                            agent
                          </Badge>
                        )}
                        {task.dueDate && (
                          <span className="text-[10px] text-muted-foreground">
                            Due{" "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeTask({ taskId: task._id })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
