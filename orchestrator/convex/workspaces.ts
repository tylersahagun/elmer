import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  canUseCoordinatorViewerAccess,
  DEFAULT_COORDINATOR_WORKSPACE_ID,
} from "../src/lib/auth/coordinator-viewer";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) => q.eq("clerkUserId", identity.subject))
      .collect();
    if (memberships.length === 0) {
      const defaultWorkspace = await ctx.db.get(
        DEFAULT_COORDINATOR_WORKSPACE_ID as never,
      );
      const defaultWorkspaceMembers = defaultWorkspace
        ? await ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace", (q) =>
              q.eq(
                "workspaceId",
                DEFAULT_COORDINATOR_WORKSPACE_ID as never,
              ),
            )
            .collect()
        : [];
      if (
        defaultWorkspace &&
        canUseCoordinatorViewerAccess({
          workspaceId: DEFAULT_COORDINATOR_WORKSPACE_ID,
          clerkUserId: identity.subject,
          email: (identity as Record<string, unknown>).email as string | undefined,
          convexMembersCount: defaultWorkspaceMembers.length,
        })
      ) {
        return [defaultWorkspace];
      }
    }
    const workspaces = await Promise.all(
      memberships.map((membership) => ctx.db.get(membership.workspaceId)),
    );
    return workspaces.filter(Boolean);
  },
});

export const get = query({
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
    if (!membership) {
      const workspaceMembers = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      if (
        canUseCoordinatorViewerAccess({
          workspaceId,
          clerkUserId: identity.subject,
          email: (identity as Record<string, unknown>).email as string | undefined,
          convexMembersCount: workspaceMembers.length,
        })
      ) {
        return await ctx.db.get(workspaceId);
      }
      return null;
    }
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
    description: v.optional(v.string()),
    contextPath: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    settings: v.optional(v.any()),
    clerkOrgId: v.optional(v.string()),
    actorUserId: v.optional(v.string()),
    actorEmail: v.optional(v.string()),
    actorName: v.optional(v.string()),
    actorImage: v.optional(v.string()),
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

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      contextPath: args.contextPath ?? "elmer-docs/",
      githubRepo: args.githubRepo,
      settings: args.settings ?? {},
      clerkOrgId: args.clerkOrgId,
    });
    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: args.actorUserId,
      clerkUserId: identity.subject,
      email: args.actorEmail,
      displayName: args.actorName,
      image: args.actorImage,
      role: "admin",
      joinedAt: Date.now(),
    });
    return workspaceId;
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    contextPath: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    settings: v.optional(v.any()),
  },
  handler: async (ctx, { workspaceId, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_clerk_workspace", (q) =>
        q.eq("clerkUserId", identity.subject).eq("workspaceId", workspaceId),
      )
      .unique();
    if (!membership || membership.role !== "admin") {
      throw new Error("Not authorized");
    }
    const updates: Record<string, unknown> = {};
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.description !== undefined) updates.description = patch.description;
    if (patch.contextPath !== undefined) updates.contextPath = patch.contextPath;
    if (patch.githubRepo !== undefined) updates.githubRepo = patch.githubRepo;
    if (patch.settings !== undefined) updates.settings = patch.settings;
    await ctx.db.patch(workspaceId, updates);
    return await ctx.db.get(workspaceId);
  },
});
