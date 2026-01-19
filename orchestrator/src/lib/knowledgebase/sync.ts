/**
 * Knowledge Base Sync Utility
 * 
 * Scans markdown files in workspace's contextPaths and upserts them into
 * the knowledgebaseEntries table. This ensures the app's knowledge base
 * stays in sync with the filesystem.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgebaseType } from "@/lib/db/schema";
import { getWorkspace, upsertKnowledgebaseEntry } from "@/lib/db/queries";

// Default mapping of knowledgebase types to file paths (relative to contextPath)
export const DEFAULT_TYPE_FILES: Record<KnowledgebaseType, string> = {
  company_context: "company-context/product-vision.md",
  strategic_guardrails: "company-context/strategic-guardrails.md",
  personas: "company-context/personas.md",
  roadmap: "roadmap/roadmap.md",
  rules: ".cursor/rules/command-router.mdc",
};

// Human-readable titles for each type
const TYPE_TITLES: Record<KnowledgebaseType, string> = {
  company_context: "Product Vision",
  strategic_guardrails: "Strategic Guardrails",
  personas: "Personas",
  roadmap: "Product Roadmap",
  rules: "Workspace Rules",
};

// Alternative file names that map to the same types
const ALTERNATIVE_FILE_NAMES: Record<string, KnowledgebaseType> = {
  "product-vision.md": "company_context",
  "vision.md": "company_context",
  "strategic-guardrails.md": "strategic_guardrails",
  "guardrails.md": "strategic_guardrails",
  "personas.md": "personas",
  "roadmap.md": "roadmap",
  "workspace-rules.md": "rules",
  "command-router.mdc": "rules",
};

/**
 * Get the workspace root directory (parent of orchestrator)
 */
function getWorkspaceRoot(): string {
  return path.resolve(process.cwd(), "..");
}

/**
 * Resolve a repo path (handles absolute and relative paths)
 */
function resolveRepoPath(repoPath?: string): string | null {
  if (!repoPath) return null;
  if (path.isAbsolute(repoPath)) return repoPath;
  return path.join(getWorkspaceRoot(), repoPath);
}

/**
 * Resolve a context path to an absolute path
 */
function resolveContextPath(contextPath: string, repoRoot?: string | null): string {
  if (path.isAbsolute(contextPath)) return contextPath;
  const base = repoRoot || getWorkspaceRoot();
  return path.join(base, contextPath);
}

/**
 * Read a file and return its content, or null if not found
 */
async function readFileContent(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

export interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  details: Array<{
    type: KnowledgebaseType;
    filePath: string;
    status: "synced" | "not_found" | "error";
    error?: string;
  }>;
}

/**
 * Sync knowledge base entries from filesystem to database for a workspace
 */
export async function syncKnowledgeBase(workspaceId: string): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  // Get workspace configuration
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) {
    result.errors.push("Workspace not found");
    return result;
  }

  // Resolve repo root
  const repoRoot = resolveRepoPath(workspace.githubRepo ?? undefined);

  // Get context paths (use array or legacy single path)
  const contextPaths = workspace.settings?.contextPaths?.length
    ? workspace.settings.contextPaths
    : workspace.contextPath
      ? [workspace.contextPath]
      : ["elmer-docs/"];

  // Get custom knowledgebase mapping if configured
  const customMapping = workspace.settings?.knowledgebaseMapping || {};

  // Build effective type-to-file mapping (custom overrides defaults)
  const effectiveMapping: Record<KnowledgebaseType, string> = {
    ...DEFAULT_TYPE_FILES,
  };
  
  // Apply custom mappings
  for (const [type, filePath] of Object.entries(customMapping)) {
    if (type in effectiveMapping && filePath) {
      effectiveMapping[type as KnowledgebaseType] = filePath;
    }
  }

  // Process each knowledgebase type
  const knowledgebaseTypes: KnowledgebaseType[] = [
    "company_context",
    "strategic_guardrails",
    "personas",
    "roadmap",
    "rules",
  ];

  for (const type of knowledgebaseTypes) {
    const relativePath = effectiveMapping[type];
    const title = TYPE_TITLES[type];

    // Try to find the file in each context path
    let found = false;
    let lastError: string | undefined;

    for (const contextPath of contextPaths) {
      const resolvedContextPath = resolveContextPath(contextPath, repoRoot);
      
      // Handle special case for rules (stored in .cursor/rules, not in context path)
      let fullPath: string;
      if (type === "rules" && relativePath.startsWith(".cursor/")) {
        // Rules are stored relative to repo root, not context path
        const base = repoRoot || getWorkspaceRoot();
        fullPath = path.join(base, relativePath);
      } else {
        fullPath = path.join(resolvedContextPath, relativePath);
      }

      const content = await readFileContent(fullPath);

      if (content !== null) {
        try {
          await upsertKnowledgebaseEntry({
            workspaceId,
            type,
            title,
            content,
            filePath: fullPath,
          });
          
          result.synced++;
          result.details.push({
            type,
            filePath: fullPath,
            status: "synced",
          });
          found = true;
          break; // Found in this context path, no need to check others
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Unknown error";
          // Continue to next context path
        }
      }
    }

    if (!found) {
      result.skipped++;
      
      if (lastError) {
        result.errors.push(`${type}: ${lastError}`);
        result.details.push({
          type,
          filePath: effectiveMapping[type],
          status: "error" as const,
          error: lastError,
        });
      } else {
        result.details.push({
          type,
          filePath: effectiveMapping[type],
          status: "not_found" as const,
        });
      }
    }
  }

  return result;
}

/**
 * Get resolved paths for a workspace (for UI display)
 */
export interface ResolvedPaths {
  contextPath: string | null;
  prototypesPath: string | null;
  repoPath: string | null;
}

export function getResolvedPaths(workspace: {
  githubRepo?: string | null;
  contextPath?: string | null;
  settings?: {
    contextPaths?: string[];
    prototypesPath?: string;
  } | null;
}): ResolvedPaths {
  const workspaceRoot = getWorkspaceRoot();

  // Resolve repo path
  let repoPath: string | null = null;
  if (workspace.githubRepo) {
    repoPath = path.isAbsolute(workspace.githubRepo)
      ? workspace.githubRepo
      : path.join(workspaceRoot, workspace.githubRepo);
  }

  // Resolve context path (primary one)
  let contextPath: string | null = null;
  const primaryContextPath = workspace.settings?.contextPaths?.[0] || workspace.contextPath;
  if (primaryContextPath) {
    contextPath = path.isAbsolute(primaryContextPath)
      ? primaryContextPath
      : path.join(repoPath || workspaceRoot, primaryContextPath);
  }

  // Resolve prototypes path
  let prototypesPath: string | null = null;
  const configuredPrototypesPath = workspace.settings?.prototypesPath || "src/components/prototypes";
  if (repoPath) {
    prototypesPath = path.isAbsolute(configuredPrototypesPath)
      ? configuredPrototypesPath
      : path.join(repoPath, configuredPrototypesPath);
  }

  return {
    contextPath,
    prototypesPath,
    repoPath,
  };
}
