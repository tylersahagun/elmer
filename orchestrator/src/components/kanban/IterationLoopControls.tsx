"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type LoopViewMode = "off" | "overlay" | "lanes";

interface IterationLoopControlsProps {
  mode: LoopViewMode;
  onChange: (mode: LoopViewMode) => void;
  className?: string;
}

export function IterationLoopControls({ mode, onChange, className }: IterationLoopControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        variant={mode === "off" ? "default" : "outline"}
        onClick={() => onChange("off")}
      >
        Loops Off
      </Button>
      <Button
        size="sm"
        variant={mode === "overlay" ? "default" : "outline"}
        onClick={() => onChange("overlay")}
      >
        Wave Overlay
      </Button>
      <Button
        size="sm"
        variant={mode === "lanes" ? "default" : "outline"}
        onClick={() => onChange("lanes")}
      >
        Lane View
      </Button>
    </div>
  );
}
