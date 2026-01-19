import { getKnowledgebaseEntries, getProject, getWorkspace, getDocuments } from "@/lib/db/queries";
import { resolveKnowledgePath, readKnowledgeFile } from "@/lib/knowledgebase";
import type { KnowledgebaseType, DocumentType } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Load company context for PRD and other document generation.
 * 
 * Priority:
 * 1. Database knowledgebase entries (if populated)
 * 2. File-based context from elmer-docs/company-context/
 * 
 * This ensures AI generation always has access to product vision,
 * strategic guardrails, and personas.
 */
export async function getWorkspaceContext(workspaceId: string) {
  // First, try database entries
  const entries = await getKnowledgebaseEntries(workspaceId);
  
  if (entries.length > 0) {
    return entries.map((e) => `# ${e.title}\n\n${e.content}`).join("\n\n");
  }

  // Fall back to reading files directly
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
  const workspace = await getWorkspace(workspaceId);
  const contextRoot = workspace?.contextPath || "elmer-docs/";

  // Load strategic guardrails which contain pushback triggers
  try {
    const guardrailsPath = resolveKnowledgePath(contextRoot, "strategic_guardrails");
    const guardrails = await readKnowledgeFile(guardrailsPath);
    if (guardrails) {
      return guardrails;
    }
  } catch {
    // Guardrails file not found, continue
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
  // First, try database entries
  const entries = await getKnowledgebaseEntries(workspaceId);
  const personasEntry = entries.find((e) => e.type === "personas");
  
  if (personasEntry?.content) {
    return personasEntry.content;
  }

  // Fall back to reading files directly
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
  // First, try database entries
  const entries = await getKnowledgebaseEntries(workspaceId);
  const guardrailsEntry = entries.find((e) => e.type === "strategic_guardrails");
  
  if (guardrailsEntry?.content) {
    return guardrailsEntry.content;
  }

  // Fall back to reading files directly
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
  // First, try database entries
  const entries = await getKnowledgebaseEntries(workspaceId);
  const companyEntry = entries.find((e) => e.type === "company_context");
  
  if (companyEntry?.content) {
    return companyEntry.content;
  }

  // Fall back to reading files directly
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
  // Try database entries first
  const entries = await getKnowledgebaseEntries(workspaceId);
  
  let personas = entries.find((e) => e.type === "personas")?.content || "";
  let guardrails = entries.find((e) => e.type === "strategic_guardrails")?.content || "";
  let companyContext = entries.find((e) => e.type === "company_context")?.content || "";
  
  // If any are missing from DB, try loading from files
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
