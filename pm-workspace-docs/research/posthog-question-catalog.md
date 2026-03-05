# PostHog Question Catalog

**Source:** Sachin Ranchod TAM Session (January 23, 2026)  
**Purpose:** Questions to answer with PostHog, organized by business priority

> "Start with the questions, see if you can find matching insights that might exist for those questions." - Sachin

---

## How to Use This Document

For each question:
1. Run `/posthog question "[question text]"` to check if insight exists
2. If not, check if events exist to answer it
3. If events missing, add to instrumentation backlog

---

## Priority 1: Time to Value

### Core Questions

| # | Question | Why It Matters |
|---|----------|----------------|
| 1 | **At what point do users stop trialing and become active users?** | Defines activation threshold |
| 2 | **How many days does it take for a user to reach first value?** | Time to value metric |
| 3 | **What's the median time between signup and first meeting processed?** | Basic activation speed |
| 4 | **What's the median time between signup and first workflow run?** | Deep activation speed |
| 5 | **What actions correlate with users who convert to paid?** | Activation predictors |

### Value Ladder Questions

| # | Question | Value Level |
|---|----------|-------------|
| 6 | **What % of users have had a meeting transcribed in the last 7 days?** | Basic |
| 7 | **What % of users receive automated briefings?** | Basic |
| 8 | **What % of users have connected their CRM?** | Intermediate |
| 9 | **What % of companies have at least one workflow running?** | Deep |
| 10 | **How many CRM updates happened successfully this week by company?** | Deep |

---

## Priority 2: Persona-Based Usage

> "For these different groups, functional areas, like, how are they using the product?" - Sam

### Persona Breakdown Questions

| # | Question | Persona |
|---|----------|---------|
| 11 | **How do IC sales reps use the product vs sales managers?** | Sales |
| 12 | **Which pages do RevOps users visit most?** | RevOps |
| 13 | **What features do CSMs use most vs AEs?** | CS vs Sales |
| 14 | **Which user role has the highest retention?** | All |
| 15 | **Which persona creates the most workflows?** | All |

### Feature by Persona Questions

| # | Question | Feature Area |
|---|----------|--------------|
| 16 | **How many CSMs use the search feature weekly?** | Search |
| 17 | **What % of managers view team meeting summaries?** | Team insights |
| 18 | **Which persona uses the customer page most?** | Customer 360 |
| 19 | **Do RevOps users build more workflows than IC reps?** | Workflows |

---

## Priority 3: Feature Prioritization

> "Should we focus on improving the search page? Should it be on the customer's page? Should it be in the workflows page?" - Sam

### Usage Questions

| # | Question | Feature |
|---|----------|---------|
| 20 | **How many users use search per week?** | Search |
| 21 | **What's the search-to-result click-through rate?** | Search quality |
| 22 | **How many times is the customer page viewed per user per week?** | Customer 360 |
| 23 | **How many workflows are created vs. actually active?** | Workflows |
| 24 | **What % of meetings have someone view the transcript?** | Meeting engagement |

### Feature Adoption Funnels

| # | Question | Funnel Stage |
|---|----------|--------------|
| 25 | **What % of users who see workflows page create a workflow?** | Discovery → Creation |
| 26 | **What % of created workflows get activated?** | Creation → Activation |
| 27 | **What % of activated workflows run successfully in 7 days?** | Activation → Value |
| 28 | **Where do users drop off in the workflow creation funnel?** | Funnel analysis |

---

## Priority 4: Workflow Value Attribution

> "How to measure value from automated workflows when the user doesn't interact?" - Tyler

### Automation Health Questions

| # | Question | Signal Type |
|---|----------|-------------|
| 29 | **How many workflows ran successfully this week by company?** | Value delivered |
| 30 | **What's the failure rate for workflow runs?** | Reliability |
| 31 | **How many automated chats were generated but never viewed?** | Engagement |
| 32 | **Which workflow types have the highest success rate?** | Workflow quality |
| 33 | **How many CRM fields were updated via automation per company?** | CRM value |

### Value Signals vs Warning Signals

| # | Question | Interpretation |
|---|----------|----------------|
| 34 | **What % of automated chat outputs get a user response?** | Engagement signal |
| 35 | **How many workflows were created then never triggered?** | Abandoned setup |
| 36 | **Which companies have workflows running but zero manual chat usage?** | Automation reliance (could be good or bad) |

---

## Priority 5: Activation & Onboarding

> "What does activation look like? Getting meeting notes vs inviting other people in, asking questions, setting up a workflow?" - Sachin

### Funnel Questions

| # | Question | Funnel |
|---|----------|--------|
| 37 | **What % of signups complete onboarding?** | Signup funnel |
| 38 | **What's the drop-off rate at each onboarding step?** | Onboarding funnel |
| 39 | **How many users connect their calendar within 24 hours of signup?** | Calendar funnel |
| 40 | **What % of users invite a teammate within first week?** | Viral coefficient |

### Activation State Questions

| # | Question | Level |
|---|----------|-------|
| 41 | **How many users are "basic activated" (meeting processed)?** | Light |
| 42 | **How many users are "intermediate activated" (CRM connected)?** | Medium |
| 43 | **How many users are "fully activated" (workflow running)?** | Deep |
| 44 | **What's the conversion rate between activation levels?** | Progression |

---

## Priority 6: Company-Level Analysis

> "With groups, it lets you actually say, I wanna understand what this unique group did. So I wanna understand activation by company." - Sachin

### Company Aggregation Questions

| # | Question | Uses Groups |
|---|----------|-------------|
| 45 | **How many unique companies signed up this week?** | ✅ |
| 46 | **How many unique companies had a successful workflow run?** | ✅ |
| 47 | **Which companies have declining usage week-over-week?** | ✅ |
| 48 | **What % of companies have more than one active user?** | ✅ |
| 49 | **How many companies enabled the HubSpot agent this month?** | ✅ |

### Cohort vs Groups Decision

| Question Type | Use Cohort | Use Group |
|---------------|------------|-----------|
| "Users who did X" | ✅ | |
| "Unique companies that did X" | | ✅ |
| "Filter by user attribute" | ✅ | |
| "Aggregate by organization" | | ✅ |

---

## Priority 7: Retention & Churn Signals

### Retention Questions

| # | Question | Signal |
|---|----------|--------|
| 50 | **What's the weekly active user retention rate?** | Core retention |
| 51 | **Which feature has the best 7-day retention?** | Feature stickiness |
| 52 | **Do users who create workflows have better retention?** | Activation correlation |
| 53 | **What's the DAU/MAU ratio?** | Product stickiness |

### At-Risk Signals

| # | Question | Warning Sign |
|---|----------|--------------|
| 54 | **Which users haven't logged in for 7+ days?** | Churn risk |
| 55 | **Which companies had usage drop >50% this week?** | Company churn risk |
| 56 | **How many users started onboarding but never finished?** | Abandoned signup |
| 57 | **Which users had workflow failures but never fixed them?** | Frustration signal |

---

## Question Template for PostHog AI

When using PostHog AI or the `/posthog question` command:

```
Good: "How many unique companies enabled the HubSpot agent in the last 30 days?"
Bad: "Companies with HubSpot"

Good: "What's the conversion rate from workflow:created to workflow:run_completed?"
Bad: "Workflow funnel"

Good: "Show weekly active users broken down by user role over the last 8 weeks"
Bad: "WAU by role"
```

**Tips:**
- Be specific about time range
- Specify unique users vs unique companies
- Ask for breakdowns explicitly
- Use event names if you know them

---

## Instrumentation Gaps Identified

Questions that likely **cannot be answered** with current instrumentation:

| Question | Missing Event/Property |
|----------|------------------------|
| "How do IC sales vs managers use the product?" | `user_role` not consistently on events |
| "What % of users view automated chat outputs?" | `chat:automated_output:viewed` not tracked |
| "What's the search-to-result click-through rate?" | `search:performed` not tracked |
| "Which meetings have transcript engagement?" | `meeting:transcript:viewed` not tracked |
| "Time spent reading transcripts?" | Session replay needed |

---

## Next Steps

1. **Run first 10 questions** through `/posthog question` to baseline
2. **Identify missing events** from instrumentation gaps
3. **Create dashboards** for each priority area
4. **Set up cohorts** for key user segments (power users, at-risk, persona types)
5. **Configure alerts** for churn signals (#54-57)

---

## Related Resources

- [PostHog Best Practices](posthog-best-practices-sachin.md) - Cohorts vs Groups, question-first approach
- [PostHog Event Catalog](posthog-event-catalog.md) - Current event definitions
- [PostHog Audit](../audits/posthog-audit-2026-01-23.md) - Current state analysis

---

*Generated from Sachin Ranchod TAM conversation - January 23, 2026*
