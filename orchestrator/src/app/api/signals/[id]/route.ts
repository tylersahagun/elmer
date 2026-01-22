import { NextRequest, NextResponse } from "next/server";
import { getSignal, updateSignal, deleteSignal } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const signal = await getSignal(id);

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    // Require viewer access to the workspace
    await requireWorkspaceAccess(signal.workspaceId, "viewer");

    return NextResponse.json(signal);
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

    // Extract updatable fields
    const {
      verbatim,
      interpretation,
      status,
      severity,
      frequency,
      userSegment,
      sourceRef,
      sourceMetadata,
    } = body;

    // Verify signal exists and get workspaceId
    const signal = await getSignal(id);

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    // Require member access to update
    await requireWorkspaceAccess(signal.workspaceId, "member");

    // Build update data
    const updateData: Parameters<typeof updateSignal>[1] = {};
    if (verbatim !== undefined) updateData.verbatim = verbatim;
    if (interpretation !== undefined) updateData.interpretation = interpretation;
    if (status !== undefined) updateData.status = status;
    if (severity !== undefined) updateData.severity = severity;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (userSegment !== undefined) updateData.userSegment = userSegment;
    if (sourceRef !== undefined) updateData.sourceRef = sourceRef;
    if (sourceMetadata !== undefined) updateData.sourceMetadata = sourceMetadata;

    const updated = await updateSignal(id, updateData);

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

    // Verify signal exists and get workspaceId
    const signal = await getSignal(id);

    if (!signal) {
      return NextResponse.json(
        { error: "Signal not found" },
        { status: 404 }
      );
    }

    // Require member access to delete
    await requireWorkspaceAccess(signal.workspaceId, "member");

    await deleteSignal(id);

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
