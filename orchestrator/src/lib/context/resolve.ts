import { getKnowledgebaseEntries, getProject, getWorkspace, getDocuments } from "@/lib/db/queries";
import { resolveKnowledgePath, readKnowledgeFile } from "@/lib/knowledgebase";
import type { KnowledgebaseType, DocumentType } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import {
  getConvexProjectRuntimeContext,
  listConvexWorkspaceRuntimeContext,
} from "@/lib/convex/server";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

type RuntimeContextItem = {
  entityType: string;
  title: string;
  content: string;
  type?: string;
  projectId?: string;
};

const WORKSPACE_RUNTIME_TYPES = [
  "company_context",
  "strategic_guardrails",
  "personas",
];

function formatRuntimeItems(items: RuntimeContextItem[]): string {
  return items
    .map((item) => {
      const heading = item.entityType === "persona"
        ? `Persona: ${item.title}`
        : item.title;
      return `# ${heading}\n\n${item.content}`;
    })
    .join("\n\n---\n\n");
}

function filterProjectScopedItems(items: RuntimeContextItem[], projectId: string) {
  return items.filter((item) => item.projectId === projectId);
}

async function getConvexWorkspaceRuntimeItems(
  workspaceId: string,
  types?: string[],
): Promise<RuntimeContextItem[]> {
  try {
    const context = await listConvexWorkspaceRuntimeContext(workspaceId, types);
    return Array.isArray(context?.items) ? context.items : [];
  } catch {
    return [];
  }
}

/**
 * Load company context for PRD and other document generation.
 *
 * Priority:
 * 1. Convex graph-backed runtime memory
 * 2. Migration-only fallback to compatibility mirrors/files
 *
 * This ensures AI generation always has access to product vision,
 * strategic guardrails, and personas.
 */
export async function getWorkspaceContext(workspaceId: string) {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(
    workspaceId,
    WORKSPACE_RUNTIME_TYPES,
  );
  if (runtimeItems.length > 0) {
    return formatRuntimeItems(runtimeItems);
  }

  // Migration-only fallback while remaining file/db consumers are cut over.
  const entries = await getKnowledgebaseEntries(workspaceId);
  if (entries.length > 0) {
    return entries.map((e) => `# ${e.title}\n\n${e.content}`).join("\n\n");
  }

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  const contextTypes: KnowledgebaseType[] = [
    "company_context",
    "strategic_guardrails", 
    "personas",
  ];

  const contextParts: string[] = [];

  for (const type of contextTypes) {
    try {
      const filePath = resolveKnowledgePath(contextRoot, type);
      const content = await readKnowledgeFile(filePath);
      if (content) {
        const title = type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        contextParts.push(`# ${title}\n\n${content}`);
      }
    } catch (error) {
      console.warn(`Failed to load context file for ${type}:`, error);
    }
  }

  return contextParts.join("\n\n---\n\n");
}

/**
 * Get full project context including all existing documents.
 * This provides AI with research, existing PRD, etc. for context.
 */
export async function getProjectContext(projectId: string) {
  try {
    const runtimeContext = await getConvexProjectRuntimeContext(projectId);
    if (runtimeContext?.project) {
      const projectParts: string[] = [];
      projectParts.push(`# Project: ${runtimeContext.project.name}`);
      if (runtimeContext.project.description) {
        projectParts.push(`\n${runtimeContext.project.description}`);
      }
      if (runtimeContext.project.metadata?.tags?.length) {
        projectParts.push(`\nTags: ${runtimeContext.project.metadata.tags.join(", ")}`);
      }

      const projectItems = filterProjectScopedItems(runtimeContext.items ?? [], projectId);
      if (projectItems.length > 0) {
        projectParts.push(`\n${formatRuntimeItems(projectItems)}`);
      }

      return projectParts.join("\n");
    }
  } catch {
    // Migration-only fallback below.
  }

  const project = await getProject(projectId);
  if (!project) return "";
  const parts: string[] = [];

  // Project info
  parts.push(`# Project: ${project.name}`);
  if (project.description) {
    parts.push(`\n${project.description}`);
  }
  if (project.metadata?.tags?.length) {
    parts.push(`\nTags: ${project.metadata.tags.join(", ")}`);
  }

  // Get existing documents for context
  const docs = await getDocuments(projectId);
  
  // Include research if available (important for PRD generation)
  const research = docs.find((d) => d.type === "research");
  if (research?.content) {
    parts.push(`\n## Research\n\n${research.content}`);
  }

  return parts.join("\n");
}

/**
 * Get PRD-specific context including the PRD structure template.
 * This ensures generated PRDs follow the workspace's PRD format.
 */
export async function getPRDContext(workspaceId: string) {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(workspaceId, [
    "strategic_guardrails",
  ]);
  const guardrails = runtimeItems
    .filter((item) => item.type === "strategic_guardrails")
    .map((item) => item.content)
    .join("\n\n");
  if (guardrails) return guardrails;

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  try {
    const guardrailsPath = resolveKnowledgePath(contextRoot, "strategic_guardrails");
    const fallback = await readKnowledgeFile(guardrailsPath);
    if (fallback) return fallback;
  } catch {
    // Guardrails file not found, continue.
  }

  return "";
}

// ============================================
// GSD-INSPIRED VERIFICATION CONTEXT HELPERS
// ============================================

/**
 * Load personas content for verification checks.
 * Used by AI verification to check persona alignment.
 */
export async function getPersonasForVerification(workspaceId: string): Promise<string> {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(workspaceId, ["personas"]);
  const personas = runtimeItems
    .filter((item) => item.entityType === "persona" || item.type === "personas")
    .map((item) => `# ${item.title}\n\n${item.content}`)
    .join("\n\n---\n\n");
  if (personas) {
    return personas;
  }

  // Migration-only fallback.
  const entries = await getKnowledgebaseEntries(workspaceId);
  const personasEntry = entries.find((e) => e.type === "personas");
  if (personasEntry?.content) {
    return personasEntry.content;
  }

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  try {
    const filePath = resolveKnowledgePath(contextRoot, "personas");
    const content = await readKnowledgeFile(filePath);
    if (content) {
      return content;
    }
  } catch {
    // File not found, continue
  }

  return "";
}

/**
 * Load strategic guardrails for verification checks.
 * Used by AI verification to check strategic alignment.
 */
export async function getGuardrailsForVerification(workspaceId: string): Promise<string> {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(workspaceId, [
    "strategic_guardrails",
  ]);
  const guardrails = runtimeItems
    .filter((item) => item.type === "strategic_guardrails")
    .map((item) => item.content)
    .join("\n\n");
  if (guardrails) {
    return guardrails;
  }

  // Migration-only fallback.
  const entries = await getKnowledgebaseEntries(workspaceId);
  const guardrailsEntry = entries.find((e) => e.type === "strategic_guardrails");
  if (guardrailsEntry?.content) {
    return guardrailsEntry.content;
  }

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  try {
    const filePath = resolveKnowledgePath(contextRoot, "strategic_guardrails");
    const content = await readKnowledgeFile(filePath);
    if (content) {
      return content;
    }
  } catch {
    // File not found, continue
  }

  return "";
}

/**
 * Load company context (product vision) for verification checks.
 * Used by AI verification to ensure alignment with product direction.
 */
export async function getCompanyContextForVerification(workspaceId: string): Promise<string> {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(workspaceId, [
    "company_context",
  ]);
  const companyContext = runtimeItems
    .filter((item) => item.type === "company_context")
    .map((item) => item.content)
    .join("\n\n");
  if (companyContext) {
    return companyContext;
  }

  // Migration-only fallback.
  const entries = await getKnowledgebaseEntries(workspaceId);
  const companyEntry = entries.find((e) => e.type === "company_context");
  if (companyEntry?.content) {
    return companyEntry.content;
  }

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  try {
    const filePath = resolveKnowledgePath(contextRoot, "company_context");
    const content = await readKnowledgeFile(filePath);
    if (content) {
      return content;
    }
  } catch {
    // File not found, continue
  }

  return "";
}

/**
 * Load all verification context at once (personas, guardrails, company context).
 * Optimized helper to reduce multiple async calls.
 */
export async function getAllVerificationContext(workspaceId: string): Promise<{
  personas: string;
  guardrails: string;
  companyContext: string;
}> {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(
    workspaceId,
    WORKSPACE_RUNTIME_TYPES,
  );
  let personas = runtimeItems
    .filter((item) => item.entityType === "persona" || item.type === "personas")
    .map((item) => `# ${item.title}\n\n${item.content}`)
    .join("\n\n---\n\n");
  let guardrails = runtimeItems
    .filter((item) => item.type === "strategic_guardrails")
    .map((item) => item.content)
    .join("\n\n");
  let companyContext = runtimeItems
    .filter((item) => item.type === "company_context")
    .map((item) => item.content)
    .join("\n\n");

  if (personas && guardrails && companyContext) {
    return { personas, guardrails, companyContext };
  }

  // Migration-only fallback if Convex runtime context is unavailable or incomplete.
  const entries = await getKnowledgebaseEntries(workspaceId);
  personas ||= entries.find((e) => e.type === "personas")?.content || "";
  guardrails ||= entries.find((e) => e.type === "strategic_guardrails")?.content || "";
  companyContext ||= entries.find((e) => e.type === "company_context")?.content || "";

  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  if (!personas) {
    try {
      const filePath = resolveKnowledgePath(contextRoot, "personas");
      personas = await readKnowledgeFile(filePath);
    } catch { /* File not found */ }
  }
  
  if (!guardrails) {
    try {
      const filePath = resolveKnowledgePath(contextRoot, "strategic_guardrails");
      guardrails = await readKnowledgeFile(filePath);
    } catch { /* File not found */ }
  }
  
  if (!companyContext) {
    try {
      const filePath = resolveKnowledgePath(contextRoot, "company_context");
      companyContext = await readKnowledgeFile(filePath);
    } catch { /* File not found */ }
  }
  
  return { personas, guardrails, companyContext };
}

// ============================================
// STATE DOCUMENT MANAGEMENT
// ============================================

export interface ProjectStateUpdate {
  currentPhase: string;
  completedTasks: string[];
  blockers?: string[];
  decisions?: Array<{ decision: string; rationale: string; date: string }>;
  nextSteps?: string[];
}

/**
 * Get the current project state document
 */
export async function getProjectState(projectId: string): Promise<string | null> {
  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.projectId, projectId),
        eq(documents.type, "state" as DocumentType)
      )
    )
    .limit(1);
  
  return docs[0]?.content ?? null;
}

/**
 * Update or create the project state document
 */
export async function updateProjectState(
  projectId: string,
  update: ProjectStateUpdate
): Promise<void> {
  const now = new Date();
  
  const content = `# Project State

## Current Phase
${update.currentPhase}

## Completed Tasks
${update.completedTasks.length > 0 
  ? update.completedTasks.map(t => `- [x] ${t}`).join('\n')
  : '_No tasks completed yet_'}

## Blockers
${update.blockers && update.blockers.length > 0
  ? update.blockers.map(b => `- ${b}`).join('\n')
  : '_None_'}

## Decisions
${update.decisions && update.decisions.length > 0
  ? update.decisions.map(d => `- **${d.decision}** (${d.date})\n  - Rationale: ${d.rationale}`).join('\n')
  : '_None yet_'}

## Next Steps
${update.nextSteps && update.nextSteps.length > 0
  ? update.nextSteps.map(s => `- [ ] ${s}`).join('\n')
  : '_TBD_'}

---
_Last updated: ${now.toISOString()}_
`;

  // Check if state document exists
  const existing = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.projectId, projectId),
        eq(documents.type, "state" as DocumentType)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(documents)
      .set({
        content,
        version: (existing[0].version || 1) + 1,
        updatedAt: now,
      })
      .where(eq(documents.id, existing[0].id));
  } else {
    // Create new
    const project = await getProject(projectId);
    const projectSlug = project?.name?.toLowerCase().replace(/\s+/g, '-') || 'project';
    
    await db.insert(documents).values({
      id: `doc_${nanoid()}`,
      projectId,
      type: "state" as DocumentType,
      title: "Project State",
      content,
      version: 1,
      filePath: `initiatives/${projectSlug}/state.md`,
      metadata: {
        generatedBy: "ai",
        actualType: "state",
      },
      createdAt: now,
      updatedAt: now,
    });
  }
}

/**
 * Get the document by type for a project
 */
export async function getDocumentByType(
  projectId: string,
  docType: DocumentType
): Promise<typeof documents.$inferSelect | null> {
  const docs = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.projectId, projectId),
        eq(documents.type, docType)
      )
    )
    .limit(1);
  
  return docs[0] ?? null;
}
