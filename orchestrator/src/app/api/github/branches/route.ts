import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        { error: "GitHub not connected", connectUrl: "/api/auth/signin/github" },
        { status: 403 }
      );
    }

    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    return NextResponse.json({
      defaultBranch: repoData.default_branch,
      branches: branches.map((branch) => ({
        name: branch.name,
        commitSha: branch.commit.sha,
        protected: branch.protected,
      })),
    });
  } catch (error) {
    console.error("GitHub branches error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
