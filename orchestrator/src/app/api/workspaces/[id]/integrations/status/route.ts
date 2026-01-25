import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { getWorkspace } from "@/lib/db/queries";
import { composioService } from "@/lib/composio/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");

    const workspace = await getWorkspace(id);
    const services = workspace?.settings?.composio?.connectedServices || [];

    if (!services.length) {
      return NextResponse.json({ statuses: {} });
    }

    const client = await composioService.getClient(id);
    const userId = composioService.getComposioUserId(id);

    const statuses: Record<string, string> = {};
    for (const service of services) {
      try {
        const result = await (client.connectedAccounts.list as any)({
          userIds: [userId],
          toolkits: [service],
        });
        const items = result?.items || result?.data?.items || [];
        statuses[service] = items[0]?.status || "unknown";
      } catch {
        statuses[service] = "error";
      }
    }

    return NextResponse.json({ statuses });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get integration statuses:", error);
    return NextResponse.json(
      { error: "Failed to get integration statuses" },
      { status: 500 }
    );
  }
}
