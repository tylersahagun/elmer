/**
 * Run Manager - Creates, tracks, and manages stage runs
 * 
 * This module provides durable execution tracking for stage automation.
 * It ensures runs are never lost and cards don't get stuck in "waiting" state.
 */

import { db } from "@/lib/db";
import {
  stageRuns,
  runLogs,
  artifacts,
  stageTransitionEvents,
  workerHeartbeats,
  stageRecipes,
  projects,
  type ProjectStage,
  type StageRunStatus,
  type AutomationLevel,
  type ExecutionProvider,
  type ArtifactType,
  type RunLogLevel,
} from "@/lib/db/schema";
import { eq, and, desc, sql, isNull, gt, or } from "drizzle-orm";
import { nanoid } from "nanoid";

// ============================================
// RUN CREATION
// ============================================

export interface CreateRunInput {
  cardId: string;
  workspaceId: string;
  stage: ProjectStage;
  automationLevel?: AutomationLevel;
  provider?: ExecutionProvider;
  triggeredBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new stage run with idempotency protection
 */
export async function createRun(input: CreateRunInput): Promise<string> {
  const idempotencyKey = `${input.cardId}:${input.stage}:${Date.now()}`;
  
  // Check for existing queued/running run for the same card+stage
  const existingRun = await db
    .select()
    .from(stageRuns)
    .where(
      and(
        eq(stageRuns.cardId, input.cardId),
        eq(stageRuns.stage, input.stage),
        or(
          eq(stageRuns.status, "queued"),
          eq(stageRuns.status, "running")
        )
      )
    )
    .limit(1);

  if (existingRun.length > 0) {
    console.log(`[RunManager] Existing run found for card ${input.cardId} stage ${input.stage}, returning existing run`);
    return existingRun[0].id;
  }

  // Get the recipe for this stage to determine automation level
  const recipe = await db
    .select()
    .from(stageRecipes)
    .where(
      and(
        eq(stageRecipes.workspaceId, input.workspaceId),
        eq(stageRecipes.stage, input.stage)
      )
    )
    .limit(1);

  const automationLevel = input.automationLevel ?? recipe[0]?.automationLevel ?? "human_approval";
  const provider = input.provider ?? recipe[0]?.provider ?? "anthropic";

  const runId = `run_${nanoid()}`;
  const now = new Date();

  await db.insert(stageRuns).values({
    id: runId,
    cardId: input.cardId,
    workspaceId: input.workspaceId,
    stage: input.stage,
    status: "queued",
    automationLevel,
    provider,
    attempt: 1,
    idempotencyKey,
    triggeredBy: input.triggeredBy,
    metadata: input.metadata as typeof stageRuns.$inferInsert["metadata"],
    createdAt: now,
  });

  await addRunLog(runId, "info", `Run queued for stage ${input.stage}`, "system");

  return runId;
}

/**
 * Create a retry run for a failed run
 */
export async function retryRun(originalRunId: string): Promise<string> {
  const original = await db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.id, originalRunId))
    .limit(1);

  if (!original[0]) {
    throw new Error(`Run ${originalRunId} not found`);
  }

  if (original[0].status !== "failed" && original[0].status !== "cancelled") {
    throw new Error(`Can only retry failed or cancelled runs`);
  }

  const newRunId = `run_${nanoid()}`;
  const now = new Date();

  await db.insert(stageRuns).values({
    id: newRunId,
    cardId: original[0].cardId,
    workspaceId: original[0].workspaceId,
    stage: original[0].stage,
    status: "queued",
    automationLevel: original[0].automationLevel,
    provider: original[0].provider,
    attempt: original[0].attempt + 1,
    idempotencyKey: `${original[0].cardId}:${original[0].stage}:${Date.now()}`,
    triggeredBy: "retry",
    metadata: original[0].metadata as typeof stageRuns.$inferInsert["metadata"],
    createdAt: now,
  });

  await addRunLog(newRunId, "info", `Retry run created (attempt ${original[0].attempt + 1})`, "system");

  return newRunId;
}

// ============================================
// RUN STATUS MANAGEMENT
// ============================================

export async function claimRun(runId: string, workerId: string): Promise<boolean> {
  const now = new Date();
  
  const result = await db
    .update(stageRuns)
    .set({
      status: "running",
      startedAt: now,
    })
    .where(
      and(
        eq(stageRuns.id, runId),
        eq(stageRuns.status, "queued")
      )
    );

  if (result.rowCount === 0) {
    return false; // Run was already claimed or doesn't exist
  }

  // Update worker heartbeat
  await db
    .update(workerHeartbeats)
    .set({
      activeRunId: runId,
      status: "processing",
      lastHeartbeat: now,
    })
    .where(eq(workerHeartbeats.workerId, workerId));

  await addRunLog(runId, "info", `Run claimed by worker ${workerId}`, "system");
  return true;
}

export async function completeRun(
  runId: string,
  status: "succeeded" | "failed" | "cancelled",
  errorSummary?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const now = new Date();

  const run = await db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.id, runId))
    .limit(1);

  if (!run[0]) {
    throw new Error(`Run ${runId} not found`);
  }

  // Merge metadata
  const existingMeta = (run[0].metadata as Record<string, unknown>) ?? {};
  const newMeta = { ...existingMeta, ...metadata };

  await db
    .update(stageRuns)
    .set({
      status,
      errorSummary,
      finishedAt: now,
      metadata: newMeta as typeof stageRuns.$inferInsert["metadata"],
    })
    .where(eq(stageRuns.id, runId));

  await addRunLog(
    runId,
    status === "succeeded" ? "info" : "error",
    `Run ${status}${errorSummary ? `: ${errorSummary}` : ""}`,
    "system"
  );

  // Clear worker active run if this was assigned
  await db
    .update(workerHeartbeats)
    .set({
      activeRunId: null,
      status: "idle",
      lastHeartbeat: now,
    })
    .where(eq(workerHeartbeats.activeRunId, runId));
}

export async function cancelRun(runId: string, reason?: string): Promise<void> {
  await completeRun(runId, "cancelled", reason || "Cancelled by user");
}

// ============================================
// RUN QUERIES
// ============================================

export async function getRunById(runId: string) {
  const runs = await db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.id, runId))
    .limit(1);
  return runs[0] ?? null;
}

export async function getRunsForCard(cardId: string, limit = 10) {
  return db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.cardId, cardId))
    .orderBy(desc(stageRuns.createdAt))
    .limit(limit);
}

export async function getRunsForWorkspace(workspaceId: string, limit = 50) {
  return db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.workspaceId, workspaceId))
    .orderBy(desc(stageRuns.createdAt))
    .limit(limit);
}

export async function getQueuedRuns(workspaceId?: string, limit = 10) {
  if (workspaceId) {
    return db
      .select()
      .from(stageRuns)
      .where(
        and(
          eq(stageRuns.workspaceId, workspaceId),
          eq(stageRuns.status, "queued")
        )
      )
      .orderBy(stageRuns.createdAt)
      .limit(limit);
  }
  
  return db
    .select()
    .from(stageRuns)
    .where(eq(stageRuns.status, "queued"))
    .orderBy(stageRuns.createdAt)
    .limit(limit);
}

export async function getActiveRunForCard(cardId: string) {
  const runs = await db
    .select()
    .from(stageRuns)
    .where(
      and(
        eq(stageRuns.cardId, cardId),
        or(
          eq(stageRuns.status, "queued"),
          eq(stageRuns.status, "running")
        )
      )
    )
    .orderBy(desc(stageRuns.createdAt))
    .limit(1);
  return runs[0] ?? null;
}

// ============================================
// RUN LOGS
// ============================================

export async function addRunLog(
  runId: string,
  level: RunLogLevel,
  message: string,
  stepKey?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await db.insert(runLogs).values({
    id: `log_${nanoid()}`,
    runId,
    timestamp: new Date(),
    level,
    message,
    stepKey,
    meta: meta as typeof runLogs.$inferInsert["meta"],
  });
}

export async function getRunLogs(runId: string, limit = 100) {
  return db
    .select()
    .from(runLogs)
    .where(eq(runLogs.runId, runId))
    .orderBy(runLogs.timestamp)
    .limit(limit);
}

export async function streamRunLogs(runId: string, afterTimestamp?: Date) {
  const query = db
    .select()
    .from(runLogs)
    .where(
      afterTimestamp
        ? and(
            eq(runLogs.runId, runId),
            gt(runLogs.timestamp, afterTimestamp)
          )
        : eq(runLogs.runId, runId)
    )
    .orderBy(runLogs.timestamp);
  
  return query;
}

// ============================================
// ARTIFACTS
// ============================================

export interface CreateArtifactInput {
  runId?: string;
  cardId: string;
  workspaceId: string;
  stage: ProjectStage;
  artifactType: ArtifactType;
  label: string;
  uri?: string;
  meta?: Record<string, unknown>;
}

export async function createArtifact(input: CreateArtifactInput): Promise<string> {
  const artifactId = `art_${nanoid()}`;
  
  await db.insert(artifacts).values({
    id: artifactId,
    runId: input.runId,
    cardId: input.cardId,
    workspaceId: input.workspaceId,
    stage: input.stage,
    artifactType: input.artifactType,
    label: input.label,
    uri: input.uri,
    meta: input.meta as typeof artifacts.$inferInsert["meta"],
    createdAt: new Date(),
  });

  if (input.runId) {
    await addRunLog(input.runId, "info", `Created artifact: ${input.label}`, "artifact");
  }

  return artifactId;
}

export async function getArtifactsForRun(runId: string) {
  return db
    .select()
    .from(artifacts)
    .where(eq(artifacts.runId, runId))
    .orderBy(artifacts.createdAt);
}

export async function getArtifactsForCard(cardId: string) {
  return db
    .select()
    .from(artifacts)
    .where(eq(artifacts.cardId, cardId))
    .orderBy(desc(artifacts.createdAt));
}

// ============================================
// STAGE TRANSITIONS
// ============================================

export interface RecordTransitionInput {
  cardId: string;
  workspaceId: string;
  fromStage?: ProjectStage;
  toStage: ProjectStage;
  actor: string;
  reason?: string;
  runId?: string;
}

export async function recordStageTransition(input: RecordTransitionInput): Promise<string> {
  const eventId = `trans_${nanoid()}`;
  
  await db.insert(stageTransitionEvents).values({
    id: eventId,
    cardId: input.cardId,
    workspaceId: input.workspaceId,
    fromStage: input.fromStage,
    toStage: input.toStage,
    actor: input.actor,
    reason: input.reason,
    runId: input.runId,
    timestamp: new Date(),
  });

  return eventId;
}

export async function getTransitionHistory(cardId: string, limit = 20) {
  return db
    .select()
    .from(stageTransitionEvents)
    .where(eq(stageTransitionEvents.cardId, cardId))
    .orderBy(desc(stageTransitionEvents.timestamp))
    .limit(limit);
}

// ============================================
// WORKER HEALTH
// ============================================

const WORKER_STALE_THRESHOLD_MS = 60000; // 1 minute

export async function registerWorker(workerId: string, workspaceId?: string): Promise<void> {
  const now = new Date();
  
  await db
    .insert(workerHeartbeats)
    .values({
      workerId,
      workspaceId,
      lastHeartbeat: now,
      status: "idle",
      processedCount: 0,
      failedCount: 0,
      metadata: {
        hostname: process.env.HOSTNAME || "unknown",
        pid: process.pid,
        startedAt: now.toISOString(),
      } as typeof workerHeartbeats.$inferInsert["metadata"],
    })
    .onConflictDoUpdate({
      target: workerHeartbeats.workerId,
      set: {
        lastHeartbeat: now,
        status: "idle",
      },
    });
}

export async function updateWorkerHeartbeat(
  workerId: string,
  status?: "idle" | "processing",
  activeRunId?: string | null
): Promise<void> {
  const now = new Date();
  
  await db
    .update(workerHeartbeats)
    .set({
      lastHeartbeat: now,
      status: status ?? "idle",
      activeRunId: activeRunId,
    })
    .where(eq(workerHeartbeats.workerId, workerId));
}

export async function incrementWorkerStats(workerId: string, failed = false): Promise<void> {
  await db
    .update(workerHeartbeats)
    .set({
      processedCount: sql`${workerHeartbeats.processedCount} + 1`,
      failedCount: failed 
        ? sql`${workerHeartbeats.failedCount} + 1`
        : workerHeartbeats.failedCount,
    })
    .where(eq(workerHeartbeats.workerId, workerId));
}

export async function getActiveWorkers(workspaceId?: string) {
  const staleThreshold = new Date(Date.now() - WORKER_STALE_THRESHOLD_MS);
  
  if (workspaceId) {
    return db
      .select()
      .from(workerHeartbeats)
      .where(
        and(
          or(
            eq(workerHeartbeats.workspaceId, workspaceId),
            isNull(workerHeartbeats.workspaceId)
          ),
          gt(workerHeartbeats.lastHeartbeat, staleThreshold)
        )
      );
  }
  
  return db
    .select()
    .from(workerHeartbeats)
    .where(gt(workerHeartbeats.lastHeartbeat, staleThreshold));
}

export async function hasActiveWorkers(workspaceId?: string): Promise<boolean> {
  const workers = await getActiveWorkers(workspaceId);
  return workers.length > 0;
}

export async function cleanupStaleWorkers(): Promise<number> {
  const staleThreshold = new Date(Date.now() - WORKER_STALE_THRESHOLD_MS * 2);
  
  const result = await db
    .delete(workerHeartbeats)
    .where(
      and(
        sql`${workerHeartbeats.lastHeartbeat} < ${staleThreshold}`,
        isNull(workerHeartbeats.activeRunId)
      )
    );
  
  return result.rowCount ?? 0;
}

// ============================================
// RESCUE STUCK RUNS
// ============================================

const STUCK_RUN_THRESHOLD_MS = 300000; // 5 minutes

/**
 * Find runs that have been "running" for too long without a heartbeat
 * and mark them as failed so they can be retried
 */
export async function rescueStuckRuns(): Promise<number> {
  const stuckThreshold = new Date(Date.now() - STUCK_RUN_THRESHOLD_MS);
  
  // Get all running runs that started before threshold
  const stuckRuns = await db
    .select()
    .from(stageRuns)
    .where(
      and(
        eq(stageRuns.status, "running"),
        sql`${stageRuns.startedAt} < ${stuckThreshold}`
      )
    );

  let rescuedCount = 0;
  
  for (const run of stuckRuns) {
    // Check if worker is still alive
    const workers = await getActiveWorkers(run.workspaceId);
    const workerStillActive = workers.some(w => w.activeRunId === run.id);
    
    if (!workerStillActive) {
      await completeRun(run.id, "failed", "Run timed out or worker died");
      rescuedCount++;
    }
  }

  return rescuedCount;
}

/**
 * Unlock cards that were locked by failed/stuck runs
 */
export async function unlockStuckCards(): Promise<number> {
  // Find cards with active runs that are stuck
  const stuckRuns = await db
    .select({
      cardId: stageRuns.cardId,
    })
    .from(stageRuns)
    .where(
      and(
        eq(stageRuns.status, "running"),
        sql`${stageRuns.startedAt} < ${new Date(Date.now() - STUCK_RUN_THRESHOLD_MS)}`
      )
    );

  // Mark those runs as failed
  for (const { cardId } of stuckRuns) {
    const activeRun = await getActiveRunForCard(cardId);
    if (activeRun && activeRun.status === "running") {
      await completeRun(activeRun.id, "failed", "Stuck run auto-rescued");
    }
  }

  return stuckRuns.length;
}
