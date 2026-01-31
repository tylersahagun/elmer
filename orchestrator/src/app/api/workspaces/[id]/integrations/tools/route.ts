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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");

    const workspace = await getWorkspace(id);
    const composio = workspace?.settings?.composio;
    if (!composio?.enabled) {
      return NextResponse.json({ toolkits: [] });
    }

    const services = composio.connectedServices || [];
    if (services.length === 0) {
      return NextResponse.json({ toolkits: [] });
    }

    const result = await composioService.listTools(id, services);
    const rawItems =
      (result as { items?: unknown[] }).items ||
      (result as { data?: { items?: unknown[] } })?.data?.items ||
      (result as { tools?: unknown[] })?.tools ||
      (Array.isArray(result) ? result : []);

    const tools = (rawItems as Array<Record<string, unknown>>).map((tool) => ({
      name:
        (tool.name as string) ||
        (tool.toolName as string) ||
        (tool.id as string) ||
        "unknown",
      toolkit:
        (tool.toolkit as string) ||
        (tool.app as string) ||
        (tool.appName as string) ||
        "unknown",
    }));

    const grouped = new Map<string, string[]>();
    for (const tool of tools) {
      if (!grouped.has(tool.toolkit)) grouped.set(tool.toolkit, []);
      grouped.get(tool.toolkit)?.push(tool.name);
    }

    const toolkits = Array.from(grouped.entries()).map(([toolkit, names]) => ({
      toolkit,
      count: names.length,
      tools: names.slice(0, 12),
    }));

    return NextResponse.json({ toolkits });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to list integration tools:", error);
    return NextResponse.json(
      { error: "Failed to list integration tools" },
      { status: 500 },
    );
  }
}
