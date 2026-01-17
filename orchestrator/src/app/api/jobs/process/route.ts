/**
 * Job Processing API - Triggers job execution
 * 
 * POST /api/jobs/process
 *   - Process all pending jobs for a workspace
 *   - Or process a specific job by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  processJob, 
  processPendingJobs, 
  getJobStatusSummary,
} from "@/lib/jobs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, workspaceId, maxJobs, concurrency } = body;

    // Process specific job
    if (jobId) {
      console.log(`🎯 Processing specific job: ${jobId}`);
      const result = await processJob(jobId);
      return NextResponse.json(result);
    }

    // Process all pending jobs for workspace
    if (workspaceId) {
      console.log(`📋 Processing pending jobs for workspace: ${workspaceId}`);
      const result = await processPendingJobs(workspaceId, {
        maxJobs: maxJobs || 10,
        concurrency: concurrency || 2,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Either jobId or workspaceId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Job processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const summary = await getJobStatusSummary(workspaceId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Job status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}
