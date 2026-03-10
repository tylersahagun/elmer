/**
 * Signal Archival Workflow
 *
 * Soft-delete archival for signals - status change to "archived"
 * while preserving all data and links.
 *
 * Key principle: Signals are evidence and must never be permanently deleted.
 * Archival hides them from active views but preserves for audit.
 *
 * Migrated to Convex (replaces Drizzle/pgvector).
 */

import {
  listConvexWorkspaceSignals,
  bulkUpdateConvexSignalStatus,
  createConvexWorkspaceActivity,
} from "@/lib/convex/server";

export interface ArchivalResult {
  archivedCount: number;
  signalIds: string[];
  archivedAt: Date;
}

export interface ArchivalCriteria {
  /** Archive signals in "linked" status older than N days */
  linkedOlderThanDays?: number;
  /** Archive signals in "reviewed" status older than N days */
  reviewedOlderThanDays?: number;
  /** Manual selection of specific signal IDs */
  signalIds?: string[];
}

/**
 * Archive signals based on criteria.
 * Preserves all data - just updates status to "archived".
 */
export async function archiveSignals(
  workspaceId: string,
  criteria: ArchivalCriteria,
  userId?: string
): Promise<ArchivalResult> {
  const now = new Date();
  let signalIdsToArchive: string[] = [];

  if (criteria.signalIds && criteria.signalIds.length > 0) {
    signalIdsToArchive = criteria.signalIds;
  }

  if (criteria.linkedOlderThanDays) {
    const threshold = Date.now() - criteria.linkedOlderThanDays * 24 * 60 * 60 * 1000;
    const linked = await listConvexWorkspaceSignals(workspaceId, "linked");
    const old = (linked as Array<{ _id: string; _creationTime: number }>)
      .filter((s) => s._creationTime < threshold)
      .map((s) => s._id);
    signalIdsToArchive.push(...old);
  }

  if (criteria.reviewedOlderThanDays) {
    const threshold = Date.now() - criteria.reviewedOlderThanDays * 24 * 60 * 60 * 1000;
    const reviewed = await listConvexWorkspaceSignals(workspaceId, "reviewed");
    const old = (reviewed as Array<{ _id: string; _creationTime: number }>)
      .filter((s) => s._creationTime < threshold)
      .map((s) => s._id);
    signalIdsToArchive.push(...old);
  }

  signalIdsToArchive = [...new Set(signalIdsToArchive)];

  if (signalIdsToArchive.length === 0) {
    return { archivedCount: 0, signalIds: [], archivedAt: now };
  }

  await bulkUpdateConvexSignalStatus(signalIdsToArchive, "archived");

  await createConvexWorkspaceActivity({
    workspaceId,
    action: "signals.archived",
    targetType: "signals",
    userId: userId ?? undefined,
    metadata: {
      count: signalIdsToArchive.length,
      signalIds: signalIdsToArchive,
      criteria,
      actor: userId ? "user" : "automation",
    },
  }).catch(() => {});

  return {
    archivedCount: signalIdsToArchive.length,
    signalIds: signalIdsToArchive,
    archivedAt: now,
  };
}

/**
 * Restore archived signals to "reviewed" status.
 */
export async function unarchiveSignals(
  workspaceId: string,
  signalIds: string[],
  userId?: string
): Promise<{ restoredCount: number }> {
  const now = new Date();

  await bulkUpdateConvexSignalStatus(signalIds, "reviewed");

  await createConvexWorkspaceActivity({
    workspaceId,
    action: "signals.unarchived",
    targetType: "signals",
    userId: userId ?? undefined,
    metadata: {
      count: signalIds.length,
      signalIds,
    },
  }).catch(() => {});

  return { restoredCount: signalIds.length };
}

/**
 * Get count of archivable signals (linked/reviewed older than thresholds).
 */
export async function getArchivableCount(
  workspaceId: string,
  linkedOlderThanDays: number,
  reviewedOlderThanDays: number
): Promise<{ linked: number; reviewed: number }> {
  const linkedThreshold = Date.now() - linkedOlderThanDays * 24 * 60 * 60 * 1000;
  const reviewedThreshold = Date.now() - reviewedOlderThanDays * 24 * 60 * 60 * 1000;

  const [linked, reviewed] = await Promise.all([
    listConvexWorkspaceSignals(workspaceId, "linked"),
    listConvexWorkspaceSignals(workspaceId, "reviewed"),
  ]);

  return {
    linked: (linked as Array<{ _creationTime: number }>).filter((s) => s._creationTime < linkedThreshold).length,
    reviewed: (reviewed as Array<{ _creationTime: number }>).filter((s) => s._creationTime < reviewedThreshold).length,
  };
}
