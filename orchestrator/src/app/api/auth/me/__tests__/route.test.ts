import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/auth/server", () => ({
  AppAuthenticationError: class AppAuthenticationError extends Error {},
  requireCurrentAppUser: vi.fn(),
}));

import {
  AppAuthenticationError,
  requireCurrentAppUser,
} from "@/lib/auth/server";

const mockRequireCurrentAppUser = vi.mocked(requireCurrentAppUser);

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the resolved local app user", async () => {
    mockRequireCurrentAppUser.mockResolvedValue({
      id: "local_user_1",
      clerkUserId: "clerk_user_1",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: "local_user_1",
      clerkUserId: "clerk_user_1",
      email: "user@example.com",
      name: "User Example",
      image: null,
    });
  });

  it("returns 401 when there is no current app user", async () => {
    mockRequireCurrentAppUser.mockRejectedValue(
      new AppAuthenticationError("Authentication required"),
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });
});
