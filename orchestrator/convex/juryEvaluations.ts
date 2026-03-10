/**
 * Jury Evaluations — Convex-backed jury evaluation storage
 *
 * Replaces Postgres juryEvaluations table.
 * Records results from synthetic user jury evaluations run during the validate stage.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("juryEvaluations")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
    phase: v.string(),
    jurySize: v.number(),
    approvalRate: v.number(),
    conditionalRate: v.optional(v.number()),
    rejectionRate: v.optional(v.number()),
    verdict: v.string(),
    topConcerns: v.optional(v.array(v.string())),
    topSuggestions: v.optional(v.array(v.string())),
    rawResults: v.optional(v.any()),
    reportPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("juryEvaluations", args);
  },
});
