# North Star Validation Results

**Date:** 2026-01-24  
**Status:** Initial Analysis Complete  
**Analyst:** Tyler Sahagun (via PM Copilot)

---

## Executive Summary

Initial validation analysis of North Star metric hypotheses and aha moments reveals:

1. **NS-1 (Workflow Activity) shows strong promise** as the North Star metric
2. **CRM adoption is widespread** but workspace attribution limited due to instrumentation gap
3. **Activation funnel has significant drop-off** at onboarding stage
4. **Post-onboarding workflow adoption is high** (52% of onboarded users run a workflow)

### Recommended North Star Metric

**"Workspaces with 3+ successful workflow runs per week"**

Rationale:

- 106,631 workflow completions in 90 days (healthy volume)
- Consistent ~1,500-1,900 daily active users running workflows
- 26+ workspaces with continuous weekly workflow activity
- Aligns with product vision ("revenue outcome system, not a note-taker")

---

## Validation Data Summary

### Workflow Activity (NS-1)

| Metric                           | Value                  | Assessment            |
| -------------------------------- | ---------------------- | --------------------- |
| Total workflow completions (90d) | 106,631                | High volume           |
| Average DAU (workflow users)     | ~1,500-1,900           | Healthy               |
| Workspaces with weekly activity  | 26+ (top tier visible) | Good adoption         |
| Weekday vs weekend pattern       | 5-8x higher weekday    | B2B pattern confirmed |

**Weekly Workflow Volume (Last 14 Weeks):**

| Week         | Unique Sessions |
| ------------ | --------------- |
| Oct 25       | 35              |
| Oct 26-Nov 1 | 275             |
| Nov 2-8      | 281             |
| Nov 9-15     | 283             |
| Nov 16-22    | 297             |
| Nov 23-29    | 284             |
| Nov 30-Dec 6 | 304             |
| Dec 7-13     | 300             |
| Dec 14-20    | 311             |
| Dec 21-27    | 276             |
| Dec 28-Jan 3 | 269             |
| Jan 4-10     | 311             |
| Jan 11-17    | 315             |
| Jan 18-23    | 324             |

**Trend:** Steady growth from 275 to 324 weekly sessions (+18% over 3 months)

---

### CRM Adoption (NS-2)

| Metric                                | Value   | Assessment      |
| ------------------------------------- | ------- | --------------- |
| HubSpot agent:enabled events (90d)    | 208,553 | Very high       |
| Salesforce agent:enabled events (90d) | 22,416  | Moderate        |
| Total CRM events                      | 230,969 | Strong adoption |

**Limitation:** Agent events lack workspace context. Cannot determine unique workspaces with CRM enabled.

**Weekly CRM Events:**

| Week      | HubSpot | Salesforce |
| --------- | ------- | ---------- |
| Jan 11-17 | 20,610  | 2,502      |
| Jan 18-23 | 20,733  | 2,188      |

**Note:** High event volume suggests these events fire frequently (possibly per workflow run, not just on initial setup).

---

### Activation Funnel

| Stage                   | Count  | Conversion       |
| ----------------------- | ------ | ---------------- |
| First Visit ($pageview) | 38,481 | 100%             |
| Onboarding Complete     | 44     | 0.11%            |
| First Workflow          | 23     | 52% of onboarded |

**Key Insights:**

1. **Massive drop-off before onboarding** - Only 0.11% complete onboarding (likely includes many non-signup visits)
2. **Post-onboarding conversion is excellent** - 52% of onboarded users run a workflow
3. **Time to first workflow** - Median 7 hours, Average 14 days (suggests bimodal distribution)

**Recommendation:** Focus on getting more users through onboarding. The path from onboarding to workflow is strong.

---

### Onboarding Events

| Metric                                | Value | Notes             |
| ------------------------------------- | ----- | ----------------- |
| onboarding:flow_completed (last week) | 48    | Low volume        |
| All-time (90d visible)                | 48    | Event appears new |

**Assessment:** Onboarding event tracking may be recently implemented. Historical data limited.

---

## Hypothesis Validation Status

### NS-1: Workflow Activity - PROMISING

| Criterion           | Target            | Actual                   | Status  |
| ------------------- | ----------------- | ------------------------ | ------- |
| Volume sufficient   | n≥100 per group   | 100k+ events             | Pass    |
| Consistent activity | Steady or growing | +18% over 3mo            | Pass    |
| Team can influence  | Yes               | Yes (product/onboarding) | Pass    |
| Revenue correlation | >30% higher MRR   | Pending (need to run)    | Pending |

**Verdict:** Proceed with NS-1 as primary North Star candidate

### NS-2: CRM Connected - BLOCKED

| Criterion                | Target   | Actual               | Status  |
| ------------------------ | -------- | -------------------- | ------- |
| Can measure by workspace | Required | No (missing context) | Blocked |
| Volume                   | n≥100    | 230k events          | Pass    |

**Verdict:** Cannot fully validate until instrumentation fix (EPD-1329 expansion)

### NS-3: Automated Actions - MERGED WITH NS-1

Given that workflow runs are the primary automated action, NS-3 is effectively captured in NS-1.

---

## Aha Moment Validation Status

### AHA-REVOPS: Workflow Success - PROMISING

| Criterion             | Target         | Actual       | Status  |
| --------------------- | -------------- | ------------ | ------- |
| Event exists          | Required       | Yes          | Pass    |
| Workspace context     | Required       | Yes          | Pass    |
| Volume                | n≥30 per group | 106k+ events | Pass    |
| Retention correlation | >150% lift     | Pending      | Pending |

**Next Step:** Create cohort of users with 3+ successful runs of same workflow within 14 days and compare retention

### AHA-REP: Briefings - UNCLEAR

| Criterion             | Target   | Actual  | Status              |
| --------------------- | -------- | ------- | ------------------- |
| Briefing event exists | Required | Unclear | Needs investigation |

**Note:** Need to identify which event represents "briefing delivered"

### AHA-CSM / AHA-MANAGER - BLOCKED

| Criterion              | Status                   |
| ---------------------- | ------------------------ |
| Persona identification | Not tracked consistently |
| Dashboard view event   | Does not exist           |

---

## Recommended Actions

### Immediate (Today)

1. **Confirm NS-1 as working North Star hypothesis**
2. **Create North Star dashboard** with workflow activity metrics
3. **Set up weekly tracking** of "Workspaces with 3+ workflow runs"

### This Week

1. **Run retention correlation** - Compare D30/D60/D90 retention for workflow-active vs inactive workspaces
2. **Run revenue correlation** - Join workflow data with Stripe MRR
3. **Identify briefing event** - Determine what event represents rep briefing delivery

### Next Week

1. **Create Value Ladder cohorts** in PostHog
2. **Configure alerts** for North Star drops
3. **File instrumentation tickets** for missing workspace context on agent events

---

## Appendix: Raw Query Results

### Workflow DAU Pattern (Sample Days)

| Day              | DAU   |
| ---------------- | ----- |
| Monday Jan 20    | 1,950 |
| Tuesday Jan 21   | 1,917 |
| Wednesday Jan 22 | 1,614 |
| Thursday Jan 23  | 1,506 |
| Saturday Jan 18  | 169   |
| Sunday Jan 19    | 235   |

**Pattern:** Clear B2B usage pattern with 5-10x higher weekday vs weekend activity.

### Workflow Active Workspaces (Top 25)

25 workspaces show consistent weekly activity (1 session per week for all 14 weeks measured). This indicates sticky, recurring workflow usage.

---

## Next Validation Queries to Run

1. **Retention by workflow activity:**

```
Compare D30/D60/D90 retention:
- Cohort A: Workspaces with 3+ workflow runs in first 30 days
- Cohort B: Workspaces with <3 workflow runs
```

2. **Revenue correlation:**

```
Join workflow activity with Stripe MRR:
- Calculate avg MRR for workflow-active vs inactive workspaces
- Test correlation coefficient
```

3. **Aha moment validation:**

```
For users with same workflow succeeding 3+ times in 14 days:
- Compare D60 retention vs users without
- Calculate lift and significance
```

---

_This document will be updated as additional validation queries are run._
