/**
 * Tests for repository scanner module.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { scanRepository, type ScanOptions } from "../scanner";
import type { Octokit } from "@octokit/rest";

// Mock Octokit
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

describe("scanRepository", () => {
  const baseOptions: Omit<ScanOptions, "octokit"> = {
    workspaceId: "ws_test123",
    owner: "acme",
    repo: "product",
    branch: "main",
  };

  describe("initiative discovery", () => {
    it("discovers initiatives folder with _meta.json", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/feature-a/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
        ],
        fileContents: {
          "initiatives/feature-a/_meta.json": JSON.stringify({
            name: "Feature A",
            description: "A great feature",
            status: "discovery",
            tags: ["ui", "ux"],
          }),
        },
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0]).toMatchObject({
        name: "Feature A",
        description: "A great feature",
        status: "discovery",
        mappedColumn: "discovery",
        sourcePath: "initiatives/feature-a",
        sourceFolder: "initiatives",
        tags: ["ui", "ux"],
        selected: true,
      });
      expect(result.initiatives[0].id).toMatch(/^proj_[a-f0-9]{16}$/);
      expect(result.stats.initiativesFound).toBe(1);
      expect(result.stats.metaJsonParsed).toBe(1);
      expect(result.warnings).toHaveLength(0);
    });

    it("handles missing _meta.json (uses folder name)", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/my-project", mode: "040000", type: "tree", sha: "def" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0]).toMatchObject({
        name: "My Project", // Title-cased from folder name
        status: null,
        mappedColumn: "inbox", // Default when no status
        sourcePath: "initiatives/my-project",
      });
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("missing_meta");
    });

    it("handles archived initiatives", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "projects", mode: "040000", type: "tree", sha: "abc" },
          { path: "projects/old-feature", mode: "040000", type: "tree", sha: "def" },
          { path: "projects/old-feature/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
        ],
        fileContents: {
          "projects/old-feature/_meta.json": JSON.stringify({
            name: "Old Feature",
            status: "ga",
            archived: true,
          }),
        },
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0]).toMatchObject({
        name: "Old Feature",
        archived: true,
        selected: false, // Archived items not pre-selected
      });
    });

    it("discovers multiple initiative patterns", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/init-a", mode: "040000", type: "tree", sha: "def" },
          { path: "features", mode: "040000", type: "tree", sha: "ghi" },
          { path: "features/feat-b", mode: "040000", type: "tree", sha: "jkl" },
          { path: "projects", mode: "040000", type: "tree", sha: "mno" },
          { path: "projects/proj-c", mode: "040000", type: "tree", sha: "pqr" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(3);
      expect(result.initiatives.map((i) => i.sourceFolder).sort()).toEqual([
        "features",
        "initiatives",
        "projects",
      ]);
    });
  });

  describe("context path discovery", () => {
    it("discovers knowledge path", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "knowledge", mode: "040000", type: "tree", sha: "abc" },
          { path: "knowledge/guide.md", mode: "100644", type: "blob", sha: "def" },
          { path: "knowledge/faq.md", mode: "100644", type: "blob", sha: "ghi" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.contextPaths).toHaveLength(1);
      expect(result.contextPaths[0]).toMatchObject({
        type: "knowledge",
        path: "knowledge",
        confidence: 1.0,
        fileCount: 2,
        selected: true,
      });
      expect(result.stats.contextPathsFound).toBe(1);
    });

    it("discovers personas and signals paths", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "personas", mode: "040000", type: "tree", sha: "abc" },
          { path: "personas/developer.md", mode: "100644", type: "blob", sha: "def" },
          { path: "signals", mode: "040000", type: "tree", sha: "ghi" },
          { path: "signals/feedback.json", mode: "100644", type: "blob", sha: "jkl" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.contextPaths).toHaveLength(2);
      const types = result.contextPaths.map((cp) => cp.type).sort();
      expect(types).toEqual(["personas", "signals"]);
    });

    it("discovers alternative knowledge paths (docs, kb)", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "docs", mode: "040000", type: "tree", sha: "abc" },
          { path: "docs/readme.md", mode: "100644", type: "blob", sha: "def" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.contextPaths).toHaveLength(1);
      expect(result.contextPaths[0]).toMatchObject({
        type: "knowledge",
        path: "docs",
      });
    });
  });

  describe("agent discovery", () => {
    it("discovers .cursor/ agents", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: ".cursor", mode: "040000", type: "tree", sha: "abc" },
          { path: ".cursor/skills", mode: "040000", type: "tree", sha: "def" },
          { path: ".cursor/skills/code-review.md", mode: "100644", type: "blob", sha: "ghi" },
          { path: ".cursor/commands", mode: "040000", type: "tree", sha: "jkl" },
          { path: ".cursor/commands/deploy.json", mode: "100644", type: "blob", sha: "mno" },
          { path: ".cursor/rules", mode: "040000", type: "tree", sha: "pqr" },
          { path: ".cursor/rules/style.mdc", mode: "100644", type: "blob", sha: "stu" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.agents).toHaveLength(3);
      expect(result.agents.map((a) => a.type).sort()).toEqual([
        "command",
        "rule",
        "skill",
      ]);
      expect(result.agents.find((a) => a.type === "skill")).toMatchObject({
        name: "code-review",
        path: ".cursor/skills/code-review.md",
      });
      expect(result.stats.agentsFound).toBe(3);
    });

    it("discovers AGENTS.md at root", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "AGENTS.md", mode: "100644", type: "blob", sha: "abc" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.agents).toHaveLength(1);
      expect(result.agents[0]).toMatchObject({
        type: "agents_md",
        name: "AGENTS.md",
        path: "AGENTS.md",
      });
    });

    it("discovers .cursorrules file", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: ".cursor", mode: "040000", type: "tree", sha: "abc" },
          { path: ".cursorrules", mode: "100644", type: "blob", sha: "def" },
        ],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.agents).toHaveLength(1);
      expect(result.agents[0]).toMatchObject({
        type: "rule",
        name: ".cursorrules",
        path: ".cursorrules",
        description: "Legacy cursor rules file",
      });
    });
  });

  describe("error handling", () => {
    it("returns warnings for parse errors", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/bad-json", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/bad-json/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
        ],
        fileContents: {
          "initiatives/bad-json/_meta.json": "{ invalid json }",
        },
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(1);
      expect(result.initiatives[0].name).toBe("Bad Json"); // Falls back to folder name
      expect(result.warnings.some((w) => w.type === "meta_parse_error")).toBe(true);
      expect(result.stats.metaJsonErrors).toBe(1);
    });

    it("handles API errors gracefully", async () => {
      const octokit = createMockOctokit({
        failTree: true,
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe("api_error");
      expect(result.warnings[0].message).toContain("rate limit");
    });

    it("continues scanning when individual file fetch fails", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/good-project", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/good-project/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
          { path: "initiatives/bad-project", mode: "040000", type: "tree", sha: "jkl" },
          { path: "initiatives/bad-project/_meta.json", mode: "100644", type: "blob", sha: "mno" },
        ],
        fileContents: {
          "initiatives/good-project/_meta.json": JSON.stringify({
            name: "Good Project",
            status: "build",
          }),
        },
        failGetContent: ["initiatives/bad-project/_meta.json"],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      // Should still have both initiatives, one with fetched data, one with defaults
      expect(result.initiatives).toHaveLength(2);
      expect(result.initiatives.find((i) => i.name === "Good Project")).toBeTruthy();
      expect(result.initiatives.find((i) => i.name === "Bad Project")).toBeTruthy();
      expect(result.warnings.some((w) => w.type === "api_error")).toBe(true);
    });
  });

  describe("status mapping", () => {
    it("maps known statuses to correct columns", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/in-dev", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/in-dev/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
        ],
        fileContents: {
          "initiatives/in-dev/_meta.json": JSON.stringify({
            status: "development",
          }),
        },
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives[0].mappedColumn).toBe("build");
      expect(result.initiatives[0].statusConfidence).toBe(1);
    });

    it("flags ambiguous statuses", async () => {
      const octokit = createMockOctokit({
        treeEntries: [
          { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
          { path: "initiatives/unclear", mode: "040000", type: "tree", sha: "def" },
          { path: "initiatives/unclear/_meta.json", mode: "100644", type: "blob", sha: "ghi" },
        ],
        fileContents: {
          "initiatives/unclear/_meta.json": JSON.stringify({
            status: "discovery-dev-ready",
          }),
        },
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result.initiatives[0].isStatusAmbiguous).toBe(true);
      expect(result.warnings.some((w) => w.type === "ambiguous_status")).toBe(true);
    });
  });

  describe("deterministic IDs", () => {
    it("generates same ID for same inputs", async () => {
      const treeEntries: Array<{
        path: string;
        mode: string;
        type: "blob" | "tree";
        sha: string;
      }> = [
        { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
        { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
      ];

      const octokit1 = createMockOctokit({ treeEntries });
      const octokit2 = createMockOctokit({ treeEntries });

      const result1 = await scanRepository({ ...baseOptions, octokit: octokit1 });
      const result2 = await scanRepository({ ...baseOptions, octokit: octokit2 });

      expect(result1.initiatives[0].id).toBe(result2.initiatives[0].id);
    });

    it("generates different IDs for different workspaces", async () => {
      const treeEntries: Array<{
        path: string;
        mode: string;
        type: "blob" | "tree";
        sha: string;
      }> = [
        { path: "initiatives", mode: "040000", type: "tree", sha: "abc" },
        { path: "initiatives/feature-a", mode: "040000", type: "tree", sha: "def" },
      ];

      const octokit1 = createMockOctokit({ treeEntries });
      const octokit2 = createMockOctokit({ treeEntries });

      const result1 = await scanRepository({
        ...baseOptions,
        workspaceId: "ws_one",
        octokit: octokit1,
      });
      const result2 = await scanRepository({
        ...baseOptions,
        workspaceId: "ws_two",
        octokit: octokit2,
      });

      expect(result1.initiatives[0].id).not.toBe(result2.initiatives[0].id);
    });
  });

  describe("result structure", () => {
    it("returns complete result structure", async () => {
      const octokit = createMockOctokit({
        treeEntries: [],
      });

      const result = await scanRepository({ ...baseOptions, octokit });

      expect(result).toMatchObject({
        repoOwner: "acme",
        repoName: "product",
        branch: "main",
        initiatives: [],
        contextPaths: [],
        agents: [],
        stats: {
          foldersScanned: 0,
          initiativesFound: 0,
          contextPathsFound: 0,
          agentsFound: 0,
          metaJsonParsed: 0,
          metaJsonErrors: 0,
        },
        warnings: [],
      });
      expect(result.scannedAt).toBeDefined();
    });
  });
});
