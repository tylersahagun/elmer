import { createHash } from 'node:crypto';

/**
 * Generate a deterministic ID from input parts.
 *
 * Why deterministic IDs matter:
 * - Re-running onboarding updates existing projects instead of creating duplicates
 * - Same initiative in same repo always gets same ID
 * - Enables "merge" vs "replace" behavior during import
 *
 * Uses null byte (\0) as separator since it cannot appear in valid file paths
 * or workspace IDs, preventing collision attacks with carefully crafted inputs.
 *
 * @param parts - Array of strings to hash together
 * @returns 16-character hex string (collision-resistant for this use case)
 */
export function generateDeterministicId(parts: string[]): string {
  // Use null byte as separator - cannot appear in valid paths or IDs
  const input = parts.join('\0');
  const hash = createHash('sha256').update(input).digest('hex');
  return hash.substring(0, 16);
}

/**
 * Generate a deterministic project ID for an initiative.
 *
 * The ID is derived from:
 * - workspaceId: The Elmer workspace this belongs to
 * - repoSlug: The GitHub repo in "owner/repo" format
 * - initiativePath: The path to the initiative folder (e.g., "initiatives/feature-a")
 *
 * This ensures:
 * - Same initiative always gets same ID across onboarding runs
 * - Different workspaces get different IDs for same repo/path
 * - ID format is human-recognizable (proj_ prefix)
 *
 * @param workspaceId - The workspace ID
 * @param repoSlug - The repo in "owner/repo" format
 * @param initiativePath - Path to the initiative folder
 * @returns Project ID in format "proj_" + 16 hex chars (21 chars total)
 */
export function generateProjectId(
  workspaceId: string,
  repoSlug: string,
  initiativePath: string
): string {
  const id = generateDeterministicId([workspaceId, repoSlug, initiativePath]);
  return `proj_${id}`;
}

/**
 * Generate a deterministic ID for a context path.
 * Used for knowledge, personas, and signals paths.
 *
 * @param workspaceId - The workspace ID
 * @param repoSlug - The repo in "owner/repo" format
 * @param contextType - The type of context (knowledge, personas, signals, prototypes)
 * @param path - The path to the context folder
 * @returns Context path ID in format "ctx_" + 16 hex chars
 */
export function generateContextPathId(
  workspaceId: string,
  repoSlug: string,
  contextType: string,
  path: string
): string {
  const id = generateDeterministicId([workspaceId, repoSlug, contextType, path]);
  return `ctx_${id}`;
}

/**
 * Generate a deterministic ID for an agent definition.
 *
 * @param workspaceId - The workspace ID
 * @param repoSlug - The repo in "owner/repo" format
 * @param agentType - The type of agent (agents_md, skill, command, subagent, rule)
 * @param path - The path to the agent file
 * @returns Agent ID in format "agt_" + 16 hex chars
 */
export function generateAgentId(
  workspaceId: string,
  repoSlug: string,
  agentType: string,
  path: string
): string {
  const id = generateDeterministicId([workspaceId, repoSlug, agentType, path]);
  return `agt_${id}`;
}
