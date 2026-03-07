import { NextRequest, NextResponse } from "next/server";
import {
  AppAuthenticationError,
  requireCurrentAppUser,
} from "@/lib/auth/server";
import { getWorkspacesForUser, createWorkspace } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
import { getGitHubClient } from "@/lib/github/auth";

export async function GET() {
  try {
    const appUser = await requireCurrentAppUser();
    const workspaces = await getWorkspacesForUser(appUser.id);
    return NextResponse.json(workspaces);
  } catch (error) {
    if (error instanceof AppAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to get workspaces:", error);
    return NextResponse.json(
      { error: "Failed to get workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const appUser = await requireCurrentAppUser();
    const body = await request.json();
    const { name, description, githubRepo, contextPath } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const workspace = await createWorkspace({
      name,
      description,
      githubRepo,
      contextPath,
      userId: appUser.id, // Creator becomes admin
    });

    // Automatically sync knowledge base on workspace creation
    // This populates the initial knowledgebase entries from the context files
    if (workspace?.id) {
      try {
        const octokit = await getGitHubClient(appUser.id);
        const syncResult = await syncKnowledgeBase(workspace.id, { octokit: octokit ?? undefined });
        console.log(
          `📚 Knowledge base synced for new workspace: ${syncResult.synced} entries`,
        );
      } catch (syncError) {
        // Don't fail workspace creation if sync fails - user can manually sync later
        console.error("Knowledge base sync failed (non-fatal):", syncError);
      }
    }

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof AppAuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Failed to create workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
