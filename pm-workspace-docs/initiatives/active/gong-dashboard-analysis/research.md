# Dashboard & Data Visualization: Competitive Research

> **Last updated:** 2026-03-01
> **Owner:** Tyler Sahagun
> **Initiative:** gong-dashboard-analysis
> **Focus:** Gong dashboard deep dive + meeting intelligence landscape analytics

---

## TL;DR

**AskElephant is losing to Gong not because our automation is worse — but because Gong makes performance visible and we don't.** Gong offers 6 pre-built dashboards, a custom analytics builder, conversation-level metrics (talk ratios, question rates), pipeline intelligence, and role-based views for reps, managers, and RevOps. Meanwhile, AskElephant's automation runs invisibly in the background — CRM records get updated, workflows execute, meetings get processed — but users can't see the aggregate impact. The result: prospects choose what they can see over what they can't, even when our automation is objectively superior.

The broader meeting intelligence landscape (Chorus, Avoma, Fireflies, Fathom, Clari) shows a clear trend: **analytics and dashboards are table stakes, not differentiators.** Every serious player is adding team analytics, coaching metrics, and pipeline views. AskElephant is the outlier with zero user-facing analytics.

**The strategic opportunity:** AskElephant can build dashboards that don't just match Gong — they leapfrog by showing what no one else can: **automation outcomes** (CRM records created, workflows executed, time saved), **cross-system intelligence** (HubSpot + Slack + Email + Meetings in one view), and **zero-config setup** (works from day one vs. Gong's 3-6 month implementation). Our dashboards should answer the question Gong can't: "What did AskElephant actually DO for me?"

---

## Problem Statement

### Why We're Losing to Gong on Dashboards

AskElephant has been consistently losing competitive deals to Gong, and a significant driver is dashboard/analytics parity. Customer feedback and churn signals paint a clear picture:

> "Gong has new features and access that makes them closer to AskElephant capabilities... if Gong and AskE are essentially the same platform we are going to hedge our bets on the established one"
> — Dental Intel churn ($1,978 MRR)

> "My team mentioned they've liked having Gong calls show up in the lead record"
> — Mobly (at-risk account, Gong preference for CRM visibility)

> "I don't have anything inside of AskElephant that helps me aggregate that information, figure out what somebody's average is over the last week, over the last month."
> — Cam Thunell, Business Bricks (customer feedback)

> "Every sales leader pretends like they're confident, but they are tiny little kids inside crying for real... I don't know what question to ask on how to help my team convert more deals."
> — Woody Klemetson, CEO (on the need for data-driven coaching tools)

From the 14-day Slack synthesis (Jan 2026): **Gong competitive pressure is the #1 threat.** 45+ competitor mentions in a 2-week period, with Gong appearing in churn analyses, feature requests, and competitive deal losses.

### The Core Issue

**AskElephant's automation is powerful but invisible.** We capture meetings, update CRM records, run workflows, process emails — but users can't see the aggregate impact. There's no place to answer:

- How is my team performing this week?
- Which reps need coaching?
- What's my pipeline health?
- How many CRM records did AskElephant update?
- What competitors are my team hearing about?
- Am I improving as a rep?

Gong answers all of these out of the box. We answer none.

---

## Part 1: Gong Dashboard Deep Dive

### 1.1 Pre-Built Dashboards (6 Types)

Gong ships with 6 pre-built dashboard templates that cover the most common analytics needs for revenue teams. These are available across all Gong plans and accessible to any team member.

#### Dashboard 1: Pipeline Analysis

**Purpose:** Give sales leaders bird's-eye visibility into pipeline health and risk.

**Key Widgets:**
- Competitive opportunities (which deals have competitor involvement)
- Late-stage deals without pricing discussed (risk flag)
- VP participation gaps (important stakeholders not engaged)
- Pipeline impact by rep, stage, or time period
- Deal velocity trends

**Who uses it:** Sales VPs, frontline managers during pipeline reviews.

**Why it's sticky:** Replaces the "gut feeling" pipeline review with data. Managers can walk into a pipeline call and immediately see which deals need attention, which are stale, and where competitive pressure exists.

#### Dashboard 2: Competitive Analysis

**Purpose:** Track competitive intelligence across all customer conversations.

**Key Widgets:**
- Competitive win rates (how often we win/lose when competitor X is mentioned)
- Deal values by competitor (where do we compete for big vs. small deals)
- Competitor mention trends over time
- Win/loss patterns by competitor

**Who uses it:** Sales leaders, PMMs, product teams.

**Why it's sticky:** No manual reporting required. Gong automatically detects competitor mentions in calls and aggregates them into dashboards. This is the kind of intelligence that previously required dedicated competitive research.

#### Dashboard 3: Scorecards Analysis

**Purpose:** Monitor coaching activity and rep performance through scored call evaluations.

**Key Widgets:**
- Top and bottom scorers by scorecard type
- Manager feedback frequency (who's coaching, who isn't)
- Rep performance trends over time
- Score distribution across the team
- Coaching activity by manager

**Who uses it:** Sales enablement, frontline managers, VP Sales.

**Why it's sticky:** Creates accountability for coaching. Managers can see if they're actually reviewing calls, and leadership can see which managers are investing in their teams.

#### Dashboard 4: Economic Pulse

**Purpose:** Track how external economic factors are impacting pipeline and win rates.

**Key Widgets:**
- Win rate trends correlated with economic indicators
- Deal cycle length changes
- Pipeline changes during economic shifts
- Budget discussion frequency in calls

**Who uses it:** CROs, VP Sales, RevOps.

**Why it's sticky:** Unique to Gong — uses conversation data to detect economic impact that CRM data alone can't capture. "Are prospects mentioning budget constraints more this quarter?"

#### Dashboard 5: Forecast Analytics (Requires Gong Forecast)

**Purpose:** Provide data-driven forecasting beyond CRM pipeline data.

**Key Widgets:**
- Forecast rollup by team/rep
- Pipeline trends and changes by forecast category
- Highest-value deals at risk
- Forecast accuracy tracking
- Attainment progress bars and delta indicators

**Customization:**
- Column-by-column customization (forecast submission, metric, or target types)
- Advanced filtering by deal properties
- Manual and auto-submissions with different workflows per column
- Quarterly totals calculation
- Visual attainment indicators (progress bars, deltas, arrows)

**Who uses it:** CROs, VP Sales, RevOps during forecast calls.

**Why it's sticky:** Combines CRM data with conversation signals (300+ unique signals) for 20% more accurate forecasting than CRM-only. This is the add-on most enterprise customers pay for.

#### Dashboard 6: Team Insights

**Purpose:** The core analytics experience — understand team conversation performance.

**Key Widgets:**
- **Activity metrics:** Call volume, meeting frequency, email cadence per rep
- **Interaction quality:** Talk-to-listen ratio (optimal 43:57 per Gong research), question rate, interactivity score, longest monologue
- **Responsiveness:** Email response rate, fast response tracking
- **Topics & Trackers:** What topics come up across calls, smart tracker matches
- **Coaching received:** How much coaching each rep has received

**Stats Calculation:**
- Updated twice daily
- Calculated from recorded calls of enabled team members
- Filterable by team, date range, call type, hosted vs. attended
- Individual or team aggregate views
- Private calls included in calculations

**Who uses it:** Every role — reps for self-coaching, managers for team coaching, leaders for strategy.

**Why it's sticky:** This is Gong's "daily habit" dashboard. Reps check their talk ratio to self-improve. Managers check who needs coaching. The data is generated automatically from every call — zero additional effort.

---

### 1.2 Custom Dashboard Builder

Beyond pre-built dashboards, Gong allows authorized users (typically RevOps/admins) to build custom analytics:

**How it works:**
1. Click "+New dashboard" → choose "Build your own" or start from a template
2. Add widgets from the gallery:
   - **Custom charts** — visual data representations filtered and broken down by criteria
   - **KPI widgets** — single metric display with trend
   - **Performance widgets** — rep/team comparison
   - **Deal widgets** — pipeline-specific data
   - **Forecast rollup widgets** — forecast data aggregation
   - **Trends widgets** — metric changes over time
   - **Changes widgets** — delta tracking
3. Custom charts can be based on saved metrics or custom analysis on the fly
4. Publish to share — dashboards remain in draft until published
5. Invite specific people or share with entire company

**Permissions:** Requires "manage revenue analytics" permission. Typically limited to RevOps admins and analytics leads. Non-admin users can view dashboards they're invited to but cannot build.

**Why this matters:** RevOps teams can create tailored dashboards for their specific KPIs without waiting for product updates. This is a massive retention driver — once a RevOps team has built custom dashboards, switching costs skyrocket.

---

### 1.3 Deal Board (Pipeline Intelligence)

**What it is:** A pipeline view that combines CRM deal data with conversation intelligence.

**Key capabilities:**
- Bird's-eye pipeline view down to individual email level
- AI-flagged deal risks (activity gaps, missing stakeholders, stalled engagement)
- Configurable by CRM fields
- Tabs by stage/forecast category
- Multiple boards, shareable and duplicatable
- Corrective action recommendations for at-risk deals

**Claimed outcomes (Gong marketing):**
- 29% shorter sales cycles
- 31% of at-risk deals saved
- 50% win-rate increase

**Why it's sticky:** This is the "visual CRM" that sales leaders crave — they can see their entire pipeline with AI-enriched risk signals. It replaces the spreadsheet-and-gut-feeling pipeline review with data-driven deal inspection.

---

### 1.4 Role-Based Access Model

Gong's dashboards are designed with clear role segmentation:

| Role | What They See | What They Can Do |
|------|---------------|-----------------|
| **Individual Rep** | Own performance metrics, team comparison (anonymous), assigned dashboards | View dashboards, filter own data, self-coach |
| **Frontline Manager** | Team performance aggregate, drill into individual reps, coaching metrics | View all team data, add comments/feedback, create coaching plans |
| **Sales Leader / VP** | Org-wide dashboards, cross-team comparison, forecast analytics | View all data, export, present in leadership meetings |
| **RevOps / Admin** | Everything above + custom builder | Create, publish, manage dashboards, control access permissions |
| **Listen-only** | Shared dashboards, limited interaction | View assigned dashboards and calls only |

**Key design principle:** Data is additive by role. A manager sees everything a rep sees + team data. A VP sees everything a manager sees + cross-team data. This progressive disclosure model means the same dashboard framework serves all personas.

---

### 1.5 What Makes Gong Dashboards Sticky (Competitive Moat)

From analyzing 6,000+ reviews and competitive patterns:

1. **Zero-effort data generation** — Every recorded call automatically feeds dashboards. No manual entry, no configuration, no "did you remember to tag this deal."

2. **Coaching feedback loop** — Talk ratio + question rate + scorecard data creates a visible improvement cycle. Reps can see themselves getting better. Managers can see coaching impact.

3. **Pipeline truth layer** — CRM data is often stale/inaccurate. Gong's conversation-enriched pipeline view becomes the "source of truth" for pipeline reviews, replacing the CRM.

4. **RevOps customization** — Once RevOps builds custom dashboards, they become organizational infrastructure. Switching away means rebuilding all that analytics.

5. **Board-ready data** — CROs can pull up Gong Forecast in a board meeting. The data is polished, visual, and defensible.

6. **Daily habit formation** — Team Insights becomes the first thing managers check in the morning. That daily engagement drives retention.

### 1.6 Gong Dashboard Weaknesses

Despite being strong, Gong dashboards have documented weaknesses:

1. **Expensive** — Forecast and Deal Board require add-on pricing. Full stack can reach $250-550/user/mo when combined with Clari (which 40% of Gong customers also buy). Mid-market teams pay for modules they don't use.

2. **Forecasting rated 4/10** — Despite the marketing, Gong Forecast is widely criticized. 40% of customers supplement with Clari, creating expensive dual-tool stacks.

3. **No product usage metrics** — Gong shows call patterns and CRM activity, but cannot show whether a customer is actually using their product features. Account "health" is inferred from engagement patterns, not adoption.

4. **No automation visibility** — Gong can show what happened in calls but cannot show what agents did after calls (CRM updates, email follow-ups, task creation). There's no "what did the platform do for me" view.

5. **Complex implementation** — 3-6 months for full deployment. Smart Trackers require 50-100 training examples and 40+ hrs/mo maintenance. Custom dashboards require dedicated RevOps.

6. **Smart Tracker limitations** — Legacy keyword-based system with sentence-level embeddings that lose broader context. Even the new question-based trackers have limits (20 per workspace).

7. **UI complaints** — Some users report the interface is "too complicated" and "not intuitive" despite strong underlying capabilities.

---

## Part 2: Broader Meeting Intelligence Landscape

### 2.1 Chorus (ZoomInfo)

**Analytics offering:** Enterprise-grade conversation analytics focused on call patterns and competitive intelligence. Deeply integrated with ZoomInfo's data enrichment platform.

**Dashboard capabilities:**
- Call analytics (talk ratios, topics, sentiment)
- Deal intelligence views
- Team performance comparisons
- Competitive mention tracking
- Limited custom dashboard building

**Strengths:** ZoomInfo integration for contact/company enrichment. Strong enterprise presence.

**Weaknesses:** Less dashboard customization than Gong. Acquired by ZoomInfo in 2023 — product direction less clear as independent platform. Pricing at $800-1,200/user/year makes it enterprise-only.

**Dashboard relevance to AskElephant:** Chorus validates that conversation analytics + pipeline intelligence is expected by enterprise buyers. Their integration with ZoomInfo for enrichment is something we can match with our CRM integration.

---

### 2.2 Avoma

**Analytics offering:** All-in-one platform with conversation intelligence, revenue insights, and coaching.

**Dashboard capabilities:**
- **Activity Dashboard** — Org-wide conversation summaries, filterable by team/user/purpose/stage. Distinguishes internal vs. external conversations.
- **Conversation Insights** — Interaction-level analytics (talk time, topics, sentiment)
- **Revenue Insights** — CRM field mapping, forecasting, AI-powered win/loss analysis
- **Usage Insights** — Platform adoption metrics
- **AI Coaching Agent** — Automated call scoring with custom scorecards. 100% call coverage with personalized evaluation criteria (budget discussions, follow-up scheduling, consultative questioning).

**Strengths:** Full-stack approach from meeting recording through coaching. Custom scorecard templates. Claims 40% improvement in win rates. Price-accessible ($19/user/month starting).

**Weaknesses:** Smaller market presence than Gong. Less custom dashboard flexibility. Analytics focused on call patterns, not automation outcomes.

**Dashboard relevance to AskElephant:** Avoma's Activity Dashboard pattern (filtering by team/user/purpose/stage) is a good model for our team analytics. Their AI Coaching Agent with custom scorecards validates the market demand for automated coaching that doesn't require manager review.

---

### 2.3 Fireflies.ai

**Analytics offering:** Conversation analytics with CRM integration focus.

**Dashboard capabilities:**
- Conversation analytics (sentiment, objections, competitor mentions)
- CRM integration for deal-level context
- Team meeting analytics
- Topic and keyword tracking
- 69-language support

**Strengths:** Best-in-class language coverage. Deep CRM integrations (Salesforce, HubSpot, Pipedrive). Affordable pricing ($10-19/user/month). Broad integration ecosystem.

**Weaknesses:** Analytics less sophisticated than Gong. No custom dashboard builder. Limited pipeline/forecast views. More focused on meeting capture than team analytics.

**Dashboard relevance to AskElephant:** Fireflies' CRM integration approach (automatically pushing data to deals) is aligned with AskElephant's automation model. Their pricing validates that mid-market buyers expect analytics at accessible price points.

---

### 2.4 Fathom

**Analytics offering:** Minimal — focused on individual productivity, not team analytics.

**Dashboard capabilities:**
- Individual meeting history and summaries
- Searchable meeting archive
- Limited team sharing features
- No team analytics or coaching dashboards
- No pipeline/deal views

**Strengths:** Highest transcription accuracy (~95%). Generous free tier (unlimited recordings). Simple, fast, individual-focused.

**Weaknesses:** No team analytics, no coaching, no pipeline intelligence, no custom dashboards. Not designed for sales teams.

**Dashboard relevance to AskElephant:** Fathom is winning the individual user market on simplicity. They prove that a simple, fast experience beats a complex one. But they have zero team/org analytics — the exact gap we're looking to fill.

---

### 2.5 Clari (+ Salesloft Merger)

**Analytics offering:** Revenue forecasting and pipeline intelligence platform. Merged with Salesloft (2025) for unified revenue execution.

**Dashboard capabilities:**
- **Forecast dashboards** — AI-powered revenue prediction from CRM + activity signals
- **Deal Inspection** — AI agents that expose deal patterns and guide actions
- **NRR tracking** — Retention across segments, product lines, geographies
- **Trend Analysis** — Time Series Data Hub for historical pattern detection
- **Churn Risk Detection** — AI-predicted churn from usage signals and behavior shifts
- **Revenue Cadences** — Coordinated cross-functional retention actions

**Strengths:** Best-in-class forecasting (the tool 40% of Gong customers add). Strong enterprise presence (75,000+ revenue teams). AI agents for deal analysis.

**Weaknesses:** Primarily forecasting-focused, not daily workflow. No meeting recording/analytics. Enterprise-first (complex, expensive). Post-merger product consolidation creates uncertainty.

**Dashboard relevance to AskElephant:** Clari validates that revenue leaders want per-account intelligence and churn detection. Their merger with Salesloft signals that "one platform" is the winning model. We can offer pipeline intelligence + automation in one view — Clari can't show what agents did.

---

### 2.6 Otter.ai

**Analytics offering:** Minimal team analytics. Focused on transcription accuracy and real-time collaboration.

**Dashboard capabilities:**
- Meeting archive with search
- Speaker identification
- Real-time collaboration features
- Basic usage stats
- No team performance analytics
- No coaching or pipeline views

**Dashboard relevance to AskElephant:** Otter is not a competitive threat on dashboards. Validates that pure transcription tools are a commodity — the value is in the intelligence layer on top.

---

### 2.7 Market-Wide Analytics Trends (2025-2026)

| Trend | Evidence | Implication for AskElephant |
|-------|----------|----------------------------|
| **AI coaching becoming default** | Avoma AI Coaching Agent, Gong AI Call Reviewer, Chorus automated scoring | Must include coaching metrics in dashboards |
| **Custom dashboards = retention moat** | Gong custom builder, Clari configurability | Need some level of customization to prevent churn |
| **Pipeline intelligence converging with meeting data** | Gong Deal Board, Clari Deal Inspection, Avoma Revenue Insights | Dashboards must show pipeline context, not just call metrics |
| **Forecast accuracy as a selling point** | Gong 300+ signals, Clari AI prediction | Less relevant for mid-market; focus on automation ROI instead |
| **Zero-config analytics emerging** | Day.ai, Fathom simplicity trend | Aligns perfectly with AskElephant's automation-native model |
| **Cross-platform data fusion** | Clari+Salesloft merger, Gong MCP support | Our multi-system data (HubSpot+Slack+Email+Meetings) is an advantage |
| **Meeting intelligence market growing** | Projected $6.5B by 2026, 526% average 3-year ROI | Market is expanding — dashboards are expected, not optional |

---

## Part 3: Why People Choose Gong's Dashboards

Based on analyzing 6,200+ G2 reviews, Gartner Peer Insights, customer feedback, and competitive deal patterns, here's why teams choose Gong specifically for its dashboard/analytics capabilities:

### 3.1 Instant Team Performance Visibility

> "The most impactful thing is seeing how my team is performing without asking them. I can see talk ratios, question patterns, and engagement levels across every call."
> — G2 reviewer (Sales Manager)

Gong eliminates the need for self-reported metrics. Every conversation automatically generates performance data. Managers don't have to ask "how did that call go?" — they can see it.

### 3.2 Data-Driven Coaching

Talk-to-listen ratios, question frequency, longest monologue, interactivity scores — these metrics transform coaching from subjective ("I think you talked too much") to objective ("Your talk ratio was 72% vs. the team average of 48%"). Gong's research (from millions of calls) provides benchmarks, making coaching specific and actionable.

### 3.3 Pipeline Intelligence with AI Risk Signals

The Deal Board doesn't just show pipeline data from the CRM — it enriches it with conversation signals. "This deal hasn't had executive engagement in 3 weeks" or "Competitor was mentioned in the last 2 calls" — these are signals CRM alone can't generate.

### 3.4 Custom Analytics for RevOps

RevOps teams love building custom dashboards tailored to their specific KPIs. Once they've built these, switching costs are enormous. This is a deliberate retention strategy — Gong makes it easy to build, hard to leave.

### 3.5 Board-Ready Presentation Data

CROs can walk into a board meeting and pull up Gong Forecast. The data is polished, visual, and comes with AI confidence levels. This executive utility creates top-down buying pressure.

### 3.6 Accountability Without Surveillance

The genius of Gong's model is that metrics feel like "coaching" not "monitoring." Reps self-coach by checking their own ratios. Managers coach with data, not gut feeling. The accountability is structural, not oppressive.

---

## Part 4: AskElephant Current State — What We Have

### 4.1 What Exists Today

| Capability | Status | Details |
|-----------|--------|---------|
| Meeting recording & transcription | ✅ Live | Core product — all meeting data captured |
| Meeting summaries / recaps | ✅ Live | AI-generated summaries with action items |
| CRM automation (HubSpot) | ✅ Live | Auto-update deals, contacts, companies |
| Workflow execution | ✅ Live | Configurable agents running post-meeting |
| Email processing | ✅ Live | Email read/send/analyze capabilities |
| Slack integration | ✅ Live | Message read/send/update |
| PostHog analytics (internal) | ✅ Live | Platform telemetry — not user-facing |
| **User-facing dashboards** | ❌ Missing | **Zero analytics visible to users** |
| **Team performance views** | ❌ Missing | **No way to compare reps or see team trends** |
| **Talk ratio / question analytics** | ❌ Missing | **Data likely extractable but not surfaced** |
| **Pipeline / deal dashboard** | ❌ Missing | **Despite CRM integration, no pipeline view** |
| **Coaching scorecards** | ❌ Missing | **No scoring or coaching metrics** |
| **Custom dashboard builder** | ❌ Missing | **RevOps can't build their own views** |
| **Automation outcome visibility** | ❌ Missing | **Users can't see what agents did in aggregate** |
| **Competitive intelligence tracking** | ❌ Missing | **No automated competitor mention tracking** |

### 4.2 Related Initiatives (In Progress)

Several initiatives are circling around the dashboard problem from different angles:

**Universal Signal Tables** (Build phase)
- Ad-hoc exploration of call data with AI-powered columns
- Leaders can create custom analysis tables
- **Dashboard overlap:** This is the "custom analytics" angle — leaders exploring data. But it's table-based exploration, not pre-built dashboards.

**Client Usage Metrics / By The Numbers** (Define phase)
- CS-facing workspace health dashboard
- Per-client adoption metrics (DAU/WAU, feature usage, invite acceptance)
- Bento-style value proof page
- **Dashboard overlap:** This is the "admin/CS view" angle — workspace-level health. But it's internal-facing, not the rep/manager analytics dashboard.

**Agent Command Center** (Discovery phase)
- Daily hub with Done / Needs Approval / Scheduled buckets
- Agent activity feed with audit trail
- Deal-centric workspace (P1)
- **Dashboard overlap:** This is the "daily activity" view — what agents did today. But it's individual/daily, not aggregate analytics.

**Chief of Staff Experience** (Build phase)
- Meeting recaps, prep, action items
- Daily brief concept
- **Dashboard overlap:** This is the "meeting artifact" layer that feeds dashboard data. But it's meeting-by-meeting, not aggregate team analytics.

### 4.3 The Gap

**AskElephant has all the data needed to build dashboards that rival or exceed Gong's — but none of it is aggregated or visible to users.**

We record every call. We know talk durations. We can extract question counts, topic mentions, sentiment. We integrate with CRM and know deal outcomes. We run workflows and know their results. We process emails and Slack messages.

But all of this data sits in backend systems (PostHog, databases, CRM) with zero user-facing analytics surface. The gap isn't data — it's visibility.

---

## Part 5: Customer Evidence & Signals

### 5.1 Direct Dashboard/Analytics Requests

| Signal | Source | Date | Relevance |
|--------|--------|------|-----------|
| Agency dashboard API request | Customer quote | 2026-02-11 | Customer wants embedded AI meeting summaries, sentiment, and trends in external dashboard |
| "Can't aggregate information" | Cam Thunell, Business Bricks | 2026-01-28 | RevOps user explicitly asking for aggregation tools |
| "Don't know what question to ask to help my team convert" | Woody, CEO | 2026-01 | Leadership validating the need for data-driven coaching tools |

### 5.2 Gong-Related Competitive Signals

| Signal | Source | Date | Relevance |
|--------|--------|------|-----------|
| Dental Intel churn — "hedging bets on established one" | #churn-alert | 2026-01 | $1,978 MRR lost to Gong feature parity perception |
| Mobly at-risk — "team liked having Gong calls in lead record" | #churn-alert | 2026-01 | Gong's CRM visibility is a pull factor |
| "Gong's workflows are pretty shit" — customer chose AE | #competitors | 2026-01 | We WIN when automation is the focus; we LOSE when visibility/dashboards is the focus |
| "They don't do the automation side of things" — AE about Gong | #competitors | 2026-01 | AE team knows our automation is better |
| 45+ competitor mentions in 2 weeks | Slack synthesis | 2026-01 | Gong is #1 competitive threat |

### 5.3 Pattern from Win/Loss Analysis

**We WIN when:**
- Customer values automation over coaching
- HubSpot is CRM (Momentum ruled out Gong alternatives)
- Customer frustrated with manual CRM updates
- Customer sees Gong as expensive/overkill
- Customer needs post-sales (CS/expansion) features

**We LOSE when:**
- Customer values dashboards and analytics visibility
- Customer wants data-driven coaching tools
- Customer has existing Gong investment
- Customer prioritizes "established" platform perception
- Customer's RevOps team wants custom dashboard building

**The dashboard gap is a direct driver of competitive losses.** We win on automation value but lose when buyers need visibility into that value.

---

## Sources

### Gong Product Documentation
- [Dashboards overview](https://help.gong.io/docs/dashboards)
- [Building dashboards](https://help.gong.io/docs/building-dashboards-1)
- [Custom chart](https://help.gong.io/docs/custom-chart)
- [Managing dashboards](https://help.gong.io/docs/managing-dashboards)
- [Building your own metrics](https://help.gong.io/docs/build-your-own-metrics)
- [Forecast analytics dashboards](https://help.gong.io/docs/analyze-forecast-analytics-dashboards)
- [Configurable forecast boards](https://help.gong.io/docs/understanding-configurable-forecast-boards)
- [Setting up forecast boards](https://help.gong.io/docs/set-up-forecast-boards)
- [Team insights and initiatives](https://help.gong.io/docs/intro-to-insights)
- [Analyze team performance](https://help.gong.io/docs/analyze-team-performance)
- [Track performance with Analytics](https://help.gong.io/docs/track-performance-with-analytics)
- [Talk-to-listen ratio research](https://www.gong.io/resources/labs/talk-to-listen-conversion-ratio/)
- [Deal Board](https://www.gong.io/deal-board)
- [Deal Execution](https://www.gong.io/deal-execution)
- [Sales Analytics Software](https://www.gong.io/sales-analytics-software)
- [5 revenue dashboards](https://www.gong.io/blog/revenue-dashboard)
- [AI-powered sales forecasting](https://www.gong.io/ai-powered-sales-forecasting)

### Competitor Documentation
- [Avoma Conversation Intelligence](https://avoma.com/conversation-intelligence)
- [Avoma Activity Dashboard](https://help.avoma.com/usage-insights-activity-dashboard)
- [Avoma AI Coaching Agent](https://avoma.com/blog/introducing-ai-coaching-agent)
- [Avoma Product Activity Dashboard](https://avoma.com/product/activity-dashboard)
- [Fireflies CRM Integration](https://fireflies.ai/)
- [Fathom Meeting Assistant](https://fathom.video/)
- [Clari Revenue Platform](https://www.clari.com/)
- [Clari AI Customer Retention](https://www.clari.com/solutions/ai-customer-retention/)
- [Otter.ai](https://otter.ai/)

### Market Analysis
- [Gong Review 2026 (6,000+ users analyzed)](https://marketbetter.ai/blog/gong-review-2026/)
- [600+ Gong Reviews analyzed (Oliv.ai)](https://www.oliv.ai/blog/gong-reviews)
- [Gong alternatives (Oliv.ai)](https://www.oliv.ai/blog/gong-alternatives)
- [Gong alternatives (Demodesk)](https://demodesk.com/blog/best-alternative-to-gong)
- [Gong Gartner Peer Insights](https://www.gartner.com/reviews/market/revenue-intelligence/vendor/gong/product/gong)
- [Enterprise Meeting AI Tools Comparison 2026](https://summarizemeeting.com/comparison/enterprise-meeting-tools-2025)
- [14 Best AI Meeting Assistant Tools 2026](https://superprompt.com/blog/14-best-ai-meeting-assistant-tools-that-actually-save-time-2025)

### Internal Research
- `agent-command-center/competitive-landscape-gong.md` — Gong competitive profile
- `client-usage-metrics/competitive-landscape.md` — Client health competitive landscape
- `chief-of-staff-experience/competitive-landscape-deep-dive.md` — Chief of Staff competitive deep dive
- `hypotheses/active/automation-beats-gong-positioning.md` — Automation vs. Gong hypothesis
- `signals/slack/2026-01-26-14day-slack-synthesis.md` — 14-day Slack signal synthesis
- `signals/slack/2026-02-11-agency-dashboard-api-request.md` — External dashboard API request

---

## Part 6: Strategic Recommendations

### 6.1 Match (Table Stakes — Must Build to Stop Losing)

These are the capabilities whose absence is directly causing competitive losses. Without them, AskElephant will continue to lose dashboard-aware evaluations.

| Capability | Why It's Table Stakes | V1 Priority |
|-----------|----------------------|-------------|
| **Talk-to-listen ratio** | Most basic conversation metric. Every competitor has it. Managers expect it for coaching. | P0 — Ship in V1 |
| **Question rate per call** | Second most common coaching metric. Reps need self-awareness, managers need coaching data. | P0 — Ship in V1 |
| **Meeting activity dashboard** | "How many calls did my team have?" — the most basic team analytics question. | P0 — Ship in V1 |
| **Team performance comparison** | Managers NEED to compare reps. Without this, no coaching workflow is possible. | P0 — Ship in V1 |
| **Any user-facing analytics surface** | Having zero dashboards is disqualifying in 2026. Ship anything. | P0 — Ship in V1 |

### 6.2 Leapfrog (Our Unique Angle — Where We Beat Gong)

These are capabilities that only AskElephant can deliver because of our unique automation and cross-system architecture.

| Capability | Why Only We Can Do This | V1 Priority |
|-----------|------------------------|-------------|
| **"AskElephant Did This For You" card** | Gong shows what happened in calls. We show what happened AFTER calls — CRM records updated, emails processed, tasks created. Category-creating. | P0 — Ship in V1 (core differentiator) |
| **Automation ROI / time saved** | Quantified value proof: "AskElephant saved your team 312 hours." No competitor can make this claim because no competitor automates post-call actions. | P0 — Ship in V1 |
| **CRM data quality improvement** | Before/after CRM field fill rates. Shows concrete, measurable platform value. This is the QBR slide. | P0 — Ship in V1 |
| **Zero-config analytics** | Works from day one with no setup, no training examples, no 3-6 month implementation. Gong's #1 G2 complaint becomes our biggest advantage. | P0 — Built into architecture |
| **AI coaching suggestions** | Not just metrics — actionable AI-generated coaching tips based on trend analysis. "Tom's monologue length increased 3x — focus coaching on active listening." | P1 — Ship in V1 if possible |
| **Cross-system intelligence** | Dashboard combining HubSpot + Slack + Email + Meeting data. No one else has data from all four systems. | P2 — Ship in V2 |

### 6.3 Ignore (Not Our Fight)

| Capability | Why We Should Skip It | Alternative |
|-----------|----------------------|-------------|
| **Forecast analytics** | Gong's own forecast is rated 4/10. 40% of Gong customers also buy Clari for forecasting. Don't compete with Clari on their strength. | Show pipeline health, not forecast predictions |
| **Custom dashboard builder (V1)** | Ship pre-built dashboards first. Custom builder is a retention feature, not an acquisition feature. | V2 after pre-built dashboards prove value |
| **Smart Tracker–style keyword training** | Gong requires 50-100 training examples and 40+ hrs/mo maintenance. We should use AI-native detection that requires zero training. | AI-powered topic extraction with no setup |
| **Engagement scoring (Gong Engage)** | Gong Engage has "widespread user dissatisfaction." Don't replicate a feature even Gong customers hate. | Focus on automation, not engagement sequences |
| **Enterprise compliance features** | SOC 2, HIPAA, complex access controls — important but not the dashboard battle. | Address separately from dashboard initiative |

### 6.4 Relationship to Existing Initiatives

| Initiative | Relationship | Integration Strategy |
|-----------|-------------|---------------------|
| **Universal Signal Tables** | Signal Tables = ad-hoc exploration. Dashboards = pre-built daily views. | Complementary. Signal Tables could become the V2 "custom builder" for power users. Share the same underlying data aggregation layer. |
| **Client Usage Metrics / By The Numbers** | By The Numbers = CS-facing workspace health (admin perspective). Dashboards = user + manager views too. | The admin dashboard view and By The Numbers overlap significantly. Merge the admin dashboard with the By The Numbers bento concept. Use the same visual language. |
| **Agent Command Center** | Command Center = real-time "what agents are doing now." Dashboards = aggregate "what happened over time." | Command Center is the "today" view. Dashboards are the "trend" view. They should live in the same navigation family. Command Center activity data feeds dashboard aggregates. |
| **Chief of Staff Experience** | Chief of Staff = individual meeting artifacts (recaps, prep, action items). | Chief of Staff generates the per-meeting data. Dashboards aggregate it across meetings. Meeting summaries, action items, and topics all flow from CoS into dashboard metrics. |
| **Automation Beats Gong Hypothesis** | Hypothesis validated by this research. Dashboards are the product expression. | The "AskElephant Did This For You" card is the concrete product manifestation of this hypothesis. If the hypothesis is true (customers value automation over coaching), the purple automation cards should be the hero of every dashboard view. |

### 6.5 Phasing Recommendation

#### V1: "Visible Intelligence" (8-12 weeks)

**Goal:** Stop bleeding competitive deals on dashboard visibility. Ship the minimum viable analytics surface.

**Scope:**
- Three pre-built role-based dashboards (User, Manager, Admin)
- Conversation metrics: talk ratio, question rate, meeting count, call duration
- Automation impact: CRM records updated, workflows run, time saved
- Team comparison table for managers
- "AskElephant Did This For You" hero card (our differentiator)
- Time range filtering (7d/30d/90d)
- Basic drill-down (click card → expanded view)

**Engineering dependencies:**
- Talk ratio extraction from audio/transcripts (new pipeline)
- Question rate extraction from transcripts (new NLP)
- Aggregation layer for per-user/team/workspace rollups
- Dashboard frontend components

**Success criteria:**
- 40%+ of active users view dashboards weekly
- Qualitative: sales team uses dashboard data in at least one competitive deal
- Qualitative: manager uses dashboard data in coaching 1:1

---

#### V2: "Coaching Intelligence" (12-16 weeks after V1)

**Goal:** Make AskElephant the coaching platform of choice. Add pipeline intelligence and customization.

**Scope:**
- Coaching scorecards with AI-automated scoring (Avoma model)
- Pipeline/deal view with conversation enrichment
- Competitive intelligence tracking (automatic competitor detection from transcripts)
- Custom KPI builder for RevOps
- Dashboard sharing and export (PDF, link)
- Alert system (metric drops trigger Slack notifications)
- Topic/theme detection aggregated across team calls

**Success criteria:**
- 50%+ of managers use coaching queue weekly
- RevOps creates 3+ custom KPIs
- Competitive intelligence cited in strategy meetings

---

#### V3: "Revenue Intelligence" (future)

**Goal:** Full revenue attribution and predictive analytics.

**Scope:**
- Revenue attribution from automation ("AskElephant influenced $X in closed deals")
- Predictive deal scoring
- Cross-team benchmarking at enterprise scale
- Customer-facing health dashboard (client can see their own value)
- API for external dashboards (agency request)
- Forecast-adjacent features (pipeline health, not prediction)

---

### 6.6 Collaboration Notes

**Who to loop in and when:**

| Person | Role | When | Why |
|--------|------|------|-----|
| **Sam Ho** | VP Product | Before starting V1 development | Strategic alignment. This is a significant new product surface. Needs Sam's buy-in on priority. |
| **Skylar Sanford** | Growth Designer | During V1 design phase | Dashboard UX direction. Design system alignment. Trust/transparency patterns. |
| **Adam Shumway** | Jr. Designer | During V1 component design | Build dashboard components. Iterate on prototype fidelity. |
| **Bryan Lund** | Senior Engineer | Data availability validation | Confirm talk ratio / question rate extractability. Architecture for aggregation layer. |
| **Kaden Wilkinson** | Head of EPD | Engineering capacity allocation | Dashboard V1 needs dedicated engineering capacity. |
| **Ben Kinard** | Head of Sales | Manager dashboard validation | Does the coaching queue serve real coaching needs? What metrics matter most? |
| **Rob Henderson** | Head of Growth | Admin dashboard validation | Would ROI metrics work in QBR presentations? What data would help expansion? |
| **Ben Harrison** | Head of CX | CS dashboard usage | Would CS team use this for client health monitoring? Overlaps with Client Usage Metrics. |
| **Kenzi (PMM)** | Marketing | Competitive positioning | Dashboard as competitive differentiator. Marketing materials about "automation intelligence." |

---

### 6.7 The Bottom Line

**We have two choices:**

1. **Continue without dashboards** — and keep losing deals to Gong when buyers evaluate analytics, keep hearing "but I can't see what AskElephant does," and keep watching our automation run invisibly while competitors get credit for visible metrics.

2. **Build dashboards that show what only we can show** — and turn our biggest weakness (invisible automation) into our biggest strength (visible, quantified, trustworthy automation outcomes with dashboards to prove it).

The research is clear. The competitive gap is documented. The customer evidence is strong. The unique differentiation exists. The question isn't whether to build dashboards — it's how fast we can ship V1.

> "It's not what you build...It's how it's delivered, how it's used, and how it is experienced."
> — Woody Klemetson, CEO

Right now, we're building great automation and delivering it invisibly. Dashboards fix the delivery.

---

_Last updated: 2026-03-01_
_Owner: Tyler Sahagun_
