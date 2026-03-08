import { describe, expect, it } from "vitest";
import { resolveBoardWorkspaceState } from "../workspace-state";

describe("resolveBoardWorkspaceState", () => {
  it("shows not found when workspace is missing and access has not been confirmed", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: null,
        hasPersistedWorkspace: false,
        hasConfirmedWorkspaceAccess: false,
      }).showNotFound,
    ).toBe(true);
  });

  it("keeps the board visible once workspace access has already been confirmed", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: null,
        hasPersistedWorkspace: false,
        hasConfirmedWorkspaceAccess: true,
      }).showNotFound,
    ).toBe(false);
  });

  it("keeps the board visible when the workspace is already persisted locally", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: null,
        hasPersistedWorkspace: true,
        hasConfirmedWorkspaceAccess: false,
      }).showNotFound,
    ).toBe(false);
  });
});
