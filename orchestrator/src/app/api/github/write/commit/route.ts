import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

interface WriteFile {
  path: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { owner, repo, branch, message, files } = await request.json();

    if (!owner || !repo || !branch || !message || !Array.isArray(files)) {
      return NextResponse.json(
        { error: "owner, repo, branch, message, and files are required" },
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

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const parentSha = refData.object.sha;
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: parentSha,
    });

    const tree = (files as WriteFile[]).map((file) => ({
      path: file.path,
      mode: "100644" as const,
      type: "blob" as const,
      content: file.content,
    }));

    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: commitData.tree.sha,
      tree,
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [parentSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    return NextResponse.json({
      commitSha: newCommit.sha,
    });
  } catch (error) {
    console.error("GitHub write commit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to commit changes" },
      { status: 500 }
    );
  }
}
