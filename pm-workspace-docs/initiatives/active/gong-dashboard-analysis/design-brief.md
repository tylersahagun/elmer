# Dashboard Design Brief

> **Last updated:** 2026-03-01
> **Owner:** Tyler Sahagun
> **Audience:** Design team (Skylar, Adam), Engineering, stakeholder review

---

## Design Challenge

Create a dashboard experience that serves three personas (rep, manager, admin) with a single, cohesive design system. The dashboard must feel native to AskElephant while being immediately recognizable as an "analytics" surface. It should be data-rich without being overwhelming, and it should tell a story — not just show numbers.

---

## Creative Directions (3 Options)

### Option A: Data-Dense Performance Hub

**Inspiration:** Gong Team Insights, HubSpot reporting
**Mood:** Professional, metric-forward, dense
**Layout:** Full-width tables and charts. Left sidebar for navigation. Grid of metric cards across the top. Detailed tables below.

**Strengths:**
- Familiar to users coming from Gong or HubSpot
- Maximum data density per screen
- Easy comparison across reps/teams

**Weaknesses:**
- Can feel overwhelming on first visit
- Less visually distinctive from competitors
- Harder to tell a "story" with raw data

**Best for:** Users who want maximum information density. RevOps power users.

---

### Option B: Bento Intelligence Grid (Recommended)

**Inspiration:** Apple product pages, Linear dashboards, AskElephant "By The Numbers" vision
**Mood:** Clean, modern, insight-forward, trustworthy
**Layout:** Bento-grid with varied card sizes (1x1, 2x1, 2x2). Hero metrics in large cards at top. Detailed cards below. Generous whitespace.

**Strengths:**
- Distinctive AskElephant design language
- Visual hierarchy guides attention to what matters
- Cards can contain different content types (number, chart, insight, list)
- Responsive grid adapts naturally to screen sizes
- Aligns with existing "By The Numbers" bento vision

**Weaknesses:**
- Lower data density than table-based layouts
- Requires more design effort per card type
- Less familiar to users expecting traditional dashboard UX

**Best for:** Most users. Creates a distinctive, modern experience that differentiates from Gong's denser UI.

---

### Option C: Narrative Dashboard

**Inspiration:** Morning Brew, Robinhood portfolio view, Chief of Staff daily brief
**Mood:** Conversational, story-driven, approachable
**Layout:** Single-column scrollable feed. Narrative text with inline metrics. "This week, your team had 47 meetings. Sarah led with 12 calls and a 42% talk ratio..."

**Strengths:**
- Most approachable for analytics-averse users
- Tells a story, not just shows numbers
- Aligns with "Chief of Staff" narrative vision

**Weaknesses:**
- Harder to compare specific metrics
- Less useful for power users who want data density
- Doesn't match the "dashboard" expectation from Gong evaluators

**Best for:** Individual reps who want a quick daily summary. Less suitable for managers doing detailed analysis.

---

## Recommended Direction: Option B (Bento Intelligence Grid)

**Why:** It's the most AskElephant-native design language, creates visual distinction from Gong, supports all three personas through varied card sizes, and aligns with the existing "By The Numbers" bento vision. It also supports progressive disclosure — simple at a glance, detailed on drill-down.

**Hybrid element from Option C:** The "Coaching Tip" and "AI Insights" cards should use a narrative style within the bento grid. This gives the best of both worlds — data density with storytelling.

---

## Visual System

### Grid

- **Desktop:** 12-column grid, 24px gap, 32px page margin
- **Tablet:** 8-column grid, 16px gap, 24px margin
- **Mobile:** 4-column grid, 12px gap, 16px margin

### Card Sizes

| Size | Columns | Use For |
|------|---------|---------|
| **1x1** | 3 cols | Single metric with trend (talk ratio, meeting count) |
| **2x1** | 6 cols | Metric with chart (talk ratio over time, activity bar) |
| **3x1** | 9 cols | Wide chart (team comparison bars, pipeline funnel) |
| **4x1** | 12 cols | Full-width table or leaderboard |
| **2x2** | 6 cols, 2 rows | Hero card (automation impact, coaching insight) |
| **4x2** | 12 cols, 2 rows | Hero section (org-wide KPI overview) |

### Color System

| Color | Use | Code |
|-------|-----|------|
| **Primary Blue** | Primary actions, links, selected states | `#2563EB` |
| **Green** | Positive trends, healthy indicators, "on track" | `#10B981` |
| **Amber** | Warning states, declining trends, "needs attention" | `#F59E0B` |
| **Red** | Critical alerts, negative trends, "at risk" | `#EF4444` |
| **Purple** | AskElephant automation / agent activity | `#8B5CF6` |
| **Slate** | Text, borders, neutral backgrounds | `#475569` / `#F1F5F9` |

**Key decision:** Purple is reserved exclusively for "AskElephant did this" indicators. This creates a consistent visual language where purple = automation outcome. Users learn that purple widgets represent AI/agent contributions.

### Typography

- **Hero numbers:** 48px / bold / slate-900
- **Card titles:** 14px / semibold / slate-600
- **Card values:** 32px / bold / slate-900
- **Trend indicators:** 13px / medium / green/red/amber
- **Body text:** 14px / regular / slate-700
- **Captions:** 12px / regular / slate-500

### Iconography

- Use filled icons for current state, outline for interactive
- Trend arrows: ↑ (green), → (amber), ↓ (red)
- Automation icon: ⚡ or robot icon in purple
- Data freshness: Clock icon with "Updated X ago" text

---

## Dashboard Layout Per Role

### User Dashboard — "My Performance"

```
┌─────────────────────────────────────────────────────────────┐
│ [🔵 My Performance]  [⚫ Team]  [⚫ Organization]         │
│ Time: [7d ▼]  Compare to: [Team Average ▼]               │
├───────────────┬───────────────┬───────────────┬─────────────┤
│  Talk Ratio   │  Questions    │  Meetings     │  Avg Call   │
│  ●── 46%      │  3.8/call     │  14 this week │  Duration   │
│  ↑ from 52%   │  ↑ from 3.2   │  ↑ from 11    │  32 min     │
│  [1x1]        │  [1x1]        │  [1x1]        │  [1x1]      │
├───────────────┴───────────────┼───────────────┴─────────────┤
│  ⚡ AskElephant Did This      │  🎯 Coaching Tip            │
│  For You This Week            │                             │
│  28 CRM records updated       │  Your question rate drops   │
│  15 action items generated    │  in demo calls. Top         │
│  9 emails processed           │  performers ask 4+          │
│  ~4.2 hrs saved               │  questions in demos.        │
│  [2x2 PURPLE]                 │  [2x2]                      │
├───────────────────────────────┴─────────────────────────────┤
│  📊 Talk Ratio Trend (30 days)                              │
│  [═══════════════════════════ chart ═══════════════]         │
│  [4x1]                                                      │
├─────────────────────────────────────────────────────────────┤
│  🏷️ My Top Topics              │  ✅ Action Items            │
│  Budget (8 calls)             │  Generated: 15              │
│  Timeline (6 calls)           │  Completed: 11 (73%)        │
│  Competitor-Gong (4 calls)    │  Pending: 4                 │
│  [2x1]                        │  [2x1]                      │
└───────────────────────────────┴─────────────────────────────┘
```

### Manager Dashboard — "Team Performance"

```
┌─────────────────────────────────────────────────────────────┐
│ [⚫ My Performance]  [🔵 Team]  [⚫ Organization]          │
│ Time: [30d ▼]  Team: [All Reps ▼]                         │
├───────────────┬───────────────┬───────────────┬─────────────┤
│  Team Calls   │  Avg Talk     │  Deals Active │  ⚡ CRM      │
│  148          │  Ratio: 48%   │  34 (6 risk)  │  Updates    │
│  ↑ from 132   │  → from 49%   │  ↓ from 37    │  287        │
│  [1x1]        │  [1x1]        │  [1x1]        │  [1x1]      │
├─────────────────────────────────────────────────────────────┤
│  👥 Rep Performance Grid                                     │
│  ┌─────────┬──────────┬───────┬──────────┬────────┬───────┐ │
│  │ Rep     │ Calls    │ Talk% │ Q/Call   │ ⚡CRM  │ Trend │ │
│  ├─────────┼──────────┼───────┼──────────┼────────┼───────┤ │
│  │ 🟢 Sarah│ 32       │ 44%   │ 4.1      │ 67     │  ↑    │ │
│  │ 🟢 Alex │ 28       │ 47%   │ 3.8      │ 54     │  ↑    │ │
│  │ 🟡 Mike │ 24       │ 51%   │ 3.2      │ 41     │  →    │ │
│  │ 🔴 Tom  │ 16       │ 63%   │ 2.1      │ 22     │  ↓    │ │
│  └─────────┴──────────┴───────┴──────────┴────────┴───────┘ │
│  [4x2]                                                       │
├───────────────────────────────┬─────────────────────────────┤
│  🎯 Coaching Queue            │  📊 Talk Ratio Distribution  │
│                               │                             │
│  🔴 Tom — Talk ratio 63%,    │  [bar chart comparing       │
│  declining 4 weeks. Longest  │   all reps with 43-57%      │
│  monologue avg 5.2 min.     │   optimal zone highlighted]  │
│  → Schedule coaching session │                             │
│                               │                             │
│  🟡 Mike — Question rate     │                             │
│  below team avg. 3.2 vs 3.7 │                             │
│  → Review discovery calls    │                             │
│  [2x2]                        │  [2x2]                      │
├───────────────────────────────┴─────────────────────────────┤
│  🏷️ Team Themes This Month                                   │
│  #1 "Budget constraints" (23 calls) ↑                       │
│  #2 "Integration timeline" (19 calls) →                     │
│  #3 "Competitor: Gong" (14 calls) ↑↑                        │
│  #4 "Onboarding concerns" (11 calls) ↓                      │
│  [4x1]                                                       │
└─────────────────────────────────────────────────────────────┘
```

### Admin Dashboard — "Organization Intelligence"

```
┌─────────────────────────────────────────────────────────────┐
│ [⚫ My Performance]  [⚫ Team]  [🔵 Organization]          │
│ Time: [90d ▼]  Scope: [All Teams ▼]                       │
├─────────────────────────────────────────────────────────────┤
│  ⚡ AskElephant Organization Impact (90 days)               │
│  ┌──────────────┬──────────────┬────────────┬─────────────┐ │
│  │  Meetings    │  Workflows   │  CRM       │  Time       │ │
│  │  Captured    │  Executed    │  Records   │  Saved      │ │
│  │  1,247       │  3,891       │  8,472     │  ~312 hrs   │ │
│  │  ↑ 18%       │  ↑ 24%       │  ↑ 31%     │  ↑ 27%      │ │
│  └──────────────┴──────────────┴────────────┴─────────────┘ │
│  [4x2 HERO BENTO — PURPLE ACCENT]                           │
├───────────────────────────────┬─────────────────────────────┤
│  📊 Team Comparison           │  🏆 Competitive Intelligence │
│                               │                             │
│  Sales Team A:                │  Gong: 23% of deals (↑8%)  │
│   148 calls | 48% talk | 287 │  Chorus: 11% of deals (→)  │
│  Sales Team B:                │  Fathom: 8% of deals (↓3%) │
│   92 calls | 51% talk | 184  │  Clari: 5% of deals (→)    │
│  CS Team:                     │                             │
│   67 calls | 39% talk | 143  │  Win rate vs Gong: 34%      │
│  [2x2]                        │  [2x2]                      │
├───────────────────────────────┬─────────────────────────────┤
│  📈 CRM Data Quality          │  👤 Platform Adoption        │
│                               │                             │
│  Field fill rate:             │  Total seats: 45            │
│  Before AskElephant: 41%     │  Active (7d): 31 (69%)      │
│  After AskElephant: 78%      │  Invited, not active: 8     │
│  ↑ 37 percentage points      │  Not invited: 6             │
│                               │                             │
│  Properties updated/month:    │  Feature adoption:          │
│  2,847 (↑ 24% vs last month) │  Recaps: 89% | CRM: 67%   │
│  [2x1]                        │  [2x1]                      │
├───────────────────────────────┴─────────────────────────────┤
│  ⚡ Automation Health                                        │
│  Workflow success rate: 96.3% | Avg execution: 2.4s        │
│  Failures this month: 12 (down from 18)                     │
│  Most used: CRM Update (1,247) | Recap (892) | Email (421) │
│  [4x1]                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Trust & Transparency Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Data freshness** | Every dashboard section shows "Updated X ago" in header. If data is > 6 hours old, show amber warning. |
| **Confidence indicators** | Metrics derived from small sample sizes show "Based on X calls" caveat. |
| **Attribution language** | Purple ⚡ cards use "AskElephant did this" / "AskElephant influenced" / "AskElephant observed" — never overclaim. |
| **Methodology transparency** | Click any metric to see definition. "Talk ratio = your speaking time / total call duration." |
| **Trend context** | Trend arrows always show "vs. previous period" context. Never just ↑ without context. |
| **Empty states** | "Record your first meeting to see performance data" — not blank or error. Encouraging, not punishing. |

---

## Interaction Patterns

| Interaction | Behavior |
|-------------|----------|
| **Click metric card** | Expand to show trend chart, comparison, and breakdown |
| **Click rep name (manager view)** | Navigate to that rep's individual dashboard view |
| **Click deal (pipeline view)** | Navigate to deal detail with meeting timeline |
| **Time range change** | Reload all widgets with new time range. Maintain scroll position. |
| **Role tab switch** | Switch entire dashboard view. Maintain time range selection. |
| **Hover on chart** | Tooltip with exact values and date |

---

## Responsive Behavior

| Breakpoint | Layout | Card Behavior |
|-----------|--------|---------------|
| **Desktop (1280px+)** | 12-column grid, sidebar nav | All cards at designed sizes |
| **Tablet (768-1279px)** | 8-column grid, top nav | 2x2 cards become 4x1 (full-width, half-height) |
| **Mobile (< 768px)** | 4-column grid, bottom nav | All cards stack vertically, full-width |

---

_Last updated: 2026-03-01_
_Owner: Tyler Sahagun_
