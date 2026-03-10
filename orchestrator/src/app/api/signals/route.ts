import { NextRequest, NextResponse, after } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { processSignalExtraction } from "@/lib/signals";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const source = searchParams.get("source") || undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!).getTime()
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!).getTime()
      : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const client = getConvexClient();
    const allSignals = await client.query(api.signals.list, {
      workspaceId: workspaceId as Id<"workspaces">,
      status,
    });

    type ConvexSignal = {
      _id: string;
      _creationTime: number;
      verbatim: string;
      interpretation?: string | null;
      source: string;
      status: string;
      severity?: string | null;
      frequency?: string | null;
      userSegment?: string | null;
      tags?: string[] | null;
      sourceRef?: string | null;
      classification?: unknown;
      processedAt?: number | null;
      embeddingVector?: number[] | null;
    };

    let filtered: ConvexSignal[] = allSignals as ConvexSignal[];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.verbatim.toLowerCase().includes(q) ||
          (s.interpretation && s.interpretation.toLowerCase().includes(q))
      );
    }
    if (source) {
      filtered = filtered.filter((s) => s.source === source);
    }
    if (dateFrom !== undefined) {
      filtered = filtered.filter((s) => s._creationTime >= dateFrom);
    }
    if (dateTo !== undefined) {
      filtered = filtered.filter((s) => s._creationTime <= dateTo);
    }

    filtered.sort((a, b) => {
      const aVal = a._creationTime;
      const bVal = b._creationTime;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    const signals = paginated.map((s) => ({
      id: s._id,
      workspaceId,
      verbatim: s.verbatim,
      interpretation: s.interpretation ?? null,
      source: s.source,
      status: s.status,
      severity: s.severity ?? null,
      frequency: s.frequency ?? null,
      userSegment: s.userSegment ?? null,
      tags: s.tags ?? null,
      sourceRef: s.sourceRef ?? null,
      classification: s.classification ?? null,
      processedAt: s.processedAt ? new Date(s.processedAt).toISOString() : null,
      createdAt: new Date(s._creationTime).toISOString(),
      updatedAt: new Date(s._creationTime).toISOString(),
    }));

    return NextResponse.json({
      signals,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get signals:", error);
    return NextResponse.json(
      { error: "Failed to get signals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, verbatim, interpretation, source, sourceRef } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    if (!verbatim) {
      return NextResponse.json(
        { error: "verbatim is required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const client = getConvexClient();
    const signalId = await client.mutation(api.signals.create, {
      workspaceId: workspaceId as Id<"workspaces">,
      verbatim,
      interpretation: interpretation || undefined,
      source: source || "paste",
      sourceRef: sourceRef || undefined,
      status: "new",
    });

    after(async () => {
      try {
        await processSignalExtraction(signalId as string);
      } catch (error) {
        console.error(`Failed to process signal ${signalId}:`, error);
      }
    });

    return NextResponse.json(
      {
        id: signalId,
        workspaceId,
        verbatim,
        source: source || "paste",
        status: "new",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to create signal:", error);
    return NextResponse.json(
      { error: "Failed to create signal" },
      { status: 500 }
    );
  }
}
