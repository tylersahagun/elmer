/**
 * Discovery API Endpoint
 *
 * GET /api/discovery?workspaceId=xxx
 *
 * Triggers repository discovery for a workspace's connected GitHub repo.
 * Returns DiscoveryResult with discovered initiatives, context paths, and agents.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getGitHubClient } from "@/lib/github/auth";
import { getWorkspace } from "@/lib/db/queries";
import { scanRepository } from "@/lib/discovery";

export async function GET(request: NextRequest) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Get workspaceId from query
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
  }

  // 3. Load workspace and validate
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  // 4. Parse repo slug (owner/repo)
  const repoSlug = workspace.githubRepo;
  if (!repoSlug) {
    return NextResponse.json({ error: "No repository connected" }, { status: 400 });
  }

  const parts = repoSlug.split("/");
  if (parts.length !== 2) {
    return NextResponse.json(
      { error: "Invalid repository format. Expected owner/repo" },
      { status: 400 }
    );
  }
  const [owner, repo] = parts;

  // 5. Get branch (from onboarding data or settings or default)
  const branch =
    workspace.onboardingData?.selectedBranch ||
    workspace.settings?.baseBranch ||
    "main";

  // 6. Get GitHub client
  const octokit = await getGitHubClient(session.user.id);
  if (!octokit) {
    return NextResponse.json(
      {
        error: "GitHub not connected",
        connectUrl: "/api/auth/signin/github",
      },
      { status: 403 }
    );
  }

  // 7. Run discovery
  try {
    const result = await scanRepository({
      workspaceId,
      owner,
      repo,
      branch,
      octokit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Discovery failed",
      },
      { status: 500 }
    );
  }
}
