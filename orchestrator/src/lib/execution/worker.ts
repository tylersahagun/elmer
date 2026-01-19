/**
 * Execution Worker - Polls for and executes stage runs
 * 
 * This worker ensures runs are never stuck:
 * - Heartbeat system to detect dead workers
 * - Auto-rescue for stuck runs
 * - Graceful shutdown
 */

import { nanoid } from "nanoid";
import {
  getQueuedRuns,
  claimRun,
  completeRun,
  addRunLog,
  getRunById,
  registerWorker,
  updateWorkerHeartbeat,
  incrementWorkerStats,
  rescueStuckRuns,
  unlockStuckCards,
  createArtifact,
} from "./run-manager";
import { getProvider, getDefaultProvider, createDbCallbacks, type ExecutionResult } from "./providers";
import { executeStage, executeStageWithTasks } from "./stage-executors";
import { db } from "@/lib/db";
import { stageRecipes, projects, documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ============================================
// WORKER CONFIGURATION
// ============================================

export interface WorkerConfig {
  workerId?: string;
  workspaceId?: string;
  pollIntervalMs?: number;
  heartbeatIntervalMs?: number;
  maxConcurrent?: number;
  rescueIntervalMs?: number;
}

const DEFAULT_CONFIG: Required<WorkerConfig> = {
  workerId: `worker_${nanoid(8)}`,
  workspaceId: "",
  pollIntervalMs: 5000,
  heartbeatIntervalMs: 15000,
  maxConcurrent: 1,
  rescueIntervalMs: 60000,
};

// ============================================
// WORKER CLASS
// ============================================

export class ExecutionWorker {
  private config: Required<WorkerConfig>;
  private isRunning = false;
  private activeTasks = 0;
  private pollTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private rescueTimer: NodeJS.Timeout | null = null;
  private shutdownRequested = false;

  constructor(config: WorkerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (!this.config.workerId) {
      this.config.workerId = `worker_${nanoid(8)}`;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log(`[Worker ${this.config.workerId}] Already running`);
      return;
    }

    this.isRunning = true;
    this.shutdownRequested = false;
    
    console.log(`[Worker ${this.config.workerId}] Starting...`);
    
    // Register worker in database
    await registerWorker(this.config.workerId, this.config.workspaceId || undefined);
    
    // Start heartbeat
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      this.config.heartbeatIntervalMs
    );
    
    // Start rescue interval
    this.rescueTimer = setInterval(
      () => this.runRescue(),
      this.config.rescueIntervalMs
    );

    // Start polling
    this.poll();
    
    console.log(`[Worker ${this.config.workerId}] Started successfully`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log(`[Worker ${this.config.workerId}] Stopping...`);
    this.shutdownRequested = true;
    
    // Stop timers
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.rescueTimer) {
      clearInterval(this.rescueTimer);
      this.rescueTimer = null;
    }
    
    // Wait for active tasks to complete
    let waitCount = 0;
    while (this.activeTasks > 0 && waitCount < 30) {
      console.log(`[Worker ${this.config.workerId}] Waiting for ${this.activeTasks} active tasks...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      waitCount++;
    }
    
    // Update worker status
    await updateWorkerHeartbeat(this.config.workerId, "idle", null);
    
    this.isRunning = false;
    console.log(`[Worker ${this.config.workerId}] Stopped`);
  }

  private async poll(): Promise<void> {
    if (this.shutdownRequested) {
      return;
    }

    try {
      // Check if we can take more work
      if (this.activeTasks >= this.config.maxConcurrent) {
        this.schedulePoll();
        return;
      }

      // Get queued runs
      const runs = await getQueuedRuns(
        this.config.workspaceId || undefined,
        this.config.maxConcurrent - this.activeTasks
      );

      // Process runs
      for (const run of runs) {
        if (this.activeTasks >= this.config.maxConcurrent) {
          break;
        }

        // Try to claim the run
        const claimed = await claimRun(run.id, this.config.workerId);
        if (claimed) {
          this.activeTasks++;
          // Don't await - run async
          this.executeRun(run.id).catch((error) => {
            console.error(`[Worker ${this.config.workerId}] Execute error:`, error);
          });
        }
      }
    } catch (error) {
      console.error(`[Worker ${this.config.workerId}] Poll error:`, error);
    }

    this.schedulePoll();
  }

  private schedulePoll(): void {
    if (this.shutdownRequested) {
      return;
    }
    this.pollTimer = setTimeout(() => this.poll(), this.config.pollIntervalMs);
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      await updateWorkerHeartbeat(
        this.config.workerId,
        this.activeTasks > 0 ? "processing" : "idle"
      );
    } catch (error) {
      console.error(`[Worker ${this.config.workerId}] Heartbeat error:`, error);
    }
  }

  private async runRescue(): Promise<void> {
    try {
      const rescuedRuns = await rescueStuckRuns();
      const unlockedCards = await unlockStuckCards();
      
      if (rescuedRuns > 0 || unlockedCards > 0) {
        console.log(`[Worker ${this.config.workerId}] Rescued ${rescuedRuns} runs, unlocked ${unlockedCards} cards`);
      }
    } catch (error) {
      console.error(`[Worker ${this.config.workerId}] Rescue error:`, error);
    }
  }

  private async executeRun(runId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`[Worker ${this.config.workerId}] Executing run ${runId}`);
      
      // Get run details
      const run = await getRunById(runId);
      if (!run) {
        throw new Error(`Run ${runId} not found`);
      }

      // Create DB callbacks for logging
      const callbacks = createDbCallbacks(
        runId,
        run.cardId,
        run.workspaceId,
        run.stage
      );

      await addRunLog(runId, "info", `Worker ${this.config.workerId} executing run`, "worker");
      
      // Execute the stage using task-based execution (falls back to standard if no verification criteria)
      const result = await executeStageWithTasks(run, callbacks);
      
      const durationMs = Date.now() - startTime;
      
      if (result.success) {
        await completeRun(runId, "succeeded", undefined, {
          durationMs,
          tokensUsed: result.tokensUsed,
          skillsExecuted: result.skillsExecuted,
          gateResults: result.gateResults,
          taskResults: result.taskResults,
        });
        await incrementWorkerStats(this.config.workerId, false);
        console.log(`[Worker ${this.config.workerId}] Run ${runId} succeeded in ${durationMs}ms`);
      } else {
        await completeRun(runId, "failed", result.error, {
          durationMs,
          tokensUsed: result.tokensUsed,
          skillsExecuted: result.skillsExecuted,
          gateResults: result.gateResults,
          taskResults: result.taskResults,
        });
        await incrementWorkerStats(this.config.workerId, true);
        console.log(`[Worker ${this.config.workerId}] Run ${runId} failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const durationMs = Date.now() - startTime;
      
      console.error(`[Worker ${this.config.workerId}] Run ${runId} error:`, error);
      await addRunLog(runId, "error", `Unexpected error: ${errorMessage}`, "worker");
      await completeRun(runId, "failed", errorMessage, { durationMs });
      await incrementWorkerStats(this.config.workerId, true);
    } finally {
      this.activeTasks--;
    }
  }
}

// ============================================
// SINGLETON WORKER
// ============================================

let globalWorker: ExecutionWorker | null = null;

export async function startWorker(config?: WorkerConfig): Promise<ExecutionWorker> {
  if (globalWorker) {
    return globalWorker;
  }
  
  globalWorker = new ExecutionWorker(config);
  await globalWorker.start();
  return globalWorker;
}

export async function stopWorker(): Promise<void> {
  if (globalWorker) {
    await globalWorker.stop();
    globalWorker = null;
  }
}

export function getWorker(): ExecutionWorker | null {
  return globalWorker;
}

// ============================================
// PROCESS SIGNALS
// ============================================

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[Worker] Received SIGINT, shutting down...");
  await stopWorker();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[Worker] Received SIGTERM, shutting down...");
  await stopWorker();
  process.exit(0);
});
