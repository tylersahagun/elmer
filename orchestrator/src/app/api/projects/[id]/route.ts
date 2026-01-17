import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProjectStage, updateProjectStatus } from "@/lib/db/queries";
import type { ProjectStage, ProjectStatus } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to get project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage, status, triggeredBy } = body;

    // Handle stage update
    if (stage) {
      const project = await updateProjectStage(
        id,
        stage as ProjectStage,
        triggeredBy || "user"
      );
      return NextResponse.json(project);
    }

    // Handle status update
    if (status) {
      const project = await updateProjectStatus(
        id,
        status as ProjectStatus
      );
      return NextResponse.json(project);
    }

    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
