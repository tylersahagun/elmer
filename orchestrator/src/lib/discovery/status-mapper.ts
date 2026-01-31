/**
 * Fuzzy Status to Column Mapper
 *
 * Maps status strings from _meta.json files to Kanban columns
 * using fuzzy matching with ambiguity detection.
 */

import type { ProjectStage } from '@/lib/db/schema';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result from mapping a status string to a column.
 */
export interface MappingResult {
  /** The mapped column name, or null if no match found */
  column: ProjectStage | null;
  /** Confidence score (0-1) */
  confidence: number;
  /** Whether the mapping is ambiguous (multiple possible interpretations) */
  isAmbiguous: boolean;
  /** Alternative column matches when ambiguous */
  alternatives?: ProjectStage[];
  /** The original status string */
  originalStatus: string;
  /** The normalized status string used for matching */
  normalizedStatus: string;
}

// =============================================================================
// STATUS ALIASES
// =============================================================================

/**
 * Mapping of canonical column names to their aliases.
 * Aliases are checked for exact match after normalization.
 */
export const STATUS_ALIASES: Record<ProjectStage, readonly string[]> = {
  inbox: ['inbox', 'new', 'triage', 'backlog', 'pending', 'queued'],
  discovery: ['discovery', 'disc', 'research', 'exploring', 'ideation', 'investigate'],
  prd: ['prd', 'requirements', 'spec', 'specification', 'specs', 'product-requirements'],
  design: ['design', 'ux', 'ui', 'wireframe', 'wireframes', 'mockup', 'mockups'],
  prototype: ['prototype', 'proto', 'poc', 'mvp', 'proof-of-concept'],
  validate: ['validate', 'validation', 'testing', 'qa', 'test', 'verify', 'verification'],
  tickets: ['tickets', 'jira', 'linear', 'issues', 'stories', 'user-stories'],
  build: ['build', 'development', 'dev', 'in-progress', 'coding', 'implementation', 'implement', 'developing', 'engineering'],
  alpha: ['alpha', 'internal', 'internal-release', 'internal-testing', 'alpha-testing'],
  beta: ['beta', 'beta-testing', 'external-testing', 'limited-release', 'early-access'],
  ga: ['ga', 'production', 'released', 'live', 'shipped', 'launched', 'general-availability', 'complete', 'done'],
} as const;

/**
 * List of known columns (canonical names).
 */
export const KNOWN_COLUMNS: readonly ProjectStage[] = [
  'inbox',
  'discovery',
  'prd',
  'design',
  'prototype',
  'validate',
  'tickets',
  'build',
  'alpha',
  'beta',
  'ga',
] as const;

// Build reverse lookup from alias to column
const ALIAS_TO_COLUMN: Map<string, ProjectStage> = new Map();
for (const [column, aliases] of Object.entries(STATUS_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_COLUMN.set(alias.toLowerCase(), column as ProjectStage);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize a status string for matching.
 * - Lowercase
 * - Trim whitespace
 * - Replace underscores and dashes with nothing (for word matching)
 * - Collapse multiple spaces
 */
export function normalizeStatus(status: string): string {
  return status
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, '-')  // Normalize separators to dash
    .replace(/\s+/g, '-')    // Spaces to dashes
    .replace(/-+/g, '-')     // Collapse multiple dashes
    .replace(/^-|-$/g, '');  // Remove leading/trailing dashes
}

/**
 * Check if a status string contains multiple stage indicators,
 * which would make it ambiguous.
 */
function detectAmbiguity(normalizedStatus: string): ProjectStage[] {
  const matches: Set<ProjectStage> = new Set();

  // Check each column's aliases
  for (const [column, aliases] of Object.entries(STATUS_ALIASES)) {
    for (const alias of aliases) {
      const normalizedAlias = alias.toLowerCase();
      // Check if the status contains this alias as a word/segment
      if (normalizedStatus.includes(normalizedAlias)) {
        matches.add(column as ProjectStage);
      }
    }
  }

  return Array.from(matches);
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Map a status string to a Kanban column using fuzzy matching.
 *
 * @param status - The status string from _meta.json
 * @returns MappingResult with column, confidence, and ambiguity info
 */
export function mapStatusToColumn(status: string): MappingResult {
  const normalizedStatus = normalizeStatus(status);
  const originalStatus = status;

  // Empty status
  if (normalizedStatus === '') {
    return {
      column: null,
      confidence: 0,
      isAmbiguous: false,
      originalStatus,
      normalizedStatus,
    };
  }

  // 1. Try exact match against aliases (highest confidence)
  const exactMatch = ALIAS_TO_COLUMN.get(normalizedStatus);
  if (exactMatch) {
    return {
      column: exactMatch,
      confidence: 1.0,
      isAmbiguous: false,
      originalStatus,
      normalizedStatus,
    };
  }

  // 2. Check for ambiguity before fuzzy matching
  const potentialMatches = detectAmbiguity(normalizedStatus);

  // If multiple columns detected in the status, it's ambiguous
  if (potentialMatches.length > 1) {
    // Return the first match but flag as ambiguous
    return {
      column: potentialMatches[0],
      confidence: 0.5,
      isAmbiguous: true,
      alternatives: potentialMatches.slice(1),
      originalStatus,
      normalizedStatus,
    };
  }

  // 3. Try fuzzy matching - check if status starts with any alias
  for (const [alias, column] of ALIAS_TO_COLUMN.entries()) {
    if (normalizedStatus.startsWith(alias) || normalizedStatus.endsWith(alias)) {
      return {
        column,
        confidence: 0.8,
        isAmbiguous: false,
        originalStatus,
        normalizedStatus,
      };
    }
  }

  // 4. Try fuzzy matching - check if any alias is contained in status
  for (const [alias, column] of ALIAS_TO_COLUMN.entries()) {
    if (alias.length >= 3 && normalizedStatus.includes(alias)) {
      return {
        column,
        confidence: 0.7,
        isAmbiguous: false,
        originalStatus,
        normalizedStatus,
      };
    }
  }

  // 5. No match found
  return {
    column: null,
    confidence: 0,
    isAmbiguous: false,
    originalStatus,
    normalizedStatus,
  };
}

/**
 * Create a dynamic column name from an unmatched status.
 * Per CONTEXT.md: "Create columns dynamically to match discovered statuses"
 *
 * @param status - The original status string
 * @returns Formatted column name suitable for display
 */
export function createDynamicColumn(status: string): string {
  // Normalize but preserve case structure for display
  const trimmed = status.trim();

  // If already looks like a proper name (Title Case or includes spaces), use as-is
  if (/^[A-Z]/.test(trimmed) && /\s/.test(trimmed)) {
    return trimmed;
  }

  // Convert kebab-case or snake_case to Title Case
  return trimmed
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a column name is one of the known/standard columns.
 *
 * @param column - The column name to check
 * @returns true if it's a known column
 */
export function isKnownColumn(column: string): column is ProjectStage {
  return KNOWN_COLUMNS.includes(column as ProjectStage);
}

/**
 * Get all aliases for a given column.
 *
 * @param column - The column to get aliases for
 * @returns Array of aliases, or empty array if column not found
 */
export function getColumnAliases(column: ProjectStage): readonly string[] {
  return STATUS_ALIASES[column] ?? [];
}

/**
 * Map status and return either the known column or a dynamic column name.
 * Convenience function for the common use case.
 *
 * @param status - The status string from _meta.json
 * @returns Object with column name and metadata
 */
export function mapStatusWithFallback(status: string): {
  column: string;
  isKnown: boolean;
  confidence: number;
  isAmbiguous: boolean;
  alternatives?: string[];
} {
  const result = mapStatusToColumn(status);

  if (result.column) {
    return {
      column: result.column,
      isKnown: true,
      confidence: result.confidence,
      isAmbiguous: result.isAmbiguous,
      alternatives: result.alternatives,
    };
  }

  // Create dynamic column for unmatched status
  return {
    column: createDynamicColumn(status),
    isKnown: false,
    confidence: 0,
    isAmbiguous: false,
  };
}
