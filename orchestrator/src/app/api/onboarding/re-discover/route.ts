import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspace } from "@/lib/db/queries";
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

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspace = await getWorkspace(workspaceId);
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

    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        {
          error: "GitHub not connected",
          connectUrl: "/api/auth/signin/github",
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
