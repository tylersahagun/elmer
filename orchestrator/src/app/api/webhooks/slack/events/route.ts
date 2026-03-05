/**
 * Slack Events API endpoint for message ingestion
 *
 * Authentication: HMAC-SHA256 signature verification (v0 format)
 * URL Verification: Handles Slack's url_verification challenge
 *
 * POST /api/webhooks/slack/events
 */
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  verifySlackSignature,
  type SlackEventPayload,
} from "@/lib/integrations";

export async function POST(request: NextRequest) {
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

  // Verify Slack signature using env var secret
  const timestamp = request.headers.get("x-slack-request-timestamp");
  const signature = request.headers.get("x-slack-signature");
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  if (!signingSecret) {
    console.warn("SLACK_SIGNING_SECRET not set — skipping signature verification");
  } else if (!verifySlackSignature(rawBody, timestamp, signature, signingSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle event callbacks
  if (payload.type === "event_callback" && payload.event?.type === "message") {
    const event = payload.event;

    // Filter out bot messages
    if (event.bot_id) {
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
        const verbatim = `[Slack #${event.channel ?? "unknown"}] ${event.text}`;
        await fetch("https://fortunate-parakeet-796.convex.site/mcp/signals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer elmer-mcp-internal",
          },
          body: JSON.stringify({
            verbatim,
            source: "slack",
          }),
        });
      } catch (error) {
        console.error("Slack webhook Convex error:", error);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
