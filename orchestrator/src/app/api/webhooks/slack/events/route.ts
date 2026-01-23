/**
 * Slack Events API endpoint for message ingestion
 *
 * Authentication: HMAC-SHA256 signature verification (v0 format)
 * URL Verification: Handles Slack's url_verification challenge
 * Workspace mapping: Via team_id from payload
 *
 * POST /api/webhooks/slack/events
 */
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  verifySlackSignature,
  createSignalFromSlack,
  type SlackEventPayload,
} from "@/lib/integrations";

export async function POST(request: NextRequest) {
  const receivedAt = new Date();
  const rawBody = await request.text();

  // Parse payload first (needed for url_verification check)
  let payload: SlackEventPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle URL verification challenge (no signature check for this)
  // This is sent when configuring the Events API endpoint in Slack
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // For all other requests, team_id is required
  if (!payload.team_id) {
    return NextResponse.json(
      { error: "Missing team_id in payload" },
      { status: 400 }
    );
  }

  // Look up integration by Slack team_id
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.platform, "slack"),
      eq(integrations.slackTeamId, payload.team_id),
      eq(integrations.isActive, true)
    ),
  });

  if (!integration) {
    return NextResponse.json(
      { error: "Unknown Slack team or inactive integration" },
      { status: 401 }
    );
  }

  if (!integration.webhookSecret) {
    return NextResponse.json(
      { error: "Integration not configured (missing signing secret)" },
      { status: 500 }
    );
  }

  // Verify Slack signature
  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");

  if (!verifySlackSignature(rawBody, timestamp, signature, integration.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle event callbacks
  if (payload.type === "event_callback" && payload.event?.type === "message") {
    const event = payload.event;

    // Filter out bot messages (prevent self-processing and bot spam)
    if (event.bot_id || event.user === integration.slackBotUserId) {
      return NextResponse.json({
        ok: true,
        filtered: "bot_message",
        reason: "Bot messages are not processed as signals",
      });
    }

    // Filter out message subtypes (edits, deletes, channel joins, etc.)
    if (event.subtype) {
      return NextResponse.json({
        ok: true,
        filtered: "subtype",
        reason: `Message subtype '${event.subtype}' not processed`,
      });
    }

    // Filter out empty messages
    if (!event.text || event.text.trim() === "") {
      return NextResponse.json({
        ok: true,
        filtered: "empty",
        reason: "Empty messages are not processed as signals",
      });
    }

    // Queue async processing
    after(async () => {
      try {
        const result = await createSignalFromSlack({
          workspaceId: integration.workspaceId,
          event,
          teamId: payload.team_id!,
          receivedAt,
        });

        // Update lastUsedAt
        await db
          .update(integrations)
          .set({ lastUsedAt: new Date() })
          .where(eq(integrations.id, integration.id));

        if (result.error) {
          console.error("Slack signal creation failed:", result.error);
        }
      } catch (error) {
        console.error("Slack webhook processing error:", error);
        // Don't throw - webhook is already acknowledged
      }
    });
  }

  return NextResponse.json({ ok: true });
}
