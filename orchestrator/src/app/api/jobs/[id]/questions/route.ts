/**
 * GET /api/jobs/[id]/questions - List pending questions for a job
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
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

    const questions = await client.query(api.pendingQuestions.getByJob, {
      jobId: id as Id<"jobs">,
    });

    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch job questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch job questions" },
      { status: 500 },
    );
  }
}
