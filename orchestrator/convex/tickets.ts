/**
 * Tickets — Convex-backed ticket management
 *
 * Replaces Postgres tickets / linearMappings tables.
 * Used by the ticket sync route and project detail pages.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ───────────────────────────────────────────────────────────────────

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("tickets")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("tickets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const get = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(ticketId);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("tickets", {
      ...args,
      status: args.status ?? "open",
    });
  },
});

export const updateLinearSync = mutation({
  args: {
    ticketId: v.id("tickets"),
    linearId: v.optional(v.string()),
    linearIdentifier: v.optional(v.string()),
    jiraId: v.optional(v.string()),
    jiraKey: v.optional(v.string()),
    syncStatus: v.string(), // "synced" | "failed"
    toolkit: v.string(),    // "linear" | "jira"
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { ticketId, linearId, linearIdentifier, jiraId, jiraKey, syncStatus, toolkit, metadata }) => {
    const existing = await ctx.db.get(ticketId);
    if (!existing) throw new Error("Ticket not found");

    const updates: Partial<{
      linearId: string;
      linearIdentifier: string;
      jiraId: string;
      jiraKey: string;
      metadata: unknown;
    }> = {};

    if (linearId) updates.linearId = linearId;
    if (linearIdentifier) updates.linearIdentifier = linearIdentifier;
    if (jiraId) updates.jiraId = jiraId;
    if (jiraKey) updates.jiraKey = jiraKey;

    const existingMeta = (existing.metadata as Record<string, unknown>) ?? {};
    updates.metadata = {
      ...existingMeta,
      ...(metadata as Record<string, unknown> ?? {}),
      ...(toolkit === "linear" ? { linearSyncStatus: syncStatus } : {}),
      ...(toolkit === "jira" ? { jiraSyncStatus: syncStatus } : {}),
    };

    await ctx.db.patch(ticketId, updates);
  },
});

export const remove = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(ticketId);
  },
});

export const linearMappingByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("linearMappings")
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .first();
  },
});
