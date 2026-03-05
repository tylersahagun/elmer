import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.query("workspaces").collect();
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(workspaceId);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    githubRepo: v.optional(v.string()),
    settings: v.optional(v.any()),
    clerkOrgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Ensure slug is unique
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error(`Workspace slug "${args.slug}" already taken`);

    return await ctx.db.insert("workspaces", {
      name: args.name,
      slug: args.slug,
      githubRepo: args.githubRepo,
      settings: args.settings ?? {},
      clerkOrgId: args.clerkOrgId,
    });
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, { workspaceId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const updates: Record<string, unknown> = {};
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.githubRepo !== undefined) updates.githubRepo = patch.githubRepo;
    if (patch.settings !== undefined) updates.settings = patch.settings;
    await ctx.db.patch(workspaceId, updates);
    return await ctx.db.get(workspaceId);
  },
});
