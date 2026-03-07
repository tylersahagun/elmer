import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  buildLegacySearchBuckets,
  buildProjectRuntimeItems,
  buildWorkspaceContextItems,
  isWorkspaceAuthorityContextItem,
  loadWorkspaceGraphNodeMap,
  matchesRuntimeContextTypes,
  sortRuntimeRecords,
  upsertPromotedMirrorNode,
} from "./runtimeMemory";

function buildMemoryNodeTitle(type: string, content: string) {
  const label = type.replace(/_/g, " ");
  const firstLine = content.trim().split("\n")[0] ?? "";
  const preview = firstLine.length > 64 ? `${firstLine.slice(0, 61)}...` : firstLine;
  return `${label}: ${preview || "entry"}`;
}

async function insertMemoryEntry(
  ctx: any,
  args: {
    workspaceId: Id<"workspaces">;
    projectId?: Id<"projects">;
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  },
) {
  const entryId = await ctx.db.insert("memoryEntries", {
    workspaceId: args.workspaceId,
    projectId: args.projectId,
    type: args.type,
    content: args.content,
    metadata: args.metadata,
  });

  await upsertPromotedMirrorNode(ctx as never, {
    workspaceId: args.workspaceId,
    entityType: "memory",
    entityId: entryId,
    title: buildMemoryNodeTitle(args.type, args.content),
    content: args.content,
    domain: args.type,
    mirrorTable: "memoryEntries",
    mirrorId: entryId,
    projectId: args.projectId,
    metadataSource:
      typeof args.metadata?.source === "string" ? args.metadata.source : undefined,
    provenanceSource:
      typeof args.metadata?.source === "string" ? args.metadata.source : undefined,
    actor:
      typeof args.metadata?.actor === "string" ? args.metadata.actor : undefined,
    sourceArtifactId:
      typeof args.metadata?.sourceArtifactId === "string"
        ? args.metadata.sourceArtifactId
        : typeof args.metadata?.path === "string"
          ? args.metadata.path
          : typeof args.metadata?.url === "string"
            ? args.metadata.url
            : undefined,
    decayRate: 0.015,
  });

  return entryId;
}

export const store = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await insertMemoryEntry(ctx, args);
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_project", (queryBuilder) => queryBuilder.eq("projectId", projectId))
      .collect();
    if (type) return all.filter((entry) => entry.type === type);
    return all;
  },
});

export const listByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, type }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const all = await ctx.db
      .query("memoryEntries")
      .withIndex("by_workspace", (queryBuilder) => queryBuilder.eq("workspaceId", workspaceId))
      .collect();
    if (type) return all.filter((entry) => entry.type === type);
    return all;
  },
});

export const listWorkspaceRuntimeContext = query({
  args: {
    workspaceId: v.id("workspaces"),
    types: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { workspaceId, types }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const graphNodeMap = await loadWorkspaceGraphNodeMap(ctx, workspaceId);
    const items = await buildWorkspaceContextItems(ctx, workspaceId, graphNodeMap);
    const filtered = types?.length
      ? items.filter((item) => matchesRuntimeContextTypes(item, types))
      : items;

    return {
      items: filtered,
      ...buildLegacySearchBuckets(filtered),
    };
  },
});

export const getProjectRuntimeContext = query({
  args: {
    projectId: v.id("projects"),
    q: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, q }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const project = await ctx.db.get(projectId);
    if (!project) return null;

    const graphNodeMap = await loadWorkspaceGraphNodeMap(ctx, project.workspaceId);
    const [workspaceItems, projectItems] = await Promise.all([
      buildWorkspaceContextItems(ctx as never, project.workspaceId, graphNodeMap, q),
      buildProjectRuntimeItems(ctx as never, projectId, graphNodeMap, q),
    ]);

    const items = sortRuntimeRecords([
      ...workspaceItems.filter((item) => isWorkspaceAuthorityContextItem(item)),
      ...projectItems,
    ]);

    return {
      project,
      items,
      ...buildLegacySearchBuckets(items),
      signals: items
        .filter((item) => item.entityType === "signal")
        .map((item) => ({
          id: item.id,
          content: item.content,
          type: item.type,
          provenance: item.provenance,
          promotionState: item.promotionState,
        })),
    };
  },
});

export const storeEntry = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await insertMemoryEntry(ctx, args);
  },
});
