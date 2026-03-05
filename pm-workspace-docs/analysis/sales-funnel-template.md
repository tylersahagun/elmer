# AskElephant Sales Funnel — Blank Template
> A structural canvas for mapping the full revenue funnel. Each stage has defined slots for team, tools, actions, metrics, and conversion rates. Fill in from live data sources as available.

---

## How to Use This Template

Each stage has 7 slots:
1. **Owner** — Who is accountable for this stage
2. **Entry Criteria** — What must be true for a record to be in this stage
3. **Tools / Systems** — Where this work lives (HubSpot, Slack, email, etc.)
4. **Actions Performed** — What the team actually does here
5. **Exit Criteria** — What moves a record to the next stage
6. **Metrics** — What to measure at this stage
7. **Conversion Rate → Next Stage** — The % that advance

Gaps are marked `[ ]`. Filled data is from HubSpot + #sdr-stats pull (Mar 4, 2026).

---

## Stage 0 — Lead Source / Demand Generation

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 0: LEAD SOURCE                                           │
│  "Where does the lead come from?"                               │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | Tony Mickelsen (VP Marketing) + Robert Henderson (Head of Growth) |
| **Entry Criteria** | Any touchpoint that creates a known prospect |
| **Tools / Systems** | Ad platforms (LinkedIn, Google), HubSpot CMS/forms, HubSpot App Marketplace, Cold outreach sequences |
| **Actions Performed** | [ ] Run paid ad campaigns · [ ] Publish LinkedIn content · [ ] Manage HubSpot marketplace listing · BDR cold prospecting via "Peanut leads" workflow |
| **Exit Criteria** | Lead submits a form, books a demo, or is added to HubSpot by a BDR |
| **HubSpot Stage** | Stage 0 (prob: 1%) |

### Metrics Needed
| Metric | Known? | Source |
|--------|--------|--------|
| Ad impressions | [ ] | Ad platform |
| Ad click-through rate | [ ] | Ad platform |
| Cost per click | [ ] | Ad platform |
| Leads generated per month | [ ] | HubSpot |
| Leads by source (ad / organic / referral / BDR) | [ ] | HubSpot (requires UTM tracking) |
| Cost per lead (CPL) | [ ] | Finance |
| Lead → Pipeline entry rate | [ ] | HubSpot |

### Lead Sources (Template)
```
[ ] Paid Ads ─────────────────────────────► HubSpot Stage 0
[ ] LinkedIn Organic ────────────────────► HubSpot Stage 0
[ ] HubSpot Marketplace ─────────────────► HubSpot "Referred"
[ ] Website Inbound / Free Trial ────────► HubSpot Stage 0
[ ] BDR Cold Outreach ───────────────────► BDR Conversation
[ ] Customer / Partner Referral ─────────► HubSpot "Referred"
```

---

## Stage 1 — BDR Qualification (Outbound)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: BDR OUTBOUND QUALIFICATION                           │
│  "Can we get a human conversation?"                             │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | Adia Barkley (Founding BDR, lead) · Carter Thomas · Michael Haimowitz · Thomas Taylor · (reports to Ben Harrison / CX) |
| **Entry Criteria** | Lead exists in outreach list OR enters from ad/form |
| **Tools / Systems** | [ ] Sequencing tool (unknown — confirm with Adia) · Slack #sdr-stats (daily reporting) · HubSpot Stage 0 |
| **Exit Criteria** | Demo scheduled (moves to AE) OR no response after sequence exhausted |
| **HubSpot Stage** | Stage 0 → Qualifying Opportunity |

### Actions Performed
```
Step 1: CONVERSATION
  Who:   BDR (Carter, Mike, Thomas, Adia)
  What:  [ ] Cold call / LinkedIn message / email sequence
  Tool:  [ ] Sequencing tool (confirm)
  Track: Daily self-report in #sdr-stats

Step 2: PITCH
  Who:   BDR
  What:  [ ] Deliver value prop · qualify ICP fit
  Tool:  [ ] Call / message
  Track: Daily self-report in #sdr-stats

Step 3: MEETING SCHEDULED
  Who:   BDR
  What:  [ ] Send calendar invite · add to HubSpot
  Tool:  [ ] Calendly / manual booking
  Track: Daily self-report in #sdr-stats

Step 4: EFFECTIVE MEETING HELD (EMH)
  Who:   BDR → hands off to AE
  What:  [ ] Discovery call or demo held · qualify · pass to AE
  Tool:  AskElephant (should be recording these!)
  Track: Daily self-report in #sdr-stats
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Conversations / day / rep | Carter: ~6–7 · Mike: ~3–4 · Thomas: ~5–6 | #sdr-stats |
| **Conv → Pitch rate** | **~73%** (Mike: 75–82% · Carter: 65–75% · Jamis: 78–85%) | Adia benchmark post 2/5/26 |
| **Pitch → Meeting Booked** | **~35%** (Mike: 28–35% · Carter: 35–45%) | Adia benchmark post |
| **Show rate (Booked → EMH)** | **~35%** (est.) | BDR Dashboard (Feb+ only) |
| **Conv → Demo Held (blended)** | **~9%** (73% × 35% × 35%) | Calculated |
| Conversations needed per held demo | ~11 cold conversations | Calculated |
| Adia's personal stats | [ ] Not in dashboard | n/a |
| Lead source per conversation | [ ] Not tracked | Needs sequencing tool integration |
| BDR → AE handoff rate | [ ] Unknown | Needs HubSpot tracking |

### Conversion Funnel (BDR)
```
100 Conversations
  ↓  73%
73 Pitches
  ↓  35%
26 Meetings Scheduled
  ↓  35% (show rate)
9 Effective Meetings Held (demos)
```

---

## Stage 2 — AE: Demo / Discovery

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: AE DEMO & DISCOVERY                                  │
│  "Is this a real opportunity?"                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | Pete Belliston (Sr. AE) · Reuben Tang · Jamis Benson (AE I) · Michael Cook · Nathan Williams · Matthew McNulty (PMMS) (reports to Ben Kinard) |
| **Entry Criteria** | EMH completed · BDR has handed off · lead added to HubSpot |
| **Tools / Systems** | HubSpot (deal created) · AskElephant (demo recording) · [ ] Demo deck / tool |
| **Exit Criteria** | ICP fit confirmed → moves to Evaluating Solution; No fit → Closed Lost or No Show |
| **HubSpot Stage** | Qualifying Opportunity (prob: 1%) |

### Actions Performed
```
Step 1: DEMO / DISCOVERY CALL
  Who:   AE (assigned)
  What:  [ ] Run product demo · qualify pain · identify decision-maker
  Tool:  AskElephant should record this (confirm)
  Track: HubSpot stage update

Step 2: QUALIFICATION ASSESSMENT
  Who:   AE
  What:  [ ] ICP scoring · budget · authority · need · timing (BANT)
  Tool:  HubSpot deal fields
  Track: [ ] ICP fit score field in HubSpot (not confirmed populated)

Step 3: HANDOFF OR DISQUALIFY
  Who:   AE
  What:  Move to "Evaluating Solution" OR mark "No Show" / "Closed Lost"
  Tool:  HubSpot
  Track: Stage timestamp
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Deals currently in stage | 45 deals · $2.3M pipeline | HubSpot live |
| Demo → Evaluating conversion | [ ] Unknown | Needs HubSpot historical |
| No Show % | [ ] Unknown | HubSpot (5 active No Shows, $184K) |
| Time in stage (avg) | [ ] Unknown | Needs HubSpot date query |
| ICP score tracked | [ ] Not confirmed | HubSpot |

---

## Stage 3 — AE: Evaluating Solution

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: EVALUATING SOLUTION                                  │
│  "Is AskElephant the right fit?"                                │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | AE (assigned) |
| **Entry Criteria** | ICP qualified · prospect actively evaluating AE vs. alternatives |
| **Tools / Systems** | HubSpot · AskElephant · [ ] Competitor comparison materials |
| **Exit Criteria** | Decision to move to Pilot or Negotiation; or Closed Lost |
| **HubSpot Stage** | Evaluating Solution (prob: 35%) |

### Actions Performed
```
Step 1: FOLLOW-UP CALL(S)
  Who:   AE
  What:  [ ] Address objections · share case studies · demo follow-up features
  Tool:  AskElephant (confirm recording)

Step 2: MULTI-STAKEHOLDER ALIGNMENT
  Who:   AE
  What:  [ ] Get decision-maker access · champion identification
  Tool:  HubSpot contacts

Step 3: PROPOSAL / TRIAL OFFER
  Who:   AE
  What:  [ ] Send pricing · propose pilot structure
  Tool:  [ ] HubSpot quotes / email
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Deals currently in stage | **75 deals · $4.1M pipeline** | HubSpot live (largest stage) |
| Evaluating → Pilot conversion | [ ] Unknown | Needs HubSpot historical |
| Evaluating → Won (direct) | [ ] Unknown | Needs HubSpot historical |
| Evaluating → Lost | [ ] Unknown | Needs HubSpot historical |
| Time in stage (avg) | [ ] Unknown | |
| Common objections | [ ] Not systematically tracked | Could pull from AskElephant |

---

## Stage 4 — AE: Unpaid Pilot

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 4: UNPAID PILOT                                         │
│  "Let them try it and prove value."                             │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | AE + Matthew Bennett (Solutions Engineer) |
| **Entry Criteria** | Prospect agreed to trial; AE has structured pilot terms |
| **Tools / Systems** | AskElephant (product itself) · HubSpot · [ ] Pilot success criteria doc |
| **Exit Criteria** | Pilot period ends → convert to paid OR Closed Lost |
| **HubSpot Stage** | Unpaid Pilot (prob: 35%) |

### Actions Performed
```
Step 1: PILOT KICKOFF
  Who:   AE + Solutions Engineer (Matthew Bennett)
  What:  [ ] Set up workspace · onboard pilot users · define success criteria
  Tool:  AskElephant · HubSpot

Step 2: PILOT CHECK-IN(S)
  Who:   AE
  What:  [ ] Mid-pilot review · surface value · address friction
  Tool:  AskElephant calls

Step 3: PILOT CLOSE
  Who:   AE
  What:  [ ] Present usage data · propose paid terms · close
  Tool:  HubSpot · [ ] AskElephant usage report
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Deals currently in stage | 4 deals · $6,177 value | HubSpot live |
| Pilot → Closed Won rate | [ ] Unknown | Needs HubSpot historical |
| Avg pilot length | [ ] Unknown | |
| Pilot success criteria defined | [ ] Not confirmed | |
| Usage during pilot | [ ] Unknown | PostHog / AskElephant product |

---

## Stage 5 — AE: Negotiation & Close

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 5: NEGOTIATION & CLOSE                                  │
│  "Agree on terms and get signature."                            │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | AE (assigned) + Ben Kinard (Head of Sales) on larger deals |
| **Entry Criteria** | Prospect ready to buy; pricing discussion underway |
| **Tools / Systems** | HubSpot · [ ] DocuSign / contract tool · [ ] Slack |
| **Exit Criteria** | Contract signed → Closed Won; No deal → Closed Lost |
| **HubSpot Stages** | Negotiating Terms (prob: 35%) → Awaiting Signature (prob: 68%) → Closed Won (100%) |

### Actions Performed
```
Step 1: NEGOTIATING TERMS
  Who:   AE (+ Ben Kinard escalation)
  What:  [ ] Finalize seat count · pricing · payment terms · add-ons
  Tool:  HubSpot quotes

Step 2: CONTRACT / AWAITING SIGNATURE
  Who:   AE
  What:  [ ] Send contract · follow up on signature
  Tool:  [ ] DocuSign / equivalent

Step 3: CLOSED WON
  Who:   AE → hands to CSM
  What:  Post win to #sales-closed-won (via AskElephant bot) · add to Success Pipeline
  Tool:  AskElephant bot · HubSpot
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Deals in Negotiating Terms | 17 deals · $157K | HubSpot live |
| Deals in Awaiting Signature | 6 deals · $26K | HubSpot live |
| **Overall Win Rate** | **30.3%** (769 Won / 2,537 terminal) | HubSpot live |
| Loss rate | 69.7% | HubSpot live |
| Total Closed Won (all-time) | **769 deals** | HubSpot live |
| Total Closed Lost (all-time) | **1,768 deals** | HubSpot live |
| **Median ACV** | **$1,558** | HubSpot live (200 recent CW) |
| **Mean ACV** | **$3,884** | HubSpot live (skewed by large deals) |
| Negotiating → Won rate | [ ] Unknown | Needs HubSpot stage history |
| Awaiting Sig → Won rate | [ ] Unknown | Should be ~90%+ |
| Avg sales cycle (created → closed) | [ ] Unknown | Needs HubSpot date query |
| Closed Lost reasons | [ ] Not populated | HubSpot field audit needed |

### Monthly Closed Won Trend
| Month | Deals | ARR |
|-------|-------|-----|
| Dec 2025 | 48 | $300,846 |
| Jan 2026 | 75 | $256,807 |
| Feb 2026 | 75 | $214,933 |
| ⚠️ Deal volume flat but ARR declining — avg deal size dropping | | |

---

## Stage 6 — Partnership Track (HubSpot)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 6: HUBSPOT PARTNERSHIP                                  │
│  "Close deals sourced through HubSpot ecosystem."              │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | James Hinkson (Head of HubSpot Partnership, reports to Ben Kinard) |
| **Entry Criteria** | Lead referred by HubSpot marketplace install or partner referral |
| **Tools / Systems** | HubSpot Marketplace · HubSpot CRM ("Referred" stage) · [ ] #peanut-leads-strategy |
| **Exit Criteria** | Same as AE pipeline → Closed Won or Lost |
| **HubSpot Stage** | Referred (prob: 1%) → follows same path as AE pipeline |

### Actions Performed
```
Step 1: REFERRAL INTAKE
  Who:   James Hinkson
  What:  [ ] Qualify referral · route to AE or handle directly

Step 2: SAME AS AE PIPELINE
  Who:   James or AE
  What:  Demo → Evaluate → Pilot → Close
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Deals in Referred stage | 3 active · $6K | HubSpot live |
| Referral volume / month | [ ] Unknown | HubSpot |
| Referral win rate vs. cold outbound | [ ] Unknown | HubSpot (worth comparing) |
| HubSpot marketplace installs | [ ] Unknown | HubSpot Partner Portal |
| Install → trial → paid rate | [ ] Unknown | HubSpot Partner Portal |

---

## Stage 7 — CSM Onboarding

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 7: CSM ONBOARDING                                       │
│  "Get the customer live and capturing value."                   │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | Ben Harrison (Head of CX) · Eli Gomez · Erika Vasquez · Tyler Whittaker · Wyatt Cooper · Matthew Bennett (Solutions Eng) · Jake Allen (Tech Support) |
| **Entry Criteria** | Deal marked Closed Won in HubSpot; AE → CSM handoff complete |
| **Tools / Systems** | HubSpot Success Pipeline · AskElephant (product) · [ ] Onboarding checklist tool |
| **Exit Criteria** | Customer actively using AskElephant; first meeting captured |
| **HubSpot Stages** | Kickoff Call → Onboarding (30 Days) |

### Actions Performed
```
Step 1: AE → CSM HANDOFF
  Who:   AE hands to CSM
  What:  [ ] Internal Slack message · HubSpot note · context transfer
  Tool:  AskElephant (should auto-summarize account history)
  Gap:   [ ] No defined handoff SLA or template confirmed

Step 2: KICKOFF CALL
  Who:   CSM
  What:  [ ] Intro · set goals · define success · configure workspace
  Tool:  AskElephant (confirm recording)

Step 3: 30-DAY ONBOARDING
  Who:   CSM + Solutions Engineer
  What:  [ ] Integrations setup (HubSpot, Zoom, etc.) · user invites · first workflow
  Tool:  AskElephant · Matthew Bennett for technical setup
  Track: HubSpot Success Pipeline
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Accounts in Kickoff | 3 (ELB $51K, Pearagon $174, Boostability $850) | HubSpot live |
| Accounts in Onboarding | 3 (Quest $50, Clozd $21.6K, Epirco $50) | HubSpot live |
| Total accounts in Success Pipeline | **11 (severely under-tracked)** | HubSpot live |
| Onboarding completion rate | [ ] Unknown | |
| Time to first meeting captured | [ ] Unknown | PostHog / product data |
| Kickoff → Active usage rate | [ ] Unknown | PostHog |
| AE → CSM handoff SLA | [ ] Not defined | |

---

## Stage 8 — CSM Retention (1–12 Months)

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 8: CSM RETENTION                                        │
│  "Keep them happy and growing."                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | CSM (assigned) · Parker Alexander (Expansion CSM for upsell) |
| **Entry Criteria** | Onboarding complete; customer in active use |
| **Tools / Systems** | HubSpot Success Pipeline · AskElephant (product) · [ ] QBR template · Slack #customer-feedback |
| **Exit Criteria** | Renewal signed (→ Closed Won in Success Pipeline) OR churn (→ Closed Lost) |
| **HubSpot Stages** | 1–3 Months → 4–6 Months → 7–9 Months → 10–12 Months |

### Actions Performed
```
1-3 MONTHS (Early Adoption)
  Who:   CSM
  What:  [ ] Weekly check-in · usage review · address friction
  Risk:  Highest churn window

4-6 MONTHS (Stabilization)
  Who:   CSM
  What:  [ ] Identify expansion signals · connect to success metrics

7-9 MONTHS (Deep Adoption)
  Who:   CSM + Parker Alexander
  What:  [ ] Begin renewal conversation · expansion proposal

10-12 MONTHS (Pre-Renewal)
  Who:   CSM + Parker Alexander + AE
  What:  [ ] QBR · renewal terms · upsell opportunity
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Accounts by sub-stage | 1 in 1–3mo · 0 in 4–6mo · 0 in 7–9mo · 0 in 10–12mo | HubSpot live |
| **NRR** | [ ] Unknown | Needs billing data + HubSpot |
| **Churn rate** | [ ] (1 churn visible: ELB Learning $4,625) | HubSpot live (severely under-tracked) |
| Expansion rate | [ ] Unknown | |
| QBR cadence | [ ] Not confirmed | |
| Health score / leading indicators | [ ] Not defined | Could use PostHog + AskElephant usage |

---

## Stage 9 — Expansion / Upsell

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 9: EXPANSION                                            │
│  "Grow existing accounts."                                      │
└─────────────────────────────────────────────────────────────────┘
```

| Slot | Value |
|------|-------|
| **Owner** | Parker Alexander (Expansion CSM) |
| **Entry Criteria** | Active customer with signals of more seats needed OR adjacent team fit |
| **Tools / Systems** | HubSpot · AskElephant · Slack |
| **Exit Criteria** | Expansion deal Closed Won; added to #sales-closed-won |

### Actions Performed
```
Step 1: EXPANSION SIGNAL DETECTION
  Who:   Parker + CSM
  What:  [ ] Monitor seat usage · identify new teams / departments
  Tool:  PostHog · AskElephant · HubSpot

Step 2: EXPANSION OUTREACH
  Who:   Parker
  What:  [ ] Contact champion · propose expanded scope
  Tool:  AskElephant · HubSpot

Step 3: CLOSE EXPANSION
  Who:   Parker + AE (for large expansions)
  What:  [ ] New deal in HubSpot · close · post to #sales-closed-won
```

### Metrics
| Metric | Known Value | Source |
|--------|------------|--------|
| Expansion ARR / total ARR | ~50% per Woody (Jan 2026) | Woody All Hands |
| Recent notable expansions | Boostability $21K · Revver $19.2K · RunDiffusion $1.8K | #sales-closed-won |
| Expansion deal count per month | [ ] Unknown | HubSpot |
| Avg expansion deal size | [ ] Unknown | HubSpot |
| Trigger definition (what signals upsell) | [ ] Not defined | Needs definition |

---

## Full Funnel Conversion Chain (Template)

```
STAGE                  METRIC             KNOWN?   VALUE
─────────────────────────────────────────────────────────
Lead Source
  ↓ Lead → Pipeline     Lead entry rate    [ ]      —
Stage 0 / BDR
  ↓ Conv → Pitch        Pitch rate         ✅       ~73%
BDR Outreach
  ↓ Pitch → Booked      Booking rate       ✅       ~35%
Meeting Scheduled
  ↓ Booked → Held       Show rate          ~        ~35% (Feb+ only)
EMH / Demo
  ↓ Demo → Qualifying   Demo-to-opp rate   [ ]      —
Qualifying Opp
  ↓ Qualifying → Eval   [ ]                [ ]      —
Evaluating Solution
  ↓ Eval → Pilot        [ ]                [ ]      —
Unpaid Pilot
  ↓ Pilot → Won         Pilot conv rate    [ ]      —
Negotiating Terms
  ↓ Neg → Sig           [ ]                [ ]      ~high
Awaiting Signature
  ↓ Sig → Won           [ ]                [ ]      ~high
CLOSED WON             Win rate            ✅       30.3%
  ↓ Won → Active        Onboarding rate    [ ]      —
CSM Onboarding
  ↓ Active → Retained   Retention rate     [ ]      —
1–12 Month Journey
  ↓ Retained → Renewed  NRR                [ ]      —
Renewal / Expansion
  ↓ Expansion revenue   Expansion ARR %    ✅       ~50%
```

---

## Data Sources Map

| Stage | Primary Data Source | Secondary | Gap |
|-------|--------------------|-----------|----|
| Lead Generation | [ ] Ad platforms | HubSpot forms | No UTM/attribution tracking confirmed |
| BDR Outbound | #sdr-stats (self-report) | BDR Dashboard | No sequencing tool data |
| Demo / Discovery | HubSpot (Qualifying stage) | AskElephant recordings | No ICP score or structured notes |
| Evaluation | HubSpot (Evaluating stage) | AskElephant recordings | No objection tracking |
| Pilot | HubSpot (Pilot stage) | PostHog (usage) | Pilot success criteria not defined |
| Negotiation / Close | HubSpot | #sales-closed-won | No lost reason data |
| Onboarding | HubSpot Success Pipeline | AskElephant usage | 11 accounts vs 769 won — massive gap |
| Retention | HubSpot Success Pipeline | PostHog | Almost entirely untracked |
| Expansion | #sales-closed-won | HubSpot | No trigger/signal definition |

---

## Priority Action List (What to Fill In First)

| Priority | Gap | Owner | Where to Get It |
|----------|-----|-------|----------------|
| 🔴 1 | Win rate by qualified stage (not overall) | Ben Kinard | HubSpot stage history query |
| 🔴 2 | Avg sales cycle length (created → closed) | Ben Kinard | HubSpot `createdate` vs `closedate` |
| 🔴 3 | Success Pipeline — move all Won accounts in | Ben Harrison | HubSpot bulk update |
| 🔴 4 | Closed Lost reason field — mandatory + audit | Ben Kinard | HubSpot property config |
| 🔴 5 | NRR calculation | Andrew Brown | Billing + HubSpot |
| 🟡 6 | Pilot → Won conversion rate | Ben Kinard | HubSpot stage filter |
| 🟡 7 | Demo-to-qualified conversion (EMH → Qualifying) | Ben Kinard + Adia | HubSpot + #sdr-stats cross-reference |
| 🟡 8 | Lead source attribution (UTM tracking) | Tony Mickelsen | HubSpot + ad platforms |
| 🟡 9 | BDR sequencing tool data | Adia Barkley | Whatever tool BDRs use |
| 🟢 10 | ICP score field in HubSpot | Ben Kinard | HubSpot property |
| 🟢 11 | Onboarding completion milestone | Ben Harrison | AskElephant product + PostHog |
| 🟢 12 | Expansion trigger signals | Parker Alexander | PostHog + HubSpot usage |
