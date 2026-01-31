"use client";

import { CheckSquare, Square } from "lucide-react";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";

export function SelectionControls() {
  const {
    result,
    selectedInitiatives,
    selectAllInitiatives,
    deselectAllInitiatives,
    getFilteredInitiatives
  } = useDiscoveryStore();

  if (!result) return null;

  const filtered = getFilteredInitiatives();
  const filteredIds = new Set(filtered.map(i => i.id));
  const selectedInFilter = Array.from(selectedInitiatives).filter(id => filteredIds.has(id));

  const allSelected = selectedInFilter.length === filtered.length && filtered.length > 0;
  const noneSelected = selectedInFilter.length === 0;

  return (
    <div className="flex items-center gap-4">
      {/* Selection count */}
      <span className="text-sm text-muted-foreground">
        {selectedInFilter.length} of {filtered.length} selected
      </span>

      {/* Toggle buttons - per CONTEXT.md: "Simple toggle buttons" */}
      <div className="flex items-center gap-2">
        <button
          onClick={selectAllInitiatives}
          disabled={allSelected}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md
            border transition-colors
            ${allSelected
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'hover:bg-accent hover:text-accent-foreground'
            }
          `}
        >
          <CheckSquare className="h-4 w-4" />
          Select All
        </button>

        <button
          onClick={deselectAllInitiatives}
          disabled={noneSelected}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md
            border transition-colors
            ${noneSelected
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'hover:bg-accent hover:text-accent-foreground'
            }
          `}
        >
          <Square className="h-4 w-4" />
          Deselect All
        </button>
      </div>
    </div>
  );
}
