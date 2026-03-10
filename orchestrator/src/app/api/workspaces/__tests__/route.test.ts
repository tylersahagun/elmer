import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// getCurrentAppUser is no longer used by the workspaces route (removed Drizzle bridge)

vi.mock("@/lib/convex/server", () => ({
  listConvexWorkspaces: vi.fn(),
  createConvexWorkspace: vi.fn(),
}));

import { GET, POST } from "../route";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  createConvexWorkspace,
  listConvexWorkspaces,
} from "@/lib/convex/server";

const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);
const mockListConvexWorkspaces = vi.mocked(listConvexWorkspaces);
const mockCreateConvexWorkspace = vi.mocked(createConvexWorkspace);
let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

function mockClerkAuth(userId: string | null) {
  return {
    userId,
    sessionId: null,
    sessionClaims: null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    factorVerificationAge: null,
    getToken: vi.fn(),
    has: vi.fn(),
    debug: vi.fn(),
    redirectToSignIn: vi.fn(),
    protect: vi.fn(),
  } as unknown as Awaited<ReturnType<typeof auth>>;
}

describe("workspaces route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockAuth.mockResolvedValue(mockClerkAuth("clerk_user_1"));
    mockCurrentUser.mockResolvedValue({
      id: "clerk_user_1",
      username: "user-example",
      fullName: "User Example",
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: {
        emailAddress: "user@example.com",
      },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);
    // No getCurrentAppUser mock needed — route uses Clerk identity directly
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("returns Clerk-scoped workspaces from Convex", async () => {
    mockListConvexWorkspaces.mockResolvedValue([
      {
        id: "ws_1",
        name: "Workspace 1",
        description: null,
        role: "admin",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockListConvexWorkspaces).toHaveBeenCalledWith(
      "clerk_user_1",
      "user@example.com",
    );
    expect(data).toEqual([
      {
        id: "ws_1",
        name: "Workspace 1",
        description: null,
        role: "admin",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ]);
  });

  it("returns 401 when Clerk user identity is missing", async () => {
    mockAuth.mockResolvedValue(mockClerkAuth(null));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
    expect(mockListConvexWorkspaces).not.toHaveBeenCalled();
  });

  it("creates a workspace through the Convex bridge", async () => {
    mockCreateConvexWorkspace.mockResolvedValue({
      id: "ws_2",
      name: "New Workspace",
      description: null,
      role: "admin",
      updatedAt: "2026-03-07T00:00:00.000Z",
    });

    const request = new NextRequest("http://localhost:3000/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Workspace" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(mockCreateConvexWorkspace).toHaveBeenCalledWith({
      clerkUserId: "clerk_user_1",
      name: "New Workspace",
      slug: "new-workspace",
      description: undefined,
      githubRepo: undefined,
      contextPath: undefined,
      actorUserId: "clerk_user_1",
      actorEmail: "user@example.com",
      actorName: "User Example",
      actorImage: "https://example.com/avatar.png",
    });
    expect(data.id).toBe("ws_2");
  });

  it("creates a workspace using Clerk user ID as actorUserId (no Drizzle bridge)", async () => {
    mockCreateConvexWorkspace.mockResolvedValue({
      id: "ws_3",
      name: "Clerk Only Workspace",
      description: null,
      role: "admin",
      updatedAt: "2026-03-07T00:00:00.000Z",
    });

    const request = new NextRequest("http://localhost:3000/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Clerk Only Workspace" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockCreateConvexWorkspace).toHaveBeenCalledWith({
      clerkUserId: "clerk_user_1",
      name: "Clerk Only Workspace",
      slug: "clerk-only-workspace",
      description: undefined,
      githubRepo: undefined,
      contextPath: undefined,
      actorUserId: "clerk_user_1",
      actorEmail: "user@example.com",
      actorName: "User Example",
      actorImage: "https://example.com/avatar.png",
    });
  });

  it("returns 400 when the workspace name is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "missing name" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Name is required");
    expect(mockCreateConvexWorkspace).not.toHaveBeenCalled();
  });

  it("returns 409 when the Convex workspace slug is already taken", async () => {
    mockCreateConvexWorkspace.mockRejectedValue(
      new Error('Workspace slug "new-workspace" already taken'),
    );

    const request = new NextRequest("http://localhost:3000/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Workspace" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain("already taken");
  });
});
