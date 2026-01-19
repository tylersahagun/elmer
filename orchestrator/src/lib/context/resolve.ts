import { getKnowledgebaseEntries, getProject, getWorkspace, getDocuments } from "@/lib/db/queries";
import { resolveKnowledgePath, readKnowledgeFile } from "@/lib/knowledgebase";
import type { KnowledgebaseType } from "@/lib/db/schema";

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
