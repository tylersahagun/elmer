/**
 * Notification Threshold Filter
 *
 * Filters notifications based on workspace automation settings.
 * Uses Convex for all data operations.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

type NotificationType = string;
type NotificationPriority = "urgent" | "high" | "medium" | "low";
type SignalSeverity = "critical" | "high" | "medium" | "low";

export interface NotificationContext {
  workspaceId: string;
  type: NotificationType;
  clusterId?: string;
  clusterSize?: number;
  clusterSeverity?: SignalSeverity;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilterResult {
  send: boolean;
  reason?: string;
}

interface SignalAutomationSettings {
  notifyOnClusterSize: number | null;
  notifyOnSeverity: SignalSeverity | null;
  suppressDuplicateNotifications: boolean;
  cooldownMinutes: number;
}

const DEFAULT_SIGNAL_AUTOMATION: SignalAutomationSettings = {
  notifyOnClusterSize: null,
  notifyOnSeverity: null,
  suppressDuplicateNotifications: false,
  cooldownMinutes: 60,
};

async function getWorkspaceAutomationSettings(
  workspaceId: string,
): Promise<SignalAutomationSettings> {
  try {
    const client = getConvexClient();
    const workspace = await client.query(api.workspaces.get, {
      workspaceId: workspaceId as Id<"workspaces">,
    });
    const settings = workspace?.settings as { signalAutomation?: Partial<SignalAutomationSettings> } | null;
    if (!settings?.signalAutomation) return DEFAULT_SIGNAL_AUTOMATION;
    return { ...DEFAULT_SIGNAL_AUTOMATION, ...settings.signalAutomation };
  } catch {
    return DEFAULT_SIGNAL_AUTOMATION;
  }
}

export async function shouldSendNotification(
  context: NotificationContext
): Promise<NotificationFilterResult> {
  const settings = await getWorkspaceAutomationSettings(context.workspaceId);

  if (context.clusterSize !== undefined && settings.notifyOnClusterSize !== null) {
    if (context.clusterSize < settings.notifyOnClusterSize) {
      return {
        send: false,
        reason: `Cluster size ${context.clusterSize} below threshold ${settings.notifyOnClusterSize}`,
      };
    }
  }

  if (context.clusterSeverity && settings.notifyOnSeverity) {
    if (!meetsSeverityThreshold(context.clusterSeverity, settings.notifyOnSeverity)) {
      return {
        send: false,
        reason: `Severity ${context.clusterSeverity} below threshold ${settings.notifyOnSeverity}`,
      };
    }
  }

  return { send: true };
}

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
  const settings = await getWorkspaceAutomationSettings(context.workspaceId);
  const { send, reason } = await shouldSendNotification(context);

  if (!send) {
    console.log(`[Notification] Filtered: ${reason}`);
    return null;
  }

  const client = getConvexClient();
  const id = await client.mutation(api.notifications.createThresholdAware, {
    workspaceId: context.workspaceId as Id<"workspaces">,
    type: context.type,
    title,
    message,
    priority: options?.priority ?? "medium",
    clusterId: context.clusterId,
    clusterSize: context.clusterSize,
    clusterSeverity: context.clusterSeverity,
    projectId: context.projectId as Id<"projects"> | undefined,
    metadata: context.metadata,
    actionType: options?.actionType,
    actionLabel: options?.actionLabel,
    actionUrl: options?.actionUrl,
    notifyOnClusterSize: settings.notifyOnClusterSize ?? undefined,
    notifyOnSeverity: settings.notifyOnSeverity ?? undefined,
    suppressDuplicates: settings.suppressDuplicateNotifications,
    cooldownMinutes: settings.cooldownMinutes,
  });

  return id ?? null;
}

function meetsSeverityThreshold(
  clusterSeverity: SignalSeverity,
  minSeverity: SignalSeverity
): boolean {
  const severityOrder: SignalSeverity[] = ["critical", "high", "medium", "low"];
  const clusterIdx = severityOrder.indexOf(clusterSeverity);
  const minIdx = severityOrder.indexOf(minSeverity);
  return clusterIdx <= minIdx;
}

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
      metadata: { clusterTheme, suggestedAction },
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
