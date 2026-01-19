import { NextRequest, NextResponse } from "next/server";
import { createJob, getJobs } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import type { JobType, JobStatus } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") as "pending" | "running" | "completed" | "failed" | "cancelled" | null;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const jobs = await getJobs(workspaceId, status || undefined);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to get jobs:", error);
    return NextResponse.json(
      { error: "Failed to get jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, type, input } = body;

    if (!workspaceId || !type) {
      return NextResponse.json(
        { error: "workspaceId and type are required" },
        { status: 400 }
      );
    }

    // Validate job type
    const validJobTypes: JobType[] = [
      "generate_prd",
      "generate_design_brief",
      "generate_engineering_spec",
      "generate_gtm_brief",
      "analyze_transcript",
      "run_jury_evaluation",
      "build_prototype",
      "iterate_prototype",
      "generate_tickets",
      "validate_tickets",
      "score_stage_alignment",
      "deploy_chromatic",
    ];

    if (!validJobTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid job type: ${type}` },
        { status: 400 }
      );
    }

    const job = await createJob({
      workspaceId,
      projectId,
      type: type as JobType,
      input,
    });

    console.log(`📋 Job created: ${type} for project ${projectId}`);

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs - Clear failed/cancelled jobs for a workspace
 * 
 * Query params:
 *   - workspaceId: required
 *   - status: "failed" | "cancelled" | "all_terminal" (defaults to "failed")
 *   - projectId: optional, filter by project
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") || "failed";
    const projectId = searchParams.get("projectId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Build the status filter
    let statusFilter;
    if (status === "all_terminal") {
      statusFilter = or(
        eq(jobs.status, "failed"),
        eq(jobs.status, "cancelled")
      );
    } else if (status === "failed" || status === "cancelled") {
      statusFilter = eq(jobs.status, status as JobStatus);
    } else {
      return NextResponse.json(
        { error: "status must be 'failed', 'cancelled', or 'all_terminal'" },
        { status: 400 }
      );
    }

    // Build the full where clause
    const whereConditions = [
      eq(jobs.workspaceId, workspaceId),
      statusFilter,
    ];

    if (projectId) {
      whereConditions.push(eq(jobs.projectId, projectId));
    }

    const result = await db.delete(jobs)
      .where(and(...whereConditions))
      .returning({ id: jobs.id });

    console.log(`🗑️ Cleared ${result.length} ${status} jobs for workspace ${workspaceId}`);

    return NextResponse.json({
      success: true,
      cleared: result.length,
      status,
    });
  } catch (error) {
    console.error("Failed to clear jobs:", error);
    return NextResponse.json(
      { error: "Failed to clear jobs" },
      { status: 500 }
    );
  }
}
