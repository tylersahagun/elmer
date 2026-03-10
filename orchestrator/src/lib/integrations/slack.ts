/**
 * Slack integration utilities
 * - Signature verification using v0:{timestamp}:{body} format
 * - Signal creation from Slack messages
 */
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { SlackMessageInput, SignalCreateResult } from "./types";
import { processSignalExtraction } from "@/lib/signals";
import { logActivity } from "@/lib/activity";

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
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL not set");
    const client = new ConvexHttpClient(convexUrl);

    const result = await client.mutation(api.signals.createFromIntegration, {
      workspaceId: workspaceId as Id<"workspaces">,
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
    });

    if (result.duplicate) {
      return { created: false, signalId: result.signalId as string, duplicate: true };
    }

    const signalId = result.signalId as string;

    // Log activity (non-blocking, best-effort)
    logActivity(workspaceId, null, "signal.created", {
      targetType: "sync",
      targetId: signalId,
      metadata: {
        source: "slack",
        channelId: event.channel,
        verbatimPreview: event.text.slice(0, 100),
      },
    }).catch(() => {});

    // Queue AI extraction and embedding
    try {
      await processSignalExtraction(signalId);
    } catch (error) {
      console.error(`Failed to process slack signal ${signalId}:`, error);
    }

    return { created: true, signalId };
  } catch (error) {
    console.error("Slack signal creation error:", error);
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
