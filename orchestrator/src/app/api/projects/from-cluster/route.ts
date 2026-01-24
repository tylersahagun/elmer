/**
 * POST /api/projects/from-cluster
 *
 * Create a new project from a cluster of signals and bulk-link all signals.
 * Used when /synthesize suggests "new_project" action for a cluster.
 *
 * Request body:
 * - workspaceId: string (required)
 * - name: string (required)
 * - description?: string (optional)
 * - signalIds: string[] (required - signals to link)
 * - clusterTheme?: string (optional - for link reason)
 *
 * Response:
 * - success: boolean
 * - projectId: string
 * - linkedSignals: number
 */

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { projects, signalProjects, signals } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logProjectCreated } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, signalIds, clusterTheme } = body;

    // Validate required fields
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    if (!signalIds || !Array.isArray(signalIds) || signalIds.length === 0) {
      return NextResponse.json(
        { error: "signalIds array is required" },
        { status: 400 }
      );
    }

    // Require member access
    const membership = await requireWorkspaceAccess(workspaceId, "member");
    const userId = membership.userId;

    const projectId = `proj_${nanoid()}`;
    const now = new Date();

    // Create project
    await db.insert(projects).values({
      id: projectId,
      workspaceId,
      name: name.trim(),
      description: description?.trim() || null,
      stage: "inbox",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Bulk link signals to project
    const linkReason = clusterTheme
      ? `Created from signal cluster: ${clusterTheme}`
      : "Created from signal cluster";

    await db.insert(signalProjects).values(
      signalIds.map((signalId: string) => ({
        id: nanoid(),
        signalId,
        projectId,
        linkedBy: userId,
        linkReason,
        confidence: null, // User-initiated, not AI
        linkedAt: now,
      }))
    );

    // Update signal statuses to "linked"
    await db
      .update(signals)
      .set({ status: "linked", updatedAt: now })
      .where(inArray(signals.id, signalIds));

    // Log activity
    await logProjectCreated(workspaceId, userId, projectId, name);

    return NextResponse.json({
      success: true,
      projectId,
      linkedSignals: signalIds.length,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Failed to create project from cluster:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create project" },
      { status: 500 }
    );
  }
}
