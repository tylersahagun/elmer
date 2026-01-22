import { NextRequest, NextResponse } from "next/server";
import {
  getSignal,
  getSignalWithLinks,
  linkSignalToProject,
  unlinkSignalFromProject,
  countSignalProjectLinks,
  updateSignal,
} from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/signals/[id]/projects
 * List all projects linked to a signal
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;

    // Get signal to verify it exists and get workspaceId
    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (viewer can read)
    await requireWorkspaceAccess(signal.workspaceId, "viewer");

    // Get signal with linked projects
    const signalWithLinks = await getSignalWithLinks(signalId);

    return NextResponse.json({
      projects:
        signalWithLinks?.projects.map((p) => ({
          id: p.project.id,
          name: p.project.name,
          linkedAt: p.linkedAt,
          linkReason: p.linkReason,
        })) || [],
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signal projects:", error);
    return NextResponse.json(
      { error: "Failed to get signal projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signals/[id]/projects
 * Link a signal to a project
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const { projectId, linkReason } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 }
      );
    }

    // Get signal to verify it exists and get workspaceId
    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (member can write)
    const membership = await requireWorkspaceAccess(signal.workspaceId, "member");

    // Create link
    await linkSignalToProject(signalId, projectId, membership.userId, linkReason);

    // Update signal status to "linked" if not already
    if (signal.status !== "linked") {
      await updateSignal(signalId, { status: "linked" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to link signal to project:", error);
    return NextResponse.json(
      { error: "Failed to link signal to project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/signals/[id]/projects
 * Unlink a signal from a project
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 }
      );
    }

    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId, "member");

    // Delete link
    await unlinkSignalFromProject(signalId, projectId);

    // Check if any projects remain linked
    const remainingCount = await countSignalProjectLinks(signalId);

    // Update status to "reviewed" if no projects linked and current status is "linked"
    if (remainingCount === 0 && signal.status === "linked") {
      await updateSignal(signalId, { status: "reviewed" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to unlink signal from project:", error);
    return NextResponse.json(
      { error: "Failed to unlink signal from project" },
      { status: 500 }
    );
  }
}
