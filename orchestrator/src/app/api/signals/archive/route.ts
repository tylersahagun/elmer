/**
 * POST /api/signals/archive
 *
 * Archives signals based on criteria.
 * Body: { workspaceId, signalIds?: string[], linkedOlderThanDays?: number, reviewedOlderThanDays?: number }
 *
 * DELETE /api/signals/archive (unarchive)
 *
 * Restores archived signals.
 * Body: { workspaceId, signalIds: string[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { archiveSignals, unarchiveSignals } from "@/lib/maintenance";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, signalIds, linkedOlderThanDays, reviewedOlderThanDays } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Require member access for write operations
    const membership = await requireWorkspaceAccess(workspaceId, "member");

    const result = await archiveSignals(
      workspaceId,
      {
        signalIds,
        linkedOlderThanDays,
        reviewedOlderThanDays,
      },
      membership.userId
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, signalIds } = body;

    if (!workspaceId || !signalIds || !Array.isArray(signalIds)) {
      return NextResponse.json(
        { error: "workspaceId and signalIds array required" },
        { status: 400 }
      );
    }

    // Require member access for write operations
    const membership = await requireWorkspaceAccess(workspaceId, "member");

    const result = await unarchiveSignals(workspaceId, signalIds, membership.userId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}
