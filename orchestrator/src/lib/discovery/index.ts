// Types
export * from './types';

// ID generator (for deterministic project IDs)
export * from './id-generator';

// Core discovery modules (created in parallel plan 02-01)
// These exports will work once 02-01 completes
export * from './patterns';
export * from './meta-parser';
export * from './status-mapper';

// Repository scanner (main orchestration module)
export * from './scanner';

// Population engine (imports discovered items into database)
export * from './population-engine';

// Streaming utilities (SSE infrastructure for real-time progress)
export * from './streaming';

// Streaming scanner (wraps scanner with progress callbacks)
export * from './streaming-scanner';

// Submodule detection (Phase 4 - detects Git submodules)
export * from './submodule-detector';

// Ambiguity detection (Phase 4 - identifies situations requiring user input)
export * from './ambiguity-detector';
