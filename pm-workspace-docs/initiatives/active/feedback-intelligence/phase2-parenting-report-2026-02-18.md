# Phase 2 Parenting Report — Feedback Intelligence

**Date:** 2026-02-19  
**Notion DB:** 308f79b2-c8ac-81d1-a3ff-f1dad31a4edd  
**Scope:** Product Feedback rows where `Source Event ID` contains `linear:`

## Summary

| Metric | Count |
|--------|-------|
| **Total scoped rows** | 197 |
| **Clusters detected** | 0 |
| **Parent rows updated** | 0 |
| **Child rows linked** | 0 |
| **Skipped ambiguous clusters** | 0 |

## Clustering Logic Applied

1. **Cluster key:** Normalized title + type + feature area
   - Title: lowercase, remove bracket prefixes `[..]`, remove issue keys (EPD-123), remove punctuation, collapse spaces
   - Tokens: length ≥ 4, exclude common stopwords
   - Exact match required for clustering

2. **Cluster threshold:** Only clusters with ≥ 2 rows sharing the same normalized key

## Findings

- **197 rows** scoped (all Linear-imported rows in Product Feedback).
- **197 unique cluster keys.** No two rows shared the exact same normalized key.
- Conservative clustering correctly did not merge rows where:
  - Same/similar titles had different `Type` (e.g., Feature Request vs Integration Request)
  - Same/similar titles had different `Feature Area` (e.g., Meeting Intelligence vs Settings)
- Examples of near-duplicate titles that were *not* clustered (correctly):
  - "Distribute meeting notes & action items" — Feature Request + Meeting Intelligence vs Integration Request + AI/Chat|CRM Sync|Meeting Intelligence
  - "Adjust Clockwise lunch settings" — Feature Request + Meeting Intelligence vs Feature Request + Settings

## Sample Parent Groups

*None.* No clusters met the conservative threshold.

## Artifacts

- `phase2_rows.json` — Raw Notion query results (197 rows)
- `phase2_parenting.py` — Clustering and parenting logic script

## Recommendation

The Linear-imported rows are sufficiently distinct by title + type + feature area that conservative exact-match clustering yields no merges. To create parent/child structure in the future, consider:

1. **Fuzzy clustering** — Relax to title-only or title+type (with manual review queue)
2. **Manual triage** — Flag near-duplicates (e.g., "Distribute meeting notes") for human grouping
3. **Ingestion-time dedup** — Detect duplicates during Linear→Notion sync before insert
