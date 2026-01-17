/**
 * Individual Job API
 * 
 * GET /api/jobs/[id] - Get job status
 * POST /api/jobs/[id] - Perform action (retry, cancel)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { processJob, cancelJob, retryJob } from "@/lib/jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, id),
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to get job:", error);
    return NextResponse.json(
      { error: "Failed to get job" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "process":
        const processResult = await processJob(id);
        return NextResponse.json(processResult);

      case "cancel":
        const cancelled = await cancelJob(id);
        if (!cancelled) {
          return NextResponse.json(
            { error: "Cannot cancel job (not pending or running)" },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, status: "cancelled" });

      case "retry":
        const retryResult = await retryJob(id);
        if (!retryResult) {
          return NextResponse.json(
            { error: "Cannot retry job (not failed)" },
            { status: 400 }
          );
        }
        return NextResponse.json(retryResult);

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Job action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 500 }
    );
  }
}
