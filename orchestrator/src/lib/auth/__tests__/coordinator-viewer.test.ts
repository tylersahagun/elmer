import { describe, expect, it } from "vitest";

import {
  canUseCoordinatorViewerAccess,
  normalizeViewerEmail,
} from "../coordinator-viewer";

describe("coordinator viewer access", () => {
  it("normalizes email addresses", () => {
    expect(normalizeViewerEmail(" TylerSahagun@Gmail.com ")).toBe(
      "tylersahagun@gmail.com",
    );
  });

  it("allows the coordinator viewer fallback only on the default workspace", () => {
    expect(
      canUseCoordinatorViewerAccess({
        workspaceId: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
        email: "tylersahagun@gmail.com",
        requiredRole: "viewer",
        convexMembersCount: 0,
      }),
    ).toBe(true);

    expect(
      canUseCoordinatorViewerAccess({
        workspaceId: "ws_other",
        email: "tylersahagun@gmail.com",
        requiredRole: "viewer",
        convexMembersCount: 0,
      }),
    ).toBe(false);
  });

  it("allows the coordinator viewer fallback for the configured Clerk user id", () => {
    expect(
      canUseCoordinatorViewerAccess({
        workspaceId: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
        clerkUserId: "user_3AYHC3SLAA3cY6m7Nz7npZqIrF4",
        requiredRole: "viewer",
        convexMembersCount: 0,
      }),
    ).toBe(true);
  });

  it("does not allow member-level fallback access", () => {
    expect(
      canUseCoordinatorViewerAccess({
        workspaceId: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
        email: "tylersahagun@gmail.com",
        requiredRole: "member",
        convexMembersCount: 0,
      }),
    ).toBe(false);
  });

  it("does not allow fallback once explicit workspace members exist", () => {
    expect(
      canUseCoordinatorViewerAccess({
        workspaceId: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
        email: "tylersahagun@gmail.com",
        requiredRole: "viewer",
        convexMembersCount: 1,
      }),
    ).toBe(false);
  });
});
