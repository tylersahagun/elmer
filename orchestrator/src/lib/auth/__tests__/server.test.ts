import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import {
  AppAuthenticationError,
  getCurrentAppUser,
  requireCurrentAppUser,
} from "../server";

const mockClerkAuth = vi.mocked(clerkAuth);
const mockCurrentUser = vi.mocked(currentUser);

describe("auth server helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no Clerk session", async () => {
    mockClerkAuth.mockResolvedValue({ userId: null } as Awaited<
      ReturnType<typeof clerkAuth>
    >);

    await expect(getCurrentAppUser()).resolves.toBeNull();
    expect(mockCurrentUser).not.toHaveBeenCalled();
  });

  it("returns Clerk identity as AppUser without any Postgres lookup", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "user_clerk_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockCurrentUser.mockResolvedValue({
      id: "user_clerk_123",
      fullName: "Tyler Sahagun",
      username: "tyler",
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: {
        emailAddress: "tyler.sahagun@askelephant.ai",
      },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);

    await expect(getCurrentAppUser()).resolves.toEqual({
      id: "user_clerk_123",
      clerkUserId: "user_clerk_123",
      email: "tyler.sahagun@askelephant.ai",
      name: "Tyler Sahagun",
      image: "https://example.com/avatar.png",
    });
  });

  it("returns null when Clerk user has no email", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "user_clerk_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockCurrentUser.mockResolvedValue({
      id: "user_clerk_123",
      fullName: "No Email User",
      primaryEmailAddress: null,
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);

    await expect(getCurrentAppUser()).resolves.toBeNull();
  });

  it("throws when requireCurrentAppUser cannot resolve a user", async () => {
    mockClerkAuth.mockResolvedValue({ userId: null } as Awaited<
      ReturnType<typeof clerkAuth>
    >);

    await expect(requireCurrentAppUser()).rejects.toBeInstanceOf(
      AppAuthenticationError,
    );
  });
});
