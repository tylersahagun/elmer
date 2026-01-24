/**
 * POST /api/signals/merge
 *
 * Merges duplicate signals.
 * Body: { workspaceId, primarySignalId, secondarySignalId, action?: "merge" | "dismiss" }
 */

import { NextRequest, NextResponse } from "next/server";
import { mergeSignals, dismissDuplicatePair } from "@/lib/maintenance";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, primarySignalId, secondarySignalId, action } = body;

    if (!workspaceId || !primarySignalId || !secondarySignalId) {
      return NextResponse.json(
        { error: "workspaceId, primarySignalId, and secondarySignalId required" },
        { status: 400 }
      );
    }

    // Require member access for write operations
    const membership = await requireWorkspaceAccess(workspaceId, "member");

    // Handle dismiss action
    if (action === "dismiss") {
      await dismissDuplicatePair(
        workspaceId,
        primarySignalId,
        secondarySignalId,
        membership.userId
      );
      return NextResponse.json({ success: true, action: "dismissed" });
    }

    // Default: merge signals
    const result = await mergeSignals(
      workspaceId,
      primarySignalId,
      secondarySignalId,
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
