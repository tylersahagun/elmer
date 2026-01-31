/**
 * Pattern Matching for pm-workspace Folder Discovery
 *
 * Identifies initiative folders by matching against known patterns
 * with support for exact matches and plural variations.
 */

// =============================================================================
// TYPES
// =============================================================================

export type FolderType = 'initiative' | 'knowledge' | 'personas' | 'signals';

export interface PatternMatch {
  pattern: string;
  matchType: 'exact' | 'plural' | 'partial';
  confidence: number;
  folderType: FolderType;
}

// =============================================================================
// PATTERN DEFINITIONS
// =============================================================================

/**
 * Initiative folder patterns - exact matches plus plural variations.
 * Per CONTEXT.md: "Moderate - exact matches plus plural variations"
 */
export const INITIATIVE_PATTERNS = [
  'initiatives',
  'initiative',
  'features',
  'feature',
  'projects',
  'project',
  'work',
  'epics',
  'epic',
] as const;

/**
 * Context path patterns - more permissive discovery.
 * Per CONTEXT.md: "More permissive for knowledge/, personas/, signals/"
 */
export const CONTEXT_PATTERNS = {
  knowledge: [
    'knowledge',
    'docs',
    'kb',
    'documentation',
    'pm-workspace-docs',
    'elmer-docs',
  ],
  personas: [
    'personas',
    'persona',
    'team',
    'users',
  ],
  signals: [
    'signals',
    'signal',
    'feedback',
    'insights',
  ],
} as const;

// Map singular to plural for plural variation matching
const PLURAL_PAIRS: Record<string, string> = {
  initiative: 'initiatives',
  feature: 'features',
  project: 'projects',
  epic: 'epics',
  persona: 'personas',
  signal: 'signals',
};

// Reverse mapping for finding singular from plural
const SINGULAR_PAIRS: Record<string, string> = Object.fromEntries(
  Object.entries(PLURAL_PAIRS).map(([singular, plural]) => [plural, singular])
);

// =============================================================================
// MATCHING FUNCTIONS
// =============================================================================

/**
 * Match a folder name against a list of patterns.
 * Returns the best match or null if no match found.
 *
 * @param folderName - The folder name to match
 * @param patterns - Array of patterns to match against
 * @param folderType - The type of folder being matched (for result metadata)
 * @returns PatternMatch if matched, null otherwise
 */
export function matchFolderPattern(
  folderName: string,
  patterns: readonly string[],
  folderType: FolderType
): PatternMatch | null {
  if (!folderName || folderName.trim() === '') {
    return null;
  }

  const normalized = folderName.toLowerCase().trim();

  // Check exact match first (highest confidence)
  for (const pattern of patterns) {
    if (normalized === pattern.toLowerCase()) {
      return {
        pattern,
        matchType: 'exact',
        confidence: 1.0,
        folderType,
      };
    }
  }

  // Check plural variation match (second highest confidence)
  // e.g., "initiative" matches when "initiatives" is in patterns
  for (const pattern of patterns) {
    const patternLower = pattern.toLowerCase();

    // Check if folder is singular form of a plural pattern
    const singularOfPattern = SINGULAR_PAIRS[patternLower];
    if (singularOfPattern && normalized === singularOfPattern) {
      return {
        pattern,
        matchType: 'plural',
        confidence: 0.9,
        folderType,
      };
    }

    // Check if folder is plural form of a singular pattern
    const pluralOfPattern = PLURAL_PAIRS[patternLower];
    if (pluralOfPattern && normalized === pluralOfPattern) {
      return {
        pattern,
        matchType: 'plural',
        confidence: 0.9,
        folderType,
      };
    }
  }

  return null;
}

/**
 * Match a folder name specifically against initiative patterns.
 */
export function matchInitiativePattern(folderName: string): PatternMatch | null {
  return matchFolderPattern(folderName, INITIATIVE_PATTERNS, 'initiative');
}

/**
 * Match a folder name against all context patterns and return matches by type.
 */
export function matchContextPatterns(folderName: string): PatternMatch | null {
  // Try each context pattern type
  for (const [type, patterns] of Object.entries(CONTEXT_PATTERNS)) {
    const match = matchFolderPattern(
      folderName,
      patterns,
      type as FolderType
    );
    if (match) {
      return match;
    }
  }
  return null;
}

/**
 * Attempt to match a folder name against all known patterns (initiative + context).
 */
export function matchAnyPattern(folderName: string): PatternMatch | null {
  // Try initiative patterns first
  const initiativeMatch = matchInitiativePattern(folderName);
  if (initiativeMatch) {
    return initiativeMatch;
  }

  // Then try context patterns
  return matchContextPatterns(folderName);
}

/**
 * Rank multiple pattern matches by confidence.
 * Per CONTEXT.md: "Show all candidate folders with equal weight" - but still
 * provide confidence for UI sorting purposes.
 *
 * @param matches - Array of pattern matches to rank
 * @returns Sorted array (descending by confidence)
 */
export function rankFolderMatch(matches: PatternMatch[]): PatternMatch[] {
  return [...matches].sort((a, b) => b.confidence - a.confidence);
}

/**
 * Check if a folder name matches any known pm-workspace pattern.
 */
export function isPmWorkspaceFolder(folderName: string): boolean {
  return matchAnyPattern(folderName) !== null;
}
