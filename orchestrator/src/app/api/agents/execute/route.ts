import { NextRequest, NextResponse } from "next/server";
import { createJob } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, projectId, agentDefinitionId } = body;

    if (!workspaceId || !agentDefinitionId) {
      return NextResponse.json(
        { error: "workspaceId and agentDefinitionId are required" },
        { status: 400 }
      );
    }

    await requireWorkspaceAccess(workspaceId, "member");

    const job = await createJob({
      workspaceId,
      projectId,
      type: "execute_agent_definition",
      input: { agentDefinitionId },
    });

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to execute agent:", error);
    return NextResponse.json({ error: "Failed to execute agent" }, { status: 500 });
  }
}
