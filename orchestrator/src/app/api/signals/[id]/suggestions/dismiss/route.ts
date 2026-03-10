import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/signals/[id]/suggestions/dismiss
 * Dismiss the AI suggestion for this signal by marking classification.dismissed = true
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    }) as {
      _id: string;
      workspaceId: string;
      classification?: Record<string, unknown> | null;
    } | null;

    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      signal.workspaceId as string,
      "member"
    );

    // Store dismissal in the classification field (no dedicated schema field for this)
    const updatedClassification = {
      ...(signal.classification ?? {}),
      dismissed: true,
      dismissedAt: Date.now(),
      dismissedBy: membership.userId,
    };

    await client.mutation(api.signals.update, {
      signalId: signalId as Id<"signals">,
      classification: updatedClassification,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to dismiss suggestion:", error);
    return NextResponse.json(
      { error: "Failed to dismiss suggestion" },
      { status: 500 }
    );
  }
}
