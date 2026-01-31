/**
 * GitHub Writeback Types
 *
 * Type definitions for the GitHub writeback system that enables
 * committing documents and prototypes to GitHub repositories.
 */

/**
 * Configuration for a writeback operation.
 * Contains all information needed to commit to a GitHub repository.
 */
export interface WritebackConfig {
  workspaceId: string;
  projectId: string;
  projectName: string;
  owner: string;
  repo: string;
  branch: string;
  basePath?: string; // e.g., "initiatives/" or submodule path
}

/**
 * A single file to commit to GitHub.
 */
export interface WritebackFile {
  path: string; // Full path in repo (e.g., "initiatives/feature-a/prd.md")
  content: string; // File content
  encoding?: "utf-8" | "base64";
}

/**
 * Result of a commit operation.
 */
export interface WritebackResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
  filesWritten?: string[];
}

/**
 * Metadata to include in commit message.
 * Provides context about what triggered the commit.
 */
export interface CommitMetadata {
  projectId: string;
  projectName: string;
  documentType?: string; // "prd" | "design_brief" | "prototype_notes" | etc.
  triggeredBy?: string; // "automation" | "user" | stage run ID
  stageRunId?: string;
}

/**
 * Options for computing document paths in the repository.
 */
export interface DocumentPathOptions {
  projectName: string;
  documentType: string;
  basePath?: string; // Override default "initiatives/"
  submodulePath?: string; // For prototype submodule paths
}

/**
 * Options for computing prototype paths in the repository.
 */
export interface PrototypePathOptions {
  projectName: string;
  submodulePath?: string; // e.g., "elephant-ai/web"
  componentSuffix?: string; // e.g., "Prototype" (default: "")
}
