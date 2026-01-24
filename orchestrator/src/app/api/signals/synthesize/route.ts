/**
 * POST /api/signals/synthesize
 *
 * Find patterns in unlinked signals and propose new initiatives.
 * This is the /synthesize command from INTL-07.
 *
 * Request body:
 * - workspaceId: string (required)
 * - minClusterSize?: number (optional, default 2)
 *
 * Response:
 * - clusters: Array of signal clusters with themes and suggested actions
 * - summary: Brief overview of findings
 */

import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { findSignalClusters, type SignalCluster } from "@/lib/classification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, minClusterSize } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Require member access
    await requireWorkspaceAccess(workspaceId, "member");

    // Find signal clusters
    const clusters = await findSignalClusters(
      workspaceId,
      minClusterSize ?? 2
    );

    // Generate summary
    const summary = generateSummary(clusters);

    return NextResponse.json({
      success: true,
      clusters,
      summary,
      totalClusters: clusters.length,
      totalSignals: clusters.reduce((sum, c) => sum + c.signalCount, 0),
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Synthesize failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Synthesis failed" },
      { status: 500 }
    );
  }
}

function generateSummary(clusters: SignalCluster[]): string {
  if (clusters.length === 0) {
    return "No signal clusters found. Add more signals with similar themes to discover patterns.";
  }

  const newProjectCount = clusters.filter(
    (c) => c.suggestedAction === "new_project"
  ).length;

  const highPriorityCount = clusters.filter(
    (c) => c.severity === "critical" || c.severity === "high"
  ).length;

  const parts = [];

  parts.push(`Found ${clusters.length} signal cluster${clusters.length === 1 ? "" : "s"}`);

  if (newProjectCount > 0) {
    parts.push(`${newProjectCount} could become new project${newProjectCount === 1 ? "" : "s"}`);
  }

  if (highPriorityCount > 0) {
    parts.push(`${highPriorityCount} high priority`);
  }

  return parts.join(". ") + ".";
}
