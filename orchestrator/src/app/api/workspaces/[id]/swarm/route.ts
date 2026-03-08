import { NextRequest, NextResponse } from "next/server";
import { createJob, getWorkspace } from "@/lib/db/queries";
import { getConvexWorkspace } from "@/lib/convex/server";
import {
  buildEmptyWorkspaceStatusReport,
  buildWorkspaceStatusReport,
} from "@/lib/status/portfolio-status";
import { writeSwarmReport } from "@/lib/swarm/report-writer";
import { buildSwarmReport, getAvailableSwarmPresets } from "@/lib/swarm/planner";
import type { SwarmPreset, SwarmReport } from "@/lib/swarm/types";
import {
  requireWorkspaceAccess,
  handlePermissionError,
  PermissionError,
} from "@/lib/permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "viewer");
    const workspace =
      (await getWorkspace(id)) ??
      ((await getConvexWorkspace(id)) as { _id: string; name: string } | null);
    const fallbackWorkspace = workspace ?? {
      _id: id,
      name: "Workspace",
    };

    const status =
      (await buildWorkspaceStatusReport(id)) ??
      buildEmptyWorkspaceStatusReport(id, fallbackWorkspace.name);
    const backlog =
      status?.actionQueue.map(
        (item) => `${item.projectName}: ${item.reason} → ${item.command}`,
      ) ?? [];
    const presetParam = request.nextUrl.searchParams.get("preset") as
      | SwarmPreset
      | null;
    const preset = getAvailableSwarmPresets().includes(
      (presetParam || "internal-alpha") as SwarmPreset,
    )
      ? ((presetParam || "internal-alpha") as SwarmPreset)
      : "internal-alpha";

    return NextResponse.json(
      buildSwarmReport({
        workspaceId: id,
        workspaceName: fallbackWorkspace.name,
        preset,
        backlog,
      }),
    );
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to build swarm report:", error);
    return NextResponse.json(
      { error: "Failed to build swarm report" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireWorkspaceAccess(id, "member");

    const body = (await request.json()) as SwarmReport & {
      launchJobs?: boolean;
      projectId?: string;
    };
    const createdJobs: Array<{
      laneId: string;
      jobId: string;
      type: string;
      label: string;
    }> = [];

    if (body.launchJobs && body.projectId) {
      for (const lane of body.lanes) {
        for (const laneJob of lane.jobs || []) {
          const job = await createJob({
            workspaceId: id,
            projectId: body.projectId,
            type: laneJob.type as never,
            input: {
              swarmPreset: body.preset || "internal-alpha",
              swarmSourceOfTruth: body.sourceOfTruth,
              swarmLaneId: lane.id,
              swarmLaneName: lane.name,
              swarmObjective: body.objective,
            },
          });
          if (job) {
            createdJobs.push({
              laneId: lane.id,
              jobId: job.id,
              type: laneJob.type,
              label: laneJob.label,
            });
          }
        }
      }
    }

    const report: SwarmReport = {
      ...body,
      workspaceId: id,
      preset: body.preset || "internal-alpha",
      generatedAt: new Date().toISOString(),
      lanes: body.lanes.map((lane) => ({
        ...lane,
        jobs: lane.jobs.map((laneJob) => {
          const created = createdJobs.find(
            (item) =>
              item.laneId === lane.id &&
              item.type === laneJob.type &&
              item.label === laneJob.label,
          );
          return created
            ? {
                ...laneJob,
                id: created.jobId,
                status: "pending",
                progress: 0,
              }
            : laneJob;
        }),
      })),
    };
    const saved = await writeSwarmReport(report);
    return NextResponse.json({ report, saved, createdJobs });
  } catch (error) {
    if (error instanceof PermissionError) {
      const { error: message, status } = handlePermissionError(error);
      return NextResponse.json({ error: message }, { status });
    }
    console.error("Failed to save swarm report:", error);
    return NextResponse.json(
      { error: "Failed to save swarm report" },
      { status: 500 },
    );
  }
}
