# Client Usage Metrics - Prototype Notes

> Last updated: 2026-02-12
> Version: v10 (Renewal Confidence package)

---

## V10 Package (Ben Feedback Iteration - Renewal Confidence)

This iteration is directly shaped by Ben Harrison's "magical renewal dashboard" feedback:

1. **Usage by department** (Sales vs CS) with utilization + trend
2. **Time saved metrics** at department and user levels
3. **Top and bottom users with role context** for targeted enablement
4. **Executive usage visibility** as a renewal confidence signal
5. **Key feature tracker** showing whether target features are actually adopted
6. **CRM connection status** to verify operational reliability before renewal narratives

Implemented at:

```
elephant-ai/apps/web/src/components/prototypes/ClientUsageMetrics/
└── v10/
    ├── ByNumbersRenewalConfidenceV10.tsx
    ├── ByNumbersRenewalConfidenceV10.stories.tsx
    ├── mock-data.ts
    └── types.ts
```

### V10 Validation Questions

1. Which 3 metrics are non-negotiable for Ben's renewal prep workflow?
2. Is top/bottom-user visibility useful enough to drive concrete enablement actions?
3. Does executive usage materially increase confidence in renewal forecasts?
4. What minimum CRM sync reliability is required for the dashboard to be trusted in negotiations?

---

## Prototype Location

```
elephant-ai/web/src/components/prototypes/ClientUsageMetrics/
├── index.ts                          # Re-exports latest version
└── v1/
    ├── ClientUsageMetrics.tsx         # Main component (Dashboard + Detail View)
    ├── ClientUsageMetrics.stories.tsx  # Storybook stories (9 stories)
    ├── mock-data.ts                   # Mock data based on real client names
    └── types.ts                       # TypeScript type definitions
```

## V4 Package (Agent Impact by Account)

The newest prototype package adds an account-centric "what the agent has done" view for QBR and agency dashboard use cases:

- AI-generated recent call briefs by client
- Sentiment trend visualization and qualitative insight chips
- HubSpot context pane (stage, forecast, synced properties, confidence)
- Agent action log (summary generation, CRM updates, risk alerts)
- External dashboard/API payload preview panel
- v4.1 polish: richer KPI flip animation, presenter mode, fullscreen toggle, and "What changed since last QBR" panel

Implemented at:

```
elephant-ai/apps/web/src/components/prototypes/ClientUsageMetrics/
└── v4/
    ├── AgentImpactV4.tsx
    ├── AgentImpactV4.stories.tsx
    ├── mock-data.ts
    └── types.ts
```

## Skylar Feedback Parse (post-v4)

Raw feedback appeared partially garbled by transcription, but the consistent signal is clear:

1. **Too much contextual narration before proof** -- parts of v4 feel like "extra unnecessary UI tax" instead of direct value.
2. **Value isn't obvious in first glance** -- users should immediately see what changed for the customer/business, not just rich descriptions.
3. **Interesting but misfit for executive check-ins** -- the concept is compelling, but framing needs to be more outcome-first for leadership moments.
4. **Automation confidence needs explicit proof** -- not only "what happened," but why it can be trusted (confidence + provenance + receipts).

Notable transcript noise likely included accidental voice input ("Can you check my phone?"), treated as non-product signal.

## V5 Package (Agent Impact -- Showing Value)

v5 reframes the surface around one job: **prove value fast**.

- Leads with "showing value" headline metrics (time, confidence, CRM quality, renewal influence)
- Uses account-level **value receipts** (outcome + evidence + confidence)
- Keeps unresolved value questions visible so claims remain testable
- Reduces descriptive flourish in favor of measurable before/after framing

Implemented at:

```
elephant-ai/apps/web/src/components/prototypes/ClientUsageMetrics/
└── v5/
    ├── AgentImpactV5.tsx
    ├── AgentImpactV5.stories.tsx
    ├── mock-data.ts
    └── types.ts
```

## Signals Used to Shape v5

1. **Agency dashboard API request (2026-02-11)** -- asks for account-level AI summaries, sentiment trends, and qualitative data payloads.
2. **SchoolAI executive trust signal (v4 data + notes)** -- "strong confidence in automation quality," but requires visible proof for scale.
3. **QBR workflow asks in this initiative** -- recurring need to show "what changed since last review," not just status snapshots.
4. **Cobalt recovery signal** -- early risk detection only matters if it changes renewal outcomes.

## Value Validation Questions (for next review cycle)

1. Which 3 fields are mandatory in API payloads to prove value in <30 seconds?
2. What confidence + provenance display is enough for approval-by-exception behavior?
3. What single before/after view best supports QBR value storytelling?
4. How much earlier must risk detection happen to measurably move retention?

## Planned V2 Package (By The Numbers)

The next prototype package for this initiative is documented in:

- `by-the-numbers-vision.md`
- `by-the-numbers-prototype-spec.md`
- `by-the-numbers-data-contract.v1.json`

This V2 package adds a live "AskElephant by the numbers" mode with rolling counters, agent/tool impact breakdowns, and workspace/team/me drill-down behavior.

### Current implementation status

V2 prototype components and stories are now scaffolded at:

```
elephant-ai/web/src/components/prototypes/ClientUsageMetrics/
└── v2/
    ├── ByNumbersDashboard.tsx
    ├── ByNumbersDashboard.stories.tsx
    ├── ByNumbersJourney.tsx
    ├── Demo.tsx
    ├── Demo.stories.tsx
    ├── Walkthrough.tsx
    ├── Walkthrough.stories.tsx
    ├── mock-data.ts
    └── types.ts
```

## Creative Direction

### Option A: "Max Visibility" (Selected for V1)

Full data-forward dashboard with progressive disclosure:

- **Client Health Overview** — ranked table with health scores, sparklines, trend arrows
- **Client Detail View** — drill-down with activation metrics, usage trend, feature adoption, talking points
- **AI Talking Points** — auto-generated conversation starters based on client data

Design philosophy: CSM checks this during morning coffee (2-minute scan), then drills into at-risk clients for prep.

## Storybook Stories

| Story                 | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `Default`             | Full dashboard with all 8 mock clients                 |
| `CriticalOnly`        | Filtered to critical clients only                      |
| `AllHealthy`          | State when all clients are healthy                     |
| `EmptyState`          | No clients assigned                                    |
| `DetailView_Critical` | Cobalt detail (21 days inactive, 12.5% utilization)    |
| `DetailView_AtRisk`   | Hive Strategy detail (trending down, missing features) |
| `DetailView_Healthy`  | SchoolAI detail (80% utilization, all features active) |
| `Flow_MorningRoutine` | CSM morning check-in flow                              |
| `Flow_RenewalPrep`    | Sales Leader renewal preparation flow                  |

## Mock Data

Based on real client names from churn analyses and closed-won retrospectives:

- **Cobalt** (critical, $22.8K ACV) — from churn analysis
- **B2B Catalyst** (critical, $9.5K ACV) — from churn analysis
- **Eddy** (critical, $15.4K ACV) — from churn analysis
- **Hive Strategy** (at risk, $5.4K ACV) — from closed-won
- **Business Bricks** (at risk, $17.8K ACV) — from customer feedback
- **SchoolAI** (healthy, $41.6K ACV) — from expansion win
- **Leland** (healthy, $3K ACV) — from closed-won
- **Canopy Connect** (healthy, $6.5K ACV) — from closed-won

## Key Components

### Health Score Calculation

Composite of: seat utilization (40%) + WAU trend (30%) + feature breadth (20%) + invite acceptance (10%)

### Sparkline

SVG-based mini line chart showing 30-day DAU trend. Green for upward, red for downward.

### Talking Points Engine

Auto-generates actionable conversation starters from:

- Days since last active (> 14 days = warning)
- Invite acceptance rate (< 50% = warning)
- Unused features (opportunity for deeper adoption)
- Seat utilization (< 50% = downsizing risk)
- Usage trend direction

### States Implemented

- Default (8 clients with mixed health)
- Empty state (no clients)
- All healthy state
- Critical-only filtered state
- Detail view for each health status

## Discovery / Activation / Day-2 Flows

### Discovery Flow (How CS learns this exists)

- Announced in #team-cx Slack channel
- Added to admin navigation
- 15-minute walkthrough at team meeting

### Activation Flow (First use)

- Zero configuration — dashboard auto-populates from PostHog telemetry
- CSM sees their clients immediately upon navigation
- Default sort: worst health first (most actionable)

### Day-2 Flow (Ongoing value)

- Morning routine check (2 min scan)
- Click into flagged clients for conversation prep
- Slack alerts for automated monitoring between visits
- Renewal prep with data-backed ROI cards (V2)

---

## Design Decisions

1. **Sort worst-first by default** — CSMs need problems, not celebrations
2. **Sparkline in table row** — trend is more important than absolute number
3. **Talking points are the differentiator** — not just data, but what to DO
4. **Workspace-level only** — no individual user tracking (privacy decision)
5. **Real client names in mock data** — makes prototype review more visceral

---

_Owner: Tyler Sahagun_
_Version: v1_
_Phase: Build → Validate_
