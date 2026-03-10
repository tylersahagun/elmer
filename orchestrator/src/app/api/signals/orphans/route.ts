/**
 * GET /api/signals/orphans
 *
 * Returns orphan signals for a workspace.
 * Query params: workspaceId, thresholdDays (optional), limit (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getConvexWorkspace } from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

const DEFAULT_ORPHAN_THRESHOLD_DAYS = 14;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

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

    await requireWorkspaceAccess(workspaceId, "viewer");

    // Get workspace maintenance settings
    const workspace = (await getConvexWorkspace(workspaceId)) as {
      settings?: { maintenance?: { orphanThresholdDays?: number } };
    } | null;

    const workspaceThreshold =
      workspace?.settings?.maintenance?.orphanThresholdDays ??
      DEFAULT_ORPHAN_THRESHOLD_DAYS;

    const thresholdDays =
      parseInt(searchParams.get("thresholdDays") || "") || workspaceThreshold;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // Get all "new" signals for the workspace
    const client = getConvexClient();
    const allSignals = (await client.query(api.signals.list, {
      workspaceId: workspaceId as Id<"workspaces">,
      status: "new",
    })) as Array<{
      _id: string;
      _creationTime: number;
      verbatim: string;
      source: string;
      severity?: string | null;
    }>;

    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Orphans: "new" status signals older than threshold
    const orphanSignals = allSignals
      .filter((s) => now - s._creationTime > thresholdMs)
      .slice(0, limit)
      .map((s) => ({
        id: s._id,
        verbatim: s.verbatim,
        source: s.source,
        severity: s.severity ?? null,
        createdAt: new Date(s._creationTime).toISOString(),
        daysOrphaned: Math.floor(
          (now - s._creationTime) / (24 * 60 * 60 * 1000)
        ),
      }));

    const oldestDays =
      orphanSignals.length > 0
        ? Math.max(...orphanSignals.map((s) => s.daysOrphaned))
        : 0;

    return NextResponse.json({
      signals: orphanSignals,
      total: orphanSignals.length,
      oldestDays,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}
