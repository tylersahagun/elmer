"use client";

import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LinkedTagProps {
  label: string;
  onRemove: () => void;
  isLoading?: boolean;
  variant?: "project" | "persona";
  className?: string;
}

const VARIANT_COLORS = {
  project: "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30",
  persona: "bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30",
};

export function LinkedTag({
  label,
  onRemove,
  isLoading = false,
  variant = "project",
  className,
}: LinkedTagProps) {
  return (
    <Badge
      className={cn(
        "gap-1 pr-1 transition-colors",
        VARIANT_COLORS[variant],
        className
      )}
    >
      <span className="truncate max-w-[120px]">{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={isLoading}
        className="hover:bg-destructive/20 rounded p-0.5 ml-1 transition-colors"
        aria-label={`Remove ${label}`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <X className="w-3 h-3" />
        )}
      </button>
    </Badge>
  );
}
