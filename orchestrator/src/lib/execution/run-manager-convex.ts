/**
 * Convex-backed Run Manager
 *
 * Replaces src/lib/execution/run-manager.ts (Drizzle/Postgres).
 * All run state is stored in Convex: stageRuns, runLogs, artifacts, workerHeartbeats.
 *
 * Used by:
 * - execution-worker.ts — the external worker process
 * - /api/runs/* — API routes for UI
 * - /api/projects/[id]/automation-status — project automation status
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

export type StageRunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface CreateRunInput {
  cardId: string;
  workspaceId: string;
  stage: string;
  automationLevel?: string;
  provider?: string;
  triggeredBy: string;
  metadata?: Record<string, unknown>;
}

export interface StageRun {
  _id: string;
  cardId: string;
  workspaceId: string;
  stage: string;
  status: StageRunStatus;
  automationLevel: string;
  provider: string;
  attempt: number;
  triggeredBy: string;
  claimedBy?: string;
  claimedAt?: number;
  startedAt?: number;
  completedAt?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

// ── Run Creation ──────────────────────────────────────────────────────────────

export async function createRun(input: CreateRunInput): Promise<string> {
  const client = getConvexClient();
  const runId = await client.mutation(api.stageRuns.create, {
    cardId: input.cardId,
    workspaceId: input.workspaceId as Id<"workspaces">,
    stage: input.stage,
    automationLevel: input.automationLevel,
    provider: input.provider,
    triggeredBy: input.triggeredBy,
    metadata: input.metadata,
  });
  return runId as string;
}

export async function retryRun(originalRunId: string): Promise<string> {
  const client = getConvexClient();
  const newRunId = await client.mutation(api.stageRuns.retry, {
    runId: originalRunId as Id<"stageRuns">,
  });
  return newRunId as string;
}

// ── Worker Claim ──────────────────────────────────────────────────────────────

export async function claimRun(
  runId: string,
  workerId: string,
): Promise<boolean> {
  const client = getConvexClient();
  const result = await client.mutation(api.stageRuns.claim, {
    runId: runId as Id<"stageRuns">,
    workerId,
  });
  return result !== null;
}

// ── Run Completion ────────────────────────────────────────────────────────────

export async function completeRun(
  runId: string,
  status: "succeeded" | "failed" | "cancelled",
  errorMessage?: string,
): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.stageRuns.complete, {
    runId: runId as Id<"stageRuns">,
    status,
    errorMessage,
  });
}

export async function cancelRun(runId: string, reason?: string): Promise<void> {
  await completeRun(runId, "cancelled", reason);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getRunById(runId: string): Promise<StageRun | null> {
  const client = getConvexClient();
  const run = await client.query(api.stageRuns.get, {
    runId: runId as Id<"stageRuns">,
  });
  return run as StageRun | null;
}

export async function getRunsForCard(
  cardId: string,
  limit = 10,
): Promise<StageRun[]> {
  const client = getConvexClient();
  const runs = await client.query(api.stageRuns.listByCard, {
    cardId,
    limit,
  });
  return (runs ?? []) as StageRun[];
}

export async function getRunsForWorkspace(
  workspaceId: string,
  limit = 50,
): Promise<StageRun[]> {
  const client = getConvexClient();
  const runs = await client.query(api.stageRuns.listByWorkspace, {
    workspaceId: workspaceId as Id<"workspaces">,
    limit,
  });
  return (runs ?? []) as StageRun[];
}

export async function getQueuedRuns(
  workspaceId?: string,
  limit = 10,
): Promise<StageRun[]> {
  const client = getConvexClient();
  const runs = await client.query(api.stageRuns.listQueued, {
    workspaceId: workspaceId as Id<"workspaces"> | undefined,
    limit,
  });
  return (runs ?? []) as StageRun[];
}

export async function getActiveRunForCard(
  cardId: string,
): Promise<StageRun | null> {
  const runs = await getRunsForCard(cardId, 1);
  const active = runs.find(
    (r) => r.status === "queued" || r.status === "running",
  );
  return active ?? null;
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function addRunLog(
  runId: string,
  level: string,
  message: string,
  _actor?: string,
  stepKey?: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const client = getConvexClient();
  const run = await getRunById(runId);
  if (!run) return;

  await client.mutation(api.stageRuns.addLog, {
    runId: runId as Id<"stageRuns">,
    workspaceId: run.workspaceId as Id<"workspaces">,
    level,
    message,
    stepKey,
    meta,
  });
}

export async function getRunLogs(runId: string): Promise<unknown[]> {
  const client = getConvexClient();
  return (
    (await client.query(api.stageRuns.getLogs, {
      runId: runId as Id<"stageRuns">,
    })) ?? []
  );
}

// ── Artifacts ─────────────────────────────────────────────────────────────────

export interface CreateArtifactInput {
  runId: string;
  workspaceId: string;
  cardId: string;
  type: string;
  content?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export async function createArtifact(
  input: CreateArtifactInput,
): Promise<string> {
  const client = getConvexClient();
  const artifactId = await client.mutation(api.stageRuns.addArtifact, {
    runId: input.runId as Id<"stageRuns">,
    workspaceId: input.workspaceId as Id<"workspaces">,
    cardId: input.cardId,
    type: input.type,
    content: input.content,
    url: input.url,
    metadata: input.metadata,
  });
  return artifactId as string;
}

export async function getArtifactsForRun(runId: string): Promise<unknown[]> {
  const client = getConvexClient();
  return (
    (await client.query(api.stageRuns.getArtifacts, {
      runId: runId as Id<"stageRuns">,
    })) ?? []
  );
}

// ── Worker Heartbeats ─────────────────────────────────────────────────────────

export async function registerWorker(
  workerId: string,
  workspaceId?: string,
): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.stageRuns.upsertHeartbeat, {
    workerId,
    workspaceId: workspaceId as Id<"workspaces"> | undefined,
    processedCount: 0,
    failedCount: 0,
  });
}

export async function updateWorkerHeartbeat(
  workerId: string,
  activeRunIds?: string[],
): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.stageRuns.upsertHeartbeat, {
    workerId,
    activeRunIds,
  });
}

export async function incrementWorkerStats(
  workerId: string,
  failed = false,
): Promise<void> {
  const client = getConvexClient();
  await client.mutation(api.stageRuns.upsertHeartbeat, {
    workerId,
    processedCount: failed ? 0 : 1,
    failedCount: failed ? 1 : 0,
  });
}

export async function getActiveWorkers(
  workspaceId?: string,
): Promise<unknown[]> {
  const client = getConvexClient();
  return (
    (await client.query(api.stageRuns.getActiveWorkers, {
      workspaceId: workspaceId as Id<"workspaces"> | undefined,
    })) ?? []
  );
}

export async function hasActiveWorkers(
  workspaceId?: string,
): Promise<boolean> {
  const workers = await getActiveWorkers(workspaceId);
  return workers.length > 0;
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export async function rescueStuckRuns(): Promise<number> {
  // Rescue logic runs on a Convex cron. This is a no-op from the client.
  // The stageRuns.rescueStale internal mutation is scheduled via Convex crons.
  return 0;
}

export async function unlockStuckCards(): Promise<number> {
  // Card unlock logic runs separately (not dependent on Postgres).
  return 0;
}

export async function cleanupStaleWorkers(): Promise<number> {
  // Stale worker cleanup runs via Convex crons.
  return 0;
}

// ── Stage Recipes ─────────────────────────────────────────────────────────────

export async function getStageRecipe(
  workspaceId: string,
  stage: string,
): Promise<unknown> {
  const client = getConvexClient();
  return await client.query(api.stageRuns.getRecipe, {
    workspaceId: workspaceId as Id<"workspaces">,
    stage,
  });
}
