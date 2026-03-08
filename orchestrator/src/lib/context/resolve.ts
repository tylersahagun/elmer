import {
  getConvexProjectRuntimeContext,
  getConvexProjectWithDocuments,
  listConvexWorkspaceRuntimeContext,
} from "@/lib/convex/server";
import type { DocumentType } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

type RuntimeContextItem = {
  entityType: string;
  title: string;
  content: string;
  type?: string;
  projectId?: string;
};

type ConvexProjectDocument = {
  type: string;
  content: string;
};

type ConvexProjectBundle = {
  project: {
    name: string;
    description?: string;
    metadata?: {
      tags?: string[];
    };
  } | null;
  documents: ConvexProjectDocument[];
};

const WORKSPACE_RUNTIME_TYPES = [
  "company_context",
  "strategic_guardrails",
  "personas",
];

function joinSections(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n\n---\n\n");
}

function formatRuntimeItem(item: RuntimeContextItem) {
  const heading =
    item.entityType === "persona" ? `Persona: ${item.title}` : item.title;
  return `# ${heading}\n\n${item.content}`;
}

function formatRuntimeItems(items: RuntimeContextItem[]): string {
  return joinSections(items.map(formatRuntimeItem));
}

function filterProjectScopedItems(items: RuntimeContextItem[], projectId: string) {
  return items.filter((item) => item.projectId === projectId);
}

function matchesRuntimeType(item: RuntimeContextItem, type: string) {
  if (type === "personas") {
    return item.entityType === "persona" || item.type === "personas";
  }

  return item.type === type;
}

function requireRuntimeItems(
  context: { items?: RuntimeContextItem[] | unknown } | null | undefined,
  scope: string,
): RuntimeContextItem[] {
  if (!Array.isArray(context?.items)) {
    throw new Error(`${scope} runtime items unavailable`);
  }

  return context.items;
}

async function getConvexWorkspaceRuntimeItems(
  workspaceId: string,
  types?: string[],
): Promise<RuntimeContextItem[]> {
  const context = await listConvexWorkspaceRuntimeContext(workspaceId, types);
  return requireRuntimeItems(context, "Workspace");
}

function getRuntimeBodyContent(items: RuntimeContextItem[], type: string) {
  return joinSections(
    items.filter((item) => matchesRuntimeType(item, type)).map((item) => item.content),
  );
}

function getPersonasContent(items: RuntimeContextItem[]) {
  return joinSections(
    items
      .filter((item) => matchesRuntimeType(item, "personas"))
      .map(formatRuntimeItem),
  );
}

/**
 * Load canonical workspace context for generation and verification flows.
 */
export async function getWorkspaceContext(workspaceId: string) {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(
    workspaceId,
    WORKSPACE_RUNTIME_TYPES,
  );

  return formatRuntimeItems(runtimeItems);
}

/**
 * Get full project context including project-scoped runtime records.
 */
export async function getProjectContext(projectId: string) {
  const runtimeContext = await getConvexProjectRuntimeContext(projectId);
  if (!runtimeContext?.project) {
    throw new Error(`Project runtime context unavailable for ${projectId}`);
  }

  const parts: string[] = [];
  parts.push(`# Project: ${runtimeContext.project.name}`);

  if (runtimeContext.project.description) {
    parts.push(`\n${runtimeContext.project.description}`);
  }

  if (runtimeContext.project.metadata?.tags?.length) {
    parts.push(`\nTags: ${runtimeContext.project.metadata.tags.join(", ")}`);
  }

  const projectItems = filterProjectScopedItems(
    requireRuntimeItems(runtimeContext, "Project"),
    projectId,
  );
  if (projectItems.length > 0) {
    parts.push(`\n${formatRuntimeItems(projectItems)}`);
  }

  return parts.join("\n");
}

/**
 * Get PRD-specific context including strategic guardrails from canonical runtime memory.
 */
export async function getPRDContext(workspaceId: string) {
  const runtimeItems = await getConvexWorkspaceRuntimeItems(workspaceId, [
    "strategic_guardrails",
  ]);

  return getRuntimeBodyContent(runtimeItems, "strategic_guardrails");
}

// ============================================
// GSD-INSPIRED VERIFICATION CONTEXT HELPERS
// ============================================

/**
 * Load personas content for verification checks.
 * Used by AI verification to check persona alignment.
 */
export async function getPersonasForVerification(workspaceId: string): Promise<string> {
  const { personas } = await getAllVerificationContext(workspaceId);
  return personas;
}

/**
 * Load strategic guardrails for verification checks.
 * Used by AI verification to check strategic alignment.
 */
export async function getGuardrailsForVerification(workspaceId: string): Promise<string> {
  const { guardrails } = await getAllVerificationContext(workspaceId);
  return guardrails;
}

/**
 * Load company context (product vision) for verification checks.
 * Used by AI verification to ensure alignment with product direction.
 */
export async function getCompanyContextForVerification(
  workspaceId: string,
): Promise<string> {
  const { companyContext } = await getAllVerificationContext(workspaceId);
  return companyContext;
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

  return {
    personas: getPersonasContent(runtimeItems),
    guardrails: getRuntimeBodyContent(runtimeItems, "strategic_guardrails"),
    companyContext: getRuntimeBodyContent(runtimeItems, "company_context"),
  };
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
    const bundle = await getConvexProjectWithDocuments(projectId) as ConvexProjectBundle;
    const projectSlug =
      bundle?.project?.name?.toLowerCase().replace(/\s+/g, "-") || "project";

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
