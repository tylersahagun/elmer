/**
 * Streaming Scanner Module
 *
 * Wraps the repository scanner to emit progress events via callbacks.
 * Enables real-time UI updates during discovery operations.
 *
 * Implements FEED-01 (progress indication), FEED-02 (streaming updates),
 * FEED-03 (elapsed/estimated time), FEED-05 (real-time feedback).
 */

import type { Octokit } from "@octokit/rest";
import type {
  DiscoveryResult,
  DiscoveryResultWithSubmodules,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveredAgent,
  DiscoveredSubmodule,
  DiscoveredPrototype,
  DiscoveryStats,
  DiscoveryWarning,
} from "./types";
import { deriveStorybookPathFromFolder } from "@/lib/chromatic";
import { createStreamEvent, type DiscoveryStreamEvent } from "./streaming";
import {
  INITIATIVE_PATTERNS,
  CONTEXT_PATTERNS,
  matchInitiativePattern,
  matchContextPatterns,
  matchFolderPattern,
  type PatternMatch,
} from "./patterns";
import { parseMetaJson, extractStatus } from "./meta-parser";
import { mapStatusWithFallback } from "./status-mapper";
import { generateProjectId } from "./id-generator";
import { detectSubmodules, parseGitHubUrl } from "./submodule-detector";

// =============================================================================
// TYPES
// =============================================================================

export type ScanProgressCallback = (event: DiscoveryStreamEvent) => void;

export interface StreamingScanOptions {
  workspaceId: string;
  owner: string;
  repo: string;
  branch: string;
  octokit: Octokit;
  onProgress: ScanProgressCallback;
  signal?: AbortSignal; // For cancellation support (FEED-04)
}

/**
 * Tree entry from GitHub API.
 */
interface TreeEntry {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get folder name from a path.
 */
function getFolderName(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

/**
 * Check if a path is a direct child of another path.
 */
function isDirectChild(parentPath: string, childPath: string): boolean {
  if (parentPath === "") {
    return !childPath.includes("/");
  }
  if (!childPath.startsWith(parentPath + "/")) {
    return false;
  }
  const remainder = childPath.slice(parentPath.length + 1);
  return !remainder.includes("/");
}

/**
 * Convert folder name to title case for display.
 */
function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Check if abort signal is triggered.
 */
function checkAborted(signal?: AbortSignal): boolean {
  return signal?.aborted ?? false;
}

// =============================================================================
// MAIN STREAMING SCANNER
// =============================================================================

/**
 * Scan a GitHub repository with streaming progress events.
 *
 * Wraps the repository scanner to emit events as items are discovered,
 * enabling real-time UI updates during the scanning process.
 *
 * @param options - Streaming scan options including callbacks and abort signal
 * @returns DiscoveryResult with discovered initiatives, context paths, and agents
 */
export async function scanRepositoryWithStreaming(
  options: StreamingScanOptions,
): Promise<DiscoveryResultWithSubmodules> {
  const { workspaceId, owner, repo, branch, octokit, onProgress, signal } =
    options;
  const repoSlug = `${owner}/${repo}`;
  const warnings: DiscoveryWarning[] = [];
  const startTime = Date.now();

  // Stats tracking
  const stats: DiscoveryStats = {
    foldersScanned: 0,
    initiativesFound: 0,
    contextPathsFound: 0,
    agentsFound: 0,
    prototypesFound: 0,
    metaJsonParsed: 0,
    metaJsonErrors: 0,
  };

  // Emit scanning_started event
  onProgress(
    createStreamEvent("scanning_started", {
      repoOwner: owner,
      repoName: repo,
      branch,
    }),
  );

  // Check for cancellation
  if (checkAborted(signal)) {
    onProgress(
      createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
    );
    return createEmptyResult(owner, repo, branch, stats, warnings);
  }

  // Step 1: Get repository tree using recursive=true (single API call per P5)
  let treeEntries: TreeEntry[] = [];
  try {
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });
    treeEntries = treeData.tree as TreeEntry[];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch tree";
    warnings.push({
      type: "api_error",
      path: "",
      message: `Failed to fetch repository tree: ${message}`,
    });
    onProgress(
      createStreamEvent("error", {
        error: message,
        elapsedMs: Date.now() - startTime,
      }),
    );
    return createEmptyResult(owner, repo, branch, stats, warnings);
  }

  // Check for cancellation after tree fetch
  if (checkAborted(signal)) {
    onProgress(
      createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
    );
    return createEmptyResult(owner, repo, branch, stats, warnings);
  }

  // Step 2: Build folder and file maps
  const folders = new Map<string, TreeEntry>();
  const files = new Map<string, TreeEntry>();
  const folderPaths: string[] = [];
  const prototypePaths: string[] = []; // Collect prototype root folders early

  for (const entry of treeEntries) {
    if (entry.type === "tree") {
      folders.set(entry.path, entry);
      folderPaths.push(entry.path);

      // Check for prototype folders at any level
      const folderName = getFolderName(entry.path);
      if (
        folderName.toLowerCase() === "prototypes" ||
        folderName.toLowerCase() === "prototype"
      ) {
        prototypePaths.push(entry.path);
      }
    } else if (entry.type === "blob") {
      files.set(entry.path, entry);
    }
  }

  // Step 2.5: Detect submodules
  const submodules: DiscoveredSubmodule[] = [];
  const treeEntriesForSubmoduleCheck = treeEntries.map((e) => ({
    path: e.path,
    type: e.type as string,
  }));

  const detectedSubmodules = await detectSubmodules({
    owner,
    repo,
    branch,
    octokit,
    treeEntries: treeEntriesForSubmoduleCheck,
  });

  for (const submodule of detectedSubmodules) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    // Emit detection event
    onProgress(
      createStreamEvent("submodule_detected", {
        submodule,
        elapsedMs: Date.now() - startTime,
      }),
    );

    submodules.push(submodule);
  }

  const totalFolders = folderPaths.length;

  // Step 3: Find initiative parent folders (top-level AND inside docs roots)
  const initiativeParentFolders: Array<{
    path: string;
    match: PatternMatch;
    docsRoot?: string; // If initiative folder is inside a docs root (e.g., pm-workspace-docs/initiatives)
  }> = [];

  // Track docs root folders for secondary scan
  const docsRootFolders: string[] = [];

  let progressCounter = 0;
  const PROGRESS_INTERVAL = 5; // Emit progress every N folders

  for (const [folderPath] of folders) {
    // Check for cancellation periodically
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    stats.foldersScanned++;
    progressCounter++;

    // Only check top-level folders
    if (!folderPath.includes("/")) {
      // Check for initiative patterns (e.g., "initiatives", "features")
      const initiativeMatch = matchInitiativePattern(folderPath);
      if (initiativeMatch) {
        initiativeParentFolders.push({
          path: folderPath,
          match: initiativeMatch,
        });
        // Emit folder_found event for initiative parent folders
        onProgress(
          createStreamEvent("folder_found", {
            currentFolder: folderPath,
            foldersScanned: stats.foldersScanned,
            totalFolders,
          }),
        );
      }

      // Check for docs root patterns (e.g., "pm-workspace-docs", "elmer-docs", "docs")
      const contextMatch = matchContextPatterns(folderPath);
      if (contextMatch?.folderType === "knowledge") {
        docsRootFolders.push(folderPath);
      }
    }

    // Emit progress event every PROGRESS_INTERVAL folders
    if (progressCounter >= PROGRESS_INTERVAL) {
      progressCounter = 0;
      const elapsedMs = Date.now() - startTime;
      const estimatedRemainingMs = calculateEstimatedRemaining(
        elapsedMs,
        stats.foldersScanned,
        totalFolders,
      );
      onProgress(
        createStreamEvent("progress", {
          foldersScanned: stats.foldersScanned,
          totalFolders,
          currentFolder: folderPath,
          elapsedMs,
          estimatedRemainingMs,
        }),
      );
    }
  }

  // Step 3b: Scan inside docs root folders for initiative parent folders
  // This allows finding initiatives in structures like: pm-workspace-docs/initiatives/
  for (const docsRootPath of docsRootFolders) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    // Find direct children of the docs root
    for (const [folderPath] of folders) {
      if (isDirectChild(docsRootPath, folderPath)) {
        // Get just the folder name (e.g., "initiatives" from "pm-workspace-docs/initiatives")
        const folderName = getFolderName(folderPath);
        const initiativeMatch = matchInitiativePattern(folderName);

        if (initiativeMatch) {
          // Check if we already found this path at top level (shouldn't happen, but be safe)
          if (!initiativeParentFolders.some((ipf) => ipf.path === folderPath)) {
            initiativeParentFolders.push({
              path: folderPath,
              match: initiativeMatch,
              docsRoot: docsRootPath,
            });
            // Emit folder_found event
            onProgress(
              createStreamEvent("folder_found", {
                currentFolder: folderPath,
                foldersScanned: stats.foldersScanned,
                totalFolders,
              }),
            );
          }
        }
      }
    }
  }

  // Step 4: Discover initiatives (subdirectories of initiative parent folders)
  const initiatives: DiscoveredInitiative[] = [];

  for (const {
    path: parentPath,
    match: parentMatch,
    docsRoot,
  } of initiativeParentFolders) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    // Find all direct children of this initiative parent folder
    const childFolders = Array.from(folders.keys()).filter((folderPath) =>
      isDirectChild(parentPath, folderPath),
    );

    for (const initiativePath of childFolders) {
      // Check for cancellation
      if (checkAborted(signal)) {
        onProgress(
          createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
        );
        return createEmptyResult(owner, repo, branch, stats, warnings);
      }

      const initiative = await discoverInitiative({
        workspaceId,
        repoSlug,
        initiativePath,
        parentPath,
        parentMatch,
        docsRoot,
        folders,
        files,
        prototypePaths,
        octokit,
        owner,
        repo,
        branch,
        warnings,
        stats,
      });

      if (initiative) {
        initiatives.push(initiative);
        stats.initiativesFound++;

        // Emit initiative_found event
        onProgress(
          createStreamEvent("initiative_found", {
            initiative,
            elapsedMs: Date.now() - startTime,
          }),
        );
      }
    }
  }

  // Step 5: Discover context paths (knowledge, personas, signals, prototypes)
  const contextPaths: DiscoveredContextPath[] = [];

  for (const [type, patterns] of Object.entries(CONTEXT_PATTERNS)) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    for (const [folderPath] of folders) {
      const depth = folderPath.split("/").length;
      if (depth > 2) {
        continue;
      }

      const folderName = getFolderName(folderPath);
      const match = matchFolderPattern(
        folderName,
        patterns,
        type as "knowledge" | "personas" | "signals",
      );

      if (match) {
        const fileCount = Array.from(files.keys()).filter((filePath) =>
          filePath.startsWith(folderPath + "/"),
        ).length;

        const contextPath: DiscoveredContextPath = {
          type: type as "knowledge" | "personas" | "signals" | "prototypes",
          path: folderPath,
          confidence: match.confidence,
          fileCount,
          selected: true,
        };

        // Avoid duplicates
        if (!contextPaths.some((cp) => cp.path === folderPath)) {
          contextPaths.push(contextPath);
          stats.contextPathsFound++;

          // Emit context_path_found event
          onProgress(
            createStreamEvent("context_path_found", {
              contextPath,
              elapsedMs: Date.now() - startTime,
            }),
          );
        }
      }
    }
  }

  // Also check for prototypes folder
  for (const [folderPath] of folders) {
    const folderName = getFolderName(folderPath);
    if (
      folderName.toLowerCase() === "prototypes" ||
      folderName.toLowerCase() === "prototype"
    ) {
      const fileCount = Array.from(files.keys()).filter((filePath) =>
        filePath.startsWith(folderPath + "/"),
      ).length;

      const contextPath: DiscoveredContextPath = {
        type: "prototypes",
        path: folderPath,
        confidence: 1.0,
        fileCount,
        selected: true,
      };

      if (!contextPaths.some((cp) => cp.path === folderPath)) {
        contextPaths.push(contextPath);
        stats.contextPathsFound++;

        // Emit context_path_found event
        onProgress(
          createStreamEvent("context_path_found", {
            contextPath,
            elapsedMs: Date.now() - startTime,
          }),
        );
      }
    }
  }

  // Step 6: Discover agents (.cursor/ directory and AGENTS.md)
  const agents: DiscoveredAgent[] = [];

  // Check for AGENTS.md at root
  if (files.has("AGENTS.md")) {
    const agent: DiscoveredAgent = {
      type: "agents_md",
      name: "AGENTS.md",
      path: "AGENTS.md",
      description: "Root-level agent definitions",
      selected: true,
    };
    agents.push(agent);
    stats.agentsFound++;

    // Emit agent_found event
    onProgress(
      createStreamEvent("agent_found", {
        agent,
        elapsedMs: Date.now() - startTime,
      }),
    );
  }

  // Check for .cursor/ directory
  if (folders.has(".cursor")) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    // Check for skills
    const skillFiles = Array.from(files.keys()).filter(
      (path) =>
        path.startsWith(".cursor/skills/") &&
        (path.endsWith(".md") || path.endsWith(".json")),
    );
    for (const skillPath of skillFiles) {
      const skillName = getFolderName(skillPath).replace(/\.(md|json)$/, "");
      const agent: DiscoveredAgent = {
        type: "skill",
        name: skillName,
        path: skillPath,
        description: null,
        selected: true,
      };
      agents.push(agent);
      stats.agentsFound++;

      // Emit agent_found event
      onProgress(
        createStreamEvent("agent_found", {
          agent,
          elapsedMs: Date.now() - startTime,
        }),
      );
    }

    // Check for commands
    const commandFiles = Array.from(files.keys()).filter(
      (path) =>
        path.startsWith(".cursor/commands/") &&
        (path.endsWith(".md") || path.endsWith(".json")),
    );
    for (const commandPath of commandFiles) {
      const commandName = getFolderName(commandPath).replace(
        /\.(md|json)$/,
        "",
      );
      const agent: DiscoveredAgent = {
        type: "command",
        name: commandName,
        path: commandPath,
        description: null,
        selected: true,
      };
      agents.push(agent);
      stats.agentsFound++;

      // Emit agent_found event
      onProgress(
        createStreamEvent("agent_found", {
          agent,
          elapsedMs: Date.now() - startTime,
        }),
      );
    }

    // Check for rules
    const ruleFiles = Array.from(files.keys()).filter(
      (path) =>
        path.startsWith(".cursor/rules/") &&
        (path.endsWith(".md") ||
          path.endsWith(".json") ||
          path.endsWith(".mdc")),
    );
    for (const rulePath of ruleFiles) {
      const ruleName = getFolderName(rulePath).replace(/\.(md|json|mdc)$/, "");
      const agent: DiscoveredAgent = {
        type: "rule",
        name: ruleName,
        path: rulePath,
        description: null,
        selected: true,
      };
      agents.push(agent);
      stats.agentsFound++;

      // Emit agent_found event
      onProgress(
        createStreamEvent("agent_found", {
          agent,
          elapsedMs: Date.now() - startTime,
        }),
      );
    }

    // Check for .cursorrules file (legacy)
    if (files.has(".cursorrules")) {
      const agent: DiscoveredAgent = {
        type: "rule",
        name: ".cursorrules",
        path: ".cursorrules",
        description: "Legacy cursor rules file",
        selected: true,
      };
      agents.push(agent);
      stats.agentsFound++;

      // Emit agent_found event
      onProgress(
        createStreamEvent("agent_found", {
          agent,
          elapsedMs: Date.now() - startTime,
        }),
      );
    }
  }

  // Step 6.5: Scan submodules for prototype paths
  for (const submodule of submodules) {
    // Check for cancellation
    if (checkAborted(signal)) {
      onProgress(
        createStreamEvent("cancelled", { elapsedMs: Date.now() - startTime }),
      );
      return createEmptyResult(owner, repo, branch, stats, warnings);
    }

    // Skip submodules requiring auth (for now - SUBM-05 will handle this)
    if (submodule.requiresAuth) {
      submodule.scanError = "Submodule requires separate authentication";
      submodule.canScan = false;
      continue;
    }

    // Parse submodule URL to get owner/repo
    const submoduleRepo = parseGitHubUrl(submodule.url);
    if (!submoduleRepo) {
      submodule.scanError = "Unable to parse submodule URL";
      submodule.canScan = false;
      continue;
    }

    // Emit scanning event
    onProgress(
      createStreamEvent("submodule_scanning", {
        submodulePath: submodule.path,
        elapsedMs: Date.now() - startTime,
      }),
    );

    try {
      // Fetch submodule tree
      const { data: submoduleTree } = await octokit.git.getTree({
        owner: submoduleRepo.owner,
        repo: submoduleRepo.repo,
        tree_sha: submodule.branch || "main",
        recursive: "true",
      });

      const submoduleFolders = new Map<string, TreeEntry>();
      const submoduleFiles = new Map<string, TreeEntry>();

      for (const entry of submoduleTree.tree) {
        if (entry.type === "tree") {
          submoduleFolders.set(entry.path, entry as TreeEntry);
        } else if (entry.type === "blob") {
          submoduleFiles.set(entry.path, entry as TreeEntry);
        }
      }

      // Look for prototype paths
      for (const [folderPath] of submoduleFolders) {
        const folderName = getFolderName(folderPath);
        if (
          folderName.toLowerCase() === "prototypes" ||
          folderName.toLowerCase() === "prototype"
        ) {
          const fullPath = `${submodule.path}/${folderPath}`;
          submodule.prototypePath = fullPath;

          // Also add to main prototype paths array for initiative matching
          if (!prototypePaths.includes(fullPath)) {
            prototypePaths.push(fullPath);
          }

          // Add as context path
          const fileCount = Array.from(submoduleFiles.keys()).filter((f) =>
            f.startsWith(folderPath + "/"),
          ).length;

          const contextPath: DiscoveredContextPath = {
            type: "prototypes" as const,
            path: fullPath,
            confidence: 1.0,
            fileCount,
            selected: true,
          };

          if (!contextPaths.some((cp) => cp.path === fullPath)) {
            contextPaths.push(contextPath);
            stats.contextPathsFound++;

            onProgress(
              createStreamEvent("context_path_found", {
                contextPath,
                elapsedMs: Date.now() - startTime,
              }),
            );
          }
        }
      }

      // Mark as scanned
      submodule.scanned = true;

      // Emit scanned event
      onProgress(
        createStreamEvent("submodule_scanned", {
          submodule,
          prototypePath: submodule.prototypePath,
          elapsedMs: Date.now() - startTime,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      submodule.scanError = errorMessage;
      submodule.canScan = false;

      onProgress(
        createStreamEvent("submodule_error", {
          submodulePath: submodule.path,
          error: errorMessage,
          elapsedMs: Date.now() - startTime,
        }),
      );

      warnings.push({
        type: "api_error",
        path: submodule.path,
        message: `Failed to scan submodule: ${errorMessage}`,
      });
    }
  }

  // Step 7: Compile and return result
  const result: DiscoveryResultWithSubmodules = {
    repoOwner: owner,
    repoName: repo,
    branch,
    scannedAt: new Date().toISOString(),
    initiatives,
    contextPaths,
    agents,
    submodules,
    hasSubmodules: submodules.length > 0,
    stats,
    warnings,
  };

  const elapsedMs = Date.now() - startTime;

  // Emit completed event
  onProgress(
    createStreamEvent("completed", {
      result,
      elapsedMs,
    }),
  );

  return result;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate estimated remaining time based on current progress.
 */
function calculateEstimatedRemaining(
  elapsedMs: number,
  foldersScanned: number,
  totalFolders: number,
): number | undefined {
  if (foldersScanned === 0 || totalFolders === 0) {
    return undefined;
  }
  const avgTimePerFolder = elapsedMs / foldersScanned;
  const remainingFolders = totalFolders - foldersScanned;
  return Math.round(avgTimePerFolder * remainingFolders);
}

/**
 * Create an empty result for early returns.
 */
function createEmptyResult(
  owner: string,
  repo: string,
  branch: string,
  stats: DiscoveryStats,
  warnings: DiscoveryWarning[],
): DiscoveryResultWithSubmodules {
  return {
    repoOwner: owner,
    repoName: repo,
    branch,
    scannedAt: new Date().toISOString(),
    initiatives: [],
    contextPaths: [],
    agents: [],
    submodules: [],
    hasSubmodules: false,
    stats,
    warnings,
  };
}

/**
 * Convert a string to kebab-case for matching prototype folders.
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Parse story exports from a .stories.tsx file content.
 * Returns array of story names (e.g., ["Default", "Loading", "Error"])
 */
function parseStoryExports(content: string): string[] {
  const stories: string[] = [];
  // Match patterns like: export const Default: Story = ...
  const storyPattern = /export\s+const\s+(\w+)\s*:\s*Story/g;
  let match;
  while ((match = storyPattern.exec(content)) !== null) {
    stories.push(match[1]);
  }
  return stories;
}

/**
 * Find prototypes for an initiative by searching for matching folders.
 */
async function findPrototypesForInitiative(params: {
  initiativeName: string;
  folders: Map<string, TreeEntry>;
  files: Map<string, TreeEntry>;
  prototypePaths: string[];
  octokit: Octokit;
  owner: string;
  repo: string;
  branch: string;
}): Promise<DiscoveredPrototype[]> {
  const {
    initiativeName,
    folders,
    files,
    prototypePaths,
    octokit,
    owner,
    repo,
    branch,
  } = params;

  const prototypes: DiscoveredPrototype[] = [];
  const kebabName = toKebabCase(initiativeName);
  const pascalName = initiativeName.replace(/[-\s_]+/g, "");

  // Search in known prototype paths for folders matching the initiative name
  for (const prototypePath of prototypePaths) {
    // Look for exact matches or case-insensitive matches
    for (const [folderPath] of folders) {
      if (!folderPath.startsWith(prototypePath + "/")) continue;

      // Get the relative path after the prototype root
      const relativePath = folderPath.slice(prototypePath.length + 1);
      const parts = relativePath.split("/");
      const folderName = parts[0];

      // Check if folder name matches initiative name (various formats)
      const folderNameLower = folderName.toLowerCase();
      const matches =
        folderNameLower === kebabName ||
        folderNameLower === pascalName.toLowerCase() ||
        folderNameLower === initiativeName.toLowerCase().replace(/\s+/g, "");

      if (matches && parts.length <= 2) {
        // Found a matching prototype folder
        const prototypeFolderPath = `${prototypePath}/${folderName}`;

        // Check if this is a versioned folder (has v1, v2, etc. subfolders)
        let version: string | null = null;
        let actualPath = prototypeFolderPath;

        if (parts.length === 2 && /^v\d+$/i.test(parts[1])) {
          version = parts[1].toLowerCase();
          actualPath = folderPath;
        } else {
          // Check if there are version subfolders
          const versionFolders = Array.from(folders.keys()).filter(
            (f) =>
              f.startsWith(prototypeFolderPath + "/") &&
              /^v\d+$/i.test(getFolderName(f)),
          );
          if (versionFolders.length > 0) {
            // Use the latest version
            versionFolders.sort();
            actualPath = versionFolders[versionFolders.length - 1];
            version = getFolderName(actualPath).toLowerCase();
          }
        }

        // Check if we already found this prototype (avoid duplicates from version scanning)
        if (prototypes.some((p) => p.path === actualPath)) continue;

        // Find story files in the prototype folder
        const storyFiles = Array.from(files.keys()).filter(
          (f) => f.startsWith(actualPath + "/") && f.endsWith(".stories.tsx"),
        );

        // Try to parse story exports from story files
        const stories: string[] = [];
        for (const storyFile of storyFiles.slice(0, 2)) {
          // Limit to avoid too many API calls
          try {
            const { data: fileData } = await octokit.repos.getContent({
              owner,
              repo,
              path: storyFile,
              ref: branch,
            });

            if ("content" in fileData && fileData.content) {
              const content = Buffer.from(fileData.content, "base64").toString(
                "utf8",
              );
              const storyExports = parseStoryExports(content);
              stories.push(...storyExports);
            }
          } catch {
            // Ignore errors fetching story files
          }
        }

        // Derive storybook path
        const storybookPath = deriveStorybookPathFromFolder(actualPath);

        prototypes.push({
          name: toTitleCase(folderName),
          path: actualPath,
          storybookPath,
          stories,
          version,
          branch,
        });
      }
    }
  }

  return prototypes;
}

/**
 * Discover a single initiative from a folder path.
 */
async function discoverInitiative(params: {
  workspaceId: string;
  repoSlug: string;
  initiativePath: string;
  parentPath: string;
  parentMatch: PatternMatch;
  docsRoot?: string;
  folders: Map<string, TreeEntry>;
  files: Map<string, TreeEntry>;
  prototypePaths: string[];
  octokit: Octokit;
  owner: string;
  repo: string;
  branch: string;
  warnings: DiscoveryWarning[];
  stats: DiscoveryStats;
}): Promise<DiscoveredInitiative | null> {
  const {
    workspaceId,
    repoSlug,
    initiativePath,
    parentPath,
    parentMatch,
    docsRoot,
    folders,
    files,
    prototypePaths,
    octokit,
    owner,
    repo,
    branch,
    warnings,
    stats,
  } = params;

  const folderName = getFolderName(initiativePath);
  const metaPath = `${initiativePath}/_meta.json`;
  const hasMetaJson = files.has(metaPath);

  // Generate deterministic ID
  const id = generateProjectId(workspaceId, repoSlug, initiativePath);

  // Default values
  let name = toTitleCase(folderName);
  let description: string | null = null;
  let status: string | null = null;
  let archived = false;
  let tags: string[] = [];
  let rawMeta: Record<string, unknown> | null = null;

  // Try to fetch and parse _meta.json if it exists
  if (hasMetaJson) {
    try {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path: metaPath,
        ref: branch,
      });

      if ("content" in fileData && fileData.content) {
        const content = Buffer.from(fileData.content, "base64").toString(
          "utf8",
        );
        const parseResult = parseMetaJson(content);

        if (parseResult.success) {
          stats.metaJsonParsed++;
          const meta = parseResult.data;
          rawMeta = meta as Record<string, unknown>;

          // Extract fields
          name = meta.name || meta.title || name;
          description = meta.description || null;
          tags = Array.isArray(meta.tags) ? meta.tags : [];

          // Extract status
          const statusInfo = extractStatus(meta);
          status = statusInfo.value;
          archived = statusInfo.archived;
        } else {
          stats.metaJsonErrors++;
          warnings.push({
            type: "meta_parse_error",
            path: metaPath,
            message: parseResult.error,
          });
        }
      }
    } catch (error) {
      stats.metaJsonErrors++;
      const message =
        error instanceof Error ? error.message : "Failed to fetch _meta.json";
      warnings.push({
        type: "api_error",
        path: metaPath,
        message,
      });
    }
  } else {
    warnings.push({
      type: "missing_meta",
      path: initiativePath,
      message: `No _meta.json found, using folder name: ${folderName}`,
    });
  }

  // Map status to column
  const statusMapping = status
    ? mapStatusWithFallback(status)
    : { column: "inbox", isKnown: true, confidence: 0, isAmbiguous: false };

  // Find prototypes for this initiative
  const prototypes = await findPrototypesForInitiative({
    initiativeName: name,
    folders,
    files,
    prototypePaths,
    octokit,
    owner,
    repo,
    branch,
  });

  // Update stats
  stats.prototypesFound += prototypes.length;

  // Build initiative
  const initiative: DiscoveredInitiative = {
    id,
    sourcePath: initiativePath,
    sourceFolder: parentPath,
    docsRoot,
    name,
    status,
    mappedColumn: statusMapping.column,
    statusConfidence: statusMapping.confidence,
    isStatusAmbiguous: statusMapping.isAmbiguous,
    description,
    archived,
    tags,
    rawMeta,
    patternMatch: {
      pattern: parentMatch.pattern,
      matchType: parentMatch.matchType,
      confidence: parentMatch.confidence,
    },
    selected: !archived, // Pre-select non-archived initiatives
    prototypes,
  };

  // Add ambiguity warning if needed
  if (statusMapping.isAmbiguous) {
    warnings.push({
      type: "ambiguous_status",
      path: initiativePath,
      message: `Status "${status}" could map to multiple columns. Please verify.`,
    });
  }

  return initiative;
}
