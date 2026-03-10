import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const projectData = await getConvexProjectWithDocuments(id);
    if (!projectData) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projectData.project as { workspaceId: string };
    await requireWorkspaceAccess(project.workspaceId, "member");

    const client = getConvexClient();

    // Get all jobs for this project and cancel pending/running ones
    const jobs = (await client.query(api.jobs.byProject, {
      projectId: id as Id<"projects">,
    })) as Array<{ _id: string; status: string }>;

    const cancellableJobs = jobs.filter(
      (j) => j.status === "pending" || j.status === "running"
    );

    let cancelledCount = 0;
    for (const job of cancellableJobs) {
      try {
        await client.mutation(api.jobs.cancel, {
          jobId: job._id as Id<"jobs">,
        });
        cancelledCount++;
      } catch {
        // Skip jobs that can't be cancelled
      }
    }

    return NextResponse.json({
      success: true,
      message: `Unlocked project. Cancelled ${cancelledCount} pending job(s).`,
      cancelledJobs: cancelledCount,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to unlock project:", error);
    return NextResponse.json(
      { error: "Failed to unlock project" },
      { status: 500 }
    );
  }
}
