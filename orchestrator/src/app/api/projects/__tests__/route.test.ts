import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/git/branches", () => ({
  buildFeatureBranchName: vi.fn(() => "feature/test-branch"),
}));

vi.mock("@/lib/activity", () => ({
  logProjectCreated: vi.fn(),
}));

vi.mock("@/lib/convex/server", () => ({
  createConvexProject: vi.fn(),
  getConvexWorkspace: vi.fn(),
  listConvexProjects: vi.fn(),
}));

vi.mock("@/lib/permissions", () => {
  class MockPermissionError extends Error {}

  return {
    requireWorkspaceAccess: vi.fn(),
    handlePermissionError: vi.fn((error: Error) => ({
      error: error.message,
      status: 403,
    })),
    PermissionError: MockPermissionError,
  };
});

import { listConvexProjects } from "@/lib/convex/server";
import {
  PermissionError,
  requireWorkspaceAccess,
} from "@/lib/permissions";
import { GET } from "../route";

const mockListConvexProjects = vi.mocked(listConvexProjects);
const mockRequireWorkspaceAccess = vi.mocked(requireWorkspaceAccess);

describe("/api/projects GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns projects for an authorized workspace request", async () => {
    const createdAtMs = 1_700_000_000_000;
    mockRequireWorkspaceAccess.mockResolvedValue({
      id: "membership_123",
      userId: "user_123",
      workspaceId: "ws_123",
      role: "viewer",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });
    mockListConvexProjects.mockResolvedValue([
      {
        _id: "project_123",
        _creationTime: createdAtMs,
        workspaceId: "ws_123",
        name: "Alpha Project",
        description: "Test project",
        stage: "discovery",
        status: "active",
        priority: "P1",
        metadata: { source: "test" },
      },
    ]);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/projects?workspaceId=ws_123"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockRequireWorkspaceAccess).toHaveBeenCalledWith("ws_123", "viewer");
    expect(mockListConvexProjects).toHaveBeenCalledWith("ws_123");
    expect(data).toEqual([
      {
        id: "project_123",
        workspaceId: "ws_123",
        name: "Alpha Project",
        description: "Test project",
        stage: "discovery",
        status: "active",
        priority: 1,
        createdAt: new Date(createdAtMs).toISOString(),
        updatedAt: new Date(createdAtMs).toISOString(),
        metadata: { source: "test" },
        documentCount: 0,
        prototypeCount: 0,
        signalCount: 0,
      },
    ]);
  });

  it("returns handled permission responses instead of a generic 500", async () => {
    mockRequireWorkspaceAccess.mockRejectedValue(
      new PermissionError("Authentication required", "UNAUTHENTICATED", 401),
    );

    const response = await GET(
      new NextRequest("http://localhost:3000/api/projects?workspaceId=ws_123"),
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: "Authentication required" });
  });
});
