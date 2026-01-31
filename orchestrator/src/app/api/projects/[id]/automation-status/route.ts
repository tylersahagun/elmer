import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, agentDefinitions } from "@/lib/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { requireWorkspaceAccess, handlePermissionError, PermissionError } from "@/lib/permissions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    await requireWorkspaceAccess(workspaceId, "viewer");

    // Get jobs from last hour triggered by column automation
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentJobs = await db
      .select({
        id: jobs.id,
        status: jobs.status,
        createdAt: jobs.createdAt,
        input: jobs.input,
      })
      .from(jobs)
      .where(and(
        eq(jobs.projectId, projectId),
        eq(jobs.type, "execute_agent_definition"),
        gte(jobs.createdAt, oneHourAgo)
      ))
      .orderBy(desc(jobs.createdAt))
      .limit(5);

    // Enrich with agent names
    const enrichedJobs = await Promise.all(
      recentJobs.map(async (job) => {
        const input = job.input as Record<string, unknown>;
        const agentId = input?.agentDefinitionId as string;
        let agentName = "Unknown Agent";

        if (agentId) {
          const agent = await db.query.agentDefinitions.findFirst({
            where: eq(agentDefinitions.id, agentId),
            columns: { name: true }
          });
          agentName = agent?.name || agentName;
        }

        // Map job status to our expected status type
        const statusMap: Record<string, "queued" | "running" | "succeeded" | "failed"> = {
          pending: "queued",
          running: "running",
          completed: "succeeded",
          failed: "failed",
          cancelled: "failed",
          waiting_input: "running",
        };

        return {
          id: job.id,
          status: statusMap[job.status] || "queued",
          agentName,
          createdAt: job.createdAt?.toISOString(),
        };
      })
    );

    const runningCount = enrichedJobs.filter(
      j => j.status === "queued" || j.status === "running"
    ).length;

    return NextResponse.json({
      hasActiveAutomation: runningCount > 0,
      recentJobs: enrichedJobs,
      runningCount,
      lastRun: enrichedJobs[0] || null,
    });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to fetch automation status:", error);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
