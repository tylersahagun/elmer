# Client Usage Metrics - Success Metrics

## North Star Metric

**Proactive CS Outreach Rate:** Percentage of at-risk clients (usage below threshold) that receive proactive CS outreach within 48 hours of alert.

- **Current baseline:** ~0% (no usage visibility exists, outreach is reactive)
- **Target:** 80% of at-risk clients contacted within 48 hours
- **Measurement:** Track CS outreach events correlated with usage alert triggers

## Leading Indicators

| Metric                            | Baseline               | Target                               | Data Source               | Timeline            |
| --------------------------------- | ---------------------- | ------------------------------------ | ------------------------- | ------------------- |
| CS dashboard daily views          | 0                      | 5+ views/day per CSM                 | PostHog                   | 30 days post-launch |
| Time to detect usage drop         | Unknown (often months) | < 14 days                            | PostHog alerts            | 60 days post-launch |
| Expansion conversations with data | ~0 (anecdotal)         | 50% of renewals reference usage data | HubSpot + manual tracking | 90 days post-launch |

## Guardrail Metrics (Must Not Regress)

| Metric                             | Threshold      | Why                          |
| ---------------------------------- | -------------- | ---------------------------- |
| Dashboard load time                | < 3 seconds    | CS won't use slow tools      |
| Data freshness                     | < 24 hours old | Stale data erodes trust      |
| False positive rate on risk alerts | < 20%          | Alert fatigue kills adoption |

## PostHog Integration

| Field                | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| Dashboard ID         | TBD (create during build phase)                                      |
| Baseline established | No                                                                   |
| Key events to track  | `cs_dashboard_view`, `usage_alert_triggered`, `usage_alert_acted_on` |

## Baseline Establishment Plan

1. **Week 1:** Instrument CS dashboard usage events in PostHog
2. **Week 2:** Capture baseline metrics for current CS outreach patterns (manual survey)
3. **Week 4:** First data point for "time to detect usage drop" baseline
4. **Week 8:** Sufficient data for before/after comparison on outreach rate

---

_Owner: Tyler Sahagun_
_Last updated: 2026-02-08_
