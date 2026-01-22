import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Require member access to trigger sync
    await requireWorkspaceAccess(id, "member");

    // Verify workspace exists
    const workspace = await getWorkspace(id);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Run the sync
    const result = await syncKnowledgeBase(id);

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
      { status: 500 }
    );
  }
}
