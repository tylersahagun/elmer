import { describe, it, expect, vi } from "vitest";
import {
  parseGitmodules,
  parseGitHubUrl,
  detectSubmodules,
  isPathInSubmodule,
  getSubmoduleRelativePath,
} from "../submodule-detector";
import type { DiscoveredSubmodule } from "../types";

describe("parseGitmodules", () => {
  it("parses single submodule entry", () => {
    const content = `[submodule "elephant-ai"]
	path = elephant-ai
	url = https://github.com/org/elephant-ai.git`;

    const entries = parseGitmodules(content);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      name: "elephant-ai",
      path: "elephant-ai",
      url: "https://github.com/org/elephant-ai.git",
    });
  });

  it("parses multiple submodule entries", () => {
    const content = `[submodule "frontend"]
	path = packages/frontend
	url = https://github.com/org/frontend.git
	branch = main

[submodule "backend"]
	path = packages/backend
	url = git@github.com:org/backend.git`;

    const entries = parseGitmodules(content);

    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe("frontend");
    expect(entries[0].path).toBe("packages/frontend");
    expect(entries[0].branch).toBe("main");
    expect(entries[1].name).toBe("backend");
    expect(entries[1].path).toBe("packages/backend");
  });

  it("handles empty content", () => {
    expect(parseGitmodules("")).toHaveLength(0);
  });

  it("handles malformed content gracefully", () => {
    const content = `not a valid gitmodules file
some random text`;

    expect(parseGitmodules(content)).toHaveLength(0);
  });

  it("handles partial entries (missing required fields)", () => {
    const content = `[submodule "incomplete"]
	path = some/path`;

    // Should not include entries missing url
    expect(parseGitmodules(content)).toHaveLength(0);
  });
});

describe("parseGitHubUrl", () => {
  it("parses HTTPS URL", () => {
    const result = parseGitHubUrl("https://github.com/owner/repo.git");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses HTTPS URL without .git suffix", () => {
    const result = parseGitHubUrl("https://github.com/owner/repo");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses SSH URL", () => {
    const result = parseGitHubUrl("git@github.com:owner/repo.git");
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });

  it("returns null for non-GitHub URL", () => {
    expect(parseGitHubUrl("https://gitlab.com/owner/repo.git")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(parseGitHubUrl("not a url")).toBeNull();
  });
});

describe("isPathInSubmodule", () => {
  const submodules: DiscoveredSubmodule[] = [
    {
      name: "frontend",
      path: "packages/frontend",
      url: "https://github.com/org/frontend.git",
      canScan: true,
      requiresAuth: false,
      scanned: false,
      initiatives: [],
      contextPaths: [],
    },
    {
      name: "shared",
      path: "shared",
      url: "https://github.com/org/shared.git",
      canScan: true,
      requiresAuth: false,
      scanned: false,
      initiatives: [],
      contextPaths: [],
    },
  ];

  it("detects path inside submodule", () => {
    const result = isPathInSubmodule(
      "packages/frontend/src/index.ts",
      submodules,
    );
    expect(result?.name).toBe("frontend");
  });

  it("detects exact submodule path", () => {
    const result = isPathInSubmodule("shared", submodules);
    expect(result?.name).toBe("shared");
  });

  it("returns null for path outside submodules", () => {
    const result = isPathInSubmodule("src/app/page.tsx", submodules);
    expect(result).toBeNull();
  });

  it("handles empty submodules array", () => {
    const result = isPathInSubmodule("any/path", []);
    expect(result).toBeNull();
  });
});

describe("getSubmoduleRelativePath", () => {
  const submodule: DiscoveredSubmodule = {
    name: "frontend",
    path: "packages/frontend",
    url: "https://github.com/org/frontend.git",
    canScan: true,
    requiresAuth: false,
    scanned: false,
    initiatives: [],
    contextPaths: [],
  };

  it("returns relative path within submodule", () => {
    const result = getSubmoduleRelativePath(
      "packages/frontend/src/index.ts",
      submodule,
    );
    expect(result).toBe("src/index.ts");
  });

  it("returns empty string for exact submodule path", () => {
    const result = getSubmoduleRelativePath("packages/frontend", submodule);
    expect(result).toBe("");
  });

  it("handles nested paths", () => {
    const result = getSubmoduleRelativePath(
      "packages/frontend/src/components/prototypes/Feature.tsx",
      submodule,
    );
    expect(result).toBe("src/components/prototypes/Feature.tsx");
  });
});

describe("detectSubmodules", () => {
  it("returns empty array when .gitmodules not in tree", async () => {
    const mockOctokit = {} as any;

    const result = await detectSubmodules({
      owner: "test",
      repo: "repo",
      branch: "main",
      octokit: mockOctokit,
      treeEntries: [
        { path: "src", type: "tree" },
        { path: "README.md", type: "blob" },
      ],
    });

    expect(result).toHaveLength(0);
  });

  it("parses submodules when .gitmodules exists", async () => {
    const gitmodulesContent = Buffer.from(
      `[submodule "frontend"]
	path = frontend
	url = https://github.com/org/frontend.git`,
    ).toString("base64");

    const mockOctokit = {
      repos: {
        getContent: vi.fn().mockResolvedValue({
          data: { content: gitmodulesContent },
        }),
      },
    } as any;

    const result = await detectSubmodules({
      owner: "org",
      repo: "repo",
      branch: "main",
      octokit: mockOctokit,
      treeEntries: [
        { path: ".gitmodules", type: "blob" },
        { path: "frontend", type: "tree" },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("frontend");
    expect(result[0].path).toBe("frontend");
    expect(result[0].requiresAuth).toBe(false); // Same org
    expect(result[0].scanned).toBe(false);
  });

  it("marks cross-org submodules as requiring auth when access check fails", async () => {
    const gitmodulesContent = Buffer.from(
      `[submodule "external"]
	path = external
	url = https://github.com/other-org/external.git`,
    ).toString("base64");

    const mockOctokit = {
      repos: {
        getContent: vi.fn().mockResolvedValue({
          data: { content: gitmodulesContent },
        }),
        // Simulate 404 for access check (no access to cross-org repo)
        get: vi.fn().mockRejectedValue({ status: 404 }),
      },
    } as any;

    const result = await detectSubmodules({
      owner: "my-org",
      repo: "repo",
      branch: "main",
      octokit: mockOctokit,
      treeEntries: [{ path: ".gitmodules", type: "blob" }],
    });

    expect(result).toHaveLength(1);
    expect(result[0].requiresAuth).toBe(true); // No access verified
  });

  it("allows cross-org submodules when access check succeeds", async () => {
    const gitmodulesContent = Buffer.from(
      `[submodule "external"]
	path = external
	url = https://github.com/other-org/external.git`,
    ).toString("base64");

    const mockOctokit = {
      repos: {
        getContent: vi.fn().mockResolvedValue({
          data: { content: gitmodulesContent },
        }),
        // Simulate successful access check (user has access to cross-org repo)
        get: vi.fn().mockResolvedValue({
          data: { name: "external", full_name: "other-org/external" },
        }),
      },
    } as any;

    const result = await detectSubmodules({
      owner: "my-org",
      repo: "repo",
      branch: "main",
      octokit: mockOctokit,
      treeEntries: [{ path: ".gitmodules", type: "blob" }],
    });

    expect(result).toHaveLength(1);
    expect(result[0].requiresAuth).toBe(false); // Has access despite different org
    expect(result[0].canScan).toBe(true);
  });
});
