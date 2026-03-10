import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
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
 * GET /api/signals/[id]/projects
 * List all projects linked to a signal
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "viewer");

    const projects = (await client.query(api.signals.linkedProjects, {
      signalId: signalId as Id<"signals">,
    })) as Array<{
      _id: string;
      _creationTime: number;
      name: string;
    }>;

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        linkedAt: new Date(p._creationTime).toISOString(),
        linkReason: null,
      })),
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
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId required" },
        { status: 400 }
      );
    }

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    await client.mutation(api.signals.linkToProject, {
      signalId: signalId as Id<"signals">,
      projectId: projectId as Id<"projects">,
    });

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

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    await client.mutation(api.signals.unlinkFromProject, {
      signalId: signalId as Id<"signals">,
      projectId: projectId as Id<"projects">,
    });

    // Check remaining links to update status
    const remainingProjects = (await client.query(api.signals.linkedProjects, {
      signalId: signalId as Id<"signals">,
    })) as Array<unknown>;

    if (remainingProjects.length === 0 && signal.status === "linked") {
      await client.mutation(api.signals.update, {
        signalId: signalId as Id<"signals">,
        status: "reviewed",
      });
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
