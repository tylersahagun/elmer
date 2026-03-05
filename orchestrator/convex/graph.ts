/**
 * Memory Graph — queries and mutations for the 5 graph tables.
 *
 * The memory graph connects every entity in Elmer (projects, documents,
 * signals, agent definitions) into a web of weighted nodes and edges.
 * It implements learning via access reinforcement and time-based decay.
 *
 * Tables: graphNodes, graphEdges, graphObservations, graphCommunities, graphEvents
 *
 * Full graph population and traversal algorithms land in Phase 2 (GTM-44–47).
 * This module provides the CRUD layer that Phase 1 agents and Phase 2 sync use.
 */

import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// ── Graph Nodes ───────────────────────────────────────────────────────────────

export const getNode = query({
  args: { nodeId: v.id("graphNodes") },
  handler: async (ctx, { nodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.get(nodeId);
  },
});

export const listNodesByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
  },
  handler: async (ctx, { workspaceId, entityType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphNodes")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("entityType", entityType),
      )
      .filter((q) => q.eq(q.field("validTo"), undefined))
      .collect();
  },
});

export const getNodeByEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, { entityType, entityId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphNodes")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", entityType).eq("entityId", entityId),
      )
      .first();
  },
});

export const createNode = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    name: v.string(),
    domain: v.optional(v.string()),
    accessWeight: v.optional(v.number()),
    decayRate: v.optional(v.number()),
    metadata: v.optional(v.any()),
    neonNodeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent: return existing node if entity already has one
    if (args.entityId) {
      const existing = await ctx.db
        .query("graphNodes")
        .withIndex("by_entity", (q) =>
          q.eq("entityType", args.entityType).eq("entityId", args.entityId!),
        )
        .first();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("graphNodes", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      name: args.name,
      domain: args.domain,
      accessWeight: args.accessWeight ?? 1.0,
      decayRate: args.decayRate ?? 0.01,
      metadata: args.metadata,
      neonNodeId: args.neonNodeId,
    });
  },
});

/** Reinforce a node's access weight when it's read (learning mechanism). */
export const reinforceNode = internalMutation({
  args: { nodeId: v.id("graphNodes") },
  handler: async (ctx, { nodeId }) => {
    const node = await ctx.db.get(nodeId);
    if (!node) return;
    // accessWeight *= 1.1 + 0.1
    await ctx.db.patch(nodeId, {
      accessWeight: node.accessWeight * 1.1 + 0.1,
    });
  },
});

/** Daily decay cron: accessWeight *= (1 - decayRate). Archive if < 0.1. */
export const decayNodes = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const nodes = await ctx.db
      .query("graphNodes")
      .withIndex("by_workspace_type", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    let archived = 0;
    for (const node of nodes) {
      if (node.validTo) continue; // already archived
      const newWeight = node.accessWeight * (1 - node.decayRate);
      if (newWeight < 0.1) {
        await ctx.db.patch(node._id, { validTo: Date.now() });
        archived++;
      } else {
        await ctx.db.patch(node._id, { accessWeight: newWeight });
      }
    }
    return { archived };
  },
});

// ── Graph Edges ───────────────────────────────────────────────────────────────

export const getEdgesFrom = query({
  args: { fromNodeId: v.id("graphNodes") },
  handler: async (ctx, { fromNodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphEdges")
      .withIndex("by_from", (q) => q.eq("fromNodeId", fromNodeId))
      .collect();
  },
});

export const getEdgesTo = query({
  args: { toNodeId: v.id("graphNodes") },
  handler: async (ctx, { toNodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphEdges")
      .withIndex("by_to", (q) => q.eq("toNodeId", toNodeId))
      .collect();
  },
});

export const listEdgesByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    relationType: v.string(),
  },
  handler: async (ctx, { workspaceId, relationType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphEdges")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", workspaceId).eq("relationType", relationType),
      )
      .collect();
  },
});

export const createEdge = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    fromNodeId: v.id("graphNodes"),
    toNodeId: v.id("graphNodes"),
    relationType: v.string(),
    weight: v.optional(v.number()),
    confidence: v.optional(v.number()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotent: skip if edge already exists with same type
    const existing = await ctx.db
      .query("graphEdges")
      .withIndex("by_from", (q) => q.eq("fromNodeId", args.fromNodeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("toNodeId"), args.toNodeId),
          q.eq(q.field("relationType"), args.relationType),
        ),
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("graphEdges", {
      workspaceId: args.workspaceId,
      fromNodeId: args.fromNodeId,
      toNodeId: args.toNodeId,
      relationType: args.relationType,
      weight: args.weight ?? 1.0,
      confidence: args.confidence,
      source: args.source,
    });
  },
});

// ── Graph Observations ────────────────────────────────────────────────────────

export const getObservations = query({
  args: {
    nodeId: v.id("graphNodes"),
    depth: v.optional(v.number()),
  },
  handler: async (ctx, { nodeId, depth }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("graphObservations")
      .withIndex("by_node", (q) => q.eq("nodeId", nodeId))
      .collect();
    // Filter to non-superseded observations, optionally by depth
    const active = all.filter((o) => !o.supersededBy);
    if (depth !== undefined) return active.filter((o) => o.depth === depth);
    return active;
  },
});

export const addObservation = internalMutation({
  args: {
    nodeId: v.id("graphNodes"),
    workspaceId: v.id("workspaces"),
    depth: v.number(),
    content: v.string(),
    supersede: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // If supersede=true, mark existing observations at same depth as superseded
    if (args.supersede) {
      const existing = await ctx.db
        .query("graphObservations")
        .withIndex("by_node", (q) => q.eq("nodeId", args.nodeId))
        .filter((q) =>
          q.and(
            q.eq(q.field("depth"), args.depth),
            q.eq(q.field("supersededBy"), undefined),
          ),
        )
        .collect();

      const newId = await ctx.db.insert("graphObservations", {
        nodeId: args.nodeId,
        workspaceId: args.workspaceId,
        depth: args.depth,
        content: args.content,
      });

      for (const obs of existing) {
        await ctx.db.patch(obs._id, { supersededBy: newId });
      }
      return newId;
    }

    return await ctx.db.insert("graphObservations", {
      nodeId: args.nodeId,
      workspaceId: args.workspaceId,
      depth: args.depth,
      content: args.content,
    });
  },
});

// ── Graph Communities ─────────────────────────────────────────────────────────

export const listCommunities = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphCommunities")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const upsertCommunity = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    theme: v.optional(v.string()),
    memberCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("graphCommunities")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: args.theme,
        memberCount: args.memberCount,
      });
      return existing._id;
    }

    return await ctx.db.insert("graphCommunities", {
      workspaceId: args.workspaceId,
      name: args.name,
      theme: args.theme,
      memberCount: args.memberCount,
    });
  },
});

// ── Graph Events ──────────────────────────────────────────────────────────────

export const listEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db
      .query("graphEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit ?? 50);
  },
});

export const recordEvent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    eventType: v.string(),
    entityId: v.optional(v.string()),
    actor: v.optional(v.string()),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("graphEvents", {
      workspaceId: args.workspaceId,
      eventType: args.eventType,
      entityId: args.entityId,
      actor: args.actor,
      details: args.details,
    });
  },
});

// ── Auto-graph helpers (called when entities are created) ─────────────────────

/**
 * Auto-create a graph node when a signal is created, plus `linked_to` edges
 * to any projects it's linked to via signalProjects.
 */
export const autoCreateSignalNode = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    signalId: v.id("signals"),
    verbatim: v.string(),
    source: v.string(),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent
    const existing = await ctx.db
      .query("graphNodes")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "signal").eq("entityId", args.signalId as unknown as string),
      )
      .first();
    if (existing) return existing._id;

    // Truncate verbatim for the node name (graph names should be concise)
    const name = args.verbatim.length > 80
      ? args.verbatim.slice(0, 77) + "..."
      : args.verbatim;

    return await ctx.db.insert("graphNodes", {
      workspaceId: args.workspaceId,
      entityType: "signal",
      entityId: args.signalId as unknown as string,
      name,
      domain: args.source,
      accessWeight: 1.0,
      decayRate: 0.02, // signals decay faster than projects/docs
      metadata: { severity: args.severity },
    });
  },
});

/**
 * Create a `linked_to` edge from a signal node to a project node.
 * Called after signals.linkToProject succeeds.
 */
export const linkSignalToProjectNode = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    signalId: v.id("signals"),
    projectId: v.id("projects"),
    confidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const signalNode = await ctx.db
      .query("graphNodes")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "signal").eq("entityId", args.signalId as unknown as string),
      )
      .first();

    const projectNode = await ctx.db
      .query("graphNodes")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "project").eq("entityId", args.projectId as unknown as string),
      )
      .first();

    if (!signalNode || !projectNode) return null;

    // Idempotent
    const existing = await ctx.db
      .query("graphEdges")
      .withIndex("by_from", (q) => q.eq("fromNodeId", signalNode._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("toNodeId"), projectNode._id),
          q.eq(q.field("relationType"), "linked_to"),
        ),
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("graphEdges", {
      workspaceId: args.workspaceId,
      fromNodeId: signalNode._id,
      toNodeId: projectNode._id,
      relationType: "linked_to",
      weight: args.confidence ?? 1.0,
      confidence: args.confidence,
      source: "agent",
    });
  },
});

/**
 * Auto-create a graph node when a project is created.
 * Called from projects.create — Phase 2 will wire this.
 */
export const autoCreateProjectNode = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, { workspaceId, projectId, projectName }) => {
    return await ctx.db.insert("graphNodes", {
      workspaceId,
      entityType: "project",
      entityId: projectId,
      name: projectName,
      accessWeight: 1.0,
      decayRate: 0.005,
    });
  },
});

/**
 * Auto-create a graph node when a document is created, with a
 * `produced_for` edge back to the project node.
 */
export const autoCreateDocumentNode = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    documentId: v.id("documents"),
    documentTitle: v.string(),
    documentType: v.string(),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const docNodeId = await ctx.db.insert("graphNodes", {
      workspaceId: args.workspaceId,
      entityType: "document",
      entityId: args.documentId,
      name: args.documentTitle,
      domain: args.documentType,
      accessWeight: 1.0,
      decayRate: 0.01,
    });

    // Find or create the project node
    const projectNode = await ctx.db
      .query("graphNodes")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", "project").eq("entityId", args.projectId as unknown as string),
      )
      .first();

    if (projectNode) {
      await ctx.db.insert("graphEdges", {
        workspaceId: args.workspaceId,
        fromNodeId: docNodeId,
        toNodeId: projectNode._id,
        relationType: "produced_for",
        weight: 1.0,
        source: "agent",
      });
    }

    return docNodeId;
  },
});
