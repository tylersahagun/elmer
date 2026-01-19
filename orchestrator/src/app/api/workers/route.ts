/**
 * Workers API - Monitor worker health
 * 
 * GET - Get active workers and health status
 * POST - Trigger maintenance tasks (rescue stuck runs, cleanup stale workers)
 */

import { NextResponse } from "next/server";
import {
  getActiveWorkers,
  hasActiveWorkers,
  cleanupStaleWorkers,
  rescueStuckRuns,
  unlockStuckCards,
  getQueuedRuns,
} from "@/lib/execution";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || undefined;

    const workers = await getActiveWorkers(workspaceId);
    const queuedRuns = await getQueuedRuns(workspaceId, 100);

    // Calculate health metrics
    const totalProcessed = workers.reduce((sum, w) => sum + (w.processedCount || 0), 0);
    const totalFailed = workers.reduce((sum, w) => sum + (w.failedCount || 0), 0);
    const activeRuns = workers.filter((w) => w.activeRunId).length;

    return NextResponse.json({
      workers: workers.map((w) => ({
        id: w.workerId,
        status: w.status,
        lastHeartbeat: w.lastHeartbeat,
        activeRunId: w.activeRunId,
        processedCount: w.processedCount,
        failedCount: w.failedCount,
        metadata: w.metadata,
      })),
      health: {
        workersActive: workers.length > 0,
        workerCount: workers.length,
        activeRuns,
        queuedRuns: queuedRuns.length,
        totalProcessed,
        totalFailed,
        failureRate: totalProcessed > 0 ? totalFailed / totalProcessed : 0,
      },
    });
  } catch (error) {
    console.error("[API /workers] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "cleanup": {
        const cleanedUp = await cleanupStaleWorkers();
        return NextResponse.json({
          message: `Cleaned up ${cleanedUp} stale workers`,
          cleanedUp,
        });
      }

      case "rescue": {
        const rescued = await rescueStuckRuns();
        const unlocked = await unlockStuckCards();
        return NextResponse.json({
          message: `Rescued ${rescued} stuck runs, unlocked ${unlocked} cards`,
          rescued,
          unlocked,
        });
      }

      case "health_check": {
        const workers = await getActiveWorkers();
        const hasWorkers = workers.length > 0;
        const queuedRuns = await getQueuedRuns(undefined, 1);
        
        return NextResponse.json({
          healthy: hasWorkers || queuedRuns.length === 0,
          workersActive: hasWorkers,
          queuedRunsWaiting: queuedRuns.length > 0,
          message: hasWorkers 
            ? "Workers are active" 
            : queuedRuns.length > 0 
              ? "WARNING: No workers available but runs are queued"
              : "No workers active, but no runs waiting",
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API /workers] POST error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
