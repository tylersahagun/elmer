"use client";

import { CheckSquare, Square } from "lucide-react";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";

export function AgentSelectionControls() {
  const {
    result,
    selectedAgents,
    selectAllAgents,
    deselectAllAgents,
  } = useDiscoveryStore();

  if (!result || result.agents.length === 0) {
    return null;
  }

  const totalAgents = result.agents.length;
  const selectedCount = selectedAgents.size;
  const allSelected = selectedCount === totalAgents;
  const noneSelected = selectedCount === 0;

  return (
    <div className="flex items-center gap-4">
      {/* Selection count */}
      <span className="text-sm text-muted-foreground">
        {selectedCount} of {totalAgents} selected
      </span>

      {/* Toggle buttons - following SelectionControls pattern */}
      <div className="flex items-center gap-2">
        <button
          onClick={selectAllAgents}
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
          onClick={deselectAllAgents}
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
