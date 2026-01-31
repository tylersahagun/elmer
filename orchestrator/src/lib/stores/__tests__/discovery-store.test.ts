import { describe, it, expect, beforeEach } from "vitest";
import { useDiscoveryStore } from "../discovery-store";
import type {
  DiscoveryResult,
  DiscoveredInitiative,
} from "@/lib/discovery/types";

// Helper to create mock initiatives
function createMockInitiative(
  overrides: Partial<DiscoveredInitiative> = {},
): DiscoveredInitiative {
  const id = overrides.id || "init_" + Math.random().toString(36).slice(2, 9);
  return {
    id,
    sourcePath: "initiatives/test",
    sourceFolder: "initiatives",
    name: "Test Initiative",
    status: "active",
    mappedColumn: "prd",
    statusConfidence: 1,
    isStatusAmbiguous: false,
    description: null,
    archived: false,
    tags: [],
    rawMeta: null,
    patternMatch: {
      pattern: "initiatives",
      matchType: "exact",
      confidence: 1,
    },
    selected: true,
    prototypes: [],
    ...overrides,
  };
}

// Helper to create mock discovery result
function createMockResult(
  initiatives: DiscoveredInitiative[],
): DiscoveryResult {
  return {
    repoOwner: "test",
    repoName: "repo",
    branch: "main",
    scannedAt: new Date().toISOString(),
    initiatives,
    contextPaths: [
      {
        type: "knowledge",
        path: ".context/knowledge",
        confidence: 1,
        fileCount: 5,
        selected: true,
      },
    ],
    agents: [
      {
        type: "agents_md",
        name: "Test Agent",
        path: ".context/agents.md",
        description: null,
        selected: true,
      },
    ],
    stats: {
      foldersScanned: 10,
      initiativesFound: initiatives.length,
      contextPathsFound: 1,
      agentsFound: 1,
      prototypesFound: 0,
      metaJsonParsed: initiatives.length,
      metaJsonErrors: 0,
    },
    warnings: [],
  };
}

describe("discovery-store", () => {
  beforeEach(() => {
    // Reset store before each test
    useDiscoveryStore.getState().reset();
  });

  describe("setResult", () => {
    it("selects all items by default", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1" }),
        createMockInitiative({ id: "init_2" }),
        createMockInitiative({ id: "init_3" }),
      ];
      const result = createMockResult(initiatives);

      useDiscoveryStore.getState().setResult(result);
      const state = useDiscoveryStore.getState();

      expect(state.selectedInitiatives.size).toBe(3);
      expect(state.selectedInitiatives.has("init_1")).toBe(true);
      expect(state.selectedInitiatives.has("init_2")).toBe(true);
      expect(state.selectedInitiatives.has("init_3")).toBe(true);
      expect(state.selectedContextPaths.size).toBe(1);
      expect(state.selectedAgents.size).toBe(1);
    });

    it("clears error when setting result", () => {
      useDiscoveryStore.getState().setError("Previous error");
      expect(useDiscoveryStore.getState().error).toBe("Previous error");

      const result = createMockResult([createMockInitiative()]);
      useDiscoveryStore.getState().setResult(result);

      expect(useDiscoveryStore.getState().error).toBeNull();
    });
  });

  describe("toggleInitiative", () => {
    it("toggles selection state for initiative", () => {
      const initiatives = [createMockInitiative({ id: "init_1" })];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Initially selected
      expect(
        useDiscoveryStore.getState().selectedInitiatives.has("init_1"),
      ).toBe(true);

      // Toggle off
      useDiscoveryStore.getState().toggleInitiative("init_1");
      expect(
        useDiscoveryStore.getState().selectedInitiatives.has("init_1"),
      ).toBe(false);

      // Toggle on
      useDiscoveryStore.getState().toggleInitiative("init_1");
      expect(
        useDiscoveryStore.getState().selectedInitiatives.has("init_1"),
      ).toBe(true);
    });
  });

  describe("selectAllInitiatives / deselectAllInitiatives", () => {
    it("selectAllInitiatives adds all filtered items to selection", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_2", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_3", mappedColumn: "design" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Deselect all first
      useDiscoveryStore.getState().deselectAllInitiatives();
      expect(useDiscoveryStore.getState().selectedInitiatives.size).toBe(0);

      // Select all
      useDiscoveryStore.getState().selectAllInitiatives();
      expect(useDiscoveryStore.getState().selectedInitiatives.size).toBe(3);
    });

    it("selectAll respects column filter", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_2", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_3", mappedColumn: "design" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Deselect all and apply filter
      useDiscoveryStore.getState().deselectAllInitiatives();
      useDiscoveryStore.getState().setColumnFilter("prd");

      // Select all (should only select prd items)
      useDiscoveryStore.getState().selectAllInitiatives();

      const selected = useDiscoveryStore.getState().selectedInitiatives;
      expect(selected.size).toBe(2);
      expect(selected.has("init_1")).toBe(true);
      expect(selected.has("init_2")).toBe(true);
      expect(selected.has("init_3")).toBe(false);
    });

    it("deselectAll respects column filter", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_2", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_3", mappedColumn: "design" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Apply filter
      useDiscoveryStore.getState().setColumnFilter("prd");

      // Deselect all (should only deselect prd items)
      useDiscoveryStore.getState().deselectAllInitiatives();

      const selected = useDiscoveryStore.getState().selectedInitiatives;
      expect(selected.size).toBe(1);
      expect(selected.has("init_1")).toBe(false);
      expect(selected.has("init_2")).toBe(false);
      expect(selected.has("init_3")).toBe(true); // design item still selected
    });
  });

  describe("getFilteredInitiatives", () => {
    it("returns all initiatives when no filters applied", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1" }),
        createMockInitiative({ id: "init_2" }),
        createMockInitiative({ id: "init_3" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      const filtered = useDiscoveryStore.getState().getFilteredInitiatives();
      expect(filtered.length).toBe(3);
    });

    it("filters by column", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", mappedColumn: "prd" }),
        createMockInitiative({ id: "init_2", mappedColumn: "design" }),
        createMockInitiative({ id: "init_3", mappedColumn: "prd" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));
      useDiscoveryStore.getState().setColumnFilter("prd");

      const filtered = useDiscoveryStore.getState().getFilteredInitiatives();
      expect(filtered.length).toBe(2);
      expect(filtered.every((i) => i.mappedColumn === "prd")).toBe(true);
    });

    it("filters by source folder", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", sourceFolder: "initiatives" }),
        createMockInitiative({ id: "init_2", sourceFolder: "projects" }),
        createMockInitiative({ id: "init_3", sourceFolder: "initiatives" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));
      useDiscoveryStore.getState().setSourceFilter("initiatives");

      const filtered = useDiscoveryStore.getState().getFilteredInitiatives();
      expect(filtered.length).toBe(2);
      expect(filtered.every((i) => i.sourceFolder === "initiatives")).toBe(
        true,
      );
    });

    it("filters by archived state", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1", archived: false }),
        createMockInitiative({ id: "init_2", archived: true }),
        createMockInitiative({ id: "init_3", archived: false }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Initially shows archived (default showArchived: true)
      expect(useDiscoveryStore.getState().getFilteredInitiatives().length).toBe(
        3,
      );

      // Toggle to hide archived
      useDiscoveryStore.getState().toggleShowArchived();

      const filtered = useDiscoveryStore.getState().getFilteredInitiatives();
      expect(filtered.length).toBe(2);
      expect(filtered.every((i) => !i.archived)).toBe(true);
    });

    it("combines multiple filters", () => {
      const initiatives = [
        createMockInitiative({
          id: "init_1",
          mappedColumn: "prd",
          sourceFolder: "initiatives",
          archived: false,
        }),
        createMockInitiative({
          id: "init_2",
          mappedColumn: "prd",
          sourceFolder: "projects",
          archived: false,
        }),
        createMockInitiative({
          id: "init_3",
          mappedColumn: "design",
          sourceFolder: "initiatives",
          archived: false,
        }),
        createMockInitiative({
          id: "init_4",
          mappedColumn: "prd",
          sourceFolder: "initiatives",
          archived: true,
        }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Apply all filters
      useDiscoveryStore.getState().setColumnFilter("prd");
      useDiscoveryStore.getState().setSourceFilter("initiatives");
      useDiscoveryStore.getState().toggleShowArchived(); // Hide archived

      const filtered = useDiscoveryStore.getState().getFilteredInitiatives();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("init_1");
    });
  });

  describe("getImportSelection", () => {
    it("returns arrays of selected IDs/paths", () => {
      const initiatives = [
        createMockInitiative({ id: "init_1" }),
        createMockInitiative({ id: "init_2" }),
      ];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));

      // Deselect one
      useDiscoveryStore.getState().toggleInitiative("init_2");

      const selection = useDiscoveryStore.getState().getImportSelection();
      expect(selection.initiatives).toEqual(["init_1"]);
      expect(selection.contextPaths).toHaveLength(1);
      expect(selection.agents).toHaveLength(1);
      expect(selection.createDynamicColumns).toBe(true);
    });
  });

  describe("reset", () => {
    it("clears all state", () => {
      const initiatives = [createMockInitiative({ id: "init_1" })];
      useDiscoveryStore.getState().setResult(createMockResult(initiatives));
      useDiscoveryStore.getState().setError("test error");
      useDiscoveryStore.getState().setColumnFilter("prd");

      useDiscoveryStore.getState().reset();

      const state = useDiscoveryStore.getState();
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
      expect(state.selectedInitiatives.size).toBe(0);
      expect(state.filters.columnFilter).toBeNull();
    });
  });
});
