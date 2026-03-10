/**
 * POST /api/projects/from-cluster
 *
 * Create a new project from a cluster of signals and bulk-link all signals.
 * Used when /synthesize suggests "new_project" action for a cluster.
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  createConvexProject,
  getConvexWorkspace,
} from "@/lib/convex/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logProjectCreated } from "@/lib/activity";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, signalIds, clusterTheme } = body;

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

    const membership = await requireWorkspaceAccess(workspaceId, "member");

    // Verify workspace exists
    const workspace = await getConvexWorkspace(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Create the project in Convex
    const created = (await createConvexProject({
      workspaceId,
      name: name.trim(),
      description: description?.trim() || undefined,
      stage: "inbox",
      priority: "P2",
    })) as { id: string };

    const client = getConvexClient();
    const linkReason = clusterTheme
      ? `Created from signal cluster: ${clusterTheme}`
      : "Created from signal cluster";

    // Bulk link signals to the new project
    let linkedCount = 0;
    for (const signalId of signalIds) {
      try {
        await client.mutation(api.signals.linkToProject, {
          signalId: signalId as Id<"signals">,
          projectId: created.id as Id<"projects">,
          linkedBy: membership.userId,
        });
        linkedCount++;
      } catch {
        // Signal may not exist or already linked — skip
      }
    }

    // Log activity
    await logProjectCreated(workspaceId, membership.userId, created.id, name);

    return NextResponse.json({
      success: true,
      projectId: created.id,
      linkedSignals: linkedCount,
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
