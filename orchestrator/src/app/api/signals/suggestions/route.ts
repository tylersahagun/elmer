import { NextRequest, NextResponse } from "next/server";
import { getSignalSuggestions } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

/**
 * GET /api/signals/suggestions?workspaceId=xxx
 * Get AI suggestions for unlinked signals
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId required" },
        { status: 400 }
      );
    }

    // Verify workspace access (viewer can read suggestions)
    await requireWorkspaceAccess(workspaceId, "viewer");

    const suggestions = await getSignalSuggestions(workspaceId, Math.min(limit, 50));

    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signal suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get signal suggestions" },
      { status: 500 }
    );
  }
}
