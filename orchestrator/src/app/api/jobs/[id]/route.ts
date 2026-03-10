/**
 * Individual Job API
 *
 * GET /api/jobs/[id] - Get job status
 * POST /api/jobs/[id] - Perform action (retry, cancel)
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const client = getConvexClient();
    const job = await client.query(api.jobs.get, {
      jobId: id as Id<"jobs">,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(job.workspaceId as string, "viewer");

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get job:", error);
    return NextResponse.json(
      { error: "Failed to get job" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    const client = getConvexClient();
    const job = await client.query(api.jobs.get, {
      jobId: id as Id<"jobs">,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(
      job.workspaceId as string,
      action === "cancel" ? "member" : "viewer",
    );

    const authClient = await getAuthenticatedClient();

    switch (action) {
      case "process":
        // In the Convex architecture, jobs are automatically picked up by the
        // agent runner via the Convex scheduler. Reset to pending to re-queue.
        await authClient.mutation(api.jobs.updateStatus, {
          jobId: id as Id<"jobs">,
          status: "pending",
          progress: 0,
        });
        return NextResponse.json({
          success: true,
          message: "Job re-queued for processing by agent runner",
        });

      case "cancel":
        await authClient.mutation(api.jobs.cancel, {
          jobId: id as Id<"jobs">,
        });
        return NextResponse.json({ success: true, status: "cancelled" });

      case "retry": {
        const retried = await authClient.mutation(api.jobs.retry, {
          jobId: id as Id<"jobs">,
        });
        if (!retried) {
          return NextResponse.json(
            { error: "Cannot retry job (not failed)" },
            { status: 400 },
          );
        }
        return NextResponse.json(retried);
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Job action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed" },
      { status: 500 },
    );
  }
}
