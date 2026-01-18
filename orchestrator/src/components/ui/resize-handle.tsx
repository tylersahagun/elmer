"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function ResizeHandle({
  onMouseDown,
  isResizing = false,
  direction = "horizontal",
  className,
}: ResizeHandleProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        "group transition-all z-20",
        isHorizontal
          ? "absolute top-0 w-2 h-full cursor-col-resize hover:bg-purple-500/20 bg-white/5"
          : "absolute left-0 h-2 w-full cursor-row-resize hover:bg-purple-500/20 bg-white/5",
        isResizing && "bg-purple-500/30",
        className
      )}
    >
      {/* Visual indicator line - always slightly visible */}
      <div
        className={cn(
          "absolute rounded-full transition-all",
          isHorizontal
            ? "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-white/20 group-hover:bg-purple-400/80 group-hover:h-24"
            : "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-0.5 w-16 bg-white/20 group-hover:bg-purple-400/80 group-hover:w-24",
          isResizing && "bg-purple-400/80 h-24"
        )}
      />

      {/* Drag dots indicator - visible on hover */}
      <div
        className={cn(
          "absolute flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
          isHorizontal
            ? "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex-col"
            : "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex-row",
          isResizing && "opacity-100"
        )}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full bg-purple-400/80 w-1 h-1"
          />
        ))}
      </div>
    </div>
  );
}
