/**
 * GET /api/signals/duplicates
 *
 * Returns potential duplicate signal pairs for a workspace.
 * Query params: workspaceId, similarity (optional), limit (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceMaintenanceSettings } from "@/lib/db/queries";
import { findDuplicateSignals } from "@/lib/maintenance";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Require viewer access to read duplicates
    await requireWorkspaceAccess(workspaceId, "viewer");

    const settings = await getWorkspaceMaintenanceSettings(workspaceId);
    const similarity = parseFloat(searchParams.get("similarity") || "") || settings.duplicateSimilarityThreshold;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const result = await findDuplicateSignals(workspaceId, similarity, limit);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}
