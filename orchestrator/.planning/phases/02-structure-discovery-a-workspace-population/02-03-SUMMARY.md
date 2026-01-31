---
phase: 02
plan: 03
subsystem: discovery-scanner
tags: [github-api, tree-scanning, pattern-matching, api-endpoint]

dependency-graph:
  requires: [02-01, 02-02]
  provides: [repository-scanning, discovery-api, initiative-detection, context-path-detection, agent-detection]
  affects: [02-04, 02-05, 02-06, 02-07, 02-08]

tech-stack:
  added: []
  patterns: [recursive-tree-api, octokit-integration, next-api-routes]

key-files:
  created:
    - src/lib/discovery/scanner.ts
    - src/lib/discovery/__tests__/scanner.test.ts
    - src/app/api/discovery/route.ts
    - src/app/api/discovery/__tests__/route.test.ts
  modified:
    - src/lib/discovery/index.ts

decisions:
  - id: recursive-tree-api
    choice: Use GitHub tree API with recursive=true for single API call
    rationale: Per P5 pitfall - avoids rate limit exhaustion on large repos
  - id: branch-priority
    choice: Branch order - onboarding data > settings > default "main"
    rationale: Preserves user's branch selection from onboarding flow
  - id: initiative-subdirectory
    choice: Scan subdirectories of pattern-matched folders for actual initiatives
    rationale: "initiatives/feature-a" is the initiative, not "initiatives" itself

metrics:
  duration: 11m
  completed: 2026-01-26
---

# Phase 02 Plan 03: Repository Scanner & Discovery API Summary

**One-liner:** Repository scanner orchestrates GitHub tree scanning and returns structured discovery results via API endpoint

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 3b61b0b | feat | Create repository scanner module with 18 tests |
| af09b97 | feat | Create discovery API endpoint with 12 tests |

## What Was Built

### Repository Scanner (`src/lib/discovery/scanner.ts`)

Main orchestration module that scans a GitHub repository for pm-workspace structures:

**scanRepository(options: ScanOptions): Promise<DiscoveryResult>**

1. **Tree Fetching:** Uses `octokit.git.getTree` with `recursive=true` for single API call (per P5 pitfall)

2. **Initiative Discovery:**
   - Finds top-level folders matching INITIATIVE_PATTERNS (initiatives, features, projects, work, epics)
   - Scans subdirectories as actual initiatives
   - Fetches and parses _meta.json files for metadata
   - Maps statuses to columns using fuzzy mapper
   - Generates deterministic IDs for idempotent imports

3. **Context Path Discovery:**
   - Detects knowledge/ (docs/, kb/), personas/, signals/, prototypes/ folders
   - Counts files in each detected path
   - Uses CONTEXT_PATTERNS for matching

4. **Agent Discovery:**
   - Checks for AGENTS.md at root
   - Scans .cursor/skills/, .cursor/commands/, .cursor/rules/
   - Detects .cursorrules legacy file

5. **Error Handling:**
   - Continues scanning on individual file failures
   - Collects warnings for parse errors, missing files, ambiguous statuses
   - Returns partial results when possible

### Discovery API (`src/app/api/discovery/route.ts`)

**GET /api/discovery?workspaceId=xxx**

- Validates authentication via `auth()`
- Validates workspace exists and has connected repository
- Gets branch from: onboarding data > settings > "main" default
- Returns 403 with connectUrl when GitHub not linked
- Calls scanRepository and returns DiscoveryResult JSON

### Barrel File Updates

Added export for scanner module:
```typescript
export * from './scanner';
```

## Test Coverage

**Scanner Tests (18):**
- Initiative discovery with/without _meta.json
- Archived initiative handling
- Multiple initiative pattern support
- Context path discovery (knowledge, personas, signals)
- Alternative knowledge paths (docs, kb)
- Agent discovery (.cursor/, AGENTS.md, .cursorrules)
- Parse error handling
- API error handling
- Ambiguous status flagging
- Deterministic ID generation
- Result structure validation

**API Tests (12):**
- Authentication validation (401)
- Parameter validation (400)
- Workspace not found (404)
- No repository connected (400)
- GitHub not connected (403 with connectUrl)
- Branch priority (onboarding > settings > default)
- Discovery result passthrough
- Error handling (500)

## Decisions Made

### Recursive Tree API
**Decision:** Use `recursive=true` parameter for GitHub tree API
**Rationale:** Single API call fetches entire repo structure, avoiding rate limit exhaustion per P5 pitfall from research

### Branch Selection Priority
**Decision:** Check onboarding data first, then settings, then default to "main"
**Rationale:** Preserves user's branch selection from onboarding flow while providing fallbacks

### Initiative Subdirectory Pattern
**Decision:** Pattern-matched folders contain initiatives as subdirectories
**Rationale:** The initiative is "initiatives/feature-a", not "initiatives" folder itself. This matches how pm-workspace structures organize projects.

## Deviations from Plan

None - plan executed exactly as written.

## Integration Points

### For Preview UI (02-04)
```typescript
import { scanRepository, DiscoveryResult } from '@/lib/discovery';

// Fetch discovery results
const response = await fetch(`/api/discovery?workspaceId=${id}`);
const result: DiscoveryResult = await response.json();

// Display initiatives grouped by target column
result.initiatives.forEach(initiative => {
  console.log(`${initiative.name} -> ${initiative.mappedColumn}`);
});
```

### For Selection UI (02-05)
```typescript
// DiscoveredInitiative has selected: boolean flag
// Pre-selected = !archived
initiative.selected = true; // user can toggle

// DiscoveredContextPath has selected: boolean flag
contextPath.selected = true; // user can toggle
```

### For Population Engine (02-06)
```typescript
import { DiscoveryResult, ImportSelection } from '@/lib/discovery';

// Scanner returns items with deterministic IDs
initiative.id // proj_abc123... (idempotent)

// Use IDs for upsert operations during import
```

## Verification Results

- TypeScript compiles without errors in discovery module
- Scanner tests: 18 passed
- API tests: 12 passed
- Total discovery module tests: 197 passed (including 02-01, 02-02)
- API endpoint file exists and is accessible

## Next Phase Readiness

**Ready for:**
- Plan 02-04 (Preview UI) - can call GET /api/discovery and display results
- Plan 02-05 (Selection UI) - DiscoveredInitiative.selected flag ready for toggling
- Plan 02-06 (Population Engine) - deterministic IDs enable idempotent imports

**No blockers identified.**

---
*Phase: 02-structure-discovery-a-workspace-population*
*Completed: 2026-01-26*
