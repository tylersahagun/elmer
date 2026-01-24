/**
 * Orphan Signal Detector
 *
 * Identifies signals that have been in "new" status for too long
 * and are not linked to any project or persona.
 *
 * Definition: A signal is orphaned when:
 * - Status is "new" (never reviewed, linked, or archived)
 * - Created more than N days ago (configurable)
 * - Not linked to any project
 * - Not linked to any persona
 */

import { db } from "@/lib/db";
import { signals, signalProjects, signalPersonas } from "@/lib/db/schema";
import { eq, and, lt, notExists, sql } from "drizzle-orm";

export interface OrphanSignal {
  id: string;
  verbatim: string;
  source: string;
  severity: string | null;
  createdAt: Date;
  daysOrphaned: number;
}

export interface OrphanDetectionResult {
  signals: OrphanSignal[];
  total: number;
  oldestDays: number;
}

/**
 * Find orphan signals - unlinked signals older than threshold.
 *
 * @param workspaceId - Workspace to check
 * @param thresholdDays - Days after which unlinked signal is orphaned (default: 14)
 * @param limit - Max signals to return (default: 50)
 */
export async function findOrphanSignals(
  workspaceId: string,
  thresholdDays = 14,
  limit = 50
): Promise<OrphanDetectionResult> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  // Find signals that are:
  // 1. In "new" status
  // 2. Created before threshold date
  // 3. Not linked to any project
  // 4. Not linked to any persona
  const orphans = await db
    .select({
      id: signals.id,
      verbatim: signals.verbatim,
      source: signals.source,
      severity: signals.severity,
      createdAt: signals.createdAt,
    })
    .from(signals)
    .where(
      and(
        eq(signals.workspaceId, workspaceId),
        eq(signals.status, "new"),
        lt(signals.createdAt, thresholdDate),
        notExists(
          db
            .select({ id: signalProjects.id })
            .from(signalProjects)
            .where(eq(signalProjects.signalId, signals.id))
        ),
        notExists(
          db
            .select({ id: signalPersonas.id })
            .from(signalPersonas)
            .where(eq(signalPersonas.signalId, signals.id))
        )
      )
    )
    .orderBy(signals.createdAt)
    .limit(limit);

  const now = new Date();
  const results = orphans.map((s) => ({
    id: s.id,
    verbatim: s.verbatim,
    source: s.source || "unknown",
    severity: s.severity,
    createdAt: s.createdAt,
    daysOrphaned: Math.floor(
      (now.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  return {
    signals: results,
    total: results.length,
    oldestDays: results.length > 0 ? results[0].daysOrphaned : 0,
  };
}

/**
 * Get count of orphan signals for dashboard display.
 */
export async function getOrphanCount(
  workspaceId: string,
  thresholdDays = 14
): Promise<number> {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(signals)
    .where(
      and(
        eq(signals.workspaceId, workspaceId),
        eq(signals.status, "new"),
        lt(signals.createdAt, thresholdDate),
        notExists(
          db
            .select({ id: signalProjects.id })
            .from(signalProjects)
            .where(eq(signalProjects.signalId, signals.id))
        ),
        notExists(
          db
            .select({ id: signalPersonas.id })
            .from(signalPersonas)
            .where(eq(signalPersonas.signalId, signals.id))
        )
      )
    );

  return result[0]?.count ?? 0;
}
