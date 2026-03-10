import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: id as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "viewer");

    return NextResponse.json({
      id: signal._id,
      workspaceId: signal.workspaceId,
      verbatim: signal.verbatim,
      interpretation: signal.interpretation ?? null,
      source: signal.source,
      status: signal.status,
      severity: signal.severity ?? null,
      frequency: signal.frequency ?? null,
      userSegment: signal.userSegment ?? null,
      tags: signal.tags ?? null,
      sourceRef: signal.sourceRef ?? null,
      classification: signal.classification ?? null,
      processedAt: signal.processedAt
        ? new Date(signal.processedAt as number).toISOString()
        : null,
      embeddingVector: signal.embeddingVector ?? null,
      createdAt: new Date(signal._creationTime).toISOString(),
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signal:", error);
    return NextResponse.json(
      { error: "Failed to get signal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      verbatim,
      interpretation,
      status,
      severity,
      frequency,
      userSegment,
    } = body;

    const client = getConvexClient();
    const signal = await client.query(api.signals.get, {
      signalId: id as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    const updated = await client.mutation(api.signals.update, {
      signalId: id as Id<"signals">,
      ...(verbatim !== undefined ? { verbatim } : {}),
      ...(interpretation !== undefined ? { interpretation } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(severity !== undefined ? { severity } : {}),
      ...(frequency !== undefined ? { frequency } : {}),
      ...(userSegment !== undefined ? { userSegment } : {}),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update signal:", error);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getConvexClient();

    const signal = await client.query(api.signals.get, {
      signalId: id as Id<"signals">,
    });

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    await requireWorkspaceAccess(signal.workspaceId as string, "member");

    await client.mutation(api.signals.remove, {
      signalId: id as Id<"signals">,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to delete signal:", error);
    return NextResponse.json(
      { error: "Failed to delete signal" },
      { status: 500 }
    );
  }
}
