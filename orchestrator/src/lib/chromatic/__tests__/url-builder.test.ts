import { describe, it, expect } from "vitest";
import {
  sanitizeBranchForUrl,
  buildChromaticStorybookUrl,
  buildChromaticStoryUrl,
  buildChromaticDashboardUrl,
  extractBranchFromChromaticUrl,
  deriveStorybookPathFromFolder,
  isChromaticStorybookUrl,
} from "../url-builder";

describe("sanitizeBranchForUrl", () => {
  it("converts slashes to dashes", () => {
    expect(sanitizeBranchForUrl("feat/my-feature")).toBe("feat-my-feature");
    expect(sanitizeBranchForUrl("feature/nested/branch")).toBe(
      "feature-nested-branch",
    );
  });

  it("removes special characters", () => {
    expect(sanitizeBranchForUrl("feat/my_feature!@#$")).toBe("feat-my-feature");
    expect(sanitizeBranchForUrl("branch@2024")).toBe("branch-2024");
  });

  it("collapses multiple dashes", () => {
    expect(sanitizeBranchForUrl("feat//double//slash")).toBe(
      "feat-double-slash",
    );
    expect(sanitizeBranchForUrl("branch---name")).toBe("branch-name");
  });

  it("removes leading and trailing dashes", () => {
    expect(sanitizeBranchForUrl("-branch-")).toBe("branch");
    expect(sanitizeBranchForUrl("--main--")).toBe("main");
  });

  it("handles simple branch names", () => {
    expect(sanitizeBranchForUrl("main")).toBe("main");
    expect(sanitizeBranchForUrl("develop")).toBe("develop");
    expect(sanitizeBranchForUrl("release-1-0")).toBe("release-1-0");
  });
});

describe("buildChromaticStorybookUrl", () => {
  it("builds URL with branch and default app ID", () => {
    const url = buildChromaticStorybookUrl("main");
    expect(url).toMatch(/^https:\/\/main--[a-f0-9]+\.chromatic\.com$/);
  });

  it("builds URL with custom app ID", () => {
    const url = buildChromaticStorybookUrl("main", "custom123");
    expect(url).toBe("https://main--custom123.chromatic.com");
  });

  it("sanitizes branch names with slashes", () => {
    const url = buildChromaticStorybookUrl("feat/my-feature");
    // Slashes in branch name should be converted to dashes
    expect(url).toContain("feat-my-feature--");
    // The resulting URL should be valid
    expect(url).toMatch(
      /^https:\/\/feat-my-feature--[a-f0-9]+\.chromatic\.com$/,
    );
  });

  it("handles complex branch names", () => {
    const url = buildChromaticStorybookUrl("feat/user/JIRA-123-add-login");
    expect(url).toContain("feat-user-JIRA-123-add-login--");
  });
});

describe("buildChromaticStoryUrl", () => {
  it("builds URL with story ID", () => {
    const url = buildChromaticStoryUrl(
      "main",
      "prototypes-button--default",
      "abc123",
    );
    expect(url).toBe(
      "https://main--abc123.chromatic.com/iframe.html?id=prototypes-button--default&viewMode=story",
    );
  });

  it("URL-encodes story IDs with special characters", () => {
    const url = buildChromaticStoryUrl("main", "story/with/slashes", "abc123");
    expect(url).toContain("id=story%2Fwith%2Fslashes");
  });
});

describe("buildChromaticDashboardUrl", () => {
  it("builds builds list URL without build number", () => {
    const url = buildChromaticDashboardUrl(undefined, "abc123");
    expect(url).toBe("https://www.chromatic.com/builds?appId=abc123");
  });

  it("builds specific build URL with build number", () => {
    const url = buildChromaticDashboardUrl(42, "abc123");
    expect(url).toBe("https://www.chromatic.com/build?appId=abc123&number=42");
  });
});

describe("extractBranchFromChromaticUrl", () => {
  it("extracts branch from valid Chromatic URL", () => {
    expect(
      extractBranchFromChromaticUrl("https://main--abc123.chromatic.com"),
    ).toBe("main");
    expect(
      extractBranchFromChromaticUrl(
        "https://feat-my-feature--abc123.chromatic.com",
      ),
    ).toBe("feat-my-feature");
  });

  it("returns null for invalid URLs", () => {
    expect(extractBranchFromChromaticUrl("https://www.chromatic.com")).toBe(
      null,
    );
    expect(extractBranchFromChromaticUrl("https://example.com")).toBe(null);
    expect(extractBranchFromChromaticUrl("not-a-url")).toBe(null);
  });

  it("extracts branch from URL with path", () => {
    expect(
      extractBranchFromChromaticUrl(
        "https://main--abc123.chromatic.com/iframe.html?id=story",
      ),
    ).toBe("main");
  });
});

describe("deriveStorybookPathFromFolder", () => {
  it("extracts prototype name from standard path", () => {
    expect(
      deriveStorybookPathFromFolder(
        "web/src/components/prototypes/FlagshipMeetingRecap/v1",
      ),
    ).toBe("prototypes-flagshipmeetingrecap--default");
  });

  it("handles path without version folder", () => {
    expect(
      deriveStorybookPathFromFolder("src/components/prototypes/MyComponent"),
    ).toBe("prototypes-mycomponent--default");
  });

  it("handles path with only prototypes folder", () => {
    expect(deriveStorybookPathFromFolder("prototypes/Dashboard")).toBe(
      "prototypes-dashboard--default",
    );
  });

  it("handles path without prototypes folder (fallback)", () => {
    expect(deriveStorybookPathFromFolder("components/Button")).toBe(
      "prototypes-button--default",
    );
  });

  it("lowercases the component name", () => {
    expect(deriveStorybookPathFromFolder("prototypes/UserOnboarding")).toBe(
      "prototypes-useronboarding--default",
    );
  });
});

describe("isChromaticStorybookUrl", () => {
  it("returns true for valid Chromatic URLs", () => {
    expect(isChromaticStorybookUrl("https://main--abc123.chromatic.com")).toBe(
      true,
    );
    expect(
      isChromaticStorybookUrl("https://feat-branch--xyz789.chromatic.com"),
    ).toBe(true);
    expect(
      isChromaticStorybookUrl(
        "https://my-feature--abc123.chromatic.com/iframe.html",
      ),
    ).toBe(true);
  });

  it("returns false for non-Chromatic URLs", () => {
    expect(isChromaticStorybookUrl("https://www.chromatic.com")).toBe(false);
    expect(isChromaticStorybookUrl("https://example.com")).toBe(false);
    expect(isChromaticStorybookUrl("https://storybook.io")).toBe(false);
    expect(isChromaticStorybookUrl("localhost:6006")).toBe(false);
  });

  it("returns false for malformed URLs", () => {
    expect(isChromaticStorybookUrl("not-a-url")).toBe(false);
    expect(isChromaticStorybookUrl("")).toBe(false);
  });
});
