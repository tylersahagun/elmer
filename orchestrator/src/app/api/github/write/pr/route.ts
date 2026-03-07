import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GITHUB_OAUTH_CONNECT_URL } from "@/lib/auth/routes";
import { getGitHubClient } from "@/lib/github/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { owner, repo, baseBranch, branch, title, body } = await request.json();

    if (!owner || !repo || !baseBranch || !branch || !title) {
      return NextResponse.json(
        { error: "owner, repo, baseBranch, branch, and title are required" },
        { status: 400 }
      );
    }

    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        { error: "GitHub not connected", connectUrl: GITHUB_OAUTH_CONNECT_URL },
        { status: 403 }
      );
    }

    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      base: baseBranch,
      head: branch,
      title,
      body: body || "",
    });

    return NextResponse.json({
      number: pr.number,
      url: pr.html_url,
    });
  } catch (error) {
    console.error("GitHub write PR error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create PR" },
      { status: 500 }
    );
  }
}
