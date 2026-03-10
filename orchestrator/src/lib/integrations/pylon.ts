/**
 * Pylon integration utilities
 * - Signature verification using {timestamp}.{body} format
 * - Signal creation from Pylon tickets
 */
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { PylonTicketInput, SignalCreateResult } from "./types";
import { processSignalExtraction } from "@/lib/signals";
import { logActivity } from "@/lib/activity";

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
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Create signal from Pylon ticket
 * Uses check-then-insert for idempotency via sourceRef
 */
export async function createSignalFromPylon(
  input: PylonTicketInput
): Promise<SignalCreateResult> {
  const { workspaceId, payload } = input;

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
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL not set");
    const client = new ConvexHttpClient(convexUrl);

    const result = await client.mutation(api.signals.createFromIntegration, {
      workspaceId: workspaceId as Id<"workspaces">,
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
        source: "pylon",
        ticketId: payload.id,
        verbatimPreview: verbatim.slice(0, 100),
      },
    }).catch(() => {});

    // Queue AI extraction and embedding
    try {
      await processSignalExtraction(signalId);
    } catch (error) {
      console.error(`Failed to process pylon signal ${signalId}:`, error);
    }

    return { created: true, signalId };
  } catch (error) {
    console.error("Pylon signal creation error:", error);
    return {
      created: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
