# Client Usage Metrics - PRD

> Last updated: 2026-02-08
> Owner: Tyler Sahagun

## Overview

Build an internal-facing Client Usage Metrics dashboard that gives CSMs and Sales Leaders per-workspace visibility into AskElephant adoption health — including active users, feature adoption, workflow execution, and engagement trends — enabling proactive intervention before silent churn and data-driven expansion conversations.

## Problem Statement

AskElephant currently has **no per-client usage visibility**. Platform-wide metrics exist in PostHog, but CSMs cannot see which specific clients are at risk. This creates:

- **Silent churn:** 7-month engagement gaps go unnoticed (Joyned Dental, B2B Catalyst patterns)
- **Reactive CS:** Teams only learn about disengagement when clients announce cancellation
- **Weak ROI narratives:** Cannot quantify "your team saved X hours" per client at renewal
- **Missed expansion:** No data signal for when a client is ready to grow

**Evidence:** 5+ churn analyses cite "Usage Data Blind Spot" as a root cause. Sam Ho's PostHog analysis shows 77% of seats are NOT_INVITED with only 15.5% DAU utilization — but we can't see this per client.

> "I don't have anything inside of AskElephant that helps me aggregate that information, figure out what somebody's average is over the last week, over the last month." — Cam Thunell, Business Bricks

## Target Personas

- [x] Sales Leader — ROI conversations, expansion identification
- [x] CSM — Daily adoption monitoring, proactive outreach
- [ ] Sales Representative
- [ ] RevOps (future: automated health scoring)

## Success Metrics

See `METRICS.md` for full tracking plan.

| Metric                                    | Current | Target           | Timeline |
| ----------------------------------------- | ------- | ---------------- | -------- |
| Proactive CS outreach to at-risk clients  | ~0%     | 80% within 48h   | 90 days  |
| CS dashboard daily usage                  | 0 views | 5+ views/day/CSM | 30 days  |
| Time to detect usage drop                 | Months  | < 14 days        | 60 days  |
| Expansion conversations citing usage data | ~0      | 50% of renewals  | 90 days  |

## User Stories

### Epic: Client Health Dashboard

**As a** CSM,
**I want to** see a ranked list of my clients sorted by usage health,
**So that** I can prioritize outreach to clients at risk of churning.

#### Acceptance Criteria

- [ ] Dashboard shows all active workspaces with key metrics
- [ ] Clients are sortable by health score, last active, seat utilization
- [ ] Red/yellow/green health indicators based on configurable thresholds
- [ ] Click-through to per-client detail view

### Epic: Per-Client Usage Detail

**As a** CSM,
**I want to** drill into a specific client's usage metrics,
**So that** I can understand their adoption pattern and prepare for conversations.

#### Acceptance Criteria

- [ ] Shows: DAU/WAU trend, invite acceptance rate, features used, workflows triggered
- [ ] Time range selector (7d, 30d, 90d)
- [ ] Comparison to platform average ("this client is below average on X")
- [ ] Export/share capability for internal use

### Epic: Risk Alerts

**As a** CS team lead,
**I want to** receive automated alerts when a client's usage drops below threshold,
**So that** my team can intervene before the client churns.

#### Acceptance Criteria

- [ ] Configurable threshold (e.g., <50% seat utilization for 14+ days)
- [ ] Alert delivery via Slack notification to CS channel
- [ ] Alert includes: client name, metric that triggered, trend direction, CSM assigned

### Epic: ROI Cards

**As a** Sales Leader,
**I want to** generate a usage summary for a client's renewal conversation,
**So that** I can demonstrate concrete value and justify expansion.

#### Acceptance Criteria

- [ ] One-click generation of "Client Value Report" for a workspace
- [ ] Includes: meetings captured, workflows run, time saved estimate, adoption growth
- [ ] Shareable format (PDF or link)

## End-to-End Experience Design (REQUIRED)

### 1. Discovery — How does the customer know this exists?

**Internal users (CSMs/Sales Leaders):** Announced via #team-cx and #team-sales Slack channels. Added as a navigation item in AskElephant admin panel. Brief 15-minute walkthrough in CS team meeting.

**Client-facing (V3 future):** In-app "Your Usage" section accessible from workspace settings.

### 2. Activation — How do they enable/configure without hand-holding?

**Zero configuration required.** Dashboard populates automatically from existing PostHog telemetry. CSMs simply navigate to the dashboard and see their assigned clients. No setup, no toggles, no onboarding flow needed.

**One-time setup for alerts:** CS lead configures alert thresholds via settings panel (default thresholds provided).

### 3. Usage — What does the first interaction look like?

CSM opens the dashboard during their morning routine:

1. Sees ranked list of clients by health score
2. Notices two clients in "red" status (low utilization)
3. Clicks into client detail — sees usage dropped 40% in the last 2 weeks
4. Sees which features stopped being used
5. Opens Slack/HubSpot to schedule a check-in call with context on what to discuss

### 4. Ongoing Value — What value do they get on day 2, week 2, month 2?

- **Day 2:** CSM has already intervened with one at-risk client; feels more in control
- **Week 2:** Pattern recognition — CSM starts to see which onboarding approaches lead to better adoption
- **Month 2:** Renewal conversations are data-driven; CS lead can show leadership: "We prevented X churns this month by catching usage drops early"
- **Quarter 2:** Health scoring data feeds into automated HubSpot workflows for expansion targeting

### 5. Feedback Loop — How do we know if this is working for them?

- **In-app:** Track dashboard view frequency, filter usage, and alert action rates in PostHog
- **Qualitative:** Monthly 1:1 with 2 CSMs: "Is this changing how you manage your book?"
- **Business outcome:** Compare churn rate and NRR for clients where CS intervened via dashboard vs. not
- **Signal:** If CSMs stop using the dashboard within 30 days, investigate and iterate

## Scope

### In Scope (V1)

- Per-workspace usage metrics dashboard (internal-facing)
- Key metrics: DAU/WAU, seat utilization, invite acceptance, feature adoption, workflow execution count
- Health score calculation (configurable thresholds)
- Sortable/filterable client list view
- Per-client detail drill-down with time-series trends
- Slack alert integration for usage drops

### Out of Scope (V1)

- Client-facing usage portal (V3)
- ROI card generation (V2)
- HubSpot property sync for health scores (V2)
- Individual user-level activity tracking (privacy decision)
- Predictive churn modeling / ML (future)
- Revenue attribution from usage data

### Future Considerations

- Client-facing "Your Usage" page with ROI narrative
- Automated expansion playbook triggers
- Integration with HubSpot for health score as CRM property
- Predictive churn model using usage patterns as features

## Design

### User Flow

1. **Entry point:** Admin navigation → "Client Health" (or similar)
2. **Client list:** Ranked by health score, filterable by CSM, status, segment
3. **Client detail:** Click into workspace → time-series charts, feature breakdown, recommendations
4. **Alert config:** Settings panel for threshold configuration
5. **Success state:** CSM identifies at-risk client, has context for outreach conversation

### Wireframes/Mockups

See design brief: `design-brief.md`

### Prototype

See: `prototype-notes.md` (after prototyping phase)

## Technical Considerations

- **Data source:** PostHog events, aggregated per workspace_id
- **Existing instrumentation:** ASK-4934 (HubSpot CRM agent analytics), ASK-4721 (Global Chat metrics), ASK-4595 (Otel GraphQL metrics)
- **API pattern:** PostHog Trends API with breakdown by workspace_id property
- **Performance:** Pre-aggregate daily rollups; don't query raw events in real-time for dashboard
- **Caching:** 1-hour cache for dashboard data; daily refresh for health scores

## Dependencies

- **PostHog instrumentation completeness:** Need workspace_id on all key events (check with Dylan)
- **HubSpot workspace mapping:** Need reliable workspace_id → HubSpot company mapping (check with James/Engineering)
- **CS team onboarding:** Brief walkthrough needed to ensure adoption
- **Threshold calibration:** Need 2-4 weeks of baseline data to set meaningful health score thresholds

## Risks & Mitigations

| Risk                                      | Impact | Likelihood | Mitigation                                                   |
| ----------------------------------------- | ------ | ---------- | ------------------------------------------------------------ |
| PostHog events missing workspace_id       | High   | Medium     | Audit top events with Dylan; backfill if needed              |
| Dashboard data inaccuracy erodes CS trust | High   | Medium     | Show confidence indicators; mark data freshness              |
| CS doesn't adopt (tool fatigue)           | Medium | Medium     | Integrate into existing workflow (Slack alerts, not new app) |
| Scope creep toward full Gainsight         | High   | High       | Strict V1 scope; Tyler enforces boundary                     |
| Privacy concerns from leadership          | Medium | Low        | Aggregate at workspace level only; no individual tracking    |

## Timeline

### Milestones

| Milestone               | Date       | Status |
| ----------------------- | ---------- | ------ |
| PRD Complete            | 2026-02-08 | ✅     |
| Design Brief Complete   | 2026-02-08 | ✅     |
| Prototype Review        | 2026-02-08 | ✅     |
| Jury Validation         | 2026-02-08 | ⬜     |
| Engineering Handoff     | TBD        | ⬜     |
| Development Start       | TBD        | ⬜     |
| Beta (internal CS only) | TBD        | ⬜     |
| GA (full CS + Sales)    | TBD        | ⬜     |

## Launch Materials Needed

- [ ] CS team training (15-min walkthrough at team meeting)
- [ ] Threshold configuration guide
- [ ] Slack channel notification setup
- [ ] Help center article for internal users
- [ ] Changelog entry
- [ ] Slack #product-updates post

## Open Questions

- [ ] What PostHog events currently include workspace_id? (Dylan)
- [ ] What's the right health score formula? (Need baseline data)
- [ ] Should this live in AskElephant admin or a separate internal tool? (Skylar/Bryan)
- [ ] HubSpot sync priority vs. standalone dashboard? (James)

---

_Last updated: 2026-02-08_
_Owner: Tyler Sahagun_
