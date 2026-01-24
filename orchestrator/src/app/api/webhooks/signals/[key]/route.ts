import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { webhookKeys, signals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { after } from "next/server";

/**
 * URL-based webhook endpoint for signals
 *
 * Simplified integration - API key in URL path instead of header
 * Accepts both JSON and plain text content
 *
 * Usage:
 *   POST https://elmer.studio/api/webhooks/signals/{your-api-key}
 *
 * Examples:
 *   1. Plain text body:
 *      POST with body: "Users are confused about the navigation"
 *      → Creates signal with this as verbatim
 *
 *   2. JSON body:
 *      POST with body: {"verbatim": "Users confused", "severity": "high"}
 *      → Creates signal with full metadata
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key: apiKey } = await context.params;

    // Validate API key from URL path
    const webhookKey = await db.query.webhookKeys.findFirst({
      where: and(
        eq(webhookKeys.apiKey, apiKey),
        eq(webhookKeys.isActive, true)
      ),
    });

    if (!webhookKey) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Update last_used_at timestamp
    await db
      .update(webhookKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(webhookKeys.id, webhookKey.id));

    // Read raw body
    const rawBody = await request.text();
    const contentType = request.headers.get("content-type") || "";

    let signalData: {
      verbatim: string;
      interpretation?: string;
      severity?: "critical" | "high" | "medium" | "low";
      frequency?: "common" | "occasional" | "rare";
      userSegment?: string;
      sourceRef?: string;
      sourceUrl?: string;
      interviewDate?: string;
      interviewee?: string;
      tags?: string[];
    };

    // Parse content based on type
    if (contentType.includes("application/json")) {
      try {
        const jsonData = JSON.parse(rawBody);
        signalData = jsonData;
      } catch (parseError) {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    } else {
      // Plain text or unknown content type - treat entire body as verbatim
      if (!rawBody || rawBody.trim().length === 0) {
        return NextResponse.json(
          { error: "Empty request body" },
          { status: 400 }
        );
      }

      signalData = {
        verbatim: rawBody.trim(),
        sourceRef: `txt_${nanoid(12)}`, // Auto-generate sourceRef for text
      };
    }

    // Validate required field
    if (!signalData.verbatim || signalData.verbatim.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required field: verbatim" },
        { status: 400 }
      );
    }

    // Create signal record
    const [signal] = await db
      .insert(signals)
      .values({
        id: nanoid(),
        workspaceId: webhookKey.workspaceId,
        verbatim: signalData.verbatim,
        interpretation: signalData.interpretation || null,
        severity: signalData.severity || null,
        frequency: signalData.frequency || null,
        userSegment: signalData.userSegment || null,
        source: "webhook",
        sourceRef: signalData.sourceRef || null,
        sourceUrl: signalData.sourceUrl || null,
        interviewDate: signalData.interviewDate
          ? new Date(signalData.interviewDate)
          : null,
        interviewee: signalData.interviewee || null,
        tags: signalData.tags || [],
        webhookKeyId: webhookKey.id,
      })
      .returning();

    // Queue async processing (AI extraction, embedding)
    after(async () => {
      try {
        await fetch(
          `${request.nextUrl.origin}/api/signals/${signal.id}/process`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-Request": "true",
            },
          }
        );
      } catch (error) {
        console.error("Failed to queue signal processing:", error);
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Signal received, processing async",
        signalId: signal.id,
        receivedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Returns endpoint documentation
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  return NextResponse.json({
    endpoint: `/api/webhooks/signals/${key}`,
    method: "POST",
    authentication: "API key embedded in URL path (no headers needed)",
    contentTypes: {
      "application/json": {
        description: "Structured signal data",
        example: {
          verbatim: "Users can't find the export button",
          severity: "medium",
          frequency: "common",
        },
      },
      "text/plain": {
        description: "Plain text automatically becomes verbatim field",
        example: "Users can't find the export button",
      },
    },
    note: "Either format works - use whichever is easier for your integration",
  });
}
