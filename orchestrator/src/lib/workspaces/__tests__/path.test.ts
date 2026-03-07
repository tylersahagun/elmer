import {
  getWorkspacePathSegment,
  slugifyWorkspaceName,
} from "@/lib/workspaces/path";

describe("workspace path helpers", () => {
  test("slugifyWorkspaceName: normalizes names into URL-safe slugs", () => {
    expect(slugifyWorkspaceName(" AskElephant Studio ")).toBe(
      "askelephant-studio",
    );
    expect(slugifyWorkspaceName("Roadmap///QA")).toBe("roadmap-qa");
  });

  test("slugifyWorkspaceName: falls back when name is empty", () => {
    expect(slugifyWorkspaceName("   ")).toBe("workspace");
  });

  test("getWorkspacePathSegment: prefers stored slug over derived name", () => {
    expect(
      getWorkspacePathSegment({
        slug: "team-alpha",
        name: "Team Alpha",
      }),
    ).toBe("team-alpha");
  });

  test("getWorkspacePathSegment: derives from name when slug is missing", () => {
    expect(
      getWorkspacePathSegment({
        name: "Signals & Research",
      }),
    ).toBe("signals-research");
  });

  test("getWorkspacePathSegment: falls back when workspace is missing", () => {
    expect(getWorkspacePathSegment(null)).toBe("workspace");
  });
});
