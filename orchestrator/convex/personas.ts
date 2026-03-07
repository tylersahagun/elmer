import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { upsertPromotedMirrorNode } from "./runtimeMemory";

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
      await upsertPromotedMirrorNode(ctx as never, {
        workspaceId: args.workspaceId,
        entityType: "persona",
        entityId: existing._id,
        title: args.name,
        content: args.content,
        domain: args.archetypeId,
        mirrorTable: "personas",
        mirrorId: existing._id,
        filePath: args.filePath,
        decayRate: 0.002,
      });
      return existing._id;
    }

    const id = await ctx.db.insert("personas", {
      ...args,
      version: 1,
    });
    await upsertPromotedMirrorNode(ctx as never, {
      workspaceId: args.workspaceId,
      entityType: "persona",
      entityId: id,
      title: args.name,
      content: args.content,
      domain: args.archetypeId,
      mirrorTable: "personas",
      mirrorId: id,
      filePath: args.filePath,
      decayRate: 0.002,
    });
    return id;
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
    const linkId = await ctx.db.insert("signalPersonas", args);
    const signal = await ctx.db.get(args.signalId);
    const persona = await ctx.db.get(args.personaId);
    if (signal && persona) {
      await ctx.scheduler.runAfter(0, internal.graph.linkSignalToPersonaNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        personaId: args.personaId,
      });
    }
    return linkId;
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
    const signal = await ctx.db.get(args.signalId);
    if (signal) {
      await ctx.scheduler.runAfter(0, internal.graph.unlinkSignalFromPersonaNode, {
        workspaceId: signal.workspaceId,
        signalId: args.signalId,
        personaId: args.personaId,
      });
    }
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
