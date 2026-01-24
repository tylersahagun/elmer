/**
 * GET /api/signals/orphans
 *
 * Returns orphan signals for a workspace.
 * Query params: workspaceId, thresholdDays (optional), limit (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceMaintenanceSettings } from "@/lib/db/queries";
import { findOrphanSignals } from "@/lib/maintenance";
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

    // Require viewer access to read orphans
    await requireWorkspaceAccess(workspaceId, "viewer");

    const settings = await getWorkspaceMaintenanceSettings(workspaceId);
    const thresholdDays = parseInt(searchParams.get("thresholdDays") || "") || settings.orphanThresholdDays;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    const result = await findOrphanSignals(workspaceId, thresholdDays, limit);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}
