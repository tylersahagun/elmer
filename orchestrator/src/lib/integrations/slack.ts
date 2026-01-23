/**
 * Slack integration utilities
 * - Signature verification using v0:{timestamp}:{body} format
 * - Signal creation from Slack messages
 */
import crypto from "crypto";
import { db } from "@/lib/db";
import { signals, activityLogs } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import type { SlackMessageInput, SignalCreateResult } from "./types";

/**
 * Verify Slack request signature
 * Format: v0={HMAC-SHA256(v0:{timestamp}:{body})}
 *
 * @see https://docs.slack.dev/authentication/verifying-requests-from-slack/
 */
export function verifySlackSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  signingSecret: string
): boolean {
  if (!timestamp || !signature) return false;

  // Reject requests older than 5 minutes (replay attack prevention)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) return false;

  // Create base string: v0:{timestamp}:{body}
  const baseString = `v0:${timestamp}:${rawBody}`;

  // Compute expected signature
  const expectedSignature =
    "v0=" +
    crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex");

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    // Buffer lengths don't match
    return false;
  }
}

/**
 * Create signal from Slack message
 * Uses check-then-insert for idempotency via sourceRef
 */
export async function createSignalFromSlack(
  input: SlackMessageInput
): Promise<SignalCreateResult> {
  const { workspaceId, event, teamId } = input;

  // Generate unique sourceRef for idempotency
  const sourceRef = `slack-${teamId}-${event.channel}-${event.ts}`;

  try {
    // Check for existing (idempotency)
    const existing = await db.query.signals.findFirst({
      where: (signals, { and, eq }) =>
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.source, "slack"),
          eq(signals.sourceRef, sourceRef)
        ),
    });

    if (existing) {
      return { created: false, signalId: existing.id, duplicate: true };
    }

    const signalId = nanoid();
    await db.insert(signals).values({
      id: signalId,
      workspaceId,
      verbatim: event.text,
      source: "slack",
      sourceRef,
      sourceMetadata: {
        channelId: event.channel,
        messageTs: event.ts,
        threadTs: event.thread_ts,
        externalId: `${teamId}/${event.channel}/${event.ts}`,
        rawPayload: event as unknown as Record<string, unknown>,
      },
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log activity
    await db.insert(activityLogs).values({
      id: nanoid(),
      workspaceId,
      action: "signal.created",
      targetType: "signal",
      targetId: signalId,
      metadata: {
        source: "slack",
        channelId: event.channel,
        verbatimPreview: event.text.slice(0, 100),
      },
      createdAt: new Date(),
    });

    return { created: true, signalId };
  } catch (error) {
    console.error("Slack signal creation error:", error);
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
