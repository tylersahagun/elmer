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

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/projects/[id]/signals
 * List all signals linked to a project with pagination
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const projectData = await getConvexProjectWithDocuments(projectId);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData.project as { _id: string; workspaceId: string };
    await requireWorkspaceAccess(project.workspaceId, "viewer");

    const client = getConvexClient();
    const allSignals = (await client.query(api.signals.byProject, {
      projectId: projectId as Id<"projects">,
    })) as Array<{
      _id: string;
      _creationTime: number;
      verbatim: string;
      source: string;
      status: string;
      severity?: string | null;
      frequency?: string | null;
      userSegment?: string | null;
      tags?: string[] | null;
      classification?: unknown;
    }>;

    const paginated = allSignals.slice(offset, offset + limit);

    const signals = paginated.map((s) => ({
      id: s._id,
      verbatim: s.verbatim,
      source: s.source,
      status: s.status,
      severity: s.severity ?? null,
      frequency: s.frequency ?? null,
      userSegment: s.userSegment ?? null,
      tags: s.tags ?? null,
      classification: s.classification ?? null,
      createdAt: new Date(s._creationTime).toISOString(),
    }));

    return NextResponse.json({ signals });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get project signals:", error);
    return NextResponse.json(
      { error: "Failed to get project signals" },
      { status: 500 }
    );
  }
}
