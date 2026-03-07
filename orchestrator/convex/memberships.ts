import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ROLE_ORDER = ["viewer", "member", "admin"] as const;

function hasRole(current: string, required: string) {
  return ROLE_ORDER.indexOf(current as (typeof ROLE_ORDER)[number]) >=
    ROLE_ORDER.indexOf(required as (typeof ROLE_ORDER)[number]);
}

export const getMyMembership = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", identity.subject).eq("workspaceId", workspaceId),
      )
      .unique();
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", identity.subject).eq("workspaceId", workspaceId),
      )
      .unique();
    if (!membership || !hasRole(membership.role, "viewer")) {
      throw new Error("Not authorized");
    }
    return await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", args.clerkUserId).eq("workspaceId", args.workspaceId),
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("workspaceMembers", {
      ...args,
      joinedAt: Date.now(),
    });
  },
});

export const getByClerkForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    clerkUserId: v.string(),
  },
  handler: async (ctx, { workspaceId, clerkUserId }) => {
    return await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("workspaceId", workspaceId),
      )
      .unique();
  },
});
