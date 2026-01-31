import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectCommitHistory, getProjectCommitCount } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { projects, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get project and verify access
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify user has access to workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, project.workspaceId),
        eq(workspaceMembers.userId, session.user.id)
      ),
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch commit history
    const [commits, totalCount] = await Promise.all([
      getProjectCommitHistory(projectId, { limit, offset }),
      getProjectCommitCount(projectId),
    ]);

    return NextResponse.json({
      commits,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + commits.length < totalCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch commit history:", error);
    return NextResponse.json(
      { error: "Failed to fetch commit history" },
      { status: 500 }
    );
  }
}
