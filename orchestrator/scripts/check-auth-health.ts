import dns from "node:dns/promises";
import { config as loadEnv } from "dotenv";
import {
  decodeClerkFrontendApiHost,
  getAuthConfigurationChecks,
  getClerkJwtIssuerDomain,
} from "../src/lib/auth/clerk";
import { validateConvexDeploymentUrl } from "../src/lib/auth/convex";
import { evaluateLoginRouteHealth } from "../src/lib/auth/login-health";

loadEnv({ path: ".env.local" });

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

function getAppOrigin() {
  const value = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  return value?.replace(/\/+$/, "") || null;
}

function normalizeConfiguredUrl(value?: string | null) {
  return value?.trim().replace(/\/+$/, "") || null;
}

async function checkDns(hostname: string): Promise<CheckResult> {
  try {
    const result = await dns.lookup(hostname);
    return {
      name: `DNS ${hostname}`,
      ok: true,
      detail: `resolved to ${result.address}`,
    };
  } catch (error) {
    return {
      name: `DNS ${hostname}`,
      ok: false,
      detail: error instanceof Error ? error.message : "failed to resolve host",
    };
  }
}

async function checkHttp(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return {
      name: `HTTP ${url}`,
      ok: response.status >= 200 && response.status < 400,
      detail: `status ${response.status}`,
    };
  } catch (error) {
    return {
      name: `HTTP ${url}`,
      ok: false,
      detail: error instanceof Error ? error.message : "request failed",
    };
  }
}

async function checkLoginRoute(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, { redirect: "manual" });
    const body = await response.text();
    const result = evaluateLoginRouteHealth({
      status: response.status,
      contentType: response.headers.get("content-type"),
      body,
    });

    return {
      name: `HTTP ${url}`,
      ok: result.ok,
      detail: result.detail,
    };
  } catch (error) {
    return {
      name: `HTTP ${url}`,
      ok: false,
      detail: error instanceof Error ? error.message : "request failed",
    };
  }
}

function getRelatedAccountsHost(frontendApiHost: string) {
  return frontendApiHost.startsWith("clerk.")
    ? `accounts.${frontendApiHost.slice("clerk.".length)}`
    : null;
}

async function main() {
  const results: CheckResult[] = getAuthConfigurationChecks().map((result) => ({
    name: result.name,
    ok: result.ok,
    detail: result.detail,
  }));
  const appOrigin = getAppOrigin();
  const frontendApiHost =
    decodeClerkFrontendApiHost() ||
    getClerkJwtIssuerDomain()?.replace(/^https?:\/\//, "") ||
    null;
  const convexUrlCheck = validateConvexDeploymentUrl(
    normalizeConfiguredUrl(process.env.NEXT_PUBLIC_CONVEX_URL),
  );

  results.push({
    name: "Convex URL",
    ok: convexUrlCheck.ok,
    detail: convexUrlCheck.detail,
  });

  const hasConfigurationFailure = results.some((result) => !result.ok);

  if (hasConfigurationFailure) {
    results.push({
      name: "Network checks",
      ok: false,
      detail: "skipped until auth configuration checks pass",
    });
  } else {
    if (appOrigin) {
      results.push(await checkLoginRoute(`${appOrigin}/login`));
    }

    if (frontendApiHost) {
      results.push(await checkDns(frontendApiHost));
      results.push(await checkHttp(`https://${frontendApiHost}`));

      const accountsHost = getRelatedAccountsHost(frontendApiHost);
      if (accountsHost) {
        results.push(await checkDns(accountsHost));
      }
    } else {
      results.push({
        name: "Clerk frontend API",
        ok: false,
        detail:
          "missing Clerk frontend API host; set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_JWT_ISSUER_DOMAIN",
      });
    }
  }

  let hasFailure = false;

  for (const result of results) {
    const prefix = result.ok ? "PASS" : "FAIL";
    console.log(`${prefix} ${result.name}: ${result.detail}`);
    hasFailure ||= !result.ok;
  }

  if (hasFailure) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Auth health check failed unexpectedly",
  );
  process.exit(1);
});
