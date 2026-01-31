import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agentDefinitions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import {
  getAgentDefinitionById,
  updateAgentDefinition,
} from "@/lib/db/queries";
import { logAgentToggled, logAgentDeleted } from "@/lib/activity";

/**
 * GET /api/agents/[id]
 *
 * Returns complete agent definition including:
 * - id, name, type, description
 * - sourcePath, sourceRepo, sourceRef
 * - content (full markdown)
 * - metadata (parsed agent-specific fields)
 * - triggers, syncedAt, createdAt
 *
 * Requires viewer access to workspace.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Return 400 for missing ID (should not happen with proper routing)
    if (!id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 },
      );
    }

    const agent = await db.query.agentDefinitions.findFirst({
      where: eq(agentDefinitions.id, id),
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Permission check - requires viewer access
    await requireWorkspaceAccess(agent.workspaceId, "viewer");

    // Return complete agent data including metadata
    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get agent:", error);
    return NextResponse.json({ error: "Failed to get agent" }, { status: 500 });
  }
}

/**
 * PATCH /api/agents/[id]
 *
 * Updates agent definition fields.
 * Currently supports: { enabled: boolean }
 *
 * Requires editor access to workspace.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agent = await getAgentDefinitionById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(
      agent.workspaceId,
      "member",
    );

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 },
      );
    }

    const updated = await updateAgentDefinition(id, { enabled });

    // Log the agent toggle activity
    await logAgentToggled(
      agent.workspaceId,
      membership.userId,
      id,
      agent.name,
      enabled,
    );

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to update agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agent = await db.query.agentDefinitions.findFirst({
      where: eq(agentDefinitions.id, id),
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const membership = await requireWorkspaceAccess(agent.workspaceId, "admin");

    await db.delete(agentDefinitions).where(eq(agentDefinitions.id, id));

    // Log the agent deletion
    await logAgentDeleted(agent.workspaceId, membership.userId, id, agent.name);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to delete agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 },
    );
  }
}
