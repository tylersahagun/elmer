/**
 * Async signal processing for webhooks
 * Runs in after() context after immediate 200 response
 */
import { db } from "@/lib/db";
import { signals, webhookKeys, activityLogs } from "@/lib/db/schema";
import type { SignalSeverity, SignalFrequency, SignalSourceMetadata } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface SignalWebhookPayload {
  // Required
  verbatim: string;

  // Optional structured data
  interpretation?: string;
  severity?: "critical" | "high" | "medium" | "low";
  frequency?: "common" | "occasional" | "rare";
  userSegment?: string;

  // Source tracking
  sourceRef?: string;        // External ID for idempotency
  sourceUrl?: string;        // Link to original source

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
 * Process a webhook payload into a signal
 * Uses check-then-insert for idempotency
 */
export async function processSignalWebhook(
  input: ProcessWebhookInput
): Promise<ProcessResult> {
  const { workspaceId, payload, receivedAt, webhookKeyId } = input;

  // Generate sourceRef if not provided (timestamp-based for uniqueness)
  const sourceRef = payload.sourceRef || `webhook-${receivedAt.getTime()}-${nanoid(8)}`;

  try {
    // Idempotent insert - check for existing signal with same sourceRef
    // Note: signals table doesn't have unique constraint on sourceRef yet,
    // so we check-then-insert with a unique sourceRef pattern
    const existingSignal = await db.query.signals.findFirst({
      where: (signals, { and, eq }) =>
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.source, "webhook"),
          eq(signals.sourceRef, sourceRef)
        ),
    });

    if (existingSignal) {
      return { created: false, signalId: existingSignal.id, duplicate: true };
    }

    // Build source metadata
    const sourceMetadata: SignalSourceMetadata = {
      sourceUrl: payload.sourceUrl,
      interviewDate: payload.interviewDate,
      interviewee: payload.interviewee,
      webhookId: webhookKeyId,
      rawPayload: payload as unknown as Record<string, unknown>,
    };

    // Build insert values - only include optional fields if set
    const insertValues: typeof signals.$inferInsert = {
      id: nanoid(),
      workspaceId,
      verbatim: payload.verbatim,
      source: "webhook",
      sourceRef,
      sourceMetadata,
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optional fields only if provided
    if (payload.interpretation) {
      insertValues.interpretation = payload.interpretation;
    }
    if (payload.severity) {
      insertValues.severity = payload.severity as SignalSeverity;
    }
    if (payload.frequency) {
      insertValues.frequency = payload.frequency as SignalFrequency;
    }
    if (payload.userSegment) {
      insertValues.userSegment = payload.userSegment;
    }

    const [signal] = await db
      .insert(signals)
      .values(insertValues)
      .returning();

    // Update webhook key last used timestamp
    if (webhookKeyId) {
      await db
        .update(webhookKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(webhookKeys.id, webhookKeyId));
    }

    // Log activity
    await db.insert(activityLogs).values({
      id: nanoid(),
      workspaceId,
      action: "signal.created",
      targetType: "signal",
      targetId: signal.id,
      metadata: {
        source: "webhook",
        webhookKeyId,
        verbatimPreview: payload.verbatim.slice(0, 100),
      },
      createdAt: new Date(),
    });

    return { created: true, signalId: signal.id };
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Don't throw - webhook is already ACKed
    // Error is logged for debugging, could create notification for visibility
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
