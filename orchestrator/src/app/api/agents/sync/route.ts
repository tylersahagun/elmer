import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getGitHubClient } from "@/lib/github/auth";
import { syncAgentArchitecture } from "@/lib/agents/sync";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, owner, repo, ref } = body;

    if (!workspaceId || !owner || !repo) {
      return NextResponse.json(
        { error: "workspaceId, owner, and repo are required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "admin");

    const octokit = await getGitHubClient(session.user.id);
    if (!octokit) {
      return NextResponse.json(
        { error: "GitHub not connected", connectUrl: "/api/auth/signin/github" },
        { status: 403 }
      );
    }

    const result = await syncAgentArchitecture({
      workspaceId,
      owner,
      repo,
      ref,
      octokit,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to sync agent architecture:", error);
    return NextResponse.json(
      { error: "Failed to sync agent architecture" },
      { status: 500 }
    );
  }
}
