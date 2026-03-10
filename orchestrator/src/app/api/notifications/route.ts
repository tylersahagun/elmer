import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

type NotificationType =
  | "job_failed"
  | "job_completed"
  | "missing_transcript"
  | "missing_document"
  | "approval_required"
  | "jury_failed"
  | "integration_error"
  | "stage_blocked"
  | "action_required";

const VALID_TYPES: NotificationType[] = [
  "job_failed",
  "job_completed",
  "missing_transcript",
  "missing_document",
  "approval_required",
  "jury_failed",
  "integration_error",
  "stage_blocked",
  "action_required",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const countOnly = searchParams.get("countOnly") === "true";
    const limit = searchParams.get("limit");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const client = getConvexClient();
    const wsId = workspaceId as Id<"workspaces">;

    if (countOnly) {
      const count = await client.query(api.notifications.countUnread, { workspaceId: wsId });
      return NextResponse.json({ count });
    }

    const notifications = await client.query(api.notifications.listFiltered, {
      workspaceId: wsId,
      status,
      type,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return NextResponse.json(
      { error: "Failed to get notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      projectId,
      jobId,
      type,
      priority,
      title,
      message,
      actionType,
      actionLabel,
      actionUrl,
      actionData,
      metadata,
    } = body;

    if (!workspaceId || !type || !title || !message) {
      return NextResponse.json(
        { error: "workspaceId, type, title, and message are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 }
      );
    }

    const client = getConvexClient();
    const id = await client.mutation(api.notifications.createPublic, {
      workspaceId: workspaceId as Id<"workspaces">,
      type,
      priority: priority ?? "medium",
      title,
      message,
      projectId: projectId as Id<"projects"> | undefined,
      jobId: jobId as Id<"jobs"> | undefined,
      actionType,
      actionLabel,
      actionUrl,
      actionData,
      metadata,
    });

    console.log(`🔔 Notification created: ${type} - ${title}`);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const action = searchParams.get("action");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (action === "markAllRead") {
      const client = getConvexClient();
      await client.mutation(api.notifications.markAllReadForWorkspace, {
        workspaceId: workspaceId as Id<"workspaces">,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
