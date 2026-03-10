/**
 * Signal Sync Utility
 *
 * Scans markdown files in workspace's signals folder(s) and creates signal
 * records in Convex. Supports both filesystem and GitHub sources.
 *
 * Key features:
 * - Idempotency via sourceRef (file path) - existing signals are skipped
 * - Folder-based source mapping (voice-memos/ → interview, etc.)
 * - Recursive scanning of signal directories
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getConvexWorkspace } from "@/lib/convex/server";

type SignalSource =
  | "interview"
  | "slack"
  | "email"
  | "hubspot"
  | "pylon"
  | "upload"
  | "video"
  | "paste"
  | "other";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
  return new ConvexHttpClient(url);
}

// Folder name to signal source mapping
const FOLDER_SOURCE_MAP: Record<string, SignalSource> = {
  "voice-memos": "interview",
  "voice-memo": "interview",
  transcripts: "interview",
  interviews: "interview",
  "substack-articles": "other",
  articles: "other",
  slack: "slack",
  hubspot: "hubspot",
  email: "email",
  pylon: "pylon",
};

const DEFAULT_SOURCE: SignalSource = "other";

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
 * Check if a path exists
 */
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

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(
  dirPath: string,
  baseDir: string = dirPath,
): Promise<Array<{ filePath: string; relativePath: string; folder: string }>> {
  const results: Array<{
    filePath: string;
    relativePath: string;
    folder: string;
  }> = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subResults = await findMarkdownFiles(fullPath, baseDir);
        results.push(...subResults);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") || entry.name.endsWith(".txt")) &&
        entry.name !== "README.md" &&
        entry.name !== ".gitkeep"
      ) {
        const relativePath = path.relative(baseDir, fullPath);
        const pathParts = relativePath.split(path.sep);
        const folder = pathParts.length > 1 ? pathParts[0] : "";

        results.push({
          filePath: fullPath,
          relativePath,
          folder,
        });
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  return results;
}

/**
 * Get signal source from folder name
 */
function getSourceFromFolder(folder: string): SignalSource {
  const normalizedFolder = folder.toLowerCase().replace(/_/g, "-");
  return FOLDER_SOURCE_MAP[normalizedFolder] || DEFAULT_SOURCE;
}

/**
 * Check if a signal with the given sourceRef already exists for a workspace.
 * Uses Convex query.
 */
async function signalExistsBySourceRef(
  workspaceId: string,
  sourceRef: string,
): Promise<boolean> {
  const client = getConvexClient();
  const existing = await client.query(api.signals.getBySourceRef, {
    workspaceId: workspaceId as Id<"workspaces">,
    sourceRef,
  });
  return existing !== null;
}

/**
 * Parse a markdown file to extract a title (if present)
 */
function extractTitle(content: string): string | undefined {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  const frontmatterMatch = content.match(
    /^---\n[\s\S]*?title:\s*(.+)\n[\s\S]*?---/,
  );
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim().replace(/^["']|["']$/g, "");
  }
  return undefined;
}

export interface SignalSyncResult {
  synced: number;
  skipped: number;
  errors: string[];
  details: Array<{
    filePath: string;
    status: "synced" | "skipped" | "error";
    error?: string;
    signalId?: string;
  }>;
}

export interface SyncSignalsOptions {
  octokit?: Octokit;
  repoRef?: string;
  repoOwner?: string;
  repoName?: string;
  signalsPaths?: string[];
  /** If true, skip AI processing (for bulk imports) */
  skipProcessing?: boolean;
}

/**
 * Sync signals from filesystem to Convex for a workspace.
 *
 * Scans configured signal paths (default: signals/ folder in contextPaths)
 * and creates signal records for each markdown file found.
 *
 * Idempotency: Uses file path as sourceRef - existing signals are skipped.
 */
export async function syncSignals(
  workspaceId: string,
  options?: SyncSignalsOptions,
): Promise<SignalSyncResult> {
  const result: SignalSyncResult = {
    synced: 0,
    skipped: 0,
    errors: [],
    details: [],
  };

  const workspace = await getConvexWorkspace(workspaceId);
  if (!workspace) {
    result.errors.push("Workspace not found");
    return result;
  }

  const repoRoot = resolveRepoPath(workspace.githubRepo ?? undefined);

  const contextPaths = workspace.settings?.contextPaths?.length
    ? workspace.settings.contextPaths
    : workspace.contextPath
      ? workspace.contextPath === "elmer-docs/" ||
        workspace.contextPath === "elmer-docs"
        ? ["pm-workspace-docs/", workspace.contextPath]
        : [workspace.contextPath]
      : ["pm-workspace-docs/", "elmer-docs/"];

  const signalSubfolders = options?.signalsPaths || ["signals/"];

  const allFiles: Array<{
    filePath: string;
    relativePath: string;
    folder: string;
    contextPath: string;
  }> = [];

  for (const contextPath of contextPaths) {
    const resolvedContextPath = resolveContextPath(contextPath, repoRoot);

    for (const signalSubfolder of signalSubfolders) {
      const signalsDir = path.join(resolvedContextPath, signalSubfolder);

      if (await pathExists(signalsDir)) {
        const files = await findMarkdownFiles(signalsDir);
        allFiles.push(
          ...files.map((f) => ({
            ...f,
            contextPath,
          })),
        );
      }
    }
  }

  if (allFiles.length === 0) {
    result.errors.push(
      "No signal files found in configured paths. Looked in: " +
        contextPaths
          .map((cp: string) => signalSubfolders.map((sf) => `${cp}${sf}`))
          .flat()
          .join(", "),
    );
    return result;
  }

  const client = getConvexClient();
  const signalIds: string[] = [];

  for (const file of allFiles) {
    const sourceRef = `${file.contextPath}signals/${file.relativePath}`;

    try {
      // Check idempotency via Convex
      const exists = await signalExistsBySourceRef(workspaceId, sourceRef);

      if (exists) {
        result.skipped++;
        result.details.push({
          filePath: file.relativePath,
          status: "skipped",
        });
        continue;
      }

      const content = await readFileContent(file.filePath);

      if (!content || content.trim().length === 0) {
        result.skipped++;
        result.details.push({
          filePath: file.relativePath,
          status: "skipped",
          error: "Empty file",
        });
        continue;
      }

      const source = getSourceFromFolder(file.folder);
      const title = extractTitle(content);

      // Create signal in Convex
      const signalId = await client.mutation(api.signals.create, {
        workspaceId: workspaceId as Id<"workspaces">,
        verbatim: content.trim(),
        interpretation: title,
        source,
        sourceRef,
        status: "new",
      });

      if (signalId) {
        signalIds.push(signalId as string);
        result.synced++;
        result.details.push({
          filePath: file.relativePath,
          status: "synced",
          signalId: signalId as string,
        });
      } else {
        result.errors.push(`Failed to create signal for ${file.relativePath}`);
        result.details.push({
          filePath: file.relativePath,
          status: "error",
          error: "Failed to create signal",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`${file.relativePath}: ${errorMessage}`);
      result.details.push({
        filePath: file.relativePath,
        status: "error",
        error: errorMessage,
      });
    }
  }

  // Optionally process signals (AI extraction, embeddings)
  if (!options?.skipProcessing && signalIds.length > 0) {
    const { batchProcessSignals } = await import("./processor");
    try {
      await batchProcessSignals(signalIds);
    } catch (error) {
      console.error("Failed to batch process synced signals:", error);
    }
  }

  return result;
}

/**
 * Get the default signals path for a workspace
 */
export function getDefaultSignalsPath(workspace: {
  githubRepo?: string | null;
  contextPath?: string | null;
  settings?: {
    contextPaths?: string[];
  } | null;
}): string | null {
  const repoRoot = resolveRepoPath(workspace.githubRepo ?? undefined);

  const contextPath =
    workspace.settings?.contextPaths?.[0] || workspace.contextPath;

  if (!contextPath) return null;

  const resolvedContextPath = resolveContextPath(contextPath, repoRoot);
  return path.join(resolvedContextPath, "signals");
}
