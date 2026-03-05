---
title: "Product Usage Metrics — Master Plan"
aliases: ["product metrics", "usage dashboard", "north star metrics"]
tags: [product, metrics, posthog, analytics, north-star, dashboard]
created: 2026-02-16
updated: 2026-02-16
status: active
owner: Tyler Sahagun
sources:
  - council-of-product-transcript-2026-02-16
  - slack-audit-2026-02-16
  - posthog-dashboard-audit
  - notion-prd-internal-product-dashboard
initiative: client-usage-metrics
posthog_dashboard_id: 1283083
---

# Product Usage Metrics — Master Plan

> **Goal**: Fill the empty [Product Usage Dashboard](https://us.posthog.com/project/81505/dashboard/1283083) in PostHog and establish a metrics framework that answers: Who is getting value? Where do they get stuck? What predicts retention?

---

## Table of Contents

- [[#1. Current State Audit]]
- [[#2. Transcript Insights — Council of Product (Feb 16)]]
- [[#3. Slack Conversation Audit]]
- [[#4. Existing PostHog Dashboards]]
- [[#5. Data Sources — What We Can Track]]
- [[#6. North Star Metric Framework]]
- [[#7. Product Area Dashboards]]
- [[#8. Open Questions & Decision Log]]
- [[#9. Implementation Roadmap]]
- [[#10. Appendix — Raw SQL & Event Catalog]]

---

## 1. Current State Audit

### What We Have

| Source | What It Provides | Limitations |
|--------|-----------------|-------------|
| **PostHog events** | Page views, feature flags, custom events (workflow runs, chat opens, search queries) | Dirty data — hard to separate human-initiated vs automated. Properties inconsistent across events. |
| **Postgres DB (Retool)** | Direct user/workspace/workflow/chat/engagement tables | Requires SQL knowledge, no real-time dashboards, no event-level granularity |
| **Monthly User Activity SQL** | Per-user × per-month: recordings, chats, workflows, logins | Only first-login proxy (not recurring logins), workspace-scoped |
| **Kaden's Hackathon Project** | Lab/Experimental usage page pulling PostHog data into AskElephant UI | Behind feature flag, internal-only, no ETA for GA |
| **20 existing PostHog dashboards** | Various product area coverage (see [[#4. Existing PostHog Dashboards]]) | Fragmented, no unified view, no per-customer breakdowns |

### What We Don't Have

1. **Per-customer usage breakdown** — Can't answer "How is Company X using us?"
2. **Workflow value attribution** — Can't distinguish "meeting summary" from "CRM update" from "coaching workflow" in aggregate
3. **User vs automated activity** — PostHog events mix human-initiated chats with workflow-triggered actions
4. **Engagement quality signals** — No tracking of Slack emoji reactions, email opens, or "did they actually read it"
5. **Mobile usage visibility** — Sam confirmed mobile chat/workflow access is broken or hidden
6. **LLM quality metrics** — No evals for "did the workflow actually provide value"
7. **Recurring login tracking** — Only have first-login, not returning user sessions

---

## 2. Transcript Insights — Council of Product (Feb 16)

### Participants
- **Tyler Sahagun** (PM), **Sam Ho** (CEO), **Skylar Sanford** (Design), **Woody** (joined mid-call)

### Key Themes

#### Product Strategy: Power Tool → Packaged Experiences
- Sam: "We have a power tool and workflows... once we have enough useful skills, we bundle that into an agent"
- The story arc: (1) Improve onboarding → (2) Productized agents → (3) PLG ladder → (4) Revenue intelligence
- Relay.app cited as UX inspiration — "5 minutes and I had a complete clear vision of the value"

#### The Usage Data Problem (Tyler)
> "I'm really struggling diving trying to understand the product analytics of where people are currently getting stuck. The data we have in PostHog is just so dirty."

- **Two confounding factors**: Hard to tell human chat vs workflow-triggered activity. LLM analytics and evals are missing.
- **Hoarder's house metaphor**: "There's so much we could track that we don't even know where to start"
- Tyler's ask: **"Give me the first thing to start with"** — one metric, then build from there

#### Sam's North Star Direction
- North Star = something around **minimum value threshold that determines if they'll stay or go**
- Meeting notes alone isn't enough — that's commodity. Need customization + accessibility
- Mobile experience is broken — "I couldn't even click on the workflows"
- **Feedback loop**: Show ideal output → customize prompt → iterate

#### Woody on Product Data
> "I would love some of the product data to validate what this is showing."

- Wants "dashboards that go up into the right" for board/investor storytelling
- Tyler wants at least ONE metric ready for the all-hands Tuesday presentation

### Action Items from Transcript
- [ ] Get at least one product metric ready for all-hands
- [ ] Separate human chat activity from workflow-triggered activity in PostHog
- [ ] Investigate mobile experience gaps (chat access, workflow access)
- [ ] Partner with Hayden on PostHog data cleanliness
- [ ] Define what "engaged" means — clicked through? Chatted? Reacted in Slack?

---

## 3. Slack Conversation Audit

### Critical Messages Found

#### Woody — Jump Capital Investor Sync (Jan 29, 2026)
**Channel**: MPDM with Woody, Sam, Robert, Ben, Tyler, Tony, Kaden, Bryan
**Key Framework** — Three pillars investors want:

| Pillar            | Definition                    | Target                                |
| ----------------- | ----------------------------- | ------------------------------------- |
| **Speed**         | Time to first value           | 5 business days max                   |
| **Pervasiveness** | % of org using it             | Tracked by verified addressable seats |
| **Velocity**      | How fast engagement compounds | Across the team over time             |

> "Pick the atomic unit of engagement we care about. Is it 'time to first CRM auto-populate'? 'Time to first workflow created'? We need one clear answer."

**Action**: Map all 15-20 core features into 4 quadrants (Speed × Adoption) — Figma prototype shared.

#### Woody — Investor Metric Requests (Feb 17, 2026)
**Channel**: MPDM with Woody, Sam, Ben, Robert, James, Tyler
**From investor**: Define DAU/WAU as "user who reviews/approves automation output OR is associated with ≥1 workflow run that writes to another system"

Metrics requested:
- Workflows run per account/per week
- Write rate: % runs that write back to CRM vs read-only
- Handoff speed & quality
- Risk signal lift
- Admin time saved

#### Sam Ho — North Star Metric Proposal (Feb 6, 2026)
**Channel**: #council-of-product

> "Reps who complete ≥X workflows per week tied to revenue outcomes have materially higher NRR and lower churn."

Composite metric covering:
1. **Breadth** — how many reps
2. **Depth/Quality** — how many times and which workflows count
3. **Frequency** — cadence per week

The X = threshold defined by analyzing successful vs churned customers.

Mapping to business asks:
- NRR ↑ : Reps hitting threshold → higher NRR
- Churn ↓ : Accounts below threshold → early churn signal
- Expansion ↑ : Workflow-tied expansion plays
- TTV ↑ : Time to first workflow completion as TTV proxy
- Partner referrals ↑ : Partner-sourced reps adopting workflows
- SDR meeting rate ↑ : Workflow-driven sequences → higher conversion

#### Sam Ho — Win/Loss Analysis (Feb 14, 2026)
**Channel**: #council-of-product

> "#1 Database/Product Usage Data Integration (Most Critical) — Cited in ~40+ deals across all segments. Blocks deals from $0 to $240K."

**Biggest miss in deals**: Not integrating product usage data. Customers want to feed their own product usage/health data into our system.

#### Kaden — Usage Lab Feature (Feb 17, 2026)
**Channel**: #product-updates

New experimental "Usage" option in settings dropdown, pulling PostHog data into AskElephant product. Behind internal feature flag. Follow #council-of-product for updates.

#### Robert Henderson — Low-Hanging Fruit (Feb 1, 2026)
**Channel**: #council-of-product

Three immediate needs:
1. Feedback mechanism — "AskElephant tells me it's updated 5 deals today based on my calls"
2. Visualization of what HubSpot agent is doing
3. Better error-handling and communication when something breaks

---

## 4. Existing PostHog Dashboards

We already have **20 dashboards** across product areas. Here's the inventory with gap analysis:

### Product Area Coverage

| Dashboard | ID | Has Insights? | Gap |
|-----------|-----|--------------|-----|
| **Product Usage Dashboard** | 1283083 | **EMPTY** | This is the target to fill |
| North Star & Value Ladder | 1123968 | Yes | Workspaces with 3+ workflow runs/week. Has value tiers. |
| Company Health & Usage | 1122947 | Yes | Per-company feature adoption, engagement frequency |
| Workflows Dashboard | 375268 | Yes | General workflow metrics |
| Workflows PM Dashboard | 797608 | Yes | CRM team-specific: execution frequency, failure rates, HubSpot agent |
| Workflow Health Monitoring | 741281 | Yes | System health, anomaly detection |
| Global Chat & Internal Search | 798978 | Yes | Chat adoption, search usage, context awareness |
| Capture Visibility | 798956 | Yes | Bot/desktop/browser/mobile capture success |
| Privacy Determination Agent | 798967 | Yes | Privacy settings, manual toggles, trust metrics |
| CRM Agent Upgrades | 799026 | Yes | HubSpot/Salesforce parity, write success rate |
| Notification Engine | 799040 | Yes | Delivery success, action completion, latency |
| Desktop App Dashboard | 512252 | Yes | Desktop-specific vitals |
| Mobile App Dashboard | 512277 | Yes | Mobile-specific metrics |
| Notetaker Dashboard | 479223 | Yes | Meeting capture metrics |
| Customer Health | 237613 | Yes | General customer health |
| Search | 789990 | Yes | Search usage and effectiveness |
| Settings & Configuration | 789991 | Yes | Workspace/account config activity |
| Q4 Board Metrics | 1172614 | Yes | Executive metrics |
| Q4 Board Weekly Trends | 1172695 | Yes | Weekly growth trajectory |
| Revenue (Stripe) | 237576 | Yes | Stripe data warehouse connector |

### What's Already Tracked Well
- Workflow execution volume and health
- Chat adoption (Global Chat dashboard)
- Capture layer (desktop, bot, browser, mobile)
- Feature flag rollouts
- Revenue/Stripe data

### What's Missing
- **Unified product usage view** across all areas (the empty dashboard)
- **Per-user breakdown** within workflows (who ran what)
- **Per-workspace/company breakdown** that CS can use
- **Activation funnel**: Signup → First login → First meeting → First workflow → Habitual use
- **Role-based filtering**: Rep vs Leader vs RevOps vs CSM activity
- **Workflow type classification**: Meeting summary vs CRM update vs coaching vs custom
- **Engagement quality**: Did they open/read/react to output?

---

## 5. Data Sources — What We Can Track

### PostHog Events (Available Now)

| Event Category      | Examples                                   | Can Filter By                            |
| ------------------- | ------------------------------------------ | ---------------------------------------- |
| **Page views**      | `$pageview` with URL paths                 | User, workspace, page section            |
| **Feature flags**   | `$feature_flag_called`                     | Flag name, variant, user                 |
| **Workflow events** | `workflow_run`, `workflow_created`         | Workflow type, user, workspace, status   |
| **Chat events**     | `chat_created`, `chat_message_sent`        | User, workspace, context type            |
| **Search events**   | `search_query`, `search_result_clicked`    | Query text, result type, user            |
| **CRM events**      | `crm_update_sent`, `hubspot_write`         | Write type, success/failure              |
| **Capture events**  | `recording_started`, `recording_completed` | Platform (bot/desktop/browser), duration |
| **Session events**  | `$session_start`, `$session_end`           | Duration, user, device type              |

### PostHog Properties (Available for Filtering)

| Property | Type | Use Case |
|----------|------|----------|
| `$user_id` / `distinct_id` | Person | Per-user activity |
| Workspace ID (custom property) | Group | Per-company breakdown |
| User role | Person property | Rep vs Leader vs Admin |
| `$device_type` | Event | Mobile vs Desktop |
| `$current_url` | Event | Which pages are visited |
| `$browser` | Event | Platform distribution |

### Postgres DB (via Retool/Direct Query)

Already have the monthly export SQL with:
- `recordings_created` per user/month
- `total_recording_duration_minutes`
- `ai_chats_initiated`
- `workflow_runs_triggered`
- `logins` (first-login only — **gap**: no recurring login tracking)
- User role, team/department, account status

### Key Limitation: What PostHog Events CANNOT Do (Requires DB)
- Join to payment/subscription data
- Access user groups/teams structure
- Get recording duration details
- Distinguish workflow types at a granular level (may need instrumentation)

---

## 6. North Star Metric Framework

### Proposed North Star (from Sam, refined)

> **"Active Workspaces"** = Workspaces with ≥X qualified workflow runs per week, where qualified = non-meeting-summary workflows tied to revenue actions

This already exists conceptually in the North Star & Value Ladder Dashboard (#1123968) as "Workspaces with 3+ workflow runs/week."

### Defining "X" — The Threshold Question

| Approach | Method | Pros | Cons |
|----------|--------|------|------|
| **Median** | 50th percentile of successful/retained accounts | Robust to outliers | Might be too low |
| **Mean** | Average across retained accounts | Easy to understand | Skewed by power users |
| **Distribution analysis** | Find the natural break point between churned vs retained | Most rigorous | Needs clean churn data |
| **Investor benchmark** | 3+ workflows/week (already in dashboard) | Aligns with existing work | May not be validated |

**Recommended approach**: Run a cohort analysis in PostHog comparing accounts that churned vs retained over last 6 months. Find the workflow frequency where retention probability inflects. That's your X.

### Value Ladder (Already Partially Built)

| Tier | Definition | Metric |
|------|-----------|--------|
| **Basic** | Meeting notes only | Recordings captured, summaries generated |
| **CRM** | CRM auto-updates active | HubSpot writes per week |
| **Automation** | Custom workflows running | Workflow runs per week (non-default) |
| **Power** | Multiple agents, custom prompts | Unique workflow types, chat depth |

### Investor-Ready Metrics (Woody's Framework)

| Metric | Definition | Data Source | Status |
|--------|-----------|-------------|--------|
| **DAU/WAU** | Users who review automation output OR have ≥1 workflow write | PostHog + DB | Partially available |
| **Workflows/account/week** | Total qualified workflow runs per workspace | PostHog | Available (needs filtering) |
| **Write rate** | % workflow runs that write to CRM vs read-only | PostHog events | Needs instrumentation |
| **Handoff speed** | Closed/Won → first CS action time | HubSpot + AE data | Manual today |
| **Risk signal lift** | # risk alerts, % acknowledged, % led to intervention | Not tracked | New instrumentation needed |
| **Admin time saved** | Manual CRM updates avoided, net time saved | Estimated | Needs baseline |

---

## 7. Product Area Dashboards

### Dashboard 1: Meetings Page
**Existing coverage**: Notetaker Dashboard (#479223), Capture Visibility (#798956)

| Metric                   | Definition                            | Status            |
| ------------------------ | ------------------------------------- | ----------------- |
| Meetings captured / week | Total recordings completed            | Available         |
| Capture success rate     | Completed / attempted                 | Available         |
| Summary generation rate  | Summaries created / meetings captured | Partially tracked |
| Summary engagement       | Did user click/read/react to summary? | **GAP**           |

%%
For the meetings page, I want to be able to quickly sort between:

- the overall for the company
- by workspace
- by user

For the summary generation rate, this is something that I talked to Sam about. We may actually not have meeting summaries enabled because they're workflows. We should also be checking that, if there are meetings that are private or not, are there actually summaries being generated? If there are not, are people actually clicking into those summaries? The hard thing with this is that summaries are generated by workflows and then they could have different names, different IDs. I want to do a little bit more research into that portion. Also, I think I want to remove the timedist summary. I deleted that, and I'm not as worried either about the platform breakdowns, so I'm removing that as well. I think another thing I might want to look at is if people are doing manual chats, like asking questions on a meeting page, if they're running manual workflows on it (the ones that are grayed out or run workflow), and then if they're reading the transcript or watching the video as well
%%
### Dashboard 2: Workflows Page
**Existing coverage**: Workflows Dashboard (#375268), PM Dashboard (#797608), Health (#741281)

| Metric                     | Definition                                     | Status                          |
| -------------------------- | ---------------------------------------------- | ------------------------------- |
| Workflow runs / week       | Total completed runs                           | Available                       |
| Workflow runs by type      | Meeting prep, CRM update, coaching, custom     | **GAP** — needs classification  |
| Workflow failure rate      | Failed / total attempted                       | Available                       |
| Active workflow builders   | Users who created/edited workflows             | Partially tracked               |
| Workflow output engagement | Clicked through, chatted about, Slack reaction | **GAP**                         |
| Workflow → CRM write rate  | Runs that wrote to HubSpot/Salesforce          | **GAP** — needs instrumentation |
%%
I really like all of the metrics here! It's interesting, though I don't think I'd call it a workflows page. I think it may be called workflow engagement. The reason is that workflows exist on multiple different pages. Instead, I'd want to see where people are engaging with workflow flows the most:

- if it's on a meetings page in the overall chat section
- if it is on a contacts page on a company's page in Slack in HubSpot
- or if they're not at all, and where we might have gaps in that information
%%
### Dashboard 3: Chat / Global Chat
**Existing coverage**: Global Chat & Internal Search (#798978)

| Metric | Definition | Status |
|--------|-----------|--------|
| Chat sessions / week | Total chat conversations initiated | Available |
| Queries per user per day | Average chat interactions | Available |
| Chat context type | Meeting context vs general vs CRM | Partially tracked |
| Chat satisfaction | Thumbs up/down, follow-up questions | **GAP** |
| Time to first useful answer | Query → satisfying response | **GAP** |
| Search → Chat conversion | Users who searched then chatted | Available |
%%
 for chat and global chat, I want to be able to distinguish where those conversations were initiated. For example, if a chat was initiated by a workflow and then you send a message back, how should that count? Separating that between chat sessions per week and then the queries per day, I want to see if people are actually using the prompt library to generate those. If they're using the auto-complete feature.

We don't have a thumbs up/thumbs down follow-up, so instead I want to replace that with an eval section. We would add evals to this and how long it took a user to get, when they started on the site, to get to a place where they actually were able to ask the question. If they navigated away from the page during the load time and how long that load time was 

I also want a part of it to be what tools are enabled, for example, if they have or what tools were used. For example:
- if an internal search was used
- if global chat was used
- if the HubSpot agent was used
- if any composio toolings were used
%%
### Dashboard 4: Search Page
**Existing coverage**: Search Dashboard (#789990)

| Metric | Definition | Status |
|--------|-----------|--------|
| Search queries / day | Total queries | Available |
| Search → click-through | Users who clicked a result | Available |
| Zero-result rate | Queries with no results | Available |
| Repeat search rate | Same user re-querying | Partially tracked |
| Search → action | Search led to workflow/chat/CRM action | **GAP** |

### Dashboard 5: CRM Integration
**Existing coverage**: CRM Agent Upgrades (#799026)

| Metric | Definition | Status |
|--------|-----------|--------|
| CRM writes / week | Total successful writes to HubSpot/Salesforce | Partially available |
| Permission violation rate | Attempted writes blocked by permissions | Available |
| Write success rate | Successful / attempted | Available |
| Fields updated | Which CRM fields are being populated | **GAP** |
| Human override rate | Admin corrections after auto-update | **GAP** |

### Dashboard 6: New Features (Global Chat, Privacy Agent)
**Existing coverage**: Global Chat (#798978), Privacy Agent (#798967)

| Metric | Definition | Status |
|--------|-----------|--------|
| Feature adoption rate | % active users who've used new feature | Available (feature flags) |
| Feature stickiness | DAU/MAU for specific feature | Can be derived |
| Time to adoption | Days from feature launch → first use | Can be derived |
| Feature → value chain | New feature → core workflow completion | **GAP** |

---

## 7a. Product Usage Dashboard — Build Plan

> **Target**: [Product Usage Dashboard #1283083](https://us.posthog.com/project/81505/dashboard/1283083)
> **Phase 1 Focus**: Workflow Engagement + Chat Engagement
> **Approach**: Reuse existing insights where possible, build new ones for gaps, organize by user intent

---

### Section A: Workflow Engagement

> **Framing**: Not "Workflows Page" — workflows exist across meetings, contacts, companies, Slack, and HubSpot. This section answers: **Where are people engaging with workflows, and are those workflows driving value?**

#### A1. What Should Be Visible

| Row | Metric | Purpose | Interaction |
|-----|--------|---------|-------------|
| **Header** | Workflow runs/week (trend line) | Volume pulse — is usage growing? | 12-week trend with week-over-week comparison |
| **Header** | Active workflow builders (unique users) | Creation pulse — are people building, not just consuming? | Bold number with trend arrow |
| **Surface Map** | Workflow engagement by page context | WHERE are workflows triggered from? (meetings, contacts, companies, workflows page, Slack, HubSpot) | Bar chart or pie — reveals surface area gaps |
| **Type Breakdown** | Workflow runs by recipe/type | WHAT types are people using? (meeting prep, CRM update, coaching, custom) | Stacked bar, sorted by volume |
| **Health** | Workflow completion vs failure rate | Are workflows reliable? | Dual trend line (completed vs failed) |
| **Value** | Workflow → CRM write rate | Are workflows producing downstream action? | % metric with trend |
| **Depth** | Workflow output engagement | Did users click through, chat about, or react to workflow output? | Funnel: Run → View → Engage |
| **Leaderboard** | Workflow runs by user × workspace | Who is getting the most value? Power user identification | SQL table (already built) |
| **Leaderboard** | Workflow runs by company | Which accounts are most active? | Bar chart by company (already built) |

#### A2. Existing Insights to Add (from Workflows Dashboard #375268)

| Insight | ID | What It Shows | Modify? |
|---------|----|---------------|---------|
| Workflow Runs - By User | `QM4P2ntO` | Runs per person × workspace (90d) | Remove single-workspace filter for global view |
| Workflow Runs Leaderboard | `H3Fx05IX` | SQL table: name, active, runs, failures, 7d runs, creator, workspace | Use as-is — excellent detail |
| Active Workflows per User | `3xTrcVbQ` | Unique workflow IDs run per person (90d) | Use as-is |
| Workflow Pageviews by User | `IS5YehVx` | Who's viewing workflow pages (not running them) | Use as-is — shows browse-vs-run gap |
| Workflow Runs by Company | `738bPNDJ` | Completed runs grouped by company name (weekly, 90d) | Use as-is |
| Recipe Usage 30/60/90d | `5wh1OctH` | SQL table: recipe name, active/deleted/total workflows per window | Use as-is — answers "what types" question |

#### A3. New Insights to Build

| Insight Name | Type | Definition | Why It Matters |
|-------------|------|-----------|----------------|
| **Workflow Surface Map** | HogQL → Bar Chart | Count `workflows:run_started` events broken down by `$current_url` page context (meetings, contacts, companies, workflows page, other) | Tyler's #1 ask: WHERE are workflows being triggered? |
| **Workflow Completion Rate (Trend)** | Trends | `workflows:run_completed` / `workflows:run_started` over 12 weeks | Reliability signal — if this drops, trust erodes |
| **Workflow → CRM Write Rate** | HogQL | `workflow_runs` joined to CRM write events / total completed runs | **GAP** — needs instrumentation. Check if `crm_update_sent` or `hubspot_write` events exist and can be correlated to `workflow_run_id` |
| **Workflow Output Engagement Funnel** | Funnel | Step 1: `workflows:run_completed` → Step 2: User views output page → Step 3: User takes action (chat, click, Slack reaction) | **GAP** — partially trackable via pageviews on workflow output URLs. Full tracking needs instrumentation for "viewed output" and "engaged with output" |
| **Manual vs Automated Workflow Runs** | HogQL | Distinguish user-triggered runs (click "Run Workflow") from scheduled/automated runs using trigger source property | Solves the "human vs automated" confusion Tyler flagged |

#### A4. Instrumentation Needed

| What | Why | Engineering Ask |
|------|-----|-----------------|
| `workflow_run.trigger_source` property | Distinguish manual click vs scheduled vs meeting-triggered vs API | Add property to `workflows:run_started` event |
| `workflow_output.viewed` event | Track when user actually sees workflow output | Fire on output page load or Slack message view |
| `workflow_output.engaged` event | Track when user acts on output (chat reply, CRM click, copy) | Fire on meaningful interaction with output |
| `workflow_run.crm_write` property | Flag runs that wrote to HubSpot/Salesforce | Add boolean or count to `workflows:run_completed` |

---

### Section B: Chat Engagement

> **Framing**: Distinguishes WHERE chats originate, HOW users interact (prompt library, autocomplete), and whether the AI is performing well (evals, latency, load-time abandonment). Replaces thumbs-up/down with measurable quality signals.

#### B1. What Should Be Visible

| Row | Metric | Purpose | Interaction |
|-----|--------|---------|-------------|
| **Header** | Chat sessions/week (trend) | Volume pulse | 12-week trend line |
| **Header** | Unique chat users/week | Adoption breadth | Bold number with trend |
| **Header** | Avg messages per chat | Engagement depth | Bold number — higher = more useful |
| **Initiation** | Workflow-initiated vs standalone chats | How much chat activity is human vs system? | Pie chart (already built) |
| **Initiation** | Chat initiation by page context | WHERE are users starting chats? (engagement page, customer page, company page, global chat, workflows page) | Bar chart — reveals product surface usage |
| **Input Methods** | Prompt library usage rate | Are people using pre-built prompts or typing from scratch? | % metric: chats started from prompt library / total |
| **Input Methods** | Autocomplete adoption | Are people using autocomplete suggestions? | % metric: messages using autocomplete / total messages |
| **Quality / Evals** | LLM eval scores (when instrumented) | Quality gate — is the AI producing good output? | Score trend over time |
| **Quality / Evals** | Chat response latency distribution | How long does the AI take to respond? | Bucket chart: <5s, 5-10s, 10-30s, 30-60s, >60s (already built) |
| **UX Friction** | Time to first question | From page load to first chat message sent | Histogram — reveals friction in getting started |
| **UX Friction** | Page abandonment during loading | Users who navigated away while waiting for chat response | % metric — reveals load-time pain |
| **UX Friction** | Chat load time distribution | How long does the chat interface take to become interactive? | Percentile chart: p50, p75, p90, p95 |
| **Tools** | Tool usage distribution | Which tools are enabled/used? (Internal Search, HubSpot, Salesforce, Composio, Web Search) | Stacked bar chart (already built) |
| **Tools** | Internal Search adoption rate + trend | Is Internal Search becoming default? | % trend line (already built) |
| **Depth** | Chat engagement depth (message count buckets) | Quick vs medium vs deep conversations | Distribution chart (already built) |
| **Retention** | Return user chat sessions | How many users come back to chat multiple times? | Cohort buckets: 1, 2-3, 4-5, 6-10, 10+ (already built) |
| **By Workspace** | Chat activity by workspace | Which accounts are most active? | SQL table (already built) |

#### B2. Existing Insights to Add (from Global Chat #798978)

| Insight | ID | What It Shows | Modify? |
|---------|----|---------------|---------|
| Chat Summary Stats (7d) | `KV5BjlN9` | Total chats, messages, users, workspaces, avg msg/chat, IS % | Use as-is — perfect header card |
| Weekly Chat Trends (12w) | `VU2riN91` | Week-over-week chats, workspaces, users, IS chats | Use as-is |
| Workflow vs Standalone Chats (7d) | `hg86Yudd` | Pie: workflow-initiated vs standalone | Use as-is — directly answers initiation question |
| Chat Engagement Depth (7d) | `axEMINsU` | Message count distribution per chat | Use as-is |
| Return User Chat Sessions (7d) | `0OIUZmwI` | User return frequency buckets | Use as-is |
| Tool Usage Distribution (30d) | `ewAY6f9A` | Internal Search, HubSpot, Salesforce, Web Search, Workflow tools | Use as-is — directly answers "what tools" |
| Chat Response Latency Proxy (7d) | `V9S4SuKi` | Latency buckets for user→assistant response time | Use as-is — replaces "time to first useful answer" |
| Page Context Distribution (7d) | `Vp0fORzB` | Which pages users are on when starting chats | Enhance: need to map this to chat initiation, not just pageview context |
| Chat Activity by Workspace (7d) | `GzFXr8Sk` | Workspace-level chat activity table | Use as-is |
| Internal Search Adoption Rate (30d) | `zupM4kZP` | % chats with/without Internal Search | Use as-is |
| Internal Search Adoption Trend (30d) | `k2FhmLhv` | Daily IS adoption % | Use as-is |
| Internal Search Quality Proxy (7d) | `LZXMKgRU` | Avg messages per chat: with IS vs without | Use as-is — proxy for "IS makes chats more useful" |
| Chat Volume Overview (30d) | `J9zgyp0k` | Daily chat/message volume, unique workspaces | Use as-is |

#### B3. New Insights to Build

| Insight Name | Type | Definition | Why It Matters |
|-------------|------|-----------|----------------|
| **Chat Initiation Source (Enhanced)** | HogQL → Bar | Break down `chats` by the page URL context at creation time (engagement page, customer/contact page, company page, global chat, workflows page, search page) | Tyler's #1 ask: WHERE are chats starting? Goes beyond current pageview-based proxy. |
| **Prompt Library Usage Rate** | HogQL | Count chats/messages that were initiated using a prompt template vs free-typed | **GAP** — needs instrumentation. Check if `chat_message_sent` has a `source` or `prompt_template_id` property |
| **Autocomplete Adoption Rate** | HogQL | Count messages where user accepted an autocomplete suggestion vs typed manually | **GAP** — needs instrumentation. Requires `autocomplete_accepted` event or property |
| **Time to First Question** | HogQL | `dateDiff('second', session_start, first_chat_message_sent)` per user per session | Measures friction — if this is >60s, users are struggling to find the chat or formulate a question |
| **Page Abandonment During Chat Load** | HogQL | Users who sent a chat message then navigated away before assistant response arrived | **GAP** — needs correlation of `$pageview` events with chat message timestamps. May need `chat_response_loading` event |
| **Chat Load Time Distribution** | HogQL | Time from chat panel open to interactive state | **GAP** — needs `chat_panel_opened` and `chat_panel_ready` events |
| **LLM Eval Scores Trend** | Trends | Aggregate eval scores over time (accuracy, relevance, helpfulness) | **GAP** — needs eval framework instrumented. This replaces the thumbs-up/down metric. |

#### B4. Instrumentation Needed

| What | Why | Engineering Ask |
|------|-----|-----------------|
| `chat_message.source` property | Distinguish prompt library, autocomplete, free-typed | Add `source: "prompt_library" \| "autocomplete" \| "manual"` to message events |
| `chat_message.prompt_template_id` property | Track which prompt templates are used most | Add when message originates from a template |
| `chat_panel.opened` / `chat_panel.ready` events | Measure chat load time and abandonment | Fire when chat UI opens and when it becomes interactive |
| `chat.eval_score` property | Replace thumbs-up/down with structured eval | Add eval scores to `chat` or `chat_message` records (per-message or per-session) |
| `chat.page_context` property | Reliable initiation source on the chat record itself | Add the current page URL/route to the `chats` table at creation time (not just PostHog pageview correlation) |

---

### Section C: Dashboard Layout Plan

The Product Usage Dashboard (#1283083) should be organized top-to-bottom in this order:

```
┌─────────────────────────────────────────────────────┐
│  SECTION HEADER: ⚙️ Workflow Engagement             │
├──────────────────────┬──────────────────────────────┤
│  Workflow Runs/Week  │  Active Workflow Builders     │
│  (12w trend)         │  (bold number + trend)        │
├──────────────────────┴──────────────────────────────┤
│  Workflow Surface Map (by page context)              │
│  (bar chart — WHERE are workflows triggered?)        │
├──────────────────────┬──────────────────────────────┤
│  Workflow Runs by    │  Completion vs Failure Rate   │
│  Recipe/Type (table) │  (dual trend line)            │
├──────────────────────┴──────────────────────────────┤
│  Workflow Runs Leaderboard (SQL table)               │
├──────────────────────┬──────────────────────────────┤
│  Runs by User        │  Runs by Company              │
│  (bar chart)         │  (bar chart)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION HEADER: 💬 Chat Engagement                  │
├──────────────────────┬──────────┬───────────────────┤
│  Chat Sessions/Week  │  Unique  │  Avg Messages     │
│  (12w trend)         │  Users   │  Per Chat         │
├──────────────────────┴──────────┴───────────────────┤
│  Workflow vs Standalone │  Chat Initiation Source    │
│  Chats (pie)            │  by Page Context (bar)     │
├──────────────────────┬──────────────────────────────┤
│  Prompt Library      │  Autocomplete                │
│  Usage Rate (%)      │  Adoption Rate (%)            │
├──────────────────────┴──────────────────────────────┤
│  Tool Usage Distribution (stacked bar)               │
│  Internal Search Adoption Rate + Trend               │
├──────────────────────┬──────────────────────────────┤
│  Chat Response       │  Time to First Question       │
│  Latency (buckets)   │  (histogram)                  │
├──────────────────────┴──────────────────────────────┤
│  Chat Engagement Depth │  Return User Sessions       │
│  (distribution)        │  (cohort buckets)            │
├─────────────────────────────────────────────────────┤
│  Chat Activity by Workspace (SQL table)              │
└─────────────────────────────────────────────────────┘
```

### Section D: Action Plan — What to Do First

#### Immediate (Can do now — no instrumentation needed)
1. Add existing Workflow insights from #375268 to Product Usage Dashboard #1283083
2. Add existing Chat insights from #798978 to Product Usage Dashboard #1283083
3. Build "Workflow Surface Map" insight (uses existing `workflows:run_started` + `$current_url`)
4. Build "Chat Initiation Source" enhanced insight (uses existing `chats` table + correlation)
5. Build "Workflow Completion Rate Trend" (uses existing `run_started` / `run_completed` events)
6. Build "Manual vs Automated Workflow Runs" (check if trigger source property already exists)

#### Short-term (Needs engineering — 1-2 sprints)
7. Instrument `chat_message.source` for prompt library / autocomplete tracking
8. Instrument `workflow_run.trigger_source` for manual vs automated
9. Instrument `chat.page_context` as a first-class property on the chat record
10. Add `chat_panel.opened` / `chat_panel.ready` for load time + abandonment

#### Medium-term (Needs design + engineering — 2-4 sprints)
11. LLM eval framework (replaces thumbs-up/down)
12. Workflow output engagement tracking (viewed, clicked, acted)
13. Workflow → CRM write rate correlation
14. Page abandonment during chat loading detection

---

### Section E: Execution Log (2026-02-16)

> Completed by PM Copilot. Dashboard #1283083 now has **29 insights** across Workflow Engagement and Chat Engagement sections.

#### Insights Added to Dashboard #1283083

| # | Insight | PostHog ID | Method | Status |
|---|---------|-----------|--------|--------|
| A1 | Workflow Runs / Week (12w Trend) | [`h4wbsulU`](https://us.posthog.com/project/81505/insights/h4wbsulU) | EVENT | Built new |
| A2 | Active Workflow Builders (12w) | [`EZCxP95o`](https://us.posthog.com/project/81505/insights/EZCxP95o) | DB | Built new |
| A3 | Workflow Surface Map — Trigger Context | [`Hbwufphu`](https://us.posthog.com/project/81505/insights/Hbwufphu) | HOGQL | Built new (partial) |
| A4 | Recipe Usage 30/60/90d | `5wh1OctH` | REUSE | From #375268 |
| A5 | Workflow Completion vs Failure (12w) | [`mgkPj1wm`](https://us.posthog.com/project/81505/insights/mgkPj1wm) | EVENT | Built new |
| A6 | CRM-Connected Workflow Activity (Proxy) | [`vyOblkyS`](https://us.posthog.com/project/81505/insights/vyOblkyS) | HOGQL | Built proxy |
| A7 | Workflow vs Standalone Chat Depth | [`0PSt1UCR`](https://us.posthog.com/project/81505/insights/0PSt1UCR) | DB | Built proxy for output engagement |
| A8 | Manual vs Automated Runs | [`zCS16mQe`](https://us.posthog.com/project/81505/insights/zCS16mQe) | HOGQL | Built new |
| A9 | Workflow Runs by User x Workspace | `QM4P2ntO` | REUSE | From #375268 |
| A10 | Workflow Runs Leaderboard | `H3Fx05IX` | REUSE | From #375268 |
| A11 | Workflow Runs by Company | `738bPNDJ` | REUSE | From #375268 |
| A12 | Active Workflows per User | `3xTrcVbQ` | REUSE | From #375268 |
| -- | Workflow Pageviews by User | `IS5YehVx` | REUSE | From #375268 |
| B1 | Weekly Chat Trends (12w) | `VU2riN91` | REUSE | From #798978 |
| B2 | Chat Summary Stats (7d) | `KV5BjlN9` | REUSE | From #798978 |
| B3 | Chat Volume Overview (30d) | `J9zgyp0k` | REUSE | From #798978 |
| B4 | Workflow vs Standalone Chats | `hg86Yudd` | REUSE | From #798978 |
| B5 | Chat Initiation Source | [`0VImsaRh`](https://us.posthog.com/project/81505/insights/0VImsaRh) | HOGQL | Built new |
| B6 | Chat Initiation by Page Context | [`38qf0h6Y`](https://us.posthog.com/project/81505/insights/38qf0h6Y) | HOGQL | Built new |
| B10 | Chat Response Latency Proxy | `V9S4SuKi` | REUSE | From #798978 |
| B12 | Slow Response Detection — Abandonment Proxy | [`OOBe4uv2`](https://us.posthog.com/project/81505/insights/OOBe4uv2) | DB | Built proxy |
| B14 | Tool Usage Distribution | `ewAY6f9A` | REUSE | From #798978 |
| B15 | Internal Search Adoption Rate | `zupM4kZP` | REUSE | From #798978 |
| B16 | Internal Search Adoption Trend | `k2FhmLhv` | REUSE | From #798978 |
| B17 | Internal Search Quality Proxy | `LZXMKgRU` | REUSE | From #798978 |
| B18 | Chat Engagement Depth | `axEMINsU` | REUSE | From #798978 |
| B19 | Return User Chat Sessions | `0OIUZmwI` | REUSE | From #798978 |
| B20 | Chat Activity by Workspace | `GzFXr8Sk` | REUSE | From #798978 |
| -- | Page Context Distribution (Pageviews) | `Vp0fORzB` | REUSE | From #798978 |

#### Key Data Findings During Build

1. **Workflow events are server-side** — `workflows:run_started` has NO `$current_url`. Surface mapping relies on `payload` property (contains `meetingId` or `calendarEventId`).
2. **53% of workflow runs are automated** (meeting/calendar triggered), 47% are manual/other.
3. **61% of global chat opens are `workflow-auto-open`** — most chat engagement is workflow-driven, not user-initiated.
4. **Chat creation page context**: Workflow Detail pages (61%), Engagements (16%), Search (15%), Company (5%), Chats Page (2%).
5. **97 active workflow builders** in the last 7 days.
6. **99.6% of chat responses arrive in <5 seconds**. Only 0.31% (349 chats) exceed 60 seconds.
7. **2,332 abandoned chats** (0 messages) in 7 days — 912 workflow-initiated, 1,420 standalone.

#### Instrumentation Tickets to File (Linear — EPD Team)

These are the 5 gaps that prevent building the remaining insights. File as Linear issues in EPD/Product team.

**Ticket 1: LLM Eval Framework** (High Priority — Multi-Sprint)
- **Title**: Implement LLM evaluation scoring for chat quality
- **Description**: Replace thumbs-up/down with structured eval scores. Options: (a) Automated per-message eval via LLM judge, (b) Per-session quality score, (c) Thumbs-up/down as interim step 1.
- **Events needed**: `chat.eval_score` property on chat records, or `chat_eval_completed` event with `score`, `rubric_version`, `chat_id`
- **Unlocks**: B9 LLM Eval Scores Trend insight

**Ticket 2: Workflow Trigger Source Property** (High Priority — 1 Sprint)
- **Title**: Add `trigger_source` property to `workflows:run_started` event
- **Description**: Currently cannot distinguish manual click vs scheduled vs meeting-triggered vs API-triggered workflow runs at the event level. Add `trigger_source` enum: `manual_click`, `meeting_trigger`, `calendar_trigger`, `scheduled`, `api`.
- **Also add**: `trigger_page` (URL where the user was when they triggered it, for manual runs)
- **Unlocks**: Full A3 Workflow Surface Map, improved A8 Manual vs Automated

**Ticket 3: Chat Input Source Tracking** (Medium Priority — 1 Sprint)
- **Title**: Track prompt library and autocomplete usage on chat messages
- **Description**: Add `source` property to `chat_created` or `chat_message` events. Values: `prompt_library`, `autocomplete`, `manual`. When source is `prompt_library`, also include `prompt_template_id`.
- **Unlocks**: B7 Prompt Library Usage Rate, B8 Autocomplete Adoption Rate

**Ticket 4: Workflow Output Engagement Events** (Medium Priority — 1 Sprint)
- **Title**: Track when users view and engage with workflow output
- **Description**: Fire `workflow_output:viewed` when user sees output (page load or Slack view), `workflow_output:engaged` when they interact (chat reply, CRM click, copy). Include `workflow_run_id`.
- **Also add**: `crm_write_completed` event with `workflow_run_id`, `crm_type`, `fields_written`, `success`
- **Unlocks**: Full A6 CRM Write Rate, A7 Output Engagement Funnel

**Ticket 5: Chat Panel Load Timing** (Low Priority — 0.5 Sprint)
- **Title**: Add chat panel load time instrumentation
- **Description**: Fire `chat_panel:opened` when user clicks to open chat and `chat_panel:ready` when chat UI is interactive. The delta = perceived load time. Also enables detecting page abandonment during chat loading.
- **Unlocks**: B11 Time to First Question (precise), B12 Page Abandonment, B13 Chat Load Time Distribution

---

## 8. Open Questions & Decision Log

### Must Decide

| Question                                          | Options                                                                                | Stakeholder          | Status                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------- |
| What counts as "active user"?                     | (a) Any login (b) Review automation output (c) ≥1 workflow run (d) Investor definition | Sam, Woody, Tyler    | Sam proposed ≥X workflows/week                  |
| Should meeting summaries count toward North Star? | (a) Yes, all workflows (b) No, only revenue-tied (c) Weight differently                | Sam                  | Sam leans toward excluding basic summaries      |
| Median vs mean vs distribution for threshold X?   | See [[#Defining "X"]]                                                                  | Tyler, Dylan         | Recommend distribution analysis                 |
| Per-user vs per-workspace granularity?            | (a) User-level (b) Workspace aggregates (c) Both                                       | Privacy team, Tyler  | Start workspace, add user with privacy controls |
| PostHog vs Retool for dashboard home?             | (a) PostHog dashboards (b) Retool SQL dashboards (c) In-product (Kaden's project)      | Tyler, Kaden, Hayden | PostHog for now, in-product long-term           |

### Open Investigation

| Question                                                            | Owner          | Due            |
| ------------------------------------------------------------------- | -------------- | -------------- |
| What PostHog events exist per workspace? Map complete event catalog | Tyler + Hayden | ASAP           |
| Why is PostHog data "dirty"? Identify specific data quality issues  | Tyler + Dylan  | This week      |
| Can we distinguish human chats from workflow-triggered chats?       | Engineering    | This sprint    |
| What Slack engagement data can we capture? (reactions, reads)       | Tyler          | Investigate    |
| Mobile experience audit — what's broken?                            | Tyler + Skylar | This week      |
| How does Kaden's hackathon project overlap with this plan?          | Tyler + Kaden  | Sync this week |

---

## 9. Implementation Roadmap

### Phase 1: Foundation (This Week)
**Goal**: One metric on the Product Usage Dashboard for Tuesday all-hands

- [ ] Run PostHog query: Weekly active workspaces with ≥3 workflow runs
- [ ] Add trend line to dashboard #1283083
- [ ] Pull current DAU/WAU numbers
- [ ] Create "activation funnel" insight: Signup → First login → First workflow

### Phase 2: Instrument & Clean (Next 2 Weeks)
**Goal**: Fill the Product Usage Dashboard with 8-10 core insights

- [ ] Partner with Hayden to audit PostHog event quality
- [ ] Add workflow type classification to events (meeting prep vs CRM update vs custom)
- [ ] Separate human chat vs workflow-triggered activity
- [ ] Add per-workspace group analytics in PostHog
- [ ] Create role-based person properties (rep, leader, admin, revops)

### Phase 3: Product Area Dashboards (Weeks 3-4)
**Goal**: One dashboard per product area with the metrics from [[#7. Product Area Dashboards]]

- [ ] Meetings dashboard with capture + engagement metrics
- [ ] Workflows dashboard with type breakdown + value attribution
- [ ] Chat dashboard with quality signals
- [ ] CRM dashboard with write rate + human override tracking
- [ ] New features dashboard (Global Chat, Privacy Agent adoption)

### Phase 4: North Star & Investor Readiness (Weeks 4-6)
**Goal**: Cohort analysis to validate X threshold, investor-ready metrics

- [ ] Run retention cohort analysis (churned vs retained by workflow frequency)
- [ ] Define and validate the X threshold
- [ ] Build investor dashboard with Speed / Pervasiveness / Velocity
- [ ] Create engagement quadrant analysis (Woody's framework)
- [ ] Establish automated alerting for accounts below threshold

### Phase 5: In-Product & Customer-Facing (Future)
**Goal**: Usage metrics visible to customers and CS

- [ ] Expand Kaden's hackathon project into production feature
- [ ] Build per-client health scores for CS team
- [ ] Create ROI cards for renewal conversations
- [ ] API surface for agency dashboard use cases

---

## 10. Appendix — Raw SQL & Event Catalog

### Monthly User Activity Export

The existing SQL query (saved at `pm-workspace-docs/status/posthog/monthly-user-activity-export.sql`) provides:

```
SELECT user_id, month, recordings_created, total_recording_duration_minutes,
       logins, ai_chats_initiated, workflow_runs_triggered
FROM base_users CROSS JOIN months
LEFT JOIN recording_metrics, chat_metrics, workflow_metrics, login_metrics
```

**Limitations noted**:
- Logins = first-login only (not recurring)
- License dates = workspace-level proxies from payment_subscriptions
- Team/department from user_groups (users may belong to multiple)

### Relevant Linear Issues

| Issue | Title | Status |
|-------|-------|--------|
| ASK-4934 | HubSpot CRM agent analytics instrumentation + PostHog insights | In Code Review |
| EPD-1361 | Instrument PostHog for HubSpot workflow usage | Backlog |
| ASK-4721 | Collect metrics for Global Chat | Done |
| ASK-4595 | Otel graphql / resolver metrics | Done |
| ASK-4634 | Fix usages of old 'use-analytics' and add linting rule | Backlog |
| ASK-5040 | Global Chat Launch — Pre-launch work | In Progress |

### Notion Reference

- [PRD: Internal Product Dashboard](https://www.notion.so/ask-elephant/PRD-Internal-Product-Dashboard-309f79b2c8ac80788fc9d501190e932d)
- [Product Strategy + All-Hands Story (Draft)](https://www.notion.so/ask-elephant/Product-Strategy-All-Hands-Story-Draft-306f79b2c8ac8099ab4ed53bbf11e8ae)
- [Global Chat & Internal Search](https://www.notion.so/ask-elephant/Global-Chat-Internal-Search-2c0f79b2c8ac81998b42c3e9126cac78)

### PostHog Links

- [Product Usage Dashboard (EMPTY — Target)](https://us.posthog.com/project/81505/dashboard/1283083)
- [North Star & Value Ladder Dashboard](https://us.posthog.com/project/81505/dashboard/1123968)
- [Company Health & Usage Dashboard](https://us.posthog.com/project/81505/dashboard/1122947)

---

## Related Notes

- [[client-usage-metrics]] — PM workspace initiative
- [[product-vision]] — AskElephant product vision
- [[strategic-guardrails]] — Decision framework

---

*Generated: 2026-02-16 from PostHog audit, Slack conversation analysis, Council of Product transcript, and existing PM workspace research.*
