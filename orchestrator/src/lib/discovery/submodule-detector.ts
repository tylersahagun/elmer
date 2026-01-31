/**
 * Submodule Detector Module
 *
 * Detects Git submodules via .gitmodules file and parses their configuration.
 * Implements SUBM-01 (detect submodules via .gitmodules).
 */

import type { Octokit } from "@octokit/rest";
import type {
  DiscoveredSubmodule,
  DiscoveredInitiative,
  DiscoveredContextPath,
} from "./types";

/**
 * Parsed entry from .gitmodules file
 */
interface GitmoduleEntry {
  name: string;
  path: string;
  url: string;
  branch?: string;
}

/**
 * Parse .gitmodules file content into structured entries
 *
 * .gitmodules format:
 * [submodule "name"]
 *   path = local/path
 *   url = https://github.com/org/repo.git
 *   branch = main
 */
export function parseGitmodules(content: string): GitmoduleEntry[] {
  const entries: GitmoduleEntry[] = [];
  const lines = content.split("\n");

  let currentEntry: Partial<GitmoduleEntry> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Start of new submodule section
    const sectionMatch = trimmed.match(/^\[submodule\s+"([^"]+)"\]$/);
    if (sectionMatch) {
      // Save previous entry if exists
      if (
        currentEntry &&
        currentEntry.name &&
        currentEntry.path &&
        currentEntry.url
      ) {
        entries.push(currentEntry as GitmoduleEntry);
      }
      currentEntry = { name: sectionMatch[1] };
      continue;
    }

    // Skip if no current entry
    if (!currentEntry) continue;

    // Parse key-value pairs
    const kvMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      switch (key.toLowerCase()) {
        case "path":
          currentEntry.path = value.trim();
          break;
        case "url":
          currentEntry.url = value.trim();
          break;
        case "branch":
          currentEntry.branch = value.trim();
          break;
      }
    }
  }

  // Don't forget the last entry
  if (
    currentEntry &&
    currentEntry.name &&
    currentEntry.path &&
    currentEntry.url
  ) {
    entries.push(currentEntry as GitmoduleEntry);
  }

  return entries;
}

/**
 * Check if a URL is from a different organization than the parent repo.
 * This is just used for display purposes - actual access is verified separately.
 */
function isCrossOrgSubmodule(
  submoduleUrl: string,
  parentOwner: string,
): boolean {
  try {
    const url = new URL(submoduleUrl.replace(/\.git$/, ""));

    // Extract owner from GitHub URL
    if (url.hostname === "github.com") {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const submoduleOwner = pathParts[0];

      // Different org
      return submoduleOwner.toLowerCase() !== parentOwner.toLowerCase();
    }

    // Non-GitHub URLs are considered cross-org
    return true;
  } catch {
    return true;
  }
}

/**
 * Actually verify if we can access a submodule repo
 * Returns true if we need separate auth (can't access)
 */
async function verifySubmoduleAccess(
  submoduleUrl: string,
  octokit: Octokit,
): Promise<boolean> {
  const parsed = parseGitHubUrl(submoduleUrl);
  if (!parsed) {
    // Can't parse URL, assume needs auth
    return true;
  }

  try {
    // Try to access the repo - a simple request to check access
    await octokit.repos.get({
      owner: parsed.owner,
      repo: parsed.repo,
    });
    // If we get here, we have access
    return false;
  } catch (error) {
    // 404 or 403 means we don't have access
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 403) {
      return true;
    }
    // Other errors - assume we might have access but something else went wrong
    console.warn(
      `[verifySubmoduleAccess] Unexpected error for ${submoduleUrl}:`,
      error,
    );
    return false;
  }
}

/**
 * Extract GitHub owner/repo from a URL
 */
export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  try {
    // Handle various GitHub URL formats
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    // https://github.com/owner/repo

    let normalized = url.replace(/\.git$/, "");

    // SSH format
    if (normalized.startsWith("git@github.com:")) {
      normalized = normalized.replace("git@github.com:", "https://github.com/");
    }

    const parsed = new URL(normalized);
    if (parsed.hostname !== "github.com") {
      return null;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect submodules in a repository
 *
 * @param options - Detection options
 * @returns Array of detected submodules (not yet scanned)
 */
export async function detectSubmodules(options: {
  owner: string;
  repo: string;
  branch: string;
  octokit: Octokit;
  treeEntries?: Array<{ path: string; type: string }>; // Reuse existing tree data
}): Promise<DiscoveredSubmodule[]> {
  const { owner, repo, branch, octokit, treeEntries } = options;

  // Check if .gitmodules exists
  let hasGitmodules = false;

  if (treeEntries) {
    // Use existing tree data
    hasGitmodules = treeEntries.some(
      (entry) => entry.path === ".gitmodules" && entry.type === "blob",
    );
  } else {
    // Check via API
    try {
      await octokit.repos.getContent({
        owner,
        repo,
        path: ".gitmodules",
        ref: branch,
      });
      hasGitmodules = true;
    } catch (error) {
      // 404 = no .gitmodules, which is fine
      if ((error as { status?: number }).status !== 404) {
        console.error("Error checking for .gitmodules:", error);
      }
      hasGitmodules = false;
    }
  }

  if (!hasGitmodules) {
    return [];
  }

  // Fetch and parse .gitmodules
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: ".gitmodules",
      ref: branch,
    });

    if (!("content" in data) || !data.content) {
      return [];
    }

    const content = Buffer.from(data.content, "base64").toString("utf8");
    const entries = parseGitmodules(content);

    // Convert to DiscoveredSubmodule format and verify access
    const submodules: DiscoveredSubmodule[] = [];

    for (const entry of entries) {
      // Check if cross-org (for display purposes)
      const isCrossOrg = isCrossOrgSubmodule(entry.url, owner);

      // Actually verify if we can access the submodule
      let requiresAuth = false;
      if (isCrossOrg) {
        // Only do the API check for cross-org submodules to avoid rate limits
        requiresAuth = await verifySubmoduleAccess(entry.url, octokit);
      }

      submodules.push({
        name: entry.name,
        path: entry.path,
        url: entry.url,
        branch: entry.branch,
        canScan: !requiresAuth, // Can scan if we have access
        requiresAuth,
        scanned: false,
        initiatives: [],
        contextPaths: [],
      });
    }

    return submodules;
  } catch (error) {
    console.error("Error parsing .gitmodules:", error);
    return [];
  }
}

/**
 * Check if a path is inside a submodule
 */
export function isPathInSubmodule(
  path: string,
  submodules: DiscoveredSubmodule[],
): DiscoveredSubmodule | null {
  for (const submodule of submodules) {
    if (path.startsWith(submodule.path + "/") || path === submodule.path) {
      return submodule;
    }
  }
  return null;
}

/**
 * Get the relative path within a submodule
 */
export function getSubmoduleRelativePath(
  fullPath: string,
  submodule: DiscoveredSubmodule,
): string {
  if (fullPath === submodule.path) {
    return "";
  }
  return fullPath.slice(submodule.path.length + 1);
}

// Re-export types for consumers
export type { DiscoveredSubmodule, GitmoduleEntry };
