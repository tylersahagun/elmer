/**
 * Internal query/mutation wrappers for the MCP HTTP API.
 * Called from http.ts routes — no user auth required (system-level access).
 */

import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ── Projects ──────────────────────────────────────────────────────────────────

export const listProjects = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getProject = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => ctx.db.get(projectId),
});

export const getDocuments = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const createProject = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      stage: args.stage,
      status: "on_track",
      priority: args.priority,
      metadata: {},
    });
  },
});

export const updateProject = internalMutation({
  args: {
    projectId: v.id("projects"),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, ...patch }) => {
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(projectId, updates);
  },
});

// ── Signals ───────────────────────────────────────────────────────────────────

export const listSignals = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const all = await ctx.db
      .query("signals")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return status ? all.filter((s) => s.status === status) : all;
  },
});

export const createSignal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    source: v.string(),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("signals", {
      workspaceId: args.workspaceId,
      verbatim: args.verbatim,
      source: args.source,
      severity: args.severity,
      status: "new",
    });
  },
});

// ── Agents ────────────────────────────────────────────────────────────────────

export const listAgents = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((a) => a.type === type) : all;
  },
});

// ── Jobs ──────────────────────────────────────────────────────────────────────

export const listJobs = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const all = await ctx.db
      .query("jobs")
      .withIndex("by_workspace_status", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return status ? all.filter((j) => j.status === status) : all;
  },
});

export const getJob = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => ctx.db.get(jobId),
});

export const getJobLogs = internalQuery({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("jobLogs")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

export const createJob = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    input: v.any(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      status: "pending",
      input: args.input,
      output: null,
      attempt: 0,
      agentDefinitionId: args.agentDefinitionId,
    });
  },
});

// ── Pending questions ─────────────────────────────────────────────────────────

export const listPendingQuestions = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("pendingQuestions")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", "pending"),
      )
      .collect();
  },
});

export const answerQuestion = internalMutation({
  args: {
    questionId: v.id("pendingQuestions"),
    response: v.any(),
  },
  handler: async (ctx, { questionId, response }) => {
    const question = await ctx.db.get(questionId);
    if (!question) throw new Error("Question not found");
    await ctx.db.patch(questionId, { status: "answered", response });
    await ctx.db.patch(question.jobId, { status: "running" });
    await ctx.scheduler.runAfter(0, internal.agents.resume, {
      jobId: question.jobId,
      questionId,
    });
  },
});

// ── Commands ──────────────────────────────────────────────────────────────────

export const listCommands = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    return await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("type", "command"),
      )
      .filter((q) => q.eq(q.field("enabled"), true))
      .collect();
  },
});

// ── Knowledge base ────────────────────────────────────────────────────────────

export const listKnowledge = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("knowledgebaseEntries")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

// ── Memory ────────────────────────────────────────────────────────────────────

export const storeMemory = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryEntries", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      content: args.content,
    });
  },
});

export const getProjectMemory = internalQuery({
  args: {
    projectId: v.id("projects"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, type }) => {
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

export const getWorkspaceMemory = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return type ? all.filter((e) => e.type === type) : all;
  },
});

// ── Prototypes ────────────────────────────────────────────────────────────────

export const listPrototypeVariants = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("prototypeVariants")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getPrototypeVariant = internalQuery({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => ctx.db.get(variantId),
});

export const getPrototypeFeedback = internalQuery({
  args: { variantId: v.id("prototypeVariants") },
  handler: async (ctx, { variantId }) => {
    const links = await ctx.db
      .query("signalProtoVariants")
      .withIndex("by_variant", (q) => q.eq("prototypeVariantId", variantId))
      .collect();
    const signals = await Promise.all(links.map((l) => ctx.db.get(l.signalId)));
    return signals.filter(Boolean);
  },
});

export const updateProjectSlackChannel = internalMutation({
  args: {
    projectId: v.id("projects"),
    slackChannelId: v.string(),
    slackChannelName: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, slackChannelId, slackChannelName }) => {
    await ctx.db.patch(projectId, { slackChannelId, slackChannelName });
  },
});

// Need to import internal for the answerQuestion scheduler call
import { internal } from "./_generated/api";
