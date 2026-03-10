/**
 * Rate Limiter for Signal Automation
 *
 * Prevents runaway automation by enforcing:
 * 1. Cooldown period per cluster (don't re-action same cluster too quickly)
 * 2. Daily rate limit per workspace (cap total auto-actions)
 *
 * Uses in-memory storage — resets on server restart, which is acceptable
 * since this is a best-effort cooldown (not an audit trail). For persistent
 * rate limiting with full audit trail, see convex/automationActions.ts.
 */

export type SignalSeverity = "critical" | "high" | "medium" | "low";

export type AutomationActionType =
  | "initiative_created"
  | "prd_triggered"
  | "notification_sent";

export interface SignalAutomationSettings {
  automationDepth: "manual" | "suggest" | "auto_create" | "full_auto";
  autoPrdThreshold: number;
  autoInitiativeThreshold: number;
  minClusterConfidence: number;
  minSeverityForAuto: SignalSeverity | null;
  notifyOnClusterSize: number | null;
  notifyOnSeverity: SignalSeverity | null;
  suppressDuplicateNotifications: boolean;
  maxAutoActionsPerDay: number;
  cooldownMinutes: number;
}

// key: "workspaceId:clusterId" → list of action timestamps (ms)
const recentActions = new Map<string, number[]>();

/**
 * Check if an automation action can be performed (rate limits, cooldown).
 */
export async function canPerformAutoAction(
  workspaceId: string,
  clusterId: string,
  settings: SignalAutomationSettings
): Promise<{ allowed: boolean; reason?: string }> {
  const now = Date.now();
  const cooldownMs = settings.cooldownMinutes * 60 * 1000;
  const clusterKey = `${workspaceId}:${clusterId}`;

  // Check cooldown for this specific cluster
  const clusterTimestamps = recentActions.get(clusterKey) ?? [];
  const inCooldown = clusterTimestamps.some((t) => now - t < cooldownMs);
  if (inCooldown) {
    return {
      allowed: false,
      reason: `Cluster in cooldown (${settings.cooldownMinutes}m)`,
    };
  }

  // Check daily rate limit (workspace-level, all clusters combined)
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayStartMs = dayStart.getTime();

  let dailyCount = 0;
  for (const [key, timestamps] of recentActions.entries()) {
    if (key.startsWith(`${workspaceId}:`)) {
      dailyCount += timestamps.filter((t) => t >= dayStartMs).length;
    }
  }

  if (dailyCount >= settings.maxAutoActionsPerDay) {
    return {
      allowed: false,
      reason: `Daily limit reached (${settings.maxAutoActionsPerDay}/day)`,
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
  _actionType: AutomationActionType,
  _projectId?: string,
  _metadata?: Record<string, unknown>
): Promise<string> {
  const clusterKey = `${workspaceId}:${clusterId}`;
  const timestamps = recentActions.get(clusterKey) ?? [];
  timestamps.push(Date.now());
  // Keep last 100 timestamps per cluster to prevent unbounded growth
  recentActions.set(clusterKey, timestamps.slice(-100));
  return `action_${Date.now()}`;
}

/**
 * Check if a cluster has already been actioned (for deduplication).
 */
export async function hasClusterBeenActioned(
  workspaceId: string,
  clusterId: string
): Promise<boolean> {
  const clusterKey = `${workspaceId}:${clusterId}`;
  return (recentActions.get(clusterKey) ?? []).length > 0;
}
