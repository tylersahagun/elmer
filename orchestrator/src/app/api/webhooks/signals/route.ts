/**
 * Signal webhook endpoint
 *
 * POST /api/webhooks/signals
 *
 * Receives signals from external sources (Ask Elephant, Zapier, etc.)
 * Uses queue-first pattern: immediate 200 response, async processing via after()
 *
 * Authentication options:
 * 1. X-API-Key header (simple)
 * 2. X-Webhook-Signature + X-Workspace-ID headers (HMAC-SHA256)
 */
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookAuth } from "@/lib/webhooks/auth";
import { processSignalWebhook, SignalWebhookPayload } from "@/lib/webhooks/processor";

export async function POST(request: NextRequest) {
  const receivedAt = new Date();

  // 1. Read raw body for signature verification (must be before JSON.parse)
  const rawBody = await request.text();

  // 2. Verify authentication (fast - ~20ms with db lookup)
  const auth = await verifyWebhookAuth(request, rawBody);
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // 3. Parse and validate payload
  let payload: SignalWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", code: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  // 4. Validate required fields
  if (!payload.verbatim || typeof payload.verbatim !== "string") {
    return NextResponse.json(
      { error: "Missing required field: verbatim", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (payload.verbatim.trim().length === 0) {
    return NextResponse.json(
      { error: "verbatim cannot be empty", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // 5. Queue async processing, return immediately
  after(async () => {
    await processSignalWebhook({
      workspaceId: auth.workspaceId!,
      payload,
      receivedAt,
      webhookKeyId: auth.webhookKeyId,
    });
  });

  // 6. Return success (target: < 100ms total)
  return NextResponse.json({
    success: true,
    message: "Signal received, processing async",
    receivedAt: receivedAt.toISOString(),
  });
}

/**
 * Health check / documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/signals",
    version: "1.0",
    authentication: {
      option1: {
        name: "API Key",
        headers: ["X-API-Key"],
        description: "Simple authentication using workspace API key",
      },
      option2: {
        name: "HMAC Signature",
        headers: ["X-Webhook-Signature", "X-Workspace-ID"],
        description: "Secure authentication with payload signature verification",
        signatureFormat: "sha256=<hex-encoded-hmac>",
      },
    },
    payload: {
      required: {
        verbatim: "string - The actual user quote or feedback",
      },
      optional: {
        interpretation: "string - PM interpretation of the feedback",
        severity: "critical | high | medium | low",
        frequency: "common | occasional | rare",
        userSegment: "string - e.g., enterprise, SMB, prosumer",
        sourceRef: "string - External ID for idempotency",
        sourceUrl: "string - Link to original source",
        interviewDate: "string - Date of interview/conversation",
        interviewee: "string - Name or identifier of the person",
        tags: "string[] - Optional tags",
      },
    },
    example: {
      verbatim: "I can never find where my previous conversations went",
      interpretation: "User struggles with conversation history navigation",
      severity: "medium",
      frequency: "common",
      sourceRef: "ae-transcript-12345",
      interviewee: "Customer A",
    },
  });
}
