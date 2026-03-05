# Feedback Intelligence Research Notes

## Origin

This initiative was initiated after a discussion with Ben Harrison (Head of CS) to operationalize customer-facing call signal extraction and unify feedback/request triage in Notion.

## Current-State Findings

1. Product Feedback has parent/sub-item support and richer signal taxonomy.
2. Product Requests is structurally separate and uses less normalized customer identity in practice.
3. Existing automation assets already exist:
   - `pm-workspace-docs/scripts/automation/signal-router.py`
   - routing queues for Notion, Linear, and Google Tasks.

## Core User Needs

1. Aggregate repeated feedback with accurate counts and supporting context.
2. Detect and highlight novel feedback (never-seen topics).
3. Produce digestible reporting for leadership (daily + weekly).
4. Keep customer identity trustworthy via relation-based linking.

## Risks

1. Duplicate identity records will degrade rollups unless backfill quality is measured.
2. Aggressive dedupe may merge distinct requests if similarity thresholds are too loose.
3. Full-call ingestion may increase noise and compliance risk if not monitored.

## Hypotheses

1. If feedback/request data is unified in one canonical model, triage time decreases and reporting quality increases.
2. If novelty is explicitly tracked, PM and CS will detect emerging product opportunities faster.
3. If digest cadence is predictable (4:30 PM MT daily + weekly rollup), stakeholder adoption will increase.
