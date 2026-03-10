/**
 * Column Automation Service
 *
 * Triggers configured agent executions when projects move to new columns.
 * Uses Convex for column configs, agent definitions, and job creation (replaces Drizzle).
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { createConvexJobInternal } from "@/lib/convex/server";

type ProjectStage = string;

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

const LOOP_PREVENTION_WINDOW_MS = 60000;
const MAX_TRIGGERS_IN_WINDOW = 3;

export interface AutomationTriggerResult {
  triggered: boolean;
  jobIds: string[];
  skipped: string[];
  blocked?: "loop_prevention" | "no_triggers" | "disabled";
}

// In-memory loop prevention (per process, resets on restart)
const recentTriggers = new Map<string, number[]>();

/**
 * Check if triggering automation would create a loop.
 * Uses in-memory tracking (replaces stageTransitionEvents Drizzle query).
 */
export function isAutomationLoop(
  projectId: string,
  toStage: ProjectStage
): boolean {
  const key = `${projectId}:${toStage}`;
  const now = Date.now();
  const window = now - LOOP_PREVENTION_WINDOW_MS;
  const recent = (recentTriggers.get(key) ?? []).filter((t) => t > window);
  return recent.length >= MAX_TRIGGERS_IN_WINDOW;
}

function recordTrigger(projectId: string, toStage: ProjectStage) {
  const key = `${projectId}:${toStage}`;
  const now = Date.now();
  const window = now - LOOP_PREVENTION_WINDOW_MS;
  const recent = (recentTriggers.get(key) ?? []).filter((t) => t > window);
  recent.push(now);
  recentTriggers.set(key, recent);
}

/**
 * Trigger column automation for a project stage change.
 * Creates jobs for configured agents when a project moves to a new stage.
 */
export async function triggerColumnAutomation(
  workspaceId: string,
  projectId: string,
  toStage: ProjectStage,
  triggeredBy: string
): Promise<AutomationTriggerResult> {
  if (triggeredBy === "automation" && isAutomationLoop(projectId, toStage)) {
    console.log(`[ColumnAutomation] Loop prevention: skipping automation for project ${projectId} -> ${toStage}`);
    return { triggered: false, jobIds: [], skipped: [], blocked: "loop_prevention" };
  }

  const client = getConvexClient();
  const columns = await client.query(api.columns.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
  });

  const targetColumn = (columns as Array<{
    stage: string;
    agentTriggers?: Array<{ agentDefinitionId: string; priority: number; conditions?: Record<string, unknown> }>;
    enabled?: boolean;
  }>).find((c) => c.stage === toStage);

  if (!targetColumn?.agentTriggers?.length) {
    return { triggered: false, jobIds: [], skipped: [], blocked: "no_triggers" };
  }

  const jobIds: string[] = [];
  const skipped: string[] = [];

  const sortedTriggers = [...targetColumn.agentTriggers].sort((a, b) => a.priority - b.priority);

  for (const trigger of sortedTriggers) {
    const agent = await client.query(api.agentDefinitions.get, {
      id: trigger.agentDefinitionId as Id<"agentDefinitions">,
    });

    if (!agent || (agent as { enabled?: boolean }).enabled === false) {
      skipped.push(trigger.agentDefinitionId);
      continue;
    }

    const result = await createConvexJobInternal({
      workspaceId,
      projectId,
      type: "execute_agent_definition",
      input: {
        agentDefinitionId: trigger.agentDefinitionId,
        triggeredBy: "column_automation",
        toStage,
      },
      agentDefinitionId: trigger.agentDefinitionId,
      initiatedBy: triggeredBy,
    });

    if (result?.id) {
      jobIds.push(result.id as string);
    }
  }

  recordTrigger(projectId, toStage);

  console.log(`[ColumnAutomation] project=${projectId} stage=${toStage} triggeredBy=${triggeredBy} jobs=${jobIds.length}`);

  return { triggered: jobIds.length > 0, jobIds, skipped };
}
