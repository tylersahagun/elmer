import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

vi.mock("@/lib/auth/server", () => ({
  AppAuthenticationError: class AppAuthenticationError extends Error {},
  requireCurrentAppUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getWorkspacesForUser: vi.fn(),
  createWorkspace: vi.fn(),
}));

vi.mock("@/lib/knowledgebase/sync", () => ({
  syncKnowledgeBase: vi.fn(),
}));

vi.mock("@/lib/github/auth", () => ({
  getGitHubClient: vi.fn(),
}));

import {
  AppAuthenticationError,
  requireCurrentAppUser,
} from "@/lib/auth/server";
import { createWorkspace, getWorkspacesForUser } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { getGitHubClient } from "@/lib/github/auth";

const mockRequireCurrentAppUser = vi.mocked(requireCurrentAppUser);
const mockGetWorkspacesForUser = vi.mocked(getWorkspacesForUser);
const mockCreateWorkspace = vi.mocked(createWorkspace);
const mockSyncKnowledgeBase = vi.mocked(syncKnowledgeBase);
const mockGetGitHubClient = vi.mocked(getGitHubClient);

describe("workspaces route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns current user workspaces", async () => {
    mockRequireCurrentAppUser.mockResolvedValue({
      id: "local_user_1",
      clerkUserId: "clerk_user_1",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
    mockGetWorkspacesForUser.mockResolvedValue([
      { id: "ws_1", name: "Workspace 1", role: "admin" },
    ] as Awaited<ReturnType<typeof getWorkspacesForUser>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetWorkspacesForUser).toHaveBeenCalledWith("local_user_1");
    expect(data).toHaveLength(1);
  });

  it("returns 401 when the current app user cannot be resolved", async () => {
    mockRequireCurrentAppUser.mockRejectedValue(
      new AppAuthenticationError("Authentication required"),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("creates a workspace with the resolved local user id", async () => {
    mockRequireCurrentAppUser.mockResolvedValue({
      id: "local_user_2",
      clerkUserId: "clerk_user_2",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
    mockCreateWorkspace.mockResolvedValue({
      id: "ws_2",
      name: "New Workspace",
    } as Awaited<ReturnType<typeof createWorkspace>>);
    mockGetGitHubClient.mockResolvedValue(null);
    mockSyncKnowledgeBase.mockResolvedValue({
      synced: 0,
      skipped: 0,
      details: [],
      errors: [],
    } as unknown as Awaited<ReturnType<typeof syncKnowledgeBase>>);

    const request = new NextRequest("http://localhost:3000/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Workspace" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(mockCreateWorkspace).toHaveBeenCalledWith({
      name: "New Workspace",
      description: undefined,
      githubRepo: undefined,
      contextPath: undefined,
      userId: "local_user_2",
    });
    expect(mockSyncKnowledgeBase).toHaveBeenCalledWith("ws_2", {
      octokit: undefined,
    });
    expect(data.id).toBe("ws_2");
  });
});
