"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { buildCursorDeepLink } from "@/lib/cursor/links";
import { springPresets } from "@/lib/animations";
import type { ProjectCard as ProjectCardType } from "@/lib/store";
import { useKanbanStore, useUIStore } from "@/lib/store";
import { 
  FileText, 
  Layers, 
  MoreHorizontal, 
  Clock,
  Loader2,
  Eye,
  Pencil,
  Pause,
  Play,
  Archive,
  Lock,
  AlertCircle,
  CheckCircle,
  Zap,
  User,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: ProjectCardType;
  isDragging?: boolean;
}

const stageColors: Record<string, string> = {
  inbox: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  discovery: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  prd: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  design: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  prototype: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  validate: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  tickets: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  build: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  alpha: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  beta: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  ga: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "now";
}

export function ProjectCard({ project, isDragging = false }: ProjectCardProps) {
  const setActiveProject = useKanbanStore((s) => s.setActiveProject);
  const updateProject = useKanbanStore((s) => s.updateProject);
  const openProjectDetailModal = useUIStore((s) => s.openProjectDetailModal);
  const workspace = useKanbanStore((s) => s.workspace);
  const columns = useKanbanStore((s) => s.columns);
  const stageConfidence = project.metadata?.stageConfidence?.[project.stage];

  // Check if project is locked (has active/pending jobs)
  const isLocked = project.isLocked || 
    project.activeJobStatus === "running" || 
    project.activeJobStatus === "pending";
  
  const hasFailed = project.activeJobStatus === "failed";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: project.id,
    disabled: isLocked, // Disable dragging when locked
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    setActiveProject(project.id);
    openProjectDetailModal();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProject(project.id);
    openProjectDetailModal();
  };

  const handleOpenPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/projects/${project.id}`;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open modal in edit mode (for now, same as view details)
    setActiveProject(project.id);
    openProjectDetailModal();
  };

  const cursorLink = buildCursorDeepLink({
    template: workspace?.settings?.cursorDeepLinkTemplate,
    repo: workspace?.githubRepo,
    branch: project.metadata?.gitBranch,
  });

  const currentColumn = columns.find((column) => column.id === project.stage);
  const automationMode = workspace?.settings?.automationMode || "manual";
  const isHumanCheckpoint = Boolean(currentColumn?.humanInLoop);
  const isStopStage =
    automationMode === "auto_to_stage" && workspace?.settings?.automationStopStage === project.stage;

  const automationIndicators = (() => {
    if (automationMode === "manual") {
      return [{ label: "Manual rail", icon: Pause, className: "text-slate-500" }];
    }
    const indicators = [];
    indicators.push({ label: "Auto rail", icon: Zap, className: "text-emerald-500" });
    if (isHumanCheckpoint) {
      indicators.push({ label: "Human checkpoint", icon: User, className: "text-amber-500" });
    }
    if (isStopStage) {
      indicators.push({ label: "Stop stage", icon: Flag, className: "text-rose-500" });
    }
    return indicators;
  })();

  const handleOpenCursor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cursorLink) return;
    window.location.href = cursorLink;
  };

  const handleStatusChange = async (e: React.MouseEvent, newStatus: "active" | "paused" | "archived") => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        updateProject(project.id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  };

  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isLocked ? {} : listeners)} // Only attach drag listeners if not locked
      onClick={handleClick}
      className={cn(
        "group relative",
        isLocked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
        "rounded-xl border",
        // Border color based on state
        hasFailed 
          ? "border-red-400/50 dark:border-red-500/30" 
          : isLocked 
            ? "border-purple-400/50 dark:border-purple-500/30" 
            : "border-slate-200 dark:border-slate-700",
        "bg-white dark:bg-slate-800",
        "shadow-sm hover:shadow-md",
        "p-3",
        "text-slate-900 dark:text-slate-100",
        "transition-all duration-200",
        !isLocked && "hover:bg-slate-50 dark:hover:bg-slate-700/50",
        !isLocked && "hover:scale-[1.01] hover:-translate-y-0.5",
        isBeingDragged && [
          "opacity-50",
          "shadow-[0_20px_60px_rgba(0,0,0,0.15)]",
          "z-50",
        ],
        // Locked/processing state
        isLocked && "ring-2 ring-purple-400/30 dark:ring-purple-500/20",
        hasFailed && "ring-2 ring-red-400/30 dark:ring-red-500/20",
      )}
    >
      {/* Locked overlay indicator */}
      {isLocked && (
        <div className="absolute inset-0 rounded-xl bg-purple-500/5 pointer-events-none">
          <div className="absolute top-2 right-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-4 h-4 text-purple-400" />
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Failed state overlay */}
      {hasFailed && (
        <div className="absolute inset-0 rounded-xl bg-red-500/5 pointer-events-none" />
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded",
          stageColors[project.stage]
        )}>
          {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
        </span>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(project.updatedAt)}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={handleViewDetails} className="gap-2">
                <Eye className="w-3.5 h-3.5" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenPage} className="gap-2">
                <FileText className="w-3.5 h-3.5" />
                Open Project Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleOpenCursor}
                className="gap-2"
                disabled={!cursorLink}
              >
                <Image
                  src="/cursor/cursor-cube-light.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 dark:invert"
                />
                View in Cursor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} className="gap-2">
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {project.status === "active" ? (
                <DropdownMenuItem onClick={(e) => handleStatusChange(e, "paused")} className="gap-2">
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </DropdownMenuItem>
              ) : project.status === "paused" ? (
                <DropdownMenuItem onClick={(e) => handleStatusChange(e, "active")} className="gap-2">
                  <Play className="w-3.5 h-3.5" />
                  Resume
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem 
                onClick={(e) => handleStatusChange(e, "archived")} 
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mb-2">
        {automationIndicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <span
              key={indicator.label}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 bg-white/40 dark:bg-slate-900/30"
            >
              <Icon className={cn("w-3 h-3", indicator.className)} />
              <span>{indicator.label}</span>
            </span>
          );
        })}
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm mb-1 line-clamp-1">{project.name}</h4>
      
      {/* Description */}
      {project.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {project.description}
        </p>
      )}

      {stageConfidence?.score !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Alignment</span>
            <span>{Math.round(stageConfidence.score * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(stageConfidence.score * 100)}%` }}
              transition={springPresets.gentle}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {project.documentCount !== undefined && project.documentCount > 0 && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {project.documentCount}
            </span>
          )}
          {project.prototypeCount !== undefined && project.prototypeCount > 0 && (
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {project.prototypeCount}
            </span>
          )}
        </div>

        {/* Job Status Indicator */}
        {project.activeJobType && (
          <JobStatusIndicator 
            status={project.activeJobStatus}
            jobType={project.activeJobType}
          />
        )}
      </div>

      {/* Progress Bar */}
      {project.activeJobProgress !== undefined && project.activeJobProgress > 0 && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className={cn(
              "h-full rounded-full",
              hasFailed 
                ? "bg-gradient-to-r from-red-500 to-orange-500" 
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${project.activeJobProgress * 100}%` }}
            transition={springPresets.gentle}
          />
        </div>
      )}
      
      {/* Error message tooltip */}
      {hasFailed && project.lastJobError && (
        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 line-clamp-2">
            {project.lastJobError}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper to format job type for display
function formatJobType(type: string): string {
  const typeMap: Record<string, string> = {
    analyze_transcript: "Analyzing",
    generate_prd: "PRD",
    generate_design_brief: "Design Brief",
    generate_engineering_spec: "Eng Spec",
    generate_gtm_brief: "GTM Brief",
    build_prototype: "Prototype",
    run_jury_evaluation: "Jury Eval",
    generate_tickets: "Tickets",
    score_stage_alignment: "Alignment",
    create_feature_branch: "Branch",
  };
  return typeMap[type] || type;
}

// Job Status Indicator Component
function JobStatusIndicator({ 
  status, 
  jobType 
}: { 
  status?: string; 
  jobType: string;
}) {
  const jobName = formatJobType(jobType);

  // Pending state - waiting for Cursor AI to process
  if (status === "pending") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Clock className="w-3 h-3 text-amber-400" />
        </motion.div>
        <span className="text-xs text-amber-400 font-medium">
          Waiting for Agent
        </span>
      </div>
    );
  }

  // Running state - Cursor AI is processing
  if (status === "running") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
        <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
        <span className="text-xs text-purple-400 font-medium">
          {jobName}...
        </span>
      </div>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
        <AlertCircle className="w-3 h-3 text-red-400" />
        <span className="text-xs text-red-400 font-medium">
          {jobName} Failed
        </span>
      </div>
    );
  }

  // Completed state (briefly shown)
  if (status === "completed") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-3 h-3 text-green-400" />
        <span className="text-xs text-green-400 font-medium">
          {jobName} Done
        </span>
      </div>
    );
  }

  // Default/unknown state
  return (
    <div className="flex items-center gap-1.5">
      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
      <span className="text-xs text-purple-400">
        {jobName}
      </span>
    </div>
  );
}

// Drag overlay version (shown while dragging)
export function ProjectCardOverlay({ project }: { project: ProjectCardType }) {
  return (
    <div className={cn(
      "rounded-xl border border-white/30 dark:border-white/20",
      "bg-white/80 dark:bg-slate-800/90",
      "backdrop-blur-xl",
      "shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
      "p-3",
      "rotate-2 scale-105",
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded",
          stageColors[project.stage]
        )}>
          {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
        </span>
      </div>
      <h4 className="font-medium text-sm">{project.name}</h4>
    </div>
  );
}
