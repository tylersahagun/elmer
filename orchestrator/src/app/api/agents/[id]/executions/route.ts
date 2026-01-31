import { NextRequest, NextResponse } from "next/server";
import { getAgentExecutionHistory, getAgentDefinitionById } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

/**
 * GET /api/agents/[id]/executions
 *
 * Returns execution history for an agent definition.
 * Query params:
 * - limit: number of executions to return (default: 20, max: 100)
 *
 * Response:
 * {
 *   executions: Array<{
 *     id: string;
 *     jobId: string;
 *     projectId?: string;
 *     inputContext?: Record<string, unknown>;
 *     tokensUsed?: number;
 *     durationMs?: number;
 *     startedAt?: Date;
 *     completedAt?: Date;
 *     createdAt: Date;
 *     project?: { id: string; name: string };
 *     job?: { id: string; status: string };
 *   }>
 * }
 *
 * Requires viewer access to workspace.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate agent ID
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Get agent to verify it exists and get workspace ID
    const agent = await getAgentDefinitionById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Permission check - requires viewer access to workspace
    await requireWorkspaceAccess(agent.workspaceId, "viewer");

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "20", 10), 1), 100);

    // Fetch execution history
    const executions = await getAgentExecutionHistory(id, limit);

    return NextResponse.json({ executions });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch agent executions:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent executions" },
      { status: 500 }
    );
  }
}
