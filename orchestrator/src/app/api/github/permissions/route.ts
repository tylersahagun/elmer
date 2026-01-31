/**
 * GitHub Permissions API
 *
 * Check if the current user's GitHub token has required OAuth scopes
 * for workspace onboarding and discovery operations.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

interface PermissionsResponse {
  valid: boolean;
  scopes: string[];
  missing: string[];
  message?: string;
}

// Required scopes for workspace operations
const REQUIRED_SCOPES = ["repo", "read:user"];

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, scopes: [], missing: REQUIRED_SCOPES, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const octokit = await getGitHubClient(session.user.id);

    if (!octokit) {
      return NextResponse.json({
        valid: false,
        scopes: [],
        missing: REQUIRED_SCOPES,
        message: "GitHub not connected. Please connect your GitHub account.",
      });
    }

    // Get authenticated user - the response headers contain OAuth scopes
    const response = await octokit.users.getAuthenticated();

    // Extract OAuth scopes from response headers
    // The x-oauth-scopes header contains a comma-separated list of scopes
    const scopesHeader = response.headers["x-oauth-scopes"] || "";
    const scopes = scopesHeader
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    // Check for missing required scopes
    // Note: 'repo' scope includes read access to private repos
    // 'read:user' is needed for user info
    const missing: string[] = [];

    for (const required of REQUIRED_SCOPES) {
      // Check if scope is present directly or covered by a broader scope
      const hasScope = scopes.some((scope: string) => {
        // Direct match
        if (scope === required) return true;
        // 'repo' covers all repo-related operations
        if (required.startsWith("repo") && scope === "repo") return true;
        // 'user' covers 'read:user'
        if (required === "read:user" && (scope === "user" || scope === "read:user")) return true;
        return false;
      });

      if (!hasScope) {
        missing.push(required);
      }
    }

    const result: PermissionsResponse = {
      valid: missing.length === 0,
      scopes,
      missing,
    };

    if (missing.length > 0) {
      result.message = `Re-authenticate with additional permissions: ${missing.join(", ")}`;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GitHub permissions check error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Bad credentials")) {
        return NextResponse.json({
          valid: false,
          scopes: [],
          missing: REQUIRED_SCOPES,
          message: "GitHub token expired. Please reconnect your GitHub account.",
        });
      }
    }

    return NextResponse.json(
      {
        valid: false,
        scopes: [],
        missing: REQUIRED_SCOPES,
        message: error instanceof Error ? error.message : "Failed to check permissions",
      },
      { status: 500 }
    );
  }
}
