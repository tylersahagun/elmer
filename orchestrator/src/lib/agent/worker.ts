/**
 * Background Worker - Polls for jobs and executes them automatically
 * 
 * Features:
 * - Configurable polling interval
 * - Unlimited concurrency with API rate limiting
 * - Event emitter for log streaming
 * - Graceful shutdown support
 */

import { EventEmitter } from "events";
import { db } from "@/lib/db";
import { jobs, projects } from "@/lib/db/schema";
import { eq, and, lt, asc } from "drizzle-orm";
import {
  updateJobStatus,
  createJobRun,
  updateJobRunStatus,
  createJobNotification,
  getWorkspace,
} from "@/lib/db/queries";
import { AgentExecutor } from "./executor";
import type {
  AgentJob,
  AgentProgressEvent,
  WorkerConfig,
  WorkerStatus,
  JobLogEntry,
} from "./types";
import type { JobType, JobStatus } from "@/lib/db/schema";

// ============================================
// DEFAULT CONFIGURATION
// ============================================

const DEFAULT_CONFIG: WorkerConfig = {
  pollIntervalMs: 2000,
  maxConcurrent: Infinity, // Rate limited by API
  rateLimit: {
    requestsPerMinute: 50, // Anthropic tier 1 limit
    tokensPerMinute: 80000,
  },
  timeoutMs: 30 * 60 * 1000, // 30 minutes
};

// ============================================
// LOG EVENT EMITTER
// ============================================

class JobLogEmitter extends EventEmitter {
  emitLog(entry: JobLogEntry) {
    this.emit("log", entry);
    this.emit(`job:${entry.jobId}`, entry);
  }
}

export const jobLogEmitter = new JobLogEmitter();

// ============================================
// RATE LIMITER
// ============================================

class RateLimiter {
  private requestTimes: number[] = [];
  private tokenUsage: { time: number; tokens: number }[] = [];
  private config: WorkerConfig["rateLimit"];

  constructor(config: WorkerConfig["rateLimit"]) {
    this.config = config;
  }

  async waitForCapacity(estimatedTokens: number = 1000): Promise<void> {
    const now = Date.now();
    const windowStart = now - 60000;

    // Clean old entries
    this.requestTimes = this.requestTimes.filter((t) => t > windowStart);
    this.tokenUsage = this.tokenUsage.filter((t) => t.time > windowStart);

    // Check request limit
    if (this.requestTimes.length >= this.config.requestsPerMinute) {
      const waitTime = this.requestTimes[0] - windowStart + 100;
      await this.sleep(waitTime);
      return this.waitForCapacity(estimatedTokens);
    }

    // Check token limit
    const currentTokens = this.tokenUsage.reduce((sum, t) => sum + t.tokens, 0);
    if (currentTokens + estimatedTokens > this.config.tokensPerMinute) {
      const waitTime = this.tokenUsage[0]?.time
        ? this.tokenUsage[0].time - windowStart + 100
        : 1000;
      await this.sleep(waitTime);
      return this.waitForCapacity(estimatedTokens);
    }

    // Reserve capacity
    this.requestTimes.push(now);
  }

  recordUsage(tokens: number) {
    this.tokenUsage.push({ time: Date.now(), tokens });
  }

  getRemaining(): { requests: number; tokens: number } {
    const now = Date.now();
    const windowStart = now - 60000;

    const recentRequests = this.requestTimes.filter((t) => t > windowStart).length;
    const recentTokens = this.tokenUsage
      .filter((t) => t.time > windowStart)
      .reduce((sum, t) => sum + t.tokens, 0);

    return {
      requests: Math.max(0, this.config.requestsPerMinute - recentRequests),
      tokens: Math.max(0, this.config.tokensPerMinute - recentTokens),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// WORKER CLASS
// ============================================

export class JobWorker {
  private config: WorkerConfig;
  private executor: AgentExecutor;
  private rateLimiter: RateLimiter;
  private isRunning = false;
  private pollTimeout: NodeJS.Timeout | null = null;
  private activeJobs = new Map<string, AbortController>();
  private processedCount = 0;
  private failedCount = 0;
  private lastPollAt: Date | null = null;

  constructor(config: Partial<WorkerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.executor = new AgentExecutor();
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
  }

  /**
   * Start the worker polling loop
   */
  start(workspaceId?: string): void {
    if (this.isRunning) {
      console.log("Worker already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Worker started");
    this.poll(workspaceId);
  }

  /**
   * Stop the worker gracefully
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }

    // Cancel all active jobs
    for (const [jobId, controller] of this.activeJobs) {
      console.log(`Cancelling job ${jobId}`);
      controller.abort();
    }

    // Wait for active jobs to finish
    while (this.activeJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("🛑 Worker stopped");
  }

  /**
   * Get current worker status
   */
  getStatus(): WorkerStatus {
    return {
      isRunning: this.isRunning,
      activeJobs: this.activeJobs.size,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      lastPollAt: this.lastPollAt,
      rateLimitRemaining: this.rateLimiter.getRemaining(),
    };
  }

  /**
   * Main polling loop
   */
  private async poll(workspaceId?: string): Promise<void> {
    if (!this.isRunning) return;

    try {
      this.lastPollAt = new Date();
      const pendingJobs = await this.getPendingJobs(workspaceId);

      // Start processing all pending jobs concurrently
      for (const job of pendingJobs) {
        // Don't double-process
        if (this.activeJobs.has(job.id)) continue;

        // Start job (don't await - process concurrently)
        this.processJob(job).catch((error) => {
          console.error(`Job ${job.id} failed:`, error);
        });
      }
    } catch (error) {
      console.error("Poll error:", error);
    }

    // Schedule next poll
    if (this.isRunning) {
      this.pollTimeout = setTimeout(
        () => this.poll(workspaceId),
        this.config.pollIntervalMs
      );
    }
  }

  /**
   * Get pending jobs from database
   */
  private async getPendingJobs(workspaceId?: string): Promise<AgentJob[]> {
    const conditions = [
      eq(jobs.status, "pending"),
      lt(jobs.attempts, jobs.maxAttempts),
    ];

    if (workspaceId) {
      conditions.push(eq(jobs.workspaceId, workspaceId));
    }

    const results = await db.query.jobs.findMany({
      where: and(...conditions),
      orderBy: [asc(jobs.createdAt)],
      limit: 100,
    });

    return results.map((job) => ({
      id: job.id,
      type: job.type,
      projectId: job.projectId || "",
      workspaceId: job.workspaceId,
      input: (job.input as Record<string, unknown>) || {},
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt),
    }));
  }

  /**
   * Check if job should be processed by server
   */
  private async shouldProcessJob(job: AgentJob): Promise<boolean> {
    const workspace = await getWorkspace(job.workspaceId);
    const settings = workspace?.settings;

    const aiExecutionMode = settings?.aiExecutionMode || "hybrid";
    const aiFallbackAfterMinutes = settings?.aiFallbackAfterMinutes ?? 30;

    // Server mode: always process
    if (aiExecutionMode === "server") {
      return true;
    }

    // Cursor mode: never process
    if (aiExecutionMode === "cursor") {
      return false;
    }

    // Hybrid mode: check fallback time
    const ageMinutes = (Date.now() - job.createdAt.getTime()) / 60000;
    return ageMinutes >= aiFallbackAfterMinutes;
  }

  /**
   * Process a single job
   */
  private async processJob(job: AgentJob): Promise<void> {
    // Check if we should process this job
    const shouldProcess = await this.shouldProcessJob(job);
    if (!shouldProcess) {
      return;
    }

    // Wait for rate limit capacity
    await this.rateLimiter.waitForCapacity();

    const controller = new AbortController();
    this.activeJobs.set(job.id, controller);

    const attempt = job.attempts + 1;

    try {
      console.log(`🚀 Processing job ${job.id} (${job.type})`);

      // Mark as running
      await db.update(jobs)
        .set({
          status: "running",
          attempts: attempt,
          startedAt: new Date(),
          progress: 0,
        })
        .where(eq(jobs.id, job.id));

      const jobRun = await createJobRun({
        jobId: job.id,
        status: "running",
        attempt,
      });

      // Get project name for notifications
      let projectName: string | undefined;
      if (job.projectId) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, job.projectId),
        });
        projectName = project?.name;
      }

      // Execute with progress callback
      const result = await this.executor.executeJob(job, (event) => {
        this.handleProgressEvent(job.id, event);
      });

      // Record token usage
      const totalTokens = result.tokensUsed.input + result.tokensUsed.output;
      this.rateLimiter.recordUsage(totalTokens);

      if (result.success) {
        this.processedCount++;

        if (jobRun?.id) {
          await updateJobRunStatus(jobRun.id, "completed");
        }

        await updateJobStatus(job.id, "completed", {
          output: result.output,
          progress: 1,
        });

        await createJobNotification(
          {
            id: job.id,
            workspaceId: job.workspaceId,
            projectId: job.projectId,
            type: job.type,
            status: "completed",
          },
          projectName
        );

        console.log(`✅ Job ${job.id} completed`);
      } else {
        this.failedCount++;

        if (jobRun?.id) {
          await updateJobRunStatus(jobRun.id, "failed", result.error);
        }

        const shouldRetry = attempt < job.maxAttempts;
        await updateJobStatus(job.id, shouldRetry ? "pending" : "failed", {
          error: result.error,
          progress: 0,
        });

        if (!shouldRetry) {
          await createJobNotification(
            {
              id: job.id,
              workspaceId: job.workspaceId,
              projectId: job.projectId,
              type: job.type,
              status: "failed",
              error: result.error,
            },
            projectName
          );
        }

        console.error(`❌ Job ${job.id} failed: ${result.error}`);
      }
    } catch (error) {
      this.failedCount++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      const shouldRetry = attempt < job.maxAttempts;
      await updateJobStatus(job.id, shouldRetry ? "pending" : "failed", {
        error: errorMessage,
        progress: 0,
      });

      console.error(`❌ Job ${job.id} error: ${errorMessage}`);
    } finally {
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Handle progress events and emit logs
   */
  private handleProgressEvent(jobId: string, event: AgentProgressEvent): void {
    let message: string;
    let level: JobLogEntry["level"] = "info";

    switch (event.type) {
      case "started":
        message = `Started job: ${event.jobType}`;
        break;
      case "log":
        message = event.message;
        break;
      case "tool_call":
        message = `Calling tool: ${event.toolName}`;
        break;
      case "tool_result":
        message = `Tool ${event.toolName}: ${event.success ? "success" : "failed"}`;
        level = event.success ? "info" : "warn";
        break;
      case "progress":
        message = event.message || `Progress: ${Math.round(event.progress * 100)}%`;
        break;
      case "completed":
        message = `Job completed in ${event.result.durationMs}ms`;
        break;
      case "failed":
        message = `Job failed: ${event.error}`;
        level = "error";
        break;
      default:
        return;
    }

    const entry: JobLogEntry = {
      jobId,
      timestamp: new Date(),
      level,
      message,
    };

    jobLogEmitter.emitLog(entry);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let workerInstance: JobWorker | null = null;

export function getWorker(config?: Partial<WorkerConfig>): JobWorker {
  if (!workerInstance) {
    workerInstance = new JobWorker(config);
  }
  return workerInstance;
}

export function startWorker(workspaceId?: string, config?: Partial<WorkerConfig>): JobWorker {
  const worker = getWorker(config);
  worker.start(workspaceId);
  return worker;
}

export async function stopWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.stop();
    workerInstance = null;
  }
}
