import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db/queries";

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

    const projects = await getProjects(workspaceId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to get projects:", error);
    return NextResponse.json(
      { error: "Failed to get projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name, description, stage } = body;

    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const project = await createProject({
      workspaceId,
      name,
      description,
      stage,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
