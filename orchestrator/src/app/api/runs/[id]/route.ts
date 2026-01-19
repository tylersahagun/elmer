/**
 * Run Detail API - Get, update, or cancel a specific run
 * 
 * GET - Get run details with logs and artifacts
 * POST - Actions: retry, cancel
 * DELETE - Cancel a run
 */

import { NextResponse } from "next/server";
import {
  getRunById,
  getRunLogs,
  getArtifactsForRun,
  retryRun,
  cancelRun,
} from "@/lib/execution";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const run = await getRunById(id);
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    // Get logs and artifacts
    const [logs, artifacts] = await Promise.all([
      getRunLogs(id),
      getArtifactsForRun(id),
    ]);

    return NextResponse.json({
      run,
      logs,
      artifacts,
    });
  } catch (error) {
    console.error("[API /runs/[id]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch run" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    const run = await getRunById(id);
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "retry": {
        if (run.status !== "failed" && run.status !== "cancelled") {
          return NextResponse.json(
            { error: "Can only retry failed or cancelled runs" },
            { status: 400 }
          );
        }
        const newRunId = await retryRun(id);
        return NextResponse.json({
          message: "Retry run created",
          newRunId,
          originalRunId: id,
        });
      }

      case "cancel": {
        if (run.status !== "queued" && run.status !== "running") {
          return NextResponse.json(
            { error: "Can only cancel queued or running runs" },
            { status: 400 }
          );
        }
        await cancelRun(id, reason);
        return NextResponse.json({
          message: "Run cancelled",
          runId: id,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[API /runs/[id]] POST error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "Cancelled by user";

    const run = await getRunById(id);
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    if (run.status !== "queued" && run.status !== "running") {
      return NextResponse.json(
        { error: "Can only cancel queued or running runs" },
        { status: 400 }
      );
    }

    await cancelRun(id, reason);
    
    return NextResponse.json({
      message: "Run cancelled",
      runId: id,
    });
  } catch (error) {
    console.error("[API /runs/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to cancel run" },
      { status: 500 }
    );
  }
}
