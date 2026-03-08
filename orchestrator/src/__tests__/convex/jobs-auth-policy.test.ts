import { describe, expect, it } from "vitest";

import { getUnauthenticatedJobsListFallback } from "../../../convex/jobs";

describe("jobs auth policy", () => {
  it("returns an empty jobs list when auth is unavailable", () => {
    expect(getUnauthenticatedJobsListFallback(null)).toEqual([]);
  });

  it("does not apply the fallback when auth is present", () => {
    expect(
      getUnauthenticatedJobsListFallback({ subject: "user-1" }),
    ).toBeNull();
  });
});
