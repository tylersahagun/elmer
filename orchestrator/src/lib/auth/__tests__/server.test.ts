import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getUserByEmail: vi.fn(),
  upsertUserByEmail: vi.fn(),
}));

import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { getUserByEmail, upsertUserByEmail } from "@/lib/db/queries";
import {
  AppAuthenticationError,
  getAppUserByEmail,
  getCurrentAppUser,
  requireCurrentAppUser,
} from "../server";

const mockClerkAuth = vi.mocked(clerkAuth);
const mockCurrentUser = vi.mocked(currentUser);
const mockGetUserByEmail = vi.mocked(getUserByEmail);
const mockUpsertUserByEmail = vi.mocked(upsertUserByEmail);

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

  it("upserts the local app user from the Clerk identity", async () => {
    mockClerkAuth.mockResolvedValue({ userId: "user_clerk_123" } as Awaited<
      ReturnType<typeof clerkAuth>
    >);
    mockCurrentUser.mockResolvedValue({
      fullName: "Tyler Sahagun",
      username: "tyler",
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: {
        emailAddress: "Tyler.Sahagun@AskElephant.ai",
      },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);
    mockUpsertUserByEmail.mockResolvedValue({
      id: "local_user_1",
      email: "tyler.sahagun@askelephant.ai",
      name: "Tyler Sahagun",
      image: "https://example.com/avatar.png",
    } as Awaited<ReturnType<typeof upsertUserByEmail>>);

    await expect(getCurrentAppUser()).resolves.toEqual({
      id: "local_user_1",
      email: "tyler.sahagun@askelephant.ai",
      name: "Tyler Sahagun",
      image: "https://example.com/avatar.png",
    });

    expect(mockUpsertUserByEmail).toHaveBeenCalledWith({
      email: "Tyler.Sahagun@AskElephant.ai",
      name: "Tyler Sahagun",
      image: "https://example.com/avatar.png",
    });
  });

  it("throws when requireCurrentAppUser cannot resolve a user", async () => {
    mockClerkAuth.mockResolvedValue({ userId: null } as Awaited<
      ReturnType<typeof clerkAuth>
    >);

    await expect(requireCurrentAppUser()).rejects.toBeInstanceOf(
      AppAuthenticationError,
    );
  });

  it("looks up an existing local app user by email", async () => {
    mockGetUserByEmail.mockResolvedValue({
      id: "local_user_2",
      email: "user@example.com",
      name: "User Example",
      image: null,
    } as Awaited<ReturnType<typeof getUserByEmail>>);

    await expect(getAppUserByEmail("User@Example.com")).resolves.toEqual({
      id: "local_user_2",
      clerkUserId: "local_user_2",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
  });
});
