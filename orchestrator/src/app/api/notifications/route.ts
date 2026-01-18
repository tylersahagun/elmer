import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadNotificationCount,
  createNotification,
  markAllNotificationsRead,
} from "@/lib/db/queries";
import type { NotificationType, NotificationPriority } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const countOnly = searchParams.get("countOnly") === "true";
    const limit = searchParams.get("limit");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Return just the count if requested
    if (countOnly) {
      const count = await getUnreadNotificationCount(workspaceId);
      return NextResponse.json({ count });
    }

    const notifications = await getNotifications(workspaceId, {
      status: status as "unread" | "read" | "actioned" | "dismissed" | undefined,
      type: type as NotificationType | undefined,
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
      expiresAt,
    } = body;

    if (!workspaceId || !type || !title || !message) {
      return NextResponse.json(
        { error: "workspaceId, type, title, and message are required" },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes: NotificationType[] = [
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

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type: ${type}` },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      workspaceId,
      projectId,
      jobId,
      type: type as NotificationType,
      priority: priority as NotificationPriority | undefined,
      title,
      message,
      actionType,
      actionLabel,
      actionUrl,
      actionData,
      metadata,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    console.log(`🔔 Notification created: ${type} - ${title}`);

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

// Mark all as read
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
      await markAllNotificationsRead(workspaceId);
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
