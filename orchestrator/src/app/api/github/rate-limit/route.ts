/**
 * GitHub Rate Limit API
 *
 * Check the current user's GitHub API rate limit status.
 * Used before discovery operations to ensure sufficient API calls remain.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

interface RateLimitResponse {
  limit: number;
  remaining: number;
  reset: string;
  resetSeconds: number;
  sufficient: boolean;
  message?: string;
}

// Minimum remaining calls needed for discovery operations
// Discovery uses tree API + file fetches, typically 10-50 calls per repo
const MINIMUM_REMAINING = 100;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const octokit = await getGitHubClient(session.user.id);

    if (!octokit) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 403 }
      );
    }

    // Get rate limit information
    const { data: rateLimit } = await octokit.rateLimit.get();

    // We care about the core rate limit (used for most API calls)
    const core = rateLimit.resources.core;
    const resetDate = new Date(core.reset * 1000);
    const resetSeconds = Math.max(0, Math.floor((resetDate.getTime() - Date.now()) / 1000));

    const sufficient = core.remaining >= MINIMUM_REMAINING;

    const result: RateLimitResponse = {
      limit: core.limit,
      remaining: core.remaining,
      reset: resetDate.toISOString(),
      resetSeconds,
      sufficient,
    };

    if (!sufficient) {
      const minutes = Math.ceil(resetSeconds / 60);
      result.message = `Rate limit low (${core.remaining}/${core.limit} remaining). Discovery will resume automatically in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GitHub rate limit check error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("Bad credentials")) {
        return NextResponse.json(
          { error: "GitHub token expired. Please reconnect your GitHub account." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check rate limit" },
      { status: 500 }
    );
  }
}
