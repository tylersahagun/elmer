'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ProjectCard as ProjectCardType } from '@/lib/store';

interface ProjectFlipCardProps {
  project: ProjectCardType;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Simple wrapper for ProjectCard.
 * Previously had a flip effect on hover, but it interfered with drag-and-drop.
 * Now just renders children directly.
 */
export function ProjectFlipCard({ 
  children, 
  className,
}: ProjectFlipCardProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  );
}

export { type ProjectFlipCardProps };
