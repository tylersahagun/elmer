# Competitive Landscape: Client Usage Metrics

> **Last Analyzed**: 2026-02-13
> **Competitors Evaluated**: 9 (3 Direct, 3 Indirect, 3 Adjacent)
> **Differentiation Score**: Strong
> **Analysis Trigger**: Initiative in Build phase; "By The Numbers" bento value page prototype in progress

---

## TL;DR

The client usage metrics space is contested by three distinct categories: **dedicated CS platforms** (Gainsight, Vitally, ChurnZero) that own health scoring but require external product analytics; **revenue intelligence tools** (Gong, Clari) that infer account health from CRM activity and call patterns; and **product analytics platforms** (Pendo, Mixpanel/Amplitude) that have deep usage data but no CS workflow. AskElephant sits at a unique intersection: we own both the **conversation intelligence** (meetings, transcripts, sentiment) AND the **product telemetry** (workflows, CRM actions, feature usage) natively. No competitor combines these into a single per-client health and value view. Our "By The Numbers" bento value page leapfrogs the market by making AI activity visible as business outcomes -- not just health scores, but credible ROI narratives that write themselves.

**The strategic window**: Gainsight-Totango consolidation and ChurnZero's AI push are raising the bar on health scoring, but they all depend on importing product data from third-party tools. We can deliver zero-config, native health scoring that includes meeting intelligence context -- something no standalone CS platform can replicate.

---

## Competitor Profiles

### Gainsight (Direct)

- **Product**: [Gainsight CS](https://www.gainsight.com/customer-success/)
- **Tier**: Direct
- **Positioning**: "Deeply understand your customers from all angles" -- the category-defining CS platform, now Leader in 2025 Gartner Magic Quadrant
- **Target Persona**: CS leaders and CSMs at enterprise and mid-market SaaS
- **Key Strengths**:
  - DEAR framework (Deployment, Engagement, Adoption, ROI) is the industry standard for health scoring
  - AI Scorecards (GA as of Jan 2025) build data-driven health scores in minutes with fine-tuning recommendations
  - Staircase AI integration provides real-time sentiment analysis across email, tickets, and chat
  - Uses both absolute scoring (customer's own baseline) and relative scoring (peer benchmarking within segment)
  - Deepest integration ecosystem (Salesforce, HubSpot, product analytics tools)
- **Key Weaknesses**:
  - Requires separate product analytics tool (Mixpanel, Amplitude, Pendo) for usage data -- does not capture telemetry natively
  - Complex implementation: 3-6 month onboarding typical (G2 reviews cite this as #1 complaint)
  - Expensive: enterprise pricing often $50K+ annually, prohibitive for mid-market
  - Health scores can feel like a black box -- CSMs report not understanding or trusting AI-generated scores (Vitally blog critique)
  - Staircase AI health score components (Sentiment, Engagement, Open Items, Response Time) focus on communication patterns, not product adoption
- **Relevance**: Sets the gold standard for what CSMs expect from health scoring. Our "By The Numbers" page must match the outcome (per-client health visibility) without the complexity, cost, and 3-6 month setup. Their dependency on third-party product analytics is our structural advantage.

### Vitally (Direct)

- **Product**: [Vitally](https://www.vitally.io/)
- **Tier**: Direct
- **Positioning**: "#1 Customer Success Platform for B2B SaaS" -- flexibility-first, rapid setup
- **Target Persona**: CS teams at B2B SaaS companies (SMB-to-mid-market sweet spot, ~500+ teams)
- **Key Strengths**:
  - Customer Hubs for organized, customizable data views -- CSMs design their own health dashboards
  - Health scores dynamically adjust by lifecycle stage and segment (not one-size-fits-all)
  - Rapid implementation vs. Gainsight (days-weeks, not months)
  - #1 in G2 Momentum ranking, 4.5 stars based on 600+ reviews
  - All plans include unlimited automations, observer seats, and full integration library
  - Recently added AI-driven insights and meeting call recorder
- **Key Weaknesses**:
  - Still requires external data sources for product analytics -- does not own the telemetry
  - Smaller integration ecosystem than Gainsight
  - Less opinionated health scoring framework -- CSMs must design their own views (can be a strength or weakness)
  - AI capabilities less mature than Gainsight's Staircase AI
  - Pricing requires sales contact (no transparent pricing), tiered as Tech-Touch / Hybrid-Touch / High-Touch
- **Relevance**: Closest to the experience AskElephant should deliver: fast setup, flexible health views, without enterprise overhead. Their Customer Hubs pattern is worth studying for our drill-down experience. Key lesson: the market values speed-to-value over comprehensiveness.

### ChurnZero (Direct)

- **Product**: [ChurnZero](https://churnzero.com/)
- **Tier**: Direct
- **Positioning**: Leading CS platform with strong ease-of-use ratings, 4.7/5 on Gartner Peer Insights
- **Target Persona**: CS teams at mid-market SaaS
- **Key Strengths**:
  - ChurnScores (AI-powered health scores) combine engagement, usage, risks, and satisfaction with customizable segment models
  - Command Center dashboard provides centralized daily to-dos, health scores, risk alerts, and milestone tracking
  - Q4 2025 AI push: AI Hub & Marketplace, new AI Agents (VERSE for presentations, CRUX for email), AI Signals integrated into ChurnScores
  - Scalability and access management features well-rated
  - Strong G2 satisfaction (4.7/5 from 176 reviews)
- **Key Weaknesses**:
  - Prescriptive approach -- less flexibility than Vitally for custom views
  - Data integration complexity for product analytics (still needs external data pipeline)
  - Limited conversation intelligence (no native meeting data, though AI agents can process external content)
  - AI Hub is new -- maturity and adoption unclear
- **Relevance**: Demonstrates that churn prediction and AI-driven health scoring are table stakes, not differentiators. Their AI Hub direction validates our approach of embedding intelligence natively. But they still can't tell you what's happening in customer meetings.

### Totango + Catalyst (Direct)

- **Product**: [Totango](https://www.totango.com/) (merged with Catalyst, Feb 2024)
- **Tier**: Direct
- **Positioning**: Unified customer success and GTM platform, Named Leader in Forrester Wave Q4 2025 (5/5 vision, innovation, roadmap)
- **Target Persona**: CS and GTM teams at mid-market to enterprise
- **Key Strengths**:
  - Merger combines Totango's enterprise-grade health scoring with Catalyst's modern UI and AI capabilities
  - Real-time activity streams with usage, license utilization, CRM feeds, and support tickets
  - Green/yellow/red health scoring with multidimensional customization
  - Nearly 600 organizations using the combined platform
  - Customer-led growth positioning resonates with expansion-focused CS teams
- **Key Weaknesses**:
  - Post-merger integration still in progress -- product consolidation creates uncertainty
  - Two separate products with overlapping features (Totango enterprise + Catalyst growth) not yet fully unified
  - No native conversation intelligence
  - Competing for mindshare against Gainsight's established dominance
- **Relevance**: The merger validates that the CS platform market is consolidating. AskElephant should not try to be a CS platform -- instead, own the native usage + conversation intelligence angle that no consolidated CS platform can replicate.

### Gong (Indirect)

- **Product**: [Gong](https://www.gong.io/)
- **Tier**: Indirect
- **Positioning**: "Revenue intelligence powered by AI"
- **Target Persona**: Revenue leaders, sales managers, CS leaders at mid-market and enterprise
- **Key Strengths**:
  - Account page centralizes activity, communication history, and CRM data for per-account views
  - Feature Utilization Report tracks Gong adoption across org (meta: usage metrics for their own product)
  - Pipeline analytics with competitive analysis dashboards
  - Deep conversation analytics (talk:listen ratios, topic tracking, sentiment)
  - Scorecards Analysis shows usage patterns and performance over time
- **Key Weaknesses**:
  - "Gong Reality" analytics focus on call patterns, not per-client _product_ usage
  - No native product adoption telemetry -- cannot tell CSMs if a client is using their product features
  - Account health is inferred from engagement patterns (call frequency, email cadence), not actual usage
  - Expensive enterprise pricing limits mid-market adoption
  - No health scoring or automated churn alerts based on product behavior
- **Relevance**: Competitors may claim "Gong shows us account health" but it's engagement-health (call frequency), not adoption-health (feature usage). AskElephant can bridge both: we have the meeting intelligence AND the product telemetry. This is the fusion no one else offers.

### Clari (Indirect)

- **Product**: [Clari](https://www.clari.com/) (recently merged with Salesloft)
- **Tier**: Indirect
- **Positioning**: "Revenue Orchestration Platform" with AI-powered churn detection
- **Target Persona**: CROs, VP Sales, RevOps at enterprise
- **Key Strengths**:
  - AI-powered churn risk detection from usage signals, behavior shifts, stalled engagement
  - NRR tracking across segments, product lines, and geographies
  - Deal Inspection and Trend Analysis AI Agents expose patterns and guide proactive action
  - Time Series Data Hub captures and analyzes all sales activity data for forecasting
  - Revenue Cadences connect Sales, Marketing, and CS for coordinated retention
  - 75,000+ revenue teams, strong enterprise presence
- **Key Weaknesses**:
  - Primarily forecasting-focused, not CS daily workflow
  - Per-account usage inferred from CRM activity, not product telemetry
  - Enterprise-first: complex setup, expensive
  - Salesloft merger creates product consolidation uncertainty
  - No native meeting intelligence (post-merger may change with Salesloft's recording)
- **Relevance**: Demonstrates that revenue leaders WANT per-account health and churn detection. Clari approaches from CRM data; AskElephant approaches from actual product usage + meeting intelligence. Their merger with Salesloft validates the "single platform" thesis.

### Day.ai (Indirect)

- **Product**: [Day.ai](https://www.day.ai/)
- **Tier**: Indirect
- **Positioning**: AI-native CRM that captures and structures conversation data automatically
- **Target Persona**: Sales teams at SMB-to-mid-market
- **Key Strengths**:
  - Reports & Analytics launched March 2025: weighted forecast, stage analysis, pipeline review
  - AI automatically produces analysis from conversation data without upfront configuration
  - Meeting intelligence auto-captures video meetings, emails, and Slack conversations
  - Pipeline Review includes highlights, lowlights, areas for improvement, and recommendations
  - Zero-config philosophy aligns with modern expectations
- **Key Weaknesses**:
  - Analytics focused on pipeline/deals, not customer health or adoption
  - No per-client usage metrics or health scoring
  - No feature adoption tracking or product telemetry
  - Early-stage company with limited market presence
  - No CS workflow or churn detection capabilities
- **Relevance**: Validates the "AI-native, zero-config analytics" pattern that AskElephant should follow. Their approach of generating insights directly from conversation data (no manual structuring) is a pattern to adopt. But they stop at pipeline -- we should extend to customer health and value proof.

### Pendo (Adjacent)

- **Product**: [Pendo](https://pendo.io/)
- **Tier**: Adjacent
- **Positioning**: "Product experience and analytics platform" for understanding user behavior
- **Target Persona**: Product managers, data teams, growth teams
- **Key Strengths**:
  - Deep product usage analytics: frequency, breadth (users per account), depth (features used)
  - Per-account segmentation enables CS teams to identify at-risk accounts
  - Data Sync exports usage data to CRM and CS platforms for health scoring
  - In-app guidance and engagement tools
  - ML models for churn prediction using product usage signals
- **Key Weaknesses**:
  - NOT designed for CS daily workflow -- requires data literacy and analyst involvement
  - No health scoring, alert system, or CRM integration for CSM workflow
  - No meeting or conversation context
  - Primarily a data source, not an action platform -- CSMs must go elsewhere to act
  - Expensive for mid-market (product analytics pricing)
- **Relevance**: This is what CS platforms like Gainsight/Vitally IMPORT data from. AskElephant already has its own product telemetry (PostHog) -- the gap is aggregating it per-client and making it CSM-friendly. Pendo's frequency/breadth/depth framework is a good model for our health score dimensions.

### Mixpanel / Amplitude (Adjacent)

- **Product**: [Mixpanel](https://mixpanel.com/) / [Amplitude](https://amplitude.com/)
- **Tier**: Adjacent
- **Positioning**: Product analytics platforms -- "understand your users"
- **Target Persona**: Product managers, data teams, growth teams
- **Key Strengths**:
  - Deep product usage analytics with cohort analysis, funnel tracking, retention curves
  - Per-user and per-account segmentation
  - Event-level granularity and self-serve dashboards
  - Amplitude's ROI data shows customers achieve average 655% ROI with 4.8-month payback
- **Key Weaknesses**:
  - NOT designed for CS teams -- requires significant data literacy
  - No health scoring, alert system, or CRM integration
  - No meeting or conversation context
  - Raw data platform, not an insight delivery system
- **Relevance**: Represents the "data layer" that feeds CS platforms. AskElephant already has this (PostHog) -- we should not rebuild Mixpanel. Instead, aggregate and present existing telemetry in a CSM-friendly format with actionable context.

---

## Feature Matrix

| Capability                            | AskElephant (Current) | AskElephant (Proposed) | Gainsight               | Vitally                 | ChurnZero               | Totango+Catalyst        | Gong          | Clari         | Day.ai  | Pendo         |
| ------------------------------------- | --------------------- | ---------------------- | ----------------------- | ----------------------- | ----------------------- | ----------------------- | ------------- | ------------- | ------- | ------------- |
| **Per-client usage dashboard**        | Missing               | Leading                | Leading                 | Leading                 | Leading                 | Leading                 | Basic         | Parity        | Missing | Parity        |
| **Composite health score**            | Missing               | Parity                 | Leading                 | Leading                 | Leading                 | Leading                 | Missing       | Parity        | Missing | Basic         |
| **Risk alerts / churn detection**     | Missing               | Parity                 | Leading                 | Parity                  | Leading                 | Parity                  | Basic         | Leading       | Missing | Missing       |
| **ROI / value quantification**        | Missing               | **Leading**            | Parity                  | Basic                   | Basic                   | Parity                  | Missing       | Missing       | Missing | Missing       |
| **Activation & invite tracking**      | Missing               | **Leading**            | Parity                  | Parity                  | Parity                  | Parity                  | Missing       | Missing       | Missing | Basic         |
| **Meeting intelligence context**      | Leading               | Leading                | Missing                 | Missing                 | Missing                 | Missing                 | Leading       | Missing       | Parity  | Missing       |
| **Conversation + usage fusion**       | Missing               | **Leading**            | Missing                 | Missing                 | Missing                 | Missing                 | Missing       | Missing       | Missing | Missing       |
| **Bento value proof page**            | Missing               | **Leading**            | Missing                 | Missing                 | Missing                 | Missing                 | Missing       | Missing       | Missing | Missing       |
| **AI-generated talking points**       | Missing               | **Leading**            | Basic                   | Missing                 | Parity                  | Missing                 | Parity        | Parity        | Parity  | Missing       |
| **Trust cues (confidence/freshness)** | Missing               | **Leading**            | Basic                   | Basic                   | Basic                   | Basic                   | Missing       | Missing       | Missing | Missing       |
| **Setup time**                        | N/A                   | **<1 day (native)**    | 3-6 months              | Days-weeks              | Weeks                   | Weeks-months            | Weeks         | Weeks         | Days    | Weeks         |
| **Additional tool required**          | N/A                   | **No**                 | Yes (product analytics) | Yes (product analytics) | Yes (product analytics) | Yes (product analytics) | Yes (CS tool) | Yes (CS tool) | No      | Yes (CS tool) |
| **CRM property sync**                 | Missing               | Parity (V2)            | Leading                 | Parity                  | Parity                  | Parity                  | Parity        | Leading       | Parity  | Parity        |
| **Customer-facing usage view**        | Missing               | Parity (V3)            | Parity                  | Basic                   | Basic                   | Parity                  | Missing       | Missing       | Missing | Parity        |

**Ratings**: Leading = best-in-class / Parity = meets market expectation / Basic = functional but limited / Missing = not available

---

## UX Pattern Inventory

### Flow 1: Client Health Dashboard (Primary CSM View)

| Competitor    | Approach                                                                                                                                        | Strengths                                                         | Weaknesses                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Gainsight** | DEAR framework scorecards with AI-generated scores; dimensional drill-down (Deployment, Engagement, Adoption, ROI); absolute + relative scoring | Industry standard, comprehensive, AI Scorecards reduce setup time | Complex configuration, overwhelming for new CSMs, requires understanding of scoring methodology |
| **Vitally**   | Customer Hubs with customizable health views; dynamic scores by lifecycle stage and segment; real-time updates                                  | Flexible, fast to configure, CSMs own their views                 | Less opinionated -- CSMs must design their own views, which creates inconsistency               |
| **ChurnZero** | Command Center with daily to-dos, health scores, risk alerts; ChurnScores customizable per segment, lifecycle, industry                         | Clean daily workflow integration, segment-aware                   | Prescriptive approach limits customization; AI Hub is new and untested                          |
| **Gong**      | Account page with activity timeline and engagement metrics; scorecards analysis with performance patterns                                       | Clean, conversation-centric, good activity visualization          | Missing product usage dimension entirely; engagement != adoption                                |
| **Clari**     | Revenue dashboard with per-account forecast, churn risk AI, and trend analysis agents                                                           | Executive-friendly, predictive, AI-driven                         | Not actionable for CSMs -- too high-level, forecast-focused not workflow-focused                |

**Emerging Best Practice**: Single dashboard combining composite health score with dimensional drill-down. Trend lines matter more than point-in-time scores. Scores should be segmentable by lifecycle stage. Setup should take minutes, not months.

**User Frustration (from G2 reviews)**: Health scores that feel like a black box. CSMs want to understand WHY a score changed and WHAT to do about it. Configuration complexity is the #1 barrier to adoption.

### Flow 2: Account Detail / Client Drill-Down

| Competitor    | Approach                                                               | Strengths                                   | Weaknesses                                                 |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Gainsight** | C360/P360 with Staircase AI sentiment overlay; comprehensive but dense | Complete customer view, AI-powered insights | Information overload; requires training to navigate        |
| **Vitally**   | Customer Hub drill-down with customizable widgets                      | Flexible, user-controlled layout            | Blank canvas problem -- new CSMs don't know where to start |
| **ChurnZero** | Account profile with journey view, health breakdown, task list         | Action-oriented, journey-centric            | Less flexible than Vitally for custom views                |
| **Pendo**     | Account-level frequency/breadth/depth analytics                        | Deep product usage data                     | Requires analyst-level interpretation; no CS workflow      |

**Emerging Best Practice**: Header showing account vitals (health, seats, CSM, contract dates) + metric cards (DAU, WAU, feature adoption, workflows) + time-series trend chart + feature adoption checklist + actionable recommendations.

**AskElephant Leapfrog**: Add "Talking Points" section that synthesizes usage data + meeting intelligence into conversation-ready suggestions. No competitor does this natively.

### Flow 3: Risk Alert / Churn Detection

| Competitor    | Approach                                                                | Strengths                        | Weaknesses                                     |
| ------------- | ----------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| **Gainsight** | Rule-based triggers + AI predictions → generates CTAs (calls to action) | Mature, configurable, actionable | Rules require setup; can be noisy; CTA fatigue |
| **ChurnZero** | AI Signals integrated into ChurnScores; AI Hub agents process alerts    | Automatic, AI-enhanced           | New capabilities, maturity unclear             |
| **Clari**     | AI-predicted churn risk from behavior shifts + Deal Inspection agents   | Automatic, no configuration      | Opaque -- hard to explain why; enterprise-only |
| **Vitally**   | Configurable alerts based on health score changes and usage drops       | Transparent, customizable        | Requires CSM to define thresholds              |

**Emerging Best Practice**: Proactive alerts with clear rationale ("Usage dropped 40% this month" not just "Health: Red"). Actionable next step in the alert. Alert fatigue is a real risk -- smart defaults with easy tuning.

**AskElephant Leapfrog**: Our alerts can include meeting context ("Last call with Cobalt was 3 weeks ago -- and in that call, they mentioned budget review") alongside product usage signals. No competitor can correlate these automatically.

### Flow 4: Value Proof / ROI Reporting

| Competitor    | Approach                                                       | Strengths                             | Weaknesses                                             |
| ------------- | -------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------ |
| **Gainsight** | ROI dimension in DEAR framework; value realization tracking    | Structured methodology                | Requires manual data entry for many ROI dimensions     |
| **Amplitude** | ROI Guidebook with customer success stories (655% average ROI) | Strong benchmark data                 | Self-serving; about Amplitude's ROI, not customer's    |
| **Matik**     | ROI one-pagers, value analysis decks, ROI toolkits             | Purpose-built for value communication | Separate tool; manual assembly required                |
| **Day.ai**    | Pipeline Review with highlights/lowlights/recommendations      | AI-generated, zero-config             | Deals only, no customer health or value quantification |

**Emerging Best Practice**: Shift from CSM-assembled ROI decks to auto-generated value narratives. The best tools are moving toward "defensible, repeatable ROI stories" with clear attribution language.

**AskElephant Leapfrog**: "By The Numbers" bento page auto-generates value proof from native data: workflows run, meetings captured, CRM records created, deals influenced, time saved. No manual assembly. Trust cues (confidence, freshness, attribution type) prevent overclaiming. This is a category-creating capability.

---

## Visual Reference Gallery

### Real Competitor UI Screenshots

#### Gainsight — C360 Health Scorecards

- **`assets/competitive/gainsight-scorecard-cards-view-screenshot.jpg`**
  - Source: https://support.gainsight.com/gainsight_nxt/05Scorecards/03User_Guides/View_and_Update_Scorecards_in_360
  - Captured: 2026-02-13
  - Shows: Scorecard Cards View on C360 page — overall score circle, measure groups, 18-week trend bars, percentage contribution per measure. This is the industry-standard health scoring UI.
- **`assets/competitive/gainsight-scorecard-trend-history-screenshot.jpg`**
  - Source: https://support.gainsight.com/gainsight_nxt/05Scorecards/03User_Guides/View_and_Update_Scorecards_in_360
  - Captured: 2026-02-13
  - Shows: Scorecard trend history with weekly bars, current/previous score comparison, trend arrows (up/down/neutral)
- **`assets/competitive/gainsight-scorecard-edit-measure-screenshot.jpg`**
  - Source: https://support.gainsight.com/gainsight_nxt/05Scorecards/03User_Guides/View_and_Update_Scorecards_in_360
  - Captured: 2026-02-13
  - Shows: Manual measure score editing with slider — demonstrates their "edit individual health measures" UX pattern

#### Vitally — Customer Success Visibility

- **`assets/competitive/vitally-dashboard-screenshot.png`**
  - Source: https://vitally.io/product/visibility
  - Captured: 2026-02-13
  - Shows: Main Vitally dashboard product view — their hero marketing screenshot showing the Customer Hub pattern
- **`assets/competitive/vitally-health-scores-screenshot.png`**
  - Source: https://vitally.io/product/visibility
  - Captured: 2026-02-13
  - Shows: Health Scores feature view — dynamically adjusting health scores by lifecycle stage and segment
- **`assets/competitive/vitally-dashboards-widget-screenshot.png`**
  - Source: https://vitally.io/product/visibility
  - Captured: 2026-02-13
  - Shows: Dashboard widget creation — custom report builder with KPI tracking widgets
- **`assets/competitive/vitally-goals-screenshot.png`**
  - Source: https://vitally.io/product/visibility
  - Captured: 2026-02-13
  - Shows: Goals configuration — measuring effectiveness of CS workflows and strategies

#### ChurnZero — Command Center & ChurnScores

- **`assets/competitive/churnzero-command-center-screenshot.png`**
  - Source: https://churnzero.com/blog/churnzero-product-releases-q4-2024-success-plans-meetings-updates-integrations-new-command-center/
  - Captured: 2026-02-13
  - Shows: Redesigned Command Center "My Book" view — pinned segments, health score changes, task management in single workspace
- **`assets/competitive/churnzero-success-plan-screenshot.png`**
  - Source: https://churnzero.com/blog/churnzero-product-releases-q4-2024-success-plans-meetings-updates-integrations-new-command-center/
  - Captured: 2026-02-13
  - Shows: Success Plans with expanded goals — customizable goals tied to health scores
- **`assets/competitive/churnzero-churnscore-chart-screenshot.png`**
  - Source: https://churnzero.com/features/customer-health-scores/
  - Captured: 2026-02-13
  - Shows: ChurnScore change chart in account profile — health score trend visualization with profile header

#### Gong — Account Intelligence

- **`assets/competitive/gong-account-overview-screenshot.png`**
  - Source: https://www.gong.io/platform/
  - Captured: 2026-02-13
  - Shows: Gong product UI marketing screenshot — engagement-based account intelligence (not product usage)

### AI-Generated Comparison Mockups

_AI-generated representations based on public documentation and marketing materials, illustrating competitive patterns:_

#### 1. Health Dashboard Overview (Market Standard)

- **File**: `assets/competitive/competitor-health-dashboard-overview.png`
- **Pattern**: Summary bar (green/yellow/red counts) + filterable sortable table with health scores, seats, DAU%, feature adoption, trend sparklines
- **Who does this**: Gainsight, Vitally, ChurnZero, Totango
- **AskElephant stance**: Match this pattern for V1 client list view

#### 2. Account Detail Drill-Down (Market Standard)

- **File**: `assets/competitive/competitor-account-detail-drilldown.png`
- **Pattern**: Account header with health badge + metric cards (DAU, WAU, features, workflows) + time-series chart + feature adoption checklist
- **Who does this**: All CS platforms offer some version
- **AskElephant stance**: Match, then add Talking Points section (our differentiator)

#### 3. Bento Value Proof Page (AskElephant Unique)

- **File**: `assets/competitive/bento-value-proof-dashboard.png`
- **Pattern**: Bento-grid layout with varied card sizes, hero value metrics, freshness + confidence badges, section grouping by value type (HubSpot Impact, Communication, etc.)
- **Who does this**: No competitor has this exact pattern
- **AskElephant stance**: This is our unique "By The Numbers" concept -- no one else auto-generates ROI proof from native data

#### 4. Risk Alert UX Patterns (Comparative)

- **File**: `assets/competitive/competitor-alert-patterns.png`
- **Pattern comparison**: Rule-Based Alerts (Gainsight/Vitally) vs. AI-Predicted Risk (Clari/ChurnZero) vs. Contextual Talking Points (AskElephant proposed)
- **AskElephant stance**: Combine all three: configurable thresholds + AI risk signals + meeting-context-enriched talking points

---

## Differentiation Map

| Capability                           | Category               | Strategic Response                                                                                                                                         |
| ------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-client usage dashboard           | **Table Stakes**       | Must have -- CSMs expect this from any CS tooling; match the pattern                                                                                       |
| Composite health score               | **Parity Zone**        | Match with simpler model (not DEAR complexity); Pendo's frequency/breadth/depth is a good framework                                                        |
| Risk/churn alerts                    | **Parity Zone**        | Match -- proactive alerts are expected; include clear rationale and configurable thresholds                                                                |
| ROI quantification per client        | **Opportunity Gap**    | "Saved X hours, captured Y meetings, created Z CRM records" is uniquely ours -- auto-generated, not manually assembled                                     |
| Conversation + usage fusion          | **AskElephant Unique** | No one else combines meeting intelligence with product adoption data into a unified health view                                                            |
| Bento value proof page               | **AskElephant Unique** | Category-creating: auto-generated outcome proof with trust cues, no competitor attempts this                                                               |
| AI-generated talking points          | **Opportunity Gap**    | Synthesize usage data + meeting context into conversation-ready suggestions; Gong has call-based suggestions but not product-usage-aware                   |
| Trust cues (confidence/freshness)    | **Opportunity Gap**    | Most platforms show stale data without transparency; our trust-first approach (freshness badges, confidence levels, attribution types) is a differentiator |
| Native telemetry (no integration)    | **AskElephant Unique** | Zero-config health scoring from data we already have -- leapfrogs 3-6 month CS platform onboarding                                                         |
| Activation/invite tracking           | **Opportunity Gap**    | 77% NOT_INVITED gap is a signal unique to AskElephant -- surface per-client so CSMs can drive adoption                                                     |
| Setup in minutes not months          | **Opportunity Gap**    | Leapfrog enterprise CS platforms on time-to-value; Day.ai validates this expectation                                                                       |
| CRM property sync (health → HubSpot) | **Parity Zone**        | V2 priority -- expected for operationalization but not day-1 requirement                                                                                   |
| Customer-facing value view           | **Opportunity Gap**    | V3 -- client-facing "Your AskElephant" page; Gainsight/Totango offer this but require setup                                                                |

---

## Design Vocabulary

### Patterns to Adopt

- **Health score with dimensional breakdown**: Like Gainsight's DEAR but simpler -- composite score with drill-down into frequency, breadth, depth dimensions (Pendo framework). Users expect green/yellow/red with explainable drivers.
- **Trend lines over absolute numbers**: Show direction of change (improving/declining), not just current state. Vitally and Planhat both emphasize trajectory over snapshots.
- **Account timeline**: Like Gong's activity timeline but enriched with product usage events AND meeting context.
- **Proactive alerts with rationale**: Clear "why" explanation, not just a color change. ChurnZero's AI Signals + clear context is the model.
- **Bento-grid layout for value proof**: Apple/Linear-inspired varied card sizes on a strict grid. 2026 SaaS design trend (SaaSFrame). Top-left quadrant priority for North Star metric.
- **Dynamic segment-aware scoring**: From Vitally -- health scores should adjust by lifecycle stage and customer segment, not one-size-fits-all.
- **Zero-config analytics**: Day.ai's approach of generating insights directly from existing data without requiring manual configuration.

### Patterns to Reject

- **Complex configuration wizards**: Gainsight's setup complexity is the #1 G2 complaint -- AskElephant should be zero-config. Cite leadership: _"We need to learn to...slow down first."_
- **Black-box health scores**: Users must understand what drives the score. Cite anti-vision: _"transparency in how AI works"_. ChurnZero's AI Hub and Clari's opaque risk scores both suffer from this.
- **Surveillance dashboards**: Frame as "help the client succeed" not "monitor the client." Cite anti-vision: _"If you are not helping orchestrate a human outcome, then you are not working on the right thing."_
- **Separate tool requirement**: Don't make CSMs leave AskElephant to understand usage. Gainsight's dependency on external product analytics is their structural weakness.
- **Vanity metrics without outcome context**: High counts without connecting to business value. Cite product vision: _"It's not what you build...It's how it's delivered, how it's used, and how it is experienced."_
- **Feature-for-feature CS platform parity**: We are NOT building Gainsight. Reject playbooks, success plans, journey orchestration, and enterprise CS workflows.

### Patterns to Leapfrog

- **Meeting context in health scoring**: No competitor combines conversation signals (sentiment, engagement, follow-ups, objections) with product usage into a unified health view. AskElephant can say "Cobalt's usage dropped 40% AND in their last call they mentioned budget constraints."
- **ROI stories that write themselves**: AskElephant knows meetings captured, actions generated, CRM updates made, workflows executed, emails processed -- quantify value per client automatically. No manual assembly like Matik or Gainsight ROI.
- **Activation intelligence**: We know who was invited, who joined, who's active, who stopped -- surface this as a growth signal. The 77% NOT_INVITED gap is a unique signal only we can expose.
- **Trust-first value communication**: Freshness badges, confidence levels, and clear attribution types ("created by AskElephant" vs. "influenced by" vs. "observed by") prevent the overclaiming problem that plagues ROI dashboards. No competitor does this systematically.
- **Contextual talking points**: Synthesize product usage + meeting intelligence + CRM data into actionable conversation starters. Not just "health is red" but "here's what to say when you call them."

---

## Strategic Recommendations

### Match (Table Stakes -- Must Deliver in V1)

1. **Per-client dashboard** showing usage trends, active users, feature adoption, sorted by health
2. **Composite health indicator** -- keep it simple: green/yellow/red with explainable drivers (frequency, breadth, depth)
3. **Risk alerts** when usage drops below configurable thresholds -- deliver via Slack with clear rationale
4. **Data freshness indicators** -- "Data as of 2h ago" transparency

### Leapfrog (Opportunity Gaps -- Primary Differentiators)

1. **Conversation + Usage fusion**: One view combining meeting engagement AND product adoption -- no competitor does this. This is the single biggest structural advantage.
2. **Auto-ROI "By The Numbers" page**: Bento-grid value proof with trust cues -- "This workspace ran 2,847 workflows, closed 127 deals with AskElephant involvement, captured 1,247 meetings" -- generated automatically for QBR, renewal, and daily use.
3. **Activation gap detection**: Surface the 77% NOT_INVITED problem per-client so CSMs can drive seat adoption proactively.
4. **Zero-config health scoring**: Works from day one because we own the telemetry -- no 3-6 month onboarding, no separate product analytics tool required.
5. **AI talking points enriched with meeting context**: "Usage dropped 60% -- and in their last meeting they mentioned onboarding challenges with the new CRM integration. Suggest: offer a dedicated re-onboarding session."

### Ignore (Not Our Fight)

- Enterprise CS platform features (playbooks, success plans, journey orchestration) -- AskElephant isn't a CS platform
- Deep product analytics (funnel analysis, cohort curves, retention cohorts) -- that's Mixpanel/Amplitude territory
- Revenue forecasting and pipeline analytics -- that's Clari's territory (and now Salesloft's)
- NPS/CSAT survey management -- belongs in dedicated survey tools
- Customer community management or in-app messaging -- belongs in Pendo/Intercom

### Risks If We Don't Act

1. **CS platform adoption threat**: Without per-client usage visibility, CS team evaluates standalone CS platforms (Gainsight, Vitally), and AskElephant becomes "just another data source to pipe into their CS tool"
2. **Renewal defense gap**: Without auto-generated ROI proof, renewals depend on anecdotal evidence rather than data -- sales leaders can't defend budget
3. **Silent churn compounds**: The 77% NOT_INVITED problem continues growing per-client without anyone seeing it
4. **Market timing**: Gainsight's AI Scorecards, ChurnZero's AI Hub, and Clari's merger with Salesloft are all raising the bar on health intelligence -- the window for native, zero-config alternatives is now
5. **Agency/partner demand**: Customer API request for embedded usage intelligence (Feb 11 signal) shows external demand for AskElephant data as a service -- if we can't serve internal CSMs first, we can't serve partners

---

## Market Dynamics (2026 Context)

### Consolidation Wave

- **Gainsight** acquired Staircase AI for sentiment analysis (2024)
- **Totango + Catalyst** merged (Feb 2024) to challenge Gainsight
- **Clari + Salesloft** merged (2025) for unified revenue platform
- **Implication**: Big players are consolidating to offer broader platforms. AskElephant should NOT try to be a CS platform -- instead, own the native intelligence angle.

### AI Acceleration

- Every CS platform is racing to add AI: Gainsight AI Scorecards, ChurnZero AI Hub, Clari AI Agents
- But AI quality depends on data quality -- and most CS platforms still rely on imported, often stale data
- **AskElephant advantage**: Our AI operates on native, first-party data (meetings, workflows, CRM actions) with known freshness and confidence levels

### "Value Proof" as New Battleground

- Amplitude publishing ROI guidebooks (655% average customer ROI)
- Matik building purpose-built ROI storytelling tools
- CS platforms adding value realization tracking
- **AskElephant opportunity**: Auto-generate value proof from native data with trust cues -- no competitor does this credibly

---

## Sources

### Competitor Product Documentation

- [Gainsight Customer 360 & Health](https://www.gainsight.com/customer-success/customer-360-health/)
- [Gainsight AI Scorecards (GA Jan 2025)](https://communities.gainsight.com/product-updates/january-2025-cs-release-smarter-ai-cleaner-data-and-streamlined-workflows-26980)
- [Gainsight Staircase AI Health Score](https://support.gainsight.com/Staircase_AI/Configurations/Staircase_AI_Health_Score)
- [Gainsight DEAR Framework](https://communities.gainsight.com/predictive-health-scoring-321/build-a-foundational-health-scoring-framework-using-dear-26486)
- [Vitally Product Visibility](https://www.vitally.io/product/visibility)
- [Vitally Health Scores & Metrics](https://docs.vitally.io/en/collections/8822672-health-scores-metrics)
- [Vitally Pricing](https://www.vitally.io/pricing)
- [ChurnZero Health Score Dashboard](https://churnzero.com/features/customer-health-scores/)
- [ChurnZero Command Center](https://churnzero.com/features/command-center/)
- [ChurnZero Q4 2025 AI Release Notes](https://churnzero.com/blog/product-release-notes-q4-2025/)
- [Totango + Catalyst Merger Announcement](https://www.totango.com/press/totango-and-catalyst-merge)
- [Totango Health Dashboard](https://blog.totango.com/new-customer-health-dashboard-to-easily-monitor-customer-success/)
- [Gong Account Page](https://help.gong.io/docs/track-activity-with-the-accountpage)
- [Gong Feature Utilization Report](https://help.gong.io/docs/generate-a-utilization-report)
- [Clari Customer Retention](https://www.clari.com/solutions/ai-customer-retention/)
- [Clari Post-Sales](https://www.clari.com/solutions/teams/post-sales/)
- [Day.ai Reports & Analytics](https://www.day.ai/resources/introducing-reports-analytics)
- [Pendo Product Analytics](https://pendo.io/)
- [Pendo Product Usage for CS](https://www.pendo.io/pendo-blog/4-ways-your-customer-teams-can-leverage-product-usage-analytics/)

### Market Analysis

- [Gartner Magic Quadrant for Customer Success Platforms 2025](https://gainsight.com/resource/gartner-magic-quadrant-for-customer-success-platforms)
- [Pylon: 15 Best Customer Success Platforms 2026](https://www.usepylon.com/blog/csm-tools-2026)
- [SaaSFrame: High-Performance SaaS Dashboard Design 2026 Trends](https://www.saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns)
- [Amplitude ROI Guidebook](https://amplitude.com/roi-guide)
- [Matik: Showcasing Product ROI (Nov 2025)](https://www.matik.io/blog/matik-monthly-nov-2025-showcasing-product-roi)
- [Planhat Time Series](https://www.planhat.com/features/time-series)
- [Planhat Outcomes Measurement](https://www.planhat.com/editorial/how-to-identify-measure-and-track-outcomes-in-planhat)

### Internal Research

- `client-usage-metrics/research.md` -- Churn analyses, Sam Ho PostHog data, customer quotes
- `client-usage-metrics/askelephant-by-numbers-vision.md` -- Value proof page vision
- `client-usage-metrics/by-the-numbers-prototype-spec.md` -- Prototype specification
- `pm-workspace-docs/signals/slack/2026-02-11-agency-dashboard-api-request.md` -- External API demand signal

---

_Last analyzed: 2026-02-13_
_Analyst: Tyler Sahagun (PM Workspace)_
_Next refresh: Before V2 scoping or when major competitor updates ship_
