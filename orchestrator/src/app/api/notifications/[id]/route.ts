import { NextRequest, NextResponse } from "next/server";
import {
  getNotification,
  updateNotificationStatus,
  dismissNotification,
  deleteNotification,
} from "@/lib/db/queries";
import type { NotificationStatus } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notification = await getNotification(id);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Failed to get notification:", error);
    return NextResponse.json(
      { error: "Failed to get notification" },
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
    const { status, action } = body;

    const notification = await getNotification(id);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Handle dismiss action
    if (action === "dismiss") {
      await dismissNotification(id);
      return NextResponse.json({ success: true });
    }

    // Handle status update
    if (status) {
      const validStatuses: NotificationStatus[] = ["unread", "read", "actioned", "dismissed"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status: ${status}` },
          { status: 400 }
        );
      }

      const updated = await updateNotificationStatus(id, status as NotificationStatus);
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "No valid update provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const notification = await getNotification(id);
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await deleteNotification(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
