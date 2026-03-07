import { NextRequest, NextResponse } from "next/server";
import {
  getSignal,
  getSignalWithLinks,
  linkSignalToPersona,
  unlinkSignalFromPersona,
} from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import {
  linkConvexSignalPersona,
  listConvexSignalPersonas,
  listConvexPersonas,
  unlinkConvexSignalPersona,
} from "@/lib/convex/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/signals/[id]/personas
 * List all personas linked to a signal
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;

    // Get signal to verify it exists and get workspaceId
    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (viewer can read)
    await requireWorkspaceAccess(signal.workspaceId, "viewer");

    const signalPersonas = await listConvexSignalPersonas(signalId) as Array<{
      persona: { _id: string; archetypeId: string } | null;
      linkedAt: string;
    }>;

    return NextResponse.json({
      personas: signalPersonas.map((entry) => ({
        personaId: entry.persona?._id ?? "",
        archetypeId: entry.persona?.archetypeId,
        linkedAt: entry.linkedAt,
      })),
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signal personas:", error);
    return NextResponse.json(
      { error: "Failed to get signal personas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signals/[id]/personas
 * Link a signal to a persona
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const { personaId } = await request.json();

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId required" },
        { status: 400 }
      );
    }

    // Get signal to verify it exists and get workspaceId
    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Verify membership (member can write)
    const membership = await requireWorkspaceAccess(signal.workspaceId, "member");

    await linkConvexSignalPersona({
      signalId,
      personaId,
      linkedBy: membership.userId,
    });

    // Note: Persona linking does NOT affect signal status (only project linking does)

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to link signal to persona:", error);
    return NextResponse.json(
      { error: "Failed to link signal to persona" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/signals/[id]/personas
 * Unlink a signal from a persona
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const { personaId } = await request.json();

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId required" },
        { status: 400 }
      );
    }

    const signal = await getSignal(signalId);
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId, "member");

    await unlinkConvexSignalPersona(signalId, personaId);

    // Note: Persona unlinking does NOT affect signal status

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to unlink signal from persona:", error);
    return NextResponse.json(
      { error: "Failed to unlink signal from persona" },
      { status: 500 }
    );
  }
}
