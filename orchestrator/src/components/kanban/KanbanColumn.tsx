"use client";

import { memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { columnVariants, springPresets } from "@/lib/animations";
import { useKanbanStore, useUIStore, type KanbanColumn as KanbanColumnType } from "@/lib/store";
import { ProjectCard } from "./ProjectCard";
import { ProjectFlipCard } from "./ProjectFlipCard";
import { TrafficLights } from "@/components/chrome/TrafficLights";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Column display state
export type ColumnViewState = "normal" | "expanded" | "minimized" | "hidden";

interface KanbanColumnProps {
  column: KanbanColumnType;
  viewState?: ColumnViewState;
  onExpand?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
  onRestore?: () => void;
}

// Color configuration for stage indicators
const columnColorMap: Record<string, { bg: string; text: string }> = {
  slate: { bg: "bg-slate-400", text: "text-slate-600 dark:text-slate-400" },
  teal: { bg: "bg-teal-400", text: "text-teal-600 dark:text-teal-400" },
  purple: { bg: "bg-purple-400", text: "text-purple-600 dark:text-purple-400" },
  blue: { bg: "bg-blue-400", text: "text-blue-600 dark:text-blue-400" },
  pink: { bg: "bg-pink-400", text: "text-pink-600 dark:text-pink-400" },
  amber: { bg: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  orange: { bg: "bg-orange-400", text: "text-orange-600 dark:text-orange-400" },
  green: { bg: "bg-green-400", text: "text-green-600 dark:text-green-400" },
  cyan: { bg: "bg-cyan-400", text: "text-cyan-600 dark:text-cyan-400" },
  indigo: { bg: "bg-indigo-400", text: "text-indigo-600 dark:text-indigo-400" },
  emerald: { bg: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400" },
};

// Memoized column component - only re-renders when its own projects change
export const KanbanColumn = memo(function KanbanColumn({
  column,
  viewState = "normal",
  onExpand,
  onMinimize,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
  onRestore,
}: KanbanColumnProps) {
  // Subscribe ONLY to projects in this column using shallow comparison
  const projects = useKanbanStore(
    useShallow((state) => state.projects.filter((p) => p.stage === column.id))
  );
  
  // Get the new project modal action for Inbox column
  const openNewProjectModal = useUIStore((s) => s.openNewProjectModal);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);
  const colorConfig = columnColorMap[column.color] || columnColorMap.slate;

  // Handle hidden state
  if (viewState === "hidden") {
    return null;
  }

  // Handle minimized state - vertical strip with rotated title
  if (viewState === "minimized") {
    return (
      <motion.div
        variants={columnVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-kanban-column={column.id}
        className="shrink-0 w-12"
      >
        <div
          className={cn(
            "h-[calc(100vh-220px)] rounded-2xl border",
            "bg-card dark:bg-card",
            "border-border dark:border-[rgba(255,255,255,0.14)]",
            "shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]",
            "cursor-pointer hover:border-primary/50 transition-colors",
            "flex flex-col items-center py-4"
          )}
          onClick={onRestore}
        >
          {/* Minimized indicator */}
          <div className={cn("w-2 h-2 rounded-full mb-4", colorConfig.bg)} />
          
          {/* Vertical title */}
          <div className="flex-1 flex items-center justify-center">
            <span
              className={cn(
                "font-mono text-xs text-muted-foreground whitespace-nowrap",
                "[writing-mode:vertical-lr] rotate-180"
              )}
            >
              {column.displayName}
            </span>
          </div>
          
          {/* Project count */}
          <span className={cn(
            "text-xs px-2 py-1 rounded-full mt-4",
            "bg-muted text-muted-foreground",
            "font-mono tabular-nums"
          )}>
            {projects.length}
          </span>
        </div>
      </motion.div>
    );
  }

  // Normal and expanded states
  const isExpanded = viewState === "expanded";
  const columnWidth = isExpanded ? "w-[400px] sm:w-[450px]" : "w-[280px] sm:w-72";

  return (
    <motion.div
      variants={columnVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      data-kanban-column={column.id}
      className={cn("shrink-0 min-w-[260px]", columnWidth)}
      layout
    >
      {/* macOS Window-style Column Container */}
      <motion.div
        animate={{
          scale: isOver ? 1.01 : 1,
          y: isOver ? -2 : 0,
        }}
        transition={springPresets.bouncy}
        className={cn(
          // Window styling - matches SkillsMP design tokens
          "rounded-2xl overflow-hidden relative",
          "bg-card dark:bg-card",
          "border border-border dark:border-[rgba(255,255,255,0.14)]",
          "shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.4)]",
          // GPU acceleration
          "will-change-transform transform-gpu",
          // Transition for hover states
          "transition-[border-color,box-shadow] duration-200",
          // Drop state highlight
          isOver && "border-primary/50 shadow-sm"
        )}
      >
        {/* Window Title Bar with Traffic Lights */}
        <div
          className={cn(
            "flex h-9 items-center justify-between rounded-t-2xl border-b px-4",
            "border-border dark:border-[rgba(255,255,255,0.14)]",
            "bg-muted/50 dark:bg-muted/20"
          )}
        >
          {/* Left side: Traffic lights + Title */}
          <div className="flex items-center gap-3">
            <TrafficLights
              size={10}
              interactive
              onClose={() => {}} // Red traffic light is aesthetic only
              onMinimize={onMinimize}
              onMaximize={onExpand}
            />
            <span className="font-mono text-sm text-muted-foreground">
              {column.displayName}
            </span>
          </div>

          {/* Right side: Color indicator + Project count */}
          <div className="flex items-center gap-2">
            {/* Color indicator dot - moved to right side, left of count */}
            <div className={cn("w-2 h-2 rounded-full", colorConfig.bg)} />
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              "bg-muted dark:bg-muted/50",
              "text-muted-foreground",
              "font-mono tabular-nums"
            )}>
              {projects.length}
            </span>
          </div>
        </div>

        {/* Column Body - Drop zone */}
        <div
          ref={setNodeRef}
          className="px-3 py-3 min-h-[calc(100vh-220px)]"
        >
          <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {projects.map((project) => {
                  const isLocked = project.isLocked || 
                    project.activeJobStatus === "running" || 
                    project.activeJobStatus === "pending";
                  return (
                    <ProjectFlipCard 
                      key={project.id} 
                      project={project}
                      disabled={isLocked}
                    >
                      <ProjectCard project={project} />
                    </ProjectFlipCard>
                  );
                })}
              </AnimatePresence>
            </div>
          </SortableContext>

          {/* Empty State - Special for Inbox column */}
          {column.id === "inbox" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
              className={cn(
                "min-h-[80px] flex flex-col items-center justify-center py-4",
                "rounded-lg",
                "border border-dashed",
                "border-border dark:border-[rgba(255,255,255,0.08)]",
                "transition-all duration-200",
                projects.length > 0 && "mt-3", // Match spacing with project cards
                isOver && "border-primary/30 bg-primary/5"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={openNewProjectModal}
                className="gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Project
              </Button>
            </motion.div>
          )}

          {/* Empty State - Default for other columns */}
          {projects.length === 0 && column.id !== "inbox" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
              className={cn(
                "h-full min-h-[200px] flex flex-col items-center justify-center",
                "rounded-xl",
                "border border-dashed",
                "border-border dark:border-[rgba(255,255,255,0.08)]",
                "transition-all duration-200",
                isOver && "border-primary/30 bg-primary/5"
              )}
            >
              <motion.div
                animate={{ y: isOver ? -4 : 0 }}
                transition={springPresets.quick}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground font-mono">
                  Drop projects here
                </p>
                {column.autoTriggerJobs && column.autoTriggerJobs.length > 0 && (
                  <p className="text-[10px] mt-1.5 text-muted-foreground/70 font-mono">
                    $ auto-runs: {column.autoTriggerJobs.join(", ")}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
});
