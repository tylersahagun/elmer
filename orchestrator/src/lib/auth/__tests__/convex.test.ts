import { describe, expect, it } from "vitest";
import { canRunConvexQuery, validateConvexDeploymentUrl } from "../convex";

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

describe("validateConvexDeploymentUrl", () => {
  it("accepts a convex cloud deployment URL", () => {
    expect(
      validateConvexDeploymentUrl("https://helpful-otter-123.convex.cloud"),
    ).toEqual({
      ok: true,
      detail: "https://helpful-otter-123.convex.cloud",
      normalizedUrl: "https://helpful-otter-123.convex.cloud",
    });
  });

  it("rejects missing deployment URLs", () => {
    expect(validateConvexDeploymentUrl(undefined)).toEqual({
      ok: false,
      detail: "missing NEXT_PUBLIC_CONVEX_URL",
      normalizedUrl: null,
    });
  });

  it("rejects convex site URLs", () => {
    expect(
      validateConvexDeploymentUrl("https://helpful-otter-123.convex.site"),
    ).toEqual({
      ok: false,
      detail:
        'Invalid deployment address: "https://helpful-otter-123.convex.site" ends with .convex.site; use the client deployment URL that ends with .convex.cloud.',
      normalizedUrl: "https://helpful-otter-123.convex.site",
    });
  });

  it("rejects invalid absolute URLs", () => {
    expect(validateConvexDeploymentUrl("not-a-url")).toEqual({
      ok: false,
      detail:
        'Invalid deployment address: Must start with "https://" or "http://". Found "not-a-url".',
      normalizedUrl: "not-a-url",
    });
  });
});
