"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { KanbanColumn } from "@/lib/store";
import { cn } from "@/lib/utils";
import { WaveV4D } from "@/components/brand/ElmerLogo";

interface IterationLoopOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  columns: KanbanColumn[];
  className?: string;
}

interface ColumnPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

function buildPath(from: ColumnPoint, to: ColumnPoint) {
  const x1 = from.x + from.width / 2;
  const y1 = from.y + Math.min(56, from.height / 3);
  const x2 = to.x + to.width / 2;
  const y2 = to.y + Math.min(56, to.height / 3);
  const dx = Math.max(80, Math.abs(x2 - x1) / 2.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function IterationLoopOverlay({ containerRef, columns, className }: IterationLoopOverlayProps) {
  const [columnRects, setColumnRects] = useState<Record<string, ColumnPoint>>({});

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateRects = () => {
      const containerRect = container.getBoundingClientRect();
      const next: Record<string, ColumnPoint> = {};
      columns.forEach((column) => {
        const element = container.querySelector(`[data-kanban-column="${column.id}"]`) as HTMLElement | null;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        next[column.id] = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };
      });
      setColumnRects(next);
    };

    updateRects();
    const observer = new ResizeObserver(() => updateRects());
    observer.observe(container);
    window.addEventListener("resize", updateRects);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRects);
    };
  }, [columns, containerRef]);

  const loopEdges = useMemo(() => {
    const edges: Array<{ from: string; to: string; groupId?: string }> = [];
    columns.forEach((column) => {
      if (!column.loopTargets || column.loopTargets.length === 0) return;
      column.loopTargets.forEach((target) => {
        if (target === column.id) return;
        edges.push({ from: column.id, to: target, groupId: column.loopGroupId });
      });
    });
    return edges;
  }, [columns]);

  if (loopEdges.length === 0) {
    return null;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      <svg className="w-full h-full" role="presentation">
        <defs>
          <linearGradient id="loop-wave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
        {loopEdges.map((edge, index) => {
          const from = columnRects[edge.from];
          const to = columnRects[edge.to];
          if (!from || !to) return null;
          const path = buildPath(from, to);
          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <motion.path
                d={path}
                fill="none"
                stroke="url(#loop-wave)"
                strokeWidth={2}
                strokeDasharray="6 8"
                initial={{ strokeDashoffset: 0, opacity: 0.5 }}
                animate={{ strokeDashoffset: -24, opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </g>
          );
        })}
      </svg>
      {loopEdges.map((edge, index) => {
        const from = columnRects[edge.from];
        if (!from) return null;
        const x = from.x + from.width / 2 - 9;
        const y = from.y + 16;
        return (
          <motion.div
            key={`marker-${edge.from}-${edge.to}-${index}`}
            className="absolute"
            style={{ left: x, top: y }}
            animate={{ y: [y, y - 6, y] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            <WaveV4D size={18} />
          </motion.div>
        );
      })}
    </div>
  );
}
