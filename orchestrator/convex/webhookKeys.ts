/**
 * Webhook Keys — Convex-backed inbound webhook authentication.
 *
 * Replaces the Postgres `webhookKeys` table.
 * Each key is stored as a SHA-256 hash; the plaintext key is never persisted.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("webhookKeys")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const findByKeyHash = query({
  args: { keyHash: v.string() },
  handler: async (ctx, { keyHash }) => {
    return await ctx.db
      .query("webhookKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .unique();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    keyHash: v.string(),
    name: v.string(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("webhookKeys", {
      workspaceId: args.workspaceId,
      keyHash: args.keyHash,
      name: args.name,
      createdBy: args.createdBy ?? identity.subject,
    });
  },
});

export const recordUsage = mutation({
  args: { keyId: v.id("webhookKeys") },
  handler: async (ctx, { keyId }) => {
    await ctx.db.patch(keyId, { lastUsedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { keyId: v.id("webhookKeys") },
  handler: async (ctx, { keyId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.delete(keyId);
  },
});
