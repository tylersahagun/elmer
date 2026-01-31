"use client";

import { AlertTriangle, ChevronRight, Folder } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DiscoveredInitiative } from "@/lib/discovery/types";

interface InitiativeItemProps {
  initiative: DiscoveredInitiative;
  showCheckbox?: boolean;
  checked?: boolean;
  onToggle?: (id: string) => void;
}

export function InitiativeItem({
  initiative,
  showCheckbox = false,
  checked = false,
  onToggle
}: InitiativeItemProps) {
  const { name, sourcePath, mappedColumn, isStatusAmbiguous, archived } = initiative;

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border
      ${archived ? 'opacity-60 bg-muted/30' : 'bg-card'}
      ${isStatusAmbiguous ? 'border-yellow-500/50' : 'border-border'}
    `}>
      {/* Checkbox for selection */}
      {showCheckbox && (
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle?.(initiative.id)}
        />
      )}

      {/* Folder icon */}
      <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{name}</span>
          {archived && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Archived
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {sourcePath}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

      {/* Mapped column */}
      <div className="flex items-center gap-2">
        <span className={`
          text-sm font-medium px-2 py-1 rounded
          ${isStatusAmbiguous
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
            : 'bg-primary/10 text-primary'
          }
        `}>
          {mappedColumn}
        </span>

        {/* Ambiguous warning icon */}
        {isStatusAmbiguous && (
          <span title="Status mapping may need review">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </span>
        )}
      </div>
    </div>
  );
}
