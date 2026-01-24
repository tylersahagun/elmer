---
phase: 16-classification-and-clustering
plan: 02
subsystem: ai
tags: [classification, embeddings, pgvector, anthropic, openai]

# Dependency graph
requires:
  - phase: 16-01
    provides: pgvector schema with embeddingVector columns on signals and projects
  - phase: 15
    provides: generateEmbedding and extractSignalFields AI functions
provides:
  - Two-tier hybrid classifier (embedding + LLM)
  - Vector similarity query helpers for pgvector
  - Project embedding generation utility
  - Auto-classification in signal processing pipeline
affects: [16-03, clustering, signal-processing]

# Tech tracking
tech-stack:
  added: []
  patterns: [two-tier classification (fast embedding first, LLM for ambiguous), threshold-based routing]

key-files:
  created:
    - orchestrator/src/lib/classification/classifier.ts
    - orchestrator/src/lib/classification/index.ts
  modified:
    - orchestrator/src/lib/db/queries.ts
    - orchestrator/src/lib/signals/processor.ts

key-decisions:
  - "Two-tier classification: embedding similarity first (free), LLM only for 0.5-0.75 ambiguous range"
  - "Thresholds: >0.75 auto-classify to project, <0.5 classify as new initiative"
  - "Classification failure doesn't fail signal processing (best-effort approach)"
  - "Project embeddings generated from name + description concatenation"

patterns-established:
  - "Confidence-based routing: use fast/cheap method for high-confidence cases, expensive method only for edge cases"
  - "Best-effort processing: classification errors logged but don't block core signal processing"

# Metrics
duration: 8min
completed: 2026-01-23
---

# Phase 16 Plan 02: Classifier Module Summary

**Two-tier hybrid classifier with embedding similarity for 90% of cases and LLM verification for ambiguous signals in 0.5-0.75 range**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-23T16:00:00Z
- **Completed:** 2026-01-23T16:08:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Vector similarity query helpers for pgvector cosine distance searches
- Two-tier classifier: fast embedding tier + LLM verification tier
- Auto-classification integrated into signal processing pipeline
- Project embedding generation utility for classification context

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Vector Query Helpers to queries.ts** - `dd029bb` (feat)
2. **Task 2: Create Classification Module** - `0b720c1` (feat)
3. **Task 3: Integrate Classification into Signal Processor** - `231e278` (feat)

## Files Created/Modified
- `orchestrator/src/lib/classification/classifier.ts` - Two-tier hybrid classifier with embedding + LLM tiers
- `orchestrator/src/lib/classification/index.ts` - Barrel export for classification module
- `orchestrator/src/lib/db/queries.ts` - Vector similarity queries (findSimilarSignals, findBestProjectMatch, etc.)
- `orchestrator/src/lib/signals/processor.ts` - Classification integration after embedding generation

## Decisions Made
- Two-tier classification: embedding similarity first (free, fast), LLM only for ambiguous 0.5-0.75 range
- Thresholds: >0.75 auto-classify to project, <0.5 classify as "new initiative"
- Classification failure doesn't fail signal processing (best-effort approach)
- Project embeddings generated from name + description concatenation
- LLM fallback uses 0.6 threshold if LLM call fails (middle of ambiguous range)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed as specified.

## User Setup Required

None - no external service configuration required. Uses existing OPENAI_API_KEY and ANTHROPIC_API_KEY from Phase 15.

## Next Phase Readiness
- Classification module ready for use in signal processing
- Project embeddings can be generated via generateProjectEmbedding utility
- Ready for Phase 16-03 clustering implementation
- Note: Projects need embeddings for classification to work (call generateProjectEmbedding on project creation/update)

---
*Phase: 16-classification-and-clustering*
*Completed: 2026-01-23*
