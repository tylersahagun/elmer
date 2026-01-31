---
phase: 02
plan: 02
subsystem: discovery-types
tags: [typescript, types, id-generation, idempotency]

dependency-graph:
  requires: []
  provides: [discovery-types, deterministic-ids, barrel-exports]
  affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

tech-stack:
  added: []
  patterns: [deterministic-id-generation, sha256-hashing, barrel-exports]

key-files:
  created:
    - src/lib/discovery/types.ts
    - src/lib/discovery/id-generator.ts
    - src/lib/discovery/index.ts
    - src/lib/discovery/__tests__/id-generator.test.ts
  modified: []

decisions:
  - id: null-byte-separator
    choice: Use null byte as ID hash separator
    rationale: Prevents collision attacks with crafted inputs containing delimiter
  - id: prefixed-ids
    choice: Prefix IDs with type indicator (proj_, ctx_, agt_)
    rationale: Human-readable IDs for debugging and logs

metrics:
  duration: 6m
  completed: 2026-01-26
---

# Phase 02 Plan 02: Type System & ID Generation Summary

**One-liner:** TypeScript types and SHA-256 deterministic ID generation for idempotent discovery imports

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 23511b2 | feat | Create discovery types module with DiscoveryResult, DiscoveredInitiative, etc. |
| bd844f9 | feat | Create deterministic ID generator with 22 tests |
| 5532322 | feat | Create barrel file for clean imports |

## What Was Built

### Discovery Types (`src/lib/discovery/types.ts`)

Comprehensive TypeScript types for the entire discovery system:

- **DiscoveryResult**: Top-level result from scanning a GitHub repo
- **DiscoveredInitiative**: Initiative with deterministic ID, status mapping, and selection state
- **DiscoveredContextPath**: Knowledge, personas, signals path discovery
- **DiscoveredAgent**: Agent definition (skills, commands, rules)
- **ImportSelection**: User's choices for what to import
- **ImportResult**: Outcome of population operation
- **PreviewGroup**: UI grouping by target column

### Deterministic ID Generator (`src/lib/discovery/id-generator.ts`)

SHA-256 based ID generation for idempotent imports:

- `generateDeterministicId(parts)`: Core hashing function
- `generateProjectId(workspaceId, repoSlug, path)`: `proj_` + 16 hex chars
- `generateContextPathId(workspaceId, repoSlug, type, path)`: `ctx_` + 16 hex chars
- `generateAgentId(workspaceId, repoSlug, type, path)`: `agt_` + 16 hex chars

**Key feature:** Uses null byte separator to prevent collision attacks with crafted inputs.

### Barrel File (`src/lib/discovery/index.ts`)

Clean single-import for all discovery functionality:

```typescript
import {
  DiscoveryResult,
  DiscoveredInitiative,
  generateProjectId,
  matchFolderPattern,
  parseMetaJson,
  mapStatusToColumn,
} from '@/lib/discovery';
```

## Test Coverage

22 tests for ID generator covering:
- Determinism (same inputs = same ID)
- Uniqueness (different inputs = different IDs)
- Format validation (prefix + 16 hex chars)
- Stability across multiple calls
- Edge cases (empty arrays, special characters)
- Collision resistance with similar inputs

## Decisions Made

### Null Byte Separator for ID Hashing

**Decision:** Use `\0` (null byte) instead of `|` as separator in hash input.

**Rationale:** Null bytes cannot appear in valid file paths or workspace IDs, preventing collision attacks where carefully crafted inputs like `['a', 'b|c']` would collide with `['a|b', 'c']`.

### Prefixed ID Format

**Decision:** Use `proj_`, `ctx_`, `agt_` prefixes before the 16-character hash.

**Rationale:** Makes IDs human-readable in logs and debugging while maintaining collision resistance.

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

### For Discovery Engine (02-03)

```typescript
import { generateProjectId, DiscoveredInitiative } from '@/lib/discovery';

const initiative: DiscoveredInitiative = {
  id: generateProjectId(workspaceId, repoSlug, sourcePath),
  // ... other fields
};
```

### For Population Engine (02-06)

```typescript
import { ImportSelection, ImportResult } from '@/lib/discovery';

async function importDiscoveries(
  result: DiscoveryResult,
  selection: ImportSelection
): Promise<ImportResult> {
  // Use deterministic IDs for upsert operations
}
```

## Verification Results

- TypeScript compiles without errors in discovery module
- All 22 ID generator tests pass
- Barrel file exports all modules correctly
- Integration ready for plans 02-03 through 02-08

## Next Phase Readiness

**Ready for:** Plans 02-03 (Discovery Engine) through 02-08 can now import from `@/lib/discovery` to use these types and ID generators.

**No blockers identified.**
