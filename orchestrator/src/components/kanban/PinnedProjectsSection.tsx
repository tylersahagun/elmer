'use client';

import * as React from 'react';
import { Pin, PinOff, FileText, Layers, Clock } from 'lucide-react';
import {
  motion,
  LayoutGroup,
  AnimatePresence,
  type Transition,
} from 'motion/react';
import { cn } from '@/lib/utils';
import type { ProjectCard as ProjectCardType } from '@/lib/store';
import { useKanbanStore, useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

interface PinnedProjectsSectionProps {
  projects: ProjectCardType[];
  onTogglePin: (projectId: string, isPinned: boolean) => void;
  className?: string;
}

const transition: Transition = { 
  stiffness: 320, 
  damping: 20, 
  mass: 0.8, 
  type: 'spring' 
};

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
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function PinnedProjectsSection({
  projects,
  onTogglePin,
  className,
}: PinnedProjectsSectionProps) {
  const setActiveProject = useKanbanStore((s) => s.setActiveProject);
  const openProjectDetailModal = useUIStore((s) => s.openProjectDetailModal);

  const handleProjectClick = (projectId: string) => {
    setActiveProject(projectId);
    openProjectDetailModal();
  };

  // Projects are already filtered by parent component
  if (projects.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className={cn('mb-6', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Pin className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Pinned Projects
        </span>
        <span className="text-xs text-muted-foreground">
          ({projects.length})
        </span>
      </div>

      <LayoutGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`pinned-${project.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={transition}
                className={cn(
                  'group relative',
                  'rounded-xl border border-purple-200/50 dark:border-purple-500/20',
                  'bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30',
                  'dark:from-purple-900/20 dark:via-slate-800 dark:to-pink-900/10',
                  'shadow-sm hover:shadow-md',
                  'p-3 cursor-pointer',
                  'transition-all duration-200',
                  'hover:border-purple-300/70 dark:hover:border-purple-400/30',
                )}
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Pin indicator */}
                <div className="absolute -top-1.5 -right-1.5">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Pin className="w-3 h-3 text-white fill-white" />
                  </motion.div>
                </div>

                {/* Unpin button (on hover) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'absolute top-1 right-1 w-6 h-6',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity bg-white/80 dark:bg-slate-800/80',
                    'hover:bg-red-100 dark:hover:bg-red-900/30'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(project.id, false);
                  }}
                >
                  <PinOff className="w-3 h-3 text-red-500" />
                </Button>

                {/* Header */}
                <div className="flex items-start justify-between mb-2 pr-6">
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    stageColors[project.stage]
                  )}>
                    {project.stage.charAt(0).toUpperCase() + project.stage.slice(1)}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-medium text-sm mb-1 line-clamp-1 text-slate-900 dark:text-white">
                  {project.name}
                </h4>

                {/* Description */}
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {project.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    {project.documentCount !== undefined && project.documentCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <FileText className="w-3 h-3" />
                        {project.documentCount}
                      </span>
                    )}
                    {project.prototypeCount !== undefined && project.prototypeCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Layers className="w-3 h-3" />
                        {project.prototypeCount}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}

export { type PinnedProjectsSectionProps };
