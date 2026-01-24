/**
 * Notification Threshold Filter
 *
 * Filters notifications based on workspace automation settings:
 * - Cluster size threshold
 * - Severity threshold
 * - Duplicate suppression within cooldown
 *
 * Implements AUTO-03: Notification thresholds (only notify when criteria met)
 */

import { db } from "@/lib/db";
import { notifications, type NotificationType, type NotificationPriority } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { and, eq, gt, desc } from "drizzle-orm";
import { getWorkspaceAutomationSettings } from "@/lib/db/queries";
import type { SignalSeverity } from "@/lib/db/schema";

export interface NotificationContext {
  workspaceId: string;
  type: NotificationType;
  // Cluster-specific context
  clusterId?: string;
  clusterSize?: number;
  clusterSeverity?: SignalSeverity;
  // General context
  projectId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilterResult {
  send: boolean;
  reason?: string;
}

/**
 * Check if a notification should be sent based on workspace thresholds.
 */
export async function shouldSendNotification(
  context: NotificationContext
): Promise<NotificationFilterResult> {
  const settings = await getWorkspaceAutomationSettings(context.workspaceId);

  // Check cluster size threshold
  if (context.clusterSize !== undefined && settings.notifyOnClusterSize !== null) {
    if (context.clusterSize < settings.notifyOnClusterSize) {
      return {
        send: false,
        reason: `Cluster size ${context.clusterSize} below threshold ${settings.notifyOnClusterSize}`
      };
    }
  }

  // Check severity threshold
  if (context.clusterSeverity && settings.notifyOnSeverity) {
    if (!meetsSeverityThreshold(context.clusterSeverity, settings.notifyOnSeverity)) {
      return {
        send: false,
        reason: `Severity ${context.clusterSeverity} below threshold ${settings.notifyOnSeverity}`,
      };
    }
  }

  // Check for duplicate suppression
  if (settings.suppressDuplicateNotifications && context.clusterId) {
    const recentNotification = await findRecentClusterNotification(
      context.workspaceId,
      context.clusterId,
      settings.cooldownMinutes
    );
    if (recentNotification) {
      return {
        send: false,
        reason: `Duplicate notification suppressed (cooldown: ${settings.cooldownMinutes}m)`,
      };
    }
  }

  return { send: true };
}

/**
 * Create notification with threshold checking.
 * Returns notification ID if created, null if filtered out.
 */
export async function createThresholdAwareNotification(
  context: NotificationContext,
  title: string,
  message: string,
  options?: {
    priority?: NotificationPriority;
    actionType?: string;
    actionLabel?: string;
    actionUrl?: string;
  }
): Promise<string | null> {
  const { send, reason } = await shouldSendNotification(context);

  if (!send) {
    console.log(`[Notification] Filtered: ${reason}`);
    return null;
  }

  const notificationId = nanoid();
  const priority = options?.priority ?? "medium";

  await db.insert(notifications).values({
    id: notificationId,
    workspaceId: context.workspaceId,
    type: context.type,
    priority,
    status: "unread",
    title,
    message,
    projectId: context.projectId ?? null,
    actionType: options?.actionType ?? null,
    actionLabel: options?.actionLabel ?? null,
    actionUrl: options?.actionUrl ?? null,
    metadata: {
      ...context.metadata,
      clusterId: context.clusterId,
      clusterSize: context.clusterSize,
      clusterSeverity: context.clusterSeverity,
    },
    createdAt: new Date(),
  });

  return notificationId;
}

/**
 * Find a recent notification for a cluster within cooldown period.
 */
async function findRecentClusterNotification(
  workspaceId: string,
  clusterId: string,
  cooldownMinutes: number
): Promise<{ id: string } | null> {
  const cooldownThreshold = new Date(Date.now() - cooldownMinutes * 60 * 1000);

  const results = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(
      eq(notifications.workspaceId, workspaceId),
      gt(notifications.createdAt, cooldownThreshold)
    ))
    .orderBy(desc(notifications.createdAt))
    .limit(50); // Check recent notifications

  // Filter by clusterId in metadata (JSONB query)
  for (const notification of results) {
    // Need to check metadata for clusterId
    const fullNotification = await db
      .select({ metadata: notifications.metadata })
      .from(notifications)
      .where(eq(notifications.id, notification.id))
      .limit(1);

    if (fullNotification.length > 0) {
      const metadata = fullNotification[0].metadata as Record<string, unknown> | null;
      if (metadata?.clusterId === clusterId) {
        return { id: notification.id };
      }
    }
  }

  return null;
}

/**
 * Check if cluster severity meets minimum threshold.
 */
function meetsSeverityThreshold(
  clusterSeverity: SignalSeverity,
  minSeverity: SignalSeverity
): boolean {
  const severityOrder: SignalSeverity[] = ["critical", "high", "medium", "low"];
  const clusterIdx = severityOrder.indexOf(clusterSeverity);
  const minIdx = severityOrder.indexOf(minSeverity);
  return clusterIdx <= minIdx;
}

/**
 * Create a cluster notification (convenience function).
 * Used when a new cluster is discovered or reaches threshold.
 */
export async function notifyClusterDiscovered(
  workspaceId: string,
  clusterId: string,
  clusterTheme: string,
  clusterSize: number,
  clusterSeverity: SignalSeverity,
  suggestedAction: "new_project" | "link_to_existing" | "review"
): Promise<string | null> {
  const actionUrl = `/signals?highlight=${clusterId}`;
  const priority: NotificationPriority =
    clusterSeverity === "critical" ? "urgent" :
    clusterSeverity === "high" ? "high" : "medium";

  return createThresholdAwareNotification(
    {
      workspaceId,
      type: "action_required",
      clusterId,
      clusterSize,
      clusterSeverity,
      metadata: {
        clusterTheme,
        suggestedAction,
      },
    },
    `Signal cluster: ${clusterTheme}`,
    `${clusterSize} related signals discovered. Suggested action: ${formatAction(suggestedAction)}`,
    {
      priority,
      actionType: "navigate",
      actionLabel: "View Cluster",
      actionUrl,
    }
  );
}

function formatAction(action: "new_project" | "link_to_existing" | "review"): string {
  switch (action) {
    case "new_project": return "Create new project";
    case "link_to_existing": return "Link to existing project";
    case "review": return "Review signals";
  }
}
