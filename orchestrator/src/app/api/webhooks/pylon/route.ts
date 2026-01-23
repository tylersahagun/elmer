/**
 * Pylon webhook endpoint for support ticket ingestion
 *
 * Authentication: HMAC-SHA256 signature verification
 * Workspace mapping: Via integration_id query parameter
 *
 * POST /api/webhooks/pylon?integration_id={id}
 */
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  verifyPylonSignature,
  createSignalFromPylon,
  type PylonWebhookPayload,
} from "@/lib/integrations";

export async function POST(request: NextRequest) {
  const receivedAt = new Date();
  const rawBody = await request.text();

  // Get integration_id from query params (required for workspace mapping)
  const integrationId = new URL(request.url).searchParams.get("integration_id");
  if (!integrationId) {
    return NextResponse.json(
      { error: "Missing integration_id query parameter" },
      { status: 400 }
    );
  }

  // Parse payload
  let payload: PylonWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Look up integration
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.id, integrationId),
      eq(integrations.platform, "pylon"),
      eq(integrations.isActive, true)
    ),
  });

  if (!integration) {
    return NextResponse.json(
      { error: "Unknown or inactive integration" },
      { status: 401 }
    );
  }

  if (!integration.webhookSecret) {
    return NextResponse.json(
      { error: "Integration not configured (missing webhook secret)" },
      { status: 500 }
    );
  }

  // Verify signature
  const timestamp = request.headers.get("pylon-webhook-timestamp");
  const signature = request.headers.get("pylon-webhook-signature");

  if (!verifyPylonSignature(rawBody, timestamp, signature, integration.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Queue async processing
  after(async () => {
    try {
      const result = await createSignalFromPylon({
        workspaceId: integration.workspaceId,
        payload: payload.data,
        receivedAt,
      });

      // Update lastUsedAt
      await db
        .update(integrations)
        .set({ lastUsedAt: new Date() })
        .where(eq(integrations.id, integrationId));

      if (result.error) {
        console.error("Pylon signal creation failed:", result.error);
      }
    } catch (error) {
      console.error("Pylon webhook processing error:", error);
      // Don't throw - webhook is already acknowledged
    }
  });

  return NextResponse.json({
    success: true,
    message: "Ticket received, processing async",
    receivedAt: receivedAt.toISOString(),
  });
}
