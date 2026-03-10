/**
 * Job Processing API
 *
 * In the Convex architecture, jobs are automatically processed by the
 * Convex agent runner scheduler — manual processing is no longer needed.
 * This endpoint is kept as a compatibility stub.
 *
 * POST /api/jobs/process - Stub: returns info about Convex-backed processing
 * GET  /api/jobs/process - Returns job status summary
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, workspaceId } = body;

    if (!jobId && !workspaceId) {
      return NextResponse.json(
        { error: "Either jobId or workspaceId is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Jobs are automatically processed by the Convex agent scheduler. No manual trigger needed.",
      jobId: jobId ?? null,
      workspaceId: workspaceId ?? null,
    });
  } catch (error) {
    console.error("Job processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const jobs = await client.query(api.jobs.list, {
      workspaceId: workspaceId as Id<"workspaces">,
    });

    const summary = {
      total: jobs.length,
      pending: jobs.filter((j: { status: string }) => j.status === "pending").length,
      running: jobs.filter((j: { status: string }) => j.status === "running").length,
      completed: jobs.filter((j: { status: string }) => j.status === "completed").length,
      failed: jobs.filter((j: { status: string }) => j.status === "failed").length,
      cancelled: jobs.filter((j: { status: string }) => j.status === "cancelled").length,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 },
    );
  }
}
