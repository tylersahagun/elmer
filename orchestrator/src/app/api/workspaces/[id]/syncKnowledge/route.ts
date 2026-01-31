import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWorkspace } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { getGitHubClient } from "@/lib/github/auth";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

/**
 * POST /api/workspaces/[id]/syncKnowledge
 *
 * Syncs knowledge base entries from the filesystem to the database.
 * Scans the workspace's configured contextPaths and upserts markdown files
 * into the knowledgebaseEntries table.
 *
 * Requires member role or higher (members can trigger syncs).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const repoOwner =
      typeof body?.repoOwner === "string" ? body.repoOwner : undefined;
    const repoName =
      typeof body?.repoName === "string" ? body.repoName : undefined;
    const repoRef =
      typeof body?.repoRef === "string" ? body.repoRef : undefined;
    const contextPaths = Array.isArray(body?.contextPaths)
      ? body.contextPaths.filter((value: unknown) => typeof value === "string")
      : undefined;

    // Require member access to trigger sync
    await requireWorkspaceAccess(id, "member");

    // Verify workspace exists
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Parse owner/repo from workspace.githubRepo (format: "owner/repo")
    const [defaultOwner, defaultRepo] = workspace.githubRepo?.split("/") || [];

    // Run the sync
    const octokit = await getGitHubClient(session.user.id);
    const result = await syncKnowledgeBase(id, {
      octokit: octokit ?? undefined,
      repoRef: repoRef || workspace.settings?.baseBranch || undefined,
      repoOwner: repoOwner || defaultOwner || undefined,
      repoName: repoName || defaultRepo || undefined,
      contextPaths: contextPaths?.length ? contextPaths : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${result.synced} knowledge base entries`,
      ...result,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to sync knowledge base" },
      { status: 500 },
    );
  }
}
