/**
 * Project Commits — Convex-backed commit history
 *
 * Replaces Postgres projectCommits table.
 * Tracks git commits associated with projects for the project detail page.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { projectId, limit = 20, offset = 0 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const all = await ctx.db
      .query("projectCommits")
      .withIndex("by_project_committed", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    return {
      commits: all.slice(offset, offset + limit),
      total: all.length,
    };
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
    sha: v.string(),
    message: v.string(),
    author: v.optional(v.string()),
    committedAt: v.number(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("projectCommits", args);
  },
});
