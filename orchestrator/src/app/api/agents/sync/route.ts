import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { GITHUB_OAUTH_CONNECT_URL } from "@/lib/auth/routes";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getGitHubClient } from "@/lib/github/auth";
import { syncAgentArchitecture } from "@/lib/agents/sync";
import { getConvexWorkspace, ensureConvexColumns } from "@/lib/convex/server";
import { logAgentsSynced } from "@/lib/activity";

type PathMapping = {
  from: string;
  to: string;
};

type SourceRepoTransformation = {
  sourceRepo: string;
  name: string;
  enabled: boolean;
  pathMappings: PathMapping[];
  chromaticConfig?: {
    token?: string;
    appId?: string;
    productionUrl?: string;
  };
  lastSynced?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await clerkAuth();
    if (!userId) {
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

    const workspace = await getConvexWorkspace(workspaceId) as {
      _id: string;
      contextPath?: string;
      settings?: Record<string, unknown> & {
        contextPaths?: string[];
        sourceRepoTransformations?: unknown[];
      };
    } | null;

    const contextPaths = workspace?.settings?.contextPaths?.length
      ? workspace.settings.contextPaths
      : workspace?.contextPath
        ? [workspace.contextPath]
        : [];

    // Look up transformation for this source repo
    const sourceRepo = `${owner}/${repo}`;
    const transformations = (workspace?.settings?.sourceRepoTransformations ?? []) as SourceRepoTransformation[];
    const transformation = transformations.find(
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
      ? await ensureConvexColumns(workspaceId)
      : { created: 0, existing: 0 };

    // Log the sync activity
    const totalSynced = result.count ?? 0;
    await logAgentsSynced(
      workspaceId,
      userId,
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
