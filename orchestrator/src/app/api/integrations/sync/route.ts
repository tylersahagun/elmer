import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { getConvexWorkspace } from "@/lib/convex/server";
import { getGitHubClient } from "@/lib/github/auth";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { syncSignals } from "@/lib/signals/sync";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, sourceType } = body;

    if (!workspaceId || !sourceType) {
      return NextResponse.json(
        { error: "workspaceId and sourceType are required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const { userId } = await clerkAuth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const workspace = await getConvexWorkspace(workspaceId) as {
      _id: string;
      githubRepo?: string;
      settings?: { baseBranch?: string; contextPaths?: string[] };
    } | null;
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    if (sourceType === "signals") {
      const result = await syncSignals(workspaceId, {});
      return NextResponse.json({
        ok: result.errors.length === 0,
        status: result.errors.length === 0 ? "completed" : "partial",
        ...result,
      });
    }

    if (sourceType === "knowledgebase") {
      const octokit = await getGitHubClient(userId);
      const repoSlug = workspace.githubRepo;
      const [owner, repo] = repoSlug ? repoSlug.split("/") : [];
      const repoRef = workspace.settings?.baseBranch || "main";

      const result = await syncKnowledgeBase(workspaceId, {
        octokit: octokit || undefined,
        repoOwner: owner,
        repoName: repo,
        repoRef,
        contextPaths: workspace.settings?.contextPaths || undefined,
        syncFullFolders: true,
      });

      return NextResponse.json({
        ok: result.errors.length === 0,
        status: result.errors.length === 0 ? "completed" : "partial",
        ...result,
      });
    }

    return NextResponse.json(
      { error: `Unsupported sourceType: ${sourceType}` },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync integration:", error);
    return NextResponse.json(
      { error: "Failed to sync integration" },
      { status: 500 },
    );
  }
}
