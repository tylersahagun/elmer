import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ── Job Queries ───────────────────────────────────────────────────────────────

export function getUnauthenticatedJobsListFallback(
  identity: unknown,
): [] | null {
  return identity ? null : [];
}

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    // The workspace board subscribes early during Clerk -> Convex session
    // propagation. Returning an empty list keeps the board usable until the
    // authenticated subscription is ready instead of crashing the route.
    const unauthenticatedFallback = getUnauthenticatedJobsListFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;
    if (status) {
      return await ctx.db
        .query("jobs")
        .withIndex("by_workspace_status", (q) =>
          q.eq("workspaceId", workspaceId).eq("status", status),
        )
        .collect();
    }
    return await ctx.db
      .query("jobs")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const get = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(jobId);
  },
});

export const getInternal = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const unauthenticatedFallback = getUnauthenticatedJobsListFallback(identity);
    if (unauthenticatedFallback) return unauthenticatedFallback;
    return await ctx.db
      .query("jobs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

// ── Job Mutations ─────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    input: v.any(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    parentJobId: v.optional(v.id("jobs")),
    rootInitiator: v.optional(v.string()),
    rootInitiatorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const displayName =
      ((identity as Record<string, unknown>).name as string | undefined) ??
      ((identity as Record<string, unknown>).email as string | undefined) ??
      ((identity as Record<string, unknown>).tokenIdentifier as string | undefined) ??
      identity.subject;
    return await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      status: "pending",
      input: args.input,
      output: null,
      attempt: 0,
      agentDefinitionId: args.agentDefinitionId,
      initiatedBy: identity.subject,
      initiatedByName: displayName,
      rootInitiator: args.rootInitiator ?? identity.subject,
      rootInitiatorName: args.rootInitiatorName ?? displayName,
      parentJobId: args.parentJobId,
    });
  },
});

export const updateStatus = mutation({
  args: {
    jobId: v.id("jobs"),
    status: v.string(),
    output: v.optional(v.any()),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    runId: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = { status: patch.status };
    if (patch.output !== undefined) updates.output = patch.output;
    if (patch.progress !== undefined) updates.progress = patch.progress;
    if (patch.errorMessage !== undefined) updates.errorMessage = patch.errorMessage;
    if (patch.runId !== undefined) updates.runId = patch.runId;
    await ctx.db.patch(jobId, updates);
    return await ctx.db.get(jobId);
  },
});

export const updateStatusInternal = internalMutation({
  args: {
    jobId: v.id("jobs"),
    status: v.string(),
    output: v.optional(v.any()),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    runId: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, ...patch }) => {
    const updates: Record<string, unknown> = { status: patch.status };
    if (patch.output !== undefined) updates.output = patch.output;
    if (patch.progress !== undefined) updates.progress = patch.progress;
    if (patch.errorMessage !== undefined) updates.errorMessage = patch.errorMessage;
    if (patch.runId !== undefined) updates.runId = patch.runId;
    await ctx.db.patch(jobId, updates);
    return await ctx.db.get(jobId);
  },
});

export const incrementAttempt = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const job = await ctx.db.get(jobId);
    if (!job) throw new Error("Job not found");
    await ctx.db.patch(jobId, { attempt: job.attempt + 1 });
  },
});

export const listRecent = query({
  args: {
    workspaceId: v.id("workspaces"),
    limitHours: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limitHours = 24 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const cutoff = Date.now() - limitHours * 60 * 60 * 1000;
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(50);
    return jobs.filter((j) => (j._creationTime ?? 0) >= cutoff);
  },
});

// ── Job Log Queries ───────────────────────────────────────────────────────────

export const getLogs = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("jobLogs")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const getLastLog = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("jobLogs")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .order("desc")
      .first();
  },
});

// ── Job Log Mutations ─────────────────────────────────────────────────────────

export const appendLog = mutation({
  args: {
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    level: v.string(),
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("jobLogs", {
      jobId: args.jobId,
      workspaceId: args.workspaceId,
      level: args.level,
      message: args.message,
      stepKey: args.stepKey,
      meta: args.meta,
    });
  },
});

export const appendLogInternal = internalMutation({
  args: {
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    level: v.string(),
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobLogs", {
      jobId: args.jobId,
      workspaceId: args.workspaceId,
      level: args.level,
      message: args.message,
      stepKey: args.stepKey,
      meta: args.meta,
    });
  },
});

export const cancel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(jobId, { status: "cancelled" });
  },
});

/**
 * Create a job AND immediately schedule the agent runner.
 * This is the primary entry point for triggering agents from the UI.
 */
export const createAndSchedule = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    input: v.any(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    parentJobId: v.optional(v.id("jobs")),
    rootInitiator: v.optional(v.string()),
    rootInitiatorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const displayName =
      ((identity as Record<string, unknown>).name as string | undefined) ??
      ((identity as Record<string, unknown>).email as string | undefined) ??
      ((identity as Record<string, unknown>).tokenIdentifier as string | undefined) ??
      identity.subject;

    const jobId = await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      status: "pending",
      input: {
        ...((args.input as Record<string, unknown>) ?? {}),
        agentDefinitionId: args.agentDefinitionId,
      },
      output: null,
      attempt: 0,
      agentDefinitionId: args.agentDefinitionId,
      initiatedBy: identity.subject,
      initiatedByName: displayName,
      rootInitiator: args.rootInitiator ?? identity.subject,
      rootInitiatorName: args.rootInitiatorName ?? displayName,
      parentJobId: args.parentJobId,
    });

    // Schedule the agent runner immediately
    await ctx.scheduler.runAfter(0, internal.agents.run, { jobId });

    return jobId;
  },
});
