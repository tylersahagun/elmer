/**
 * GitHub App authentication for Convex Actions.
 *
 * Instead of a personal access token (GITHUB_TOKEN), Elmer authenticates as a
 * GitHub App. This means:
 *   - Commits to elephant-ai appear as "elmer-bot" not "tylersahagun"
 *   - Access is scoped to specific repos only (pm-workspace + elephant-ai)
 *   - Installation tokens auto-expire in 1 hour — no manual rotation ever
 *
 * Required Convex env vars:
 *   GITHUB_APP_ID              — numeric App ID (e.g. "1234567")
 *   GITHUB_APP_PRIVATE_KEY_B64 — base64-encoded PEM private key
 *                                 generate: base64 < private-key.pem | tr -d '\n'
 *   GITHUB_APP_INSTALLATION_ID — installation ID shown after installing the App
 *
 * Fallback: if the App vars are absent, falls back to GITHUB_TOKEN (PAT).
 * This lets development continue without the App configured.
 */

import { importPKCS8, SignJWT } from "jose";

interface InstallationToken {
  token: string;
  expiresAt: number; // unix ms
}

// Module-level cache so we don't re-generate on every tool call within an Action.
// Convex Actions run in isolates that are reused within the same invocation.
let _cached: InstallationToken | null = null;

async function generateAppJwt(appId: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKeyPem, "RS256");
  return new SignJWT({ iss: appId })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 60)   // 60s back-dated to handle clock skew
    .setExpirationTime(now + 600) // 10 minutes — GitHub's max for App JWTs
    .sign(key);
}

async function fetchInstallationToken(
  appId: string,
  privateKeyPem: string,
  installationId: string,
): Promise<InstallationToken> {
  const jwt = await generateAppJwt(appId, privateKeyPem);

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub App token exchange failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { token: string; expires_at: string };
  return {
    token: data.token,
    // Expire 5 minutes early to avoid using a token right as it expires
    expiresAt: new Date(data.expires_at).getTime() - 5 * 60 * 1000,
  };
}

/**
 * Returns an installation access token, using the module-level cache when valid.
 * Throws if neither App credentials nor a PAT fallback are configured.
 */
export async function getGitHubToken(): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyB64 = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;

  // App credentials present — use GitHub App auth
  if (appId && privateKeyB64 && installationId) {
    const now = Date.now();
    if (_cached && _cached.expiresAt > now) {
      return _cached.token;
    }
    const privateKeyPem = atob(privateKeyB64);
    _cached = await fetchInstallationToken(appId, privateKeyPem, installationId);
    return _cached.token;
  }

  // Fall back to PAT if App is not configured (local dev convenience)
  const pat = process.env.GITHUB_TOKEN;
  if (pat) return pat;

  throw new Error(
    "GitHub not configured. Set GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY_B64 + " +
    "GITHUB_APP_INSTALLATION_ID in Convex env vars (or GITHUB_TOKEN for local dev).",
  );
}

/**
 * Returns Authorization headers for GitHub REST API calls.
 * Accepts an optional override token (e.g. from workspace settings during transition).
 */
export async function getGitHubHeaders(
  overrideToken?: string,
): Promise<Record<string, string>> {
  const token = overrideToken ?? (await getGitHubToken());
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
