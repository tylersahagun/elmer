/**
 * Webhook endpoint for ingesting documents, transcripts, and signals
 *
 * Accepts incoming data from external sources like:
 * - Ask Elephant (transcripts from calls)
 * - Zapier/Make integrations
 * - Email forwarding
 * - Direct API calls
 *
 * POST /api/webhooks/ingest
 * Migrated to Convex (replaces Drizzle).
 */

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getConvexWorkspace } from "@/lib/convex/server";
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

function validateSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get("x-webhook-signature");
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) return true;
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`),
  );
}

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();

    if (!validateSignature(request, bodyText)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    const body: WebhookRequest = JSON.parse(bodyText);
    const { workspaceId, source = "webhook", sourceRef, payload } = body;

    if (!workspaceId || !payload || !payload.title || !payload.content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: workspaceId, payload.title, payload.content",
        },
        { status: 400 },
      );
    }

    // Verify workspace exists via the server helper (no user auth needed)
    const workspace = await getConvexWorkspace(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const client = getConvexClient();
    const itemId = await client.mutation(api.inboxItems.createFromWebhook, {
      workspaceId: workspaceId as Id<"workspaces">,
      type: payload.type || "document",
      source,
      sourceRef: sourceRef ?? undefined,
      title: payload.title,
      rawContent: payload.content,
    });

    return NextResponse.json({
      success: true,
      itemId,
      message: `Inbox item created: ${payload.title}`,
    });
  } catch (error) {
    console.error("Webhook ingest error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/ingest",
    acceptedTypes: ["transcript", "document", "signal", "feedback"],
    requiredFields: ["workspaceId", "payload.title", "payload.content"],
    optionalHeaders: ["x-webhook-signature"],
  });
}
