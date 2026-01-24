---
phase: 18-provenance-prd-citation
verified: 2026-01-24T01:31:33Z
status: gaps_found
score: 5/6 must-haves verified
gaps:
  - truth: "User can create new project from a cluster of related signals"
    status: partial
    reason: "CreateProjectFromClusterModal exists but not wired into UI - no way for user to access it"
    artifacts:
      - path: "orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx"
        issue: "Component created but not imported/rendered anywhere (orphaned)"
    missing:
      - "Integration point in UI (e.g., button on synthesize results page)"
      - "Import and render CreateProjectFromClusterModal where users view clusters"
      - "Wire modal open/close state to cluster discovery UI"
---

# Phase 18: Provenance & PRD Citation Verification Report

**Phase Goal:** Projects show signal evidence with provenance tracking and PRD citation
**Verified:** 2026-01-24T01:31:33Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Project page shows linked signals as evidence section | ✓ VERIFIED | LinkedSignalsSection displays signals with fetch from /api/projects/[id]/signals |
| 2 | "Signals that informed this project" section visible on project detail | ✓ VERIFIED | Header text matches exactly (line 102 of LinkedSignalsSection.tsx) |
| 3 | Provenance chain is immutable (junction table with link reason preserved) | ✓ VERIFIED | signalProjects table has linkedBy, linkReason, confidence fields; no UPDATE mutations found |
| 4 | Generated PRDs automatically cite linked signals as evidence | ✓ VERIFIED | prd-executor.ts fetches signals, formats as "Supporting User Evidence", injects into PRD prompt |
| 5 | User can create new project from a cluster of related signals | ✗ FAILED | CreateProjectFromClusterModal exists but not imported/used in any UI |
| 6 | Project cards show signal count badge | ✓ VERIFIED | ProjectCard.tsx displays MessageSquare icon with signalCount when > 0 |

**Score:** 5/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `orchestrator/src/components/projects/LinkedSignalsSection.tsx` | Enhanced provenance display | ✓ VERIFIED | 212 lines, shows linkedBy.name, confidence %, linkReason. Fetches from /api/projects/[id]/signals |
| `orchestrator/src/app/api/projects/[id]/signals/route.ts` | GET endpoint with provenance data | ✓ VERIFIED | 47 lines, calls getSignalsForProject which joins linkedByUser relation |
| `orchestrator/src/lib/db/queries.ts:getSignalsForProject` | Query returning provenance fields | ✓ VERIFIED | Lines 1647-1674, includes linkedByUser join, returns linkedBy, linkReason, confidence |
| `orchestrator/src/lib/execution/stage-executors/prd-executor.ts` | PRD generation with signal citations | ✓ VERIFIED | 456 lines, fetches signals (lines 169-181), formats as "Supporting User Evidence" (lines 264-286), injects into PRD prompt |
| `orchestrator/src/app/api/projects/from-cluster/route.ts` | POST endpoint for cluster-to-project | ✓ VERIFIED | 122 lines, creates project + bulk-links signals with cluster theme as linkReason |
| `orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx` | Modal for cluster-to-project creation | ⚠️ ORPHANED | 140 lines, exports CreateProjectFromClusterModal, calls /api/projects/from-cluster BUT not imported anywhere |
| `orchestrator/src/components/kanban/ProjectCard.tsx` | Project card with signal count badge | ✓ VERIFIED | Shows MessageSquare icon + signalCount when > 0 (lines 320-324) |
| `orchestrator/src/lib/db/queries.ts:getProjectsWithCounts` | Query including signal counts | ✓ VERIFIED | Lines 244-274, aggregates signalProjects count, merges into project objects |
| `orchestrator/src/app/api/projects/route.ts` | GET using getProjectsWithCounts | ✓ VERIFIED | Line 26 calls getProjectsWithCounts (not getProjects) |
| `orchestrator/src/lib/store.ts:ProjectCard` | Interface with signalCount field | ✓ VERIFIED | Line 20 has signalCount?: number |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| LinkedSignalsSection | /api/projects/[id]/signals | useQuery fetch | ✓ WIRED | Lines 58-65, fetches and displays signals with provenance |
| /api/projects/[id]/signals | getSignalsForProject | function call | ✓ WIRED | Line 32, passes projectId to query function |
| getSignalsForProject | signalProjects table | Drizzle query with linkedByUser join | ✓ WIRED | Lines 1653-1662, joins linkedByUser relation, returns full provenance data |
| prd-executor.ts | signalProjects table | db.select with innerJoin | ✓ WIRED | Lines 169-181, fetches top 10 signals ordered by linkedAt DESC |
| prd-executor.ts | formatSignalsForPRD | function call | ✓ WIRED | Lines 264-286 defines formatter, line 289 calls it, line 301 injects result into basePrompt |
| CreateProjectFromClusterModal | /api/projects/from-cluster | POST fetch in useMutation | ✓ WIRED | Lines 55-65, sends workspaceId, signalIds, name, description, clusterTheme |
| /api/projects/from-cluster | projects + signalProjects tables | db.insert for both | ✓ WIRED | Lines 67-93, creates project then bulk-inserts signal links |
| **CreateProjectFromClusterModal** | **UI integration point** | **import statement** | **✗ NOT_WIRED** | **Component not imported anywhere - orphaned code** |
| ProjectCard | project.signalCount | prop access | ✓ WIRED | Lines 320-324, conditionally renders MessageSquare badge when signalCount > 0 |
| GET /api/projects | getProjectsWithCounts | function call | ✓ WIRED | Line 26, ensures kanban cards receive signalCount |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| PROV-01: Signals visible on project page as linked evidence | ✓ SATISFIED | None |
| PROV-02: "Signals that informed this project" section on project detail | ✓ SATISFIED | None |
| PROV-03: Provenance chain: immutable junction table with link reason | ✓ SATISFIED | None |
| PROV-04: PRD citation: auto-cite signals in generated PRDs | ✓ SATISFIED | None |
| PROV-05: Create new project from clustered signals | ✗ BLOCKED | CreateProjectFromClusterModal not accessible to users |
| PROV-06: Signal count badge on project cards | ✓ SATISFIED | None |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx | N/A | Orphaned component (not imported) | ⚠️ Warning | Feature exists but unreachable |

**No blocker anti-patterns found.** Component is substantive and functional, just not wired into UI.

### Human Verification Required

None. All features are structurally verifiable. The gap is clear: modal needs UI integration.

### Gaps Summary

**1 gap blocking goal achievement:**

The CreateProjectFromClusterModal component is fully implemented (140 lines, substantive, calls API correctly) but is **orphaned** — not imported or rendered anywhere in the codebase. Users have no way to access the "create project from cluster" functionality because there's no UI entry point.

**Root cause:** Plan 18-03 created the modal component but didn't specify the integration point. The research document mentioned "ClusterCard.tsx" and enhancing it with a "Create Project" action, but this integration was never implemented.

**Impact:** Requirement PROV-05 is blocked. The code works (API endpoint verified, modal verified) but users cannot trigger it.

**Fix needed:**
1. Create or enhance a UI component that displays signal clusters (likely in signals page)
2. Import CreateProjectFromClusterModal into that component
3. Add button/action to trigger modal open with cluster data
4. Wire modal state (isOpen, onClose) to parent component

**Estimated scope:** Small (1 task) — the modal is ready, just needs a parent component to render it.

---

## Detailed Verification Evidence

### Truth 1: Project page shows linked signals as evidence section
**Status:** ✓ VERIFIED

**Evidence:**
- Component: `orchestrator/src/components/projects/LinkedSignalsSection.tsx` (212 lines)
- Fetches: `/api/projects/[id]/signals` via useQuery (lines 58-65)
- Renders: List of signals with verbatim, source badges, severity badges (lines 132-206)
- Unlink action: Calls DELETE `/api/signals/[id]/projects` (lines 68-82)

**Key code:**
```typescript
const { data: signalsData, isLoading } = useQuery({
  queryKey: ["project-signals", projectId],
  queryFn: async () => {
    const res = await fetch(`/api/projects/${projectId}/signals`);
    if (!res.ok) throw new Error("Failed to load signals");
    return res.json();
  },
});
```

**Verification:** Component exists (✓), is substantive (✓), fetches and displays data (✓).

---

### Truth 2: "Signals that informed this project" section visible on project detail
**Status:** ✓ VERIFIED

**Evidence:**
- File: `orchestrator/src/components/projects/LinkedSignalsSection.tsx`, line 102
- Exact text match:
```typescript
<span className="font-medium text-sm">
  Signals that informed this project ({isLoading ? "..." : count})
</span>
```

**Verification:** Header text matches requirement exactly (✓).

---

### Truth 3: Provenance chain is immutable (junction table with link reason preserved)
**Status:** ✓ VERIFIED

**Evidence:**
- Schema: `orchestrator/src/lib/db/schema.ts`, lines 1281-1291
- Table: `signalProjects` with fields:
  - `linkedAt` (timestamp, defaultNow, notNull)
  - `linkedBy` (text, FK to users)
  - `linkReason` (text, nullable)
  - `confidence` (real, nullable)
- Unique constraint: `uniqueSignalProject` on (signalId, projectId)

**Immutability check:**
- Searched for UPDATE queries on signalProjects: None found
- Only operations: INSERT (linking) and DELETE (unlinking)
- Once created, junction records are never modified

**Verification:** Junction table structure correct (✓), no mutation operations (✓).

---

### Truth 4: Generated PRDs automatically cite linked signals as evidence
**Status:** ✓ VERIFIED

**Evidence:**
- File: `orchestrator/src/lib/execution/stage-executors/prd-executor.ts`
- Signal fetch: Lines 169-181
  ```typescript
  const linkedSignals = await db
    .select({
      verbatim: signalsTable.verbatim,
      source: signalsTable.source,
      severity: signalsTable.severity,
      frequency: signalsTable.frequency,
      interpretation: signalsTable.interpretation,
    })
    .from(signalProjects)
    .innerJoin(signalsTable, eq(signalProjects.signalId, signalsTable.id))
    .where(eq(signalProjects.projectId, project.id))
    .orderBy(desc(signalProjects.linkedAt))
    .limit(10);
  ```

- Formatter: Lines 264-286
  ```typescript
  function formatSignalsForPRD(signals: typeof linkedSignals): string {
    // ... formats as "## Supporting User Evidence"
    // with citations like: [Signal 1] **Source (severity)**: "quote..."
  }
  ```

- Injection: Lines 289-304
  ```typescript
  const evidenceSection = formatSignalsForPRD(linkedSignals);
  
  const basePrompt = `Project: ${project.name}
  ${project.description ? `Description: ${project.description}` : ""}
  
  ${companyContext ? `## Company Context\n${companyContext}\n` : ""}
  
  ${evidenceSection}
  
  ## Research
  ${researchDoc.content}`;
  ```

- System prompt enhancement: Lines 91-96 add citation requirements to PRD_SYSTEM_PROMPT

**Verification:** Signals fetched (✓), formatted with header "Supporting User Evidence" (✓), injected into PRD generation prompt (✓).

---

### Truth 5: User can create new project from a cluster of related signals
**Status:** ✗ FAILED

**Evidence:**
- API endpoint: `orchestrator/src/app/api/projects/from-cluster/route.ts` (122 lines)
  - POST handler creates project + bulk-links signals (✓)
  - Sets linkReason from clusterTheme (✓)
  - Updates signal statuses to "linked" (✓)
  
- Modal component: `orchestrator/src/components/signals/CreateProjectFromClusterModal.tsx` (140 lines)
  - Exports CreateProjectFromClusterModal function (✓)
  - Accepts cluster prop with signals array (✓)
  - Calls POST /api/projects/from-cluster (✓)
  - Shows signal preview (first 5) (✓)
  - Navigates to new project on success (✓)

**Gap:**
- Grep for imports: Only found in its own file
- Not imported in any parent component
- No UI button/trigger to open modal
- Users have no way to access this feature

**Why it failed:** Component is substantive and wired to API, but orphaned from UI. The research document suggested integrating with "ClusterCard.tsx" but this component doesn't exist and was never created.

**Verification:** API works (✓), Modal works (✓), UI integration (✗ MISSING).

---

### Truth 6: Project cards show signal count badge
**Status:** ✓ VERIFIED

**Evidence:**
- Component: `orchestrator/src/components/kanban/ProjectCard.tsx`, lines 320-324
  ```typescript
  {project.signalCount !== undefined && project.signalCount > 0 && (
    <span className="flex items-center gap-1" title="Linked signals">
      <MessageSquare className="w-3 h-3" />
      {project.signalCount}
    </span>
  )}
  ```

- Icon import: Line 16 imports MessageSquare from lucide-react
- Store type: `orchestrator/src/lib/store.ts`, line 20 has `signalCount?: number`
- Query: `orchestrator/src/lib/db/queries.ts`, getProjectsWithCounts (lines 244-274)
  - Aggregates signal counts with groupBy
  - Merges into project objects
- API: `orchestrator/src/app/api/projects/route.ts`, line 26 calls getProjectsWithCounts

**Verification:** Badge displays when count > 0 (✓), query aggregates counts (✓), API returns counts (✓).

---

## TypeScript Compilation

```bash
cd orchestrator && npx tsc --noEmit
```

**Result:** ✓ PASS (no errors)

---

_Verified: 2026-01-24T01:31:33Z_
_Verifier: Claude (gsd-verifier)_
