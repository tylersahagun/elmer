import { NextRequest, NextResponse } from "next/server";
import { getWorkspaces, createWorkspace } from "@/lib/db/queries";

export async function GET() {
  try {
    const workspaces = await getWorkspaces();
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Failed to get workspaces:", error);
    return NextResponse.json(
      { error: "Failed to get workspaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, githubRepo, contextPath } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const workspace = await createWorkspace({
      name,
      description,
      githubRepo,
      contextPath,
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
