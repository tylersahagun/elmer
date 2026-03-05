# Metrics: Agent Command Center

## North Star Metric

| Metric                              | Data Source | Baseline | Target | Current | Last Updated |
| ----------------------------------- | ----------- | -------- | ------ | ------- | ------------ |
| Daily hub engagement rate (DAU/MAU) | PostHog     | TBD      | > 50%  | N/A     | 2026-02-07   |

## Leading Indicators

| Metric                                  | Data Source | Baseline  | Target         | Measurement Cadence |
| --------------------------------------- | ----------- | --------- | -------------- | ------------------- |
| Time to configure first agent           | PostHog     | ~80 hours | < 10 minutes   | Per user            |
| Chat config completion rate             | PostHog     | N/A       | > 80%          | Per setup           |
| Recap view rate (within 24h of meeting) | PostHog     | TBD       | > 50%          | Per meeting         |
| Approval completion time (median)       | PostHog     | TBD       | < 2 minutes    | Per action          |
| Template edit frequency                 | PostHog     | N/A       | > 1/user/week  | Weekly              |
| Test run usage (manual enrollment)      | PostHog     | 0         | > 3/admin/week | Weekly              |

## Guardrail Metrics (should NOT degrade)

| Metric                                   | Data Source       | Current Value | Alert Threshold |
| ---------------------------------------- | ----------------- | ------------- | --------------- |
| CRM data accuracy (board-ready standard) | HubSpot + PostHog | TBD           | < 95%           |
| Agent action failure rate                | PostHog           | TBD           | > 5%            |
| Privacy incidents (unauthorized shares)  | PostHog + Support | 0             | > 0             |
| Approval queue size (per user)           | PostHog           | N/A           | > 20 pending    |
| Share failure rate                       | PostHog           | N/A           | > 2%            |

## PostHog Integration

- **Dashboard ID:** Not created
- **Dashboard URL:** TBD
- **Key Insights:** TBD

## Baseline Establishment Plan

- [ ] Instrument `agent_configured_via_chat` event in PostHog
- [ ] Instrument `daily_hub_viewed` event
- [ ] Instrument `artifact_viewed` event (with meeting_id, artifact_type)
- [ ] Instrument `approval_completed` event (with time_to_complete, action_type)
- [ ] Instrument `test_run_executed` event
- [ ] Instrument `template_edited_via_chat` event
- [ ] Collect 14 days of baseline data post-launch
- [ ] Set targets based on baseline + improvement goals

## Data Source Notes

- **PostHog:** Primary source for all engagement and conversion metrics
- **HubSpot:** CRM data quality metrics, deal pipeline accuracy
- **Support tickets:** Adoption failure tracking, stuck-point identification
- **In-app NPS:** Monthly agent accuracy satisfaction survey
