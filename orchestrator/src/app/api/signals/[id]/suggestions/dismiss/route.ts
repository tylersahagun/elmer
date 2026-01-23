import { NextRequest, NextResponse } from "next/server";
import { getSignal, dismissSignalSuggestion } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/signals/[id]/suggestions/dismiss
 * Dismiss the AI suggestion for this signal
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;

    // Get signal to verify it exists and get workspaceId
    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (member can dismiss suggestions)
    const membership = await requireWorkspaceAccess(signal.workspaceId, "member");

    // Dismiss the suggestion
    await dismissSignalSuggestion(signalId, membership.userId);

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
