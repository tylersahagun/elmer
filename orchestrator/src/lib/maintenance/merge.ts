/**
 * Signal Merge Workflow
 *
 * Merges duplicate signals by transferring links from secondary
 * to primary signal, then archiving the secondary.
 *
 * Strategy:
 * 1. Keep the older signal as primary (has more history)
 * 2. Transfer all project/persona links from secondary to primary
 * 3. Archive the secondary signal (preserve, don't delete)
 * 4. Log merge in activity log for audit
 */

import { db } from "@/lib/db";
import {
  signals,
  signalProjects,
  signalPersonas,
  activityLogs,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface MergeResult {
  primarySignalId: string;
  mergedSignalId: string;
  projectsTransferred: number;
  personasTransferred: number;
}

/**
 * Merge two duplicate signals.
 *
 * @param workspaceId - Workspace containing signals
 * @param primarySignalId - Signal to keep (receives links)
 * @param secondarySignalId - Signal to merge into primary (gets archived)
 * @param userId - User performing the merge
 */
export async function mergeSignals(
  workspaceId: string,
  primarySignalId: string,
  secondarySignalId: string,
  userId?: string
): Promise<MergeResult> {
  const now = new Date();

  // Verify both signals exist and belong to workspace
  const [primary, secondary] = await Promise.all([
    db
      .select()
      .from(signals)
      .where(
        and(eq(signals.id, primarySignalId), eq(signals.workspaceId, workspaceId))
      )
      .limit(1),
    db
      .select()
      .from(signals)
      .where(
        and(
          eq(signals.id, secondarySignalId),
          eq(signals.workspaceId, workspaceId)
        )
      )
      .limit(1),
  ]);

  if (primary.length === 0 || secondary.length === 0) {
    throw new Error("One or both signals not found in workspace");
  }

  // Transfer project links from secondary to primary
  const existingProjectLinks = await db
    .select({ projectId: signalProjects.projectId })
    .from(signalProjects)
    .where(eq(signalProjects.signalId, primarySignalId));

  const existingProjectIds = new Set(existingProjectLinks.map((l) => l.projectId));

  const secondaryProjectLinks = await db
    .select()
    .from(signalProjects)
    .where(eq(signalProjects.signalId, secondarySignalId));

  let projectsTransferred = 0;
  for (const link of secondaryProjectLinks) {
    if (!existingProjectIds.has(link.projectId)) {
      await db.insert(signalProjects).values({
        id: nanoid(),
        signalId: primarySignalId,
        projectId: link.projectId,
        linkedAt: link.linkedAt,
        linkedBy: link.linkedBy,
        linkReason: `Merged from signal ${secondarySignalId}: ${link.linkReason || ""}`.trim(),
        confidence: link.confidence,
      });
      projectsTransferred++;
    }
  }

  // Transfer persona links from secondary to primary
  const existingPersonaLinks = await db
    .select({ personaId: signalPersonas.personaId })
    .from(signalPersonas)
    .where(eq(signalPersonas.signalId, primarySignalId));

  const existingPersonaIds = new Set(existingPersonaLinks.map((l) => l.personaId));

  const secondaryPersonaLinks = await db
    .select()
    .from(signalPersonas)
    .where(eq(signalPersonas.signalId, secondarySignalId));

  let personasTransferred = 0;
  for (const link of secondaryPersonaLinks) {
    if (!existingPersonaIds.has(link.personaId)) {
      await db.insert(signalPersonas).values({
        id: nanoid(),
        signalId: primarySignalId,
        personaId: link.personaId,
        linkedAt: link.linkedAt,
        linkedBy: link.linkedBy,
      });
      personasTransferred++;
    }
  }

  // Archive the secondary signal (not delete - preserve history)
  await db
    .update(signals)
    .set({
      status: "archived",
      updatedAt: now,
    })
    .where(eq(signals.id, secondarySignalId));

  // Log the merge activity for audit trail
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "signals.merged",
    targetType: "signals",
    targetId: primarySignalId,
    metadata: {
      primarySignalId,
      secondarySignalId,
      projectsTransferred,
      personasTransferred,
      primaryVerbatim: primary[0].verbatim.slice(0, 100),
      secondaryVerbatim: secondary[0].verbatim.slice(0, 100),
    },
    createdAt: now,
  });

  return {
    primarySignalId,
    mergedSignalId: secondarySignalId,
    projectsTransferred,
    personasTransferred,
  };
}

/**
 * Dismiss a duplicate pair (mark as not duplicates).
 * Records in activity log so pair won't be suggested again.
 */
export async function dismissDuplicatePair(
  workspaceId: string,
  signalId1: string,
  signalId2: string,
  userId?: string
): Promise<void> {
  const now = new Date();

  // Log dismissal so we can filter it out in future suggestions
  await db.insert(activityLogs).values({
    id: nanoid(),
    workspaceId,
    userId: userId ?? null,
    action: "duplicates.dismissed",
    targetType: "signals",
    targetId: null,
    metadata: {
      signalId1,
      signalId2,
      pairId: [signalId1, signalId2].sort().join("-"),
    },
    createdAt: now,
  });
}
