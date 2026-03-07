import { describe, expect, it } from "vitest";
import {
  decodeClerkFrontendApiHost,
  getAuthConfigurationChecks,
  getClerkFrontendApiOrigin,
  getClerkJwtIssuerDomain,
  getClerkProviderProps,
  toHttpsOrigin,
} from "../clerk";

function encodePublishableKeyHost(host: string) {
  return `pk_test_${Buffer.from(`${host}$`, "utf8").toString("base64url")}`;
}

describe("clerk auth config helpers", () => {
  it("decodes the Clerk frontend API host from the publishable key", () => {
    const publishableKey = encodePublishableKeyHost("clerk.elmer.studio");

    expect(decodeClerkFrontendApiHost(publishableKey)).toBe("clerk.elmer.studio");
  });

  it("returns null for malformed publishable keys", () => {
    expect(decodeClerkFrontendApiHost("not-a-key")).toBeNull();
  });

  it("normalizes issuer hosts to https origins", () => {
    expect(toHttpsOrigin("clerk.elmer.studio/")).toBe("https://clerk.elmer.studio");
    expect(toHttpsOrigin("https://clerk.elmer.studio/")).toBe(
      "https://clerk.elmer.studio",
    );
  });

  it("prefers an explicit Clerk issuer domain", () => {
    expect(
      getClerkJwtIssuerDomain({
        CLERK_JWT_ISSUER_DOMAIN: "https://clerk.elmer.studio",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "ignored.example.com",
        ),
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("https://clerk.elmer.studio");
  });

  it("falls back to the publishable key host when the issuer env is missing", () => {
    expect(
      getClerkJwtIssuerDomain({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "knowing-gecko-12.clerk.accounts.dev",
        ),
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("https://knowing-gecko-12.clerk.accounts.dev");
  });

  it("builds Clerk provider props from public env vars", () => {
    expect(
      getClerkProviderProps({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/login",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/signup",
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/workspace",
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/workspace",
      } as unknown as NodeJS.ProcessEnv),
    ).toEqual({
      publishableKey: "pk_test_example",
      signInUrl: "/login",
      signUpUrl: "/signup",
      afterSignInUrl: "/workspace",
      afterSignUpUrl: "/workspace",
    });
  });

  it("returns the frontend API origin from the publishable key", () => {
    expect(
      getClerkFrontendApiOrigin({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "clerk.elmer.studio",
        ),
      } as unknown as NodeJS.ProcessEnv),
    ).toBe("https://clerk.elmer.studio");
  });

  it("flags mismatched issuer and frontend API origins", () => {
    expect(
      getAuthConfigurationChecks({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "clerk.elmer.studio",
        ),
        CLERK_SECRET_KEY: "sk_test_example",
        CLERK_JWT_ISSUER_DOMAIN: "https://other.elmer.studio",
        AUTH_URL: "https://elmer.studio",
        NEXTAUTH_URL: "https://elmer.studio",
      } as unknown as NodeJS.ProcessEnv),
    ).toContainEqual({
      name: "Clerk issuer domain",
      ok: false,
      detail:
        "CLERK_JWT_ISSUER_DOMAIN (https://other.elmer.studio) does not match the frontend API origin encoded in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (https://clerk.elmer.studio)",
    });
  });

  it("flags mismatched app origins", () => {
    expect(
      getAuthConfigurationChecks({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "clerk.elmer.studio",
        ),
        CLERK_SECRET_KEY: "sk_test_example",
        AUTH_URL: "https://elmer.studio",
        NEXTAUTH_URL: "https://preview.elmer.studio",
      } as unknown as NodeJS.ProcessEnv),
    ).toContainEqual({
      name: "App origin",
      ok: false,
      detail:
        "AUTH_URL (https://elmer.studio) does not match NEXTAUTH_URL (https://preview.elmer.studio)",
    });
  });

  it("flags app origins that point at the Clerk frontend API host", () => {
    expect(
      getAuthConfigurationChecks({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: encodePublishableKeyHost(
          "clerk.elmer.studio",
        ),
        CLERK_SECRET_KEY: "sk_test_example",
        AUTH_URL: "https://clerk.elmer.studio",
      } as unknown as NodeJS.ProcessEnv),
    ).toContainEqual({
      name: "App origin host",
      ok: false,
      detail:
        "AUTH_URL/NEXTAUTH_URL points at the Clerk frontend API host (clerk.elmer.studio); it should point at the app host instead",
    });
  });
});
