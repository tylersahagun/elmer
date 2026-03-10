import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import {
  linkConvexSignalPersona,
  listConvexSignalPersonas,
  unlinkConvexSignalPersona,
} from "@/lib/convex/server";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/signals/[id]/personas
 * List all personas linked to a signal
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: signalId } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "viewer");

    const signalPersonas = (await listConvexSignalPersonas(signalId)) as Array<{
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

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      signal.workspaceId as string,
      "member"
    );

    await linkConvexSignalPersona({
      signalId,
      personaId,
      linkedBy: membership.userId,
    });

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

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: signalId as Id<"signals">,
    });
    if (!signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    await unlinkConvexSignalPersona(signalId, personaId);

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
