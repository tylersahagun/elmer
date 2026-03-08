import { describe, expect, it } from "vitest";
import { resolveBoardWorkspaceState } from "../workspace-state";

const workspace = {
  _id: "mn7e43jc0m7bc5jn708d3ye4e182a7me",
  _creationTime: 0,
  name: "Coordinator",
  slug: "coordinator",
  description: "Coordinator workspace",
  settings: {},
} as const;

describe("resolveBoardWorkspaceState", () => {
  it("keeps the page in loading state before the first workspace response", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: undefined,
        hasPersistedWorkspace: false,
      }),
    ).toEqual({
      showNotFound: false,
    });
  });

  it("shows not found before any successful workspace load", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: null,
        hasPersistedWorkspace: false,
      }),
    ).toEqual({
      showNotFound: true,
    });
  });

  it("keeps the board mounted when a later null revalidation happens", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace: null,
        hasPersistedWorkspace: true,
      }),
    ).toEqual({
      showNotFound: false,
    });
  });

  it("does not show not found when the current workspace is loaded", () => {
    expect(
      resolveBoardWorkspaceState({
        workspace,
        hasPersistedWorkspace: false,
      }),
    ).toEqual({
      showNotFound: false,
    });
  });
});
