import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

import { auth, currentUser } from "@clerk/nextjs/server";

const mockAuth = vi.mocked(auth);
const mockCurrentUser = vi.mocked(currentUser);

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the Clerk identity as the current user", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>);
    mockCurrentUser.mockResolvedValue({
      id: "clerk_user_1",
      fullName: "User Example",
      username: null,
      imageUrl: "https://example.com/avatar.png",
      primaryEmailAddress: { emailAddress: "user@example.com" },
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: "clerk_user_1",
      clerkUserId: "clerk_user_1",
      email: "user@example.com",
      name: "User Example",
      image: "https://example.com/avatar.png",
    });
  });

  it("returns 401 when there is no Clerk session", async () => {
    mockAuth.mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  it("returns 401 when Clerk user has no email", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_user_1" } as Awaited<ReturnType<typeof auth>>);
    mockCurrentUser.mockResolvedValue({
      id: "clerk_user_1",
      fullName: "No Email",
      primaryEmailAddress: null,
      emailAddresses: [],
    } as unknown as Awaited<ReturnType<typeof currentUser>>);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });
});
