# North Star & Aha Moment Validation Plan

**Created:** 2026-01-24  
**Status:** Active  
**Owner:** Tyler Sahagun

---

## Purpose

This document defines the hypotheses for AskElephant's North Star metric and persona-specific aha moments, along with the specific validation methodology to prove or disprove each hypothesis using PostHog data.

---

## Validation Framework

### Statistical Requirements

| Criterion          | Threshold                 | Rationale                  |
| ------------------ | ------------------------- | -------------------------- |
| Retention lift     | >50% relative improvement | Meaningful business impact |
| Sample size        | n≥100 per group           | Statistical reliability    |
| Confidence level   | p<0.05                    | Standard significance      |
| Observation period | 90 days minimum           | Capture churn behavior     |

### Methodology

For each hypothesis:

1. Create behavioral cohort (achieved vs not achieved)
2. Compare retention curves (7, 14, 30, 60, 90 day)
3. Calculate lift and statistical significance
4. Document revenue correlation if available

---

## Section 1: North Star Metric Hypotheses

### Hypothesis NS-1 (Primary): Workflow Activity

> **"Workspaces with ≥3 successful workflow runs per week retain significantly better than workspaces without, making this the strongest leading indicator of product-market fit."**

#### Definition

| Component   | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| Metric      | Count of `workflows:run_completed` events per workspace per week |
| Threshold   | ≥3 runs in any 7-day rolling window                              |
| Entity      | Workspace (not user)                                             |
| Time Window | Weekly, measured continuously                                    |

#### Validation Approach

**Step 1: Create Cohorts**

```
Cohort A (Active Workflow):
- Definition: $group_0 (workspace) had ≥3 workflows:run_completed in any 7-day window
- First occurrence within 30 days of workspace creation

Cohort B (Inactive/Low Workflow):
- Definition: $group_0 (workspace) had <3 workflows:run_completed in first 30 days
```

**Step 2: Retention Query**

```sql
-- Workspace-level retention by workflow activity
WITH workspace_workflow AS (
    SELECT
        $group_0 as workspace_id,
        min(timestamp) as first_workflow,
        count(*) as total_runs
    FROM events
    WHERE event = 'workflows:run_completed'
        AND timestamp > now() - INTERVAL 180 DAY
    GROUP BY workspace_id
    HAVING count(*) >= 3
),
workspace_activity AS (
    SELECT
        $group_0 as workspace_id,
        min(timestamp) as first_activity,
        max(timestamp) as last_activity,
        dateDiff('day', min(timestamp), max(timestamp)) as active_span
    FROM events
    WHERE timestamp > now() - INTERVAL 180 DAY
    GROUP BY workspace_id
)
SELECT
    CASE WHEN ww.workspace_id IS NOT NULL THEN 'workflow_active' ELSE 'workflow_inactive' END as segment,
    count(DISTINCT wa.workspace_id) as workspaces,
    avg(wa.active_span) as avg_active_days,
    countIf(wa.active_span >= 30) / count(*) as d30_retention,
    countIf(wa.active_span >= 60) / count(*) as d60_retention,
    countIf(wa.active_span >= 90) / count(*) as d90_retention
FROM workspace_activity wa
LEFT JOIN workspace_workflow ww ON wa.workspace_id = ww.workspace_id
GROUP BY segment
```

**Step 3: Revenue Correlation**

```sql
-- Correlate workflow activity with MRR
WITH workspace_workflow AS (
    SELECT
        $group_0 as workspace_id,
        count(*) as workflow_runs,
        CASE WHEN count(*) >= 3 THEN 1 ELSE 0 END as is_active
    FROM events
    WHERE event = 'workflows:run_completed'
        AND timestamp > now() - INTERVAL 30 DAY
    GROUP BY workspace_id
),
workspace_revenue AS (
    SELECT
        sc.metadata.workspaceId as workspace_id,
        SUM(si.amount_paid) / 100 as mrr
    FROM stripe_invoice si
    JOIN stripe_customer sc ON si.customer_id = sc.id
    WHERE si.status = 'paid'
        AND si.created_at > now() - INTERVAL 30 DAY
    GROUP BY workspace_id
)
SELECT
    ww.is_active,
    count(*) as workspace_count,
    avg(wr.mrr) as avg_mrr,
    sum(wr.mrr) as total_mrr
FROM workspace_workflow ww
LEFT JOIN workspace_revenue wr ON ww.workspace_id = wr.workspace_id
GROUP BY ww.is_active
```

#### Success Criteria

| Metric              | Target              | Result  |
| ------------------- | ------------------- | ------- |
| D30 Retention Lift  | >50%                | Pending |
| D60 Retention Lift  | >50%                | Pending |
| D90 Retention Lift  | >50%                | Pending |
| Revenue Correlation | >30% higher avg MRR | Pending |

---

### Hypothesis NS-2 (Alternative): CRM-Connected Workspaces

> **"Weekly Active Workspaces with CRM integration (HubSpot or Salesforce) retain better because CRM connection creates switching costs and deeper value."**

#### Definition

| Component   | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| Metric      | WAW (Weekly Active Workspaces) with CRM agent enabled                |
| Threshold   | `hubspot_agent:enabled` OR `salesforce_agent:enabled` event occurred |
| Entity      | Workspace                                                            |
| Time Window | Weekly activity + CRM enabled                                        |

#### Validation Approach

**Step 1: Create Cohorts**

```
Cohort A (CRM Connected):
- Definition: Workspace has hubspot_agent:enabled OR salesforce_agent:enabled event
- Any time in workspace lifetime

Cohort B (No CRM):
- Definition: Workspace never had CRM agent enabled event
```

**Step 2: Retention Query**

```sql
-- CRM connection impact on retention
WITH crm_workspaces AS (
    SELECT DISTINCT
        -- Need to derive workspace from user context since agent events lack workspace
        distinct_id,
        min(timestamp) as crm_enabled_date
    FROM events
    WHERE event IN ('hubspot_agent:enabled', 'salesforce_agent:enabled')
        AND timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id
),
user_activity AS (
    SELECT
        distinct_id,
        min(timestamp) as first_activity,
        max(timestamp) as last_activity,
        dateDiff('day', min(timestamp), max(timestamp)) as active_span
    FROM events
    WHERE timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id
)
SELECT
    CASE WHEN cw.distinct_id IS NOT NULL THEN 'crm_connected' ELSE 'no_crm' END as segment,
    count(DISTINCT ua.distinct_id) as users,
    avg(ua.active_span) as avg_active_days,
    countIf(ua.active_span >= 30) / count(*) as d30_retention,
    countIf(ua.active_span >= 60) / count(*) as d60_retention,
    countIf(ua.active_span >= 90) / count(*) as d90_retention
FROM user_activity ua
LEFT JOIN crm_workspaces cw ON ua.distinct_id = cw.distinct_id
GROUP BY segment
```

**Note:** This query is limited because agent events lack workspace context. Full validation requires instrumentation fix.

#### Success Criteria

| Metric              | Target              | Result  |
| ------------------- | ------------------- | ------- |
| D30 Retention Lift  | >40%                | Pending |
| D60 Retention Lift  | >40%                | Pending |
| Revenue Correlation | >50% higher avg MRR | Pending |

---

### Hypothesis NS-3: Automated Actions Per Workspace

> **"Automated actions per paying workspace directly correlates with pricing model and expansion behavior."**

#### Definition

| Component   | Value                                                    |
| ----------- | -------------------------------------------------------- |
| Metric      | Sum of automated actions (workflow runs + agent actions) |
| Threshold   | ≥10 automated actions per month                          |
| Entity      | Paying workspace                                         |
| Time Window | Monthly                                                  |

#### Validation Approach

```sql
-- Automated actions vs expansion
WITH automation_volume AS (
    SELECT
        $group_0 as workspace_id,
        count(*) as automated_actions
    FROM events
    WHERE event IN ('workflows:run_completed', 'agents:run_started')
        AND timestamp > now() - INTERVAL 90 DAY
    GROUP BY workspace_id
),
revenue_change AS (
    -- Compare MRR 90 days ago vs now
    SELECT
        sc.metadata.workspaceId as workspace_id,
        SUM(CASE WHEN si.created_at > now() - INTERVAL 30 DAY THEN si.amount_paid ELSE 0 END) / 100 as current_mrr,
        SUM(CASE WHEN si.created_at BETWEEN now() - INTERVAL 120 DAY AND now() - INTERVAL 90 DAY THEN si.amount_paid ELSE 0 END) / 100 as prev_mrr
    FROM stripe_invoice si
    JOIN stripe_customer sc ON si.customer_id = sc.id
    WHERE si.status = 'paid'
    GROUP BY workspace_id
)
SELECT
    CASE
        WHEN av.automated_actions >= 50 THEN 'power'
        WHEN av.automated_actions >= 10 THEN 'active'
        ELSE 'light'
    END as automation_tier,
    count(*) as workspace_count,
    avg(rc.current_mrr) as avg_current_mrr,
    avg(rc.current_mrr - rc.prev_mrr) as avg_mrr_change,
    countIf(rc.current_mrr > rc.prev_mrr) / count(*) as expansion_rate
FROM automation_volume av
LEFT JOIN revenue_change rc ON av.workspace_id = rc.workspace_id
WHERE rc.prev_mrr > 0
GROUP BY automation_tier
```

#### Success Criteria

| Metric                      | Target | Result  |
| --------------------------- | ------ | ------- |
| Expansion rate (power tier) | >30%   | Pending |
| MRR correlation             | r>0.3  | Pending |

---

## Section 2: Aha Moment Hypotheses

### Hypothesis AHA-REP: Sales Rep Briefings

> **"Sales reps who receive meeting briefings for 3+ meetings within their first 14 days have 2x better 30-day retention."**

#### Definition

| Component   | Value                                                |
| ----------- | ---------------------------------------------------- |
| Action      | `email:briefing_sent` event (or equivalent)          |
| Frequency   | ≥3 times                                             |
| Time Period | Within 14 days of user's first event                 |
| Persona     | Users with `role` = 'User' or similar IC designation |

#### Validation Approach

**Step 1: Identify Briefing Events**

First, determine what events indicate briefing delivery:

- `email:briefing_sent` (if exists)
- `engagement:prepare_button_clicked`
- `$pageview` on `/engagements/*/prepare`

**Step 2: Create Cohort**

```sql
-- Users who hit aha moment
WITH user_first_seen AS (
    SELECT
        distinct_id,
        min(timestamp) as first_seen
    FROM events
    WHERE timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id
),
briefing_users AS (
    SELECT
        distinct_id,
        count(*) as briefing_count,
        min(timestamp) as first_briefing
    FROM events
    WHERE event = 'engagement:prepare_button_clicked'  -- Adjust event name
        AND timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id
)
SELECT
    CASE
        WHEN bu.briefing_count >= 3
            AND dateDiff('day', ufs.first_seen, bu.first_briefing) <= 14
        THEN 'aha_achieved'
        ELSE 'no_aha'
    END as segment,
    count(*) as user_count,
    avg(dateDiff('day', ufs.first_seen, (
        SELECT max(timestamp) FROM events WHERE distinct_id = ufs.distinct_id
    ))) as avg_active_days
FROM user_first_seen ufs
LEFT JOIN briefing_users bu ON ufs.distinct_id = bu.distinct_id
GROUP BY segment
```

#### Success Criteria

| Metric             | Target         | Result  |
| ------------------ | -------------- | ------- |
| D30 Retention Lift | >100% (2x)     | Pending |
| Sample Size        | n≥50 per group | Pending |

---

### Hypothesis AHA-REVOPS: Workflow Success

> **"RevOps users who have 1 workflow run successfully 3+ times within 14 days have 2.5x better 60-day retention."**

#### Definition

| Component   | Value                                            |
| ----------- | ------------------------------------------------ |
| Action      | `workflows:run_completed` for same `workflowId`  |
| Frequency   | Same workflow succeeds ≥3 times                  |
| Time Period | Within 14 days of user's first event             |
| Persona     | Users with `role` = 'Owner' or admin designation |

#### Validation Approach

```sql
-- RevOps aha moment validation
WITH user_first_seen AS (
    SELECT
        distinct_id,
        min(timestamp) as first_seen
    FROM events
    WHERE timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id
),
workflow_success AS (
    SELECT
        distinct_id,
        properties.workflowId as workflow_id,
        count(*) as run_count,
        min(timestamp) as first_run
    FROM events
    WHERE event = 'workflows:run_completed'
        AND timestamp > now() - INTERVAL 180 DAY
    GROUP BY distinct_id, workflow_id
    HAVING count(*) >= 3
)
SELECT
    CASE
        WHEN ws.distinct_id IS NOT NULL
            AND dateDiff('day', ufs.first_seen, ws.first_run) <= 14
        THEN 'aha_achieved'
        ELSE 'no_aha'
    END as segment,
    count(DISTINCT ufs.distinct_id) as user_count
FROM user_first_seen ufs
LEFT JOIN workflow_success ws ON ufs.distinct_id = ws.distinct_id
GROUP BY segment
```

#### Success Criteria

| Metric             | Target         | Result  |
| ------------------ | -------------- | ------- |
| D60 Retention Lift | >150% (2.5x)   | Pending |
| Sample Size        | n≥30 per group | Pending |

---

### Hypothesis AHA-CSM: Customer Intelligence

> **"CSMs who view customer pages with insights 3+ times in their first 7 days have 2x better 30-day retention."**

#### Definition

| Component   | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Action      | `$pageview` on `/companies/*` or `properties:viewed_on_engagement` |
| Frequency   | ≥3 times                                                           |
| Time Period | Within 7 days of first event                                       |
| Persona     | Users identified as CSMs                                           |

#### Validation Challenge

Currently no reliable way to identify CSMs in the data. Options:

1. Use `role` property (if tracked)
2. Filter by workspace type (CS-focused companies)
3. Skip until persona tagging implemented

---

### Hypothesis AHA-MANAGER: Team Visibility

> **"Managers who view team dashboards with 5+ meetings have higher feature stickiness."**

#### Definition

| Component | Value                                     |
| --------- | ----------------------------------------- |
| Action    | `$pageview` on team/dashboard pages       |
| Frequency | Dashboard view + 5+ team meetings visible |
| Persona   | Users with `role` = 'Manager'             |

#### Validation Challenge

No explicit "team dashboard" event. Would need:

- New event: `team_dashboard:viewed`
- Property: `team_meetings_count`

---

## Section 3: Validation Timeline

### Week 1: Data Preparation

| Task                               | Status  | Owner       |
| ---------------------------------- | ------- | ----------- |
| Fix agent event workspace context  | Pending | Engineering |
| Identify briefing event equivalent | Pending | Tyler       |
| Verify workflow event properties   | Pending | Tyler       |
| Run sample size estimation         | Pending | Tyler       |

### Week 2: Primary Hypotheses

| Task                           | Status  | Owner |
| ------------------------------ | ------- | ----- |
| Run NS-1 (Workflow) validation | Pending | Tyler |
| Run AHA-REVOPS validation      | Pending | Tyler |
| Document initial findings      | Pending | Tyler |

### Week 3: Secondary Hypotheses

| Task                                     | Status  | Owner |
| ---------------------------------------- | ------- | ----- |
| Run NS-2 (CRM) validation                | Pending | Tyler |
| Run NS-3 (Automation volume) validation  | Pending | Tyler |
| Run AHA-REP validation (if events exist) | Pending | Tyler |

### Week 4: Synthesis

| Task                               | Status  | Owner |
| ---------------------------------- | ------- | ----- |
| Compile results                    | Pending | Tyler |
| Determine winning hypothesis       | Pending | Tyler |
| Create validation results document | Pending | Tyler |

---

## Section 4: Decision Criteria

### North Star Selection Matrix

| Criterion             | NS-1 (Workflows) | NS-2 (CRM)         | NS-3 (Automation) |
| --------------------- | ---------------- | ------------------ | ----------------- |
| Retention correlation | ?                | ?                  | ?                 |
| Revenue correlation   | ?                | ?                  | ?                 |
| Team influence        | High             | Medium             | High              |
| Ease of measurement   | High             | Medium (needs fix) | High              |
| Alignment with vision | High             | Medium             | High              |

**Selection Rule:** Choose hypothesis with highest retention correlation that also shows revenue correlation and team can influence.

### Aha Moment Selection

| Criterion            | AHA-REP | AHA-REVOPS | AHA-CSM | AHA-MANAGER |
| -------------------- | ------- | ---------- | ------- | ----------- |
| Events exist         | ?       | Yes        | Partial | No          |
| Persona identifiable | Partial | Yes        | No      | Partial     |
| Actionable           | High    | High       | Medium  | Medium      |

**Selection Rule:** Choose hypothesis per persona with strongest retention signal and existing instrumentation.

---

## Section 5: Fallback Plans

### If NS-1 Fails (Workflows not predictive)

1. Test NS-2 (CRM integration)
2. Test composite metric: "3+ meetings processed + 1 workflow run"
3. Consider "Weekly Active Users" as simpler baseline

### If Aha Moments Not Validated

1. Run exploratory analysis: "What do retained users do differently?"
2. Interview retained users to identify qualitative patterns
3. Consider time-to-first-value as proxy

### If Data Insufficient

1. Wait for more data (run analysis monthly)
2. Implement missing events (P1 priority)
3. Use proxy metrics with lower confidence

---

## Appendix: Event Availability

| Hypothesis  | Required Event            | Exists  | Notes               |
| ----------- | ------------------------- | ------- | ------------------- |
| NS-1        | `workflows:run_completed` | Yes     | Has workspaceId     |
| NS-2        | `*_agent:enabled`         | Yes     | Missing workspaceId |
| NS-3        | Multiple workflow events  | Yes     | Has workspaceId     |
| AHA-REP     | Briefing event            | ?       | Need to identify    |
| AHA-REVOPS  | `workflows:run_completed` | Yes     | Has workflowId      |
| AHA-CSM     | Customer page view        | Partial | Has $pageview       |
| AHA-MANAGER | Team dashboard view       | No      | Needs new event     |

---

_This document will be updated with validation results as they are gathered._
