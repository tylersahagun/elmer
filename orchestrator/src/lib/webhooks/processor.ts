/**
 * Async signal processing for webhooks
 * Runs in after() context after immediate 200 response.
 * Uses Convex for signal creation (replaces Drizzle).
 */
import { nanoid } from "nanoid";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export interface SignalWebhookPayload {
  // Required
  verbatim: string;

  // Optional structured data
  interpretation?: string;
  severity?: "critical" | "high" | "medium" | "low";
  frequency?: "common" | "occasional" | "rare";
  userSegment?: string;

  // Source tracking
  sourceRef?: string;
  sourceUrl?: string;

  // Ask Elephant specific
  interviewDate?: string;
  interviewee?: string;
  tags?: string[];
}

export interface ProcessWebhookInput {
  workspaceId: string;
  payload: SignalWebhookPayload;
  receivedAt: Date;
  webhookKeyId?: string;
}

export interface ProcessResult {
  created: boolean;
  signalId?: string;
  duplicate?: boolean;
  error?: string;
}

/**
 * Process a webhook payload into a signal via Convex.
 * Uses check-then-insert idempotency via sourceRef.
 */
export async function processSignalWebhook(
  input: ProcessWebhookInput
): Promise<ProcessResult> {
  const { workspaceId, payload, receivedAt } = input;

  const sourceRef = payload.sourceRef || `webhook-${receivedAt.getTime()}-${nanoid(8)}`;

  try {
    const client = getConvexClient();
    const result = await client.mutation(api.signals.createFromWebhook, {
      workspaceId: workspaceId as Id<"workspaces">,
      verbatim: payload.verbatim,
      sourceRef,
      interpretation: payload.interpretation,
      severity: payload.severity,
      frequency: payload.frequency,
      userSegment: payload.userSegment,
      tags: payload.tags,
    });

    if (result.duplicate) {
      return { created: false, signalId: result.signalId as string, duplicate: true };
    }

    return { created: true, signalId: result.signalId as string };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
