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
