import { query, mutation } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const listForUser = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, userId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) =>
        q.eq("userId", userId).eq("status", status ?? "unread"),
      )
      .order("desc")
      .take(50);
  },
});

export const listForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("notifications")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", status ?? "unread"),
      )
      .order("desc")
      .take(50);
  },
});

export const create = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    priority: v.string(),
    title: v.string(),
    message: v.string(),
    userId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    jobId: v.optional(v.id("jobs")),
    actionType: v.optional(v.string()),
    actionData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      workspaceId: args.workspaceId,
      type: args.type,
      priority: args.priority,
      title: args.title,
      message: args.message,
      status: "unread",
      userId: args.userId,
      projectId: args.projectId,
      jobId: args.jobId,
      actionType: args.actionType,
      actionData: args.actionData,
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(id, { status: "read" });
  },
});

export const markAllRead = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.string(),
  },
  handler: async (ctx, { workspaceId, userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId).eq("status", "unread"))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { status: "read" })));
    return unread.length;
  },
});

// ── Additional public operations for routes ───────────────────────────────────

export const getById = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(id);
  },
});

export const createPublic = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    priority: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    userId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    jobId: v.optional(v.id("jobs")),
    actionType: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actionData: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("notifications", {
      workspaceId: args.workspaceId,
      type: args.type,
      priority: args.priority ?? "medium",
      title: args.title,
      message: args.message,
      status: "unread",
      userId: args.userId,
      projectId: args.projectId,
      jobId: args.jobId,
      actionType: args.actionType,
      actionData: args.actionData
        ? { ...args.actionData, actionLabel: args.actionLabel, actionUrl: args.actionUrl, metadata: args.metadata }
        : { actionLabel: args.actionLabel, actionUrl: args.actionUrl, metadata: args.metadata },
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("notifications"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(id, { status });
    return await ctx.db.get(id);
  },
});

export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(id);
  },
});

export const countUnread = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", "unread"),
      )
      .collect();
    return unread.length;
  },
});

export const markAllReadForWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", workspaceId).eq("status", "unread"),
      )
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { status: "read" })));
    return unread.length;
  },
});

export const listFiltered = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, status, type, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    let results = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_status", (q) =>
        status
          ? q.eq("workspaceId", workspaceId).eq("status", status)
          : q.eq("workspaceId", workspaceId),
      )
      .order("desc")
      .take(limit ?? 50);
    if (type) {
      results = results.filter((n) => n.type === type);
    }
    return results;
  },
});

export const createThresholdAware = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    priority: v.optional(v.string()),
    clusterId: v.optional(v.string()),
    clusterSize: v.optional(v.number()),
    clusterSeverity: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    metadata: v.optional(v.any()),
    actionType: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    // Threshold config
    notifyOnClusterSize: v.optional(v.number()),
    notifyOnSeverity: v.optional(v.string()),
    suppressDuplicates: v.optional(v.boolean()),
    cooldownMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check cluster size threshold
    if (args.clusterSize !== undefined && args.notifyOnClusterSize !== undefined) {
      if (args.clusterSize < args.notifyOnClusterSize) return null;
    }

    // Check severity threshold
    if (args.clusterSeverity && args.notifyOnSeverity) {
      const severityOrder = ["critical", "high", "medium", "low"];
      const ci = severityOrder.indexOf(args.clusterSeverity);
      const mi = severityOrder.indexOf(args.notifyOnSeverity);
      if (ci > mi) return null;
    }

    // Check duplicate suppression
    if (args.suppressDuplicates && args.clusterId) {
      const cooldownMs = (args.cooldownMinutes ?? 60) * 60 * 1000;
      const cutoff = Date.now() - cooldownMs;
      const recent = await ctx.db
        .query("notifications")
        .withIndex("by_workspace_status", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("status", "unread"),
        )
        .filter((q) => q.gt(q.field("_creationTime"), cutoff))
        .collect();
      for (const n of recent) {
        const data = n.actionData as Record<string, unknown> | null;
        if (data?.clusterId === args.clusterId) return null;
      }
    }

    return await ctx.db.insert("notifications", {
      workspaceId: args.workspaceId,
      type: args.type,
      priority: args.priority ?? "medium",
      title: args.title,
      message: args.message,
      status: "unread",
      projectId: args.projectId,
      actionType: args.actionType,
      actionData: {
        actionLabel: args.actionLabel,
        actionUrl: args.actionUrl,
        clusterId: args.clusterId,
        clusterSize: args.clusterSize,
        clusterSeverity: args.clusterSeverity,
        metadata: args.metadata,
      },
    });
  },
});
