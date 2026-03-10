/**
 * Signal Merge Workflow
 *
 * Merges duplicate signals by transferring links from secondary
 * to primary signal, then archiving the secondary.
 *
 * Migrated to Convex (replaces Drizzle).
 */

import {
  listConvexSignalProjectLinks,
  linkConvexSignalToProject,
  bulkUpdateConvexSignalStatus,
  createConvexWorkspaceActivity,
} from "@/lib/convex/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export interface MergeResult {
  primarySignalId: string;
  mergedSignalId: string;
  projectsTransferred: number;
  personasTransferred: number;
}

/**
 * Merge two duplicate signals.
 * Transfers project links from secondary to primary, then archives secondary.
 */
export async function mergeSignals(
  workspaceId: string,
  primarySignalId: string,
  secondarySignalId: string,
  userId?: string
): Promise<MergeResult> {
  const client = getConvexClient();

  // Verify both signals exist
  const [primary, secondary] = await Promise.all([
    client.query(api.signals.get, { signalId: primarySignalId as Id<"signals"> }),
    client.query(api.signals.get, { signalId: secondarySignalId as Id<"signals"> }),
  ]);

  if (!primary || !secondary) {
    throw new Error("One or both signals not found in workspace");
  }

  // Transfer project links
  const [primaryLinks, secondaryLinks] = await Promise.all([
    listConvexSignalProjectLinks(primarySignalId),
    listConvexSignalProjectLinks(secondarySignalId),
  ]);

  const existingProjectIds = new Set(
    (primaryLinks as Array<{ projectId: string }>).map((l) => l.projectId)
  );

  let projectsTransferred = 0;
  for (const link of secondaryLinks as Array<{ projectId: string; confidence?: number }>) {
    if (!existingProjectIds.has(link.projectId)) {
      await linkConvexSignalToProject({
        signalId: primarySignalId,
        projectId: link.projectId,
        confidence: link.confidence,
        linkedBy: userId ?? "automation",
      });
      projectsTransferred++;
    }
  }

  // Archive secondary signal
  await bulkUpdateConvexSignalStatus([secondarySignalId], "archived");

  // Log activity
  await createConvexWorkspaceActivity({
    workspaceId,
    action: "signals.merged",
    targetType: "signals",
    targetId: primarySignalId,
    userId: userId ?? undefined,
    metadata: {
      primarySignalId,
      secondarySignalId,
      projectsTransferred,
      personasTransferred: 0,
      primaryVerbatim: (primary as { verbatim: string }).verbatim?.slice(0, 100),
      secondaryVerbatim: (secondary as { verbatim: string }).verbatim?.slice(0, 100),
    },
  }).catch(() => {});

  return {
    primarySignalId,
    mergedSignalId: secondarySignalId,
    projectsTransferred,
    personasTransferred: 0,
  };
}

/**
 * Dismiss a duplicate pair (mark as not duplicates).
 */
export async function dismissDuplicatePair(
  workspaceId: string,
  signalId1: string,
  signalId2: string,
  userId?: string
): Promise<void> {
  await createConvexWorkspaceActivity({
    workspaceId,
    action: "duplicates.dismissed",
    targetType: "signals",
    userId: userId ?? undefined,
    metadata: {
      signalId1,
      signalId2,
      pairId: [signalId1, signalId2].sort().join("-"),
    },
  }).catch(() => {});
}
