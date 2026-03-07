import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const listPending = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("pendingQuestions")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", status ?? "pending"),
      )
      .order("desc")
      .collect();
  },
});

export const getByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("pendingQuestions")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const getByJobInternal = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("pendingQuestions")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const create = internalMutation({
  args: {
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    questionType: v.string(),
    questionText: v.string(),
    choices: v.optional(v.array(v.string())),
    context: v.optional(v.any()),
    timeoutAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pendingQuestions", {
      jobId: args.jobId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      questionType: args.questionType,
      questionText: args.questionText,
      choices: args.choices,
      context: args.context,
      status: "pending",
      timeoutAt: args.timeoutAt,
    });
  },
});

/**
 * Answer a pending question. This:
 * 1. Records the response
 * 2. Sets the job back to "running"
 * 3. Schedules internal.agents.resume to continue the agentic loop
 */
export const answer = mutation({
  args: {
    questionId: v.id("pendingQuestions"),
    response: v.any(),
  },
  handler: async (ctx, { questionId, response }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Question not found");
    if (question.status !== "pending") throw new Error("Question already answered");

    await ctx.db.patch(questionId, {
      status: "answered",
      response,
      respondedBy: identity.subject,
    });

    // Set job back to running
    await ctx.db.patch(question.jobId, { status: "running" });

    // Resume the agent action
    await ctx.scheduler.runAfter(0, internal.agents.resume, {
      jobId: question.jobId,
      questionId,
    });

    return questionId;
  },
});

export const markTimedOut = internalMutation({
  args: { questionId: v.id("pendingQuestions") },
  handler: async (ctx, { questionId }) => {
    const question = await ctx.db.get(questionId);
    if (!question || question.status !== "pending") return;

    await ctx.db.patch(questionId, { status: "timed_out" });

    // Resume with null response (agent handles timeout)
    await ctx.scheduler.runAfter(0, internal.agents.resume, {
      jobId: question.jobId,
      questionId,
    });
  },
});
