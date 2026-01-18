"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { columnVariants, springPresets } from "@/lib/animations";
import type { KanbanColumn as KanbanColumnType, ProjectCard as ProjectCardType } from "@/lib/store";
import { ProjectCard } from "./ProjectCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
  projects: ProjectCardType[];
}

// Glowing orb colors for stage indicators with vertical gradient fade
const columnGlowMap: Record<string, { bg: string; glow: string; accent: string; gradient: string }> = {
  slate: { bg: "bg-slate-400/80", glow: "shadow-[0_0_12px_rgba(148,163,184,0.6)]", accent: "from-slate-400/20", gradient: "from-slate-400/15 via-slate-400/5 to-transparent" },
  teal: { bg: "bg-teal-400/80", glow: "shadow-[0_0_12px_rgba(45,212,191,0.6)]", accent: "from-teal-400/20", gradient: "from-teal-400/15 via-teal-400/5 to-transparent" },
  purple: { bg: "bg-purple-400/80", glow: "shadow-[0_0_12px_rgba(192,132,252,0.6)]", accent: "from-purple-400/20", gradient: "from-purple-400/15 via-purple-400/5 to-transparent" },
  blue: { bg: "bg-blue-400/80", glow: "shadow-[0_0_12px_rgba(96,165,250,0.6)]", accent: "from-blue-400/20", gradient: "from-blue-400/15 via-blue-400/5 to-transparent" },
  pink: { bg: "bg-pink-400/80", glow: "shadow-[0_0_12px_rgba(244,114,182,0.6)]", accent: "from-pink-400/20", gradient: "from-pink-400/15 via-pink-400/5 to-transparent" },
  amber: { bg: "bg-amber-400/80", glow: "shadow-[0_0_12px_rgba(251,191,36,0.6)]", accent: "from-amber-400/20", gradient: "from-amber-400/15 via-amber-400/5 to-transparent" },
  orange: { bg: "bg-orange-400/80", glow: "shadow-[0_0_12px_rgba(251,146,60,0.6)]", accent: "from-orange-400/20", gradient: "from-orange-400/15 via-orange-400/5 to-transparent" },
  green: { bg: "bg-green-400/80", glow: "shadow-[0_0_12px_rgba(74,222,128,0.6)]", accent: "from-green-400/20", gradient: "from-green-400/15 via-green-400/5 to-transparent" },
  cyan: { bg: "bg-cyan-400/80", glow: "shadow-[0_0_12px_rgba(34,211,238,0.6)]", accent: "from-cyan-400/20", gradient: "from-cyan-400/15 via-cyan-400/5 to-transparent" },
  indigo: { bg: "bg-indigo-400/80", glow: "shadow-[0_0_12px_rgba(129,140,248,0.6)]", accent: "from-indigo-400/20", gradient: "from-indigo-400/15 via-indigo-400/5 to-transparent" },
  emerald: { bg: "bg-emerald-400/80", glow: "shadow-[0_0_12px_rgba(52,211,153,0.6)]", accent: "from-emerald-400/20", gradient: "from-emerald-400/15 via-emerald-400/5 to-transparent" },
};

export function KanbanColumn({ column, projects }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const projectIds = projects.map((p) => p.id);
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
      {/* Liquid Glass Lane Container */}
      <motion.div
        animate={{
          scale: isOver ? 1.02 : 1,
          y: isOver ? -4 : 0,
        }}
        transition={springPresets.bouncy}
        className={cn(
          // Pill shape with full rounding
          "rounded-[28px] overflow-hidden relative",
          // Deep glass effect - the "groove" in the table
          "bg-slate-500/[0.04] dark:bg-black/[0.15]",
          "backdrop-blur-xl",
          // Inset shadow creates the "depression" effect - more pronounced
          "shadow-[inset_0_2px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.04)]",
          "dark:shadow-[inset_0_2px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.3)]",
          // Subtle border - light mode gets more definition
          "border border-slate-200/60 dark:border-white/[0.06]",
          // Transition for hover states
          "transition-all duration-300",
          // Hover/drop state enhancements
          isOver && [
            "bg-slate-500/[0.08] dark:bg-black/[0.2]",
            "border-slate-300/80 dark:border-white/[0.1]",
            "shadow-[inset_0_2px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8),0_0_30px_rgba(148,163,184,0.15)]",
            "dark:shadow-[inset_0_2px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12),0_0_40px_rgba(255,255,255,0.05)]",
          ]
        )}
      >
        {/* Vertical gradient fade from top to bottom */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-b pointer-events-none rounded-[28px]",
            colorConfig.gradient
          )}
        />
        
        {/* Gradient accent line at top based on column color */}
        <div 
          className={cn(
            "h-1 w-full bg-gradient-to-r to-transparent opacity-60 relative z-10",
            colorConfig.accent
          )}
        />
        
        {/* Column Header - Inside the glass */}
        <div className="flex items-center justify-between px-4 py-3 relative z-10">
          <div className="flex items-center gap-2.5">
            {/* Glowing orb indicator */}
            <div className={cn(
              "w-2 h-2 rounded-full",
              colorConfig.bg,
              colorConfig.glow
            )} />
            <span className="font-medium text-sm text-foreground/90">{column.displayName}</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              "bg-white/10 dark:bg-white/5",
              "text-muted-foreground/80",
              "font-medium tabular-nums"
            )}>
              {projects.length}
            </span>
          </div>
        </div>

        {/* Column Body - Drop zone */}
        <div
          ref={setNodeRef}
          className="px-3 pb-4 min-h-[200px] sm:min-h-[calc(100vh-300px)] relative z-10"
        >
          <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
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
                <p className="text-xs text-muted-foreground/60 font-medium">
                  Drop projects here
                </p>
                {column.autoTriggerJobs && column.autoTriggerJobs.length > 0 && (
                  <p className="text-[10px] mt-1.5 text-muted-foreground/40 font-mono">
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
}
