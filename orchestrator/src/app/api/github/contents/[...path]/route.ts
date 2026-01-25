import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";

interface RouteParams {
  params: { path: string[] };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const ref = searchParams.get("ref") || undefined;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    const path = params.path?.join("/") ?? "";
    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
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
      return NextResponse.json(
        { error: "Path is a directory, not a file" },
        { status: 400 }
      );
    }

    const content =
      data.content && data.encoding === "base64"
        ? Buffer.from(data.content, "base64").toString("utf-8")
        : null;

    return NextResponse.json({
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      url: data.html_url,
      content,
    });
  } catch (error) {
    console.error("GitHub contents error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch contents" },
      { status: 500 }
    );
  }
}
