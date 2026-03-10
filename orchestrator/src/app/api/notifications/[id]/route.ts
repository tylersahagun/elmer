import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

type NotificationStatus = "unread" | "read" | "actioned" | "dismissed";
const VALID_STATUSES: NotificationStatus[] = ["unread", "read", "actioned", "dismissed"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getConvexClient();
    const notification = await client.query(api.notifications.getById, {
      id: id as Id<"notifications">,
    });

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

    const client = getConvexClient();
    const notifId = id as Id<"notifications">;

    const notification = await client.query(api.notifications.getById, { id: notifId });
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (action === "dismiss") {
      await client.mutation(api.notifications.updateStatus, {
        id: notifId,
        status: "dismissed",
      });
      return NextResponse.json({ success: true });
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status: ${status}` },
          { status: 400 }
        );
      }
      const updated = await client.mutation(api.notifications.updateStatus, {
        id: notifId,
        status,
      });
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
    const client = getConvexClient();
    const notifId = id as Id<"notifications">;

    const notification = await client.query(api.notifications.getById, { id: notifId });
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await client.mutation(api.notifications.deleteNotification, { id: notifId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
