# Client Usage Metrics - Research

> Last updated: 2026-02-08
> Analyst: Tyler Sahagun (PM Workspace)

---

## TL;DR

AskElephant has a critical blind spot: **we cannot see per-client usage metrics** in a way that empowers CSMs, sales leaders, and RevOps to act on adoption health. Multiple churn analyses reveal "Usage Data Blind Spot" as a recurring root cause of silent churn, and Sam Ho's PostHog analysis shows 77% of seat licenses are NOT_INVITED with only 15.5% DAU utilization. The business case is clear: without client-specific usage visibility, CS cannot intervene before churn, sales cannot prove ROI, and leadership cannot identify expansion opportunities.

---

## Primary Job-to-Be-Done

**When** a CSM or sales leader is managing their book of business,
**they want to** quickly see which clients are actively using AskElephant and which are disengaging,
**so that** they can intervene before churn, demonstrate ROI at renewal, and identify expansion opportunities.

---

## Evidence & Sources

### Source 1: Sam Ho PostHog Analysis (#council-of-product, Jan 24, 2026)

Sam shared platform-wide utilization data that reveals the scale of the adoption problem:

> "Likely most of the value (85%) comes from non-UX usage. In that case the question on strategy should be: 1. Improving this platform usage, making sure it works 2. Understanding why they don't use the platform"

**Key metrics from PostHog:**

- **Total seat licenses:** 24,059 users
- **DAU utilization:** 15.5% (3,723 users)
- **WAU utilization:** 48.8% (11,733 users)
- **NOT_INVITED:** 77% of seat licenses (18,524 users never accepted invites)

Sam's conclusion: _"We are a little heavy on building cool new UX features for the small fraction of users actively using the UX."_

**Strategic implication:** We need per-client visibility into these metrics, not just platform-wide aggregates. CSMs need to see which specific clients have adoption gaps.

### Source 2: Churn Analyses — Recurring "Usage Data Blind Spot" (#churn-alert)

Multiple churn retrospectives explicitly call out missing usage data:

**Eddy churn analysis:**

> "Usage Data Blind Spot — Implement automated usage dashboard (HubSpot property sync) by week 1 post-close: Daily active users, feature usage, support ticket volume. Red flag: <50% of licensed users active for 14+ days."

**Cobalt churn analysis:**

> "No usage data captured — Cannot confirm adoption gap vs. budget-driven churn."
> "Ryan's team 'hasn't been able to use it at all' due to integration issues."

**B2B Catalyst churn analysis:**

> "No Usage Telemetry / Adoption Tracking — Trial workspace provisioning status, login activity, and feature adoption were never tracked; customer went dark without alerting CSM/AE."
> Recommended: "Implement trial dashboard with login, feature adoption, and engagement alerts; trigger CSM outreach if trial user has not logged in within 72 hours of provisioning."

**Joyned Dental churn analysis:**

> "No CSM assigned or engaged. Single onboarding kickoff with 7-month radio silence = textbook churn pattern. No value realization tracked."

### Source 3: Business Bricks Customer Feedback (#voice-of-the-customer, Jan 28, 2026)

Cam Thunell (RevOps/Workflow Builder):

> "I don't have anything inside of AskElephant that helps me aggregate that information, figure out what somebody's average is over the last week, over the last month. I can't figure out if they're getting better, getting worse in certain areas or overall. It's just like, I have a lot of really good information that I'm not doing anything with."

**Impact:** High — Scorecard data becomes siloed and unusable for coaching without aggregation.

### Source 4: Closed-Won Retrospectives — Usage Metrics as Expansion Lever

**Hive Strategy win ($5,399 ACV):**

> "A structured follow-up cadence—focused on usage metrics, new workflow opportunities, and partner development—could unlock significant expansion."

**SchoolAI expansion:**

> "Rachel's team was building a customer intelligence dashboard in Notion and needed reliable data signals to power it—churn detection, expansion alerts, and performance metrics."

**n2uitive win ($2,376 ACV):**

> "Anchor on quantified operational pain, not product capabilities." — This applies to our own CS team: they need quantified usage data to have outcome conversations.

### Source 5: Linear Issues — Engineering Groundwork

- **ASK-4934:** "HubSpot CRM agent analytics instrumentation + PostHog insights" (In Code Review)
- **EPD-1361:** "Instrument PostHog for HubSpot workflow usage" (Backlog)
- **ASK-4721:** "Collect metrics" for Global Chat (Done)
- **ASK-4595:** "Otel graphql / resolver metrics" (Done)
- **ASK-4634:** "Fix usages of old 'use-analytics' and add linting rule" (Backlog)

Engineering is already investing in instrumentation — the missing piece is a client-facing/internal-facing aggregation layer.

### Source 6: Agency Dashboard API Request (Customer Quote, Feb 11, 2026)

Customer requested API documentation and a way to embed AI-generated recent meeting summaries, sentiment, and trends into an external agency dashboard.

> "Where can I find API documentation? I'm exploring building some integration into an agency dashboard we want to build that would ideally pull in some brief AI-generated overview of recent meetings broken out by client, show sentiment, trends, and some other qualitative data I think we could pull out of AskElephant"

**Strategic implication:** This extends the usage metrics initiative from internal visibility to externalized intelligence delivery. It reinforces the need for account-scoped summary payloads, trend/sentiment APIs, and defensible confidence/provenance metadata.

---

## User Breakdown & Quantitative Context

### Primary Personas

| Persona               | Need                                                  | Frequency      | Impact                               |
| --------------------- | ----------------------------------------------------- | -------------- | ------------------------------------ |
| **CSM**               | See which clients are at risk based on usage patterns | Daily          | High — Prevents silent churn         |
| **Sales Leader**      | Prove ROI at renewal/expansion using usage data       | Weekly/Monthly | High — Drives expansion revenue      |
| **RevOps**            | Automate health scoring based on usage signals        | Ongoing        | Medium — Enables systematic approach |
| **Account Executive** | Reference client usage during sales cycle             | Per-deal       | Medium — Accelerates close           |

### Current State (Pain)

1. **CSMs are blind:** No dashboard showing per-client usage. They rely on anecdotal check-ins or wait for churn signals.
2. **Churn is silent:** 7-month engagement gaps go unnoticed (Joyned Dental, B2B Catalyst patterns).
3. **ROI conversations are weak:** Cannot quantify "your team saved X hours" or "Y calls were captured" per client.
4. **Expansion is guesswork:** No data-driven signal for when a client is ready to add seats or features.
5. **77% of seats are NOT_INVITED:** Massive activation gap with no per-client visibility.

### Desired State (Gain)

1. **CSMs have a health dashboard:** Per-client usage metrics (DAU, WAU, feature adoption, workflow triggers) visible at a glance.
2. **Automated risk alerts:** Trigger when usage drops below threshold (e.g., <50% of licensed users active for 14+ days).
3. **ROI cards:** Quantified value statements per client for renewal conversations.
4. **Expansion signals:** Data-driven identification of clients ready to add seats/features.
5. **Activation tracking:** Per-client invite acceptance and onboarding milestone visibility.
6. **Embedded intelligence for partners:** Agencies and RevOps teams can pull account-level AI summaries and trend/sentiment signals into their own dashboards.

---

## Strategic Alignment

### Outcome Chain

```
Client Usage Metrics dashboard enables CSMs to see per-client adoption health
  → so that CSMs can proactively intervene before usage drops to churn-level
    → so that silent churn is prevented and adoption gaps are closed
      → so that NRR improves and expansion conversations are data-driven
        → so that revenue outcomes are delivered (retention + expansion)
```

### Pillar Alignment

| Pillar               | Score | Rationale                                                                                |
| -------------------- | ----- | ---------------------------------------------------------------------------------------- |
| **Customer Trust**   | 5/5   | Transparency into usage builds trust with clients; CS can have data-driven conversations |
| **Data Knowledge**   | 5/5   | Structured insights from existing data (PostHog, platform telemetry)                     |
| **Trend Visibility** | 4/5   | Usage trends over time enable coaching and performance insights                          |

### Strategic Fit Score: 27/30 (Strong alignment, proceed)

| Dimension           | Score | Notes                                                           |
| ------------------- | ----- | --------------------------------------------------------------- |
| Trust Foundation    | 4/5   | Improves transparency; clients can see their own value          |
| Outcome Orientation | 5/5   | Direct tie to retention, expansion, NRR                         |
| Human Empowerment   | 5/5   | CSMs + leaders make better decisions with data                  |
| Data Capture        | 4/5   | Aggregates existing telemetry into actionable views             |
| Differentiation     | 4/5   | Most competitors don't expose client-specific usage to CS teams |
| Expansion Driver    | 5/5   | Directly identifies expansion opportunities                     |

---

## Competitive Context

- **Gong:** Has "Gong Reality" analytics but focused on call patterns, not platform usage metrics per client.
- **Clari:** Revenue intelligence focused on forecast, not product adoption health.
- **Chorus:** Basic call analytics; no client health scoring from platform usage.
- **Gainsight:** Dedicated customer success platform with health scores — this is the benchmark to aspire toward, but we should own it natively rather than requiring another tool.

**Our angle:** We already have the telemetry. The gap is aggregation + per-client visibility + actionable presentation to CS/Sales.

---

## Risks & Concerns

| Risk                                                   | Severity | Mitigation                                                                 |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------- |
| Data accuracy — metrics may not be clean per-workspace | High     | Partner with Dylan (Data Eng) to validate PostHog data model per workspace |
| Scope creep — trying to build Gainsight                | High     | Start with 5 key metrics per client, not a full health platform            |
| Privacy — exposing individual user activity            | Medium   | Aggregate at team/workspace level, not individual user level               |
| Engineering capacity                                   | Medium   | Leverage existing PostHog instrumentation (ASK-4934, ASK-4721)             |

---

## Feedback Plan

- **Pre-build:** Interview 3 CSMs (Eli, Parker, Erika) on what metrics they'd check daily
- **Post-build:** In-app usage of the metrics dashboard itself (meta: track if CS uses the usage tracker)
- **Success metric direction:** Increase in proactive CS outreach to at-risk clients (measure change, not absolute)

---

## Open Questions

1. What PostHog events currently exist per workspace that could power this? (Check with Dylan/Engineering)
2. Should this be an internal tool only, or should clients also see their own usage? (Check with Ben Harrison/CS)
3. What's the right "health score" threshold for alerting? (Need baseline data)
4. Should this integrate with HubSpot as a property sync? (Aligns with existing ASK-4934 work)
5. What's the privacy boundary — can we show individual user activity or only workspace-level?
6. What is the minimum external "Insights API" surface needed to support agency dashboard use cases?
7. Which API auth/scoping model should be used for agency-managed multi-client views?

---

## Recommendation

**Proceed to Define phase.** Evidence is strong (5+ sources, multiple churn analyses, leadership analytics, direct customer quotes). The problem is validated across personas. Start with an internal CS-facing dashboard MVP, then expand to client-facing ROI cards.

**Suggested phasing:**

1. **V1 (Internal):** CS-facing dashboard with per-client metrics (DAU/WAU, invite acceptance, workflow triggers, feature adoption)
2. **V2 (Alerts):** Automated risk alerts when usage drops below threshold
3. **V3 (Client-facing):** ROI cards that clients can see ("Your team captured X meetings, saved Y hours")

---

_Owner: Tyler Sahagun_
_Phase: Discovery → Define (recommended)_
