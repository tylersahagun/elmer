/**
 * Inbox Items API - List and manage inbox items
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { auth as clerkAuth } from "@clerk/nextjs/server";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

async function getAuthenticatedClient() {
  const auth = await clerkAuth();
  const token = await auth.getToken({ template: "convex" });
  const client = getConvexClient();
  if (token) client.setAuth(token);
  return client;
}

// GET - List inbox items for a workspace
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId parameter" },
        { status: 400 },
      );
    }

    const client = getConvexClient();
    const items = await client.query(api.inboxItems.listByPriority, {
      workspaceId: workspaceId as Id<"workspaces">,
      status: status ?? undefined,
      limit,
    });

    const filtered = type
      ? items.filter((item: { type: string }) => item.type === type)
      : items;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Failed to get inbox items:", error);
    return NextResponse.json(
      { error: "Failed to get inbox items" },
      { status: 500 },
    );
  }
}

// POST - Create a new inbox item (manual upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, type, title, content, metadata: _metadata } = body;

    if (!workspaceId || !type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId, type, title, content" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    const id = await client.mutation(api.inboxItems.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      type,
      source: "upload",
      title,
      rawContent: content,
    });

    return NextResponse.json({ id, message: "Inbox item created" });
  } catch (error) {
    console.error("Failed to create inbox item:", error);
    return NextResponse.json(
      { error: "Failed to create inbox item" },
      { status: 500 },
    );
  }
}

// PATCH - Update inbox item (assign to project, dismiss, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      assignedProjectId,
      processedContent,
      aiSummary,
      extractedProblems,
      hypothesisMatches,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing item id" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    await client.mutation(api.inboxItems.update, {
      itemId: id as Id<"inboxItems">,
      status: status ?? undefined,
      assignedProjectId: assignedProjectId
        ? (assignedProjectId as Id<"projects">)
        : undefined,
      processedContent: processedContent ?? undefined,
      aiSummary: aiSummary ?? undefined,
      extractedProblems: extractedProblems ?? undefined,
      hypothesisMatches: hypothesisMatches ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update inbox item:", error);
    return NextResponse.json(
      { error: "Failed to update inbox item" },
      { status: 500 },
    );
  }
}

// DELETE - Remove inbox item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 },
      );
    }

    const client = await getAuthenticatedClient();
    await client.mutation(api.inboxItems.remove, {
      itemId: id as Id<"inboxItems">,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inbox item:", error);
    return NextResponse.json(
      { error: "Failed to delete inbox item" },
      { status: 500 },
    );
  }
}
