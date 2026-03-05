import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (type) {
      return await ctx.db
        .query("agentDefinitions")
        .withIndex("by_workspace_type", (q) =>
          q.eq("workspaceId", workspaceId).eq("type", type),
        )
        .collect();
    }
    return await ctx.db
      .query("agentDefinitions")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("agentDefinitions") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(id);
  },
});

export const getByName = query({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, { workspaceId, name }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("agentDefinitions")
      .withIndex("by_name", (q) =>
        q.eq("workspaceId", workspaceId).eq("name", name),
      )
      .first();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
    enabled: v.optional(v.boolean()),
    phase: v.optional(v.string()),
    executionMode: v.optional(v.string()),
    requiredArtifacts: v.optional(v.array(v.string())),
    producedArtifacts: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("agentDefinitions")
      .withIndex("by_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        description: args.description,
        triggers: args.triggers,
        enabled: args.enabled ?? existing.enabled,
        phase: args.phase,
        executionMode: args.executionMode ?? existing.executionMode,
        requiredArtifacts: args.requiredArtifacts,
        producedArtifacts: args.producedArtifacts,
        metadata: args.metadata,
      });
      return existing._id;
    }

    return await ctx.db.insert("agentDefinitions", {
      workspaceId: args.workspaceId,
      name: args.name,
      type: args.type,
      content: args.content,
      description: args.description,
      triggers: args.triggers,
      enabled: args.enabled ?? true,
      phase: args.phase,
      executionMode: args.executionMode ?? "server",
      requiredArtifacts: args.requiredArtifacts,
      producedArtifacts: args.producedArtifacts,
      metadata: args.metadata,
    });
  },
});

export const setEnabled = mutation({
  args: {
    id: v.id("agentDefinitions"),
    enabled: v.boolean(),
  },
  handler: async (ctx, { id, enabled }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.patch(id, { enabled });
  },
});
