/**
 * Job Status Stream API (Server-Sent Events)
 * 
 * Provides real-time job status updates via SSE.
 * Clients connect and receive updates as jobs change status.
 * 
 * OPTIMIZATION: Uses adaptive polling to minimize database load:
 * - Fast polling (5s) when jobs are actively running
 * - Slow polling (30s) when idle
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";

// Polling intervals
const POLL_INTERVAL_ACTIVE = 5000;  // 5s when jobs are running
const POLL_INTERVAL_IDLE = 30000;   // 30s when no active jobs

// Store for active connections per workspace
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>();

// Broadcast update to all connections for a workspace
export function broadcastJobUpdate(workspaceId: string, data: Record<string, unknown>) {
  const connections = activeConnections.get(workspaceId);
  if (!connections) return;

  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  connections.forEach((controller) => {
    try {
      controller.enqueue(encoded);
    } catch {
      // Connection closed, will be cleaned up
    }
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return new Response("workspaceId is required", { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Add to active connections
      if (!activeConnections.has(workspaceId)) {
        activeConnections.set(workspaceId, new Set());
      }
      activeConnections.get(workspaceId)!.add(controller);

      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", workspaceId })}\n\n`));

      // Send current job status
      (async () => {
        try {
          const currentJobs = await db.query.jobs.findMany({
            where: and(
              eq(jobs.workspaceId, workspaceId),
              or(
                eq(jobs.status, "pending"),
                eq(jobs.status, "running")
              )
            ),
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: "initial", 
            jobs: currentJobs 
          })}\n\n`));
        } catch (error) {
          console.error("Failed to send initial jobs:", error);
        }
      })();

      // Set up adaptive polling for job changes
      // Uses faster polling when jobs are active, slower when idle
      let pollTimeoutId: NodeJS.Timeout | null = null;
      let hasActiveJobsLastPoll = false;

      const poll = async () => {
        try {
          const activeJobs = await db.query.jobs.findMany({
            where: and(
              eq(jobs.workspaceId, workspaceId),
              or(
                eq(jobs.status, "pending"),
                eq(jobs.status, "running")
              )
            ),
          });

          // Get recently completed jobs
          const recentJobs = await db.query.jobs.findMany({
            where: eq(jobs.workspaceId, workspaceId),
            orderBy: (jobs, { desc }) => [desc(jobs.completedAt)],
            limit: 5,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: "poll", 
            activeJobs,
            summary: {
              pending: activeJobs.filter(j => j.status === "pending").length,
              running: activeJobs.filter(j => j.status === "running").length,
            },
            recentCompleted: recentJobs.filter(j => j.status === "completed" || j.status === "failed"),
          })}\n\n`));

          // Determine next poll interval based on active jobs
          hasActiveJobsLastPoll = activeJobs.length > 0;
          const nextInterval = hasActiveJobsLastPoll ? POLL_INTERVAL_ACTIVE : POLL_INTERVAL_IDLE;
          pollTimeoutId = setTimeout(poll, nextInterval);
        } catch {
          // Connection might be closed, try to continue polling
          pollTimeoutId = setTimeout(poll, POLL_INTERVAL_IDLE);
        }
      };

      // Start polling (initial delay to let the initial data send first)
      pollTimeoutId = setTimeout(poll, POLL_INTERVAL_ACTIVE);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        if (pollTimeoutId) {
          clearTimeout(pollTimeoutId);
        }
        const connections = activeConnections.get(workspaceId);
        if (connections) {
          connections.delete(controller);
          if (connections.size === 0) {
            activeConnections.delete(workspaceId);
          }
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
