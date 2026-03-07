import { describe, expect, it } from "vitest";
import { canRunConvexQuery } from "../convex";

describe("canRunConvexQuery", () => {
  it("returns false before Clerk is loaded", () => {
    expect(
      canRunConvexQuery({
        isClerkLoaded: false,
        isSignedIn: true,
        isConvexAuthenticated: true,
      }),
    ).toBe(false);
  });

  it("returns false when signed out", () => {
    expect(
      canRunConvexQuery({
        isClerkLoaded: true,
        isSignedIn: false,
        isConvexAuthenticated: true,
      }),
    ).toBe(false);
  });

  it("returns false while Convex auth is still warming up", () => {
    expect(
      canRunConvexQuery({
        isClerkLoaded: true,
        isSignedIn: true,
        isConvexAuthenticated: false,
      }),
    ).toBe(false);
  });

  it("returns true only when Clerk and Convex are both ready", () => {
    expect(
      canRunConvexQuery({
        isClerkLoaded: true,
        isSignedIn: true,
        isConvexAuthenticated: true,
      }),
    ).toBe(true);
  });
});
