# Client Usage Metrics - Design Brief

> Last updated: 2026-02-08
> Owner: Tyler Sahagun

---

## Design Goal

Create a **trusted, glanceable health dashboard** for CSMs and Sales Leaders that makes client adoption status immediately actionable — without requiring deep analytics expertise or extra configuration.

## Design Principles (Initiative-Specific)

1. **Glanceable over exploratory.** CSMs check this during morning coffee, not during deep-dive sessions. Surface the answer, not the data.
2. **Actionable over informational.** Every metric should have a "so what" — what should the CSM do based on this number?
3. **Trustworthy over comprehensive.** Better to show 5 accurate metrics than 20 questionable ones. Show data freshness. Mark confidence.
4. **Progressive disclosure.** Client list → Client detail → Metric deep-dive. Don't overwhelm on first view.

## Layout & Information Architecture

### View 1: Client Health Overview (Primary View)

**Purpose:** "Which clients need my attention right now?"

```
┌─────────────────────────────────────────────────────┐
│  Client Health Dashboard                     🔔 Alerts │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Summary Bar                                      │  │
│  │  🟢 42 Healthy  🟡 8 At Risk  🔴 3 Critical     │  │
│  │  Total seats: 1,247  Active: 534 (42.8%)         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Filter: [My Clients ▼] [All Statuses ▼] [Search...] │
│                                                         │
│  ┌────────────────────────────────────────────────────┐│
│  │ Status │ Client     │ Health │ Seats │ Active │ Trend ││
│  │────────│────────────│────────│───────│────────│───────││
│  │ 🔴     │ Cobalt     │ 23/100 │ 12/40 │ 8%    │ ↓↓   ││
│  │ 🔴     │ B2B Catlst │ 31/100 │ 3/9   │ 12%   │ ↓    ││
│  │ 🔴     │ Eddy       │ 35/100 │ 5/13  │ 15%   │ ↓    ││
│  │ 🟡     │ Hive Strat │ 55/100 │ 6/9   │ 45%   │ →    ││
│  │ 🟢     │ SchoolAI   │ 88/100 │ 28/35 │ 72%   │ ↑    ││
│  │ 🟢     │ Leland     │ 91/100 │ 8/9   │ 85%   │ ↑    ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  Showing 6 of 53 clients  |  Data as of 2h ago         │
└─────────────────────────────────────────────────────────┘
```

**Key decisions:**

- Sort by health score ascending (worst first) — CSMs need to see problems, not wins
- Health score is a composite: seat utilization (40%), WAU trend (30%), feature breadth (20%), invite acceptance (10%)
- Trend arrow shows 7-day direction of change
- "My Clients" filter defaults to CSM's assigned workspaces

### View 2: Client Detail (Drill-Down)

**Purpose:** "What's going on with this specific client? What do I say when I call them?"

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Overview                                   │
│                                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │  Cobalt                          Health: 🔴 23    ││
│  │  CSM: Parker Alexander                            ││
│  │  Seats: 12 licensed / 5 active / 7 inactive      ││
│  │  Since: June 2025  |  Last active: 3 weeks ago   ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Activation ──────────────────────────────────────┐│
│  │  Invites: 12 sent / 5 accepted (42%) ████░░░░░  ││
│  │  First week logins: 4/12                          ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Usage Trend (30d) ──────────────────────────────┐│
│  │  [Sparkline chart: DAU over 30 days]              ││
│  │  Average DAU: 2.1  |  Peak: 5  |  Low: 0         ││
│  │  ⚠️ Usage dropped 60% in last 14 days             ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Feature Adoption ───────────────────────────────┐│
│  │  ✅ Meeting capture (active)                      ││
│  │  ✅ CRM sync (active)                             ││
│  │  ⬜ Workflows (never used)                        ││
│  │  ⬜ Chat/Search (never used)                      ││
│  │  ⬜ Scorecards (never used)                       ││
│  └───────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Talking Points ─────────────────────────────────┐│
│  │  💡 "Usage dropped 60% — check if onboarding     ││
│  │     stalled after initial setup"                  ││
│  │  💡 "7 users haven't accepted invites — resend?" ││
│  │  💡 "Workflows and Chat are unused — demo these   ││
│  │     in next check-in"                             ││
│  └───────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Key decisions:**

- "Talking Points" section is the differentiator — not just data, but **what to do with it**
- Feature adoption uses checkmarks (active) vs empty boxes (never used) for clarity
- Usage trend shows sparkline with anomaly highlighting
- Show "last active" prominently — this is the single most important data point for CS

### View 3: Alert Configuration (Settings)

**Purpose:** "When should I be notified about a client's usage?"

Simple threshold settings:

- **Critical alert:** Seat utilization below X% for Y days → Slack notification
- **Warning alert:** Usage trend declining X% week-over-week → Slack notification
- **Delivery:** Choose Slack channel or DM

## Color & Status System

| Status   | Color                           | Threshold          | Visual |
| -------- | ------------------------------- | ------------------ | ------ |
| Healthy  | `emerald-500` / `emerald-50` bg | Health score ≥ 70  | 🟢     |
| At Risk  | `amber-500` / `amber-50` bg     | Health score 40-69 | 🟡     |
| Critical | `destructive` / `red-50` bg     | Health score < 40  | 🔴     |
| Unknown  | `muted-foreground`              | No data available  | ⬜     |

## Typography Hierarchy

Following design system (`system.md`):

- **Page title:** `text-2xl font-semibold tracking-tight` (h3)
- **Client name in list:** `text-sm font-medium`
- **Metric values:** `text-xl font-semibold` (prominent)
- **Metric labels:** `text-xs text-muted-foreground`
- **Talking points:** `text-sm` with `💡` icon, `blue-50` background

## Component Patterns

- **Health score badge:** Similar to existing Badge component with color variant based on score
- **Client list:** Table with sortable columns (use existing Table primitive)
- **Sparkline:** Minimal line chart (consider recharts or lightweight SVG)
- **Feature adoption:** Checklist pattern with status icons
- **Talking points:** Card component with `bg-blue-50 border-blue-200` styling

## Responsive Behavior

- **Desktop (primary):** Full table layout with all columns visible
- **Tablet:** Collapse "Trend" column; keep Status, Client, Health, Active
- **Mobile:** Stack cards vertically; each client is a card showing Status + Name + Health

## Interaction Patterns

1. **Sort:** Click column header to sort (default: health ascending)
2. **Filter:** Dropdown for status, CSM assignment, segment
3. **Search:** Type-ahead search on client name
4. **Drill-down:** Click row → navigate to client detail view
5. **Alert action:** From alert notification → deep link to client detail

## Trust & Transparency Indicators

- **Data freshness:** "Data as of 2h ago" in footer
- **Confidence:** If data is incomplete, show "Limited data" badge on client row
- **Methodology:** "How is health score calculated?" link to explanation

## States

### Loading

- Skeleton loader for table rows (shimmer effect)
- "Loading client metrics..." text

### Empty (No Clients)

- Friendly illustration
- "No clients assigned to you yet. Contact your CS lead."

### Error

- Retry button with "Unable to load usage data. Try again."
- Show last successful data with staleness warning

### No Data for Client

- "Usage data not yet available for this workspace"
- Possible reasons: new client, instrumentation gap, privacy settings

---

## Accessibility

- Health score colors always accompanied by text/icon (not color-only)
- Table is keyboard-navigable
- Trend arrows have aria-labels ("usage trending down")
- Minimum 4.5:1 contrast ratio on all text

---

_Owner: Tyler Sahagun_
_Collaborate with: Skylar Sanford, Adam Shumway_
_Last updated: 2026-02-08_
