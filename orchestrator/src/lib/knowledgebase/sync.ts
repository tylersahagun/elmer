/**
 * Knowledge Base Sync Utility
 *
 * Scans markdown files in workspace's contextPaths and upserts them into
 * the knowledgebaseEntries table. This ensures the app's knowledge base
 * stays in sync with the filesystem.
 *
 * Supports both single-file and folder-based sync:
 * - Single files for backward compatibility
 * - Full folder sync for importing entire directories (company-context/*, personas/*, etc.)
 */

import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import type { KnowledgebaseType } from "@/lib/db/schema";
import {
  getWorkspace,
  upsertKnowledgebaseEntry,
  upsertKnowledgebaseEntryByPath,
} from "@/lib/db/queries";

// Default mapping of knowledgebase types to file paths (relative to contextPath)
// Used for backward compatibility with single-file sync
export const DEFAULT_TYPE_FILES: Record<KnowledgebaseType, string> = {
  company_context: "company-context/product-vision.md",
  strategic_guardrails: "company-context/strategic-guardrails.md",
  personas: "company-context/personas.md",
  roadmap: "roadmap/roadmap.md",
  rules: ".cursor/rules/command-router.mdc",
};

// Folder patterns for each knowledge type - supports full folder sync
// Each type can have multiple folder paths to search
export const TYPE_FOLDER_PATTERNS: Record<KnowledgebaseType, string[]> = {
  company_context: ["company-context/"],
  strategic_guardrails: ["company-context/strategic-guardrails.md"], // Keep as single file
  personas: ["personas/", "company-context/personas/"],
  roadmap: ["roadmap/"],
  rules: [".cursor/rules/"],
};

// Human-readable titles for each type
const TYPE_TITLES: Record<KnowledgebaseType, string> = {
  company_context: "Company Context",
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
function resolveContextPath(
  contextPath: string,
  repoRoot?: string | null,
): string {
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

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function readGitHubFileContent(params: {
  octokit: Octokit;
  owner: string;
  repo: string;
  path: string;
  ref?: string;
}): Promise<string | null> {
  const { octokit, owner, repo, path: filePath, ref } = params;
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref,
    });
    if (Array.isArray(data) || !("content" in data)) return null;
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (error) {
    // Handle 404 (Not Found) and 403 (Forbidden) gracefully
    // Octokit throws RequestError with a status property
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 403) {
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * List files in a local directory (recursively)
 * Returns paths relative to the base directory
 */
async function listLocalFiles(
  dirPath: string,
  extensions: string[] = [".md", ".mdc"],
): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories
        if (entry.name.startsWith(".")) continue;
        // Recurse into subdirectories
        const subFiles = await listLocalFiles(fullPath, extensions);
        files.push(...subFiles.map((f) => path.join(entry.name, f)));
      } else if (entry.isFile()) {
        // Check file extension
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(entry.name);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Error listing directory ${dirPath}:`, error);
    }
  }

  return files;
}

/**
 * List files in a GitHub directory
 * Returns paths relative to the base directory
 */
async function listGitHubFiles(params: {
  octokit: Octokit;
  owner: string;
  repo: string;
  dirPath: string;
  ref?: string;
  extensions?: string[];
}): Promise<string[]> {
  const {
    octokit,
    owner,
    repo,
    dirPath,
    ref,
    extensions = [".md", ".mdc"],
  } = params;
  const files: string[] = [];

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: dirPath,
      ref,
    });

    if (!Array.isArray(data)) {
      // Single file, not a directory
      return [];
    }

    for (const item of data) {
      if (item.type === "dir") {
        // Skip hidden directories
        if (item.name.startsWith(".")) continue;
        // Recurse into subdirectories
        const subFiles = await listGitHubFiles({
          octokit,
          owner,
          repo,
          dirPath: item.path,
          ref,
          extensions,
        });
        files.push(...subFiles.map((f) => path.posix.join(item.name, f)));
      } else if (item.type === "file") {
        const ext = path.extname(item.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(item.name);
        }
      }
    }
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 404 && status !== 403) {
      console.error(`Error listing GitHub directory ${dirPath}:`, error);
    }
  }

  return files;
}

/**
 * Generate a human-readable title from a file path
 */
function generateTitleFromPath(filePath: string): string {
  // Get the filename without extension
  const basename = path.basename(filePath, path.extname(filePath));
  // Convert kebab-case or snake_case to Title Case
  return basename
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeRepoPath(value: string) {
  return value.replace(/^\/+/, "").replace(/^\.\//, "").replace(/\/+$/, "");
}

function dedupeRelativePath(contextPath: string, relativePath: string) {
  const normalizedContext = normalizeRepoPath(contextPath);
  const contextSegments = normalizedContext.split("/").filter(Boolean);
  const lastSegment = contextSegments[contextSegments.length - 1];
  if (lastSegment && relativePath.startsWith(`${lastSegment}/`)) {
    return relativePath.slice(lastSegment.length + 1);
  }
  return relativePath;
}

function parseRepoSlug(
  repoSlug?: string | null,
): { owner: string; repo: string } | null {
  if (!repoSlug) return null;
  const normalized = repoSlug
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "");
  const [owner, repo, ...rest] = normalized.split("/");
  if (!owner || !repo || rest.length > 0) return null;
  return { owner, repo };
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
 *
 * @param workspaceId - The workspace to sync
 * @param options.syncFullFolders - If true, sync all files in folders instead of single files per type
 */
export async function syncKnowledgeBase(
  workspaceId: string,
  options?: {
    octokit?: Octokit;
    repoRef?: string;
    repoOwner?: string;
    repoName?: string;
    contextPaths?: string[];
    syncFullFolders?: boolean;
  },
): Promise<SyncResult> {
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
  const repoRootExists = repoRoot ? await pathExists(repoRoot) : false;
  const repoMeta =
    options?.repoOwner && options?.repoName
      ? { owner: options.repoOwner, repo: options.repoName }
      : parseRepoSlug(workspace.githubRepo ?? undefined);
  const repoRef =
    options?.repoRef || workspace.settings?.baseBranch || undefined;
  const useGitHub = !repoRootExists && !!options?.octokit && !!repoMeta;

  // Get context paths (use array or legacy single path)
  const contextPaths = options?.contextPaths?.length
    ? options.contextPaths
    : workspace.settings?.contextPaths?.length
      ? workspace.settings.contextPaths
      : workspace.contextPath
        ? workspace.contextPath === "elmer-docs/" ||
          workspace.contextPath === "elmer-docs"
          ? ["pm-workspace-docs/", workspace.contextPath]
          : [workspace.contextPath]
        : ["pm-workspace-docs/", "elmer-docs/"];

  // Get custom knowledgebase mapping if configured
  const customMapping = workspace.settings?.knowledgebaseMapping || {};

  // Process each knowledgebase type
  const knowledgebaseTypes: KnowledgebaseType[] = [
    "company_context",
    "strategic_guardrails",
    "personas",
    "roadmap",
    "rules",
  ];

  // Use folder-based sync if enabled
  if (options?.syncFullFolders) {
    for (const type of knowledgebaseTypes) {
      const folderPatterns = TYPE_FOLDER_PATTERNS[type];

      for (const contextPath of contextPaths) {
        for (const pattern of folderPatterns) {
          try {
            // Check if pattern is a folder (ends with /) or a single file
            const isFolder = pattern.endsWith("/");

            if (isFolder) {
              // Sync all files in the folder
              const folderPath = pattern.slice(0, -1); // Remove trailing /

              if (useGitHub && repoMeta && options?.octokit) {
                const normalizedContextPath = normalizeRepoPath(contextPath);
                const fullFolderPath = normalizeRepoPath(
                  path.posix.join(normalizedContextPath, folderPath),
                );

                const files = await listGitHubFiles({
                  octokit: options.octokit,
                  owner: repoMeta.owner,
                  repo: repoMeta.repo,
                  dirPath: fullFolderPath,
                  ref: repoRef,
                });

                for (const file of files) {
                  const filePath = path.posix.join(fullFolderPath, file);
                  const content = await readGitHubFileContent({
                    octokit: options.octokit,
                    owner: repoMeta.owner,
                    repo: repoMeta.repo,
                    path: filePath,
                    ref: repoRef,
                  });

                  if (content !== null) {
                    const title = generateTitleFromPath(file);
                    const storedPath = `${repoMeta.owner}/${repoMeta.repo}:${filePath}`;

                    await upsertKnowledgebaseEntryByPath({
                      workspaceId,
                      type,
                      title,
                      content,
                      filePath: storedPath,
                    });

                    result.synced++;
                    result.details.push({
                      type,
                      filePath: filePath,
                      status: "synced",
                    });
                  }
                }
              } else {
                const resolvedContextPath = resolveContextPath(
                  contextPath,
                  repoRoot,
                );
                const fullFolderPath = path.join(
                  resolvedContextPath,
                  folderPath,
                );

                const files = await listLocalFiles(fullFolderPath);

                for (const file of files) {
                  const fullFilePath = path.join(fullFolderPath, file);
                  const content = await readFileContent(fullFilePath);

                  if (content !== null) {
                    const title = generateTitleFromPath(file);

                    await upsertKnowledgebaseEntryByPath({
                      workspaceId,
                      type,
                      title,
                      content,
                      filePath: fullFilePath,
                    });

                    result.synced++;
                    result.details.push({
                      type,
                      filePath: fullFilePath,
                      status: "synced",
                    });
                  }
                }
              }
            } else {
              // Single file pattern - use existing logic
              if (useGitHub && repoMeta && options?.octokit) {
                const normalizedContextPath = normalizeRepoPath(contextPath);
                const effectiveRelativePath = dedupeRelativePath(
                  normalizedContextPath,
                  pattern,
                );
                const relativeRepoPath =
                  type === "rules" && pattern.startsWith(".cursor/")
                    ? pattern
                    : normalizeRepoPath(
                        path.posix.join(
                          normalizedContextPath,
                          effectiveRelativePath,
                        ),
                      );

                const content = await readGitHubFileContent({
                  octokit: options.octokit,
                  owner: repoMeta.owner,
                  repo: repoMeta.repo,
                  path: relativeRepoPath,
                  ref: repoRef,
                });

                if (content !== null) {
                  const title = generateTitleFromPath(pattern);
                  const storedPath = `${repoMeta.owner}/${repoMeta.repo}:${relativeRepoPath}`;

                  await upsertKnowledgebaseEntryByPath({
                    workspaceId,
                    type,
                    title,
                    content,
                    filePath: storedPath,
                  });

                  result.synced++;
                  result.details.push({
                    type,
                    filePath: relativeRepoPath,
                    status: "synced",
                  });
                }
              } else {
                const resolvedContextPath = resolveContextPath(
                  contextPath,
                  repoRoot,
                );
                const effectiveRelativePath = dedupeRelativePath(
                  contextPath,
                  pattern,
                );
                let fullPath: string;
                if (type === "rules" && pattern.startsWith(".cursor/")) {
                  const base = repoRoot || getWorkspaceRoot();
                  fullPath = path.join(base, pattern);
                } else {
                  fullPath = path.join(
                    resolvedContextPath,
                    effectiveRelativePath,
                  );
                }

                const content = await readFileContent(fullPath);

                if (content !== null) {
                  const title = generateTitleFromPath(pattern);

                  await upsertKnowledgebaseEntryByPath({
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
                }
              }
            }
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            result.errors.push(`${type}/${pattern}: ${errorMsg}`);
            result.details.push({
              type,
              filePath: pattern,
              status: "error",
              error: errorMsg,
            });
          }
        }
      }
    }

    return result;
  }

  // Legacy single-file sync (backward compatible)
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

  for (const type of knowledgebaseTypes) {
    const relativePath = effectiveMapping[type];
    const title = TYPE_TITLES[type];

    // Try to find the file in each context path
    let found = false;
    let lastError: string | undefined;

    for (const contextPath of contextPaths) {
      try {
        if (useGitHub && repoMeta && options?.octokit) {
          const normalizedContextPath = normalizeRepoPath(contextPath);
          const effectiveRelativePath = dedupeRelativePath(
            normalizedContextPath,
            relativePath,
          );
          const relativeRepoPath =
            type === "rules" && relativePath.startsWith(".cursor/")
              ? relativePath
              : normalizeRepoPath(
                  path.posix.join(normalizedContextPath, effectiveRelativePath),
                );

          const content = await readGitHubFileContent({
            octokit: options.octokit,
            owner: repoMeta.owner,
            repo: repoMeta.repo,
            path: relativeRepoPath,
            ref: repoRef,
          });

          if (content !== null) {
            await upsertKnowledgebaseEntry({
              workspaceId,
              type,
              title,
              content,
              filePath: `${repoMeta.owner}/${repoMeta.repo}:${relativeRepoPath}`,
            });

            result.synced++;
            result.details.push({
              type,
              filePath: relativeRepoPath,
              status: "synced",
            });
            found = true;
            break;
          }
        } else {
          const resolvedContextPath = resolveContextPath(contextPath, repoRoot);
          const effectiveRelativePath = dedupeRelativePath(
            contextPath,
            relativePath,
          );
          let fullPath: string;
          if (type === "rules" && relativePath.startsWith(".cursor/")) {
            const base = repoRoot || getWorkspaceRoot();
            fullPath = path.join(base, relativePath);
          } else {
            fullPath = path.join(resolvedContextPath, effectiveRelativePath);
          }

          const content = await readFileContent(fullPath);

          if (content !== null) {
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
            break;
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : "Unknown error";
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
  const primaryContextPath =
    workspace.settings?.contextPaths?.[0] || workspace.contextPath;
  if (primaryContextPath) {
    contextPath = path.isAbsolute(primaryContextPath)
      ? primaryContextPath
      : path.join(repoPath || workspaceRoot, primaryContextPath);
  }

  // Resolve prototypes path
  let prototypesPath: string | null = null;
  const configuredPrototypesPath =
    workspace.settings?.prototypesPath || "src/components/prototypes";
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
