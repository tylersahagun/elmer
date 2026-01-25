import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { composioService } from "@/lib/composio/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");

    const workspace = await getWorkspace(id);
    const composio = workspace?.settings?.composio;

    return NextResponse.json({
      enabled: composio?.enabled ?? false,
      apiKeySet: Boolean(composio?.apiKey),
      connectedServices: composio?.connectedServices || [],
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get integrations:", error);
    return NextResponse.json(
      { error: "Failed to get integrations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "admin");

    const body = await request.json();
    const { apiKey, enabled, connectedServices } = body;

    await composioService.updateWorkspaceComposioSettings(id, {
      apiKey,
      enabled,
      connectedServices,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update integrations:", error);
    return NextResponse.json(
      { error: "Failed to update integrations" },
      { status: 500 }
    );
  }
}
