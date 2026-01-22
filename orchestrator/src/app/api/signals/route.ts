import { NextRequest, NextResponse } from "next/server";
import { getSignals, getSignalsCount, createSignal } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import type { SignalStatus, SignalSource } from "@/lib/db/schema";

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

    // Require viewer access to list signals
    await requireWorkspaceAccess(workspaceId, "viewer");

    // Extract optional filters
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as SignalStatus) || undefined;
    const source = (searchParams.get("source") as SignalSource) || undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const sortBy = (searchParams.get("sortBy") as "createdAt" | "updatedAt" | "status" | "source") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const filterOptions = {
      search,
      status,
      source,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
      page,
      pageSize,
    };

    const [signals, total] = await Promise.all([
      getSignals(workspaceId, filterOptions),
      getSignalsCount(workspaceId, { search, status, source, dateFrom, dateTo }),
    ]);

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
    const { workspaceId, verbatim, interpretation, source, sourceRef, sourceMetadata } = body;

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

    // Require member access to create signals
    await requireWorkspaceAccess(workspaceId, "member");

    // Default source to "paste" for manual entry
    const signalSource: SignalSource = source || "paste";

    const signal = await createSignal({
      workspaceId,
      verbatim,
      interpretation,
      source: signalSource,
      sourceRef,
      sourceMetadata,
    });

    return NextResponse.json(signal, { status: 201 });
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
