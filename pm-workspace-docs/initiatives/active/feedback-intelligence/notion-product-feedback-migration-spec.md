# Notion Migration Spec - Product Feedback Canonicalization

## Scope

This spec migrates AskElephant's Product Requests + Product Feedback operating model into one canonical Product Feedback database.

## Goals

1. Preserve historical rows and relationships.
2. Normalize identity to Company and Contact entities.
3. Enable parent/sub-item aggregation, occurrence counts, and novelty detection.
4. Keep rollout reversible until cutover sign-off.

## Systems In Scope

1. Source DB A: Product Feedback (canonical target, repurposed in place).
2. Source DB B: Product Requests (to be backfilled into Product Feedback).
3. Company and Contact sources: existing Notion customer/company model (relation targets).
4. Ingestion feeder: `pm-workspace-docs/scripts/automation/signal-router.py` and Notion queue output.

## Target Property Schema (Canonical Product Feedback)

### Existing properties to keep

1. `Feedback Title` (title)
2. `Type` (select)
3. `Sentiment` (select)
4. `Source` (select)
5. `Feature Area` (multi-select)
6. `Tags` (multi-select)
7. `Verbatim Quote` (rich text)
8. `Date` (date)
9. `Parent item` (relation to same DB)
10. `Sub-item` (relation to same DB)

### New properties to add

1. `Feedback Key` (rich text)
- Canonical dedupe key used for parent matching.

2. `Parent Feedback Key` (rich text)
- Copy of parent key for child/sub-item rows.

3. `Source Event ID` (rich text)
- Immutable ID from ingestion event.

4. `Occurrence Count` (number)
- Parent-only count of linked child/sub-item records.

5. `First Seen` (date)
- Oldest seen timestamp for this feedback cluster.

6. `Last Seen` (date)
- Most recent timestamp for this feedback cluster.

7. `Novelty Status` (select: `New`, `Known`, `Needs Review`)
- Explicit novelty classification for triage.

8. `Novelty First Seen` (date)
- First timestamp when classified as `New`.

9. `Confidence` (number)
- Dedupe confidence score from ingestion pipeline.

10. `Company` (relation)
- Relation to canonical Company table.

11. `Contacts` (relation, multi)
- Relation to Contact table for all reporters tied to an issue.

12. `Reporting Companies` (rollup)
- Rollup of unique companies from child links.

13. `Reporting Contacts` (rollup)
- Rollup of unique contacts from child links.

14. `Migration Source` (select: `Product Feedback`, `Product Requests`, `Automation`)
- Provenance marker.

15. `Migration Batch ID` (rich text)
- Traceability for backfill execution runs.

## Source-to-Target Mapping Rules

### Product Feedback -> Product Feedback (in place)

1. Keep row IDs and existing parent/sub-item relations.
2. Populate `Migration Source=Product Feedback`.
3. Generate `Feedback Key` if null.
4. Backfill `Occurrence Count`, `First Seen`, `Last Seen`, and novelty fields.

### Product Requests -> Product Feedback (import)

1. `Request Title` -> `Feedback Title`.
2. Request category/type -> `Type=Feature Request` unless better mapped value exists.
3. Request date -> `Date` and candidate for `First Seen`/`Last Seen`.
4. Free-text customer/requester -> resolve to `Company` and `Contacts` relations.
5. Request details/context -> `Verbatim Quote` and/or summary fields.
6. Provenance -> `Migration Source=Product Requests` and set `Migration Batch ID`.

## Dedupe and Parenting Logic

1. Build `Feedback Key` from normalized tuple:
- `product_area + problem_statement + intent + type`

2. Parent decision
- If exact key match exists on parent, create/attach sub-item and increment count.
- If no exact key but semantic similarity above threshold, set `Novelty Status=Needs Review` and queue manual triage.
- If no viable match, create new parent with `Novelty Status=New`.

3. Child creation
- Each net-new source occurrence is stored as a sub-item row linked to parent.

4. Counting
- Parent `Occurrence Count` = count of linked child rows + optionally include parent row as baseline 1 (choose one policy and keep consistent).

## Identity Backfill Rules

1. Resolve `Company` using deterministic precedence:
- Explicit company ID in source payload
- Exact normalized domain match
- Exact normalized company name
- Else `Needs Review` queue

2. Resolve `Contacts` using precedence:
- Explicit contact/person ID
- Exact email match
- Exact name + company match
- Else unresolved contact placeholder + triage

3. Maintain unresolved queue for manual triage; do not block ingestion.

## Rollout Phases

1. Phase 0 - Preflight
- Snapshot both source DBs to CSV/JSON.
- Add new properties without altering existing views.

2. Phase 1 - In-place schema extension
- Add all new canonical fields to Product Feedback.
- Introduce temporary migration views (not user-default).

3. Phase 2 - Backfill
- Backfill Product Feedback existing rows.
- Import Product Requests rows into Product Feedback.
- Populate migration provenance and batch IDs.

4. Phase 3 - Validation
- Validate counts, identity linkage, and novelty precision on sample set.
- Compare source totals vs canonical totals and explain deltas.

5. Phase 4 - Cutover
- Switch operational views and automations to canonical Product Feedback.
- Freeze Product Requests as read-only archive.

6. Phase 5 - Hardening
- Monitor digest reliability and dedupe precision for 2 weeks.
- Tune confidence thresholds and manual-review volume.

## Validation Checklist

1. Row integrity
- No loss of source records.
- Every migrated request has provenance fields.

2. Relation integrity
- >= 95% rows have Company + at least one Contact relation.

3. Aggregation integrity
- Parent `Occurrence Count` matches child relation count.

4. Novelty quality
- Weekly QA sample confirms `Novelty Status` precision >= 80%.

5. Reporting readiness
- Views for recurring vs novel are live and accurate.
- Daily/weekly digest inputs match canonical table outputs.

## Rollback Plan

1. Keep Product Requests untouched until cutover approval.
2. Use `Migration Batch ID` to delete/revert imported rows if needed.
3. Restore Product Feedback from preflight snapshot if schema/backfill corruption detected.
4. Repoint automation output back to pre-migration views if reporting regresses.

## Operational Decisions Locked

1. Canonical DB strategy: repurpose Product Feedback in place.
2. Call ingestion policy: ingest all recorded calls.
3. Ticket source (phase 1): Linear product-channel tickets.
4. Reporting cadence: daily + weekly.
5. Daily send time: 4:30 PM MT.
6. Slack destination: DM Ben + `#customer-feedback`.
