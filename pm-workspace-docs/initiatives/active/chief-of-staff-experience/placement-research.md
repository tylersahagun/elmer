# Placement Research: Chief of Staff Experience

**Date:** 2026-02-18
**Analyst:** PM Copilot (codebase exploration + pattern matching)
**Codebase:** elephant-ai/apps/web

---

## Codebase Context

### Navigation Structure (Current)

The app uses a collapsible sidebar (`AppSidebar`) with these primary items:

- Search
- My Meetings (`/engagements`)
- Action Items (`/action-items`) — feature flagged
- Customers/Companies/Contacts — feature flagged
- Chats/AskElephant (`/chats`)
- Knowledge Bases — feature flagged, collapsible
- Workflows/Automations — manager-only, feature flagged

### Layout Patterns

| Pattern                  | When Used                | Example                            |
| ------------------------ | ------------------------ | ---------------------------------- |
| `Content` wrapper        | Standard pages           | Settings, search                   |
| `ResizablePanelGroup`    | Multi-panel detail views | Engagement detail, action items    |
| Side panel (collapsible) | Context/transcript       | Engagement transcript panel        |
| Tabs (`ChatsTabs`)       | Multiple content views   | Engagement overview/chat tabs      |
| Card-based list          | Scannable items          | Engagement list, action items list |

### Routing Convention

All routes: `/workspaces/:workspaceId/[feature]`
Route helpers in `routes.ts` with type-safe builders.

---

## Placement Decisions by Sub-Initiative

### 1. Meeting Summary — Extend Engagement Detail

| Decision             | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| **Integration Type** | Embedded (new tab in existing page)                   |
| **Location**         | `components/engagements/meeting-summary/`             |
| **Navigation Entry** | No new nav item — accessed via engagement detail      |
| **Parent Context**   | Engagement detail page (`/engagements/:engagementId`) |
| **Frequency of Use** | Daily (after every meeting)                           |

**Rationale:** Meeting Summary extends the existing engagement detail page as a new tab or enhanced section within `ChatsTabs`. The "Overview" tab already shows post-meeting content. The summary artifact should either replace or sit alongside the current overview as the primary post-meeting view. This follows the established pattern where engagement-specific content lives within the engagement detail page.

**Implementation:**

- New component: `components/engagements/meeting-summary/MeetingSummary.tsx`
- New tab in `ChatsTabs` (or enhanced Overview tab)
- Template picker dropdown within the summary view
- Section-level AI edit inline (follow existing chat/AI element patterns)

**Similar Feature in Codebase:** The `ChatsTabs` component already shows different content per tab. Adding a "Summary" tab follows this exact pattern.

---

### 2. Meeting Prep — Enhance Pre-Meeting Panel

| Decision             | Value                                                   |
| -------------------- | ------------------------------------------------------- |
| **Integration Type** | Enhanced embedded section + expandable panel            |
| **Location**         | `components/engagements/meeting-prep/`                  |
| **Navigation Entry** | No new nav item — triggered by upcoming meeting context |
| **Parent Context**   | Engagement detail page (pre-meeting state)              |
| **Frequency of Use** | Daily (before scheduled meetings)                       |

**Rationale:** The codebase already has `engagement-company-prep.tsx` which shows pre-meeting prep as a panel for upcoming meetings. Meeting Prep enhances this existing pattern rather than creating a new page. The prep packet should be the default view when opening an upcoming engagement, with the option to expand into a full-panel view.

**Implementation:**

- Enhance `components/engagements/engagement-company-prep.tsx`
- New component: `components/engagements/meeting-prep/MeetingPrep.tsx`
- Persona-aware content blocks (detect viewer role)
- "What changed since last" section using prior meeting data
- Time-windowed delivery (show prominent badge 60min before meeting)
- Integration with Daily Brief (cross-link upcoming preps)

**Similar Feature in Codebase:** `EngagementCompanyPrep` component is the direct ancestor. Enhance, don't replace.

**Alternative Considered:** Dedicated `/meeting-prep` page — rejected because prep is contextual to specific meetings, not a standalone destination.

---

### 3. Daily Brief — New Dedicated Page

| Decision             | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| **Integration Type** | New page                                              |
| **Location**         | `components/briefs/daily-brief/`                      |
| **Route**            | `/workspaces/:workspaceId/daily-brief`                |
| **Navigation Entry** | Primary sidebar item (between Search and My Meetings) |
| **Frequency of Use** | Daily (morning + evening)                             |

**Rationale:** Daily Brief is a new primary destination — a cross-signal operating readout that doesn't fit within any existing page. It deserves its own route and primary sidebar placement because it's the "start your day" entry point. No existing page serves this function (the default currently redirects to `/engagements`). Daily Brief could become the new default landing page.

**Implementation:**

- New route: `routes/workspaces/$workspaceId/daily-brief/index.tsx`
- New components: `components/briefs/daily-brief/`
  - `DailyBrief.tsx` — Main container
  - `DailyBriefHeader.tsx` — Date, morning/evening mode, historical navigation
  - `DailyBriefSection.tsx` — Reusable section card (actions, meetings, risks)
  - `ActionCard.tsx` — Individual action item within brief
  - `MeetingPrepCard.tsx` — Upcoming meeting with prep link
- Navigation: Add to `NavMain` items with Calendar icon
- Consider making this the default route (redirect from `/` to `/daily-brief`)

**Layout Pattern:** Newspaper-style with sections:

1. Action queue (Done / Needs Approval / Scheduled)
2. Today's meetings with prep links
3. Risks and alerts
4. CRM activity digest

**Similar Feature in Codebase:** Action Items page layout pattern (card-based list with detail panel) — but Daily Brief is more dashboard-like with sections rather than list-detail.

---

### 4. Weekly Brief — New Dedicated Page (Sibling to Daily)

| Decision             | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| **Integration Type** | New page                                                               |
| **Location**         | `components/briefs/weekly-brief/`                                      |
| **Route**            | `/workspaces/:workspaceId/weekly-brief`                                |
| **Navigation Entry** | Primary sidebar item (grouped with Daily Brief under "Briefs" section) |
| **Frequency of Use** | Weekly (Monday morning, Friday afternoon)                              |

**Rationale:** Weekly Brief is a sibling to Daily Brief — same architectural pattern but different time horizon and content density. It should live under a shared "Briefs" navigation group. The weekly rollup with trends and carry-forward needs its own page because it's too dense for a tab or panel.

**Implementation:**

- New route: `routes/workspaces/$workspaceId/weekly-brief/index.tsx`
- New components: `components/briefs/weekly-brief/`
  - `WeeklyBrief.tsx` — Main container
  - `WeeklyTrends.tsx` — Trend deltas with sparklines
  - `CarryForwardQueue.tsx` — Items from last week that weren't completed
  - `DecisionSection.tsx` — "Decide this week" block
  - `ActionHandoff.tsx` — Assign/schedule from brief
- Navigation: Add to sidebar under "Briefs" collapsible group (with Daily Brief)
- Historical weekly navigation (past weeks accessible)

**Layout Pattern:** Report-style with narrative sections:

1. This Week vs Last Week (trend deltas)
2. Carry-Forward Queue (unresolved from last week)
3. Decision Section (commit/defer/drop)
4. Action Handoff (assign for next week)
5. Pipeline/forecast snapshot

**Navigation Grouping:**

```
Briefs (collapsible)
  ├── Daily Brief
  └── Weekly Brief
```

**Similar Feature in Codebase:** No direct analog. Closest pattern is the engagement detail page (sections of content with headers), but Weekly Brief is more report-oriented.

---

### 5. Action Items — Enhance Existing Page

| Decision             | Value                                              |
| -------------------- | -------------------------------------------------- |
| **Integration Type** | Enhance existing page                              |
| **Location**         | `components/action-items/` (existing)              |
| **Route**            | `/workspaces/:workspaceId/action-items` (existing) |
| **Navigation Entry** | Already in sidebar                                 |
| **Frequency of Use** | Daily (throughout the day)                         |

**Rationale:** Action Items already has a dedicated page with a three-panel layout (list sidebar, overview center, transcript right). The Chief of Staff enhancements add governance controls (approve/edit/snooze/schedule), confidence indicators, evidence links, and cross-signal deduplication. This is an enhancement of existing infrastructure, not a new placement decision.

**Implementation:**

- Enhance existing components in `components/action-items/`
- Add: Confidence badge on each action card
- Add: Source evidence expandable section
- Add: Approve/edit/snooze/schedule action buttons
- Add: Priority ordering with urgency indicators
- Add: Calendar-aware scheduling integration
- Add: Cross-link to Daily Brief action section

**Similar Feature in Codebase:** The existing Action Items page already has the correct pattern. This is pure enhancement.

---

## Cross-Initiative Integration Map

```
                    ┌─────────────────┐
                    │   Daily Brief   │ ← New page (primary nav)
                    │  /daily-brief   │
                    └───────┬─────────┘
                            │ links to
                    ┌───────┼─────────┐
                    │       │         │
            ┌───────▼──┐  ┌▼────────┐ ┌▼──────────────┐
            │  Meeting  │  │ Action  │ │  Meeting Prep  │
            │  Summary  │  │ Items   │ │  (upcoming)    │
            │ (in-page) │  │ (page)  │ │  (in-page)     │
            └───────────┘  └─────────┘ └────────────────┘
                    │                          │
                    │       recap feeds         │
                    └──────────────────────────┘

            ┌─────────────────┐
            │  Weekly Brief   │ ← New page (primary nav)
            │ /weekly-brief   │
            │ aggregates daily│
            └─────────────────┘
```

---

## Navigation Recommendation (Updated Sidebar)

```
Search
─────────────
Daily Brief ← NEW (primary destination)
My Meetings
Action Items
─────────────
Briefs
  └── Weekly Brief ← NEW
─────────────
Chats / AskElephant
Customers
Knowledge Bases
Workflows
```

**Rationale:** Daily Brief should be prominently placed — potentially as the first item after Search — because it represents the "start your day" entry point. Weekly Brief is less frequent, so it sits in a collapsible "Briefs" section or secondary nav position.

---

_Last updated: 2026-02-18_
_Source: Codebase exploration of elephant-ai/apps/web_
