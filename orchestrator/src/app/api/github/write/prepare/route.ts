import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/legacy-next-auth";
import { GITHUB_OAUTH_CONNECT_URL } from "@/lib/auth/routes";
import { getGitHubClient } from "@/lib/github/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { owner, repo, baseBranch, branchName } = await request.json();

    if (!owner || !repo || !baseBranch) {
      return NextResponse.json(
        { error: "Owner, repo, and baseBranch are required" },
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

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    const baseSha = refData.object.sha;
    const branch =
      branchName || `ai/writeback-${new Date().toISOString().replace(/[:.]/g, "-")}`;

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });

    return NextResponse.json({
      branch,
      baseSha,
    });
  } catch (error) {
    console.error("GitHub write prepare error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare write" },
      { status: 500 }
    );
  }
}
