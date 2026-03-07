import {
  getConvexProjectWithDocuments,
  listConvexKnowledge,
  listConvexPersonas,
} from "@/lib/convex/server";
import type { KnowledgebaseType, DocumentType } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

type ConvexKnowledgeEntry = {
  type: string;
  title: string;
  content: string;
};

type ConvexPersona = {
  name: string;
  description: string;
  content?: string;
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

const KNOWLEDGE_CONTEXT_TYPES: KnowledgebaseType[] = [
  "company_context",
  "strategic_guardrails",
];

function formatKnowledgeEntry(entry: ConvexKnowledgeEntry) {
  return `# ${entry.title}\n\n${entry.content}`;
}

function formatPersona(persona: ConvexPersona) {
  if (persona.content?.trim()) {
    return persona.content.trim();
  }

  const description = persona.description?.trim();
  return description ? `# ${persona.name}\n\n${description}` : `# ${persona.name}`;
}

function joinSections(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join("\n\n---\n\n");
}

async function loadWorkspaceRuntimeContext(workspaceId: string) {
  const [knowledgeEntries, personas] = await Promise.all([
    listConvexKnowledge(workspaceId) as Promise<ConvexKnowledgeEntry[]>,
    listConvexPersonas(workspaceId) as Promise<ConvexPersona[]>,
  ]);

  return { knowledgeEntries, personas };
}

function getKnowledgeContent(
  knowledgeEntries: ConvexKnowledgeEntry[],
  type: KnowledgebaseType,
) {
  return joinSections(
    knowledgeEntries
      .filter((entry) => entry.type === type && entry.content?.trim())
      .map(formatKnowledgeEntry),
  );
}

function getKnowledgeBodyContent(
  knowledgeEntries: ConvexKnowledgeEntry[],
  type: KnowledgebaseType,
) {
  return joinSections(
    knowledgeEntries
      .filter((entry) => entry.type === type && entry.content?.trim())
      .map((entry) => entry.content),
  );
}

function getPersonasContent(
  knowledgeEntries: ConvexKnowledgeEntry[],
  personas: ConvexPersona[],
) {
  const personaSections = personas
    .map(formatPersona)
    .filter((content) => content.trim().length > 0);

  if (personaSections.length > 0) {
    return joinSections(personaSections);
  }

  return getKnowledgeBodyContent(knowledgeEntries, "personas");
}

/**
 * Load Convex-native workspace context for generation and verification flows.
 */
export async function getWorkspaceContext(workspaceId: string) {
  const { knowledgeEntries, personas } = await loadWorkspaceRuntimeContext(workspaceId);

  const knowledgeSections = KNOWLEDGE_CONTEXT_TYPES.map((type) =>
    getKnowledgeContent(knowledgeEntries, type),
  );
  const personasContent = getPersonasContent(knowledgeEntries, personas);

  return joinSections([...knowledgeSections, personasContent]);
}

/**
 * Get full project context including all existing documents.
 * This provides AI with research, existing PRD, etc. for context.
 */
export async function getProjectContext(projectId: string) {
  const bundle = await getConvexProjectWithDocuments(projectId) as ConvexProjectBundle | null;
  if (!bundle?.project) return "";

  const { project, documents: projectDocuments } = bundle;

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
  // Include research if available (important for PRD generation)
  const research = projectDocuments.find((doc) => doc.type === "research");
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
  const knowledgeEntries = await listConvexKnowledge(workspaceId) as ConvexKnowledgeEntry[];
  return getKnowledgeBodyContent(knowledgeEntries, "strategic_guardrails");
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
export async function getCompanyContextForVerification(workspaceId: string): Promise<string> {
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
  const { knowledgeEntries, personas } = await loadWorkspaceRuntimeContext(workspaceId);

  return {
    personas: getPersonasContent(knowledgeEntries, personas),
    guardrails: getKnowledgeBodyContent(knowledgeEntries, "strategic_guardrails"),
    companyContext: getKnowledgeBodyContent(knowledgeEntries, "company_context"),
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
