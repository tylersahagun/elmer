"use client";

import { memo, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { columnVariants, springPresets } from "@/lib/animations";
import { useKanbanStore, type KanbanColumn as KanbanColumnType } from "@/lib/store";
import { ProjectCard } from "./ProjectCard";
import { ProjectFlipCard } from "./ProjectFlipCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
}

// Glowing orb colors for stage indicators - no gradients, just the orb
const columnGlowMap: Record<string, { bg: string; glow: string }> = {
  slate: { bg: "bg-slate-400/80", glow: "shadow-[0_0_12px_rgba(148,163,184,0.6)]" },
  teal: { bg: "bg-teal-400/80", glow: "shadow-[0_0_12px_rgba(45,212,191,0.6)]" },
  purple: { bg: "bg-purple-400/80", glow: "shadow-[0_0_12px_rgba(192,132,252,0.6)]" },
  blue: { bg: "bg-blue-400/80", glow: "shadow-[0_0_12px_rgba(96,165,250,0.6)]" },
  pink: { bg: "bg-pink-400/80", glow: "shadow-[0_0_12px_rgba(244,114,182,0.6)]" },
  amber: { bg: "bg-amber-400/80", glow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]" },
  orange: { bg: "bg-orange-400/80", glow: "shadow-[0_0_12px_rgba(251,146,60,0.6)]" },
  green: { bg: "bg-green-400/80", glow: "shadow-[0_0_12px_rgba(74,222,128,0.6)]" },
  cyan: { bg: "bg-cyan-400/80", glow: "shadow-[0_0_12px_rgba(34,211,238,0.6)]" },
  indigo: { bg: "bg-indigo-400/80", glow: "shadow-[0_0_12px_rgba(129,140,248,0.6)]" },
  emerald: { bg: "bg-emerald-400/80", glow: "shadow-[0_0_12px_rgba(52,211,153,0.6)]" },
};

// Memoized column component - only re-renders when its own projects change
export const KanbanColumn = memo(function KanbanColumn({ column }: KanbanColumnProps) {
  // Subscribe ONLY to projects in this column using shallow comparison
  const projects = useKanbanStore(
    useShallow((state) => state.projects.filter((p) => p.stage === column.id))
  );
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);
  const colorConfig = columnGlowMap[column.color] || columnGlowMap.slate;

  return (
    <motion.div
      variants={columnVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      data-kanban-column={column.id}
      className="flex-shrink-0 w-[280px] sm:w-72 min-w-[260px]"
    >
      {/* Liquid Glass Lane Container - Pure glassmorphism, optimized for scroll */}
      <motion.div
        animate={{
          scale: isOver ? 1.02 : 1,
          y: isOver ? -4 : 0,
        }}
        transition={springPresets.bouncy}
        className={cn(
          // Pill shape with full rounding
          "rounded-[28px] overflow-hidden relative",
          // Glass effect with GPU acceleration hint
          "bg-slate-900/40 dark:bg-slate-950/50",
          "backdrop-blur-sm", // Reduced from md to sm for better performance
          // Promote to own layer for scroll performance
          "will-change-transform transform-gpu",
          // Subtle border for glass edge definition
          "border border-white/[0.08]",
          // Transition for hover states only (not during scroll)
          "transition-[border-color,box-shadow] duration-300",
          // Hover/drop state - slight highlight
          isOver && [
            "border-white/[0.15]",
            "shadow-[0_0_30px_rgba(255,255,255,0.05)]",
          ]
        )}
      >
        
        {/* Column Header - Inside the glass */}
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Glowing orb indicator */}
            <div className={cn(
              "w-2 h-2 rounded-full",
              colorConfig.bg,
              colorConfig.glow
            )} />
            <span className="font-medium text-sm text-white">{column.displayName}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              "bg-white/15",
              "text-white/80",
              "font-medium tabular-nums"
            )}>
              {projects.length}
            </span>
          </div>
        </div>

        {/* Column Body - Drop zone */}
        <div
          ref={setNodeRef}
          className="px-3 pb-4 min-h-[calc(100vh-220px)] relative z-10"
        >
          <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
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
            </div>
          </SortableContext>

          {/* Empty State - More integrated feel */}
          {projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
              className={cn(
                "h-full min-h-[200px] flex flex-col items-center justify-center",
                "rounded-2xl",
                // Subtle inner groove effect
                "bg-gradient-to-b from-white/[0.02] to-transparent",
                "dark:from-black/[0.05]",
                "border border-dashed",
                "border-white/[0.06] dark:border-white/[0.04]",
                "transition-all duration-300",
                isOver && [
                  "border-white/20 dark:border-white/10",
                  "bg-gradient-to-b from-white/[0.05] to-transparent",
                  "dark:from-white/[0.03]",
                ]
              )}
            >
              <motion.div
                animate={{ y: isOver ? -4 : 0 }}
                transition={springPresets.quick}
                className="text-center"
              >
                <p className="text-xs text-white/70 font-medium">
                  Drop projects here
                </p>
                {column.autoTriggerJobs && column.autoTriggerJobs.length > 0 && (
                  <p className="text-[10px] mt-1.5 text-white/50 font-mono">
                    Auto-runs: {column.autoTriggerJobs.join(", ")}
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
