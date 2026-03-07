import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limit = 20, offset = 0 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const rows = await ctx.db
      .query("activityLogs")
      .withIndex("by_workspace_created", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const sorted = rows.sort((a, b) => b.createdAt - a.createdAt);
    return sorted.slice(offset, offset + limit).map((row) => ({
      id: row._id,
      workspaceId: row.workspaceId,
      userId: row.userId ?? null,
      action: row.action,
      targetType: row.targetType ?? null,
      targetId: row.targetId ?? null,
      metadata: row.metadata ?? null,
      createdAt: new Date(row.createdAt).toISOString(),
      user: row.actorEmail || row.actorName || row.actorImage
        ? {
            id: row.userId ?? "unknown",
            name: row.actorName ?? null,
            email: row.actorEmail ?? "",
            image: row.actorImage ?? null,
          }
        : null,
    }));
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    actorName: v.optional(v.string()),
    actorEmail: v.optional(v.string()),
    actorImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
