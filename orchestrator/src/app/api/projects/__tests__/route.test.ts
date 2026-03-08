import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/queries", () => ({
  createJob: vi.fn(),
  createProject: vi.fn(),
  getProjectsWithCounts: vi.fn(),
  getWorkspace: vi.fn(),
}));

vi.mock("@/lib/git/branches", () => ({
  buildFeatureBranchName: vi.fn(() => "feature/test-branch"),
}));

vi.mock("@/lib/activity", () => ({
  logProjectCreated: vi.fn(),
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

import { getProjectsWithCounts } from "@/lib/db/queries";
import {
  PermissionError,
  requireWorkspaceAccess,
} from "@/lib/permissions";
import { GET } from "../route";

const mockGetProjectsWithCounts = vi.mocked(getProjectsWithCounts);
const mockRequireWorkspaceAccess = vi.mocked(requireWorkspaceAccess);

describe("/api/projects GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns projects for an authorized workspace request", async () => {
    mockRequireWorkspaceAccess.mockResolvedValue({
      id: "membership_123",
      userId: "user_123",
      workspaceId: "ws_123",
      role: "viewer",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });
    mockGetProjectsWithCounts.mockResolvedValue([
      { id: "project_123", name: "Alpha Project" },
    ] as Awaited<ReturnType<typeof getProjectsWithCounts>>);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/projects?workspaceId=ws_123"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockRequireWorkspaceAccess).toHaveBeenCalledWith("ws_123", "viewer");
    expect(mockGetProjectsWithCounts).toHaveBeenCalledWith("ws_123", {
      includeArchived: false,
    });
    expect(data).toEqual([{ id: "project_123", name: "Alpha Project" }]);
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
    expect(mockGetProjectsWithCounts).not.toHaveBeenCalled();
  });
});
