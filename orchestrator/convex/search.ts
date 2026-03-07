import { query } from "./_generated/server";
import { v } from "convex/values";

function includesQuery(value: string | undefined, q: string) {
  return (value ?? "").toLowerCase().includes(q);
}

export const searchWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    q: v.string(),
  },
  handler: async (ctx, { workspaceId, q }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const normalized = q.trim().toLowerCase();
    if (!normalized) return { documents: [], memory: [], knowledgebase: [], personas: [] };

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_workspace", (queryBuilder) => queryBuilder.eq("workspaceId", workspaceId))
      .collect();
    const documents = (
      await Promise.all(
        projects.map((project) =>
          ctx.db
            .query("documents")
            .withIndex("by_project", (queryBuilder) => queryBuilder.eq("projectId", project._id))
            .collect(),
        ),
      )
    ).flat();

    const [memory, knowledgebase, personas] = await Promise.all([
      ctx.db
        .query("memoryEntries")
        .withIndex("by_workspace", (queryBuilder) => queryBuilder.eq("workspaceId", workspaceId))
        .collect(),
      ctx.db
        .query("knowledgebaseEntries")
        .withIndex("by_workspace_type", (queryBuilder) => queryBuilder.eq("workspaceId", workspaceId))
        .collect(),
      ctx.db
        .query("personas")
        .withIndex("by_workspace", (queryBuilder) => queryBuilder.eq("workspaceId", workspaceId))
        .collect(),
    ]);

    const docMatches = documents.filter((doc) =>
      includesQuery(doc.title, normalized) || includesQuery(doc.content, normalized),
    );
    const memoryMatches = memory.filter((entry) =>
      includesQuery(entry.content, normalized),
    );
    const kbMatches = knowledgebase.filter((entry) =>
      includesQuery(entry.title, normalized) || includesQuery(entry.content, normalized),
    );
    const personaMatches = personas.filter((persona) =>
      includesQuery(persona.name, normalized) ||
      includesQuery(persona.description, normalized) ||
      includesQuery(persona.content, normalized),
    );

    return {
      documents: docMatches.map((doc) => ({
        id: doc._id,
        projectId: doc.projectId,
        title: doc.title,
        content: doc.content,
        type: doc.type,
      })),
      memory: memoryMatches.map((entry) => ({
        id: entry._id,
        projectId: entry.projectId,
        content: entry.content,
        type: entry.type,
      })),
      knowledgebase: kbMatches.map((entry) => ({
        id: entry._id,
        title: entry.title,
        content: entry.content,
        type: entry.type,
      })),
      personas: personaMatches.map((persona) => ({
        id: persona._id,
        archetypeId: persona.archetypeId,
        name: persona.name,
        description: persona.description,
      })),
    };
  },
});
