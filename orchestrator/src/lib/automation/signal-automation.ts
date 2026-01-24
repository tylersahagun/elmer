/**
 * Signal Automation Orchestrator
 *
 * Checks signal clusters against workspace thresholds and triggers
 * appropriate actions (initiative creation, PRD generation).
 *
 * Entry points:
 * - checkSignalAutomation: Full check for all clusters (cron)
 * - checkSignalAutomationForNewSignal: Triggered after signal processing
 */

import { findSignalClusters, type SignalCluster } from "@/lib/classification/clustering";
import { getWorkspaceAutomationSettings } from "@/lib/db/queries";
import { canPerformAutoAction, recordAutomationAction, hasClusterBeenActioned } from "./rate-limiter";
import { createProjectFromClusterAuto, triggerPrdGeneration } from "./auto-actions";
import { notifyClusterDiscovered } from "@/lib/notifications";
import type { SignalSeverity, SignalAutomationSettings } from "@/lib/db/schema";

export interface AutomationCheckResult {
  clustersChecked: number;
  actionsTriggered: AutoActionRecord[];
  skipped: SkippedCluster[];
}

export interface AutoActionRecord {
  clusterId: string;
  action: "initiative_created" | "prd_triggered";
  projectId?: string;
  timestamp: string;
}

export interface SkippedCluster {
  clusterId: string;
  reason: "below_threshold" | "low_confidence" | "rate_limited" | "cooldown" | "already_actioned" | "severity_filter";
}

/**
 * Check signal clusters and trigger automation based on workspace settings.
 * Called from cron job or manually.
 */
export async function checkSignalAutomation(
  workspaceId: string
): Promise<AutomationCheckResult> {
  const settings = await getWorkspaceAutomationSettings(workspaceId);
  const actionsTriggered: AutoActionRecord[] = [];
  const skipped: SkippedCluster[] = [];

  // Exit early if automation is manual
  if (settings.automationDepth === "manual") {
    return { clustersChecked: 0, actionsTriggered, skipped };
  }

  // Find current clusters (minimum 2 signals)
  const clusters = await findSignalClusters(workspaceId, 2);

  for (const cluster of clusters) {
    const skipReason = await evaluateCluster(cluster, workspaceId, settings);

    if (skipReason) {
      skipped.push({ clusterId: cluster.id, reason: skipReason });
      continue;
    }

    const now = new Date().toISOString();

    // SUGGEST MODE: Only notify, no actions
    if (settings.automationDepth === "suggest") {
      await notifyClusterDiscovered(
        workspaceId,
        cluster.id,
        cluster.theme,
        cluster.signalCount,
        cluster.severity,
        cluster.signalCount >= 3 ? "new_project" : "review"
      );
      continue; // Don't proceed to auto-actions
    }

    // AUTO-04: Auto-create initiative from cluster above threshold
    if (settings.automationDepth === "auto_create" || settings.automationDepth === "full_auto") {
      if (cluster.signalCount >= settings.autoInitiativeThreshold) {
        const projectId = await createProjectFromClusterAuto(workspaceId, cluster);

        await recordAutomationAction(
          workspaceId,
          cluster.id,
          "initiative_created",
          projectId,
          { clusterTheme: cluster.theme, signalCount: cluster.signalCount }
        );

        actionsTriggered.push({
          clusterId: cluster.id,
          action: "initiative_created",
          projectId,
          timestamp: now,
        });

        // Notify user of auto-created project
        await notifyClusterDiscovered(
          workspaceId,
          cluster.id,
          cluster.theme,
          cluster.signalCount,
          cluster.severity,
          "new_project" // Project was created, action completed
        );

        // AUTO-02: Auto-trigger PRD if full_auto and threshold met
        if (settings.automationDepth === "full_auto" &&
            cluster.signalCount >= settings.autoPrdThreshold) {
          const jobId = await triggerPrdGeneration(projectId, workspaceId);

          await recordAutomationAction(
            workspaceId,
            cluster.id,
            "prd_triggered",
            projectId,
            { jobId }
          );

          actionsTriggered.push({
            clusterId: cluster.id,
            action: "prd_triggered",
            projectId,
            timestamp: now,
          });
        }
      }
    }
  }

  return {
    clustersChecked: clusters.length,
    actionsTriggered,
    skipped,
  };
}

/**
 * Evaluate if a cluster should be skipped.
 * Returns skip reason if should skip, null if should process.
 */
async function evaluateCluster(
  cluster: SignalCluster,
  workspaceId: string,
  settings: SignalAutomationSettings
): Promise<SkippedCluster["reason"] | null> {
  // Check if already actioned
  if (await hasClusterBeenActioned(workspaceId, cluster.id)) {
    return "already_actioned";
  }

  // Check rate limiting
  const rateCheck = await canPerformAutoAction(workspaceId, cluster.id, settings);
  if (!rateCheck.allowed) {
    return rateCheck.reason?.includes("cooldown") ? "cooldown" : "rate_limited";
  }

  // Check confidence threshold
  if (cluster.confidence < settings.minClusterConfidence) {
    return "low_confidence";
  }

  // Check severity filter
  if (settings.minSeverityForAuto &&
      !meetsSeverityThreshold(cluster.severity, settings.minSeverityForAuto)) {
    return "severity_filter";
  }

  // Check size threshold
  if (cluster.signalCount < settings.autoInitiativeThreshold) {
    return "below_threshold";
  }

  return null;
}

/**
 * Check if cluster severity meets minimum threshold.
 * Lower index = higher severity.
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
 * Quick automation check triggered after a new signal is processed.
 * Called from after() blocks in signal processing.
 */
export async function checkSignalAutomationForNewSignal(
  workspaceId: string,
  triggeringSignalId: string
): Promise<void> {
  try {
    const settings = await getWorkspaceAutomationSettings(workspaceId);

    // Exit early if automation is disabled
    if (settings.automationDepth === "manual") return;

    // Run full automation check
    const result = await checkSignalAutomation(workspaceId);

    // Log for observability
    if (result.actionsTriggered.length > 0) {
      console.log(
        `[SignalAutomation] Triggered ${result.actionsTriggered.length} actions after signal ${triggeringSignalId}`
      );
    }
  } catch (error) {
    // Never throw in after() context - log and continue
    console.error(`[SignalAutomation] Error checking automation for signal ${triggeringSignalId}:`, error);
  }
}
