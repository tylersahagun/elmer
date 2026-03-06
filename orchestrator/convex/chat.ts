import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listThreads = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { workspaceId, userId, includeArchived }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const threads = await ctx.db
      .query("chatThreads")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId),
      )
      .order("desc")
      .collect();
    if (includeArchived) return threads;
    return threads.filter((t) => !t.isArchived);
  },
});

export const getThread = query({
  args: { threadId: v.id("chatThreads") },
  handler: async (ctx, { threadId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(threadId);
  },
});

export const listMessages = query({
  args: {
    threadId: v.id("chatThreads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("chatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("asc")
      .collect();
    const cap = limit ?? 100;
    return all.slice(0, cap);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const createThread = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    title: v.string(),
    contextEntityType: v.optional(v.string()),
    contextEntityId: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("chatThreads", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      title: args.title,
      contextEntityType: args.contextEntityType,
      contextEntityId: args.contextEntityId,
      model: args.model,
      lastMessageAt: Date.now(),
      isArchived: false,
    });
  },
});

export const updateThread = mutation({
  args: {
    threadId: v.id("chatThreads"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { threadId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(patch)) {
      if (val !== undefined) updates[k] = val;
    }
    await ctx.db.patch(threadId, updates);
    return await ctx.db.get(threadId);
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.id("chatThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    tokenCount: v.optional(v.number()),
    agentJobId: v.optional(v.id("jobs")),
    isHITL: v.optional(v.boolean()),
    hitlJobId: v.optional(v.id("jobs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const messageId = await ctx.db.insert("chatMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
      tokenCount: args.tokenCount,
      agentJobId: args.agentJobId,
      isHITL: args.isHITL,
      hitlJobId: args.hitlJobId,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: Date.now() });
    return messageId;
  },
});
