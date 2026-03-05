# Sales Funnel Data Source Audit
> Pulled live: March 4, 2026 | HubSpot (510 deal props, 526 contact props), PostHog Production (100 events, 100 feature flags), Slack #sdr-stats

---

## TL;DR

| System | Status | What It Has |
|--------|--------|-------------|
| **HubSpot** | ✅ Connected | 238 custom deal properties — far more than expected. Stage timestamps, lost reasons, demo dates, attribution, scoring all configured. Population unknown. |
| **PostHog** | ✅ Connected | Product usage events (recordings, chat, agents). Not a revenue/funnel tool — it's a product analytics tool. Project ID: `81505` (Production). |
| **Slack #sdr-stats** | ✅ Connected | Daily BDR self-reported: conversations, pitches, meetings, EMH. Manual, no backfill. |
| **#sales-closed-won** | ✅ Connected | AskElephant bot auto-posts each win with company, deal size, win reason. |
| **Stripe** | ❌ Not found | No Stripe MCP configured. Billing data source unknown. |
| **Sequencing tool** | ❌ Unknown | BDRs use an outreach tool — not identified or connected. |

---

## HubSpot Deep Dive

### Deal Property Groups (22 groups, 238 custom + 272 native = 510 total)

| Group | Purpose | Key Fields |
|-------|---------|-----------|
| `dealinformation` | Core deal data | ICP, Demo Held, Deal Source, Attribution, Seats, Time to Close |
| `askelephant_intel_` | AskElephant AI writing back deal intelligence | Closed Lost reason, Competitors, Deal viability, Stage stamps, Scores |
| `askelephant_demo_scoring` | Demo quality scores | Core Skills, Framework Analysis, Triangle Components, Overall Impact |
| `sandler` | Sandler methodology scores | Surface Pain, Investment, Decision Process, Clear Next Steps |
| `sandler_coaching_askelephant` | AI-driven Sandler coaching | Assessments + scores + coaching insights per Sandler pillar |
| `meddic` | MEDDIC qualification framework | Champion, Economic Buyer, Decision Criteria, Identify Pain scores |
| `sales_coach_` | Call coaching scores | Duration, Objection Handling, CTA, Sentiment, Speed to Value |
| `sdr_call_scoring` | SDR-specific call scoring | SDR call quality |
| `referrals` | Partner/referral tracking | Referral person, source, platform |
| `onboarding` | Onboarding tracking | Onboarding rep assignment |
| `statement_of_work` | SOW tracking | SOW status, terms, timeline, risks |
| `playbook_template_(askelephant)` | Deal playbook | Champion, CRM, Objections, Tech Stack, Scheduled Next Event |
| `dealstages` | Stage timing | Cumulative time in each stage (auto-calculated by HubSpot) |
| `analyticsinformation` | Traffic source | Original source, latest source, UTM drill-downs |

---

## What's Tracked in HubSpot — Funnel by Stage

### Stage 0: Lead Generation

| Metric | Field Name | Type | Populated? |
|--------|-----------|------|-----------|
| Marketing attribution channel | `marketing_attribution_agent` | checkbox: LinkedIn AskElephant Team / LinkedIn 3rd Party / LinkedIn Paid Ads / Website Direct Visit / Partner Referral / Customer Referral / Podcast / Webinar / Cold Outreach / Other | ❓ Needs audit |
| Marketing campaign | `marketing_related_campaign` | select | ❓ Needs audit |
| MQL channel | `mql_deal_marketing_channel` | checkbox: LinkedIn organic / LinkedIn ads / SEO / Webinar / Podcast / Event / Referral | ❓ Needs audit |
| MQL source dept | `mql_lead_source_department` | checkbox: Marketing / Sales/Partners | ❓ Needs audit |
| Deal source (AE/SDR/Marketing) | `deal_sorce` | checkbox: SDR Sourced / AE Sourced / Marketing Sourced | ❓ Needs audit |
| Original traffic source | `hs_analytics_source` | auto: Organic Search / Paid Search / Email Marketing / Organic Social / Referrals | ✅ Auto-populated by HubSpot |
| UTM data | `hs_analytics_source_data_1`, `_data_2` | text | ✅ Auto if UTMs configured |
| Partner deal? | `is_this_a_partner_deal_` | Yes/No | ❓ |
| Associated partner | `associated_partner` | text | ❓ |
| Stage 0 timestamp | `stage_0_stamp` | number (unix ts) | ❓ |
| **Ask:** | Tony Mickelsen for ad platform data; James Hinkson for partner installs | | |

---

### Stage 1–2: BDR Outbound

| Metric | Field Name | Type | Populated? |
|--------|-----------|------|-----------|
| SDR assigned | `sdr` | select | ❓ |
| SDR point of conversion | `sdr_point_of_conversion` | select: Phone / Email / LinkedIn / Inbound / Referral / Other / HubSpotInbound | ❓ |
| SDR salesplay | `sdr_salesplay` | select: the spiff play / project m | ❓ |
| ICP fit | `icp` | boolean | ❓ |
| ICP demo score | `icp_demo_score` | number | ❓ |
| **NOT tracked in HubSpot:** Conversations, pitches, meetings scheduled, EMH | Manual via #sdr-stats | | ❌ Self-reported only |
| Show rate (booked → held) | `demo_held` (boolean), `demo_held_month` | Yes/No select | ❓ |
| First demo date | `first_demo_held_date` | date | ❓ |
| Qualifying Opportunity timestamp | `stage_qualifying_opportunity_stamp` | number | ❓ |
| **Ask:** | Adia Barkley for what BDRs actually fill in | | |

---

### Stage 3–5: AE Sales Process

| Metric | Field Name | Type | Populated? |
|--------|-----------|------|-----------|
| Demo held confirmation | `demo_held` | boolean | ❓ |
| Evaluating Solution timestamp | `stage_evaluating_solution_stamp` | number | ❓ |
| Unpaid Pilot timestamp | `stage_unpaid_pilot_stamp` | number | ❓ |
| Negotiating Terms timestamp | `stage_negotiating_terms_stamp` | number | ❓ |
| Awaiting Signature timestamp | `stage_awaiting_signature_stamp` | number | ❓ |
| Closed Won timestamp | `stage_closed_won_stamp` | number | ❓ |
| **Time to Close (calculated)** | `time_to_close` | calculation | ✅ Auto |
| **Time to Close from Demo** | `time_to_close__from_demo_scheduled_` | calculation | ✅ Auto (if demo date set) |
| TTC band | `ttc_band_v1` | select: 0-10 / 10-20 / 20-30 / 30-60 / 60-90 / 90+ days | ❓ |
| **Closed Lost reason (AskElephant AI)** | `closed_lost_askelephant` | **select: Pricing / Timing / Competitor / Product / Lack of Internal Alignment / Time to Value / Buying experience / Ghosted** | ❓ |
| **Closed Won reason (AskElephant AI)** | `closed_won_reason_askelephant` | **select: Urgent Business Need / Competitive Advantage / Strong Product Fit / Champion Support / Clear Value/ROI / Price or Budget / Buying experience** | ❓ |
| Competitors evaluated | `competitors__evaluated` | checkbox (45+ options) | ❓ |
| Competitor incumbent | `competitors__incumbent` | checkbox | ❓ |
| Primary threat | `competitors__primary_threat` | select | ❓ |
| Deal viability | `deal_viability_context_askelephant` | select: Not Sellable / Weak / Sellable / Very Strong | ❓ |
| Deal intervention risk | `deal_intervention_risk_level_askelephant` | select: Low / Medium / High / Critical | ❓ |
| Stalled reason | `stalled_reason` | checkbox: Budget / Executive Approval / Technical Req / Buyer Timeline / Champion Went Dark / Internal AE / Contract-Legal / Other | ❓ |
| Probability to close | `probability_to_close_by_close_date_askelephant` | number | ❓ |
| MEDDIC Champion score | `champion_score_askelephant` | number | ❓ |
| Sandler total score | `sandler_sales_score` | number | ❓ |
| Value prop alignment | `value_prop__aligned_vs_misatched` | select: Highly Aligned / Aligned / Misaligned | ❓ |
| ARR | `hs_arr` | number | ✅ If amount set |
| MRR | `hs_mrr` | number | ✅ If amount set |
| **Win rate (computed)** | Won / (Won + Lost) = **30.3%** | Calculated from live data | ✅ Live |
| **Ask:** | Ben Kinard for which AE fields are actually required / populated | | |

---

### Stage 6: CSM Onboarding & Retention

| Metric | Field Name | Type | Populated? |
|--------|-----------|------|-----------|
| CSM assigned | `csm` | select | ❓ |
| Onboarding rep | `onboarding_rep` | checkbox | ❓ |
| SOW status | `sow_status` | select: Complete / Draft / Preliminary / Requires Clarification / No SOW Discussed / Revised | ❓ |
| Expansion signals | `expansion_signals_and_future_opportunities` | html | ❓ AI-written |
| CS persona score | `cs_persona_score` | number | ❓ |
| Kickoff validation gaps | `cs_kickoff_validation_gaps` | html | ❓ AI-written |
| TAS (Total Addressable Seats) | `tas__total_addressable_seats` | number | ❓ |
| VAS (Verified Addressable Seats) | `vas___verified_addressable_seats` | number | ❓ |
| Expansion prep score | `vas__expansion_prep_score` | number | ❓ |
| Win-back likelihood | `win_back_likelihood_askelephant` | number | ❓ |
| Success Pipeline stage | HubSpot Success Pipeline stages | — | ⚠️ Only 11 of 769 customers tracked |
| **Ask:** | Ben Harrison for CSM onboarding workflow and what's required | | |

---

## What's In PostHog (Product Analytics — Project 81505: Production)

PostHog tracks **product behavior**, not revenue. Here's what's available:

### Activation / Onboarding Events
| Event | What It Signals |
|-------|----------------|
| `auth:first_login` | New user activated |
| `$identify` | User identified (links anonymous → known user) |
| `$groupidentify` | Workspace/company identified |
| `create_team_member:form_submit` | New team member added |

### Core Product Usage Events
| Event | What It Signals |
|-------|----------------|
| `audio_recording_started` | User started recording a meeting |
| `audio_recording_upload_completed` | Meeting successfully captured |
| `audio_recording_upload_failed` | Capture failure (reliability signal) |
| `desktop:recording_started` / `desktop:recording_stopped` | Desktop recording |
| `deepgram:transcription_created` | Transcript generated |
| `meeting_summary:viewed` | User viewed a meeting summary |
| `chat:opened` / `chat:message_submitted` | Global chat engagement |
| `chat:streaming_completed` / `chat:streaming_failed` | AI response delivery |
| `engagement:prepare_button_clicked` | Pre-meeting prep used |

### Integration Events
| Event | What It Signals |
|-------|----------------|
| `hubspot_agent:enabled` / `hubspot_agent:toggled` | HubSpot integration activated |
| `email_agent:enabled` / `email_agent:toggled` | Email agent used |
| `google_drive_agent:enabled` / `google_drive_agent:toggled` | Google Drive used |
| `asana_agent:enabled` | Asana integration used |
| `linear_agent:enabled` | Linear integration used |

### Agent / AI Events
| Event | What It Signals |
|-------|----------------|
| `agents:run_started` | An AI agent was triggered |
| `$ai_generation` | AI content generated |
| `$ai_embedding` | Embedding created (semantic search) |
| `$ai_trace_summary` / `$ai_trace_clusters` | AI trace analytics |

### Mobile Events
| Event | What It Signals |
|-------|----------------|
| `Application Opened` / `Application Backgrounded` | Mobile app usage |
| `mobile:chat_message_submitted` | Mobile chat |
| `mobile:engagement_chat_loaded` | Mobile engagement |

### Key Feature Flags Active (Production)
| Flag | Status | What It Controls |
|------|--------|-----------------|
| `first-class-meeting-summary` | ✅ ON | Meeting summary feature |
| `workflow-nodes-v2` | ✅ ON | Workflow builder nodes |
| `workflow-direct-builder` | ✅ ON | Direct workflow building |
| `crm-agent-upgrades` | ✅ ON | CRM agent upgrades |
| `new-home-page` | ✅ ON | New home page |
| `global-chat-exp-v2` | ✅ ON | Global chat v2 |
| `usage-dashboard-enabled` | ✅ ON | Usage dashboard |
| `non-manager-workflows-access` | ✅ ON | Non-manager workflow access |
| `v2-mcp-tools-enabled` | ✅ ON | MCP tools |
| `composio-enabled` | ✅ ON | Composio integrations |
| `fga-engine-beta` | ✅ ON | FGA (Fine-grained access) engine |
| `hubspot-shadow-nova2` | ✅ ON | HubSpot shadow (new HubSpot sync) |
| `gong-integration-enabled` | ✅ ON | Gong integration |
| `sso-login-enabled` | ✅ ON | SSO login |
| `entity-view-redesign` | ⬜ OFF | Entity view redesign (in progress) |
| `integration-notion-mcp-enabled` | ⬜ OFF | Notion MCP (off) |

### What PostHog CANNOT Answer (Funnel Questions)
| Question | Why Not Available |
|----------|-----------------|
| Win rate / close rate | PostHog has no revenue data |
| ACV / ARR | No billing events tracked |
| Stage conversion rates | No CRM pipeline events |
| CAC | No spend data |
| NRR / churn | No subscription lifecycle events |
| BDR metrics | Not instrumented |

**PostHog → Funnel connection point:** Use PostHog to measure **product activation → retention** (recordings started per new user, first login → first recording, chat engagement depth). This fills the CSM side of the funnel that HubSpot doesn't capture.

---

## What's NOT Tracked Anywhere

| Metric | Missing From | Who to Ask | How to Fix |
|--------|-------------|-----------|-----------|
| **Billing / payment data** | All systems | Andrew Brown (Ops) | Find billing system (Stripe likely) |
| **BDR outreach volume** (total touches, sequences) | All systems | Adia Barkley | Connect sequencing tool |
| **Ad spend / CPL** | All systems | Tony Mickelsen | Connect LinkedIn/Google Ads |
| **HubSpot marketplace installs** | All systems | James Hinkson | HubSpot Partner Portal |
| **NRR / GRR** | All systems | Ben Harrison + Andrew Brown | Build from billing + HubSpot |
| **Onboarding completion** (time to first recording) | PostHog (not defined) | Dylan Shallow (Data Eng) | Define event + PostHog funnel |
| **Product activation rate** (% of new customers who record week 1) | PostHog (not defined) | Dylan Shallow | PostHog cohort |
| **Pilot usage during trial** | PostHog (partial) | Dylan Shallow | Add trial cohort filter in PostHog |

---

## HubSpot Fields That Need a Population Audit

These fields are **defined and configured** but we don't know if AEs are actually filling them in:

**High priority to check (run a sample query):**
- `closed_lost_askelephant` — Is it filled on Closed Lost deals?
- `first_demo_held_date` — Is it filled when demo happens?
- `stage_qualifying_opportunity_stamp` — Is the timestamp being written?
- `marketing_attribution_agent` — Is it filled on new deals?
- `deal_sorce` (SDR/AE/Marketing) — Is it filled on every deal?
- `icp` — Is ICP boolean set on qualified deals?

**To run this audit:** Query HubSpot with `HUBSPOT_SEARCH_DEALS` filtering by `closed_lost_askelephant HAS_PROPERTY` and check sample size vs total lost count (1,768).

---

## How to Connect This Template to Live Data

### Currently Connected (can query any time via MCP)

| Source | MCP Server | How to Query |
|--------|-----------|-------------|
| HubSpot deals | `user-composio` → `HUBSPOT_SEARCH_DEALS` | Filter by `dealstage`, `pipeline`, any property |
| HubSpot properties | `user-composio` → `HUBSPOT_READ_ALL_PROPERTIES_FOR_OBJECT_TYPE` | Get field schemas |
| HubSpot contacts | `user-composio` → `HUBSPOT_SEARCH_CONTACTS` | Contact-level data |
| Slack #sdr-stats | `user-composio` → `SLACK_SEARCH_MESSAGES` | Channel ID: `C0A05H709SM` |
| Slack #sales-closed-won | `user-composio` → `SLACK_FETCH_CONVERSATION_HISTORY` | Channel ID: `C08EMFMQ1HC` |
| PostHog events | `user-mcp-posthog-zps2ir` | Project ID: `81505` (Production) |
| PostHog feature flags | `user-mcp-posthog-zps2ir` | Project ID: `81505` |
| PostHog funnels | `user-mcp-posthog-zps2ir` → `POSTHOG_RETRIEVE_FUNNEL_INSIGHTS_IN_PROJECT` | Project ID: `81505` |

### Not Yet Connected (needs setup)

| Source | What's Needed | Who to Ask |
|--------|--------------|-----------|
| Billing / Stripe | Stripe MCP or API key | Andrew Brown |
| BDR sequencing tool | Identify tool (Apollo? Outreach? Salesloft?) then add MCP | Adia Barkley |
| LinkedIn Ads | LinkedIn Ads API or HubSpot ad integration | Tony Mickelsen |
| Google Ads | HubSpot ad integration or direct API | Tony Mickelsen |
| HubSpot Partner Portal | James Hinkson must share marketplace data | James Hinkson |

### To Make the Funnel Template "Live"

The funnel template (`sales-funnel-template.md`) can be updated automatically by running:

1. **HubSpot stage count query** — `HUBSPOT_SEARCH_DEALS` filtered by each `dealstage` value → fills in "Deals currently in stage" per stage
2. **HubSpot closed won + lost totals** → fills in win rate automatically
3. **HubSpot stage timestamp query** — pull `stage_qualifying_opportunity_stamp`, `stage_evaluating_solution_stamp`, etc. on closed deals → compute average time per stage
4. **Closed Lost reason analysis** — `HUBSPOT_SEARCH_DEALS` filtering `closed_lost_askelephant HAS_PROPERTY` → fills in loss reason breakdown
5. **PostHog activation funnel** — `auth:first_login` → `audio_recording_upload_completed` → `meeting_summary:viewed` → fills in onboarding activation rate
6. **#sdr-stats weekly aggregation** → fills in BDR conversion rates from Slack channel history

---

## Who to Ask for What

| Gap | Go To | Question to Ask |
|-----|-------|----------------|
| Are HubSpot custom fields being filled? | Ben Kinard | "Is `closed_lost_askelephant` required when marking Closed Lost? Is `first_demo_held_date` set by AEs?" |
| Billing / revenue data source | Andrew Brown | "Where does subscription billing live? Do we use Stripe?" |
| BDR sequencing tool | Adia Barkley | "What tool do you use for outreach sequences? Is there an API or export?" |
| Ad spend + CPL | Tony Mickelsen | "Is HubSpot ads integration configured? Do you have LinkedIn campaign manager access?" |
| PostHog activation funnels | Dylan Shallow (Data Eng) | "Is there a PostHog funnel set up for new user activation? Can you add `trial_started` and `first_recording_captured` events?" |
| HubSpot marketplace data | James Hinkson | "How many installs are coming from the HubSpot marketplace per month? Where do you track those?" |
| Customer success metrics | Ben Harrison | "Why are only 11 customers in the Success Pipeline? Is there a different system for tracking retention?" |
| NRR / churn | Ben Harrison + Andrew Brown | "Do we have a way to pull renewal rates or churn? Is that tracked in HubSpot, billing, or somewhere else?" |
