import { create } from 'zustand';
import type { DiscoveryResult, DiscoveredInitiative, ImportSelection, DiscoveryAmbiguity } from '@/lib/discovery/types';

interface FilterState {
  showArchived: boolean;
  columnFilter: string | null;  // null = all columns
  sourceFilter: string | null;  // null = all source folders
}

interface DiscoveryState {
  // Discovery result
  result: DiscoveryResult | null;
  isLoading: boolean;
  error: string | null;

  // Selection state
  selectedInitiatives: Set<string>;
  selectedContextPaths: Set<string>;
  selectedAgents: Set<string>;

  // Filter state
  filters: FilterState;

  // Ambiguity state
  ambiguities: DiscoveryAmbiguity[];
  hasUnresolvedAmbiguities: boolean;

  // Actions
  setResult: (result: DiscoveryResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selection actions
  toggleInitiative: (id: string) => void;
  selectAllInitiatives: () => void;
  deselectAllInitiatives: () => void;
  toggleContextPath: (path: string) => void;
  toggleAgent: (path: string) => void;
  selectAllAgents: () => void;
  deselectAllAgents: () => void;

  // Filter actions
  setColumnFilter: (column: string | null) => void;
  setSourceFilter: (source: string | null) => void;
  toggleShowArchived: () => void;

  // Getters
  getFilteredInitiatives: () => DiscoveredInitiative[];
  getImportSelection: () => ImportSelection;
  getSelectedAgentCount: () => number;

  // Ambiguity actions
  setAmbiguities: (ambiguities: DiscoveryAmbiguity[]) => void;
  resolveAmbiguity: (ambiguityId: string, optionId: string) => void;
  applyAmbiguityResolutions: () => void;

  // Reset
  reset: () => void;
}

const initialFilters: FilterState = {
  showArchived: true,
  columnFilter: null,
  sourceFilter: null,
};

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  result: null,
  isLoading: false,
  error: null,
  selectedInitiatives: new Set(),
  selectedContextPaths: new Set(),
  selectedAgents: new Set(),
  filters: initialFilters,
  ambiguities: [],
  hasUnresolvedAmbiguities: false,

  setResult: (result) => {
    // Per CONTEXT.md: "Default selection state: All items selected by default"
    const allInitiativeIds = new Set(result.initiatives.map(i => i.id));
    const allContextPaths = new Set(result.contextPaths.map(cp => cp.path));
    const allAgents = new Set(result.agents.map(a => a.path));

    set({
      result,
      selectedInitiatives: allInitiativeIds,
      selectedContextPaths: allContextPaths,
      selectedAgents: allAgents,
      error: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  toggleInitiative: (id) => {
    set((state) => {
      const newSet = new Set(state.selectedInitiatives);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedInitiatives: newSet };
    });
  },

  selectAllInitiatives: () => {
    const { result } = get();
    if (!result) return;

    // Select all filtered initiatives
    const filtered = get().getFilteredInitiatives();
    const ids = new Set(filtered.map(i => i.id));

    set((state) => ({
      selectedInitiatives: new Set([...state.selectedInitiatives, ...ids])
    }));
  },

  deselectAllInitiatives: () => {
    const { result } = get();
    if (!result) return;

    // Deselect all filtered initiatives
    const filtered = get().getFilteredInitiatives();
    const idsToRemove = new Set(filtered.map(i => i.id));

    set((state) => {
      const newSet = new Set(state.selectedInitiatives);
      idsToRemove.forEach(id => newSet.delete(id));
      return { selectedInitiatives: newSet };
    });
  },

  toggleContextPath: (path) => {
    set((state) => {
      const newSet = new Set(state.selectedContextPaths);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return { selectedContextPaths: newSet };
    });
  },

  toggleAgent: (path) => {
    set((state) => {
      const newSet = new Set(state.selectedAgents);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return { selectedAgents: newSet };
    });
  },

  selectAllAgents: () => {
    const { result } = get();
    if (!result) return;
    const allPaths = new Set(result.agents.map(a => a.path));
    set({ selectedAgents: allPaths });
  },

  deselectAllAgents: () => {
    set({ selectedAgents: new Set() });
  },

  setColumnFilter: (columnFilter) => {
    set((state) => ({
      filters: { ...state.filters, columnFilter }
    }));
  },

  setSourceFilter: (sourceFilter) => {
    set((state) => ({
      filters: { ...state.filters, sourceFilter }
    }));
  },

  toggleShowArchived: () => {
    set((state) => ({
      filters: { ...state.filters, showArchived: !state.filters.showArchived }
    }));
  },

  getFilteredInitiatives: () => {
    const { result, filters } = get();
    if (!result) return [];

    return result.initiatives.filter((initiative) => {
      // Archived filter
      if (!filters.showArchived && initiative.archived) {
        return false;
      }

      // Column filter
      if (filters.columnFilter && initiative.mappedColumn !== filters.columnFilter) {
        return false;
      }

      // Source folder filter
      if (filters.sourceFilter && initiative.sourceFolder !== filters.sourceFilter) {
        return false;
      }

      return true;
    });
  },

  getImportSelection: () => {
    const { selectedInitiatives, selectedContextPaths, selectedAgents } = get();
    return {
      initiatives: Array.from(selectedInitiatives),
      contextPaths: Array.from(selectedContextPaths),
      agents: Array.from(selectedAgents),
      createDynamicColumns: true,
    };
  },

  getSelectedAgentCount: () => {
    return get().selectedAgents.size;
  },

  setAmbiguities: (ambiguities) => {
    set({
      ambiguities,
      hasUnresolvedAmbiguities: ambiguities.some(a => !a.resolved),
    });
  },

  resolveAmbiguity: (ambiguityId, optionId) => {
    set((state) => {
      const newAmbiguities = state.ambiguities.map(a =>
        a.id === ambiguityId
          ? { ...a, resolved: true, selectedOptionId: optionId }
          : a
      );
      return {
        ambiguities: newAmbiguities,
        hasUnresolvedAmbiguities: newAmbiguities.some(a => !a.resolved),
      };
    });
  },

  applyAmbiguityResolutions: () => {
    // Apply resolved ambiguities to filter discovery results
    const { result, ambiguities } = get();
    if (!result) return;

    // Find folder selection ambiguity
    const folderAmbiguity = ambiguities.find(
      a => a.type === 'multiple_initiative_folders' && a.resolved
    );

    if (folderAmbiguity && folderAmbiguity.selectedOptionId !== 'use_all') {
      // Filter initiatives to only include selected folder
      const selectedFolder = folderAmbiguity.options.find(
        o => o.id === folderAmbiguity.selectedOptionId
      )?.value as string | undefined;

      if (selectedFolder) {
        const filteredInitiatives = result.initiatives.filter(
          i => i.sourceFolder === selectedFolder
        );

        // Update selection to only include filtered initiatives
        const newSelectedIds = new Set(
          filteredInitiatives.map(i => i.id)
        );

        set({ selectedInitiatives: newSelectedIds });
      }
    }

    // Find status mapping ambiguities and apply column overrides
    const statusAmbiguities = ambiguities.filter(
      a => a.type === 'ambiguous_status_mapping' && a.resolved
    );

    if (statusAmbiguities.length > 0) {
      // Create a map of status -> column from resolutions
      const columnOverrides = new Map<string, string>();
      for (const amb of statusAmbiguities) {
        const selectedColumn = amb.options.find(
          o => o.id === amb.selectedOptionId
        )?.value as string | undefined;

        if (selectedColumn && amb.context.paths) {
          for (const path of amb.context.paths) {
            const init = result.initiatives.find(i => i.sourcePath === path);
            if (init?.status) {
              columnOverrides.set(init.status, selectedColumn);
            }
          }
        }
      }

      // Note: We don't modify result directly - UI should use these overrides
      // when displaying mapped columns
    }
  },

  reset: () => {
    set({
      result: null,
      isLoading: false,
      error: null,
      selectedInitiatives: new Set(),
      selectedContextPaths: new Set(),
      selectedAgents: new Set(),
      filters: initialFilters,
      ambiguities: [],
      hasUnresolvedAmbiguities: false,
    });
  },
}));
