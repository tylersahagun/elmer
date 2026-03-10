/**
 * GitHub Connection Status API
 *
 * Check if the current user has connected their GitHub account.
 */

import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { GITHUB_OAUTH_CONNECT_URL } from "@/lib/auth/routes";
import { getGitHubToken } from "@/lib/github/auth";

export async function GET() {
  try {
    const { userId } = await clerkAuth();

    if (!userId) {
      return NextResponse.json({
        connected: false,
        connectUrl: GITHUB_OAUTH_CONNECT_URL,
      });
    }

    const token = await getGitHubToken(userId);

    if (!token) {
      return NextResponse.json({
        connected: false,
        connectUrl: GITHUB_OAUTH_CONNECT_URL,
      });
    }

    // Verify the token is still valid by fetching user info
    try {
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.users.getAuthenticated();

      return NextResponse.json({
        connected: true,
        user: {
          login: user.login,
          name: user.name,
          avatarUrl: user.avatar_url,
          profileUrl: user.html_url,
        },
      });
    } catch {
      return NextResponse.json({
        connected: false,
        expired: true,
        connectUrl: GITHUB_OAUTH_CONNECT_URL,
        message: "GitHub token expired, please reconnect",
      });
    }
  } catch (error) {
    console.error("GitHub status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check GitHub status" },
      { status: 500 }
    );
  }
}
