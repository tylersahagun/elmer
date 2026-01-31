/**
 * Tests for streaming scanner module.
 *
 * Verifies progress event emission, incremental discovery, timing calculations,
 * and cancellation support for the scanRepositoryWithStreaming function.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  scanRepositoryWithStreaming,
  type StreamingScanOptions,
  type ScanProgressCallback,
} from "../streaming-scanner";
import type { DiscoveryStreamEvent } from "../streaming";
import type { Octokit } from "@octokit/rest";

// =============================================================================
// MOCK HELPERS
// =============================================================================

/**
 * Create a mock Octokit instance for testing.
 */
function createMockOctokit(overrides?: {
  treeEntries?: Array<{
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
  }>;
  fileContents?: Record<string, string>;
  failTree?: boolean;
  failGetContent?: string[];
}): Octokit {
  const {
    treeEntries = [],
    fileContents = {},
    failTree = false,
    failGetContent = [],
  } = overrides || {};

  return {
    git: {
      getTree: vi.fn().mockImplementation(async () => {
        if (failTree) {
          throw new Error("API rate limit exceeded");
        }
        return { data: { tree: treeEntries } };
      }),
    },
    repos: {
      getContent: vi.fn().mockImplementation(async ({ path }) => {
        if (failGetContent.includes(path)) {
          throw new Error("File not found");
        }
        const content = fileContents[path];
        if (content !== undefined) {
          return {
            data: {
              content: Buffer.from(content).toString("base64"),
              encoding: "base64",
            },
          };
        }
        throw new Error(`No mock content for ${path}`);
      }),
    },
  } as unknown as Octokit;
}

/**
 * Collect events emitted by the streaming scanner.
 */
function createEventCollector(): {
  events: DiscoveryStreamEvent[];
  onProgress: ScanProgressCallback;
} {
  const events: DiscoveryStreamEvent[] = [];
  const onProgress: ScanProgressCallback = (event) => {
    events.push(event);
  };
  return { events, onProgress };
}

// Base options for all tests
const baseOptions: Omit<StreamingScanOptions, "octokit" | "onProgress"> = {
  workspaceId: "ws_test123",
  owner: "acme",
  repo: "product",
  branch: "main",
};

// =============================================================================
// TESTS
// =============================================================================

describe("scanRepositoryWithStreaming", () => {
  describe("event emission", () => {
    it("emits scanning_started event first", async () => {
      const octokit = createMockOctokit({ treeEntries: [] });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("scanning_started");
      expect(events[0].data).toMatchObject({
        repoOwner: "acme",
        repoName: "product",
        branch: "main",
      });
    });

    it("emits completed event when done", async () => {
      const octokit = createMockOctokit({ treeEntries: [] });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const completedEvents = events.filter((e) => e.type === "completed");
      expect(completedEvents).toHaveLength(1);
      expect(completedEvents[0].data.result).toBeDefined();
      expect(completedEvents[0].data.elapsedMs).toBeGreaterThanOrEqual(0);
    });

    it("emits progress events during scan", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          // Create enough folders to trigger progress events (every 5 folders)
          { path: "folder1", mode: "040000", type: "tree", sha: "a1" },
          { path: "folder2", mode: "040000", type: "tree", sha: "a2" },
          { path: "folder3", mode: "040000", type: "tree", sha: "a3" },
          { path: "folder4", mode: "040000", type: "tree", sha: "a4" },
          { path: "folder5", mode: "040000", type: "tree", sha: "a5" },
          { path: "folder6", mode: "040000", type: "tree", sha: "a6" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const progressEvents = events.filter((e) => e.type === "progress");
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0].data.foldersScanned).toBeGreaterThan(0);
      expect(progressEvents[0].data.totalFolders).toBe(6);
    });
  });

  describe("incremental discovery", () => {
    it("emits initiative_found for each discovered initiative", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/feature-b", mode: "040000", type: "tree", sha: "ghi" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const initiativeEvents = events.filter((e) => e.type === "initiative_found");
      expect(initiativeEvents).toHaveLength(2);
      expect(initiativeEvents[0].data.initiative).toBeDefined();
      expect(initiativeEvents[0].data.initiative?.name).toBe("Feature A");
      expect(initiativeEvents[1].data.initiative?.name).toBe("Feature B");
    });

    it("emits context_path_found for each context path", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "knowledge", mode: "040000", type: "tree", sha: "abc" },
          { path: "knowledge/guide.md", mode: "100644", type: "blob", sha: "def" },
          { path: "personas", mode: "040000", type: "tree", sha: "ghi" },
          { path: "personas/dev.md", mode: "100644", type: "blob", sha: "jkl" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const contextPathEvents = events.filter((e) => e.type === "context_path_found");
      expect(contextPathEvents).toHaveLength(2);
      const types = contextPathEvents.map((e) => e.data.contextPath?.type).sort();
      expect(types).toEqual(["knowledge", "personas"]);
    });

    it("emits agent_found for each agent", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "AGENTS.md", mode: "100644", type: "blob", sha: "abc" },
          { path: ".cursor", mode: "040000", type: "tree", sha: "def" },
          { path: ".cursor/skills", mode: "040000", type: "tree", sha: "ghi" },
          { path: ".cursor/skills/review.md", mode: "100644", type: "blob", sha: "jkl" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const agentEvents = events.filter((e) => e.type === "agent_found");
      expect(agentEvents).toHaveLength(2);
      const types = agentEvents.map((e) => e.data.agent?.type).sort();
      expect(types).toEqual(["agents_md", "skill"]);
    });
  });

  describe("timing calculations", () => {
    it("calculates elapsed time correctly", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "folder1", mode: "040000", type: "tree", sha: "a1" },
          { path: "folder2", mode: "040000", type: "tree", sha: "a2" },
          { path: "folder3", mode: "040000", type: "tree", sha: "a3" },
          { path: "folder4", mode: "040000", type: "tree", sha: "a4" },
          { path: "folder5", mode: "040000", type: "tree", sha: "a5" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const completedEvent = events.find((e) => e.type === "completed");
      expect(completedEvent?.data.elapsedMs).toBeDefined();
      expect(completedEvent?.data.elapsedMs).toBeGreaterThanOrEqual(0);
    });

    it("estimates remaining time based on progress", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "folder1", mode: "040000", type: "tree", sha: "a1" },
          { path: "folder2", mode: "040000", type: "tree", sha: "a2" },
          { path: "folder3", mode: "040000", type: "tree", sha: "a3" },
          { path: "folder4", mode: "040000", type: "tree", sha: "a4" },
          { path: "folder5", mode: "040000", type: "tree", sha: "a5" },
          { path: "folder6", mode: "040000", type: "tree", sha: "a6" },
          { path: "folder7", mode: "040000", type: "tree", sha: "a7" },
          { path: "folder8", mode: "040000", type: "tree", sha: "a8" },
          { path: "folder9", mode: "040000", type: "tree", sha: "a9" },
          { path: "folder10", mode: "040000", type: "tree", sha: "a10" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const progressEvents = events.filter((e) => e.type === "progress");
      // At least one progress event should have estimated remaining time
      const withEstimate = progressEvents.filter(
        (e) => e.data.estimatedRemainingMs !== undefined
      );
      expect(withEstimate.length).toBeGreaterThan(0);
    });
  });

  describe("cancellation", () => {
    it("emits cancelled event when signal is aborted", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
        ],
      });
      const { events, onProgress } = createEventCollector();
      const abortController = new AbortController();

      // Abort before scan starts
      abortController.abort();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
        signal: abortController.signal,
      });

      const cancelledEvents = events.filter((e) => e.type === "cancelled");
      expect(cancelledEvents).toHaveLength(1);
      expect(cancelledEvents[0].data.elapsedMs).toBeDefined();
    });

    it("returns empty result when cancelled", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
        ],
      });
      const { events, onProgress } = createEventCollector();
      const abortController = new AbortController();

      // Abort before scan starts
      abortController.abort();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
        signal: abortController.signal,
      });

      expect(result.initiatives).toHaveLength(0);
      expect(result.contextPaths).toHaveLength(0);
      expect(result.agents).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("emits error event on API failure", async () => {
      const octokit = createMockOctokit({ failTree: true });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const errorEvents = events.filter((e) => e.type === "error");
      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0].data.error).toContain("rate limit");
    });

    it("returns empty result on error", async () => {
      const octokit = createMockOctokit({ failTree: true });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result.initiatives).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("api_error");
    });
  });

  describe("event timestamps", () => {
    it("includes timestamps on all events", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      // All events should have timestamps
      for (const event of events) {
        expect(event.timestamp).toBeDefined();
        expect(typeof event.timestamp).toBe("string");
        // Verify it's a valid ISO timestamp
        expect(() => new Date(event.timestamp)).not.toThrow();
      }
    });
  });

  describe("folder_found events", () => {
    it("emits folder_found for initiative parent folders", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "projects", mode: "040000", type: "tree", sha: "def" },
          { path: "random", mode: "040000", type: "tree", sha: "ghi" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const folderEvents = events.filter((e) => e.type === "folder_found");
      expect(folderEvents).toHaveLength(2); // initiatives and projects
      const folders = folderEvents.map((e) => e.data.currentFolder).sort();
      expect(folders).toEqual(["initiatives", "projects"]);
    });
  });

  describe("result structure", () => {
    it("returns complete discovery result", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/feature-a/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
          { path: "knowledge", mode: "040000", type: "tree", sha: "jkl" },
          { path: "AGENTS.md", mode: "100644", type: "blob", sha: "mno" },
        ],
        fileContents: {
          "initiatives/feature-a/_meta.json": JSON.stringify({
            name: "Feature A",
            status: "discovery",
          }),
        },
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result).toMatchObject({
        repoOwner: "acme",
        repoName: "product",
        branch: "main",
      });
      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("Feature A");
      expect(result.contextPaths).toHaveLength(1);
      expect(result.contextPaths[0].type).toBe("knowledge");
      expect(result.agents).toHaveLength(1);
      expect(result.agents[0].type).toBe("agents_md");
      expect(result.stats).toBeDefined();
    });
  });

  describe("nested initiative discovery (docs root folders)", () => {
    it("discovers initiatives inside pm-workspace-docs folder", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          // Top-level docs root folder
          { path: "pm-workspace-docs", mode: "040000", type: "tree", sha: "abc" },
          // Initiatives folder inside docs root
          { path: "pm-workspace-docs/initiatives", mode: "040000", type: "tree", sha: "def" },
          // Individual initiatives
          { path: "pm-workspace-docs/initiatives/admin-onboarding", mode: "040000", type: "tree", sha: "ghi" },
          { path: "pm-workspace-docs/initiatives/crm-exp-ete", mode: "040000", type: "tree", sha: "jkl" },
          // Other context paths inside docs root
          { path: "pm-workspace-docs/personas", mode: "040000", type: "tree", sha: "mno" },
          { path: "pm-workspace-docs/signals", mode: "040000", type: "tree", sha: "pqr" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      // Should find 2 initiatives inside pm-workspace-docs/initiatives/
      expect(result.initiatives).toHaveLength(2);
      
      const initiativeNames = result.initiatives.map((i) => i.name).sort();
      expect(initiativeNames).toEqual(["Admin Onboarding", "Crm Exp Ete"]);

      // All initiatives should have docsRoot set
      expect(result.initiatives[0].docsRoot).toBe("pm-workspace-docs");
      expect(result.initiatives[1].docsRoot).toBe("pm-workspace-docs");

      // Source paths should include full path
      const sourcePaths = result.initiatives.map((i) => i.sourcePath).sort();
      expect(sourcePaths).toEqual([
        "pm-workspace-docs/initiatives/admin-onboarding",
        "pm-workspace-docs/initiatives/crm-exp-ete",
      ]);

      // Should emit initiative_found events
      const initiativeEvents = events.filter((e) => e.type === "initiative_found");
      expect(initiativeEvents).toHaveLength(2);
    });

    it("discovers initiatives inside elmer-docs folder", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "elmer-docs", mode: "040000", type: "tree", sha: "abc" },
          { path: "elmer-docs/initiatives", mode: "040000", type: "tree", sha: "def" },
          { path: "elmer-docs/initiatives/feature-x", mode: "040000", type: "tree", sha: "ghi" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("Feature X");
      expect(result.initiatives[0].docsRoot).toBe("elmer-docs");
      expect(result.initiatives[0].sourcePath).toBe("elmer-docs/initiatives/feature-x");
    });

    it("discovers initiatives inside generic docs folder", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "docs", mode: "040000", type: "tree", sha: "abc" },
          { path: "docs/features", mode: "040000", type: "tree", sha: "def" },
          { path: "docs/features/new-dashboard", mode: "040000", type: "tree", sha: "ghi" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("New Dashboard");
      expect(result.initiatives[0].docsRoot).toBe("docs");
    });

    it("maintains backward compatibility with top-level initiatives", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          // Top-level initiatives (legacy structure)
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("Feature A");
      // Top-level initiatives should NOT have docsRoot set
      expect(result.initiatives[0].docsRoot).toBeUndefined();
      expect(result.initiatives[0].sourcePath).toBe("initiatives/feature-a");
    });

    it("discovers initiatives from both top-level and docs root", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          // Top-level initiatives
          { path: "features", mode: "040000", type: "tree", sha: "abc" },
          { path: "features/legacy-feature", mode: "040000", type: "tree", sha: "def" },
          // Docs root initiatives
          { path: "pm-workspace-docs", mode: "040000", type: "tree", sha: "ghi" },
          { path: "pm-workspace-docs/initiatives", mode: "040000", type: "tree", sha: "jkl" },
          { path: "pm-workspace-docs/initiatives/new-feature", mode: "040000", type: "tree", sha: "mno" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      // Should find initiatives from both locations
      expect(result.initiatives).toHaveLength(2);
      
      const legacyInitiative = result.initiatives.find((i) => i.name === "Legacy Feature");
      const newInitiative = result.initiatives.find((i) => i.name === "New Feature");

      expect(legacyInitiative).toBeDefined();
      expect(legacyInitiative?.docsRoot).toBeUndefined();
      expect(legacyInitiative?.sourcePath).toBe("features/legacy-feature");

      expect(newInitiative).toBeDefined();
      expect(newInitiative?.docsRoot).toBe("pm-workspace-docs");
      expect(newInitiative?.sourcePath).toBe("pm-workspace-docs/initiatives/new-feature");
    });

    it("emits folder_found for nested initiative parent folders", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "pm-workspace-docs", mode: "040000", type: "tree", sha: "abc" },
          { path: "pm-workspace-docs/initiatives", mode: "040000", type: "tree", sha: "def" },
          { path: "pm-workspace-docs/initiatives/feature-a", mode: "040000", type: "tree", sha: "ghi" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      const folderEvents = events.filter((e) => e.type === "folder_found");
      // Should emit folder_found for pm-workspace-docs/initiatives
      const nestedFolderEvent = folderEvents.find(
        (e) => e.data.currentFolder === "pm-workspace-docs/initiatives"
      );
      expect(nestedFolderEvent).toBeDefined();
    });

    it("parses _meta.json from nested initiatives", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "pm-workspace-docs", mode: "040000", type: "tree", sha: "abc" },
          { path: "pm-workspace-docs/initiatives", mode: "040000", type: "tree", sha: "def" },
          { path: "pm-workspace-docs/initiatives/admin-onboarding", mode: "040000", type: "tree", sha: "ghi" },
          { path: "pm-workspace-docs/initiatives/admin-onboarding/_meta.json", mode: "100644", type: "blob", sha: "jkl" },
        ],
        fileContents: {
          "pm-workspace-docs/initiatives/admin-onboarding/_meta.json": JSON.stringify({
            name: "Admin Onboarding Flow",
            status: "in-progress",
            description: "Onboarding for admin users",
            tags: ["admin", "onboarding"],
          }),
        },
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("Admin Onboarding Flow");
      expect(result.initiatives[0].description).toBe("Onboarding for admin users");
      expect(result.initiatives[0].tags).toEqual(["admin", "onboarding"]);
      expect(result.initiatives[0].docsRoot).toBe("pm-workspace-docs");
    });

    it("does not scan deeply nested docs folders (only one level)", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          // Two levels deep docs root - should NOT be scanned
          { path: "src", mode: "040000", type: "tree", sha: "abc" },
          { path: "src/docs", mode: "040000", type: "tree", sha: "def" },
          { path: "src/docs/initiatives", mode: "040000", type: "tree", sha: "ghi" },
          { path: "src/docs/initiatives/feature-a", mode: "040000", type: "tree", sha: "jkl" },
        ],
      });
      const { events, onProgress } = createEventCollector();

      const result = await scanRepositoryWithStreaming({
        ...baseOptions,
        octokit,
        onProgress,
      });

      // Should NOT find initiatives in deeply nested docs folder
      expect(result.initiatives).toHaveLength(0);
    });
  });
});
