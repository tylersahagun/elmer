/**
 * Repository Scanner Module
 *
 * Orchestrates the scanning of a GitHub repository using the tree API,
 * detects pm-workspace structures, and returns comprehensive discovery results.
 *
 * Uses recursive=true for single API call efficiency (per P5 pitfall).
 */

import type { Octokit } from "@octokit/rest";
import {
  INITIATIVE_PATTERNS,
  CONTEXT_PATTERNS,
  matchInitiativePattern,
  matchFolderPattern,
  type PatternMatch,
} from "./patterns";
import { parseMetaJson, extractStatus } from "./meta-parser";
import { mapStatusWithFallback } from "./status-mapper";
import {
  generateProjectId,
  generateContextPathId,
  generateAgentId,
} from "./id-generator";
import type {
  DiscoveryResult,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveredAgent,
  DiscoveryStats,
  DiscoveryWarning,
} from "./types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for scanning a repository.
 */
export interface ScanOptions {
  workspaceId: string;
  owner: string;
  repo: string;
  branch: string;
  octokit: Octokit;
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
 * Get parent path from a path.
 */
function getParentPath(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
}

/**
 * Check if a path is a direct child of another path.
 */
function isDirectChild(parentPath: string, childPath: string): boolean {
  if (parentPath === "") {
    // Root level - no slashes in child path
    return !childPath.includes("/");
  }
  // Check prefix and no additional slashes after parent
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

// =============================================================================
// MAIN SCANNER
// =============================================================================

/**
 * Scan a GitHub repository for pm-workspace structures.
 *
 * @param options - Scan options including workspace, repo, and octokit client
 * @returns DiscoveryResult with discovered initiatives, context paths, and agents
 */
export async function scanRepository(
  options: ScanOptions,
): Promise<DiscoveryResult> {
  const { workspaceId, owner, repo, branch, octokit } = options;
  const repoSlug = `${owner}/${repo}`;
  const warnings: DiscoveryWarning[] = [];

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
    return {
      repoOwner: owner,
      repoName: repo,
      branch,
      scannedAt: new Date().toISOString(),
      initiatives: [],
      contextPaths: [],
      agents: [],
      stats,
      warnings,
    };
  }

  // Step 2: Build folder and file maps
  const folders = new Map<string, TreeEntry>();
  const files = new Map<string, TreeEntry>();

  for (const entry of treeEntries) {
    if (entry.type === "tree") {
      folders.set(entry.path, entry);
      stats.foldersScanned++;
    } else if (entry.type === "blob") {
      files.set(entry.path, entry);
    }
  }

  // Step 3: Find initiative parent folders at top level
  const initiativeParentFolders: Array<{
    path: string;
    match: PatternMatch;
  }> = [];

  for (const [folderPath] of folders) {
    // Only check top-level folders
    if (folderPath.includes("/")) {
      continue;
    }
    const match = matchInitiativePattern(folderPath);
    if (match) {
      initiativeParentFolders.push({ path: folderPath, match });
    }
  }

  // Step 4: Discover initiatives (subdirectories of initiative parent folders)
  const initiatives: DiscoveredInitiative[] = [];

  for (const {
    path: parentPath,
    match: parentMatch,
  } of initiativeParentFolders) {
    // Find all direct children of this initiative parent folder
    const childFolders = Array.from(folders.keys()).filter((folderPath) =>
      isDirectChild(parentPath, folderPath),
    );

    for (const initiativePath of childFolders) {
      const initiative = await discoverInitiative({
        workspaceId,
        repoSlug,
        initiativePath,
        parentPath,
        parentMatch,
        files,
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
      }
    }
  }

  // Step 5: Discover context paths (knowledge, personas, signals, prototypes)
  const contextPaths: DiscoveredContextPath[] = [];

  for (const [type, patterns] of Object.entries(CONTEXT_PATTERNS)) {
    for (const [folderPath] of folders) {
      // Check top-level and one level deep
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
        // Count files in this directory
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
      }
    }
  }

  // Step 6: Discover agents (.cursor/ directory and AGENTS.md)
  const agents: DiscoveredAgent[] = [];

  // Check for AGENTS.md at root
  if (files.has("AGENTS.md")) {
    agents.push({
      type: "agents_md",
      name: "AGENTS.md",
      path: "AGENTS.md",
      description: "Root-level agent definitions",
      selected: true,
    });
    stats.agentsFound++;
  }

  // Check for .cursor/ directory
  if (folders.has(".cursor")) {
    // Check for skills
    const skillFiles = Array.from(files.keys()).filter(
      (path) =>
        path.startsWith(".cursor/skills/") &&
        (path.endsWith(".md") || path.endsWith(".json")),
    );
    for (const skillPath of skillFiles) {
      const skillName = getFolderName(skillPath).replace(/\.(md|json)$/, "");
      agents.push({
        type: "skill",
        name: skillName,
        path: skillPath,
        description: null,
        selected: true,
      });
      stats.agentsFound++;
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
      agents.push({
        type: "command",
        name: commandName,
        path: commandPath,
        description: null,
        selected: true,
      });
      stats.agentsFound++;
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
      agents.push({
        type: "rule",
        name: ruleName,
        path: rulePath,
        description: null,
        selected: true,
      });
      stats.agentsFound++;
    }

    // Check for .cursorrules file (legacy)
    if (files.has(".cursorrules")) {
      agents.push({
        type: "rule",
        name: ".cursorrules",
        path: ".cursorrules",
        description: "Legacy cursor rules file",
        selected: true,
      });
      stats.agentsFound++;
    }
  }

  // Step 7: Compile and return result
  return {
    repoOwner: owner,
    repoName: repo,
    branch,
    scannedAt: new Date().toISOString(),
    initiatives,
    contextPaths,
    agents,
    stats,
    warnings,
  };
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
  files: Map<string, TreeEntry>;
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
    files,
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

  // Build initiative
  const initiative: DiscoveredInitiative = {
    id,
    sourcePath: initiativePath,
    sourceFolder: parentPath,
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
    prototypes: [], // Non-streaming scanner doesn't scan for prototypes
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
