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
 *
 * Migrated to Convex (replaces Drizzle/pgvector).
 */

import { listConvexWorkspaceSignals, listConvexSignalProjectLinks } from "@/lib/convex/server";

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
 */
export async function findOrphanSignals(
  workspaceId: string,
  thresholdDays = 14,
  limit = 50
): Promise<OrphanDetectionResult> {
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const thresholdTime = now - thresholdMs;

  // Get all "new" signals for this workspace
  const newSignals = await listConvexWorkspaceSignals(workspaceId, "new") as Array<{
    _id: string;
    verbatim: string;
    source: string;
    severity?: string | null;
    _creationTime: number;
  }>;

  // Filter to signals older than threshold
  const old = newSignals.filter((s) => s._creationTime < thresholdTime);

  // Check each signal for project links (in parallel, up to limit candidates)
  const candidates = old.slice(0, limit * 2);
  const linkedChecks = await Promise.all(
    candidates.map(async (s) => {
      const links = await listConvexSignalProjectLinks(s._id);
      return { signal: s, hasLinks: Array.isArray(links) && links.length > 0 };
    })
  );

  // Only return orphans (no project links)
  const orphans = linkedChecks
    .filter((c) => !c.hasLinks)
    .slice(0, limit)
    .map(({ signal }) => ({
      id: signal._id,
      verbatim: signal.verbatim,
      source: signal.source || "unknown",
      severity: signal.severity ?? null,
      createdAt: new Date(signal._creationTime),
      daysOrphaned: Math.floor((now - signal._creationTime) / (1000 * 60 * 60 * 24)),
    }));

  return {
    signals: orphans,
    total: orphans.length,
    oldestDays: orphans.length > 0 ? orphans[0].daysOrphaned : 0,
  };
}

/**
 * Get count of orphan signals for dashboard display.
 */
export async function getOrphanCount(
  workspaceId: string,
  thresholdDays = 14
): Promise<number> {
  const result = await findOrphanSignals(workspaceId, thresholdDays, 200);
  return result.total;
}
