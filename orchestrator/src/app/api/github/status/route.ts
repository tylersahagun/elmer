/**
 * GitHub Connection Status API
 * 
 * Check if the current user has connected their GitHub account.
 */

import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { connected: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user has a GitHub account connected
    const account = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.userId, session.user.id),
        eq(accounts.provider, "github")
      ),
    });

    if (!account?.access_token) {
      return NextResponse.json({
        connected: false,
        connectUrl: "/api/auth/signin/github",
      });
    }

    // Verify the token is still valid by fetching user info
    try {
      const octokit = new Octokit({ auth: account.access_token });
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
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.json({
        connected: false,
        expired: true,
        connectUrl: "/api/auth/signin/github",
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
