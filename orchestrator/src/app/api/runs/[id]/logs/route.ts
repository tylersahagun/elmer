/**
 * Run Logs API - Stream or fetch logs for a run
 * 
 * GET - Get logs, optionally streaming with SSE
 */

import { NextResponse } from "next/server";
import { getRunById, getRunLogs, streamRunLogs } from "@/lib/execution";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const stream = searchParams.get("stream") === "true";
    const afterTimestamp = searchParams.get("after");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const run = await getRunById(id);
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    if (stream) {
      // Server-Sent Events for real-time logs
      const encoder = new TextEncoder();
      
      const readable = new ReadableStream({
        async start(controller) {
          let lastTimestamp: Date | undefined = afterTimestamp 
            ? new Date(afterTimestamp) 
            : undefined;
          let isRunning = run.status === "queued" || run.status === "running";
          
          const sendLogs = async () => {
            try {
              const logs = await streamRunLogs(id, lastTimestamp);
              
              for (const log of logs) {
                const data = JSON.stringify(log);
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                lastTimestamp = new Date(log.timestamp);
              }

              // Check if run is still active
              const currentRun = await getRunById(id);
              isRunning = currentRun?.status === "queued" || currentRun?.status === "running";
              
              if (!isRunning) {
                // Send final status
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "complete", status: currentRun?.status })}\n\n`)
                );
                controller.close();
              }
            } catch (error) {
              console.error("[Logs SSE] Error:", error);
              controller.error(error);
            }
          };

          // Initial send
          await sendLogs();

          // Poll for new logs while running
          const interval = setInterval(async () => {
            if (!isRunning) {
              clearInterval(interval);
              return;
            }
            await sendLogs();
          }, 1000);

          // Cleanup on close
          request.signal.addEventListener("abort", () => {
            clearInterval(interval);
            controller.close();
          });
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Regular fetch
    const logs = await getRunLogs(id, limit);
    
    return NextResponse.json({
      logs,
      runStatus: run.status,
      isComplete: run.status !== "queued" && run.status !== "running",
    });
  } catch (error) {
    console.error("[API /runs/[id]/logs] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
