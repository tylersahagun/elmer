# Metrics Framework Best Practices Research

**Generated:** 2026-01-23  
**Purpose:** Improve the PostHog analytics framework with industry best practices for understanding customers and making data-driven business decisions.

---

## Executive Summary

After extensive research into product analytics best practices, cohort analysis methodologies, and customer understanding frameworks, here are the key improvements for AskElephant's analytics strategy:

1. **Adopt a metric taxonomy** that separates North Star, leading indicators, lagging indicators, and health metrics
2. **Build multi-dimensional cohorts** combining behavioral, temporal, and value-based segmentation
3. **Define an "aha moment"** that predicts retention for each persona
4. **Create a Customer Health Score** using the signal domains framework
5. **Implement expansion signals** to predict upsell opportunities proactively

---

## Part 1: Choosing the RIGHT Metrics

### The Problem with Vanity Metrics

Vanity metrics make teams feel good but don't drive decisions. They have three fundamental problems:

| Issue                  | Example                         | Better Alternative                                          |
| ---------------------- | ------------------------------- | ----------------------------------------------------------- |
| **Lack context**       | "We have 10,000 pageviews"      | "Our signup conversion rate is 3.2%, up from 2.1%"          |
| **Unclear intent**     | "500 users signed up this week" | "245 users activated (completed first workflow)"            |
| **Don't guide action** | "Time on site increased"        | "Users who spend >5min in first session retain 2.3x better" |

### North Star Metric

A North Star Metric captures the value customers derive from your product. It has three defining qualities:

1. **Represents value to users** - not just activity
2. **Within product/marketing's control** - team can influence it
3. **Leading indicator of revenue** - predicts business outcomes

**For AskElephant (proposed):**

| Option              | Metric                                                 | Rationale                                                        |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| **Primary**         | "Workspaces with ≥3 successful workflow runs per week" | Captures automated value delivery, the core "agentic" value prop |
| **Alternative**     | "Weekly Active Workspaces with CRM integration"        | Ties to sticky, differentiated value                             |
| **Revenue-focused** | "Automated actions per paying workspace"               | Directly correlates with pricing model                           |

### Leading vs Lagging Indicators

**Track both, but act on leading:**

| Indicator Type | Definition                                    | AskElephant Examples                                 | Use                       |
| -------------- | --------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| **Leading**    | Predict future outcomes, within daily control | Activation rate, feature adoption, session frequency | Daily/weekly optimization |
| **Lagging**    | Measure past results, validate strategy       | MRR, churn rate, NRR                                 | Monthly strategy review   |
| **Health**     | Vital signs that should stay steady           | Error rate, load time, workflow success rate         | Monitoring & alerting     |

**The Leading → Lagging Chain:**

```
Onboarding completion rate (leading)
    ↓ predicts
Activation rate (leading)
    ↓ predicts
Weekly engagement (leading)
    ↓ predicts
Retention rate (lagging)
    ↓ correlates with
Revenue (lagging)
```

### The AARRR Framework Applied to AskElephant

| Stage           | What to Measure          | AskElephant Events                        | Target                    |
| --------------- | ------------------------ | ----------------------------------------- | ------------------------- |
| **Acquisition** | Users reaching product   | `user:signup`, `trial:started`            | Qualified leads → signups |
| **Activation**  | Users experiencing value | See "Aha Moment" section below            | Day 1-7 activation        |
| **Retention**   | Users returning          | DAU/WAU ratio, unbounded retention        | 40%+ Week 1 retention     |
| **Revenue**     | Users paying             | `subscription:started`, upgrade events    | Trial → Paid conversion   |
| **Referral**    | Users inviting           | `workspace:member_invited`, NPS promoters | >20% of growth organic    |

---

## Part 2: Defining the "Aha Moment"

### What It Is

The "aha moment" is when a user first experiences core product value and realizes they can succeed with it. It's the most predictive activation metric because users who reach it retain dramatically better.

### How to Identify Your Aha Moment

**Step 1: Map backward from retained users**

- Analyze users who retained 90+ days
- Identify behavioral patterns they share that churned users don't
- Use cohort analysis to find correlation

**Step 2: Define three components**

| Component       | Definition            | AskElephant Example                   |
| --------------- | --------------------- | ------------------------------------- |
| **Action**      | The specific behavior | "Workflow run completes successfully" |
| **Frequency**   | How many times        | "≥3 times"                            |
| **Time Period** | When it should happen | "Within first 14 days"                |

### Proposed Aha Moments by Persona

| Persona           | Aha Moment Candidate                        | Hypothesis                       |
| ----------------- | ------------------------------------------- | -------------------------------- |
| **Sales Rep**     | "Received briefing before 3 meetings"       | They see time saved before calls |
| **Sales Manager** | "Viewed team dashboard with ≥5 meetings"    | They see visibility value        |
| **RevOps**        | "1 workflow ran successfully ≥3 times"      | They see automation value        |
| **CSM**           | "Renewal insights surfaced for ≥2 accounts" | They see customer intel value    |

### Validating the Aha Moment

**Method:**

1. Create behavioral cohort of users who hit proposed aha moment
2. Compare 30/60/90-day retention against users who didn't
3. If retention difference is significant (>50% lift), you've found it
4. If not, test other candidate behaviors

**PostHog Implementation:**

```
Cohort: "Reached Aha Moment"
Definition: Did "workflows:run_completed" ≥3 times within 14 days of first "user:signup"
```

---

## Part 3: Multi-Dimensional Cohort Strategy

### Beyond Time-Based Cohorts

Most teams only do acquisition cohorts (grouped by signup date). This misses the richest insights. Use three cohort dimensions:

| Dimension       | What It Groups   | Reveals                               | Example Cohort                          |
| --------------- | ---------------- | ------------------------------------- | --------------------------------------- |
| **Temporal**    | When they joined | Seasonality, growth trajectory        | "Jan 2026 signups"                      |
| **Behavioral**  | What they did    | Feature adoption, engagement patterns | "Users who created ≥3 workflows"        |
| **Value-based** | Business outcome | Revenue, activation tier              | "Deep tier users (automated workflows)" |

### Behavioral Cohort Framework

**The 4 Questions to Answer:**

1. **What action?** - The specific behavior that defines the cohort
2. **How many times?** - Frequency threshold
3. **In what timeframe?** - Relative to signup or absolute
4. **Combined with what?** - AND/OR additional conditions

### Standard Cohort Library

**Risk-Based Cohorts:**

| Cohort                     | Definition                              | Use Case                |
| -------------------------- | --------------------------------------- | ----------------------- |
| Power Users                | `workflows:run_started` ≥10x in 30d     | Champion identification |
| At-Risk (Usage Drop)       | DAU dropped >30% WoW                    | Churn prevention        |
| At-Risk (Engagement Cliff) | No login in 14+ days after being active | Re-engagement           |
| Dormant                    | Last active >30 days ago                | Winback campaigns       |

**Value Ladder Cohorts:**

| Cohort            | Definition                                            | Stage         |
| ----------------- | ----------------------------------------------------- | ------------- |
| Basic Value       | `meeting:processed` in last 7d                        | Meeting notes |
| CRM Connected     | `hubspot_agent:enabled` OR `salesforce_agent:enabled` | Integration   |
| Automation Active | `workflows:run_completed` ≥5 in 30d                   | Workflows     |
| Power Workspace   | 3+ users active AND workflows running                 | Team adoption |

**Persona-Based Cohorts:**

| Cohort                  | Property Criteria                      | Analysis                    |
| ----------------------- | -------------------------------------- | --------------------------- |
| Individual Contributors | `role` = "user"                        | IC workflow patterns        |
| Managers                | `role` = "manager"                     | Leadership dashboards usage |
| Admins/RevOps           | `role` = "owner"                       | Configuration patterns      |
| Mobile-First            | `platform` = "mobile" >50% of sessions | Mobile experience           |

### Cohort Analysis Workflows

**Workflow 1: Retention Diagnosis**

1. Create behavioral cohort (e.g., "completed onboarding")
2. Compare retention curve against "all users"
3. If significant lift → protect/optimize that behavior
4. If no lift → test different cohort definition

**Workflow 2: Feature Adoption Impact**

1. Create cohort of feature adopters (e.g., "used chat feature")
2. Compare conversion funnel against non-adopters
3. If higher conversion → promote feature adoption
4. Segment by adoption timing (early vs late adopters)

**Workflow 3: At-Risk Identification**

1. Define "healthy" engagement baseline
2. Create cohort with >30% drop from baseline
3. Use for churn prediction and proactive outreach
4. Track "save rate" from at-risk back to healthy

---

## Part 4: Customer Health Score

### What It Is

A Customer Health Score consolidates multiple signals into a single predictive score (0-100 or red/yellow/green) to predict churn risk and identify expansion opportunities.

### Signal Domains for AskElephant

| Domain                | Signals                                   | Weight | PostHog Implementation                   |
| --------------------- | ----------------------------------------- | ------ | ---------------------------------------- |
| **Usage & Adoption**  | DAU, feature breadth, seat utilization    | 30%    | Event counts, unique users per workspace |
| **Value Realization** | Workflow success rate, meetings processed | 25%    | Ratio calculations                       |
| **Engagement Trends** | WoW usage change, feature expansion       | 20%    | Trend formulas                           |
| **Product Fit**       | Integrations connected, features enabled  | 15%    | Property counts                          |
| **Technical Health**  | Error rate, latency, bot failures         | 10%    | Error events, latency properties         |

### Scoring Framework

**Sub-Score Calculation (Rule-Based):**

```
Usage Score:
- 100: DAU/MAU >60% (daily users)
- 75: DAU/MAU 40-60%
- 50: DAU/MAU 20-40%
- 25: DAU/MAU 10-20%
- 0: DAU/MAU <10%

Value Score:
- 100: Deep tier + >90% workflow success
- 75: Deep tier OR >95% workflow success
- 50: Intermediate tier + some workflows
- 25: Basic tier only
- 0: No value delivery events

Trend Score:
- 100: >20% WoW growth
- 75: 5-20% WoW growth
- 50: Flat (±5%)
- 25: 5-20% decline
- 0: >20% decline
```

**Composite Score:**

```
Health Score = (Usage × 0.30) + (Value × 0.25) + (Trend × 0.20) + (Fit × 0.15) + (Technical × 0.10)
```

### Time Decay

Weight recent activity more heavily:

- Last 7 days: 50% weight
- Days 8-30: 35% weight
- Days 31-90: 15% weight

### Health Score Thresholds

| Score  | Label        | Action                                    |
| ------ | ------------ | ----------------------------------------- |
| 80-100 | **Healthy**  | Expansion candidate, champion nurturing   |
| 60-79  | **Stable**   | Monitor, optimize engagement              |
| 40-59  | **At-Risk**  | Proactive outreach, success check-in      |
| 0-39   | **Critical** | Urgent intervention, executive escalation |

---

## Part 5: Churn Prediction & Early Warning

### Leading Indicators of Churn

| Signal                 | Threshold                    | Lead Time | Action                     |
| ---------------------- | ---------------------------- | --------- | -------------------------- |
| Login frequency drop   | >50% from baseline           | 2-3 weeks | Automated re-engagement    |
| Feature usage decline  | Core features unused 7+ days | 1-2 weeks | Feature reminder campaign  |
| Session duration crash | <50% of historical average   | 1-2 weeks | UX investigation           |
| Support ticket surge   | >3 tickets in 7 days         | 1 week    | Proactive support outreach |
| NPS detractor          | Score 0-6                    | Immediate | Success team escalation    |
| Onboarding abandonment | Stopped mid-flow             | 2-4 weeks | Onboarding re-engagement   |

### Composite Churn Risk Model

**Risk Score Components:**

```
Churn Risk = (
  Recency Weight × (Days since last active) +
  Frequency Weight × (Inverse of login frequency) +
  Engagement Weight × (Inverse of feature depth) +
  Trend Weight × (Negative usage trend) +
  Support Weight × (Ticket severity score)
)
```

### PostHog Alerts for Churn Prevention

| Alert               | Condition                      | Notify       | Response          |
| ------------------- | ------------------------------ | ------------ | ----------------- |
| Usage Cliff         | DAU drops >40% WoW             | Success team | 24hr outreach     |
| Feature Abandonment | Core feature unused 14+ days   | Product      | In-app nudge      |
| Engagement Plateau  | No new feature adoption in 30d | Growth       | Feature education |
| Workspace Shrink    | Active users dropped >30%      | Success      | Account review    |

---

## Part 6: Expansion & Upsell Signals

### Leading Indicators for Expansion

| Signal                       | What It Means       | PostHog Detection                    |
| ---------------------------- | ------------------- | ------------------------------------ |
| **Hitting usage limits**     | Ready to upgrade    | Event volume >85% of plan limit      |
| **Team growth**              | Need more seats     | `workspace:member_invited` frequency |
| **Feature adoption breadth** | Outgrowing tier     | Using features from higher tier      |
| **Power user emergence**     | Champion developing | Individual usage >3x average         |
| **Integration requests**     | Sticky behavior     | `integration:requested` events       |

### Product-Led Sales Signals

**Expansion Readiness Score:**

| Factor                   | Weight | Measurement                      |
| ------------------------ | ------ | -------------------------------- |
| Usage ceiling proximity  | 25%    | % of plan limit consumed         |
| Multi-user adoption      | 25%    | # of active users / seat limit   |
| Feature upgrade interest | 20%    | Clicks on upgrade prompts        |
| Value realization trend  | 20%    | Workflow success rate increasing |
| Engagement momentum      | 10%    | WoW usage growth                 |

### Actionable Expansion Playbook

**Signal → Action Matrix:**

| Signal Pattern                 | Action                    | Owner   |
| ------------------------------ | ------------------------- | ------- |
| >90% seat utilization          | Seat expansion offer      | Sales   |
| Hitting API limits             | Usage tier conversation   | Success |
| 3+ users hitting plan features | Team upgrade proposal     | Sales   |
| High health score + growth     | Executive business review | Success |

---

## Part 7: Engagement Scoring Model

### Weighted Composite Score

Not all user actions are equally valuable. Weight events by their predictive power for retention and revenue.

**Event Value Weights (Example):**

| Event                               | Points | Rationale                 |
| ----------------------------------- | ------ | ------------------------- |
| `workflows:run_completed` (success) | 100    | Core value delivery       |
| `hubspot_agent:contact_synced`      | 80     | Stickiness behavior       |
| `chat:conversation_created`         | 50     | Engagement indicator      |
| `meeting:processed`                 | 40     | Basic value               |
| `search:query_executed`             | 20     | Active exploration        |
| `settings:updated`                  | 10     | Configuration activity    |
| `login`                             | 5      | Basic access (low signal) |

### Engagement Score Calculation

```
Weekly Engagement Score = Σ(Event × Weight) / Max Possible Score

Where Max Possible Score = Theoretical maximum for power user
```

**Scoring Tiers:**

| Tier       | Score Range | Interpretation              |
| ---------- | ----------- | --------------------------- |
| Power User | 80-100%     | Heavy, value-driven usage   |
| Active     | 50-79%      | Regular, healthy engagement |
| Light      | 20-49%      | Casual usage, opportunity   |
| Dormant    | 0-19%       | At-risk, minimal activity   |

### Power User Identification

**Power User Curve (L30):**

- Track distribution of how many days users are active per month (1-30)
- Healthy product: Right-skewed curve with ~20% using 20+ days
- Power users: Top 10-15% by engagement score

**Key Metric:**

> Power users are 10-20% of users but drive 70-80% of engagement and revenue.

---

## Part 8: Jobs-to-Be-Done (JTBD) Analytics

### Framework Overview

JTBD reframes analytics around what customers are trying to accomplish, not features they use.

### AskElephant Jobs Analysis

| Job                          | Functional                         | Emotional                           | Social                             |
| ---------------------------- | ---------------------------------- | ----------------------------------- | ---------------------------------- |
| **Prep for meetings**        | Have relevant context before calls | Feel confident and prepared         | Appear knowledgeable to prospect   |
| **Follow up after meetings** | Send accurate next steps quickly   | Feel organized and on top of things | Appear responsive and professional |
| **Track deals**              | Know where deals stand             | Feel in control of pipeline         | Look prepared in reviews           |
| **Automate busywork**        | Eliminate manual data entry        | Feel like time is well-spent        | Be seen as efficient               |

### Measuring Job Completion

For each job, define:

1. **Completion event** - What signals the job was done?
2. **Success metric** - How well was it done?
3. **Customer effort** - How hard was it?

**Example: "Prep for meetings"**

| Aspect     | Metric               | PostHog Event                            |
| ---------- | -------------------- | ---------------------------------------- |
| Completion | Briefing viewed      | `briefing:viewed`                        |
| Success    | User found it useful | `briefing:marked_helpful` or viewed >30s |
| Effort     | Time to generate     | Property: `generation_time_ms`           |

---

## Part 9: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Define North Star Metric for AskElephant
- [ ] Identify and validate aha moment for primary persona
- [ ] Create standard cohort library in PostHog
- [ ] Set up event naming conventions audit

### Phase 2: Health Scoring (Week 3-4)

- [ ] Build Customer Health Score v1 (rule-based)
- [ ] Create health-based cohorts (Healthy, At-Risk, Critical)
- [ ] Set up alerts for health score drops
- [ ] Document in `posthog-health-score.md`

### Phase 3: Churn Prevention (Week 5-6)

- [ ] Define churn leading indicators
- [ ] Build churn risk score
- [ ] Create playbook for at-risk interventions
- [ ] Integrate with Success team workflows

### Phase 4: Expansion (Week 7-8)

- [ ] Define expansion signals
- [ ] Build expansion readiness score
- [ ] Create PLS (product-led sales) dashboard
- [ ] Integrate with Sales team workflows

### Phase 5: Optimization (Ongoing)

- [ ] Validate aha moment with retention data
- [ ] Tune health score weights based on outcomes
- [ ] A/B test intervention playbooks
- [ ] Quarterly metrics framework review

---

## Appendix A: PostHog Queries

### Retention by Behavioral Cohort

```
TrendsQuery:
- Event: return_event
- Math: dau
- Filter by cohort: [aha_moment_cohort_id]
- Compare: All users
```

### Health Score Components

```
HogQL:
SELECT
  workspace_id,
  countIf(event = 'login') as login_count,
  countIf(event = 'workflows:run_completed' AND properties.$success = true) as successful_workflows,
  count(DISTINCT toDate(timestamp)) as active_days,
  max(timestamp) as last_active
FROM events
WHERE timestamp > now() - INTERVAL 30 DAY
GROUP BY workspace_id
```

### Churn Risk Indicators

```
TrendsQuery:
- Event: any_event
- Math: dau
- Breakdown: workspace_id
- Compare: This week vs last week
- Filter: Where change < -30%
```

---

## Appendix B: Sources

### Product Analytics Frameworks

- Amplitude Guide to Product Metrics
- PostHog Product Analytics Best Practices
- Mixpanel Product Metrics Guide
- Heap Product Metrics & KPIs

### Cohort Analysis

- Amplitude: Definitive Guide to Behavioral Cohorting
- Stripe: SaaS Cohort Analysis
- PostHog: Retention Documentation

### North Star & Metric Selection

- Amplitude: Good vs Bad North Star Metrics
- Amplitude: Vanity Metrics Guide
- Reforge: Aha Moment Definition

### Customer Health & Churn

- Gainsight: Customer Health Score Explained
- Amplitude: Churn Prediction Analytics
- Wudpecker: Churn Prediction Metrics

### Expansion & Growth

- GrowthCues: Expansion Opportunities from Product Signals
- a16z: Power User Curve Guide
- ProductLed: PLG Metrics Guide

---

## Appendix C: Glossary

| Term                      | Definition                                               |
| ------------------------- | -------------------------------------------------------- |
| **North Star Metric**     | Single metric capturing user value that predicts revenue |
| **Leading Indicator**     | Metric that predicts future outcomes                     |
| **Lagging Indicator**     | Metric measuring past results                            |
| **Behavioral Cohort**     | User group defined by actions taken                      |
| **Aha Moment**            | First experience of product's core value                 |
| **Customer Health Score** | Composite metric predicting retention/expansion          |
| **DAU/MAU**               | Daily Active Users / Monthly Active Users ratio          |
| **Stickiness**            | How often users return (DAU/MAU)                         |
| **NRR**                   | Net Revenue Retention (expansion - churn)                |
| **PLS**                   | Product-Led Sales                                        |
| **JTBD**                  | Jobs-to-Be-Done framework                                |
| **RFM**                   | Recency, Frequency, Monetary value segmentation          |

---

_This research document serves as the foundation for improving the PostHog analytics framework. Use it to update cohort definitions, create health scores, and implement expansion signals._
