/**
 * Jobs API - List, create, retry, and delete jobs
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { createConvexWorkspaceActivity } from "@/lib/convex/server";

type JobType = string;
type JobStatus = string;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

async function getAuthenticatedClient() {
  const auth = await clerkAuth();
  const token = await auth.getToken({ template: "convex" });
  const client = getConvexClient();
  if (token) client.setAuth(token);
  return client;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") as JobStatus | null;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const client = getConvexClient();
    const jobsList = await client.query(api.jobs.list, {
      workspaceId: workspaceId as Id<"workspaces">,
      status: status ?? undefined,
    });

    return NextResponse.json(jobsList);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get jobs:", error);
    return NextResponse.json({ error: "Failed to get jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, type, input } = body;

    if (!workspaceId || !type) {
      return NextResponse.json(
        { error: "workspaceId and type are required" },
        { status: 400 },
      );
    }

    const membership = await requireWorkspaceAccess(workspaceId, "member");

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
      "create_feature_branch",
      "process_signal",
      "synthesize_signals",
      "execute_agent_definition",
    ];

    if (!validJobTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid job type: ${type}` },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const jobId = await client.mutation(api.jobs.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: projectId ? (projectId as Id<"projects">) : undefined,
      type,
      input,
    });

    await createConvexWorkspaceActivity({
      workspaceId,
      userId: membership.userId,
      action: "job.triggered",
      targetType: "job",
      targetId: jobId,
      metadata: { type, projectId },
    }).catch(() => {});

    console.log(`📋 Job created: ${type} for project ${projectId}`);

    return NextResponse.json({ id: jobId }, { status: 201 });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/jobs - Retry all failed jobs for a workspace/project
 *
 * Body:
 *   - workspaceId: required
 *   - projectId: optional
 *   - action: "retry_failed" | "reset_pending"
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, action } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    if (action !== "retry_failed" && action !== "reset_pending") {
      return NextResponse.json(
        { error: "action must be 'retry_failed' or 'reset_pending'" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const result = await client.mutation(api.jobs.bulkRetry, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: projectId ? (projectId as Id<"projects">) : undefined,
      includeRunning: action === "reset_pending",
    });

    console.log(`🔄 Reset ${result.reset} jobs to pending for workspace ${workspaceId}`);

    return NextResponse.json({
      success: true,
      reset: result.reset,
      jobs: result.jobs,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to retry jobs:", error);
    return NextResponse.json(
      { error: "Failed to retry jobs" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/jobs - Clear failed/cancelled jobs for a workspace
 *
 * Query params:
 *   - workspaceId: required
 *   - status: "failed" | "cancelled" | "all_terminal"
 *   - projectId: optional
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
        { status: 400 },
      );
    }

    await requireWorkspaceAccess(workspaceId, "admin");

    if (
      status !== "failed" &&
      status !== "cancelled" &&
      status !== "all_terminal"
    ) {
      return NextResponse.json(
        { error: "status must be 'failed', 'cancelled', or 'all_terminal'" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const result = await client.mutation(api.jobs.bulkDelete, {
      workspaceId: workspaceId as Id<"workspaces">,
      projectId: projectId ? (projectId as Id<"projects">) : undefined,
      status,
    });

    console.log(`🗑️ Cleared ${result.cleared} ${status} jobs for workspace ${workspaceId}`);

    return NextResponse.json({
      success: true,
      cleared: result.cleared,
      status,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to clear jobs:", error);
    return NextResponse.json(
      { error: "Failed to clear jobs" },
      { status: 500 },
    );
  }
}
