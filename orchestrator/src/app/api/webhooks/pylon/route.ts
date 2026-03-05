/**
 * Pylon webhook endpoint for support ticket ingestion
 *
 * Authentication: HMAC-SHA256 signature verification
 *
 * POST /api/webhooks/pylon
 */
import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import {
  verifyPylonSignature,
} from "@/lib/integrations";

export async function POST(request: NextRequest) {
  const receivedAt = new Date();
  const rawBody = await request.text();

  // Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Verify signature using env var secret
  const timestamp = request.headers.get("pylon-webhook-timestamp");
  const signature = request.headers.get("pylon-webhook-signature");
  const webhookSecret = process.env.PYLON_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("PYLON_WEBHOOK_SECRET not set — skipping signature verification");
  } else if (!verifyPylonSignature(rawBody, timestamp, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Queue async processing
  after(async () => {
    try {
      const data = payload.data as Record<string, unknown> | undefined;
      const title = (data?.title ?? data?.subject ?? "Support ticket") as string;
      const body = (data?.body ?? data?.description ?? "") as string;
      const verbatim = body ? `${title}: ${body}`.slice(0, 1000) : title;
      const priority = data?.priority as string | undefined;
      const severity = priority === "urgent" ? "critical" :
                       priority === "high" ? "high" : "medium";

      await fetch("https://fortunate-parakeet-796.convex.site/mcp/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer elmer-mcp-internal",
        },
        body: JSON.stringify({ verbatim, source: "pylon", severity }),
      });
    } catch (error) {
      console.error("Pylon webhook Convex error:", error);
    }
  });

  return NextResponse.json({
    success: true,
    message: "Ticket received, processing async",
    receivedAt: receivedAt.toISOString(),
  });
}
