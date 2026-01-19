import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import { syncKnowledgeBase } from "@/lib/knowledgebase/sync";

/**
 * POST /api/workspaces/[id]/syncKnowledge
 * 
 * Syncs knowledge base entries from the filesystem to the database.
 * Scans the workspace's configured contextPaths and upserts markdown files
 * into the knowledgebaseEntries table.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    console.error("Failed to sync knowledge base:", error);
    return NextResponse.json(
      { error: "Failed to sync knowledge base" },
      { status: 500 }
    );
  }
}
