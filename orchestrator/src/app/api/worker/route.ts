/**
 * Worker Control API
 * 
 * Start, stop, and check status of the background job worker.
 */

import { NextRequest, NextResponse } from "next/server";
import { getWorker, startWorker, stopWorker } from "@/lib/agent";

export async function GET() {
  try {
    const worker = getWorker();
    const status = worker.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get worker status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workspaceId, config } = body;

    switch (action) {
      case "start": {
        const worker = startWorker(workspaceId, config);
        const status = worker.getStatus();
        return NextResponse.json({
          success: true,
          message: "Worker started",
          status,
        });
      }

      case "stop": {
        await stopWorker();
        return NextResponse.json({
          success: true,
          message: "Worker stopped",
        });
      }

      case "status": {
        const worker = getWorker();
        const status = worker.getStatus();
        return NextResponse.json({
          success: true,
          status,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use 'start', 'stop', or 'status'.` },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Worker operation failed" },
      { status: 500 }
    );
  }
}
