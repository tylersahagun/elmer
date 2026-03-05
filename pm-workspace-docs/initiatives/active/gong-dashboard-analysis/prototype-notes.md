# Dashboard Prototype Notes

> **Last updated:** 2026-03-01
> **Owner:** Tyler Sahagun
> **Prototype file:** `prototypes/dashboard-prototype.html`

---

## How to View

Open the prototype file in any browser:
```
pm-workspace-docs/initiatives/active/gong-dashboard-analysis/prototypes/dashboard-prototype.html
```

Click the role tabs at the top to switch between the three views:
- **👤 My Performance** — Individual user (rep/CSM) dashboard
- **👥 Team Performance** — Manager coaching dashboard
- **🏢 Organization** — Admin/owner intelligence dashboard

Use the time range pills to simulate filter changes. Team filter appears on manager/admin views.

---

## Prototype Architecture

**Single HTML file** with embedded CSS and JavaScript. No dependencies. Realistic sample data. Interactive role switching. Responsive layout.

### Design System

- **Color system:** Blue (primary), Green (positive), Amber (caution), Red (critical), **Purple (AskElephant automation)** — purple is exclusively reserved for agent/automation indicators
- **Grid:** 12-column bento grid with card sizes from 3-col to 12-col
- **Cards:** White background, 16px border-radius, subtle border, hover shadow
- **Typography:** System font stack, hero numbers at 36-42px, labels at 12px uppercase

### Key Design Decisions

1. **Purple = AskElephant** — Consistent visual language where purple cards/badges always represent what AskElephant's agents did. This creates instant recognition: "purple means the AI did this."

2. **Bento Intelligence Grid** — Recommended creative direction (Option B from design brief). Varied card sizes create visual hierarchy. Hero metrics in large cards, detail in smaller cards.

3. **Overwatch Model** — Pre-built, opinionated layouts per role. No blank canvas. No configuration required. Works immediately with realistic defaults.

4. **Coaching Insights** — AI-generated coaching tips appear as styled cards within the dashboard, not as separate notifications. This integrates coaching into the daily workflow.

---

## View Breakdown

### 👤 My Performance (User View)

**Target persona:** Sales rep, CSM, SDR
**Default time range:** 7 days

**Sections:**
1. **Performance metrics row** (4 cards)
   - Talk Ratio with donut visualization + trend
   - Questions per Call with sparkline trend
   - Meetings This Week with external/internal split
   - Avg Call Duration with comparison to team

2. **AskElephant Impact + Coaching (2x2 cards)**
   - Purple "AskElephant Did This For You" card showing CRM updates, action items, emails, Slack messages processed, plus time-saved estimate
   - Coaching Insights card with AI-generated tips on question rate patterns, improvement recognition, and team comparison

3. **Topics + Action Items**
   - Top topics from calls this period
   - Action item generation/completion with progress bar

**Sample data rationale:**
- 14 meetings/week is realistic for an active rep
- 46% talk ratio shows improvement toward optimal 43-50% zone
- 3.8 questions/call is slightly above average — room for growth
- 28 CRM records updated shows meaningful automation impact
- 4.2 hours saved is conservative (~18 min per CRM update)

---

### 👥 Team Performance (Manager View)

**Target persona:** Sales manager, CS team lead, VP Sales
**Default time range:** 30 days

**Sections:**
1. **Team summary row** (4 cards)
   - Total team calls with trend
   - Average team talk ratio with status
   - Active deals with risk count
   - Team CRM updates (purple) showing automation impact

2. **Rep Performance Table** (full-width)
   - Status indicator (green/amber/red)
   - Per-rep metrics: calls, talk ratio, questions/call, CRM updates (purple badge), avg monologue, trend direction
   - Sortable columns (conceptual — not implemented in prototype)

3. **Coaching Queue + Team Themes**
   - AI-generated coaching recommendations prioritized by urgency (red → amber → green)
   - Each recommendation includes specific data and actionable suggestions
   - Team themes showing most common topics across all calls with trend direction
   - Automation adoption progress bars showing which features each team uses

**Sample data rationale:**
- 6 reps is a realistic team size
- Performance spread from Sarah (top) to Tom (needs coaching) creates a realistic distribution
- Coaching queue shows the value: manager immediately knows who needs attention and what to discuss
- Team themes like "Budget constraints ↑↑" reflect real market conditions

---

### 🏢 Organization (Admin View)

**Target persona:** Workspace owner, RevOps admin, CRO
**Default time range:** 90 days

**Sections:**
1. **Hero Bento** (full-width gradient card)
   - 4 hero metrics: Meetings Captured, Workflows Executed, CRM Records Updated, Time Saved
   - Gradient purple/blue background signals this is the "AskElephant impact" section
   - All metrics show period-over-period improvement trends

2. **Team Comparison + Competitive Intelligence**
   - Team table with per-team metrics and health indicators
   - Competitive intelligence showing competitor mention frequency with bar chart
   - Win rate when competitor is mentioned (critical strategic data)

3. **CRM Data Quality + Platform Adoption**
   - Before/after comparison of CRM field fill rates (41% → 78% = +37pts)
   - Per-object breakdown (deals, contacts, companies)
   - Seat utilization (active/inactive/not-invited)
   - Feature adoption rates across workflows

4. **Automation Health** (full-width purple card)
   - Success rate, execution time, failure count, total executions
   - Most-used workflow types
   - All trending positively to show system reliability

**Sample data rationale:**
- 1,247 meetings in 90 days = ~14 meetings/day across a 45-person workspace (realistic)
- 3,891 workflows = ~3 per meeting average (CRM update + recap + one other)
- 8,472 CRM records = ~2.2 per workflow (deals + contacts + properties)
- 312 hours saved = ~4.8 min per workflow (conservative)
- 78% field fill rate vs 41% baseline shows dramatic improvement — the key ROI metric

---

## Connection to Existing Initiatives

| Dashboard Element | Related Initiative | Data Source |
|---|---|---|
| Talk ratio / question rate | New — needs conversation analytics pipeline | Audio analysis + transcript NLP |
| Meeting count / activity | Chief of Staff Experience | Meeting records (existing) |
| CRM records updated | Agent Command Center | Workflow execution logs (existing) |
| Time saved estimate | Client Usage Metrics / By The Numbers | Calculated from action counts |
| Action items | Chief of Staff Experience | Action item tracking (existing) |
| Topic/theme tracking | Universal Signal Tables | Topic extraction (partially existing) |
| Competitive mentions | New — needs extraction pipeline | Transcript NLP (new) |
| Platform adoption | Client Usage Metrics | PostHog (existing) |
| CRM data quality | Structured HubSpot Agent Node | HubSpot audit (partially existing) |
| Coaching insights | New | AI analysis of trends (new) |

**Key insight:** ~60-70% of the data needed for V1 dashboards already exists. The primary engineering work is:
1. **Aggregation layer** — Pre-compute per-user, per-team, per-workspace rollups
2. **Conversation analytics** — Extract talk ratio and question rate from existing audio/transcripts
3. **Presentation layer** — React components for the dashboard UI
4. **Competitive/topic extraction** — NLP pipeline for automatic detection from transcripts

---

## What This Prototype Validates

1. **Three distinct views serve three distinct needs** — The prototype shows that a single dashboard framework can serve reps, managers, and admins with different but complementary views.

2. **Purple = automation is a strong visual language** — The consistent purple treatment for AskElephant actions creates instant recognition and differentiates from Gong's metrics-only approach.

3. **Coaching queue is high-value** — The manager view's coaching queue with AI suggestions is likely the most impactful widget. It immediately shows the "what should I do" answer.

4. **CRM data quality is our strongest ROI proof** — The before/after comparison (41% → 78% field fill rate) is a compelling, tangible metric that justifies the platform.

5. **Automation health creates trust** — Showing 96.3% success rate and declining failure count builds confidence in the platform.

---

## Feedback Questions for Stakeholders

1. **For Sam (VP Product):** Does this dashboard direction align with our product strategy? Should dashboards be a standalone initiative or part of Agent Command Center?

2. **For Skylar/Adam (Design):** Does the bento grid approach match our design language? What would you change about the visual hierarchy?

3. **For Ben Kinard (Sales):** Would this manager view help you coach your team? What metrics are missing?

4. **For Rob (Growth):** Would the admin ROI metrics be useful in QBRs and expansion conversations?

5. **For Bryan/Kaden (Engineering):** Is talk ratio extractable from our current audio/transcript pipeline? What's the effort to build the aggregation layer?

---

_Last updated: 2026-03-01_
_Owner: Tyler Sahagun_
