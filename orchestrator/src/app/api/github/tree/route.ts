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
    const path = searchParams.get("path") || "";
    const ref = searchParams.get("ref") || undefined;

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

    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (Array.isArray(data)) {
      return NextResponse.json({
        type: "dir",
        path,
        items: data.map((item) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          url: item.html_url,
          downloadUrl: item.download_url,
        })),
      });
    }

    return NextResponse.json({
      type: "file",
      name: data.name,
      path: data.path,
      size: data.size,
      sha: data.sha,
      url: data.html_url,
      downloadUrl: data.download_url,
    });
  } catch (error) {
    console.error("GitHub tree error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch tree" },
      { status: 500 }
    );
  }
}
