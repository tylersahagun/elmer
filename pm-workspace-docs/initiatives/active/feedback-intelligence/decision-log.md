# Decision Log - Feedback Intelligence

## 2026-02-19

1. Initiative home
- Decision: Create a dedicated initiative named `Feedback Intelligence`.
- Why: Cross-functional scope (Product + CS + automation) needs clear ownership and metrics.

2. Canonical database strategy
- Decision: Repurpose existing Product Feedback DB as single canonical source.
- Why: Existing parent/sub-item model and richer taxonomy reduce migration risk.

3. Privacy gate policy
- Decision: Ingest all recorded calls.
- Why: Maximize signal capture velocity; risk accepted for initial phase.

4. Reporting cadence and destination
- Decision: Daily + weekly rollups; deliver to DM Ben and `#customer-feedback`.
- Why: Leadership visibility and team transparency together.

5. Daily send time
- Decision: 4:30 PM MT.
- Why: Captures most same-day interactions while still EOD-actionable.

6. Ticket source (phase 1)
- Decision: Linear tickets from product channel.
- Why: Keep source surface focused while proving model quality.

## 2026-02-18 (Execution Update)

7. Notion migration step resumed and executed
- Decision: Apply canonical schema extension directly to `Product Feedback` DB (`308f79b2-c8ac-81d1-a3ff-f1dad31a4edd`) via Notion MCP.
- Result: Added fields `Feedback Key`, `Parent Feedback Key`, `Source Event ID`, `Occurrence Count`, `First Seen`, `Last Seen`, `Novelty Status`, `Novelty First Seen`, `Confidence`, `Migration Source`, `Migration Batch ID`.

8. Remaining schema blockers
- Decision: Defer `Company` relation, `Contacts` relation, and rollups (`Reporting Companies`, `Reporting Contacts`) until canonical Company/Contact databases are confirmed and shared with the integration.
- Why: Relation targets are not currently discoverable from accessible Notion database inventory.
- Attempted relation write result: Notion API returned `400 Bad request: Cannot create relation ...` when adding `Contacts` relation to `Product Feedback`, so relation creation remains blocked via current API path.

9. Non-relation backfill completed
- Decision: Backfill all existing Product Feedback rows with deterministic canonical values for new non-relation fields using batch `mig-2026-02-19-product-feedback-v1`.
- Result: 11/11 rows updated with `Feedback Key`, `Source Event ID`, `Occurrence Count=1`, `First Seen`, `Last Seen`, `Novelty Status=Needs Review`, `Confidence=0.5`, `Migration Source=Product Feedback`, `Migration Batch ID`.
- Validation: Post-backfill filters returned zero rows missing `Feedback Key`, `Migration Batch ID`, or `Occurrence Count`.

10. Plan artifacts created for unblock and repeatability
- Decision: Add explicit execution runbook and reusable planning framework documents.
- Artifacts:
  - `notion-unblock-execution-plan.md`
  - `plan-creation-framework.md`

11. Linear Product-team triage sync executed
- Decision: Process all Product-team Linear issues in states `Triage`, `Needs Info`, `Validated`, and `Ready for Engineering` through a 3-lane triage model, then sync to Product Feedback in Notion.
- Scope totals: 264 in-scope issues (`Lane A=87`, `Lane B=129`, `Lane C=48`).
- Notion result: `Lane A` created `87` rows, `Lane B` created `129` rows, `0` failures.
- Audit artifacts:
  - `linear-to-notion-sync-results.md`
  - `linear-to-notion-triage-audit-2026-02-18.md`

## 2026-02-19 (Execution Update)

12. Phase 2 parenting executed (conservative clustering)
- Decision: Run Phase 2 to convert duplicate/near-duplicate Linear-imported rows into parent/sub-item structure.
- Scope: 197 rows where `Source Event ID` contains `linear:`.
- Result: 0 clusters detected (197 unique cluster keys). No parent/child updates applied.
- Why: Conservative cluster key (title + type + feature area) required exact match. Near-duplicate titles (e.g. "Distribute meeting notes", "Adjust Clockwise lunch settings") had differing type or feature area, so correctly not merged.
- Report: `phase2-parenting-report-2026-02-18.md`

13. Phase 2.1 fuzzy parenting executed
- Decision: Run fuzzy matching to create parent/sub-item relationships for Linear-imported feedback duplicates.
- Scope: 197 rows where `Source Event ID` contains `linear:`.
- Policy: Candidate pairs within same Type OR same Feature Area; similarity from title normalization + token overlap + sequence similarity; high ≥0.92 (auto-link), medium 0.78–0.92 (review queue).
- Result: 7 candidate pairs; 2 high-confidence merges applied (2 parent rows updated, 2 child rows linked); 5 medium-confidence pairs in review queue; 0 failures.
- Merges: Adjust Clockwise lunch settings (EPD-1514/EPD-1607), Distribute meeting notes & action items (EPD-1494/EPD-1598).
- Artifacts: `phase2-1-fuzzy-parenting-report-2026-02-18.md`, `phase2-1-fuzzy-review-queue-2026-02-18.md`, `phase2_1_fuzzy_parenting.py`

14. Phase 2.2 medium-confidence fuzzy review executed
- Decision: Resolve all 5 medium-confidence pairs from Phase 2.1 review queue.
- Result: 5 pairs processed, 5 merged, 0 distinct, 0 failures.
- Merges: Update roadmap (EPD-1538→EPD-1456), meeting notes distribution (EPD-1455→EPD-1494), publish meeting notes (EPD-1539→EPD-1510), Focus Time summary (EPD-1574→EPD-1472).
- Rows changed: 8 (4 child rows linked, 4 parent rows updated).
- Artifact: `phase2-2-review-resolution-2026-02-18.md`

## 2026-02-19 (Quote Quality Cleanup)

15. Linear feedback quote-quality cleanup executed (complete)
- Decision: Archive-delete Product Feedback rows where `Source Event ID` contains `linear:` and `Verbatim Quote` is in buckets `task_like`, `mixed`, or `empty`.
- Scope: 197 scoped rows; 150 in target buckets (task_like=87, mixed=63, empty=0).
- Buckets retained: evidence_like=45, short=2.
- Result: 150 archived via MCP (no local API scripts). Remaining scoped rows: 47. Remaining target-to-delete: 0.
- Failures: 0.
- Artifact: `linear-feedback-cleanup-delete-report-2026-02-18.md`
