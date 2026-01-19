/**
 * Runs API - Manage stage execution runs
 * 
 * GET - List runs for workspace or card
 * POST - Create a new run
 */

import { NextResponse } from "next/server";
import {
  createRun,
  getRunsForWorkspace,
  getRunsForCard,
  getQueuedRuns,
  hasActiveWorkers,
} from "@/lib/execution";
import type { ProjectStage, AutomationLevel, ExecutionProvider } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const cardId = searchParams.get("cardId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let runs;
    if (cardId) {
      runs = await getRunsForCard(cardId, limit);
    } else if (workspaceId) {
      if (status === "queued") {
        runs = await getQueuedRuns(workspaceId, limit);
      } else {
        runs = await getRunsForWorkspace(workspaceId, limit);
      }
    } else {
      return NextResponse.json(
        { error: "workspaceId or cardId is required" },
        { status: 400 }
      );
    }

    // Also check worker status
    const workersActive = await hasActiveWorkers(workspaceId || undefined);

    return NextResponse.json({
      runs,
      meta: {
        workersActive,
        count: runs.length,
      },
    });
  } catch (error) {
    console.error("[API /runs] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch runs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardId, workspaceId, stage, automationLevel, provider, triggeredBy = "user" } = body;

    if (!cardId || !workspaceId || !stage) {
      return NextResponse.json(
        { error: "cardId, workspaceId, and stage are required" },
        { status: 400 }
      );
    }

    // Check if workers are available
    const workersActive = await hasActiveWorkers(workspaceId);
    if (!workersActive) {
      console.warn(`[API /runs] No active workers for workspace ${workspaceId}`);
      // Still create the run, but warn
    }

    const runId = await createRun({
      cardId,
      workspaceId,
      stage: stage as ProjectStage,
      automationLevel: automationLevel as AutomationLevel | undefined,
      provider: provider as ExecutionProvider | undefined,
      triggeredBy,
    });

    return NextResponse.json({
      runId,
      workersActive,
      message: workersActive 
        ? "Run created and queued for execution" 
        : "Run created but no workers available - run will start when a worker connects",
    });
  } catch (error) {
    console.error("[API /runs] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create run" },
      { status: 500 }
    );
  }
}
