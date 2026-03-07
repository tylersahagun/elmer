"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { getProjectRoute } from "@/lib/projects/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Square,
  CheckCircle2,
  AlertCircle,
  Circle,
  Plus,
  Loader2,
  Trash2,
  FolderOpen,
} from "lucide-react";

const STATUS_ICONS = {
  todo: <Square className="w-4 h-4 text-muted-foreground" />,
  in_progress: <Circle className="w-4 h-4 text-blue-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  blocked: <AlertCircle className="w-4 h-4 text-red-400" />,
};

export function MyTasksPage() {
  const router = useRouter();
  const { user } = useUser();
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // Tasks assigned to current user
  const myTasks = useQuery(
    api.tasks.byAssigned,
    user?.id ? { assignedTo: user.id } : "skip",
  );

  // Load workspaces to know where to create tasks
  const workspaces = useQuery(api.workspaces.list, {});
  const firstWorkspaceId = workspaces?.[0]?._id;

  // Load projects for name lookup
  const projects = useQuery(
    api.projects.list,
    firstWorkspaceId ? { workspaceId: firstWorkspaceId } : "skip",
  );

  const projectMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of projects ?? []) m[p._id] = p.name;
    return m;
  }, [projects]);

  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const open = useMemo(
    () => (myTasks ?? []).filter((t: { status: string }) => t.status !== "done"),
    [myTasks],
  );
  const done = useMemo(
    () => (myTasks ?? []).filter((t: { status: string }) => t.status === "done"),
    [myTasks],
  );

  const handleAdd = async () => {
    if (!newTitle.trim() || !firstWorkspaceId || !user?.id) return;
    setAdding(true);
    try {
      await createTask({
        workspaceId: firstWorkspaceId,
        title: newTitle.trim(),
        assignedTo: user.id,
      });
      setNewTitle("");
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (taskId: Id<"tasks">, status: string) => {
    if (status === "done") {
      await updateTask({ taskId, status: "todo" });
    } else {
      await completeTask({ taskId });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleNavbar
        path="~/my-tasks"
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          {open.length > 0 && (
            <Badge variant="secondary">{open.length} open</Badge>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="flex gap-2 p-3 rounded-xl border border-border bg-card/50">
            <Input
              autoFocus
              placeholder="What needs to be done?"
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
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={adding || !newTitle.trim()}
            >
              {adding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Loading */}
        {myTasks === undefined && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {myTasks?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <CheckSquare className="w-10 h-10 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Nothing assigned to you</p>
            <p className="text-xs mt-1 opacity-70">
              Tasks assigned to you by agents or teammates appear here
            </p>
          </div>
        )}

        {/* Open tasks */}
        {open.length > 0 && (
          <div className="space-y-1.5">
            {open.map((task) => (
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
                  <p className="text-sm leading-snug">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {task.projectId && projectMap[task.projectId] && (
                      <button
                        onClick={() => {
                          const projectId = task.projectId;
                          if (!projectId) return;
                          router.push(
                            getProjectRoute(
                              projectId,
                              task.workspaceId ? String(task.workspaceId) : undefined,
                            ),
                          );
                        }}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <FolderOpen className="w-3 h-3" />
                        {projectMap[task.projectId]}
                      </button>
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
                        Due {new Date(task.dueDate).toLocaleDateString()}
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
        )}

        {/* Completed tasks */}
        {done.length > 0 && (
          <details open={showDone} onToggle={(e) => setShowDone((e.target as HTMLDetailsElement).open)}>
            <summary className="text-xs text-muted-foreground cursor-pointer select-none flex items-center gap-1.5 py-1">
              <span className="text-emerald-500">✓</span>
              {done.length} completed
            </summary>
            <div className="space-y-1.5 mt-2">
              {done.map((task) => (
                <div
                  key={task._id}
                  className="group/done flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-card/10 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <button
                    onClick={() => handleToggle(task._id, task.status)}
                    className="mt-0.5 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </button>
                  <p className="text-sm line-through text-muted-foreground flex-1">
                    {task.title}
                  </p>
                  <button
                    onClick={() => removeTask({ taskId: task._id })}
                    className="opacity-0 group-hover/done:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </main>
    </div>
  );
}
