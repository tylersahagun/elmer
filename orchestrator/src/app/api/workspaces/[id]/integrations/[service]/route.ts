import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { composioService } from "@/lib/composio/service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; service: string }> }
) {
  try {
    const { id, service } = await params;
    await requireWorkspaceAccess(id, "admin");

    const workspace = await getWorkspace(id);
    const connected = workspace?.settings?.composio?.connectedServices || [];
    const next = connected.filter((s) => s !== service);

    await composioService.updateWorkspaceComposioSettings(id, {
      connectedServices: next,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to disconnect service:", error);
    return NextResponse.json(
      { error: "Failed to disconnect service" },
      { status: 500 }
    );
  }
}
