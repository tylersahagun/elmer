"use client";

import { useMemo } from "react";
import type { KanbanColumn } from "@/lib/store";
import { cn } from "@/lib/utils";

interface IterationLoopLanesProps {
  columns: KanbanColumn[];
  className?: string;
}

export function IterationLoopLanes({ columns, className }: IterationLoopLanesProps) {
  const groups = useMemo(() => {
    const grouped = new Map<string, { start: number; end: number; label: string }>();
    columns.forEach((column, index) => {
      const groupId = column.loopGroupId?.trim();
      if (!groupId) return;
      const existing = grouped.get(groupId);
      if (!existing) {
        grouped.set(groupId, { start: index, end: index, label: groupId });
      } else {
        existing.start = Math.min(existing.start, index);
        existing.end = Math.max(existing.end, index);
      }
    });
    return Array.from(grouped.values()).filter((group) => group.end > group.start);
  }, [columns]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative grid gap-3 mb-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {groups.map((group) => (
        <div
          key={group.label}
          className="relative col-span-full"
          style={{ gridColumnStart: group.start + 1, gridColumnEnd: group.end + 2 }}
        >
          <div className="h-6 rounded-full border border-dashed border-purple-300/60 dark:border-purple-400/30 bg-purple-200/20 dark:bg-purple-900/20 flex items-center px-3">
            <span className="text-[11px] text-purple-700/80 dark:text-purple-300">
              Iteration Loop: {group.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
