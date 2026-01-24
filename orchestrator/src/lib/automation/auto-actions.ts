/**
 * Auto-Actions Module
 *
 * Actions triggered by signal automation:
 * - Create project from cluster (AUTO-04)
 * - Trigger PRD generation (AUTO-02)
 */

import { db } from "@/lib/db";
import { projects, signalProjects, signals, jobs } from "@/lib/db/schema";
import { nanoid } from "nanoid";
import { inArray, eq } from "drizzle-orm";
import { logProjectCreated } from "@/lib/activity";
import type { SignalCluster } from "@/lib/classification/clustering";

/**
 * Create a project from a signal cluster (automated version).
 * Similar to POST /api/projects/from-cluster but for automation context.
 */
export async function createProjectFromClusterAuto(
  workspaceId: string,
  cluster: SignalCluster
): Promise<string> {
  const projectId = `proj_${nanoid()}`;
  const now = new Date();

  // Create project with cluster theme as name
  await db.insert(projects).values({
    id: projectId,
    workspaceId,
    name: cluster.theme,
    description: `Auto-created from ${cluster.signalCount} signal cluster. Severity: ${cluster.severity}`,
    stage: "inbox",
    status: "active",
    metadata: {
      autoCreated: true,
      sourceClusterId: cluster.id,
      clusterConfidence: cluster.confidence,
    },
    createdAt: now,
    updatedAt: now,
  });

  // Bulk link signals
  const signalIds = cluster.signals.map(s => s.id);
  await db.insert(signalProjects).values(
    signalIds.map(signalId => ({
      id: nanoid(),
      signalId,
      projectId,
      linkedBy: null, // Automation, not a user
      linkReason: `Auto-linked from cluster: ${cluster.theme}`,
      confidence: cluster.confidence,
      linkedAt: now,
    }))
  );

  // Update signal statuses to "linked"
  await db
    .update(signals)
    .set({ status: "linked", updatedAt: now })
    .where(inArray(signals.id, signalIds));

  // Log activity (automation as actor)
  await logProjectCreated(workspaceId, "automation", projectId, cluster.theme);

  return projectId;
}

/**
 * Trigger PRD generation for a project.
 * Creates a pending job that the background worker will pick up.
 */
export async function triggerPrdGeneration(
  projectId: string,
  workspaceId: string
): Promise<string> {
  const jobId = `job_${nanoid()}`;
  const now = new Date();

  // First, move project to discovery stage (prerequisite for PRD)
  await db
    .update(projects)
    .set({ stage: "discovery", updatedAt: now })
    .where(eq(projects.id, projectId));

  // Create PRD generation job
  await db.insert(jobs).values({
    id: jobId,
    projectId,
    workspaceId,
    type: "generate_prd",
    status: "pending",
    input: {
      autoTriggered: true,
      triggeredBy: "automation",
    },
    createdAt: now,
  });

  return jobId;
}
