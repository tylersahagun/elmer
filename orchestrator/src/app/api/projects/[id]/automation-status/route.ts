import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { requireWorkspaceAccess, handlePermissionError, PermissionError } from "@/lib/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const client = getConvexClient();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Get jobs for this project from Convex
    const allJobs = await client.query(api.jobs.byProject, {
      projectId: projectId as Id<"projects">,
    });

    const recentJobs = allJobs
      .filter((job: { type: string; _creationTime: number }) =>
        job.type === "execute_agent_definition" &&
        job._creationTime > oneHourAgo
      )
      .sort((a: { _creationTime: number }, b: { _creationTime: number }) =>
        b._creationTime - a._creationTime
      )
      .slice(0, 5);

    const statusMap: Record<string, "queued" | "running" | "succeeded" | "failed"> = {
      pending: "queued",
      running: "running",
      completed: "succeeded",
      failed: "failed",
      cancelled: "failed",
      waiting_input: "running",
    };

    const enrichedJobs = recentJobs.map((job: {
      _id: string;
      status: string;
      _creationTime: number;
      input?: Record<string, unknown>;
      agentDefinitionId?: string;
    }) => ({
      id: job._id,
      status: statusMap[job.status] ?? "queued",
      agentName: "Agent",
      createdAt: new Date(job._creationTime).toISOString(),
    }));

    const runningCount = enrichedJobs.filter(
      (j: { status: string }) => j.status === "queued" || j.status === "running"
    ).length;

    return NextResponse.json({
      hasActiveAutomation: runningCount > 0,
      recentJobs: enrichedJobs,
      runningCount,
      lastRun: enrichedJobs[0] || null,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch automation status:", error);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
