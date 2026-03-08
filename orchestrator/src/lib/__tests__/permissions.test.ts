import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  AppAuthenticationError: class MockAppAuthenticationError extends Error {},
  getCurrentAppUser: vi.fn(),
  requireCurrentAppUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getWorkspaceMembership: vi.fn(),
}));

vi.mock("@/lib/convex/server", () => ({
  getConvexWorkspaceAccess: vi.fn(),
  listConvexWorkspaceMembers: vi.fn(),
}));

import { auth as clerkAuth } from "@clerk/nextjs/server";
import {
  AppAuthenticationError,
  getCurrentAppUser,
  requireCurrentAppUser,
} from "@/lib/auth/server";
import { getWorkspaceMembership } from "@/lib/db/queries";
import { getConvexWorkspaceAccess, listConvexWorkspaceMembers } from "@/lib/convex/server";
import {
  InsufficientRoleError,
  NotMemberError,
  UnauthenticatedError,
  requireWorkspaceAccess,
} from "../permissions";

const mockClerkAuth = vi.mocked(clerkAuth);
const mockGetCurrentAppUser = vi.mocked(getCurrentAppUser);
const mockRequireCurrentAppUser = vi.mocked(requireCurrentAppUser);
const mockGetWorkspaceMembership = vi.mocked(getWorkspaceMembership);
const mockGetConvexWorkspaceAccess = vi.mocked(getConvexWorkspaceAccess);
const mockListConvexWorkspaceMembers = vi.mocked(listConvexWorkspaceMembers);

describe("requireWorkspaceAccess", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListConvexWorkspaceMembers.mockResolvedValue([] as Awaited<
      ReturnType<typeof listConvexWorkspaceMembers>
    >);
  });

  it("returns convex membership even when local app-user resolution fails", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue({
      membership: {
        workspaceId: "ws_123",
        role: "admin",
      },
    });
    mockGetCurrentAppUser.mockRejectedValue(new Error("users table missing"));

    const membership = await requireWorkspaceAccess("ws_123", "viewer");

    expect(mockGetConvexWorkspaceAccess).toHaveBeenCalledWith(
      "ws_123",
      "clerk_user_123",
    );
    expect(membership).toEqual({
      id: "ws_123:clerk_user_123",
      userId: "clerk_user_123",
      workspaceId: "ws_123",
      role: "admin",
      joinedAt: expect.any(Date),
    });
    expect(mockRequireCurrentAppUser).not.toHaveBeenCalled();
  });

  it("falls back to legacy membership when convex membership is absent", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockRequireCurrentAppUser.mockResolvedValue({
      id: "app_user_123",
      clerkUserId: "clerk_user_123",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
    mockGetWorkspaceMembership.mockResolvedValue({
      id: "membership_123",
      workspaceId: "ws_123",
      role: "member",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });

    const membership = await requireWorkspaceAccess("ws_123", "viewer");

    expect(mockRequireCurrentAppUser).toHaveBeenCalled();
    expect(mockGetWorkspaceMembership).toHaveBeenCalledWith(
      "ws_123",
      "app_user_123",
    );
    expect(membership).toEqual({
      id: "membership_123",
      userId: "app_user_123",
      workspaceId: "ws_123",
      role: "member",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });
  });

  it("bridges Convex membership by email when the clerk id mirror is stale", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_new" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockGetCurrentAppUser.mockResolvedValue({
      id: "app_user_123",
      clerkUserId: "clerk_user_new",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
    mockListConvexWorkspaceMembers.mockResolvedValue([
      {
        _id: "member_123",
        userId: "legacy_user_123",
        clerkUserId: "stale_clerk_user",
        email: "user@example.com",
        role: "member",
        joinedAt: Date.parse("2026-03-07T00:00:00.000Z"),
      },
    ] as Awaited<ReturnType<typeof listConvexWorkspaceMembers>>);

    const membership = await requireWorkspaceAccess("ws_123", "viewer");

    expect(mockListConvexWorkspaceMembers).toHaveBeenCalledWith("ws_123");
    expect(mockRequireCurrentAppUser).not.toHaveBeenCalled();
    expect(membership).toEqual({
      id: "member_123",
      userId: "app_user_123",
      workspaceId: "ws_123",
      role: "member",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });
  });

  it("allows viewer access to the coordinator workspace when the Convex member mirror is empty", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_internal" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockGetCurrentAppUser.mockResolvedValue({
      id: "app_user_internal",
      clerkUserId: "clerk_user_internal",
      email: "tylersahagun@gmail.com",
      name: "Tyler Sahagun",
      image: null,
    });

    const membership = await requireWorkspaceAccess(
      "mn7e43jc0m7bc5jn708d3ye4e182a7me",
      "viewer",
    );

    expect(mockListConvexWorkspaceMembers).toHaveBeenCalledWith(
      "mn7e43jc0m7bc5jn708d3ye4e182a7me",
    );
    expect(mockRequireCurrentAppUser).not.toHaveBeenCalled();
    expect(membership).toEqual({
      id: "mn7e43jc0m7bc5jn708d3ye4e182a7me:clerk_user_internal:internal-viewer",
      userId: "app_user_internal",
      workspaceId: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
      role: "viewer",
      joinedAt: expect.any(Date),
    });
  });

  it("throws unauthenticated when there is no Clerk session", async () => {
    mockClerkAuth.mockResolvedValue({ userId: null } as Awaited<
      ReturnType<typeof clerkAuth>
    >);

    await expect(requireWorkspaceAccess("ws_123")).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
  });

  it("throws not-member when neither convex nor legacy membership exists", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockRequireCurrentAppUser.mockResolvedValue({
      id: "app_user_123",
      clerkUserId: "clerk_user_123",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
    mockGetWorkspaceMembership.mockResolvedValue(null);

    await expect(requireWorkspaceAccess("ws_123")).rejects.toBeInstanceOf(
      NotMemberError,
    );
  });

  it("throws insufficient-role when convex membership is too weak", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue({
      membership: {
        workspaceId: "ws_123",
        role: "viewer",
      },
    });

    await expect(
      requireWorkspaceAccess("ws_123", "admin"),
    ).rejects.toBeInstanceOf(InsufficientRoleError);
  });

  it("maps legacy app auth failure to unauthenticated", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockRequireCurrentAppUser.mockRejectedValue(new AppAuthenticationError());

    await expect(requireWorkspaceAccess("ws_123")).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
  });
});
