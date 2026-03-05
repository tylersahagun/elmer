# AskElephant By The Numbers - Prototype Spec (Bento Value Page)

> Last updated: 2026-02-11  
> Owner: Tyler Sahagun  
> Initiative: `client-usage-metrics`

---

## Purpose

Define the implementation-ready prototype package for a bento-style, QBR-friendly "AskElephant by the numbers" view that makes background automation visible, trustworthy, and outcome-oriented.

This spec includes:

- Component map
- Storybook story matrix
- Required AI states and trust states
- Data contract integration plan
- Suggested file scaffold for implementation

---

## Prototype Goal

Give CS, sales leaders, and users a single place to answer:

- What has AskElephant done for this workspace/team/me?
- What value came from HubSpot, Slack, email, meetings, and chat?
- What business outcomes can we credibly show?
- What insight should we act on next?

The prototype should optimize for "glance in 30 seconds, drill in 3 minutes."

---

## Creative Directions (Required Exploration)

## Option A - Control First

- Emphasis: filters + definitions before counters
- Best for: skeptical users, RevOps
- Tradeoff: lower "wow" factor

## Option B - Balanced (Recommended default)

- Emphasis: hero counters + visible trust cues + easy drill-down
- Best for: most CSM and sales use cases
- Tradeoff: moderate implementation effort

## Option C - Impact Wallboard

- Emphasis: large live counters, animated timeline, minimal controls
- Best for: executive demos and QBR presentation mode
- Tradeoff: highest trust risk if data quality is uneven

---

## Component Map

## Page Shell

1. `ByNumbersPageHeader`
   - title, scope picker, time range, freshness badge, confidence legend
2. `ByNumbersFilterBar`
   - scope/team/user, agent, tool, action type
3. `ByNumbersLayout`
   - responsive bento grid for hero + detail panels

## Bento Sections

4. `HeroValueBento`
   - total workflows run
   - deals closed with AskElephant
   - close percentage increase
   - churn percentage reduced
   - total revenue generated/influenced
5. `SystemActivityBento`
   - meetings attended
   - hours of video recorded
   - words transcribed
   - summaries generated
   - chats generated
   - total questions asked
6. `HubSpotImpactBento`
   - deals/companies/contacts created
   - properties filled out (by object)
7. `CommunicationImpactBento`
   - Slack read/sent/updated
   - email read/sent/analyzed
8. `InsightsBento`
   - most common question
   - most common objection
   - most common customer quote
   - coaching gained summary
9. `BentoMetricCard`
   - label, value, delta, confidence, freshness, tooltip

## Live Context and Drill-Down

10. `LiveActivityTimeline`
    - latest events with type badges
11. `TimelineEventRow`
    - timestamp, actor type, action summary, entity link
12. `MetricDrilldownPanel`
    - selected metric definition + trend chart + source attribution + event feed

## Trust and Transparency

13. `DataFreshnessBadge`
14. `ConfidenceBadge`
15. `AttributionBadge`
15. `MetricDefinitionSheet`
16. `LimitedDataCallout`

---

## Storybook Matrix

Title base:

- `Prototypes/ClientUsageMetrics/v2/ByNumbers`

## Core Visual Stories

1. `Default_Balanced_Bento`
2. `OptionA_ControlFirst_Bento`
3. `OptionC_Wallboard_Bento`
4. `Filtered_Workspace`
5. `Filtered_Team`
6. `Filtered_Me`
7. `QBR_Presentation_Mode`

## Required State Stories

8. `State_Loading_Short`
9. `State_Loading_Long`
10. `State_Success`
11. `State_Error`
12. `State_LowConfidence`
13. `State_Empty`
14. `State_PartialData`
15. `State_AttributionUnavailable`

## Required Flow Stories

16. `Flow_Discovery`
17. `Flow_Activation`
18. `Flow_Day2`
19. `Flow_HappyPath`
20. `Flow_ErrorRecovery`
21. `Flow_RenewalValueNarrative`

## Required Demo Stories

22. `Demo_Clickthrough`
23. `Walkthrough`

---

## Required User Flows

## Discovery Flow

- User enters from internal nav or QBR deep link
- Sees all-time workspace impact immediately
- Understands metric meaning without training

## Activation Flow

- User applies first filter set (team + time range)
- User opens one metric definition sheet
- User drills into one tool impact row

## Day-2 Flow

- User returns to "since last visit" state
- Checks new activity and trend deltas
- Shares one insight in renewal prep

## Error Recovery Flow

- Data source partially unavailable
- UI clearly marks unavailable counters
- User can still trust available counters and continue

---

## Data Contract Integration

Contract file:

- `by-the-numbers-data-contract.v1.json`

Rules:

- Every displayed counter must map to one contract metric id.
- Every metric must include:
  - definition
  - source event(s)
  - scope support (workspace/team/user)
  - confidence level
  - attribution type (`created_by`, `influenced_by`, `observed_by`)
  - freshness target
- Unknown or partial metrics must render `LimitedDataCallout`.

---

## Suggested Code Scaffold (for implementation)

```text
elephant-ai/web/src/components/prototypes/ClientUsageMetrics/
├── index.ts
└── v2/
    ├── ByNumbersDashboard.tsx
    ├── ByNumbersDashboard.stories.tsx
    ├── bento-layout.ts
    ├── bento-sections/
    │   ├── HeroValueBento.tsx
    │   ├── SystemActivityBento.tsx
    │   ├── HubSpotImpactBento.tsx
    │   ├── CommunicationImpactBento.tsx
    │   └── InsightsBento.tsx
    ├── ByNumbersJourney.tsx
    ├── Demo.tsx
    ├── Demo.stories.tsx
    ├── Walkthrough.tsx
    ├── Walkthrough.stories.tsx
    ├── mock-data.ts
    ├── data-contract-adapter.ts
    └── types.ts
```

---

## Acceptance Criteria (Prototype Phase)

- Includes all required stories listed above
- Includes all required flow stories and demo/walkthrough
- Uses trust indicators (freshness, confidence, definitions)
- Uses attribution indicators (created vs influenced vs observed)
- Clearly distinguishes reliable counters vs partial counters
- Demonstrates workspace/team/me drill-down behavior
- Demonstrates bento hierarchy with responsive behavior
- Ready for design + engineering review without ambiguity

---

## Open Questions For Build Kickoff

1. Which metrics are launch-blocked on instrumentation vs attribution?
2. What is the canonical event pair for "question asked" and "question answered"?
3. What refresh cadence should power live mode vs standard mode?
4. Which role permissions can access user-level and account-level drill-down?
5. Which metrics are safe for customer-facing QBR export in V1?

---

_Use this spec with `askelephant-by-numbers-vision.md` as the strategic source and the data contract JSON as the implementation source._
