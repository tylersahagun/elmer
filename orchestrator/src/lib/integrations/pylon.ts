/**
 * Pylon integration utilities
 * - Signature verification using {timestamp}.{body} format
 * - Signal creation from Pylon tickets
 */
import crypto from "crypto";
import { db } from "@/lib/db";
import { signals, activityLogs } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import type { PylonTicketInput, SignalCreateResult } from "./types";

/**
 * Verify Pylon webhook signature
 * Format: HMAC-SHA256({timestamp}.{body})
 * Signature header format: hs256={hash} or plain {hash}
 *
 * @see https://getpylon.com/developers/guides/using-webhooks/
 */
export function verifyPylonSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string
): boolean {
  if (!timestamp || !signature) return false;

  // Normalize signature (remove hs256= prefix if present)
  const normalizedSignature = signature.startsWith("hs256=")
    ? signature.slice(6)
    : signature;

  // Create base string: {timestamp}.{body}
  const baseString = `${timestamp}.${rawBody}`;

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(baseString)
    .digest("hex");

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(normalizedSignature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    // Buffer lengths don't match or invalid hex
    return false;
  }
}

/**
 * Strip HTML tags and normalize whitespace
 * Simple approach - not a full HTML parser
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ") // Replace tags with spaces
    .replace(/&nbsp;/g, " ") // Handle non-breaking spaces
    .replace(/&amp;/g, "&") // Handle ampersands
    .replace(/&lt;/g, "<") // Handle less than
    .replace(/&gt;/g, ">") // Handle greater than
    .replace(/&quot;/g, '"') // Handle quotes
    .replace(/&#39;/g, "'") // Handle apostrophes
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Create signal from Pylon ticket
 * Uses check-then-insert for idempotency via sourceRef
 */
export async function createSignalFromPylon(
  input: PylonTicketInput
): Promise<SignalCreateResult> {
  const { workspaceId, payload, receivedAt } = input;

  // Generate unique sourceRef
  const sourceRef = `pylon-${payload.id}`;

  // Extract text content - prefer plain text, fall back to stripped HTML
  const verbatim = payload.body_text
    ? payload.body_text.trim()
    : payload.body_html
      ? stripHtml(payload.body_html)
      : payload.title || "No content";

  // Skip empty content
  if (!verbatim || verbatim === "No content") {
    return { created: false, filtered: "empty_content" };
  }

  try {
    // Check for existing (idempotency)
    const existing = await db.query.signals.findFirst({
      where: (signals, { and, eq }) =>
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.source, "pylon"),
          eq(signals.sourceRef, sourceRef)
        ),
    });

    if (existing) {
      return { created: false, signalId: existing.id, duplicate: true };
    }

    const signalId = nanoid();
    const [signal] = await db
      .insert(signals)
      .values({
        id: signalId,
        workspaceId,
        verbatim,
        source: "pylon",
        sourceRef,
        sourceMetadata: {
          ticketId: payload.id,
          ticketStatus: payload.state,
          customerEmail: payload.requester?.email,
          sourceName: payload.requester?.name,
          sourceUrl: payload.link,
          rawPayload: payload as unknown as Record<string, unknown>,
        },
        status: "new",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Log activity
    await db.insert(activityLogs).values({
      id: nanoid(),
      workspaceId,
      action: "signal.created",
      targetType: "signal",
      targetId: signalId,
      metadata: {
        source: "pylon",
        ticketId: payload.id,
        verbatimPreview: verbatim.slice(0, 100),
      },
      createdAt: new Date(),
    });

    return { created: true, signalId };
  } catch (error) {
    console.error("Pylon signal creation error:", error);
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
