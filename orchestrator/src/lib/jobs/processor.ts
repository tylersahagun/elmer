/**
 * Job Processor - Polls database and executes pending jobs
 * 
 * This module provides:
 * 1. processPendingJobs() - Process all pending jobs for a workspace
 * 2. processNextJob() - Process the next pending job
 * 3. processJob() - Process a specific job by ID
 */

import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { updateJobStatus } from "@/lib/db/queries";
import { executeJob } from "./executor";
import type { JobType, JobStatus } from "@/lib/db/schema";

interface ProcessResult {
  jobId: string;
  type: JobType;
  status: JobStatus;
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
}

// ============================================
// GET PENDING JOBS
// ============================================

async function getPendingJobs(workspaceId?: string, limit: number = 10) {
  if (workspaceId) {
    return db.query.jobs.findMany({
      where: and(
        eq(jobs.workspaceId, workspaceId),
        eq(jobs.status, "pending")
      ),
      orderBy: [asc(jobs.createdAt)],
      limit,
    });
  }

  return db.query.jobs.findMany({
    where: eq(jobs.status, "pending"),
    orderBy: [asc(jobs.createdAt)],
    limit,
  });
}

async function getJobById(jobId: string) {
  return db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });
}

// ============================================
// PROCESS A SINGLE JOB
// ============================================

export async function processJob(jobId: string): Promise<ProcessResult> {
  const startTime = Date.now();
  
  const job = await getJobById(jobId);
  
  if (!job) {
    return {
      jobId,
      type: "generate_prd" as JobType,
      status: "failed",
      error: "Job not found",
      duration: Date.now() - startTime,
    };
  }

  if (job.status !== "pending") {
    return {
      jobId,
      type: job.type,
      status: job.status,
      error: `Job is not pending (current status: ${job.status})`,
      duration: Date.now() - startTime,
    };
  }

  console.log(`🚀 Processing job ${jobId} (${job.type})`);

  // Mark as running
  await updateJobStatus(jobId, "running", { progress: 0 });

  try {
    // Execute the job
    const result = await executeJob(
      jobId,
      job.type,
      job.projectId || "",
      job.workspaceId,
      (job.input as Record<string, unknown>) || {}
    );

    if (result.success) {
      await updateJobStatus(jobId, "completed", {
        output: result.output,
        progress: 1,
      });

      console.log(`✅ Job ${jobId} completed successfully`);

      return {
        jobId,
        type: job.type,
        status: "completed",
        output: result.output,
        duration: Date.now() - startTime,
      };
    } else {
      await updateJobStatus(jobId, "failed", {
        error: result.error,
        progress: 0,
      });

      console.error(`❌ Job ${jobId} failed: ${result.error}`);

      return {
        jobId,
        type: job.type,
        status: "failed",
        error: result.error,
        duration: Date.now() - startTime,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    await updateJobStatus(jobId, "failed", {
      error: errorMessage,
      progress: 0,
    });

    console.error(`❌ Job ${jobId} threw error: ${errorMessage}`);

    return {
      jobId,
      type: job.type,
      status: "failed",
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

// ============================================
// PROCESS NEXT PENDING JOB
// ============================================

export async function processNextJob(workspaceId?: string): Promise<ProcessResult | null> {
  const pendingJobs = await getPendingJobs(workspaceId, 1);
  
  if (pendingJobs.length === 0) {
    return null;
  }

  const job = pendingJobs[0];
  return processJob(job.id);
}

// ============================================
// PROCESS ALL PENDING JOBS
// ============================================

export interface BatchProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  results: ProcessResult[];
  totalDuration: number;
}

export async function processPendingJobs(
  workspaceId?: string,
  options?: {
    maxJobs?: number;
    concurrency?: number;
  }
): Promise<BatchProcessResult> {
  const startTime = Date.now();
  const maxJobs = options?.maxJobs || 50;
  const concurrency = options?.concurrency || 3;
  
  const pendingJobs = await getPendingJobs(workspaceId, maxJobs);
  
  if (pendingJobs.length === 0) {
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
      results: [],
      totalDuration: Date.now() - startTime,
    };
  }

  console.log(`📋 Found ${pendingJobs.length} pending jobs to process`);

  const results: ProcessResult[] = [];
  
  // Process jobs with concurrency limit
  for (let i = 0; i < pendingJobs.length; i += concurrency) {
    const batch = pendingJobs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(job => processJob(job.id))
    );
    results.push(...batchResults);
  }

  const succeeded = results.filter(r => r.status === "completed").length;
  const failed = results.filter(r => r.status === "failed").length;

  console.log(`📊 Batch complete: ${succeeded} succeeded, ${failed} failed`);

  return {
    processed: results.length,
    succeeded,
    failed,
    results,
    totalDuration: Date.now() - startTime,
  };
}

// ============================================
// GET JOB STATUS SUMMARY
// ============================================

export async function getJobStatusSummary(workspaceId: string) {
  const allJobs = await db.query.jobs.findMany({
    where: eq(jobs.workspaceId, workspaceId),
  });

  const summary = {
    total: allJobs.length,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  for (const job of allJobs) {
    summary[job.status]++;
  }

  return summary;
}

// ============================================
// CANCEL JOB
// ============================================

export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await getJobById(jobId);
  
  if (!job) {
    return false;
  }

  if (job.status !== "pending" && job.status !== "running") {
    return false;
  }

  await updateJobStatus(jobId, "cancelled");
  console.log(`🚫 Job ${jobId} cancelled`);
  
  return true;
}

// ============================================
// RETRY FAILED JOB
// ============================================

export async function retryJob(jobId: string): Promise<ProcessResult | null> {
  const job = await getJobById(jobId);
  
  if (!job) {
    return null;
  }

  if (job.status !== "failed") {
    return null;
  }

  // Reset to pending
  await db.update(jobs)
    .set({
      status: "pending",
      error: null,
      progress: 0,
      startedAt: null,
      completedAt: null,
    })
    .where(eq(jobs.id, jobId));

  console.log(`🔄 Retrying job ${jobId}`);
  
  // Process immediately
  return processJob(jobId);
}
