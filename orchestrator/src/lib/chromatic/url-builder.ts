/**
 * Chromatic URL Builder
 *
 * Constructs URLs for Chromatic Storybook deployments based on branch and app ID.
 * Used to dynamically generate embeddable URLs for prototypes.
 */

// Default Chromatic app ID - can be overridden via environment variable
const DEFAULT_CHROMATIC_APP_ID = "696c2c54e35ea5bca2a772d8";

/**
 * Get the Chromatic app ID from environment or default
 */
export function getChromaticAppId(): string {
  return process.env.CHROMATIC_APP_ID || DEFAULT_CHROMATIC_APP_ID;
}

/**
 * Sanitize a branch name for use in Chromatic URLs.
 * Chromatic converts branch names to URL-safe format.
 */
export function sanitizeBranchForUrl(branch: string): string {
  // Chromatic converts slashes to dashes and removes invalid characters
  return branch
    .replace(/\//g, "-") // Replace slashes with dashes
    .replace(/[^a-zA-Z0-9-]/g, "-") // Replace other invalid chars with dashes
    .replace(/-+/g, "-") // Collapse multiple dashes
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

/**
 * Build the base Chromatic Storybook URL for a given branch.
 *
 * @param branch - Git branch name (e.g., "main", "feat/flagship-meeting")
 * @param appId - Optional Chromatic app ID (uses default if not provided)
 * @returns URL like "https://main--696c2c54e35ea5bca2a772d8.chromatic.com"
 */
export function buildChromaticStorybookUrl(
  branch: string,
  appId?: string,
): string {
  const sanitizedBranch = sanitizeBranchForUrl(branch);
  const chromaAppId = appId || getChromaticAppId();
  return `https://${sanitizedBranch}--${chromaAppId}.chromatic.com`;
}

/**
 * Build a URL to embed a specific story from Chromatic.
 *
 * @param branch - Git branch name
 * @param storyId - Storybook story ID (e.g., "prototypes-flagshipmeetingrecap--default")
 * @param appId - Optional Chromatic app ID
 * @returns URL like "https://main--appId.chromatic.com/iframe.html?id=story-id&viewMode=story"
 */
export function buildChromaticStoryUrl(
  branch: string,
  storyId: string,
  appId?: string,
): string {
  const baseUrl = buildChromaticStorybookUrl(branch, appId);
  return `${baseUrl}/iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story`;
}

/**
 * Build a URL to the Chromatic dashboard (builds list or specific build).
 *
 * @param buildNumber - Optional build number for a specific build
 * @param appId - Optional Chromatic app ID
 * @returns URL to Chromatic dashboard
 */
export function buildChromaticDashboardUrl(
  buildNumber?: number,
  appId?: string,
): string {
  const chromaAppId = appId || getChromaticAppId();

  if (buildNumber) {
    return `https://www.chromatic.com/build?appId=${chromaAppId}&number=${buildNumber}`;
  }

  return `https://www.chromatic.com/builds?appId=${chromaAppId}`;
}

/**
 * Extract branch name from a Chromatic Storybook URL.
 *
 * @param url - Chromatic URL like "https://feat-flagship--appId.chromatic.com"
 * @returns Branch name or null if URL doesn't match pattern
 */
export function extractBranchFromChromaticUrl(url: string): string | null {
  const match = url.match(
    /^https:\/\/([a-zA-Z0-9-]+)--[a-zA-Z0-9]+\.chromatic\.com/,
  );
  return match ? match[1] : null;
}

/**
 * Derive a storybook path from a prototype folder path.
 * Converts folder structure to Storybook story ID format.
 *
 * @param prototypePath - Path like "web/src/components/prototypes/FlagshipMeetingRecap/v1"
 * @returns Story path like "prototypes-flagshipmeetingrecap--default"
 */
export function deriveStorybookPathFromFolder(prototypePath: string): string {
  // Extract the prototype name from the path
  const parts = prototypePath.split("/");

  // Find the "prototypes" folder and get the next segment
  const prototypesIndex = parts.findIndex(
    (p) => p.toLowerCase() === "prototypes",
  );

  if (prototypesIndex === -1 || prototypesIndex >= parts.length - 1) {
    // Fallback: use last meaningful segment
    const name =
      parts.filter((p) => p && p !== "v1" && p !== "v2").pop() || "unknown";
    return `prototypes-${name.toLowerCase()}--default`;
  }

  // Get prototype name (next segment after "prototypes")
  const prototypeName = parts[prototypesIndex + 1];

  // Convert to lowercase and create storybook path
  return `prototypes-${prototypeName.toLowerCase()}--default`;
}

/**
 * Check if a URL is a valid Chromatic Storybook URL.
 *
 * @param url - URL to check
 * @returns true if URL matches Chromatic Storybook pattern
 */
export function isChromaticStorybookUrl(url: string): boolean {
  return /^https:\/\/[a-zA-Z0-9-]+--[a-zA-Z0-9]+\.chromatic\.com/.test(url);
}
