/**
 * Ambiguity Detector Module
 *
 * Analyzes discovery results to identify situations requiring user clarification.
 * Implements CONV-01 (system asks clarifying questions when structure is ambiguous).
 */

import type {
  DiscoveryResult,
  DiscoveredInitiative,
  DiscoveredContextPath,
  DiscoveryAmbiguity,
  AmbiguityType,
  AmbiguityOption,
} from './types';

/**
 * Generate a unique ID for an ambiguity
 */
function generateAmbiguityId(type: AmbiguityType, paths: string[]): string {
  const hash = paths.sort().join('|');
  return `amb_${type}_${hash.slice(0, 16)}`;
}

/**
 * Detect multiple initiative folder ambiguity
 *
 * Triggered when repo has multiple top-level folders matching initiative patterns
 * (e.g., both /features/ and /work/)
 */
function detectMultipleInitiativeFolders(
  result: DiscoveryResult
): DiscoveryAmbiguity | null {
  // Group initiatives by their source folder
  const sourceFolders = new Set(
    result.initiatives.map(i => i.sourceFolder)
  );

  if (sourceFolders.size <= 1) {
    return null;
  }

  const folders = Array.from(sourceFolders);

  // Build options for each folder
  const options: AmbiguityOption[] = folders.map(folder => {
    const count = result.initiatives.filter(i => i.sourceFolder === folder).length;
    return {
      id: folder.replace(/\//g, '_'),
      label: `/${folder}/`,
      description: `Contains ${count} initiative${count === 1 ? '' : 's'}`,
      value: folder,
      recommended: folder.toLowerCase() === 'initiatives', // Recommend canonical name
    };
  });

  // Add "use both" option
  options.push({
    id: 'use_all',
    label: 'Use all folders',
    description: `Import from all ${folders.length} folders`,
    value: folders,
    recommended: false,
  });

  return {
    id: generateAmbiguityId('multiple_initiative_folders', folders),
    type: 'multiple_initiative_folders',
    question: `I found multiple folders that could contain your initiatives: ${folders.map(f => '/' + f + '/').join(' and ')}. Which one contains your main work?`,
    options,
    context: {
      paths: folders,
      confidence: 0.5,
    },
    resolved: false,
  };
}

/**
 * Detect multiple context path ambiguity for the same type
 *
 * Triggered when repo has multiple folders for the same context type
 * (e.g., both /docs/ and /knowledge/ for knowledge base)
 */
function detectMultipleContextPaths(
  result: DiscoveryResult
): DiscoveryAmbiguity[] {
  const ambiguities: DiscoveryAmbiguity[] = [];

  // Group by type
  const byType = new Map<string, DiscoveredContextPath[]>();
  for (const cp of result.contextPaths) {
    const existing = byType.get(cp.type) || [];
    existing.push(cp);
    byType.set(cp.type, existing);
  }

  for (const [type, paths] of byType) {
    if (paths.length <= 1) continue;

    const pathStrings = paths.map(p => p.path);
    const options: AmbiguityOption[] = paths.map(p => ({
      id: p.path.replace(/\//g, '_'),
      label: `/${p.path}/`,
      description: `${p.fileCount} file${p.fileCount === 1 ? '' : 's'} found`,
      value: p.path,
      recommended: p.confidence > 0.8,
    }));

    // Find primary (highest confidence)
    const primary = paths.reduce((a, b) => a.confidence > b.confidence ? a : b);

    ambiguities.push({
      id: generateAmbiguityId('multiple_context_paths', pathStrings),
      type: 'multiple_context_paths',
      question: `I found multiple ${type} folders: ${pathStrings.map(p => '/' + p + '/').join(' and ')}. Which one should I use?`,
      options,
      context: {
        paths: pathStrings,
        confidence: primary.confidence,
      },
      resolved: false,
    });
  }

  return ambiguities;
}

/**
 * Detect ambiguous status mappings in initiatives
 *
 * Collects all initiatives with isStatusAmbiguous flag
 */
function detectAmbiguousStatuses(
  result: DiscoveryResult
): DiscoveryAmbiguity[] {
  const ambiguous = result.initiatives.filter(i => i.isStatusAmbiguous);

  if (ambiguous.length === 0) {
    return [];
  }

  // Group by similar status values
  const byStatus = new Map<string, DiscoveredInitiative[]>();
  for (const init of ambiguous) {
    const status = init.status || 'unknown';
    const existing = byStatus.get(status) || [];
    existing.push(init);
    byStatus.set(status, existing);
  }

  const ambiguities: DiscoveryAmbiguity[] = [];

  for (const [status, initiatives] of byStatus) {
    const paths = initiatives.map(i => i.sourcePath);

    // Create column options based on common mappings
    const columnOptions: AmbiguityOption[] = [
      { id: 'inbox', label: 'Inbox', description: 'New/incoming items', value: 'inbox' },
      { id: 'discovery', label: 'Discovery', description: 'Being researched', value: 'discovery' },
      { id: 'prd', label: 'PRD', description: 'Writing requirements', value: 'prd' },
      { id: 'design', label: 'Design', description: 'In design phase', value: 'design' },
      { id: 'prototype', label: 'Prototype', description: 'Building prototype', value: 'prototype' },
      { id: 'validate', label: 'Validate', description: 'User testing', value: 'validate' },
      { id: 'tickets', label: 'Tickets', description: 'Ready for engineering', value: 'tickets' },
      { id: 'shipped', label: 'Shipped', description: 'Released', value: 'shipped' },
    ];

    ambiguities.push({
      id: generateAmbiguityId('ambiguous_status_mapping', paths),
      type: 'ambiguous_status_mapping',
      question: `The status "${status}" could map to multiple columns. Where should ${initiatives.length === 1 ? `"${initiatives[0].name}"` : `these ${initiatives.length} items`} go?`,
      options: columnOptions,
      context: {
        paths,
        confidence: 0.3,
      },
      resolved: false,
    });
  }

  return ambiguities;
}

/**
 * Main entry point: analyze discovery result and return all ambiguities
 */
export function detectAmbiguities(
  result: DiscoveryResult
): DiscoveryAmbiguity[] {
  const ambiguities: DiscoveryAmbiguity[] = [];

  // Check for multiple initiative folders
  const multipleInitiatives = detectMultipleInitiativeFolders(result);
  if (multipleInitiatives) {
    ambiguities.push(multipleInitiatives);
  }

  // Check for multiple context paths of same type
  ambiguities.push(...detectMultipleContextPaths(result));

  // Check for ambiguous status mappings
  ambiguities.push(...detectAmbiguousStatuses(result));

  return ambiguities;
}

/**
 * Check if discovery result has any unresolved ambiguities
 */
export function hasUnresolvedAmbiguities(
  ambiguities: DiscoveryAmbiguity[]
): boolean {
  return ambiguities.some(a => !a.resolved);
}

/**
 * Get the next unresolved ambiguity (for conversation flow)
 */
export function getNextAmbiguity(
  ambiguities: DiscoveryAmbiguity[]
): DiscoveryAmbiguity | null {
  return ambiguities.find(a => !a.resolved) || null;
}

/**
 * Apply a user's resolution to an ambiguity
 * Returns updated ambiguity with resolved=true
 */
export function resolveAmbiguity(
  ambiguity: DiscoveryAmbiguity,
  selectedOptionId: string
): DiscoveryAmbiguity {
  return {
    ...ambiguity,
    resolved: true,
    selectedOptionId,
  };
}

// Re-export types for consumers
export type { DiscoveryAmbiguity, AmbiguityType, AmbiguityOption };
