/**
 * GET /api/cron/signal-automation
 *
 * Cron endpoint for periodic signal automation checks.
 * Runs hourly to catch any missed triggers from event-driven flow.
 *
 * Protected by CRON_SECRET header (Vercel sets this automatically).
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/signal-automation",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { checkSignalAutomation, type AutomationCheckResult } from "@/lib/automation/signal-automation";

export const maxDuration = 300; // 5 minutes max
export const dynamic = "force-dynamic";

interface WorkspaceResult {
  workspaceId: string;
  result?: AutomationCheckResult;
  error?: string;
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  const startTime = Date.now();

  // Get all workspaces
  const workspaceList = await db
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces);

  const results: WorkspaceResult[] = [];

  // Process each workspace
  for (const workspace of workspaceList) {
    try {
      const result = await checkSignalAutomation(workspace.id);
      results.push({
        workspaceId: workspace.id,
        result,
      });

      // Log if any actions were triggered
      if (result.actionsTriggered.length > 0) {
        console.log(
          `[Cron] Workspace ${workspace.name}: ${result.actionsTriggered.length} actions triggered`
        );
      }
    } catch (error) {
      console.error(
        `[Cron] Automation check failed for workspace ${workspace.id}:`,
        error
      );
      results.push({
        workspaceId: workspace.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const duration = Date.now() - startTime;

  // Calculate summary
  const totalActions = results.reduce(
    (sum, r) => sum + (r.result?.actionsTriggered.length ?? 0),
    0
  );
  const errors = results.filter((r) => r.error).length;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    durationMs: duration,
    workspacesChecked: workspaceList.length,
    totalActionsTriggered: totalActions,
    errors,
    results,
  });
}
