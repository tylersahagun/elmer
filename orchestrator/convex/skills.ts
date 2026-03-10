import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (workspaceId) {
      return await ctx.db
        .query("skills")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
    }
    return await ctx.db.query("skills").collect();
  },
});

export const get = query({
  args: { id: v.id("skills") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(id);
  },
});

export const getByLegacyId = query({
  args: { legacyId: v.string() },
  handler: async (ctx, { legacyId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db.query("skills").collect();
    return all.find((s) => (s.metadata as Record<string, unknown> | null)?.legacyId === legacyId) ?? null;
  },
});

export const create = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    source: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    entrypoint: v.optional(v.string()),
    promptTemplate: v.optional(v.string()),
    trustLevel: v.string(),
    remoteMetadata: v.optional(v.any()),
    metadata: v.optional(v.any()),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    lastSynced: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("skills", {
      workspaceId: args.workspaceId,
      source: args.source,
      name: args.name,
      description: args.description,
      version: args.version,
      entrypoint: args.entrypoint,
      promptTemplate: args.promptTemplate,
      trustLevel: args.trustLevel,
      remoteMetadata: args.remoteMetadata,
      metadata: args.metadata,
      inputSchema: args.inputSchema,
      outputSchema: args.outputSchema,
      tags: args.tags ?? [],
      lastSynced: args.lastSynced,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("skills"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    promptTemplate: v.optional(v.string()),
    trustLevel: v.optional(v.string()),
    remoteMetadata: v.optional(v.any()),
    metadata: v.optional(v.any()),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    lastSynced: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(id);
  },
});

export const upsertByEntrypoint = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    entrypoint: v.string(),
    source: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    promptTemplate: v.optional(v.string()),
    trustLevel: v.string(),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    lastSynced: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("skills")
      .collect()
      .then((all) =>
        all.find(
          (s) =>
            s.entrypoint === args.entrypoint &&
            (!args.workspaceId || s.workspaceId === args.workspaceId),
        ),
      );
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        version: args.version,
        promptTemplate: args.promptTemplate,
        inputSchema: args.inputSchema,
        outputSchema: args.outputSchema,
        tags: args.tags ?? [],
        lastSynced: args.lastSynced,
      });
      return existing._id;
    }
    return await ctx.db.insert("skills", {
      workspaceId: args.workspaceId,
      source: args.source,
      name: args.name,
      description: args.description,
      version: args.version,
      entrypoint: args.entrypoint,
      promptTemplate: args.promptTemplate,
      trustLevel: args.trustLevel,
      inputSchema: args.inputSchema,
      outputSchema: args.outputSchema,
      tags: args.tags ?? [],
      lastSynced: args.lastSynced,
    });
  },
});
