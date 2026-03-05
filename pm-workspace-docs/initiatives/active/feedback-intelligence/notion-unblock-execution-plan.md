# Notion Unblock Execution Plan (Feedback Intelligence)

## Objective

Finish canonicalization so Product Feedback can support identity-linked, recurring-vs-novel reporting with daily and weekly digests.

## Current State

- Completed:
  - Canonical non-relation schema fields added to Product Feedback.
  - Backfill completed for all existing rows (batch: `mig-2026-02-19-product-feedback-v1`).
- Blocked:
  - `Company` relation in Product Feedback.
  - `Contacts` relation in Product Feedback.
  - Rollups `Reporting Companies` and `Reporting Contacts`.

## Recommended Path (Fastest Unblock)

1. Confirm canonical entity sources in Notion:
   - Contact table: use existing `Clients` DB (id: `29cf79b2-c8ac-81d1-ab9e-e2086f9b5bbf`) unless a dedicated contacts DB already exists.
   - Company table: either identify existing companies DB, or create one as `Companies`.
2. Create relations manually in Notion UI (API path is currently blocked for these relation writes).
3. Add rollups once relations exist.
4. Run identity backfill v2 and publish digest views.

## Manual UI Runbook (10-15 min)

1. Open Product Feedback DB in Notion:
   - `https://www.notion.so/308f79b2c8ac81d1a3fff1dad31a4edd`
2. Add relation: `Contacts`
   - Type: Relation
   - Target DB: `Clients` (or approved contacts DB)
   - Allow multiple values: On
3. Add relation: `Company`
   - Type: Relation
   - Target DB: approved companies DB
   - Allow multiple values: Off
4. Add rollup: `Reporting Contacts`
   - Relation: `Sub-item` or `Contacts` (based on chosen model)
   - Property: `Contacts`
   - Aggregation: `Show unique values`
5. Add rollup: `Reporting Companies`
   - Relation: `Sub-item` or `Company`
   - Property: `Company`
   - Aggregation: `Show unique values`
6. Create temporary QA view:
   - Filter: `Company is empty OR Contacts is empty`
   - Save as: `Identity QA`

## Post-Unblock Backfill Plan

1. Identity pass:
   - Map known customer names/domains to `Company`.
   - Map known individuals/emails to `Contacts`.
2. Novelty pass:
   - Keep existing `Needs Review` defaults.
   - Promote true net-new themes to `New`.
   - Mark known clusters as `Known`.
3. Parent/sub-item pass:
   - For clear duplicates, attach child rows to parent.
   - Recompute parent `Occurrence Count`.

## Acceptance Criteria

1. Schema
   - `Company`, `Contacts`, `Reporting Contacts`, `Reporting Companies` exist.
2. Data quality
   - >= 95% rows have non-empty `Company` + at least one `Contacts` relation.
3. Reporting readiness
   - Views available:
     - `Recurring Issues`
     - `Novel Issues`
     - `Identity QA`
4. Digest readiness
   - Inputs validated for daily send at 4:30 PM MT and weekly rollup.

## Risks and Mitigations

1. No canonical companies DB exists
   - Mitigation: create `Companies` DB with minimal schema (`Company Name`, `Domain`, `Tier`), then backfill.
2. Relation ambiguity (contact linked to multiple companies)
   - Mitigation: preserve `Needs Review` queue; avoid forced merges.
3. False duplicate merges
   - Mitigation: keep conservative parenting; require PM validation for low-confidence matches.

## Owner + Sequencing

1. Tyler: run manual relation/rollup setup in Notion.
2. Copilot: execute identity + parenting backfill after setup completion.
3. Tyler + Ben: validate first digest outputs and adjust novelty thresholds.
