const CLERK_PUBLISHABLE_KEY_PREFIX = /^pk_(?:live|test)_/;
const CLERK_PLACEHOLDER_PUBLISHABLE_KEY = "pk_test_your_publishable_key";
const CLERK_PLACEHOLDER_SECRET_KEY = "sk_test_your_secret_key";
const CLERK_PLACEHOLDER_ISSUER_DOMAIN =
  "https://your-frontend-api.clerk.accounts.dev";

export type AuthConfigurationCheck = {
  name: string;
  ok: boolean;
  detail: string;
};

function trimTrailingSentinel(value: string) {
  return value.endsWith("$") ? value.slice(0, -1) : value;
}

function normalizeConfiguredValue(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

function normalizeConfiguredUrl(value?: string | null) {
  return normalizeConfiguredValue(value)?.replace(/\/+$/, "") || null;
}

function isPlaceholderClerkPublishableKey(value?: string | null) {
  return normalizeConfiguredValue(value) === CLERK_PLACEHOLDER_PUBLISHABLE_KEY;
}

function isPlaceholderClerkSecretKey(value?: string | null) {
  return normalizeConfiguredValue(value) === CLERK_PLACEHOLDER_SECRET_KEY;
}

function isPlaceholderClerkIssuerDomain(value?: string | null) {
  return normalizeConfiguredUrl(value) === CLERK_PLACEHOLDER_ISSUER_DOMAIN;
}

export function decodeClerkFrontendApiHost(
  publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
) {
  if (!publishableKey || isPlaceholderClerkPublishableKey(publishableKey)) {
    return null;
  }

  const encodedHost = publishableKey.replace(CLERK_PUBLISHABLE_KEY_PREFIX, "");
  if (!encodedHost || encodedHost === publishableKey) {
    return null;
  }

  try {
    const decodedHost = Buffer.from(encodedHost, "base64url")
      .toString("utf8")
      .trim();

    return trimTrailingSentinel(decodedHost) || null;
  } catch {
    return null;
  }
}

function isAbsoluteUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function toHttpsOrigin(hostOrUrl?: string | null) {
  if (!hostOrUrl) {
    return null;
  }

  const trimmed = hostOrUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getClerkFrontendApiOrigin(env = process.env) {
  return toHttpsOrigin(
    decodeClerkFrontendApiHost(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
  );
}

export function getClerkJwtIssuerDomain(env = process.env) {
  return (
    (isPlaceholderClerkIssuerDomain(env.CLERK_JWT_ISSUER_DOMAIN)
      ? null
      : toHttpsOrigin(env.CLERK_JWT_ISSUER_DOMAIN)) ||
    getClerkFrontendApiOrigin(env)
  );
}

export function hasClerkRuntimeConfiguration(env = process.env) {
  return Boolean(
    !isPlaceholderClerkPublishableKey(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
      normalizeConfiguredValue(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
      !isPlaceholderClerkSecretKey(env.CLERK_SECRET_KEY) &&
      normalizeConfiguredValue(env.CLERK_SECRET_KEY),
  );
}

export function getAuthConfigurationChecks(
  env = process.env,
): AuthConfigurationCheck[] {
  const publishableKey = isPlaceholderClerkPublishableKey(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  )
    ? null
    : normalizeConfiguredValue(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const frontendApiHost = decodeClerkFrontendApiHost(publishableKey ?? undefined);
  const frontendApiOrigin = getClerkFrontendApiOrigin(env);
  const explicitIssuerDomain = isPlaceholderClerkIssuerDomain(
    env.CLERK_JWT_ISSUER_DOMAIN,
  )
    ? null
    : normalizeConfiguredUrl(env.CLERK_JWT_ISSUER_DOMAIN);
  const authUrl = normalizeConfiguredUrl(env.AUTH_URL);
  const nextAuthUrl = normalizeConfiguredUrl(env.NEXTAUTH_URL);
  const appOrigin = authUrl || nextAuthUrl;

  const checks: AuthConfigurationCheck[] = [
    publishableKey
      ? frontendApiHost
        ? {
            name: "Clerk publishable key",
            ok: true,
            detail: `frontend API host ${frontendApiHost}`,
          }
        : {
            name: "Clerk publishable key",
            ok: false,
            detail:
              "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set but does not decode to a Clerk frontend API host",
          }
      : {
          name: "Clerk publishable key",
          ok: false,
          detail: "missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        },
    !isPlaceholderClerkSecretKey(env.CLERK_SECRET_KEY) &&
    normalizeConfiguredValue(env.CLERK_SECRET_KEY)
      ? {
          name: "Clerk secret key",
          ok: true,
          detail: "present",
        }
      : {
          name: "Clerk secret key",
          ok: false,
          detail: "missing CLERK_SECRET_KEY",
        },
  ];

  if (explicitIssuerDomain) {
    checks.push(
      frontendApiOrigin && explicitIssuerDomain !== frontendApiOrigin
        ? {
            name: "Clerk issuer domain",
            ok: false,
            detail: `CLERK_JWT_ISSUER_DOMAIN (${explicitIssuerDomain}) does not match the frontend API origin encoded in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (${frontendApiOrigin})`,
          }
        : {
            name: "Clerk issuer domain",
            ok: true,
            detail: `using ${explicitIssuerDomain}`,
          },
    );
  } else {
    checks.push(
      frontendApiOrigin
        ? {
            name: "Clerk issuer domain",
            ok: true,
            detail: `derived from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as ${frontendApiOrigin}`,
          }
        : {
            name: "Clerk issuer domain",
            ok: false,
            detail:
              "missing CLERK_JWT_ISSUER_DOMAIN and unable to derive it from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
          },
    );
  }

  if (authUrl && nextAuthUrl && authUrl !== nextAuthUrl) {
    checks.push({
      name: "App origin",
      ok: false,
      detail: `AUTH_URL (${authUrl}) does not match NEXTAUTH_URL (${nextAuthUrl})`,
    });
  } else if (!appOrigin) {
    checks.push({
      name: "App origin",
      ok: false,
      detail: "set AUTH_URL or NEXTAUTH_URL to the app origin",
    });
  } else if (!isAbsoluteUrl(appOrigin)) {
    checks.push({
      name: "App origin",
      ok: false,
      detail: `${appOrigin} is not a valid absolute URL`,
    });
  } else {
    checks.push({
      name: "App origin",
      ok: true,
      detail: `using ${appOrigin}`,
    });

    if (frontendApiOrigin) {
      const appHost = new URL(appOrigin).host;
      const clerkHost = new URL(frontendApiOrigin).host;

      checks.push(
        appHost === clerkHost
          ? {
              name: "App origin host",
              ok: false,
              detail: `AUTH_URL/NEXTAUTH_URL points at the Clerk frontend API host (${appHost}); it should point at the app host instead`,
            }
          : {
              name: "App origin host",
              ok: true,
              detail: `app host ${appHost}, Clerk host ${clerkHost}`,
            },
      );
    }
  }

  return checks;
}

export function getClerkProviderProps(env = process.env) {
  return {
    publishableKey: isPlaceholderClerkPublishableKey(
      env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    )
      ? undefined
      : env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    afterSignInUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    afterSignUpUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  };
}
