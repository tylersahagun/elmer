import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("personas")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getByArchetype = query({
  args: {
    workspaceId: v.id("workspaces"),
    archetypeId: v.string(),
  },
  handler: async (ctx, { workspaceId, archetypeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("personas")
      .withIndex("by_workspace_archetype", (q) =>
        q.eq("workspaceId", workspaceId).eq("archetypeId", archetypeId),
      )
      .unique();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    archetypeId: v.string(),
    name: v.string(),
    description: v.string(),
    role: v.any(),
    pains: v.array(v.string()),
    successCriteria: v.array(v.string()),
    evaluationHeuristics: v.array(v.string()),
    typicalTools: v.array(v.string()),
    fears: v.array(v.string()),
    psychographicRanges: v.any(),
    content: v.string(),
    filePath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("personas")
      .withIndex("by_workspace_archetype", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("archetypeId", args.archetypeId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        version: existing.version + 1,
      });
      return existing._id;
    }

    return await ctx.db.insert("personas", {
      ...args,
      version: 1,
    });
  },
});

export const linkSignal = mutation({
  args: {
    signalId: v.id("signals"),
    personaId: v.id("personas"),
    linkedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("personaId"), args.personaId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("signalPersonas", args);
  },
});

export const unlinkSignal = mutation({
  args: {
    signalId: v.id("signals"),
    personaId: v.id("personas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", args.signalId))
      .filter((q) => q.eq(q.field("personaId"), args.personaId))
      .unique();
    if (!existing) return null;
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

export const listSignalPersonas = query({
  args: { signalId: v.id("signals") },
  handler: async (ctx, { signalId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const links = await ctx.db
      .query("signalPersonas")
      .withIndex("by_signal", (q) => q.eq("signalId", signalId))
      .collect();
    const personas = await Promise.all(links.map((link) => ctx.db.get(link.personaId)));
    return links.map((link, index) => ({
      persona: personas[index],
      linkedAt: new Date(link._creationTime).toISOString(),
    })).filter((entry) => entry.persona);
  },
});
