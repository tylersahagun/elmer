import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@/lib/convex/server", () => ({
  getConvexWorkspaceAccess: vi.fn(),
  listConvexWorkspaceMembers: vi.fn(),
}));

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getConvexWorkspaceAccess, listConvexWorkspaceMembers } from "@/lib/convex/server";
import {
  InsufficientRoleError,
  NotMemberError,
  UnauthenticatedError,
  requireWorkspaceAccess,
} from "../permissions";

const mockClerkAuth = vi.mocked(clerkAuth);
const mockCurrentUser = vi.mocked(currentUser);
const mockGetConvexWorkspaceAccess = vi.mocked(getConvexWorkspaceAccess);
const mockListConvexWorkspaceMembers = vi.mocked(listConvexWorkspaceMembers);

const noEmailClerkUser = {
  id: "clerk_user_123",
  primaryEmailAddress: null,
  emailAddresses: [],
} as unknown as Awaited<ReturnType<typeof currentUser>>;

describe("requireWorkspaceAccess", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockListConvexWorkspaceMembers.mockResolvedValue([] as Awaited<
      ReturnType<typeof listConvexWorkspaceMembers>
    >);
    mockCurrentUser.mockResolvedValue(noEmailClerkUser);
  });

  it("returns Convex membership by Clerk user ID — primary path", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue({
      membership: {
        workspaceId: "ws_123",
        role: "admin",
      },
    });

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
  });

  it("throws not-member when Convex membership is absent and no email bridge matches", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    // No matching member by email
    mockListConvexWorkspaceMembers.mockResolvedValue([]);

    await expect(requireWorkspaceAccess("ws_123")).rejects.toBeInstanceOf(
      NotMemberError,
    );
  });

  it("bridges Convex membership by Clerk email when the Clerk ID mirror is stale", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_new" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockCurrentUser.mockResolvedValue({
      id: "clerk_user_new",
      primaryEmailAddress: { emailAddress: "user@example.com" },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);
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
    expect(membership).toEqual({
      id: "member_123",
      userId: "legacy_user_123",
      workspaceId: "ws_123",
      role: "member",
      joinedAt: new Date("2026-03-07T00:00:00.000Z"),
    });
  });

  it("allows coordinator viewer access when the Convex member mirror is empty", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "user_3AYHC3SLAA3cY6m7Nz7npZqIrF4" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockCurrentUser.mockResolvedValue({
      id: "user_3AYHC3SLAA3cY6m7Nz7npZqIrF4",
      primaryEmailAddress: { emailAddress: "tylersahagun@gmail.com" },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);
    mockListConvexWorkspaceMembers.mockResolvedValue([]);

    const membership = await requireWorkspaceAccess(
      "mn7e43jc0m7bc5jn708d3ye4e182a7me",
      "viewer",
    );

    expect(membership).toEqual({
      id: "mn7e43jc0m7bc5jn708d3ye4e182a7me:user_3AYHC3SLAA3cY6m7Nz7npZqIrF4:internal-viewer",
      userId: "user_3AYHC3SLAA3cY6m7Nz7npZqIrF4",
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

  it("throws not-member when Convex returns null and no email matches", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "clerk_user_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockGetConvexWorkspaceAccess.mockResolvedValue(null);
    mockListConvexWorkspaceMembers.mockResolvedValue([]);

    await expect(requireWorkspaceAccess("ws_123")).rejects.toBeInstanceOf(
      NotMemberError,
    );
  });

  it("throws insufficient-role when Convex membership role is too weak", async () => {
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
});
