/**
 * GET /api/cron/maintenance
 *
 * Cron endpoint for periodic signal maintenance checks.
 * Runs daily to:
 * - Detect orphan signals
 * - Detect duplicate signals
 * - Auto-archive if enabled
 * - Send notifications if thresholds exceeded
 *
 * Protected by CRON_SECRET header (Vercel sets this automatically).
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/maintenance",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { getWorkspaceMaintenanceSettings } from "@/lib/db/queries";
import {
  findOrphanSignals,
  findDuplicateSignals,
  archiveSignals,
} from "@/lib/maintenance";
import { createThresholdAwareNotification } from "@/lib/notifications";

export const maxDuration = 300; // 5 minutes max
export const dynamic = "force-dynamic";

interface WorkspaceMaintenanceResult {
  workspaceId: string;
  orphanCount?: number;
  duplicatePairs?: number;
  archivedCount?: number;
  notified?: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();

  // Get all workspaces
  const workspaceList = await db
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces);

  const results: WorkspaceMaintenanceResult[] = [];

  for (const workspace of workspaceList) {
    try {
      const settings = await getWorkspaceMaintenanceSettings(workspace.id);
      const result: WorkspaceMaintenanceResult = {
        workspaceId: workspace.id,
      };

      // Orphan detection
      if (settings.flagOrphansEnabled) {
        const orphans = await findOrphanSignals(
          workspace.id,
          settings.orphanThresholdDays
        );
        result.orphanCount = orphans.total;

        // Notify if threshold exceeded
        if (
          settings.notifyOnOrphanThreshold &&
          orphans.total >= settings.notifyOnOrphanThreshold
        ) {
          await createThresholdAwareNotification(
            {
              workspaceId: workspace.id,
              type: "action_required",
              metadata: { orphanCount: orphans.total },
            },
            `${orphans.total} orphan signals need attention`,
            `${orphans.total} signals have been unlinked for ${settings.orphanThresholdDays}+ days and need review or archival.`,
            {
              priority: "medium",
              actionUrl: "/signals?status=orphan",
              actionLabel: "Review Orphans",
            }
          );
          result.notified = true;
        }
      }

      // Duplicate detection
      if (settings.duplicateDetectionEnabled) {
        const duplicates = await findDuplicateSignals(
          workspace.id,
          settings.duplicateSimilarityThreshold
        );
        result.duplicatePairs = duplicates.total;

        // Notify if enabled and duplicates found
        if (settings.notifyOnDuplicates && duplicates.total > 0) {
          await createThresholdAwareNotification(
            {
              workspaceId: workspace.id,
              type: "action_required",
              metadata: { duplicateCount: duplicates.total },
            },
            `${duplicates.total} potential duplicate signals found`,
            `Review and merge duplicate signals to keep your signal library clean.`,
            {
              priority: "low",
              actionUrl: "/signals?view=duplicates",
              actionLabel: "Review Duplicates",
            }
          );
          result.notified = true;
        }
      }

      // Auto-archival
      if (settings.autoArchiveEnabled) {
        const archived = await archiveSignals(workspace.id, {
          linkedOlderThanDays: settings.autoArchiveLinkedAfterDays,
          reviewedOlderThanDays: settings.autoArchiveReviewedAfterDays,
        });
        result.archivedCount = archived.archivedCount;
      }

      results.push(result);
    } catch (error) {
      console.error(
        `[Maintenance] Check failed for workspace ${workspace.id}:`,
        error
      );
      results.push({
        workspaceId: workspace.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const duration = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    durationMs: duration,
    workspacesChecked: workspaceList.length,
    results,
  });
}
