export function canRunConvexQuery(params: {
  isClerkLoaded: boolean;
  isSignedIn: boolean;
  isConvexAuthenticated: boolean;
}) {
  const { isClerkLoaded, isSignedIn, isConvexAuthenticated } = params;
  return isClerkLoaded && isSignedIn && isConvexAuthenticated;
}

type ConvexUrlValidationResult = {
  ok: boolean;
  detail: string;
  normalizedUrl: string | null;
};

function normalizeConfiguredUrl(value?: string | null) {
  return value?.trim().replace(/\/+$/, "") || null;
}

export function validateConvexDeploymentUrl(
  value = process.env.NEXT_PUBLIC_CONVEX_URL,
): ConvexUrlValidationResult {
  const normalizedUrl = normalizeConfiguredUrl(value);

  if (!normalizedUrl) {
    return {
      ok: false,
      detail: "missing NEXT_PUBLIC_CONVEX_URL",
      normalizedUrl: null,
    };
  }

  if (
    !(normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://"))
  ) {
    return {
      ok: false,
      detail: `Invalid deployment address: Must start with "https://" or "http://". Found "${normalizedUrl}".`,
      normalizedUrl,
    };
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return {
      ok: false,
      detail: `Invalid deployment address: "${normalizedUrl}" is not a valid URL.`,
      normalizedUrl,
    };
  }

  if (normalizedUrl.endsWith(".convex.site")) {
    return {
      ok: false,
      detail: `Invalid deployment address: "${normalizedUrl}" ends with .convex.site; use the client deployment URL that ends with .convex.cloud.`,
      normalizedUrl,
    };
  }

  return {
    ok: true,
    detail: normalizedUrl,
    normalizedUrl,
  };
}
