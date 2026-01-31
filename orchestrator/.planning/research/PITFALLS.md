# Pitfalls Research: Onboarding & Repository Discovery

**Research Date:** 2026-01-25
**Milestone:** Onboarding carousel, repo structure discovery, initiative auto-population
**Researcher:** Claude (Opus 4.5)

## Executive Summary

This document catalogs critical mistakes that onboarding and repo integration projects commonly make. Each pitfall includes early warning signs, prevention strategies, and phase mapping for when to address it. These are specific to the domain of GitHub-connected workspace tools with auto-discovery.

**Key Insight:** Most pitfalls fall into three categories: (1) assuming uniformity in user repos, (2) blocking UX during async operations, (3) silent failures that erode trust. The "just works" user expectation is the hardest promise to keep.

---

## Category 1: Structure Assumptions

### P1. Hardcoded Folder Name Expectations

**Description:** Assuming all users organize initiatives in `/initiatives/`. Real repos use `/features/`, `/projects/`, `/work/`, `/epics/`, custom names, or nested structures like `/pm/initiatives/`.

**Warning Signs:**
- Discovery returns empty for repos known to have project content
- Test suite only covers `/initiatives/` path
- Code contains string literals like `if (path === '/initiatives/')`
- Users report "Elmer found nothing but I have projects"

**Impact:** Users with existing workflows see empty workspace, assume tool is broken, abandon onboarding.

**Prevention Strategy:**
1. Implement pattern-based discovery with priority ranking, not exact path matching
2. Fall back to conversational disambiguation: "I found folders that might be projects: `/features/`, `/work/`. Which one should I use?"
3. Store discovered path pattern in workspace settings for future syncs
4. Include heuristic signals: presence of `_meta.json`, PRD files, decisions.md

**Phase Mapping:** Discovery phase (Phase 1B in FEATURES.md - Structure Auto-Discovery)

**Code Smell to Avoid:**
```typescript
// BAD
if (folderName === 'initiatives') { ... }

// GOOD
const INITIATIVE_PATTERNS = ['initiatives', 'features', 'projects', 'work', 'epics'];
const isInitiativeFolder = (name: string) =>
  INITIATIVE_PATTERNS.some(p => name.toLowerCase().includes(p)) ||
  hasInitiativeMarkers(folder); // _meta.json, PRD.md presence
```

---

### P2. Flat Structure Assumption

**Description:** Assuming initiatives are direct children of a single root folder. Many repos have nested structures: `/product/initiatives/`, `/teams/core/projects/`, or multi-level organization.

**Warning Signs:**
- Tree traversal stops at depth 1
- Large repos with deep nesting show incomplete discovery
- Recursive flag missing from GitHub tree API calls

**Impact:** Partial discovery creates confusion - some projects appear, others don't, with no clear pattern.

**Prevention Strategy:**
1. Implement depth-limited recursive scanning (max 4 levels to avoid performance issues)
2. Track common parent path for discovered initiatives to detect nested patterns
3. Show scan depth in progress UI: "Scanning... (depth 3 of 4)"
4. Allow user override: "Scan deeper" button if results seem incomplete

**Phase Mapping:** Discovery phase (Phase 1B), Real-time Feedback (Phase 1C)

---

### P3. _meta.json Schema Rigidity

**Description:** Expecting exact schema in `_meta.json` files. Real files have variations: different status names, extra fields, missing required fields, typos.

**Warning Signs:**
- JSON.parse succeeds but downstream code crashes on missing property
- Zod validation rejects valid-looking files
- Users with slightly non-standard meta files see "parse error"

**Impact:** Parsing errors cascade to "0 initiatives found" or partial data that misrepresents project state.

**Prevention Strategy:**
1. Use permissive parsing with sensible defaults:
```typescript
interface InitiativeMeta {
  name?: string;          // Default: folder name
  status?: string;        // Default: 'inbox', map unknown values to 'inbox'
  createdAt?: string;     // Optional
  updatedAt?: string;     // Optional
}
```
2. Map unknown status values to nearest Kanban column (fuzzy matching)
3. Log warnings for schema deviations without failing
4. Surface schema issues in onboarding review: "3 initiatives have non-standard status values - mapped to 'inbox'"

**Phase Mapping:** Discovery phase (Phase 1B), Validation Summary (Phase 1B)

---

### P4. Monorepo Blindness

**Description:** Treating every repo as single-project. Monorepos may have multiple workspace roots, each with its own initiatives structure.

**Warning Signs:**
- Monorepo users see initiatives from wrong package
- Path confusion when multiple `/initiatives/` folders exist
- User asks "which initiatives folder is Elmer using?"

**Impact:** Wrong projects populate workspace, or only subset appears, breaking user mental model.

**Prevention Strategy:**
1. Detect monorepo markers: `pnpm-workspace.yaml`, `lerna.json`, `/packages/` structure
2. If monorepo detected, prompt: "This repo has multiple workspaces. Which should Elmer connect to?"
3. Store selected workspace root in settings
4. Show workspace scope clearly in UI: "Workspace: `packages/core`"

**Phase Mapping:** Discovery phase - explicit monorepo handling step

---

## Category 2: GitHub API Pitfalls

### P5. Rate Limit Exhaustion During Discovery

**Description:** Discovery makes many API calls (tree fetch, file contents for meta, submodule resolution). Unauthenticated: 60/hr. Authenticated: 5000/hr. Large repos can exhaust this fast.

**Warning Signs:**
- 403 responses during onboarding
- Discovery hangs mid-way without error
- Works for small repos, fails for large ones
- Rate limit headers approaching 0 in responses

**Impact:** Onboarding fails mysteriously, user retries repeatedly, makes problem worse.

**Prevention Strategy:**
1. Check rate limit before starting discovery: `X-RateLimit-Remaining` header
2. Use tree API with `recursive=true` to get full tree in single call (1 request vs N)
3. Cache tree response for duration of onboarding (5 min TTL)
4. Batch file content fetches: use Contents API with multiple paths vs individual calls
5. Show rate limit status in error: "GitHub API limit reached. Resets in 45 minutes."
6. Implement exponential backoff with user-visible retry countdown

**Phase Mapping:** Discovery phase (Phase 1B), Error Recovery (Phase 1A)

**Code Pattern:**
```typescript
// Check before expensive operation
const rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
if (rateLimitRemaining < 50) {
  throw new RateLimitError(resetTime);
}
```

---

### P6. Submodule Content Inaccessibility

**Description:** Submodules appear in tree but content requires separate API calls to the submodule repo. Prototypes in `elephant-ai` submodule are unreachable without explicit handling.

**Warning Signs:**
- Submodule folders appear in tree but content fetch returns 404
- Prototype path detection fails despite correct path configuration
- Tree shows submodule as "commit" type, not "tree"

**Impact:** Critical workflows (prototype detection, submodule-based knowledge) silently fail.

**Prevention Strategy:**
1. Detect submodules via `.gitmodules` file presence and content
2. Parse `.gitmodules` to extract submodule repo URLs and paths
3. For each submodule, make separate tree API call to linked repo
4. Surface submodule handling in onboarding: "Found submodule `elephant-ai`. Should I scan it for prototypes?"
5. Store submodule repo references in workspace settings for future operations

**Phase Mapping:** Discovery phase (Phase 2 per FEATURES.md - Submodule Awareness), but critical path detection may need Phase 1

**Gotcha:** Submodule URL in `.gitmodules` may be relative (`../other-repo`) - requires resolution against parent repo URL.

---

### P7. Branch State Mismatch

**Description:** Scanning `main` when user's active work is on feature branch. Initiatives on branches won't appear, confusing users who expect to see current work.

**Warning Signs:**
- User reports missing initiatives that exist in their local view
- Discovery results differ between users working on different branches
- "I just created this initiative, why doesn't Elmer see it?"

**Impact:** Workspace state doesn't match user's working state, eroding trust in discovery accuracy.

**Prevention Strategy:**
1. Default to repo's default branch (not hardcoded `main`)
2. Show branch selection in onboarding: "Scanning branch: `main`. Change?"
3. Detect if user recently pushed commits to different branch (via events API or recent commits)
4. Store branch preference in workspace settings
5. Consider showing branch indicator in ongoing UI: "Synced to: `main`"

**Phase Mapping:** Discovery phase (Phase 1C - Branch Selection integration)

---

### P8. Large File Truncation

**Description:** GitHub API truncates file contents over 1MB and tree responses over 100k entries. Large PRD docs or massive repos hit these limits.

**Warning Signs:**
- File content response has `truncated: true`
- Tree response missing expected files
- Rich PRD documents appear with incomplete content

**Impact:** Metadata parsing fails on truncated JSON, knowledge base sync is incomplete.

**Prevention Strategy:**
1. Check `truncated` flag on API responses
2. For large files, use Raw Content API (supports up to 100MB)
3. For large trees, use pagination or Git Data API blobs
4. Set reasonable size limits for meta files (reject 10KB+ _meta.json as likely not metadata)
5. Log truncation events for debugging

**Phase Mapping:** Discovery phase, Knowledge Base sync

---

## Category 3: UX Anti-Patterns

### P9. Blocking Spinner of Death

**Description:** Full-screen spinner during discovery with no indication of progress or ability to cancel. Large repos take 30+ seconds. Users assume frozen, close tab.

**Warning Signs:**
- Single loading state for entire discovery operation
- No intermediate progress updates
- Analytics show high abandonment during loading states
- "Is it working?" support tickets

**Impact:** Users abandon onboarding during longest (most valuable) repos. Inverse correlation between repo size and completion rate.

**Prevention Strategy:**
1. Implement granular progress: "Scanning folders (23 of 50)..."
2. Stream discovered items as found: initiatives appear incrementally
3. Show elapsed time: "Scanning... (15 seconds)"
4. Provide cancel option that saves partial progress
5. Explain what's happening: "Fetching file metadata from GitHub..."
6. Use skeleton loading for result areas

**Phase Mapping:** Real-time Discovery Feedback (Phase 1C)

**Reference:** Already have SSE pattern in `src/app/api/jobs/stream/route.ts` - reuse for onboarding progress.

---

### P10. Error Messages Without Recovery Path

**Description:** Showing "Discovery failed" without explanation or next steps. User doesn't know if it's their repo, GitHub, permissions, or Elmer.

**Warning Signs:**
- Generic error messages in codebase: `throw new Error('Discovery failed')`
- Error boundaries without recovery actions
- No error categorization (retryable vs fatal)
- Users screenshot errors and ask "what do I do?"

**Impact:** Dead-end errors force users to restart or abandon. Erodes "just works" promise.

**Prevention Strategy:**
1. Categorize errors:
   - **Retryable:** Rate limit, network timeout, GitHub outage
   - **Fixable:** Permission denied (action: re-auth), repo not found (action: check URL)
   - **Fatal:** Invalid repo structure (action: manual setup or docs link)
2. Every error message includes: what happened, why, what to do next
3. Implement retry buttons for retryable errors
4. Log errors with context for support debugging

**Phase Mapping:** Error Recovery (Phase 1A)

**Error Template:**
```typescript
interface RecoverableError {
  message: string;        // User-facing: "GitHub rate limit reached"
  reason: string;         // "Too many API requests in the last hour"
  action: {
    label: string;        // "Retry in 45 minutes" or "Re-authorize"
    type: 'retry' | 'link' | 'action';
    payload?: unknown;    // Retry time, auth URL, etc.
  };
  recoverable: boolean;
}
```

---

### P11. All-or-Nothing Import

**Description:** Forcing users to import everything discovered or nothing. No way to exclude specific initiatives, skip broken ones, or defer decisions.

**Warning Signs:**
- No checkboxes on discovered items
- Import button without preview
- "Import all 47 initiatives" with no alternative
- Users ask "how do I exclude my archived projects?"

**Impact:** Users with messy repos (archived projects, experiments, personal folders) get polluted workspace. Abandonment or immediate cleanup required.

**Prevention Strategy:**
1. Default to selected, allow deselection: checkboxes on each discovered item
2. Provide bulk actions: "Select all", "Deselect archived", "Only active status"
3. Allow "Import now" vs "Save for later" per item
4. Show preview of what will be created: "This will create 12 projects in 4 columns"
5. Provide "Skip this step" that imports nothing (manual setup path)

**Phase Mapping:** Selective Import (Phase 1B)

**Reference:** `src/components/settings/AgentArchitectureImporter.tsx` already implements selective import pattern - extend to initiatives.

---

### P12. No Preview Before Commit

**Description:** Discovery directly populates workspace without showing user what will be created. Irreversible action without confirmation.

**Warning Signs:**
- POST to populate endpoint immediately after discovery
- No intermediate review step
- Users surprised by results: "Why are there 50 projects?"
- No undo or bulk delete option

**Impact:** Workspace pollution, user must manually clean up, trust destroyed.

**Prevention Strategy:**
1. Always show preview before population: "Preview: Create 12 projects, sync 24 knowledge docs"
2. Visual mapping: discovered folder -> resulting project/column
3. Explicit confirmation: "Create workspace? This will add 12 projects."
4. Provide dry-run option that shows changes without executing
5. Implement undo or bulk delete for onboarding artifacts

**Phase Mapping:** Validation Summary (Phase 1B), Visual Mapping Preview (Phase 1B)

---

### P13. Silent Partial Success

**Description:** Import partially fails (8 of 12 initiatives succeed) but shows success message. User discovers problems later during actual use.

**Warning Signs:**
- Try-catch swallows individual item errors
- Success message shows regardless of partial failure
- No per-item status feedback
- "Why is project X missing?" support tickets

**Impact:** Delayed confusion when user can't find expected content. Trust erosion - "did the import actually work?"

**Prevention Strategy:**
1. Track per-item import status: success, failed, skipped
2. Show completion summary: "Imported 10 of 12 (2 failed)"
3. List failures with reasons: "initiative-x: invalid _meta.json at line 5"
4. Provide retry option for failed items
5. Never show "Success!" if any item failed

**Phase Mapping:** Population phase, Validation Summary (Phase 1B)

---

### P14. No Path Forward for Empty Discovery

**Description:** If discovery finds nothing, showing error or empty state without guidance. User with non-pm-workspace repo has no idea what to do.

**Warning Signs:**
- Empty state says "No initiatives found" with no next step
- Onboarding dead-ends on repos without expected structure
- User asks "Elmer found nothing, now what?"

**Impact:** Users with different (valid) repo structures feel excluded. High abandonment for non-pm-workspace users.

**Prevention Strategy:**
1. Graceful empty state: "I didn't find a project structure I recognize. Let's set one up!"
2. Offer alternatives:
   - Manual path configuration
   - Create structure (Phase 2: template generation)
   - Skip to minimal workspace (settings only)
3. Show what was searched: "Looked for: /initiatives/, /features/, /projects/"
4. Suggest: "Do you use a different folder structure? Tell me where your projects live."

**Phase Mapping:** Discovery phase - empty state handling, ties to Phase 2 (template generation) for future

---

## Category 4: Data Integrity

### P15. Duplicate Projects on Re-onboarding

**Description:** User runs onboarding twice (configuration change, reset attempt) and gets duplicate projects. No idempotency protection.

**Warning Signs:**
- No deduplication logic on project creation
- Same initiative appears multiple times in Kanban
- Users ask "how do I delete all these duplicates?"

**Impact:** Workspace becomes unusable, manual cleanup required, user loses trust in tool stability.

**Prevention Strategy:**
1. Use deterministic IDs: hash of `workspaceId + repoPath + initiativePath`
2. Upsert instead of insert: update existing project if ID matches
3. Track import source in project metadata: `{ importSource: 'onboarding', importedAt: timestamp }`
4. Warn before re-onboarding: "This workspace already has imported projects. Merge or replace?"
5. Provide explicit "Reset workspace" vs "Update from repo" actions

**Phase Mapping:** Population phase - idempotency requirement

---

### P16. Status Mapping Drift

**Description:** User's `_meta.json` status values don't match Elmer's Kanban columns. "In Review" maps to nothing, project disappears into void.

**Warning Signs:**
- Status values in meta files don't match column names
- Projects created without column assignment
- "Where did my project go?" - it's unassigned/hidden

**Impact:** Projects in limbo, user's workflow representation doesn't match reality.

**Prevention Strategy:**
1. Define explicit status -> column mapping with fallbacks:
```typescript
const STATUS_MAP: Record<string, string> = {
  'inbox': 'inbox',
  'discovery': 'discovery',
  'prd': 'prd',
  'design': 'design',
  'prototype': 'prototype',
  'validate': 'validate',
  'tickets': 'tickets',
  // Fallback mappings
  'in-progress': 'discovery',
  'review': 'validate',
  'done': 'tickets',
  'archived': null, // Don't import
};
```
2. Show unmapped statuses in review: "Status 'in-review' is unknown. Map to column: [dropdown]"
3. Store custom mappings in workspace settings for future syncs
4. Log all mapping decisions for debugging

**Phase Mapping:** Discovery phase, Selective Import (Phase 1B)

---

### P17. Stale Cache During Multi-Step Flow

**Description:** User modifies repo (commits, creates initiative) mid-onboarding. Cached tree is stale, results inconsistent with current repo state.

**Warning Signs:**
- Discovery results differ from what user sees in GitHub
- Refresh button doesn't update results
- User commits new initiative during onboarding, expects to see it

**Impact:** Confusion about what's being imported. "I just created that initiative, why isn't it showing?"

**Prevention Strategy:**
1. Short cache TTL (5 minutes) for discovery data
2. Explicit "Refresh" button that invalidates cache
3. Show cache timestamp: "Repo scanned at 2:45 PM. Refresh?"
4. Clear cache on step navigation backwards
5. Warn if significant time elapsed: "It's been 10 minutes since scan. Rescan before importing?"

**Phase Mapping:** Discovery phase, state management

---

## Category 5: Security & Permissions

### P18. Insufficient GitHub Scope

**Description:** OAuth token lacks required scopes. Read fails silently or with cryptic 404, user thinks repo is empty.

**Warning Signs:**
- 404 on repo that exists
- Tree fetch returns empty for private repo
- Works for public repos, fails for private

**Impact:** Silent failure appears as "no content found" - user doesn't realize it's a permission issue.

**Prevention Strategy:**
1. Request appropriate scopes upfront: `repo` for private, `public_repo` for public
2. Test token permissions before discovery: HEAD request to repo
3. Clear error if scope insufficient: "Elmer needs additional permissions for private repos. Re-authorize?"
4. Store token scope and validate before operations
5. Gracefully degrade: "Can only scan public repos with current permissions"

**Phase Mapping:** Pre-discovery validation, OAuth flow (existing)

**Reference:** Already have OAuth at `/src/auth.ts` - ensure proper scope handling and messaging.

---

### P19. Exposed Credentials in Discovery

**Description:** Discovery processes files that may contain secrets (`.env` examples, config files). Accidentally displaying or storing these.

**Warning Signs:**
- Scanning all file types without allowlist
- Rendering file contents in UI without sanitization
- Storing file contents in database or logs

**Impact:** Security incident if credentials exposed. Compliance violations.

**Prevention Strategy:**
1. Only fetch specific file types: `_meta.json`, `.md`, known config files
2. Ignore patterns: `.env*`, `*secret*`, `*credential*`, `*.pem`
3. Never render raw file content in UI - only parsed/structured data
4. Redact potential secrets in logs
5. Don't store file contents in database - only extracted metadata

**Phase Mapping:** Discovery phase - security requirements

---

## Summary Matrix

| Pitfall | Category | Severity | Phase to Address |
|---------|----------|----------|------------------|
| P1. Hardcoded Folder Names | Structure | HIGH | Discovery (1B) |
| P2. Flat Structure Assumption | Structure | MEDIUM | Discovery (1B) |
| P3. _meta.json Schema Rigidity | Structure | MEDIUM | Discovery (1B) |
| P4. Monorepo Blindness | Structure | MEDIUM | Discovery (later) |
| P5. Rate Limit Exhaustion | API | HIGH | Discovery (1B), Error (1A) |
| P6. Submodule Inaccessibility | API | HIGH | Discovery (2) |
| P7. Branch State Mismatch | API | MEDIUM | Discovery (1C) |
| P8. Large File Truncation | API | LOW | Discovery |
| P9. Blocking Spinner | UX | HIGH | Feedback (1C) |
| P10. Error Messages | UX | HIGH | Error (1A) |
| P11. All-or-Nothing Import | UX | HIGH | Selective (1B) |
| P12. No Preview | UX | HIGH | Validation (1B) |
| P13. Silent Partial Success | UX | MEDIUM | Population |
| P14. Empty Discovery Path | UX | MEDIUM | Discovery |
| P15. Duplicate Projects | Data | HIGH | Population |
| P16. Status Mapping Drift | Data | MEDIUM | Discovery (1B) |
| P17. Stale Cache | Data | LOW | State management |
| P18. Insufficient Scope | Security | MEDIUM | Pre-discovery |
| P19. Exposed Credentials | Security | HIGH | Discovery |

---

## Prevention Checklist for Implementation

- [ ] Pattern-based folder detection, not hardcoded paths (P1)
- [ ] Recursive tree traversal with depth limits (P2)
- [ ] Permissive schema parsing with defaults (P3)
- [ ] Rate limit checking before operations (P5)
- [ ] Submodule detection and handling (P6)
- [ ] Branch selection in discovery (P7)
- [ ] Streaming progress updates (P9)
- [ ] Actionable error messages (P10)
- [ ] Selective import UI (P11)
- [ ] Pre-import validation preview (P12)
- [ ] Per-item success/failure tracking (P13)
- [ ] Empty discovery graceful path (P14)
- [ ] Idempotent project creation (P15)
- [ ] Status -> column mapping with fallbacks (P16)
- [ ] File type allowlist for discovery (P19)

---

*Pitfalls research complete. Ready for phase planning with prevention strategies embedded.*
