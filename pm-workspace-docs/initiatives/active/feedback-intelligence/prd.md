# Feedback Intelligence PRD

## Overview

- Owner: Tyler
- Target Release: 2026-03-13
- Status: Draft
- Strategic Pillar: Data Knowledge

## Outcome Chain

Unified feedback ingestion and triage enables product and CS to aggregate recurring and novel customer signals in one canonical system
-> so that teams can identify what is frequently requested vs. newly emerging
-> so that roadmap decisions, CS follow-through, and leadership updates are evidence-backed
-> so that AskElephant improves retention, expansion readiness, and execution quality.

## Problem Statement

Product Requests and Product Feedback are currently split across two Notion databases with inconsistent identity linkage. This creates duplicate work, weak counting of repeated customer signals, and low confidence in "most common" vs. "new" themes.

### Evidence

- Head of CS explicitly requested weekly and daily summaries of common and novel customer feedback.
- Existing schema includes parent/sub-items in Product Feedback but Product Requests still has free-text customer identity.
- Existing `signal-router.py` already generates normalized queue entries and RICE metadata that can be extended.

## Goals

1. Create one canonical feedback database (repurposed Product Feedback) for both feedback and requests.
2. Normalize customer identity to Company and Contact relations.
3. Support parent/sub-item aggregation with reliable occurrence counting.
4. Distinguish recurring from novel feedback and ship digest reporting.

## Non-Goals

1. Rebuilding all Notion workflows from scratch.
2. Full multi-system ticket ingestion in phase 1 beyond Linear product-channel intake.
3. Replacing human triage judgment for low-confidence dedupe matches.

## User Personas

### Primary: CSM

- Job-to-be-done: Surface customer pain early and communicate high-signal trends.
- Current pain: Feedback is fragmented and hard to quantify.
- Success looks like: Clear recurring/novel signal views with customer context.

### Secondary: Sales Leader

- Job-to-be-done: Understand market objections and request patterns that affect win rates.
- Current pain: No reliable, consolidated reporting across calls and tickets.
- Success looks like: Weekly confidence report by trend and novelty.

### Tertiary: RevOps

- Job-to-be-done: Maintain clean entity linkage and operational reporting quality.
- Current pain: Free-text identities create duplicate and untrusted records.
- Success looks like: High linkage rate to canonical Company/Contact records.

## Must-Have Requirements

1. Canonical properties for dedupe and novelty (`Feedback Key`, `Occurrence Count`, `First Seen`, `Last Seen`, `Novelty Status`).
2. Company and Contact relation model for each feedback unit.
3. Parent/sub-item structure where repeated signals roll up under one parent issue.
4. Daily digest at 4:30 PM MT and weekly summary for Ben.
5. Slack delivery to DM Ben and `#customer-feedback`.

## Should-Have Requirements

1. Confidence score and manual review queue for fuzzy matches.
2. Tier-weighted reporting views.
3. Drift detection for top recurring topics.

## Trust and Privacy

Current policy for this initiative is to ingest all recorded calls. This is explicitly a speed-over-conservatism policy and must be revisited if compliance requirements change.

## Open Questions

1. Should ticket ingestion expand beyond Linear product-channel in phase 2?
2. Should novelty threshold be strict hash-only or include semantic similarity?
3. What SLA should govern manual triage for low-confidence routing?
