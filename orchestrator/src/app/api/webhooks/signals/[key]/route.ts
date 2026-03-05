import { NextRequest, NextResponse } from "next/server";

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

    // Validate API key against env var
    const expectedKey = process.env.WEBHOOK_API_KEY;
    if (!expectedKey) {
      console.warn("WEBHOOK_API_KEY not set — accepting any key (dev mode)");
    } else if (apiKey !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Read raw body
    const rawBody = await request.text();
    const contentType = request.headers.get("content-type") || "";

    if (!rawBody || rawBody.trim().length === 0) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    let body: Record<string, unknown> | string;

    // Parse content based on type
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    } else {
      body = rawBody.trim();
    }

    const verbatim = typeof body === "string"
      ? body
      : ((body.verbatim ?? body.text ?? JSON.stringify(body)) as string);
    const source = typeof body === "object" ? ((body.source as string) ?? "webhook") : "webhook";
    const severity = typeof body === "object" ? (body.severity as string | undefined) : undefined;

    if (!verbatim || verbatim.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing required field: verbatim" },
        { status: 400 }
      );
    }

    const res = await fetch("https://fortunate-parakeet-796.convex.site/mcp/signals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer elmer-mcp-internal",
      },
      body: JSON.stringify({ verbatim, source, severity }),
    });
    const data = await res.json() as { id: string };
    return NextResponse.json({ ok: true, signalId: data.id }, { status: 201 });
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
