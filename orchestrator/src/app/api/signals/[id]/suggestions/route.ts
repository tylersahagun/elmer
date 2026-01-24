/**
 * GET /api/signals/[id]/suggestions
 *
 * Returns project association suggestions for an orphan signal.
 * Uses Phase 17 classification to suggest relevant projects.
 *
 * MAINT-01: Cleanup agent suggests signal-to-project associations for unlinked signals.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getWorkspaceMaintenanceSettings,
  findBestProjectMatches,
} from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: signalId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Require viewer access to get suggestions
    await requireWorkspaceAccess(workspaceId, "viewer");

    // Get the signal with its embedding
    const signal = await db.query.signals.findFirst({
      where: and(eq(signals.id, signalId), eq(signals.workspaceId, workspaceId)),
      columns: {
        id: true,
        verbatim: true,
        embeddingVector: true,
        status: true,
      },
    });

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    if (!signal.embeddingVector) {
      return NextResponse.json({
        suggestions: [],
        reason: "Signal has no embedding - cannot compute similarity",
      });
    }

    // Get maintenance settings for confidence threshold
    const settings = await getWorkspaceMaintenanceSettings(workspaceId);
    const minConfidence = settings.minSuggestionConfidence || 0.6;

    // Find similar projects using Phase 17's classification infrastructure
    const matches = await findBestProjectMatches(
      workspaceId,
      signal.embeddingVector,
      5 // Return top 5 matches
    );

    // Filter by confidence threshold and format response
    const suggestions = matches
      .filter((match) => match.similarity >= minConfidence)
      .map((match) => ({
        projectId: match.id,
        projectName: match.name,
        projectDescription: match.description,
        projectStage: match.stage,
        confidence: match.similarity,
        reason: `${Math.round(match.similarity * 100)}% semantic similarity to "${match.name}"`,
      }));

    return NextResponse.json({
      signalId,
      suggestions,
      minConfidence,
      totalMatches: matches.length,
      filteredCount: suggestions.length,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    throw error;
  }
}
