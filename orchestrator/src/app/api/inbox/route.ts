/**
 * Inbox Items API - List and manage inbox items
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxItems, projects } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

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
        { status: 400 }
      );
    }
    
    // Build query conditions
    const conditions = [eq(inboxItems.workspaceId, workspaceId)];
    
    if (status) {
      conditions.push(eq(inboxItems.status, status as "pending" | "processing" | "assigned" | "dismissed"));
    }
    
    if (type) {
      conditions.push(eq(inboxItems.type, type as "transcript" | "document" | "signal" | "feedback"));
    }
    
    const items = await db.query.inboxItems.findMany({
      where: and(...conditions),
      orderBy: [desc(inboxItems.createdAt)],
      limit,
      with: {
        assignedProject: {
          columns: {
            id: true,
            name: true,
            stage: true,
          },
        },
      },
    });
    
    return NextResponse.json(items);
    
  } catch (error) {
    console.error("Failed to get inbox items:", error);
    return NextResponse.json(
      { error: "Failed to get inbox items" },
      { status: 500 }
    );
  }
}

// POST - Create a new inbox item (manual upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, type, title, content, metadata } = body;
    
    if (!workspaceId || !type || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId, type, title, content" },
        { status: 400 }
      );
    }
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await db.insert(inboxItems).values({
      id,
      workspaceId,
      type,
      source: "upload",
      title,
      rawContent: content,
      status: "pending",
      metadata: metadata || {},
      createdAt: now,
      updatedAt: now,
    });
    
    return NextResponse.json({
      id,
      message: "Inbox item created",
    });
    
  } catch (error) {
    console.error("Failed to create inbox item:", error);
    return NextResponse.json(
      { error: "Failed to create inbox item" },
      { status: 500 }
    );
  }
}

// PATCH - Update inbox item (assign to project/persona, dismiss, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      status, 
      assignedProjectId, 
      assignedPersonaId,
      assignedAction, 
      processedContent,
      aiSummary,
      extractedProblems,
      hypothesisMatches,
      metadata,
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing item id" },
        { status: 400 }
      );
    }
    
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    
    if (status) updates.status = status;
    if (assignedProjectId !== undefined) updates.assignedProjectId = assignedProjectId;
    if (assignedPersonaId !== undefined) updates.assignedPersonaId = assignedPersonaId;
    if (assignedAction !== undefined) updates.assignedAction = assignedAction;
    if (processedContent !== undefined) updates.processedContent = processedContent;
    if (aiSummary !== undefined) updates.aiSummary = aiSummary;
    if (extractedProblems !== undefined) updates.extractedProblems = extractedProblems;
    if (hypothesisMatches !== undefined) updates.hypothesisMatches = hypothesisMatches;
    if (metadata !== undefined) updates.metadata = metadata;
    
    // Mark as processed when assigned to project or persona
    if (status === "assigned" && (assignedProjectId || assignedPersonaId)) {
      updates.processedAt = new Date();
    }
    
    await db.update(inboxItems)
      .set(updates)
      .where(eq(inboxItems.id, id));
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Failed to update inbox item:", error);
    return NextResponse.json(
      { error: "Failed to update inbox item" },
      { status: 500 }
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
        { status: 400 }
      );
    }
    
    await db.delete(inboxItems).where(eq(inboxItems.id, id));
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Failed to delete inbox item:", error);
    return NextResponse.json(
      { error: "Failed to delete inbox item" },
      { status: 500 }
    );
  }
}
