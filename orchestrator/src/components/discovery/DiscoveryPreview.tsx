"use client";

import { useMemo } from "react";
import { ColumnGroup } from "./ColumnGroup";
import type { DiscoveryResult, DiscoveredInitiative, PreviewGroup } from "@/lib/discovery/types";

interface DiscoveryPreviewProps {
  result: DiscoveryResult;
  selectedIds?: Set<string>;
  onToggleInitiative?: (id: string) => void;
  showCheckboxes?: boolean;
}

// Known column order for consistent display
const COLUMN_ORDER = [
  'inbox', 'discovery', 'prd', 'design', 'prototype',
  'validate', 'tickets', 'build', 'alpha', 'beta', 'ga'
];

export function DiscoveryPreview({
  result,
  selectedIds = new Set(),
  onToggleInitiative,
  showCheckboxes = false
}: DiscoveryPreviewProps) {
  // Group initiatives by target column
  const groups = useMemo(() => {
    const groupMap = new Map<string, DiscoveredInitiative[]>();

    // Group by mappedColumn
    result.initiatives.forEach((initiative) => {
      const column = initiative.mappedColumn;
      if (!groupMap.has(column)) {
        groupMap.set(column, []);
      }
      groupMap.get(column)!.push(initiative);
    });

    // Convert to array and sort
    const groups: PreviewGroup[] = [];
    const knownColumns = new Set(COLUMN_ORDER);

    // First add known columns in order
    COLUMN_ORDER.forEach((column) => {
      if (groupMap.has(column)) {
        groups.push({
          column,
          isDynamic: false,
          initiatives: groupMap.get(column)!
        });
        groupMap.delete(column);
      }
    });

    // Then add dynamic columns (alphabetically)
    const dynamicColumns = Array.from(groupMap.keys()).sort();
    dynamicColumns.forEach((column) => {
      groups.push({
        column,
        isDynamic: true,
        initiatives: groupMap.get(column)!
      });
    });

    return groups;
  }, [result.initiatives]);

  if (result.initiatives.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No initiatives found in the repository.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try selecting a different branch or checking the repository structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context paths summary (if found) */}
      {result.contextPaths.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/30 border">
          <h4 className="font-medium mb-2">Context Paths Detected</h4>
          <div className="flex flex-wrap gap-2">
            {result.contextPaths.map((cp) => (
              <span
                key={cp.path}
                className="text-sm px-2 py-1 rounded bg-primary/10 text-primary"
              >
                {cp.type}: {cp.path}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Agents summary (if found) */}
      {result.agents.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/30 border">
          <h4 className="font-medium mb-2">Agents Detected</h4>
          <p className="text-sm text-muted-foreground">
            {result.agents.length} agent definition(s) found
          </p>
        </div>
      )}

      {/* Column groups */}
      {groups.map((group) => (
        <ColumnGroup
          key={group.column}
          column={group.column}
          isDynamic={group.isDynamic}
          initiatives={group.initiatives}
          showCheckboxes={showCheckboxes}
          selectedIds={selectedIds}
          onToggle={onToggleInitiative}
        />
      ))}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Warnings ({result.warnings.length})
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {result.warnings.map((warning, i) => (
              <li key={i}>{warning.path}: {warning.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
