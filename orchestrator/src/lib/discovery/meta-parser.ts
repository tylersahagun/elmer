/**
 * Permissive _meta.json Parser
 *
 * Handles real-world variations in _meta.json files with graceful
 * error handling for malformed content.
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Permissive schema for _meta.json files.
 * All fields are optional to handle real-world variations.
 */
export interface MetaJsonSchema {
  // Status fields (checked in priority order: status > stage > state)
  status?: string;
  stage?: string;
  state?: string;

  // Common metadata
  name?: string;
  title?: string;
  description?: string;
  archived?: boolean;

  // Timestamps
  created?: string;
  updated?: string;

  // Taxonomy
  tags?: string[];

  // Allow any other fields for forward compatibility
  [key: string]: unknown;
}

/**
 * Result from parsing a _meta.json file.
 */
export interface ParsedMeta {
  success: true;
  data: MetaJsonSchema;
  raw: unknown; // Original parsed JSON
}

/**
 * Error result from parsing a _meta.json file.
 */
export interface ParseError {
  success: false;
  error: string;
  details?: {
    line?: number;
    column?: number;
    position?: number;
  };
}

export type ParseResult = ParsedMeta | ParseError;

/**
 * Extracted status information from a _meta.json file.
 */
export interface ExtractedStatus {
  value: string | null;
  source: 'status' | 'stage' | 'state' | 'none';
  archived: boolean;
}

// =============================================================================
// PARSING FUNCTIONS
// =============================================================================

/**
 * Try to extract line and column from a JSON parse error message.
 * Different JS engines format these differently.
 */
function extractErrorPosition(message: string): {
  line?: number;
  column?: number;
  position?: number;
} {
  const details: { line?: number; column?: number; position?: number } = {};

  // Try to extract position (common in Node.js)
  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    details.position = parseInt(posMatch[1], 10);
  }

  // Try to extract line number
  const lineMatch = message.match(/line\s+(\d+)/i);
  if (lineMatch) {
    details.line = parseInt(lineMatch[1], 10);
  }

  // Try to extract column
  const colMatch = message.match(/column\s+(\d+)/i);
  if (colMatch) {
    details.column = parseInt(colMatch[1], 10);
  }

  return details;
}

/**
 * Parse a _meta.json file content string.
 *
 * @param content - The raw file content
 * @returns ParseResult - Either success with data or error with details
 */
export function parseMetaJson(content: string): ParseResult {
  // Handle empty content
  if (!content || content.trim() === '') {
    return {
      success: false,
      error: 'Empty file content',
    };
  }

  // Try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown parse error';
    return {
      success: false,
      error: `Invalid JSON: ${message}`,
      details: extractErrorPosition(message),
    };
  }

  // Validate structure - must be an object (not array, string, number, null)
  if (parsed === null) {
    return {
      success: false,
      error: 'Invalid structure: expected object, got null',
    };
  }

  if (Array.isArray(parsed)) {
    return {
      success: false,
      error: 'Invalid structure: expected object, got array',
    };
  }

  if (typeof parsed !== 'object') {
    return {
      success: false,
      error: `Invalid structure: expected object, got ${typeof parsed}`,
    };
  }

  // Cast to MetaJsonSchema (permissive)
  const data = parsed as MetaJsonSchema;

  return {
    success: true,
    data,
    raw: parsed,
  };
}

/**
 * Extract status from a parsed _meta.json.
 * Checks fields in priority order: status > stage > state
 *
 * @param meta - The parsed metadata object
 * @returns ExtractedStatus with value, source field, and archived flag
 */
export function extractStatus(meta: MetaJsonSchema): ExtractedStatus {
  // Check archived flag
  const archived = meta.archived === true;

  // Check status field first (highest priority)
  if (meta.status !== undefined && meta.status !== null) {
    const value = String(meta.status).trim();
    if (value !== '') {
      return {
        value,
        source: 'status',
        archived,
      };
    }
  }

  // Check stage field second
  if (meta.stage !== undefined && meta.stage !== null) {
    const value = String(meta.stage).trim();
    if (value !== '') {
      return {
        value,
        source: 'stage',
        archived,
      };
    }
  }

  // Check state field third
  if (meta.state !== undefined && meta.state !== null) {
    const value = String(meta.state).trim();
    if (value !== '') {
      return {
        value,
        source: 'state',
        archived,
      };
    }
  }

  // No status found
  return {
    value: null,
    source: 'none',
    archived,
  };
}

/**
 * Parse and extract status in one step.
 * Convenience function for common use case.
 *
 * @param content - The raw _meta.json file content
 * @returns ExtractedStatus or null if parsing failed
 */
export function parseAndExtractStatus(content: string): ExtractedStatus | null {
  const result = parseMetaJson(content);
  if (!result.success) {
    return null;
  }
  return extractStatus(result.data);
}

/**
 * Type guard to check if a parse result is successful.
 */
export function isParseSuccess(result: ParseResult): result is ParsedMeta {
  return result.success === true;
}

/**
 * Type guard to check if a parse result is an error.
 */
export function isParseError(result: ParseResult): result is ParseError {
  return result.success === false;
}
