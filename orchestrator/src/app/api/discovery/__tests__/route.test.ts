/**
 * Tests for discovery API endpoint.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock GitHub client
vi.mock("@/lib/github/auth", () => ({
  getGitHubClient: vi.fn(),
}));

// Mock database queries
vi.mock("@/lib/db/queries", () => ({
  getWorkspace: vi.fn(),
}));

// Mock scanner
vi.mock("@/lib/discovery", () => ({
  scanRepository: vi.fn(),
}));

import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";
import { getWorkspace } from "@/lib/db/queries";
import { scanRepository } from "@/lib/discovery";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetGitHubClient = getGitHubClient as ReturnType<typeof vi.fn>;
const mockGetWorkspace = getWorkspace as ReturnType<typeof vi.fn>;
const mockScanRepository = scanRepository as ReturnType<typeof vi.fn>;

function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost/api/discovery");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url);
}

describe("GET /api/discovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns 401 without auth", async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Not authenticated");
    });

    it("returns 401 without user ID", async () => {
      mockAuth.mockResolvedValue({ user: {} });

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Not authenticated");
    });
  });

  describe("parameter validation", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ user: { id: "user_123" } });
    });

    it("returns 400 without workspaceId", async () => {
      const response = await GET(createRequest());
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("workspaceId required");
    });

    it("returns 404 for missing workspace", async () => {
      mockGetWorkspace.mockResolvedValue(null);

      const response = await GET(createRequest({ workspaceId: "ws_notfound" }));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Workspace not found");
    });

    it("returns 400 when no repository connected", async () => {
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: null,
      });

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No repository connected");
    });

    it("returns 400 for invalid repository format", async () => {
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: "invalid-format",
      });

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid repository format");
    });
  });

  describe("GitHub authentication", () => {
    beforeEach(() => {
      mockAuth.mockResolvedValue({ user: { id: "user_123" } });
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: "acme/product",
      });
    });

    it("returns 403 when GitHub not connected", async () => {
      mockGetGitHubClient.mockResolvedValue(null);

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("GitHub not connected");
      expect(data.connectUrl).toBe("/api/auth/signin/github");
    });
  });

  describe("discovery execution", () => {
    const mockOctokit = { git: { getTree: vi.fn() } };

    beforeEach(() => {
      mockAuth.mockResolvedValue({ user: { id: "user_123" } });
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: "acme/product",
        onboardingData: { selectedBranch: "develop" },
        settings: { baseBranch: "main" },
      });
      mockGetGitHubClient.mockResolvedValue(mockOctokit);
    });

    it("calls scanRepository with correct options", async () => {
      const mockResult = {
        repoOwner: "acme",
        repoName: "product",
        branch: "develop",
        scannedAt: "2026-01-26T00:00:00Z",
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
      };
      mockScanRepository.mockResolvedValue(mockResult);

      const response = await GET(createRequest({ workspaceId: "ws_123" }));

      expect(mockScanRepository).toHaveBeenCalledWith({
        workspaceId: "ws_123",
        owner: "acme",
        repo: "product",
        branch: "develop", // Uses onboarding data branch first
        octokit: mockOctokit,
      });
      expect(response.status).toBe(200);
    });

    it("returns discovery results", async () => {
      const mockResult = {
        repoOwner: "acme",
        repoName: "product",
        branch: "develop",
        scannedAt: "2026-01-26T00:00:00Z",
        initiatives: [
          {
            id: "proj_abc123",
            name: "Feature A",
            sourcePath: "initiatives/feature-a",
            mappedColumn: "discovery",
          },
        ],
        contextPaths: [
          {
            type: "knowledge",
            path: "knowledge",
            fileCount: 5,
          },
        ],
        agents: [
          {
            type: "agents_md",
            name: "AGENTS.md",
            path: "AGENTS.md",
          },
        ],
        stats: {
          foldersScanned: 10,
          initiativesFound: 1,
          contextPathsFound: 1,
          agentsFound: 1,
          metaJsonParsed: 1,
          metaJsonErrors: 0,
        },
        warnings: [],
      };
      mockScanRepository.mockResolvedValue(mockResult);

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.initiatives).toHaveLength(1);
      expect(data.contextPaths).toHaveLength(1);
      expect(data.agents).toHaveLength(1);
    });

    it("uses settings branch when no onboarding branch", async () => {
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: "acme/product",
        settings: { baseBranch: "staging" },
      });
      mockScanRepository.mockResolvedValue({
        initiatives: [],
        contextPaths: [],
        agents: [],
        stats: {},
        warnings: [],
      });

      await GET(createRequest({ workspaceId: "ws_123" }));

      expect(mockScanRepository).toHaveBeenCalledWith(
        expect.objectContaining({ branch: "staging" })
      );
    });

    it("defaults to main branch", async () => {
      mockGetWorkspace.mockResolvedValue({
        id: "ws_123",
        name: "Test Workspace",
        githubRepo: "acme/product",
      });
      mockScanRepository.mockResolvedValue({
        initiatives: [],
        contextPaths: [],
        agents: [],
        stats: {},
        warnings: [],
      });

      await GET(createRequest({ workspaceId: "ws_123" }));

      expect(mockScanRepository).toHaveBeenCalledWith(
        expect.objectContaining({ branch: "main" })
      );
    });

    it("returns 500 on scanner error", async () => {
      mockScanRepository.mockRejectedValue(new Error("API rate limit"));

      const response = await GET(createRequest({ workspaceId: "ws_123" }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("API rate limit");
    });
  });
});
