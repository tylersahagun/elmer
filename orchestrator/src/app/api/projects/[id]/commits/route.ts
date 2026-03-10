import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { requireWorkspaceAccess, handlePermissionError, PermissionError } from "@/lib/permissions";
import { getConvexProjectWithDocuments } from "@/lib/convex/server";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get project from Convex to get workspaceId for auth check
    const projectData = await getConvexProjectWithDocuments(projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as { _id: string; workspaceId: string };
    await requireWorkspaceAccess(project.workspaceId, "viewer");

    const client = getConvexClient();
    const result = await client.query(api.projectCommits.listByProject, {
      projectId: projectId as Id<"projects">,
      limit,
      offset,
    });

    return NextResponse.json({
      commits: result.commits,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.commits.length < result.total,
      },
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch commit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch commit history" },
      { status: 500 },
    );
  }
}
