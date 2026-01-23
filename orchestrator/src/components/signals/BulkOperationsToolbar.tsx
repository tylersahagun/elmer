"use client";

import { Link2, Unlink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkOperationsToolbarProps {
  selectedCount: number;
  onBulkLink: () => void;
  onBulkUnlink: () => void;
  onClearSelection: () => void;
}

export function BulkOperationsToolbar({
  selectedCount,
  onBulkLink,
  onBulkUnlink,
  onClearSelection,
}: BulkOperationsToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedCount} signal{selectedCount !== 1 ? "s" : ""} selected
      </span>

      <div className="h-4 w-px bg-border" />

      <Button
        size="sm"
        variant="outline"
        onClick={onBulkLink}
        className="gap-1.5"
      >
        <Link2 className="w-3.5 h-3.5" />
        Link to Project
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={onBulkUnlink}
        className="gap-1.5 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50"
      >
        <Unlink className="w-3.5 h-3.5" />
        Unlink
      </Button>

      <div className="flex-1" />

      <Button
        size="sm"
        variant="ghost"
        onClick={onClearSelection}
        className="gap-1.5 text-muted-foreground"
      >
        <X className="w-3.5 h-3.5" />
        Clear
      </Button>
    </div>
  );
}
