/**
 * Column Automation Service
 *
 * Triggers configured agent executions when projects move to new columns.
 * Includes loop prevention to avoid infinite automation cycles.
 */

import { getColumnConfigs, createJob, getAgentDefinitionById } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { stageTransitionEvents } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { ProjectStage } from "@/lib/db/schema";

const LOOP_PREVENTION_WINDOW_MS = 60000; // 1 minute
const MAX_TRIGGERS_IN_WINDOW = 3;

export interface AutomationTriggerResult {
  triggered: boolean;
  jobIds: string[];
  skipped: string[];
  blocked?: "loop_prevention" | "no_triggers" | "disabled";
}

/**
 * Check if triggering automation would create a loop.
 * Prevents infinite cycles when automation moves projects between stages.
 */
export async function isAutomationLoop(
  projectId: string,
  toStage: ProjectStage
): Promise<boolean> {
  const windowStart = new Date(Date.now() - LOOP_PREVENTION_WINDOW_MS);

  const recentTransitions = await db
    .select({ count: sql<number>`count(*)` })
    .from(stageTransitionEvents)
    .where(and(
      eq(stageTransitionEvents.cardId, projectId),
      eq(stageTransitionEvents.toStage, toStage),
      eq(stageTransitionEvents.actor, "automation"),
      gte(stageTransitionEvents.timestamp, windowStart)
    ));

  return Number(recentTransitions[0]?.count || 0) >= MAX_TRIGGERS_IN_WINDOW;
}

/**
 * Trigger column automation for a project stage change.
 * Creates jobs for configured agents when a project moves to a new stage.
 *
 * @param workspaceId - Workspace ID
 * @param projectId - Project being moved
 * @param toStage - Target stage (column)
 * @param triggeredBy - Who initiated: "user:{id}" | "automation"
 */
export async function triggerColumnAutomation(
  workspaceId: string,
  projectId: string,
  toStage: ProjectStage,
  triggeredBy: string
): Promise<AutomationTriggerResult> {
  // Check for automation loops (only when triggered by automation)
  if (triggeredBy === "automation" && await isAutomationLoop(projectId, toStage)) {
    console.log(`[ColumnAutomation] Loop prevention: skipping automation for project ${projectId} -> ${toStage}`);
    return { triggered: false, jobIds: [], skipped: [], blocked: "loop_prevention" };
  }

  // Get column config for target stage
  const columns = await getColumnConfigs(workspaceId);
  const targetColumn = columns.find(c => c.stage === toStage);

  if (!targetColumn?.agentTriggers?.length) {
    return { triggered: false, jobIds: [], skipped: [], blocked: "no_triggers" };
  }

  const jobIds: string[] = [];
  const skipped: string[] = [];

  // Sort triggers by priority (lower number = higher priority)
  const sortedTriggers = [...targetColumn.agentTriggers].sort((a, b) => a.priority - b.priority);

  for (const trigger of sortedTriggers) {
    // Verify agent exists and is enabled
    const agent = await getAgentDefinitionById(trigger.agentDefinitionId);
    if (!agent || agent.enabled === false) {
      skipped.push(trigger.agentDefinitionId);
      continue;
    }

    // Create job for agent execution
    const job = await createJob({
      workspaceId,
      projectId,
      type: "execute_agent_definition",
      input: {
        agentDefinitionId: trigger.agentDefinitionId,
        triggeredBy: "column_automation",
        toStage,
      },
    });

    if (job?.id) {
      jobIds.push(job.id);
    }
  }

  // Record transition event for audit trail with automation job IDs
  await db.insert(stageTransitionEvents).values({
    id: nanoid(),
    cardId: projectId,
    workspaceId,
    toStage,
    actor: triggeredBy.startsWith("user:") ? triggeredBy : "automation",
    reason: jobIds.length > 0 ? `Triggered ${jobIds.length} automation(s)` : "No automations triggered",
    automationJobIds: jobIds.length > 0 ? jobIds : null,
    timestamp: new Date(),
  });

  return {
    triggered: jobIds.length > 0,
    jobIds,
    skipped,
  };
}
