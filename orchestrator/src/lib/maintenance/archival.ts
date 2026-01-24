/**
 * Signal Archival Workflow
 *
 * Soft-delete archival for signals - status change to "archived"
 * while preserving all data and links.
 *
 * Key principle: Signals are evidence and must never be permanently deleted.
 * Archival hides them from active views but preserves for audit.
 */

import { db } from "@/lib/db";
import { signals, activityLogs } from "@/lib/db/schema";
import { eq, and, lt, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface ArchivalResult {
  archivedCount: number;
  signalIds: string[];
  archivedAt: Date;
}

export interface ArchivalCriteria {
  // Archive signals in "linked" status older than N days
  linkedOlderThanDays?: number;
  // Archive signals in "reviewed" status older than N days
  reviewedOlderThanDays?: number;
  // Manual selection of specific signal IDs
  signalIds?: string[];
}

/**
 * Archive signals based on criteria.
 * Preserves all data - just updates status to "archived".
 *
 * @param workspaceId - Workspace containing signals
 * @param criteria - What signals to archive
 * @param userId - User performing the action (null for automation)
 */
export async function archiveSignals(
  workspaceId: string,
  criteria: ArchivalCriteria,
  userId?: string
): Promise<ArchivalResult> {
  const now = new Date();
  let signalIdsToArchive: string[] = [];

  // Manual selection
  if (criteria.signalIds && criteria.signalIds.length > 0) {
    signalIdsToArchive = criteria.signalIds;
  }

  // Time-based linked signals
  if (criteria.linkedOlderThanDays) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - criteria.linkedOlderThanDays);

    const oldLinked = await db
      .select({ id: signals.id })
      .from(signals)
      .where(
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.status, "linked"),
          lt(signals.updatedAt, threshold)
        )
      );

    signalIdsToArchive.push(...oldLinked.map((s) => s.id));
  }

  // Time-based reviewed signals
  if (criteria.reviewedOlderThanDays) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - criteria.reviewedOlderThanDays);

    const oldReviewed = await db
      .select({ id: signals.id })
      .from(signals)
      .where(
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.status, "reviewed"),
          lt(signals.updatedAt, threshold)
        )
      );

    signalIdsToArchive.push(...oldReviewed.map((s) => s.id));
  }

  // Deduplicate
  signalIdsToArchive = [...new Set(signalIdsToArchive)];

  if (signalIdsToArchive.length === 0) {
    return { archivedCount: 0, signalIds: [], archivedAt: now };
  }

  // Archive signals (update status, preserve everything else)
  await db
    .update(signals)
    .set({
      status: "archived",
      updatedAt: now,
    })
    .where(
      and(
        eq(signals.workspaceId, workspaceId),
        inArray(signals.id, signalIdsToArchive)
      )
    );

  // Log activity for audit trail
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.archived",
    targetType: "signals",
    targetId: null,
    metadata: {
      count: signalIdsToArchive.length,
      signalIds: signalIdsToArchive,
      criteria,
      actor: userId ? "user" : "automation",
    },
    createdAt: now,
  });

  return {
    archivedCount: signalIdsToArchive.length,
    signalIds: signalIdsToArchive,
    archivedAt: now,
  };
}

/**
 * Restore archived signals to "reviewed" status.
 *
 * @param workspaceId - Workspace containing signals
 * @param signalIds - Signal IDs to restore
 * @param userId - User performing the action
 */
export async function unarchiveSignals(
  workspaceId: string,
  signalIds: string[],
  userId?: string
): Promise<{ restoredCount: number }> {
  const now = new Date();

  // Restore to "reviewed" status (not "new" since they were processed)
  await db
    .update(signals)
    .set({
      status: "reviewed",
      updatedAt: now,
    })
    .where(
      and(
        eq(signals.workspaceId, workspaceId),
        eq(signals.status, "archived"),
        inArray(signals.id, signalIds)
      )
    );

  // Log activity
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.unarchived",
    targetType: "signals",
    targetId: null,
    metadata: {
      count: signalIds.length,
      signalIds,
    },
    createdAt: now,
  });

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
  const linkedThreshold = new Date();
  linkedThreshold.setDate(linkedThreshold.getDate() - linkedOlderThanDays);

  const reviewedThreshold = new Date();
  reviewedThreshold.setDate(reviewedThreshold.getDate() - reviewedOlderThanDays);

  const [linkedResult, reviewedResult] = await Promise.all([
    db
      .select({ id: signals.id })
      .from(signals)
      .where(
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.status, "linked"),
          lt(signals.updatedAt, linkedThreshold)
        )
      ),
    db
      .select({ id: signals.id })
      .from(signals)
      .where(
        and(
          eq(signals.workspaceId, workspaceId),
          eq(signals.status, "reviewed"),
          lt(signals.updatedAt, reviewedThreshold)
        )
      ),
  ]);

  return {
    linked: linkedResult.length,
    reviewed: reviewedResult.length,
  };
}
