# Gap Analysis: AskElephant vs. Gong Dashboard Capabilities

> **Last updated:** 2026-03-01
> **Owner:** Tyler Sahagun
> **Purpose:** Identify exactly where we're losing, where we're winning, and where we can leapfrog

---

## TL;DR

AskElephant has **zero user-facing analytics** while Gong has a comprehensive dashboard suite. But the gap analysis reveals something important: **we're not actually behind on data — we're behind on visibility.** AskElephant already captures the conversation data, CRM actions, workflow execution, and cross-system activity needed to power dashboards that match or exceed Gong's. The real gap is an aggregation and presentation layer. And in several categories — automation outcomes, cross-system intelligence, CRM impact — we have data Gong doesn't have at all.

---

## Section 1: What Gong Has That We Don't

### 🔴 Critical Gaps (Directly Losing Deals)

These are capabilities where the absence is directly cited in competitive losses and churn analyses.

| Gap | Gong Capability | Impact on AskElephant | Evidence |
|-----|----------------|----------------------|----------|
| **Team performance dashboard** | Pre-built Team Insights view with activity metrics, talk ratios, question rates per rep | Managers can't compare reps or identify coaching needs. The #1 thing a sales leader looks for. | Woody: "I don't know what question to ask on how to help my team convert more deals" |
| **Talk-to-listen ratio analytics** | Real-time talk ratio per rep with team benchmark (optimal 43:57) | Reps can't self-coach on the most basic conversation metric. Managers have no coaching data. | Industry standard metric — absence signals immaturity |
| **Pipeline/deal visibility** | Deal Board with AI risk flags, conversation enrichment per deal | Despite CRM integration, no pipeline view in AskElephant. Users must switch to HubSpot to see pipeline. | Mobly: "My team mentioned they've liked having Gong calls show up in the lead record" |
| **Any user-facing analytics** | 6 pre-built dashboards + custom builder | AskElephant has zero analytics surfaces. Prospects immediately see this gap in evaluation. | Dental Intel churn: "if Gong and AskE are essentially the same platform we hedge bets on the established one" |

### 🟠 Important Gaps (Weakening Value Perception)

These capabilities aren't directly cited in losses but significantly affect how teams perceive and use the product.

| Gap | Gong Capability | Impact on AskElephant | Priority |
|-----|----------------|----------------------|----------|
| **Coaching scorecards** | Manager-defined scorecards with AI suggestions, scoring trends | No structured coaching workflow. Managers review calls ad-hoc with no scoring system. | High — Avoma is also raising the bar here with AI-automated scoring |
| **Competitive intelligence tracking** | Smart Trackers detect competitor mentions, auto-aggregate | Despite hearing competitors in calls, no automated tracking or aggregation. | High — leadership explicitly asked for this (Woody quote about competitors) |
| **Question rate analytics** | Per-rep question frequency with team benchmarks | Reps can't see if they're asking enough questions. Key coaching metric missing. | High — pairs with talk ratio as core coaching data |
| **Topic/theme detection** | Smart Trackers identify themes, pain points, goals across calls | No automated theme extraction across calls. Each call analyzed independently. | Medium — Universal Signal Tables will address this differently (ad-hoc vs. automatic) |
| **Activity metrics** | Call volume, duration, email cadence, customer engagement per rep | No per-rep activity tracking. Can't answer "how many calls did Sarah have this week?" | High — basic activity visibility expected by all managers |
| **Dashboard sharing/export** | Publish dashboards, invite viewers, export data | No dashboards exist to share. | Comes with building dashboards |

### 🟡 Nice-to-Have Gaps (Gong Has, But Not Essential)

| Gap | Gong Capability | AskElephant Strategy |
|-----|----------------|---------------------|
| **Forecast analytics** | AI-powered forecasting with 300+ conversation signals | Gong's own forecast is rated 4/10. Don't compete here — Clari owns forecasting. Focus on pipeline visibility instead. |
| **Custom dashboard builder** | RevOps can build custom charts, KPIs, widgets from scratch | Important for retention but not day-1. Ship pre-built dashboards first, custom builder in V2. |
| **Economic Pulse dashboard** | Macro-economic impact on pipeline from conversation signals | Novel but niche. Low priority. |
| **Configurable forecast boards** | Column-by-column forecast customization | Irrelevant until we have forecast capability. |
| **Smart Tracker maintenance** | Keyword/example-based topic detection requiring training data | We should solve this differently — AI-native detection without training data. |

---

## Section 2: What AskElephant Has That Gong Doesn't

These are genuine advantages that can make our dashboards not just match Gong but leapfrog them.

### 🟢 Unique Advantages (No Competitor Has These)

| Advantage | What We Have | Dashboard Opportunity | Competitive Moat |
|-----------|-------------|----------------------|-----------------|
| **Automation outcome visibility** | Every CRM record updated, deal created, contact enriched, email processed is logged. Gong shows what happened in calls — we show what happened AFTER calls. | Hero dashboard: "AskElephant created 47 CRM records, updated 128 deal properties, and processed 89 emails this month" | **Category-creating.** No meeting intelligence tool shows post-call automation outcomes. This is our answer to "what did AskElephant actually do for me?" |
| **Cross-system intelligence** | Data from HubSpot + Slack + Email + Meetings in one platform. Gong only has calls + CRM. | Unified dashboard combining meeting insights with email patterns, Slack engagement, and CRM activity | **Structural advantage.** Gong would need to build Slack/email integration from scratch. We already have it. |
| **Workflow execution data** | Every workflow run is logged — what triggered it, what it did, whether it succeeded or failed, what needs approval. | Automation health dashboard: success rates, failure patterns, approval queue, time saved | **Unique to our agent architecture.** Gong doesn't have configurable workflows, so they can't show execution data. |
| **CRM data quality metrics** | We know which fields we filled, what was empty before, what the accuracy was. | Data quality dashboard: "CRM field fill rate improved from 34% to 87% since using AskElephant" | **Powerful for RevOps.** This is the quantified ROI proof that justifies the platform. |
| **Zero-config analytics** | Our data is native — no 3-6 month implementation, no training examples for trackers. | Works from day one. First meeting recorded = first dashboard populated. | **Time-to-value advantage.** Gong's 3-6 month implementation is their #1 G2 complaint. |
| **Pricing accessibility** | Our per-seat cost is a fraction of Gong's $100-200/user/month + platform fee. | Dashboards as part of existing pricing, not an add-on. | **Mid-market competitive advantage.** Teams that can't afford Gong CAN afford us. |

### 🔵 Existing Data That Could Power Dashboards (Available But Not Surfaced)

| Data We Already Have | How It Could Be Surfaced | Gong Equivalent | Our Advantage |
|---------------------|-------------------------|-----------------|--------------|
| Call duration per speaker | Talk-to-listen ratio per rep | Gong Team Insights talk ratio | Same metric, different source |
| Questions detected in transcripts | Question rate per rep with trend | Gong question rate analytics | Same metric, could enhance with AI classification |
| Topic/entity extraction from summaries | Topic frequency dashboard, competitive mentions | Gong Smart Trackers | AI-native detection vs. Gong's training-example-based approach |
| CRM deal data via HubSpot | Pipeline view with conversation enrichment | Gong Deal Board | We add automation context (what we DID to the deal) |
| Meeting frequency per user | Activity metrics dashboard | Gong activity metrics | Same data, different presentation |
| Action items generated per meeting | Action item completion dashboard | No Gong equivalent | Unique metric showing AI → action conversion |
| Workflow success/failure rates | Automation health dashboard | No Gong equivalent | Unique — shows system reliability |
| Email read/sent/analyzed counts | Communication activity dashboard | No Gong equivalent (calls only) | Broader scope — emails + meetings + Slack |

---

## Section 3: The Strategic Positioning

### Don't Play Gong's Game — Play Ours

**The wrong strategy:** Build feature-for-feature Gong parity (dashboards that show the same call metrics in the same way).

**The right strategy:** Build dashboards that answer the question only we can answer: **"What did AskElephant actually do for you?"**

Gong's dashboards answer: "How is my team performing on calls?"
Our dashboards should answer: "How is AskElephant driving revenue outcomes for my team?"

### The Three-Layer Dashboard Strategy

**Layer 1: Table Stakes (Match Gong)**
Conversation metrics that every meeting intelligence buyer expects: talk ratios, question rates, activity metrics, team comparison. These prevent competitive disqualification.

**Layer 2: Intelligence (Match + Enhance)**
Pipeline views, coaching insights, competitive tracking. Match Gong's patterns but enhance with automation context — every deal shows not just what was said, but what AskElephant did about it.

**Layer 3: Automation Intelligence (Leapfrog — Only We Can Do This)**
Automation outcomes, cross-system impact, CRM quality improvement, workflow health. This is the category we create. No competitor can show "AskElephant updated 128 deal properties this month with 94% accuracy" because no competitor has configurable post-call automation.

### The "Invisible to Visible" Narrative

The core message for our dashboards:

> "AskElephant has been working for you in the background. Now you can see exactly what it's doing — and how it's driving your revenue outcomes."

This turns the current weakness (invisible automation) into a strength (visible, quantified, trustworthy automation with a dashboard to prove it).

---

## Section 4: Relationship to Existing Initiatives

| Existing Initiative | Dashboard Overlap | Recommended Integration |
|--------------------|-------------------|------------------------|
| **Universal Signal Tables** | Ad-hoc exploration of call data (leader analytics) | Signal Tables = custom/exploratory analytics. Dashboards = pre-built, daily-use views. Complementary, not overlapping. Signal Tables could be the "custom builder" for V2. |
| **Client Usage Metrics / By The Numbers** | CS-facing workspace health (internal dashboard) | By The Numbers = admin/CS view of workspace health. Dashboards = user/manager views of performance and automation impact. Different personas, shared data layer. The Bento visual language can be reused. |
| **Agent Command Center** | Daily activity hub (agent visibility) | Command Center = real-time activity feed (what agents are doing now). Dashboards = aggregate analytics (what happened over time). Command Center is the "today" view; Dashboards are the "trend" view. |
| **Chief of Staff Experience** | Meeting artifacts and daily brief | Chief of Staff = individual meeting consumption. Dashboards = cross-meeting aggregate intelligence. Chief of Staff feeds data into dashboards. |
| **Automation Beats Gong Hypothesis** | Competitive positioning | Dashboards are the concrete product expression of this hypothesis. If automation is our differentiation, dashboards make that differentiation visible. |

**Recommendation:** Create a new dashboard initiative that synthesizes insights from all related initiatives but has its own scope. Don't try to retrofit dashboards into existing initiatives — they serve different personas and use cases.

---

## Section 5: Data Availability Assessment

| Required Data | Status | Source | Engineering Effort |
|--------------|--------|--------|-------------------|
| Talk duration per speaker | Likely available | Transcript/audio analysis | Low — extraction from existing data |
| Question detection | Likely available | Transcript NLP | Low-Medium — may need new extraction |
| Meeting count per user | Available | Meeting records | Low — query existing data |
| CRM records created/updated | Available | Workflow execution logs | Low — already logged |
| Workflow execution count | Available | Agent execution logs | Low — already logged |
| Email processed count | Available | Email agent logs | Low — already logged |
| Slack messages processed | Available | Slack agent logs | Low — already logged |
| Topic/theme detection | Partially available | Summary extraction | Medium — need aggregation layer |
| Competitor mentions | Not currently extracted | Needs new extraction | Medium — NLP/AI extraction from transcripts |
| Deal pipeline data | Available via CRM | HubSpot API | Low — already integrated |
| Action item completion | Partially available | Action item tracking | Medium — need completion state tracking |
| Coaching scorecard data | Not available | Needs new feature | High — new feature entirely |

**Key insight:** ~70% of the data needed for V1 dashboards already exists in our backend. The engineering effort is primarily aggregation and presentation, not new data collection.

---

_Last updated: 2026-03-01_
_Owner: Tyler Sahagun_
