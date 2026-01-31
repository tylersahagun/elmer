"use client";

import { Plus } from "lucide-react";
import { InitiativeItem } from "./InitiativeItem";
import type { DiscoveredInitiative } from "@/lib/discovery/types";

interface ColumnGroupProps {
  column: string;
  isDynamic: boolean;  // Column doesn't exist yet, will be created
  initiatives: DiscoveredInitiative[];
  showCheckboxes?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
}

export function ColumnGroup({
  column,
  isDynamic,
  initiatives,
  showCheckboxes = false,
  selectedIds = new Set(),
  onToggle
}: ColumnGroupProps) {
  if (initiatives.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Column header */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg capitalize">{column}</h3>
        <span className="text-sm text-muted-foreground">
          ({initiatives.length} {initiatives.length === 1 ? 'project' : 'projects'})
        </span>
        {isDynamic && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <Plus className="h-3 w-3" />
            New column
          </span>
        )}
      </div>

      {/* Initiative list */}
      <div className="space-y-2">
        {initiatives.map((initiative) => (
          <InitiativeItem
            key={initiative.id}
            initiative={initiative}
            showCheckbox={showCheckboxes}
            checked={selectedIds.has(initiative.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
