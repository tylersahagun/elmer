import { NextRequest, NextResponse } from "next/server";
import { cancelProjectJobs, getProject } from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify project exists
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Cancel all pending/running jobs for this project
    const cancelledCount = await cancelProjectJobs(id);

    return NextResponse.json({
      success: true,
      message: `Unlocked project. Cancelled ${cancelledCount} pending job(s).`,
      cancelledJobs: cancelledCount,
    });
  } catch (error) {
    console.error("Failed to unlock project:", error);
    return NextResponse.json(
      { error: "Failed to unlock project" },
      { status: 500 }
    );
  }
}
