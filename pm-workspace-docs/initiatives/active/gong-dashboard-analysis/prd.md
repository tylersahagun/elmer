# AskElephant Dashboards — PRD

> **Last updated:** 2026-03-01
> **Owner:** Tyler Sahagun
> **Phase:** Discovery
> **Strategic Pillar:** Data Knowledge, Trend Visibility

---

## Overview

Build role-based analytics dashboards that make AskElephant's automation, conversation intelligence, and CRM impact visible to users. Three dashboard views serve three personas: individual users (self-coaching + personal automation impact), managers (team coaching + performance comparison), and workspace owners/admins (organization intelligence + automation ROI). Unlike Gong's call-metrics-only dashboards, AskElephant's dashboards answer: **"What did AskElephant actually do for you?"** — combining conversation analytics with automation outcome visibility.

---

## Outcome Chain

```
Dashboards make AskElephant's automation and intelligence visible
  → so that reps can self-coach and see their personal AI impact
    → so that managers can coach with data and track team performance
      → so that admins can prove ROI and optimize automation
        → so that teams trust and adopt AskElephant more deeply
          → so that we stop losing to Gong on visibility
            → so that retention improves and expansion accelerates
```

---

## Problem Statement

### What problem?

AskElephant captures conversations, updates CRM records, runs workflows, processes emails, and analyzes Slack messages — but **none of this is visible in aggregate to users.** The result:

- **Reps can't self-coach** — no talk ratio, question rate, or performance trend data
- **Managers can't coach with data** — no team comparison, no coaching metrics, no pipeline intelligence
- **Admins can't prove ROI** — no aggregate view of what AskElephant did for the workspace
- **Buyers choose Gong** — because Gong makes performance visible and we don't

### Who has this problem?

| Persona | Pain | Frequency |
|---------|------|-----------|
| **Sales Rep / CSM** | Can't see personal performance trends or what AskElephant did for them | Daily |
| **Sales Manager** | Can't compare team performance, identify coaching needs, or track improvement | Daily |
| **Workspace Owner / Admin** | Can't prove platform ROI, see automation health, or present data to leadership | Weekly |
| **RevOps** | Can't build custom analytics or track team-specific KPIs | Weekly |

### Evidence

> "I don't have anything inside of AskElephant that helps me aggregate that information"
> — Cam Thunell, Business Bricks

> "Every sales leader pretends like they're confident, but they are tiny little kids inside crying for real... I don't know what question to ask on how to help my team convert more deals."
> — Woody Klemetson, CEO

> "Gong has new features and access that makes them closer to AskElephant capabilities... if Gong and AskE are essentially the same platform we are going to hedge our bets on the established one"
> — Dental Intel (churned, $1,978 MRR)

> "My team mentioned they've liked having Gong calls show up in the lead record"
> — Mobly (at-risk)

> "What I like the most is how after the call, it will evaluate what needs to happen and create tasks on its own."
> — Customer quote validating automation as our core value prop

**Competitive context:** Gong (6 dashboards + custom builder), Avoma (Activity Dashboard + AI Coaching), Chorus (team analytics), Fireflies (basic analytics) all offer user-facing dashboards. AskElephant offers zero.

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Dashboard daily active users | 0 | 40%+ of active users | 60 days post-launch |
| "Gong parity" evaluation score in deals | Low | Competitive | 90 days |
| Self-coaching engagement (reps viewing own metrics) | 0 | 3+ views/week/rep | 30 days |
| Manager coaching sessions citing dashboard data | 0 | 50%+ of coaching sessions | 60 days |
| Admin ROI presentations using dashboard | 0 | Used in 50%+ of QBRs | 90 days |
| Competitive win rate vs Gong (dashboard-relevant deals) | Unknown | Improve 20%+ | 6 months |

---

## Target Personas & Dashboard Views

### View 1: Individual User Dashboard — "My Performance"

**Primary persona:** Sales Rep, CSM, SDR
**JTBD:** "Help me understand how I'm performing and what AskElephant is doing for me"
**Daily habit:** Rep opens this as part of morning routine alongside the Agent Command Center

#### Metrics & Widgets

**Conversation Performance (match Gong)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Talk Ratio Card | Talk-to-listen % with trend | Donut chart + sparkline | Audio/transcript analysis |
| Questions Asked | Avg questions per call with trend | Number + sparkline | Transcript NLP |
| Longest Monologue | Avg longest monologue in minutes | Number + trend arrow | Audio analysis |
| Meeting Activity | Calls this week/month with trend | Bar chart | Meeting records |
| Avg Call Duration | Average meeting length | Number + comparison to team | Meeting records |

**Automation Impact (AskElephant unique)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| "AskElephant Did This For You" Hero | CRM records updated, emails processed, tasks created — this period | Bento hero card with icons | Workflow execution logs |
| Time Saved Estimate | Estimated hours saved from automation | Number + "equivalent to X hours of manual work" | Calculated from action counts |
| Action Items Generated | AI-generated action items this period | Number + completion rate % | Action item tracking |
| CRM Updates | Deal/contact/company records touched by AskElephant | Number with breakdown by type | HubSpot agent logs |

**Self-Coaching Insights (leapfrog)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Coaching Tip | AI-generated coaching suggestion based on trends | Text card, refreshes weekly | AI analysis of trends |
| Team Comparison | Anonymous comparison to team average on key metrics | Radar chart or bar comparison | Aggregated team data |
| Topic Trends | Top topics from my recent calls | Tag cloud or ranked list | Topic extraction |
| Improvement Tracker | Progress on self-set coaching goals | Progress bars | User-set goals |

---

### View 2: Manager Dashboard — "Team Performance"

**Primary persona:** Sales Manager, CS Team Lead, VP Sales
**JTBD:** "Help me coach my team with data and identify who needs attention"
**Weekly habit:** Manager reviews this before 1:1s and team meetings

#### Metrics & Widgets

**Team Overview (match Gong)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Rep Performance Grid | Card per rep: name, talk ratio, questions, activity, trend arrow | Card grid with color-coded indicators | Aggregated per-rep data |
| Activity Leaderboard | Meeting count, call hours by rep this period | Horizontal bar chart, sortable | Meeting records |
| Talk Ratio Comparison | Talk ratio per rep vs. team average | Bar chart with benchmark line | Audio analysis |
| Question Rate Comparison | Questions per call per rep | Bar chart with benchmark | Transcript NLP |
| Coaching Queue | Reps with declining metrics or below-average performance | Priority list with AI suggestions | Trend analysis |

**Pipeline Intelligence (match + enhance)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Pipeline Health | Deals by stage with risk indicators | Pipeline funnel with color-coded health | HubSpot + conversation signals |
| Stale Deals | Deals without activity in 7/14/30 days | Warning list with last touch date | HubSpot + meeting records |
| Competitive Mentions | Which competitors being mentioned, frequency | Ranked list with trend | Transcript extraction |
| Deal Activity by Rep | Deals touched per rep this period | Table with drill-down | HubSpot + meeting correlation |

**Automation Adoption (AskElephant unique)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Team Automation Health | Which reps have active workflows, which don't | Health grid: green/yellow/red per rep | Workflow configuration status |
| CRM Impact by Rep | CRM records updated by AskElephant per rep | Bar chart comparison | Agent execution logs |
| Workflow Adoption | % of team using key workflows (recap, CRM update, email) | Progress bars per workflow type | Workflow execution logs |

**Coaching & Themes (match + enhance)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Top Team Themes | Most common topics, objections, questions across team calls | Tag cloud or ranked list | Topic extraction, aggregated |
| Scorecard Summary | Average scores by evaluation criteria (if coaching scorecards enabled) | Score cards with trend | Scorecard system |
| AI Coaching Suggestions | AI-generated coaching recommendations per rep | Expandable card list | AI analysis |

---

### View 3: Workspace Owner/Admin Dashboard — "Organization Intelligence"

**Primary persona:** Workspace Owner, RevOps Admin, CRO
**JTBD:** "Help me prove AskElephant's ROI, monitor platform health, and present data to leadership"
**Monthly habit:** Admin reviews before QBRs, board prep, executive reviews

#### Metrics & Widgets

**Organization KPI Hero (AskElephant unique — bento layout)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Total Meetings Captured | All meetings recorded this period | Large number + trend | Meeting records |
| Total Workflows Run | All agent executions this period | Large number + trend | Workflow logs |
| CRM Impact | Records created + properties filled | Large number + breakdown | Agent logs |
| Automation ROI | Estimated time/cost saved | Hero number + methodology | Calculated |
| Deals Influenced | Deals with AskElephant touchpoints | Large number + $ value | HubSpot + attribution |

**Team Comparison (match Gong)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Team-by-Team Cards | Per-team KPIs: meetings, activity, talk ratios, automation usage | Card grid | Aggregated per-team |
| Cross-Team Benchmarks | Key metrics compared across teams | Multi-bar chart | Aggregated |

**Competitive Intelligence (match Gong)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Competitor Mentions Aggregate | Which competitors appear most, win/loss correlation | Ranked table with win rate | Transcript extraction + CRM outcomes |
| Competitive Trend | Competitor mention frequency over time | Line chart | Transcript extraction |
| Objection Tracking | Most common objections across all calls | Ranked list with frequency | Transcript extraction |

**Platform Health (AskElephant unique)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Adoption Metrics | DAU/WAU, invite acceptance, feature usage | Dashboard cards with trends | PostHog |
| Automation Health | Workflow success rate, failure rate, average execution time | Health indicators | Workflow logs |
| CRM Data Quality | Field fill rates before/after AskElephant | Before/after comparison chart | HubSpot audit |
| Seat Utilization | Active vs. invited vs. unused seats | Utilization bar | Platform data |

**Custom KPI Builder (V2)**
| Widget | Metric | Visualization | Source |
|--------|--------|--------------|--------|
| Custom Metric | RevOps-defined KPI from available data | Configurable chart type | User-configured |
| Custom Chart | Drag-and-drop chart builder | Various chart types | User-configured |

---

## Configurability Strategy

### Design Philosophy: Overwatch Model

> "Here's what you need, with a few tweaks" — NOT "Pick every stat"

**Defaults by role:**
- Reps see "My Performance" as default dashboard
- Managers see "Team Performance" as default dashboard
- Admins see "Organization Intelligence" as default dashboard
- Role detection is automatic from workspace settings

**Configurable elements:**
- Time range: 7d / 30d / 90d / custom (global filter)
- Team/rep filter: Select specific teams or reps (manager/admin views)
- Section visibility: Show/hide dashboard sections
- Widget reorder: Drag-and-drop within sections
- Favorites: Pin specific widgets to the top

**Not configurable (V1):**
- Widget creation from scratch (V2 — custom KPI builder)
- Dashboard layout from blank canvas (V2)
- Data source configuration (zero-config from existing data)

### Progressive Disclosure

- **Level 0 (Glance):** Hero cards with key numbers + trend arrows. Scannable in 10 seconds.
- **Level 1 (Review):** Click any card to expand with chart, comparison, and context. 2-3 minutes to review a section.
- **Level 2 (Explore):** Drill into specific reps, deals, or time ranges for deep analysis. 5-10 minutes for detailed coaching review.
- **Level 3 (Build — V2):** Custom KPI builder for RevOps power users.

---

## End-to-End Experience Design

### 1. Discovery — How does the customer know dashboards exist?

**For new users:** During onboarding, after first meeting is processed, a prompt appears: "Your first meeting data is ready. See your performance dashboard →". The dashboard pre-populates with real data from their first recorded call.

**For existing users:** In-app announcement banner: "New: See your team performance and automation impact. View dashboards →". Navigation item added to sidebar. Slack #product-updates announcement. CSM outreach for key accounts.

**For managers:** Dashboard surfaces during team coaching workflow: "See how your team performed this week →" with pre-populated comparison data.

### 2. Activation — How do they configure it?

**Zero configuration required.** Dashboards populate automatically from existing meeting data, CRM integration, and workflow execution logs. No setup, no toggles, no onboarding flow.

**One optional step:** Managers can set coaching goals for their team (e.g., "Target talk ratio: 40-50%"). This enables the "Improvement Tracker" widget. But dashboards work without this.

### 3. Usage — What does the first interaction look like?

**Rep opens "My Performance":**
1. Sees hero card: "12 meetings this week | Talk ratio: 54% | 3.2 questions/call"
2. Sees automation card: "AskElephant updated 28 CRM records and generated 15 action items for you"
3. Sees coaching tip: "Your question rate drops in demo calls. Top performers ask 4+ questions in demos."
4. Feels: "Whoa, I can actually see what's happening and how to improve."

**Manager opens "Team Performance":**
1. Sees rep grid with performance indicators — Sarah is green, Mike is yellow, Tom is red
2. Clicks Tom → sees talk ratio declining over 4 weeks, question rate below average
3. Sees AI suggestion: "Tom's longest monologue increased from 2.1 to 4.7 minutes. Consider coaching on active listening."
4. Feels: "I know exactly who to coach and what to focus on."

**Admin opens "Organization Intelligence":**
1. Sees hero bento: "847 meetings captured | 312 workflows run | 1,247 CRM records updated | ~94 hours saved"
2. Sees competitive intelligence: "Gong mentioned in 23% of competitive deals — up 8% from last month"
3. Sees CRM quality: "Field fill rate improved from 41% to 78% since enabling HubSpot agent"
4. Feels: "I can put this in a QBR deck right now."

### 4. Ongoing Value

**Day 2:** Rep checks talk ratio after every call. Manager uses data in 1:1s.
**Week 2:** Coaching becomes data-driven. Reps set personal improvement goals.
**Month 2:** Admin presents ROI data in QBR. Expansion conversations cite automation impact.
**Quarter 2:** Dashboard engagement is a leading indicator of retention. Teams that use dashboards weekly churn 50%+ less.

### 5. Feedback Loop

| Method | What It Measures | Cadence |
|--------|-----------------|---------|
| Dashboard view frequency | Is it becoming a habit? | Continuous (PostHog) |
| Time on dashboard | Are users engaging deeply? | Weekly |
| Widget click-through rate | Which widgets are most valuable? | Weekly |
| Coaching session correlation | Do managers coach more after viewing? | Monthly |
| Competitive win rate | Are we winning more dashboard-relevant deals? | Quarterly |
| Feature requests | What's missing? | Ongoing |

---

## Scope

### V1 — "Visible Intelligence" (Ship First)

**In Scope:**
- Three pre-built role-based dashboards (User, Manager, Admin)
- Conversation metrics: talk ratio, question rate, activity, meeting count
- Automation impact metrics: CRM records updated, workflows run, time saved
- Team comparison views for managers
- Time range filtering (7d/30d/90d)
- Basic drill-down (click card → expanded view)
- Mobile-responsive design

**Out of Scope (V1):**
- Custom dashboard builder (V2)
- Forecast analytics (V3 — or never, depending on Clari competition)
- Coaching scorecards (V2)
- Pipeline/deal dashboard (V2)
- Competitive intelligence tracking (V2)
- Data export/PDF generation (V2)
- Alert/notification system for metric changes (V2)

### V2 — "Coaching Intelligence"

- Coaching scorecards with AI-automated scoring
- Pipeline/deal view with conversation enrichment
- Competitive intelligence tracking (automatic competitor detection)
- Custom KPI builder for RevOps
- Dashboard sharing and export
- Alert system (metric drops trigger notifications)

### V3 — "Revenue Intelligence"

- Revenue attribution from automation
- Predictive deal scoring
- Cross-team benchmarking
- Customer health scoring (client-facing)
- API for external dashboards (agency request)

---

## Technical Considerations

### Data Sources

| Data | Source | Status | Engineering Effort |
|------|--------|--------|-------------------|
| Call duration/speaker time | Audio analysis / transcripts | Likely available | Low — extract from existing data |
| Question detection | Transcript NLP | Needs extraction | Medium — new NLP pipeline |
| Meeting count/frequency | Meeting records | Available | Low — query existing |
| CRM records updated | Workflow execution logs | Available | Low — already logged |
| Workflow execution count | Agent logs | Available | Low — already logged |
| Email/Slack processed | Agent logs | Available | Low — already logged |
| Topic/theme detection | Summary extraction | Partially available | Medium — aggregation needed |
| Deal pipeline data | HubSpot API | Available | Low — already integrated |

### Architecture Recommendation

- **Aggregation layer:** Pre-compute daily/weekly/monthly rollups for dashboard queries. Don't query raw events in real-time.
- **Caching:** 1-hour cache for dashboard data. Daily refresh for trend calculations.
- **API pattern:** REST endpoints per dashboard view, paginated for drill-down.
- **Frontend:** React components matching existing design system. Chart library (recharts or similar).

### Performance Requirements

- Dashboard load time: < 2 seconds
- Drill-down expansion: < 500ms
- Time range switch: < 1 second
- Data freshness: Updated every 1-6 hours (not real-time)

---

## Dependencies

- **Audio analysis / transcript data** — Confirm speaker-level duration data is extractable
- **Workflow execution logs** — Confirm structured logging exists for all agent actions
- **HubSpot integration** — Confirm deal/pipeline data is queryable per workspace
- **Design system** — Align dashboard components with existing AskElephant design language
- **PostHog events** — Confirm workspace_id tagging for aggregation

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Talk ratio data not available from existing audio pipeline | High | Medium | Validate with engineering before committing. Fallback: word count ratio from transcripts. |
| Dashboard data inaccuracy erodes trust | High | Medium | Show data freshness timestamps. Start with high-confidence metrics only. |
| Scope creep toward "build Gong" | High | High | Strict V1 scope. Dashboard ≠ full analytics platform. Tyler enforces boundary. |
| Low adoption (another unused feature) | Medium | Medium | Integrate into existing workflow (sidebar nav, daily hub). Track engagement from day 1. |
| Engineering capacity | Medium | High | Start with V1 scope using existing data. No new instrumentation needed for core metrics. |
| Design resources | Medium | Medium | Prototype with HTML/CSS first. Use existing design system components. |

---

## Strategic Alignment

- [x] **Outcome chain complete:** Visibility → coaching → trust → retention → revenue
- [x] **Evidence basis:** Churn analyses, competitive losses, customer quotes, CEO direction
- [x] **Persona identified:** Reps, Managers, Admins — three distinct views
- [x] **Not anti-vision:** Not "better notes" — making automation visible and trustworthy
- [x] **Trust implications:** Transparency over black-box metrics; data freshness indicators
- [x] **Competitive context:** Gong has 6 dashboards; we have zero. Market expects analytics.
- [x] **Differentiator:** Automation outcomes visible in dashboards (unique to AskElephant)

---

## Open Questions

1. **Is talk ratio extractable from existing audio/transcript data?** (Check with engineering — Bryan/Kaden)
2. **Should dashboards live in main nav or inside Agent Command Center?** (Check with Skylar/Adam)
3. **What's the right default time range?** (7d for reps, 30d for managers, 90d for admins?)
4. **Should coaching scorecards be in V1 or V2?** (Depends on engineering complexity)
5. **How do we handle workspaces with < 5 users?** (Team comparison less meaningful)
6. **What's the data freshness SLA?** (Hourly? Daily? Per-event?)

---

## Collaboration Recommendations

| Stakeholder | Role | Why Loop In |
|-------------|------|------------|
| **Sam Ho** | VP Product | Strategic alignment, prioritization against other initiatives |
| **Skylar Sanford** | Growth Designer | Dashboard UX direction, design system alignment |
| **Adam Shumway** | Jr. Designer | Component design, prototype iteration |
| **Bryan Lund / Kaden Wilkinson** | Engineering | Data availability validation, architecture |
| **Ben Kinard** | Head of Sales | Validate manager dashboard serves sales coaching needs |
| **Rob Henderson** | Head of Growth | ROI dashboard utility for expansion conversations |
| **Ben Harrison** | Head of CX | Admin dashboard utility for QBRs and client health |

---

_Last updated: 2026-03-01_
_Owner: Tyler Sahagun_
