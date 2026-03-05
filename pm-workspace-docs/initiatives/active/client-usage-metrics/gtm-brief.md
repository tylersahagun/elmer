# Client Usage Metrics - GTM Brief

> Last updated: 2026-02-08
> Owner: Tyler Sahagun

---

## Customer Story

### The Before

Parker Alexander, an Expansion CSM at AskElephant, manages 30+ client workspaces. Every morning, he checks Slack and HubSpot for any signals that a client might be struggling. But there's no proactive system — he finds out about adoption problems when a client emails asking to cancel, or when a renewal conversation reveals they stopped using the product months ago.

Last month, Cobalt churned. The churn analysis revealed they had 12 licensed seats but only 5 users ever logged in. Ryan's team "hadn't been able to use it at all." Parker didn't know until it was too late.

### Moment of Discovery

Parker opens AskElephant's admin panel and sees a new "Client Health" section. Without any setup, he sees all his clients ranked by health score. Three are in red. He clicks into Cobalt's detail view and immediately sees: 42% invite acceptance, usage dropped 60% in 14 days, Workflows and Chat features never activated.

### First Time Setup

Nothing to configure. The dashboard is already populated from existing PostHog telemetry. Parker can filter to "My Clients" and sort by health score. The only optional setup is alert thresholds for Slack notifications.

### Daily Value

Every morning, Parker spends 2 minutes scanning the dashboard. He catches Hive Strategy trending downward (6 of 9 users dropped off this week), reaches out to Dustin, and discovers they need help setting up the positioning coach workflow. Crisis averted.

At renewal time, Parker pulls up SchoolAI's detail view: 72% seat utilization, 3 features actively used, 28 of 35 users engaged. He walks into the conversation with data: "Your team has captured 1,200 meetings and triggered 450 workflows this quarter."

### How We Know It's Working

- Parker checks the dashboard daily (tracked in PostHog)
- He makes 3x more proactive outreach calls per week
- Two at-risk clients that would have silently churned are now back on track
- Renewal conversations close faster because ROI is quantified

---

## Launch Materials Checklist

| Material                                          | Owner          | Status |
| ------------------------------------------------- | -------------- | ------ |
| CS team walkthrough (15-min demo at team meeting) | Tyler          | ⬜     |
| Threshold configuration guide                     | Tyler          | ⬜     |
| Slack alert channel setup                         | Tyler + DevOps | ⬜     |
| Internal help center article                      | Tyler          | ⬜     |
| Changelog entry                                   | Tyler          | ⬜     |
| #product-updates Slack post                       | Tyler          | ⬜     |
| CS team feedback survey (30-day check-in)         | Tyler          | ⬜     |

## Launch Readiness

| Criterion               | Ready? | Notes                                         |
| ----------------------- | ------ | --------------------------------------------- |
| Core feature working    | ⬜     | Dashboard loads with accurate per-client data |
| Error states handled    | ⬜     | Loading, empty, error, no-data states         |
| Alert system tested     | ⬜     | Slack integration working end-to-end          |
| CS team briefed         | ⬜     | Walkthrough delivered, FAQ prepared           |
| Data accuracy validated | ⬜     | Spot-check 5 clients with CS team             |
| Metrics instrumented    | ⬜     | Dashboard usage tracked in PostHog            |

## Rollout Plan

| Phase | Timeline | Scope                   | Success Criteria                                          |
| ----- | -------- | ----------------------- | --------------------------------------------------------- |
| Alpha | Week 1-2 | Tyler + 1 CSM (Parker)  | Dashboard loads, data is accurate, feedback collected     |
| Beta  | Week 3-4 | Full CS team (7 people) | Daily usage by 3+ CSMs, at least 1 proactive intervention |
| GA    | Week 5+  | CS + Sales Leaders      | Adopted as daily routine, alert system active             |

---

_Owner: Tyler Sahagun_
_Collaborate with: Ben Harrison (CS), Rob Henderson (Revenue)_
