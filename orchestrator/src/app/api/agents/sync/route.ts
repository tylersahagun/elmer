import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getGitHubClient } from "@/lib/github/auth";
import { syncAgentArchitecture } from "@/lib/agents/sync";
import { ensureDefaultColumnConfigs, getWorkspace } from "@/lib/db/queries";
import { logAgentsSynced } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, owner, repo, ref, createPipeline, selection } = body;

    if (!workspaceId || !owner || !repo) {
      return NextResponse.json(
        { error: "workspaceId, owner, and repo are required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "admin");

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

    const workspace = await getWorkspace(workspaceId);
    const contextPaths = workspace?.settings?.contextPaths?.length
      ? workspace.settings.contextPaths
      : workspace?.contextPath
        ? [workspace.contextPath]
        : [];

    // Look up transformation for this source repo
    const sourceRepo = `${owner}/${repo}`;
    const transformation = workspace?.settings?.sourceRepoTransformations?.find(
      (t) => t.sourceRepo === sourceRepo && t.enabled,
    );

    const result = await syncAgentArchitecture({
      workspaceId,
      owner,
      repo,
      ref,
      contextPaths,
      selection,
      octokit,
      transformation,
    });

    const pipeline = createPipeline
      ? await ensureDefaultColumnConfigs(workspaceId)
      : { created: 0, existing: 0 };

    // Log the sync activity
    const totalSynced = result.count ?? 0;
    await logAgentsSynced(
      workspaceId,
      session.user.id,
      totalSynced,
      `${owner}/${repo}`,
    );

    return NextResponse.json({ ok: true, ...result, pipeline });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync agent architecture:", error);
    return NextResponse.json(
      { error: "Failed to sync agent architecture" },
      { status: 500 },
    );
  }
}
