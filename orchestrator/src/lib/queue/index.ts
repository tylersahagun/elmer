import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { and, asc, desc, eq, lt } from "drizzle-orm";

export async function dequeueJob(workspaceId?: string) {
  const whereClause = workspaceId
    ? and(eq(jobs.workspaceId, workspaceId), eq(jobs.status, "pending"))
    : eq(jobs.status, "pending");

  const [job] = await db.query.jobs.findMany({
    where: whereClause,
    orderBy: [desc(jobs.priority), asc(jobs.createdAt)],
    limit: 1,
  });

  return job || null;
}

export async function markJobDelayed(jobId: string, delayMs: number) {
  const now = new Date();
  const resumeAt = new Date(now.getTime() + delayMs);
  await db.update(jobs)
    .set({ startedAt: resumeAt })
    .where(eq(jobs.id, jobId));
}

export async function getReadyJobs(workspaceId?: string, limit = 10) {
  const now = new Date();
  const whereClause = workspaceId
    ? and(eq(jobs.workspaceId, workspaceId), eq(jobs.status, "pending"), lt(jobs.createdAt, now))
    : and(eq(jobs.status, "pending"), lt(jobs.createdAt, now));

  return db.query.jobs.findMany({
    where: whereClause,
    orderBy: [desc(jobs.priority), asc(jobs.createdAt)],
    limit,
  });
}
