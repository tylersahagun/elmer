/**
 * Batch import helpers for seeding Convex from local data.
 * Called by scripts/seed-pm-workspace.mjs during initial setup.
 * These are public actions (no Clerk auth required) guarded by a seed key.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const batchImport = action({
  args: {
    workspaceId: v.id("workspaces"),
    // Array of { type, title, content, filePath }
    knowledgebaseEntries: v.array(
      v.object({
        type: v.string(),
        title: v.string(),
        content: v.string(),
        filePath: v.optional(v.string()),
      }),
    ),
    // Array of { slug, name, stage, priority, status, metadata }
    projects: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        stage: v.optional(v.string()),
        priority: v.optional(v.string()),
        status: v.optional(v.string()),
        description: v.optional(v.string()),
        metadata: v.optional(v.any()),
      }),
    ),
    // Array of { projectSlug, type, title, content }
    documents: v.array(
      v.object({
        projectSlug: v.string(),
        type: v.string(),
        title: v.string(),
        content: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const results = { kb: 0, projects: 0, documents: 0, errors: 0 };

    // ── Knowledgebase entries ──────────────────────────────────────────────
    for (const entry of args.knowledgebaseEntries) {
      try {
        await ctx.runMutation(api.knowledgebase.upsert, {
          workspaceId: args.workspaceId,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          filePath: entry.filePath,
        });
        results.kb++;
      } catch { results.errors++; }
    }

    // ── Projects ───────────────────────────────────────────────────────────
    const projectIdMap: Record<string, string> = {};
    const existingProjects = await ctx.runQuery(api.projects.list, {
      workspaceId: args.workspaceId,
    });

    // Pre-populate map from existing DB projects so document-only batches work
    for (const p of existingProjects) {
      const slug = (p.metadata as Record<string, unknown> | undefined)?.slug as string | undefined;
      if (slug) projectIdMap[slug] = p._id;
    }

    for (const proj of args.projects) {
      try {
        const existing = existingProjects.find(
          (p: { _id: string; metadata?: unknown; stage: string; status: string; priority: string }) =>
            (p.metadata as Record<string, unknown> | undefined)?.slug === proj.slug,
        );

        if (existing) {
          projectIdMap[proj.slug] = existing._id;
          await ctx.runMutation(api.projects.update, {
            projectId: existing._id,
            stage: proj.stage ?? existing.stage,
            status: proj.status ?? existing.status,
            priority: proj.priority ?? existing.priority,
            metadata: { ...existing.metadata as Record<string, unknown>, ...(proj.metadata ?? {}), slug: proj.slug },
          });
        } else {
          const id = await ctx.runMutation(api.projects.create, {
            workspaceId: args.workspaceId,
            name: proj.name,
            description: proj.description,
            stage: proj.stage ?? "inbox",
            priority: proj.priority ?? "P2",
            metadata: { ...(proj.metadata ?? {}), slug: proj.slug, syncedFromPmWorkspace: true },
          });
          projectIdMap[proj.slug] = id;
          results.projects++;
        }
      } catch { results.errors++; }
    }

    // ── Documents ──────────────────────────────────────────────────────────
    for (const doc of args.documents) {
      try {
        const projectId = projectIdMap[doc.projectSlug];
        if (!projectId) continue;

        const existing = await ctx.runQuery(api.documents.getByType, {
          projectId: projectId as Id<"projects">,
          type: doc.type,
        });

        if (existing) {
          await ctx.runMutation(api.documents.update, {
            documentId: existing._id,
            content: doc.content,
            title: doc.title,
          });
        } else {
          await ctx.runMutation(api.documents.create, {
            workspaceId: args.workspaceId,
            projectId: projectId as Id<"projects">,
            type: doc.type,
            title: doc.title,
            content: doc.content,
            generatedByAgent: "pm-workspace-seed",
          });
        }
        results.documents++;
      } catch { results.errors++; }
    }

    return results;
  },
});
