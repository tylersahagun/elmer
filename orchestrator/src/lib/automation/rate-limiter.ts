/**
 * Rate Limiter for Signal Automation
 *
 * Prevents runaway automation by enforcing:
 * 1. Cooldown period per cluster (don't re-action same cluster too quickly)
 * 2. Daily rate limit per workspace (cap total auto-actions)
 */

import { db } from "@/lib/db";
import { automationActions } from "@/lib/db/schema";
import { eq, and, gt, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { SignalAutomationSettings, AutomationActionType } from "@/lib/db/schema";

/**
 * Check if an automation action can be performed (rate limits, cooldown).
 */
export async function canPerformAutoAction(
  workspaceId: string,
  clusterId: string,
  settings: SignalAutomationSettings
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();

  // Check cooldown for this specific cluster
  const cooldownThreshold = new Date(now.getTime() - settings.cooldownMinutes * 60 * 1000);
  const recentClusterAction = await db
    .select()
    .from(automationActions)
    .where(and(
      eq(automationActions.workspaceId, workspaceId),
      eq(automationActions.clusterId, clusterId),
      gt(automationActions.triggeredAt, cooldownThreshold)
    ))
    .limit(1);

  if (recentClusterAction.length > 0) {
    return {
      allowed: false,
      reason: `Cluster in cooldown (${settings.cooldownMinutes}m)`
    };
  }

  // Check daily rate limit
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const dailyCount = await db
    .select({ count: count() })
    .from(automationActions)
    .where(and(
      eq(automationActions.workspaceId, workspaceId),
      gt(automationActions.triggeredAt, dayStart)
    ));

  if (dailyCount[0].count >= settings.maxAutoActionsPerDay) {
    return {
      allowed: false,
      reason: `Daily limit reached (${settings.maxAutoActionsPerDay}/day)`
    };
  }

  return { allowed: true };
}

/**
 * Record an automation action for rate limiting tracking.
 */
export async function recordAutomationAction(
  workspaceId: string,
  clusterId: string,
  actionType: AutomationActionType,
  projectId?: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const actionId = nanoid();

  await db.insert(automationActions).values({
    id: actionId,
    workspaceId,
    clusterId,
    actionType,
    projectId: projectId ?? null,
    triggeredAt: new Date(),
    metadata: metadata ?? null,
  });

  return actionId;
}

/**
 * Check if a cluster has already been actioned (for deduplication).
 */
export async function hasClusterBeenActioned(
  workspaceId: string,
  clusterId: string
): Promise<boolean> {
  const existing = await db
    .select({ id: automationActions.id })
    .from(automationActions)
    .where(and(
      eq(automationActions.workspaceId, workspaceId),
      eq(automationActions.clusterId, clusterId)
    ))
    .limit(1);

  return existing.length > 0;
}
