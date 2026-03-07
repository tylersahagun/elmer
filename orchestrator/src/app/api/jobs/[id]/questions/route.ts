import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { listPendingQuestionsForJob } from "@/lib/db/queries";
import { eq } from "drizzle-orm";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, id),
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(job.workspaceId, "viewer");
    const questions = await listPendingQuestionsForJob(id);
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
