# Metrics: Meeting Summary
*Last updated: 2026-03-04 | Baseline check: posthog instrument-check run*

---

## North Star Metric

| Metric | Data Source | Baseline | Target | Current | Last Updated |
| ------ | ----------- | -------- | ------ | ------- | ------------ |
| Summary View Rate — % of users with a recorded meeting who view summary ≥1x/week | PostHog funnel: `meeting_summary:generated` → `meeting_summary:viewed` | **TBD — `meeting_summary:generated` event does not exist yet** | >60% of users with recorded meetings (GA + 60 days) | — | 2026-03-04 |

**Why this is blocked:** The denominator requires a `meeting_summary:generated` event in the backend. Today, generation fires silently with no PostHog capture. Without this, the funnel can't be computed.

---

## Leading Indicators

| Metric | Data Source | Baseline | Target | Measurement Cadence |
| ------ | ----------- | -------- | ------ | ------------------- |
| `meeting_summary:viewed` — raw click count | PostHog event | 100+ events / 21 users in 30d (all internal, beta-flag only) | Growing WoW post-open-beta | Weekly |
| `meeting_summary:generated` — summaries created | PostHog event | **TBD — event does not exist yet** | >N per week (set after baseline) | Weekly |
| Summary generation success rate | PostHog: `meeting_summary:generated` where `success=true` ÷ total | **TBD — event does not exist yet** | >95% | Weekly |
| Time to first view post-generation | PostHog funnel: `generated` → first `viewed` per engagement | **TBD — context props missing** | <2 minutes post-meeting (Beta target) | Weekly |
| Return view rate (viewed >1x) | PostHog: `meeting_summary:returned` events | **TBD — event does not exist yet** | >30% of viewers return | Weekly |
| Template applied (non-default) rate | PostHog (TBD — template not built yet) | TBD | >35% (GA + 60 days) | Weekly |
| AI section edit usage | PostHog (TBD — edit flow not built yet) | TBD | >25% of summary views (GA + 60 days) | Weekly |
| Summary share rate | PostHog (TBD — sharing not built yet) | TBD | >30% improvement over baseline (GA + 60 days) | Weekly |

---

## Guardrail Metrics (should NOT degrade)

| Metric | Data Source | Current Value | Alert Threshold |
| ------ | ----------- | ------------- | --------------- |
| Summary generation error rate | Backend logs / `meeting_summary:generation_failed` (to be created) | **Unknown — not tracked** | >5% failures |
| Summary generation latency (P95) | `generation_time_ms` prop on `meeting_summary:generated` (to be created) | **Unknown — not tracked** | >60s (blocker is currently open) |
| `meeting_summary:viewed` event drop-off | PostHog trend on `meeting_summary:viewed` | Active daily (internal beta) | >30% WoW drop post-launch |

---

## PostHog Integration

- **Dashboard ID:** Not created (no customer-facing data yet to warrant a dashboard)
- **Dashboard URL:** Shared view from `_meta.json`: https://us.posthog.com/shared/TXZ6pyGjHhS3RNKsnK-i-K0q3Qr6ug
- **Key Insights:**
  - `meeting_summary:viewed` event: [Temp insight IJlTns2B](https://us.posthog.com/project/81505/insights/IJlTns2B) — 30d trend (unsaved)
  - No other meeting-summary insights exist

---

## Baseline Establishment Plan

### Phase 1 — Instrument (Before Open Beta)

- [ ] **P1 — Backend:** Add `meeting_summary:generated` event in `media-recording-processing.context.ts` after successful `upsertEngagementSummaryByEngagementId()` call, with props: `{ engagement_id, workspace_id, generation_time_ms, summary_length_chars, transcript_length_chars, success: true }`
- [ ] **P1 — Backend:** Add `meeting_summary:generation_failed` event in catch block with props: `{ engagement_id, workspace_id, error_type }`
- [ ] **P1 — Frontend:** Add `engagement_id` and `workspace_id` to `track(AnalyticsEvent.MEETING_SUMMARY_VIEWED)` call in `chats-tabs.tsx:271`
- [ ] **P2 — Frontend:** Add `meeting_summary:returned` event for repeat views in `chats-tabs.tsx`
- [ ] **P2 — Frontend:** Add both new event types to `AnalyticsEventParams` type in `constants.ts`

### Phase 2 — Collect Baseline (Open Beta → Week 2)

- [ ] Let events collect for 14 days after open beta (April 15 target)
- [ ] Compute initial Summary View Rate from `generated` → `viewed` funnel
- [ ] Compare internal beta data vs. first external customer cohort

### Phase 3 — Set Targets + Dashboard (GA - 2 weeks)

- [ ] Set weekly view rate target based on beta data (may revise >60% target based on actuals)
- [ ] Create PostHog dashboard: North Star funnel, weekly engagement trend, workspace-level breakdown
- [ ] Add alert: generation error rate >5%
- [ ] Update `_meta.json` with `baseline_established: true` and `outcomes.baseline`

---

## Data Source Notes

| Metric | PostHog Event | Enum Location |
|---|---|---|
| `meeting_summary:viewed` (click) | `meeting_summary:viewed` | `apps/web/src/lib/constants.ts:85` (`AnalyticsEvent.MEETING_SUMMARY_VIEWED`) |
| `meeting_summary:generated` (to add) | `meeting_summary:generated` | Backend: `apps/functions/src/contexts/infra/analytics/constants.ts` |
| `meeting_summary:generation_failed` (to add) | `meeting_summary:generation_failed` | Backend: `apps/functions/src/contexts/infra/analytics/constants.ts` |
| `meeting_summary:returned` (to add) | `meeting_summary:returned` | `apps/web/src/lib/constants.ts` |

Full instrumentation plan: `pm-workspace-docs/research/instrumentation/meeting-summary-check.md`
