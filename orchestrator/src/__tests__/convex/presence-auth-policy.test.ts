import { describe, expect, it } from "vitest";

import { getUnauthenticatedPresenceFallback } from "../../../convex/presence";

describe("presence auth policy", () => {
  it("returns an empty presence list when auth is unavailable", () => {
    expect(getUnauthenticatedPresenceFallback(null)).toEqual([]);
  });

  it("does not apply the fallback when auth is present", () => {
    expect(
      getUnauthenticatedPresenceFallback({ subject: "user-1" }),
    ).toBeNull();
  });
});
