/**
 * Webhook endpoint for ingesting documents, transcripts, and signals
 * 
 * This endpoint accepts incoming data from external sources like:
 * - Ask Elephant (transcripts from calls)
 * - Zapier/Make integrations
 * - Email forwarding
 * - Direct API calls
 * 
 * POST /api/webhooks/ingest
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxItems, workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Types for incoming webhook payloads
interface TranscriptPayload {
  type: "transcript";
  title: string;
  content: string;
  participants?: string[];
  duration?: number;
  sourceUrl?: string;
  tags?: string[];
}

interface DocumentPayload {
  type: "document";
  title: string;
  content: string;
  fileType?: string;
  sourceUrl?: string;
  tags?: string[];
}

interface SignalPayload {
  type: "signal" | "feedback";
  title: string;
  content: string;
  sourceName?: string;
  tags?: string[];
}

type IngestPayload = TranscriptPayload | DocumentPayload | SignalPayload;

interface WebhookRequest {
  workspaceId: string;
  source?: string;
  sourceRef?: string;
  payload: IngestPayload;
}

// Validate webhook signature (optional but recommended)
function validateSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get("x-webhook-signature");
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  // If no secret configured, skip validation
  if (!webhookSecret) return true;
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    
    // Validate signature if configured
    if (!validateSignature(request, bodyText)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }
    
    const body: WebhookRequest = JSON.parse(bodyText);
    const { workspaceId, source = "webhook", sourceRef, payload } = body;
    
    // Validate required fields
    if (!workspaceId || !payload || !payload.title || !payload.content) {
      return NextResponse.json(
        { error: "Missing required fields: workspaceId, payload.title, payload.content" },
        { status: 400 }
      );
    }
    
    // Verify workspace exists
    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
    
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }
    
    // Build metadata based on payload type
    const metadata: Record<string, unknown> = {
      tags: payload.tags || [],
    };
    
    if (payload.type === "transcript") {
      const tp = payload as TranscriptPayload;
      metadata.participants = tp.participants;
      metadata.duration = tp.duration;
      metadata.sourceUrl = tp.sourceUrl;
    } else if (payload.type === "document") {
      const dp = payload as DocumentPayload;
      metadata.fileType = dp.fileType;
      metadata.sourceUrl = dp.sourceUrl;
    } else {
      const sp = payload as SignalPayload;
      metadata.sourceName = sp.sourceName;
    }
    
    // Create inbox item
    const id = crypto.randomUUID();
    const now = new Date();
    
    await db.insert(inboxItems).values({
      id,
      workspaceId,
      type: payload.type || "document",
      source: source as "webhook" | "upload" | "email" | "api" | "sync",
      sourceRef,
      title: payload.title,
      rawContent: payload.content,
      status: "pending",
      metadata,
      createdAt: now,
      updatedAt: now,
    });
    
    // Return success with item ID
    return NextResponse.json({
      success: true,
      itemId: id,
      message: `Inbox item created: ${payload.title}`,
    });
    
  } catch (error) {
    console.error("Webhook ingest error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// GET endpoint to check webhook health
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/ingest",
    acceptedTypes: ["transcript", "document", "signal", "feedback"],
    requiredFields: ["workspaceId", "payload.title", "payload.content"],
    optionalHeaders: ["x-webhook-signature"],
  });
}
