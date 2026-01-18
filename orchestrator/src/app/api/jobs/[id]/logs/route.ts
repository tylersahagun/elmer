/**
 * Job Log Stream API (Server-Sent Events)
 * 
 * Provides real-time execution logs for a specific job.
 * Connects to the worker's jobLogEmitter for live updates.
 */

import { NextRequest } from "next/server";
import { jobLogEmitter } from "@/lib/agent";
import type { JobLogEntry } from "@/lib/agent";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params;

  if (!jobId) {
    return new Response("jobId is required", { status: 400 });
  }

  // Verify job exists
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });

  if (!job) {
    return new Response("Job not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial job status
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "initial",
            job: {
              id: job.id,
              type: job.type,
              status: job.status,
              progress: job.progress,
              error: job.error,
            },
          })}\n\n`
        )
      );

      // If job is already completed/failed, send final status and close
      if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "finished",
              status: job.status,
              output: job.output,
              error: job.error,
            })}\n\n`
          )
        );
        controller.close();
        return;
      }

      // Subscribe to log events for this job
      const logHandler = (entry: JobLogEntry) => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "log",
                timestamp: entry.timestamp.toISOString(),
                level: entry.level,
                message: entry.message,
                data: entry.data,
              })}\n\n`
            )
          );
        } catch {
          // Connection closed
        }
      };

      jobLogEmitter.on(`job:${jobId}`, logHandler);

      // Poll for job status changes (in case we miss the completion event)
      let pollTimeoutId: NodeJS.Timeout | null = null;
      const pollStatus = async () => {
        try {
          const currentJob = await db.query.jobs.findFirst({
            where: eq(jobs.id, jobId),
          });

          if (currentJob) {
            // Send progress update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "status",
                  status: currentJob.status,
                  progress: currentJob.progress,
                })}\n\n`
              )
            );

            // If job finished, send final status and close
            if (
              currentJob.status === "completed" ||
              currentJob.status === "failed" ||
              currentJob.status === "cancelled"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "finished",
                    status: currentJob.status,
                    output: currentJob.output,
                    error: currentJob.error,
                  })}\n\n`
                )
              );
              controller.close();
              return;
            }
          }

          // Continue polling
          pollTimeoutId = setTimeout(pollStatus, 2000);
        } catch {
          // Try again
          pollTimeoutId = setTimeout(pollStatus, 5000);
        }
      };

      // Start polling after initial setup
      pollTimeoutId = setTimeout(pollStatus, 2000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        jobLogEmitter.off(`job:${jobId}`, logHandler);
        if (pollTimeoutId) {
          clearTimeout(pollTimeoutId);
        }
      });
    },

    cancel() {
      // Cleanup handled by abort event
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
