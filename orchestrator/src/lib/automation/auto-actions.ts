/**
 * Auto-Actions Module
 *
 * Actions triggered by signal automation:
 * - Create project from cluster (AUTO-04)
 * - Trigger PRD generation (AUTO-02)
 *
 * Migrated to Convex (replaces Drizzle).
 */

import {
  createConvexProject,
  linkConvexSignalToProject,
  bulkUpdateConvexSignalStatus,
  createConvexJobInternal,
} from "@/lib/convex/server";
import type { SignalCluster } from "@/lib/classification/clustering";

/**
 * Create a project from a signal cluster (automated version).
 */
export async function createProjectFromClusterAuto(
  workspaceId: string,
  cluster: SignalCluster
): Promise<string> {
  const result = await createConvexProject({
    workspaceId,
    name: cluster.theme,
    description: `Auto-created from ${cluster.signalCount} signal cluster. Severity: ${cluster.severity}`,
    stage: "inbox",
    metadata: {
      autoCreated: true,
      sourceClusterId: cluster.id,
      clusterConfidence: cluster.confidence,
    },
  });

  const projectId = (result as { id: string }).id;

  // Bulk link signals to the new project
  const signalIds = cluster.signals.map((s) => s.id);
  await Promise.all(
    signalIds.map((signalId) =>
      linkConvexSignalToProject({
        signalId,
        projectId,
        confidence: cluster.confidence,
        linkedBy: "automation",
      }).catch((err) => console.error(`[auto-actions] Failed to link signal ${signalId}:`, err))
    )
  );

  // Update signal statuses to "linked"
  await bulkUpdateConvexSignalStatus(signalIds, "linked").catch((err) =>
    console.error("[auto-actions] Failed to bulk update signal status:", err)
  );

  return projectId;
}

/**
 * Trigger PRD generation for a project.
 */
export async function triggerPrdGeneration(
  projectId: string,
  workspaceId: string
): Promise<string> {
  const result = await createConvexJobInternal({
    workspaceId,
    projectId,
    type: "generate_prd",
    input: {
      autoTriggered: true,
      triggeredBy: "automation",
    },
    initiatedBy: "automation",
  });

  return (result as { id: string }).id;
}
