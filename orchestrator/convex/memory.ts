import { query, mutation } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const store = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryEntries", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      content: args.content,
      metadata: args.metadata,
    });
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    if (type) return all.filter((e) => e.type === type);
    return all;
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    if (type) return all.filter((e) => e.type === type);
    return all;
  },
});

// Public mutation for agents to call from UI context
export const storeEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("memoryEntries", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      type: args.type,
      content: args.content,
      metadata: args.metadata,
    });
  },
});
