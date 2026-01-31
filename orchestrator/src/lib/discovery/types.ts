import type { ProjectStage } from "@/lib/db/schema";

/**
 * Discovery result from scanning a GitHub repository
 */
export interface DiscoveryResult {
  // Metadata
  repoOwner: string;
  repoName: string;
  branch: string;
  scannedAt: string;

  // Discovered items
  initiatives: DiscoveredInitiative[];
  contextPaths: DiscoveredContextPath[];
  agents: DiscoveredAgent[];

  // Statistics
  stats: DiscoveryStats;

  // Errors/warnings encountered
  warnings: DiscoveryWarning[];
}

export interface DiscoveryStats {
  foldersScanned: number;
  initiativesFound: number;
  contextPathsFound: number;
  agentsFound: number;
  prototypesFound: number;
  metaJsonParsed: number;
  metaJsonErrors: number;
}

export interface DiscoveryWarning {
  type: "meta_parse_error" | "ambiguous_status" | "missing_meta" | "api_error";
  path: string;
  message: string;
}

/**
 * A discovered initiative (maps to a project)
 */
export interface DiscoveredInitiative {
  // Deterministic ID for idempotency (DISC-09)
  id: string;

  // Source information
  sourcePath: string; // e.g., "initiatives/feature-a" or "pm-workspace-docs/initiatives/feature-a"
  sourceFolder: string; // e.g., "initiatives" or "pm-workspace-docs/initiatives"
  docsRoot?: string; // e.g., "pm-workspace-docs" if initiative is inside a docs root folder
  name: string; // Derived from folder name or _meta.json

  // Status mapping
  status: string | null; // Raw status from _meta.json
  mappedColumn: string; // Column to place in (may be dynamic)
  statusConfidence: number; // 0-1 confidence in mapping
  isStatusAmbiguous: boolean; // Needs user review

  // Metadata from _meta.json
  description: string | null;
  archived: boolean;
  tags: string[];
  rawMeta: Record<string, unknown> | null;

  // Discovery metadata
  patternMatch: {
    pattern: string;
    matchType: "exact" | "plural" | "partial";
    confidence: number;
  };

  // Selection state (for import UI)
  selected: boolean;

  // Discovered prototypes for this initiative
  prototypes: DiscoveredPrototype[];
}

/**
 * A discovered prototype within an initiative
 */
export interface DiscoveredPrototype {
  name: string; // Display name (e.g., "Flagship Meeting Recap")
  path: string; // Full path in repo (e.g., "web/src/components/prototypes/FlagshipMeetingRecap/v1")
  storybookPath: string | null; // Story identifier (e.g., "prototypes-flagshipmeetingrecap--default")
  stories: string[]; // Story IDs found in *.stories.tsx files
  version: string | null; // Version if versioned (e.g., "v1")
  branch: string | null; // Git branch where prototype exists
}

/**
 * A discovered context path (knowledge, personas, signals)
 */
export interface DiscoveredContextPath {
  type: "knowledge" | "personas" | "signals" | "prototypes";
  path: string;
  confidence: number;
  fileCount: number;
  selected: boolean;
}

/**
 * A discovered agent definition
 */
export interface DiscoveredAgent {
  type: "agents_md" | "skill" | "command" | "subagent" | "rule";
  name: string;
  path: string;
  description: string | null;
  selected: boolean;
}

/**
 * User's import selections
 */
export interface ImportSelection {
  initiatives: string[]; // IDs of selected initiatives
  contextPaths: string[]; // Paths of selected context paths
  agents: string[]; // Paths of selected agents
  createDynamicColumns: boolean;
}

/**
 * Import result after population
 */
export interface ImportResult {
  success: boolean;
  projectsCreated: number;
  projectsUpdated: number;
  columnsCreated: string[];
  knowledgeSynced: number;
  personasSynced: number;
  signalsSynced: number;
  agentsImported: number;
  documentsImported: number;
  prototypesImported: number;
  errors: string[];
}

/**
 * Preview grouping for UI display
 * Per CONTEXT.md: "Group discovered items by target column"
 */
export interface PreviewGroup {
  column: string;
  isDynamic: boolean; // Column doesn't exist yet
  initiatives: DiscoveredInitiative[];
}

/**
 * Real-time discovery progress tracking
 * Used for SSE streaming updates during repository scanning
 */
export interface DiscoveryProgress {
  foldersScanned: number;
  totalFolders: number;
  currentFolder: string | null;
  initiativesFound: number;
  contextPathsFound: number;
  agentsFound: number;
  elapsedMs: number;
  estimatedRemainingMs: number | null;
}

/**
 * A detected Git submodule
 */
export interface DiscoveredSubmodule {
  name: string; // Submodule name from .gitmodules
  path: string; // Local path in repo (e.g., "elephant-ai")
  url: string; // Remote URL of submodule
  branch?: string; // Optional branch specification

  // Scan state
  canScan: boolean; // Whether we can scan this submodule
  scanError?: string; // Error if we can't scan
  requiresAuth: boolean; // Needs separate authentication

  // Discovery results (populated after scanning)
  scanned: boolean; // Has this been scanned?
  initiatives: DiscoveredInitiative[];
  contextPaths: DiscoveredContextPath[];
  prototypePath?: string; // If prototypes folder found
}

/**
 * Extended discovery result with submodule support
 */
export interface DiscoveryResultWithSubmodules extends DiscoveryResult {
  submodules: DiscoveredSubmodule[];
  hasSubmodules: boolean;
}

// Re-export ProjectStage for consumers who need both discovery types and stages
export type { ProjectStage };

// =============================================================================
// AMBIGUITY DETECTION TYPES
// =============================================================================

/**
 * Types of ambiguities that require user clarification
 */
export type AmbiguityType =
  | "multiple_initiative_folders" // Found /features/ AND /work/
  | "multiple_context_paths" // Found /docs/ AND /knowledge/
  | "ambiguous_status_mapping" // Status could map to multiple columns
  | "nested_structure" // Found initiatives inside initiatives
  | "submodule_detected"; // Submodule found, need to confirm scan

/**
 * A detected ambiguity requiring user input
 */
export interface DiscoveryAmbiguity {
  id: string; // Unique ID for this ambiguity
  type: AmbiguityType;
  question: string; // Human-readable question to ask
  options: AmbiguityOption[]; // Possible answers
  context: {
    // Additional context for UI
    paths?: string[]; // Relevant file paths
    confidence?: number; // How confident we are in our guess
  };
  resolved: boolean; // Has user answered?
  selectedOptionId?: string; // User's choice
}

/**
 * An option for resolving an ambiguity
 */
export interface AmbiguityOption {
  id: string;
  label: string; // Display text
  description?: string; // Additional explanation
  value: unknown; // The value to use if selected
  recommended?: boolean; // Is this the suggested option?
}

/**
 * Extended discovery result with ambiguities
 */
export interface DiscoveryResultWithAmbiguities extends DiscoveryResult {
  ambiguities: DiscoveryAmbiguity[];
}
