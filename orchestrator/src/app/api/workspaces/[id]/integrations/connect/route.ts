import { NextRequest, NextResponse } from "next/server";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { composioService } from "@/lib/composio/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "admin");

    const body = await request.json();
    const { service, callbackUrl } = body;

    if (!service) {
      return NextResponse.json({ error: "service is required" }, { status: 400 });
    }

    const requestResult = await composioService.connectService(
      id,
      service,
      callbackUrl || ""
    );

    return NextResponse.json({ redirectUrl: requestResult.redirectUrl });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to connect service:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect service" },
      { status: 500 }
    );
  }
}
