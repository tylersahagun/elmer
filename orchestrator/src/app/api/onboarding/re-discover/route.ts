import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { GITHUB_OAUTH_CONNECT_URL } from "@/lib/auth/routes";
import { getConvexWorkspace } from "@/lib/convex/server";
import { getGitHubClient } from "@/lib/github/auth";
import { scanRepository } from "@/lib/discovery";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const { workspaceId } = await request.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "admin");

    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspace = await getConvexWorkspace(workspaceId) as {
      _id: string;
      githubRepo?: string;
      onboardingData?: { selectedBranch?: string };
      settings?: { baseBranch?: string };
    } | null;
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const repoSlug = workspace.githubRepo;
    if (!repoSlug) {
      return NextResponse.json(
        { error: "No repository connected" },
        { status: 400 },
      );
    }

    const [owner, repo] = repoSlug.split("/");
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Invalid repository format. Expected owner/repo" },
        { status: 400 },
      );
    }

    const branch =
      workspace.onboardingData?.selectedBranch ||
      workspace.settings?.baseBranch ||
      "main";

    const octokit = await getGitHubClient(userId);
    if (!octokit) {
      return NextResponse.json(
        {
          error: "GitHub not connected",
          connectUrl: GITHUB_OAUTH_CONNECT_URL,
        },
        { status: 403 },
      );
    }

    const result = await scanRepository({
      workspaceId,
      owner,
      repo,
      branch,
      octokit,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Re-discover failed:", error);
    return NextResponse.json({ error: "Re-discover failed" }, { status: 500 });
  }
}
