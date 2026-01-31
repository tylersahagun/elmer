"use client";

import { useMemo } from "react";
import { Filter, Archive, Columns } from "lucide-react";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";

export function FilterBar() {
  const {
    result,
    filters,
    setColumnFilter,
    setSourceFilter,
    toggleShowArchived
  } = useDiscoveryStore();

  // Get unique columns and source folders from result
  const { columns, sourceFolders, archivedCount } = useMemo(() => {
    if (!result) return { columns: [], sourceFolders: [], archivedCount: 0 };

    const columnSet = new Set<string>();
    const sourceSet = new Set<string>();
    let archived = 0;

    result.initiatives.forEach((initiative) => {
      columnSet.add(initiative.mappedColumn);
      sourceSet.add(initiative.sourceFolder);
      if (initiative.archived) archived++;
    });

    return {
      columns: Array.from(columnSet).sort(),
      sourceFolders: Array.from(sourceSet).sort(),
      archivedCount: archived
    };
  }, [result]);

  if (!result) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {/* Column filter */}
      <div className="flex items-center gap-2">
        <Columns className="h-4 w-4 text-muted-foreground" />
        <select
          value={filters.columnFilter || ''}
          onChange={(e) => setColumnFilter(e.target.value || null)}
          className="text-sm px-2 py-1 rounded border bg-background"
        >
          <option value="">All columns</option>
          {columns.map((column) => (
            <option key={column} value={column}>
              {column.charAt(0).toUpperCase() + column.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Source folder filter */}
      {sourceFolders.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Source:</span>
          <select
            value={filters.sourceFilter || ''}
            onChange={(e) => setSourceFilter(e.target.value || null)}
            className="text-sm px-2 py-1 rounded border bg-background"
          >
            <option value="">All folders</option>
            {sourceFolders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Archived toggle */}
      {archivedCount > 0 && (
        <button
          onClick={toggleShowArchived}
          className={`
            flex items-center gap-1.5 px-2 py-1 text-sm rounded
            transition-colors
            ${filters.showArchived
              ? 'bg-muted text-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <Archive className="h-4 w-4" />
          {filters.showArchived ? 'Hide' : 'Show'} archived ({archivedCount})
        </button>
      )}
    </div>
  );
}
