---
phase: 18
plan: 02
subsystem: execution
tags: [prd, signals, evidence, citations, provenance]

dependency-graph:
  requires: [phase-11, phase-12.5]
  provides: [prd-signal-citations]
  affects: [phase-18-03, phase-18-04]

tech-stack:
  added: []
  patterns: [signal-evidence-injection, prd-citation-format]

key-files:
  created: []
  modified:
    - orchestrator/src/lib/execution/stage-executors/prd-executor.ts

decisions:
  - id: 18-02-01
    decision: "Limit signal citations to 10 to prevent context bloat"
    rationale: "PRD prompts have context limits; 10 signals provide sufficient evidence"
  - id: 18-02-02
    decision: "Truncate verbatim quotes to 200 characters"
    rationale: "Long quotes add noise; truncation preserves essence while saving tokens"
  - id: 18-02-03
    decision: "Format as 'Supporting User Evidence' section in prompt"
    rationale: "Clear section heading helps LLM understand citation context"
  - id: 18-02-04
    decision: "Add citation requirements to existing PRD_SYSTEM_PROMPT"
    rationale: "Inline instructions vs separate constant; simpler maintenance"

metrics:
  duration: 2 minutes
  completed: 2026-01-24
---

# Phase 18 Plan 02: PRD Signal Citation Summary

PRD generation enhanced to automatically fetch and cite linked signals as evidence.

## One-liner

PRD executor now includes "Supporting User Evidence" section with up to 10 signal citations formatted with source, severity, and truncated verbatim quotes.

## What Was Built

### Signal Fetching in PRD Executor
- Added imports for `signalProjects` and `signals` tables
- Implemented database query to fetch linked signals ordered by linkedAt DESC
- Limited to 10 signals maximum to prevent context bloat
- Added `desc` import from drizzle-orm for ordering

### Evidence Section Formatting
- Created `formatSignalsForPRD` helper function
- Format: `[Signal N] **Source (severity)**: "verbatim quote..."`
- Truncates quotes longer than 200 characters
- Pluralization handling for "signal" vs "signals"

### PRD System Prompt Enhancement
- Added citation requirements to existing PRD_SYSTEM_PROMPT
- Instructions to reference user evidence in problem statements
- Instructions to cite signals when defining requirements
- Ensures traceability from feedback to decisions

### Progress Logging
- Added 0.15 progress step: "Loading signal evidence..."
- Info log when signals found: "Found N signal(s) to cite as evidence"
- Info log when no signals: "No linked signals found - PRD will be generated without user evidence"
- Additional log when including signals: "Including N signal(s) as evidence"

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 64fd4e5 | feat | add signal citations to PRD generation |

## Decisions Made

1. **10 Signal Limit** - Prevents context overflow while providing sufficient evidence
2. **200 Character Truncation** - Balances quote completeness with token efficiency
3. **Inline Prompt Enhancement** - Added citation requirements directly to existing PRD_SYSTEM_PROMPT rather than creating separate constant
4. **Order by linkedAt DESC** - Most recently linked signals (most relevant) appear first

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript compiles | PASS | No errors from changes |
| Lint passes | PASS | Pre-existing unrelated warning in file |
| Signal fetch query | PASS | Uses signalProjects join with signals |
| Evidence section format | PASS | Includes "Supporting User Evidence" header |
| Progress logging | PASS | Shows 0.15 step and info logs |

## Files Changed

| File | Change Type | Lines |
|------|-------------|-------|
| orchestrator/src/lib/execution/stage-executors/prd-executor.ts | Modified | +66/-4 |

## Next Phase Readiness

**Blockers:** None

**Ready for:**
- Phase 18-03: Signal Count Badge on Project Cards
- Phase 18-04: Create Project from Cluster

**Dependencies satisfied:**
- PRD executor can now cite linked signals
- Evidence format established for future enhancements

## Technical Notes

### Database Query Pattern
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

### Evidence Section Format
```
## Supporting User Evidence

This PRD is informed by N user feedback signal(s):

[Signal 1] **Source (severity)**: "verbatim quote..."

[Signal 2] **Source (severity)**: "verbatim quote..."

---
```

### Progress Timeline
- 0.05: Loading company context...
- 0.10: Loading research context...
- 0.15: Loading signal evidence... (NEW)
- 0.25: Generating PRD...
- 0.50: Generating Design Brief...
- 0.75: Generating Engineering Spec...
- 0.90: Generating GTM Brief...
- 1.00: Complete
