# Phase 2.1 Fuzzy Parenting Report — Feedback Intelligence

**Date:** 2026-02-19  
**Notion DB:** 308f79b2-c8ac-81d1-a3ff-f1dad31a4edd  
**Scope:** Product Feedback rows where `Source Event ID` contains `linear:`

## Summary

| Metric | Count |
|--------|-------|
| **Scoped rows** | 197 |
| **Candidate pairs** | 7 |
| **High-confidence merges applied** | 2 |
| **Parent rows updated** | 2 |
| **Child rows linked** | 2 |
| **Medium-confidence review candidates** | 5 |
| **Failures** | 0 |

## Policy Applied

1. **Candidate pairing:** Same Type OR same Feature Area overlap
2. **Similarity score:** Title normalization + token overlap (Jaccard on strong tokens) + sequence similarity (difflib.SequenceMatcher) — combined 50/50
3. **Thresholds:**
   - High confidence (auto-link): score ≥ 0.92
   - Medium confidence (review): 0.78 ≤ score &lt; 0.92
   - Low confidence: ignored
4. **Never relink:** Rows with existing `Parent item` were excluded from auto-linking

## High-Confidence Merges Applied

| Parent Feedback Key | Cluster Size | Child IDs |
|--------------------|--------------|-----------|
| linear\|EPD-1514\|adjust-clockwise-lunch-settings | 2 | 30df79b2-c8ac-81d2-aaf5-fe9a1d56c4ea |
| linear\|EPD-1494\|distribute-meeting-notes-action-items | 2 | 30df79b2-c8ac-8127-b54c-edd5ec871348 |

## Notion Updates

All high-confidence updates were applied successfully:

- **Parent rows:** Occurrence Count, First Seen, Last Seen, Novelty Status=Known, Confidence=0.9
- **Child rows:** Parent item relation, Parent Feedback Key, Novelty Status=Known, Confidence=0.8

## Artifacts

- `phase2_1_fuzzy_parenting.py` — Fuzzy parenting script
- `phase2_rows.json` — Source data (Notion query snapshot)
- `phase2-1-fuzzy-review-queue-2026-02-18.md` — Medium-confidence pairs for manual review
