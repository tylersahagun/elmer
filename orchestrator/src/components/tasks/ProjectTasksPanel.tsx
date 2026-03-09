"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getProjectDocumentRoute,
  getProjectRouteWithTab,
} from "@/lib/projects/navigation";
import {
  CheckSquare,
  Square,
  Plus,
  Loader2,
  Trash2,
  Circle,
  AlertCircle,
  CheckCircle2,
  Play,
  ExternalLink,
} from "lucide-react";

interface ProjectTasksPanelProps {
  projectId: string;
  workspaceId: string;
}

const STATUS_ICONS = {
  todo: <Square className="w-4 h-4 text-muted-foreground" />,
  in_progress: <Circle className="w-4 h-4 text-blue-400" />,
  done: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  blocked: <AlertCircle className="w-4 h-4 text-red-400" />,
};

const PRIORITY_BADGES: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function ProjectTasksPanel({
  projectId,
  workspaceId,
}: ProjectTasksPanelProps) {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [triggeringTask, setTriggeringTask] = useState<string | null>(null);

  const tasks = useQuery(api.tasks.byProject, {
    projectId: projectId as Id<"projects">,
  });

  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const createAndSchedule = useMutation(api.jobs.createAndSchedule);

  const handleRunAgent = async (task: {
    _id: Id<"tasks">;
    linkedDocumentId?: Id<"documents"> | null;
    linkedJobId?: Id<"jobs"> | null;
    title: string;
  }) => {
    setTriggeringTask(task._id);
    try {
      // Create a new agent job scoped to this project
      const jobId = await createAndSchedule({
        workspaceId: workspaceId as Id<"workspaces">,
        projectId: projectId as Id<"projects">,
        type: "execute_agent_definition",
        input: {
          rawInput: task.title,
          linkedDocumentId: task.linkedDocumentId,
        },
      });
      // Link the new job to the task
      await updateTask({ taskId: task._id, linkedJobId: jobId as Id<"jobs"> });
      router.push(getProjectRouteWithTab(projectId, "tasks", workspaceId));
    } finally {
      setTriggeringTask(null);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await createTask({
        workspaceId: workspaceId as Id<"workspaces">,
        projectId: projectId as Id<"projects">,
        title: newTitle.trim(),
      });
      setNewTitle("");
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (
    taskId: Id<"tasks">,
    currentStatus: string,
  ) => {
    if (currentStatus === "done") {
      await updateTask({ taskId, status: "todo" });
    } else {
      await completeTask({ taskId });
    }
  };

  const open = tasks?.filter((t) => t.status !== "done") ?? [];
  const done = tasks?.filter((t) => t.status === "done") ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium">Tasks</h3>
          {open.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {open.length} open
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="gap-1.5 text-xs"
          data-testid="new-task-button"
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </Button>
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
            data-testid="task-title-input"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            data-testid="add-task-submit"
          >
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {tasks?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs mt-1 opacity-70">
            Add tasks manually or let agents create them automatically
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
              data-testid="task-row"
            >
              <button
                onClick={() => handleToggle(task._id, task.status)}
                className="mt-0.5 shrink-0"
                data-testid="toggle-task-status"
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
                  {task.priority && task.priority !== "medium" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        PRIORITY_BADGES[task.priority] ?? "",
                      )}
                    >
                      {task.priority}
                    </Badge>
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

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  {/* Run agent — show for tasks created by agents or with document links */}
                  {(task.createdBy === "agent" || task.linkedDocumentId) && (
                    <button
                      onClick={() => handleRunAgent(task)}
                      disabled={triggeringTask === task._id}
                      title="Run agent on this task"
                      className="text-muted-foreground hover:text-purple-400 transition-colors"
                    >
                      {triggeringTask === task._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {/* Open linked document */}
                  {task.linkedDocumentId && (
                    <button
                      onClick={() =>
                        router.push(
                          getProjectDocumentRoute(
                            projectId,
                            String(task.linkedDocumentId),
                            workspaceId,
                          ),
                        )
                      }
                      title="Open linked document"
                      className="text-muted-foreground hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeTask({ taskId: task._id })}
                    aria-label={`Remove task ${task.title}`}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    data-testid="remove-task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks (collapsible) */}
      {done.length > 0 && (
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none flex items-center gap-1.5 py-1">
            <span className="text-emerald-500">✓</span>
            {done.length} completed
          </summary>
          <div className="space-y-1.5 mt-2">
            {done.map((task) => (
              <div
                key={task._id}
                className="group/item flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-card/10 opacity-60 hover:opacity-80 transition-opacity"
                data-testid="task-row"
              >
                <button
                  onClick={() => handleToggle(task._id, task.status)}
                  className="mt-0.5 shrink-0"
                  data-testid="toggle-task-status"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
                <p className="text-sm line-through text-muted-foreground flex-1">
                  {task.title}
                </p>
                <button
                  onClick={() => removeTask({ taskId: task._id })}
                  data-testid="remove-task"
                  aria-label={`Remove task ${task.title}`}
                  className="shrink-0 text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
