import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    inputContext: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentExecutions", {
      jobId: args.jobId,
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      agentDefinitionId: args.agentDefinitionId,
      inputContext: args.inputContext,
      toolCalls: [],
      startedAt: Date.now(),
    });
  },
});

export const update = internalMutation({
  args: {
    id: v.id("agentExecutions"),
    toolCalls: v.optional(v.array(v.any())),
    output: v.optional(v.any()),
    tokensUsed: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Stored for resume after HITL pause
    messageHistory: v.optional(v.string()),
    pausedAtToolCallId: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const appendToolCall = internalMutation({
  args: {
    id: v.id("agentExecutions"),
    toolCall: v.any(),
  },
  handler: async (ctx, { id, toolCall }) => {
    const exec = await ctx.db.get(id);
    if (!exec) throw new Error("AgentExecution not found");
    await ctx.db.patch(id, {
      toolCalls: [...(exec.toolCalls ?? []), toolCall],
    });
  },
});

export const getByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("agentExecutions")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .first();
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("agentExecutions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .take(20);
  },
});
