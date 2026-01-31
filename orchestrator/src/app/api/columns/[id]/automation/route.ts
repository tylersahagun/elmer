import { NextRequest, NextResponse } from "next/server";
import { getColumnConfigById, updateColumnConfig } from "@/lib/db/queries";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import type { JobType } from "@/lib/db/schema";

/**
 * GET /api/columns/[id]/automation
 * Returns the automation configuration for a column.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get column to check workspace
    const column = await getColumnConfigById(id);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Check viewer access
    await requireWorkspaceAccess(column.workspaceId, "viewer");

    return NextResponse.json({
      agentTriggers: column.agentTriggers || [],
      autoTriggerJobs: column.autoTriggerJobs || [],
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to get column automation:", error);
    return NextResponse.json(
      { error: "Failed to get column automation" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/columns/[id]/automation
 * Updates the automation rules for a column.
 * Requires member role (edit permission).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get column to check workspace
    const column = await getColumnConfigById(id);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Check member access (edit permission)
    const membership = await requireWorkspaceAccess(
      column.workspaceId,
      "member",
    );

    // Parse request body
    const body = await request.json();
    const { agentTriggers, autoTriggerJobs } = body;

    // Build update payload
    const updates: {
      agentTriggers?: Array<{
        agentDefinitionId: string;
        priority: number;
        conditions?: Record<string, unknown>;
      }>;
      autoTriggerJobs?: JobType[];
    } = {};

    if (agentTriggers !== undefined) {
      // Validate agentTriggers format
      if (!Array.isArray(agentTriggers)) {
        return NextResponse.json(
          { error: "agentTriggers must be an array" },
          { status: 400 },
        );
      }

      // Ensure each trigger has required fields
      // Note: The schema stores enabled state elsewhere, conditions can be added
      const validatedTriggers = agentTriggers.map((trigger, index) => {
        if (
          !trigger.agentDefinitionId ||
          typeof trigger.agentDefinitionId !== "string"
        ) {
          throw new Error(`Invalid agentDefinitionId at index ${index}`);
        }
        return {
          agentDefinitionId: trigger.agentDefinitionId,
          priority:
            typeof trigger.priority === "number" ? trigger.priority : index + 1,
          conditions: trigger.conditions || undefined,
        };
      });

      updates.agentTriggers = validatedTriggers;
    }

    if (autoTriggerJobs !== undefined) {
      if (!Array.isArray(autoTriggerJobs)) {
        return NextResponse.json(
          { error: "autoTriggerJobs must be an array" },
          { status: 400 },
        );
      }
      // Cast to JobType[] - API caller is responsible for valid job types
      updates.autoTriggerJobs = autoTriggerJobs as JobType[];
    }

    // Update the column
    const updated = await updateColumnConfig(id, updates);

    await logActivity(
      column.workspaceId,
      membership.userId,
      "automation.column_updated",
      {
        targetType: "workspace",
        targetId: column.workspaceId,
        metadata: {
          columnId: column.id,
          stage: column.stage,
          agentTriggers: updates.agentTriggers?.map((trigger) => ({
            agentDefinitionId: trigger.agentDefinitionId,
            priority: trigger.priority,
          })),
          autoTriggerJobs: updates.autoTriggerJobs,
        },
      },
    );

    return NextResponse.json({
      ok: true,
      agentTriggers: updated?.agentTriggers || [],
      autoTriggerJobs: updated?.autoTriggerJobs || [],
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    if (
      error instanceof Error &&
      error.message.startsWith("Invalid agentDefinitionId")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to update column automation:", error);
    return NextResponse.json(
      { error: "Failed to update column automation" },
      { status: 500 },
    );
  }
}
