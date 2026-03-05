# AskElephant Full Sales Funnel Map
> Last updated: March 4, 2026 | Source: HubSpot (live pull), #sdr-stats, #sales-closed-won, BDR Stats Dashboard

---

## Overview

This document maps the complete revenue funnel from initial lead touch through CSM renewal, with known metrics, data sources, team ownership, and identified gaps at every stage. The goal is to give a single consolidated view across Marketing, BDR, AE, Partnership, and CX — and highlight where we're losing water.

---

## Funnel Architecture

```
[LEAD SOURCES]
     │
     ▼
[STAGE 1: Lead Capture] ── Marketing + Growth
     │
     ▼
[STAGE 2: BDR Outbound Qualification] ── BDR Team (reports to Ben Harrison / CX)
     │  Conversations → Pitches → Meetings Scheduled → EMH (demos held)
     ▼
[STAGE 3: AE Sales Process] ── AE Team (reports to Ben Kinard / Sales)
     │  Qualifying → Evaluating → Pilot → Negotiating → Awaiting Sig → Closed Won
     ▼
[STAGE 4: HubSpot Partnership Track] ── James Hinkson (reports to Ben Kinard)
     │  Referrals → Qualified → Closed
     ▼
[STAGE 5: CSM Onboarding & Expansion] ── CX Team (Ben Harrison)
     │  Kickoff → Onboarding → 1-12 Month Journey → Renewal / Expansion
     ▼
[STAGE 6: Expansion / Upsell] ── Parker Alexander (Expansion CSM)
```

---

## Stage 1 — Lead Generation

**Team Owner:** Tony Mickelsen (VP of Marketing) + Robert Henderson (Head of Growth)

### Lead Sources
| Source | Description | Status |
|--------|-------------|--------|
| Paid Ads | Managed by Tony's team (Coco, Kayson, Quinn) | Active |
| LinkedIn Organic | Content posts, thought leadership | Active |
| HubSpot App Marketplace | James Hinkson's partnership channel | Active |
| Inbound (website, free trial) | Organic/SEO | Active |
| BDR Cold Outbound | Adia's "peanut leads" workflow (see `#peanut-leads-strategy`) | Active |
| Referrals | Customer + partner referrals → "Referred" stage in HubSpot | Active |

### HubSpot Entry Stage
**Stage 0** (label: "Stage 0", probability: 1%) — Initial lead capture entry point

### Metrics Available
| Metric | Value | Source |
|--------|-------|--------|
| Lead → Pipeline entry rate | ❌ Unknown | HubSpot (not pulled) |
| Ad impressions → clicks | ❌ Unknown | Ad platform |
| Ad clicks → leads | ❌ Unknown | Ad platform |
| Cost per lead | ❌ Unknown | Marketing / Finance |

### Key Gap
**No top-of-funnel visibility.** We don't have a unified view of how many leads enter Stage 0 per week/month, what source they came from, or what the marketing-to-lead conversion rate is. This is the biggest blind spot for calculating true CAC.

---

## Stage 2 — BDR Outbound Qualification

**Team Owner:** Adia Barkley (Founding BDR, lead), Carter Thomas, Michael Haimowitz, Thomas Taylor  
**Reports to:** Ben Harrison (Head of CX)  
**Data source:** `#sdr-stats` (daily self-reported), BDR Stats Dashboard

### Funnel Steps (BDR)
```
Conversations (cold touches)
     → Pitches (interested enough to hear the pitch)
         → Meetings Scheduled
             → Effective Meetings Held (EMH = demos actually held)
```

### Conversion Rates — Phone Channel (Adia, live from dialer, Mar 4, 2026)

> Source: Adia Barkley, posted in Slack thread. Numbers pulled directly from the dialer — note HubSpot call properties show different numbers (known discrepancy).

| Step | Volume | Rate |
|------|--------|------|
| Dials | 2,029 | — |
| Connected | 178 | **8.8%** of dials |
| Meaningful Conversations | 103 | **5.1%** of dials |
| Positive Outcomes | 41 | **2.0%** of dials / **39.8%** of meaningful convos |

> **Positive Outcome** = Meeting scheduled, follow-up scheduled, OR prospect said "call me back" / "introduce me to RevOps" — broader than just booked meetings.

### Conversion Rates — LinkedIn Channel (partial month, just started tracking)

| Step | Volume | Rate |
|------|--------|------|
| Connect requests sent | ~447 (derived) | — |
| New Messages sent | 188 | **42.1%** of connect requests |
| Conversations | 27 | **14.4%** of messages |
| Meetings Booked | 4 | **14.8%** of conversations / **0.9%** of contacts |

### Conversion Rates — Conversations (avg per rep per month)

| Step | Volume | Rate |
|------|--------|------|
| Conversations / month | 90 | — |
| Pitches (ask for meeting) | 59.6 | **66.2%** of convos |
| Meetings Scheduled | 15.0 | **25.2%** of pitches |
| Effective Meetings Held | 14.8 | **98.5% show rate** · **16.4%** of convos |

### Derived Full Funnel (Phone)
```
2,029  Dials
  ↓ 8.8%
  178  Connected
  ↓ 57.9% (103/178)
  103  Meaningful Conversations
  ↓ 39.8%
   41  Positive Outcomes (meetings + warm follow-ups)
```

### Derived Full Funnel (Per Rep / Month)
```
90   Conversations
  ↓ 66.2%
59.6  Pitches
  ↓ 25.2%
15.0  Meetings Scheduled
  ↓ 98.5% (show rate — nearly all booked meetings happen)
14.8  Effective Meetings Held
```

> ⚠️ **Key corrections from previous estimates:**
> - Show rate is **98.5%** — not ~35% as previously estimated. Once a meeting is booked, it almost always happens.
> - Conv → Pitch: **66.2%** (prev est: ~73%)
> - Pitch → Booked: **25.2%** (prev est: ~35%)
> - Conv → Demo Held: **16.4%** (prev est: ~9%) — nearly 2x higher

### Data Source Note
- Phone dials and connected rates come from the **dialer** (not HubSpot)
- HubSpot call properties show different numbers — Adia notes "Call properties in HubSpot are weird"
- **Dialer is the source of truth for BDR volume metrics**
- LinkedIn tracking just started — data is partial month only

### Key Metrics Still Missing
| Gap | Why It Matters |
|-----|----------------|
| Dialer tool name | Not confirmed — need to ID so we can connect it |
| LinkedIn tracking over time | Just started; no historical baseline yet |
| Dials needed per EMH | 2,029 dials → 41 positive outcomes = ~49 dials per outcome |
| EMH → Qualified opportunity rate | Still no HubSpot data on demo-to-pipeline conversion |
| Time-to-book from first dial | Lag between contact → booked |

---

## Stage 3 — AE Sales Process

**Team Owner:** Pete Belliston (Sr. AE), Reuben Tang (AE), Jamis Benson (AE I), Michael Cook (AE), Nathan Williams (AE), Matthew McNulty (PMMS), Tanner Mattson (PMM)  
**Reports to:** Ben Kinard (Head of Sales)  
**Data source:** HubSpot — AskElephant Sales Pipeline

### Pipeline Stages (HubSpot: AskElephant Sales Pipeline)
| Stage | Label | HubSpot Probability | Notes |
|-------|-------|---------------------|-------|
| 0 | Stage 0 | 1% | Lead entry / MQL |
| 1 | Referred | 1% | Partner or customer referral |
| 2 | No Show | 1% | Demo didn't happen; follow-up needed |
| 3 | Limbo (No SNE) | 1% | Stalled — no "someone not engaged" |
| 4 | Qualifying Opportunity | 1% | First meaningful discovery/demo held |
| 5 | Evaluating Solution | 35% | Prospect actively evaluating |
| 6 | Unpaid Pilot | 35% | Trial underway |
| 7 | Negotiating Terms | 35% | Commercial negotiation active |
| 8 | Awaiting Signature | 68% | Contract sent, signature pending |
| 9 | Closed Won | 100% | ✅ Revenue |
| 10 | Closed Lost | 0% | Lost deal |

### Recent Closed-Won Examples (Feb–Mar 2026, from #sales-closed-won)
| Company | Deal Value | Seats | Win Reason Summary |
|---------|-----------|-------|-------------------|
| Boostability | **$21,000** | Expansion | 10-month CS pilot gave confidence; VP-to-VP credibility |
| Revver | **$19,200** | — | 30-day pilot with success metrics + dedicated support |
| We Recycle Solar | **$5,759.76** | Multiple | 3 deals in 2.5 months; low-friction $100/seat pilot |
| Truss | **$5,250** | 35 seats | Urgency (Rome trip deadline) + user flexibility removed risk |
| Bottlecapps | **$5,040** | 6 seats | Pricing cliff urgency; CEO+COO alignment |
| Rillet | **$3,240 ARR** | 3 (pilot) | Repositioning as "handoff automation platform" |
| Levvy | **$2,159.78** | 2 seats | Hiring risk mitigation positioning |
| RunDiffusion | **$1,848** | Combined | Sales workflow automation fit; HubSpot native |
| Riv Solar | **$1,299.87** | 1 seat | "Rep intelligence platform" reframing |
| The Paul Bramson Companies | **$599.88** | 2 seats | Internal champion (Cassandra) + partnership commission model |

### Deal Value Summary
| Metric | Value |
|--------|-------|
| Range (recent wins) | $600 – $21,000 |
| Typical SMB deal | $1,500 – $5,500 |
| Mid-market / expansion deal | $5,000 – $21,000 |
| **Estimated ACV (blended)** | **~$4,000–$6,500** (rough; no formal ACV pull yet) |

### Product Pricing Reference (HubSpot Products)
| Product | Monthly | Annual |
|---------|---------|--------|
| AskElephant Notetaker | $25/mo | $300/yr |
| AskElephant Plus | $49.99/mo | — |
| AskElephant Premium | $99.99/mo | $1,200/yr |
| Enterprise SSO + Provisioning | add-on | $750 |
| ELB ICP Workflow | — | $3,000 |

### Live HubSpot Metrics (pulled March 4, 2026)

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Closed Won** | **769 deals** | All-time, AskElephant Sales Pipeline |
| **Total Closed Lost** | **1,768 deals** | All-time |
| **Win Rate** | **30.3%** | Won / (Won + Lost) |
| **Loss Rate** | 69.7% | |
| **Active Pipeline** | 407 deals | Open, not yet terminal |
| **Average ACV (mean)** | **$3,884** | From most recent 200 CW deals |
| **Median ACV** | **$1,558** | More representative; $1k–$3k is the most common bucket |
| **Deal Size Range** | $0 – $42,300 | |
| **Success Pipeline (CSM)** | 11 deals tracked | Severely under-tracked — needs attention |

#### Deal Size Distribution (most recent 200 Closed Won)
| Bucket | Count | % |
|--------|-------|---|
| < $500 | 22 | 11% |
| $500–$1k | 35 | 18% |
| **$1k–$3k** | **77** | **38%** ← mode |
| $3k–$5k | 24 | 12% |
| $5k–$10k | 21 | 10% |
| $10k+ | 21 | 10% |

#### Monthly Closed Won (recent)
| Month | Deals Closed | ARR |
|-------|-------------|-----|
| Dec 2025 | 48 | $300,846 |
| Jan 2026 | 75 | $256,807 |
| Feb 2026 | 75 | $214,933 |
| Mar 2026 | 2 (partial) | $4,260 |

> ⚠️ **Signal**: Same deal volume (75) in Jan and Feb, but ARR dropped $42K. Average deal size is trending down month over month.

#### Active Pipeline by Stage (first 200 of 407 open deals)
| Stage | Deals | Pipeline Value |
|-------|-------|---------------|
| Stage 0 | 20 | $536,724 |
| Referred | 3 | $6,000 |
| No Show | 5 | $184,800 |
| Limbo (No SNE) | 25 | $67,063 |
| Qualifying Opportunity | 45 | $2,340,901 |
| Evaluating Solution | **75** | **$4,091,607** |
| Unpaid Pilot | 4 | $6,177 |
| Negotiating Terms | 17 | $157,329 |
| Awaiting Signature | 6 | $26,798 |

> **Notable**: A single deal in Qualifying stage — "Patsnap - 186 sales, 11 CS, 2 RevOps" — is valued at $238,000. Also "ELB Learning" in Success Pipeline at $51,000 in Kickoff.

### Key Metrics Still Missing
| Gap | Why It Matters |
|-----|----------------|
| Stage-to-stage conversion rates | E.g., Qualifying → Evaluating %, Pilot → Won % — need historical stage movement data |
| Average sales cycle length | Time from created → Closed Won; need to query createdate vs closedate |
| Closed Lost reasons | Many zero-amount lost deals; reason field likely unpopulated — needs audit |
| No Show → Rebook rate | 5 active No Show deals ($184K value) — are these being followed up? |
| Limbo recovery rate | 25 deals stuck in Limbo — how many ever move forward? |
| CAC | Sales + Marketing spend / New customers; not currently tracked |

---

## Stage 4 — HubSpot Partnership Track

**Team Owner:** James Hinkson (Head of HubSpot Partnership, reports to Ben Kinard)

### How It Works
- Leads come in as **"Referred"** in HubSpot pipeline (Stage 1)
- HubSpot marketplace installs may self-select or require BDR/AE touch
- Separate motion from direct BDR outbound — typically warmer, faster close

### Metrics Available
- "Referred" stage exists in pipeline
- `#peanut-leads-strategy` channel has active coordination around this motion (8 members)

### Key Metrics Missing
| Gap | Why It Matters |
|-----|----------------|
| Referral volume per month | Size of this channel vs. direct outbound |
| Referral-to-close rate | Does this close faster/higher than BDR-sourced? |
| HubSpot marketplace install → trial → paid conversion | Core partnership funnel |

---

## Stage 5 — CSM Onboarding & Retention

**Team Owner:** Ben Harrison (Head of CX), Eli Gomez, Erika Vasquez, Tyler Whittaker, Wyatt Cooper, Matthew Bennett (Solutions Engineer), Jake Allen (Technical Support)  
**Data source:** HubSpot — Success Pipeline

### Success Pipeline Stages
| Stage | Label | HubSpot Probability | Notes |
|-------|-------|---------------------|-------|
| 1 | Kickoff Call | 50% | First post-sale customer touchpoint |
| 2 | Onboarding (30 Days) | 50% | Setup, integration, first active use |
| 3 | 1–3 Months | 30% | Early adoption; churn risk window |
| 4 | 4–6 Months | 50% | Stabilization; expansion signal window |
| 5 | 7–9 Months | 70% | Deep adoption; renewal conversation starts |
| 6 | 10–12 Months | 90% | Near-renewal; expansion likely |
| 7 | Pilot Conversion | 70% | Unpaid pilot → paid conversion |
| 8 | Closed Won | 100% | Renewed or expanded |
| 9 | Closed Lost | 0% | Churned |

### Live Success Pipeline (HubSpot, all 11 deals tracked)
| Stage | Account | ARR |
|-------|---------|-----|
| Kickoff Call | ELB Learning 12 month - reduced | $51,000 |
| Kickoff Call | Pearagon - Annual Contract | $174 |
| Kickoff Call | Boostability - Annual Contract | $850 |
| Onboarding (30 Days) | Quest Build - New Partner Deal | $50 |
| Onboarding (30 Days) | Clozd - Annual Contract | $21,600 |
| Onboarding (30 Days) | Epirco Group - 2 | $50 |
| 1–3 Months | Agility - Annual Contract | $1,600 |
| Closed Won (Renewed) | Orchard Tek - Expansion | $600 |
| Closed Won (Renewed) | set2close - Expansion | $600 |
| Closed Won (Renewed) | Teikametrics - 5 | $665 |
| Churned | ELB Learning Annual Contract | $4,625 |

> ⚠️ **Only 11 accounts in the Success Pipeline** — this is massively under-tracked given 769 total Closed Won deals. Most won accounts are not being moved into CSM tracking.

### What We Know
- "50% of our revenue growth came from current customers" — Woody, All Hands Jan 2026
- "Added almost $1M ARR in 3 months" — Robert Henderson, All Hands Jan 2026
- Boostability win confirms: 10-month CS pilot was proof point for $21K expansion
- We Recycle Solar: 3 deals in 2.5 months → pilot model drives rapid expansion

### Key Metrics Still Missing
| Gap | Why It Matters |
|-----|----------------|
| NRR (Net Revenue Retention) | Core retention health metric; Success Pipeline under-tracked |
| Churn rate | Only 1 churned account visible in Success Pipeline |
| Onboarding completion rate | Only 3 accounts in Onboarding stage |
| Pilot conversion rate | Unpaid Pilot stage: only 4 open deals ($6K) |
| Expansion rate | 3 Closed Won accounts visible in Success Pipeline; real number much higher |

---

## Stage 6 — Expansion / Upsell

**Team Owner:** Parker Alexander (Expansion CSM)

### What We Know
- Expansion is a primary growth lever ("50% of ARR growth from existing customers")
- Boostability ($21K expansion), RunDiffusion (added expansion deal), We Recycle Solar (3 deals), Truss (35-seat expansion)
- Parker Alexander is dedicated to this motion (1-year tenure)

### Key Metrics Missing
| Gap | Why It Matters |
|-----|----------------|
| Expansion ARR as % of total new ARR | Validates land-and-expand model |
| Avg seats at start vs. at 12 months | Seat growth per account |
| Trigger events for expansion conversations | What signals tell CSM it's time to ask? |

---

## Summary: Known Metrics (Consolidated)

| Stage | Metric | Value | Source |
|-------|--------|-------|--------|
| BDR (Phone) | Dial → Connected | **8.8%** | Dialer (Adia, Mar 4) |
| BDR (Phone) | Connected → Meaningful Conv | **57.9%** | Dialer |
| BDR (Phone) | Meaningful Conv → Positive Outcome | **39.8%** | Dialer |
| BDR (Phone) | Dial → Positive Outcome | **2.0%** | Dialer |
| BDR (LinkedIn) | Connect Request → Message | **42.1%** | Slack (partial month) |
| BDR (LinkedIn) | Message → Conversation | **14.4%** | Slack (partial month) |
| BDR (LinkedIn) | Conversation → Meeting | **14.8%** | Slack (partial month) |
| BDR (Per Rep) | Conv → Pitch rate | **66.2%** | Adia, Mar 4 |
| BDR (Per Rep) | Pitch → Meeting Booked | **25.2%** | Adia, Mar 4 |
| BDR (Per Rep) | **Show rate** | **98.5%** | Adia, Mar 4 (⚠️ was est. ~35%) |
| BDR (Per Rep) | Conv → Demo Held (blended) | **16.4%** | Adia, Mar 4 (⚠️ was est. ~9%) |
| BDR (Per Rep) | Meetings Held / month / rep | **14.8** | Adia, Mar 4 |
| AE | **Win rate** | **30.3%** | HubSpot live |
| AE | Total Closed Won (all-time) | **769 deals** | HubSpot live |
| AE | Total Closed Lost (all-time) | **1,768 deals** | HubSpot live |
| AE | Active pipeline | **407 deals** | HubSpot live |
| AE | **Median ACV** | **$1,558** | HubSpot live (200 recent CW) |
| AE | **Mean ACV** | **$3,884** | HubSpot live (skewed by large deals) |
| AE | Monthly deals closed | **~75/mo** (Jan–Feb 2026) | HubSpot live |
| AE | Monthly ARR closed | $215K–$301K/mo | HubSpot live |
| AE | Largest pipeline deal | $238K (Patsnap, Qualifying) | HubSpot live |
| CSM | Success Pipeline tracked | **11 accounts** (severely under-tracked) | HubSpot live |
| Company | ARR from expansion | ~50% | Woody, Jan 2026 All Hands |
| Company | ARR added in Q4 2025 | ~$1M | Robert Henderson |

---

## Summary: Metric Gaps (Prioritized)

### Priority 1 — Revenue-Critical (Blind Spots)
| Metric | Where to Get It | Owner |
|--------|----------------|-------|
| **CAC (Customer Acquisition Cost)** | Marketing + Sales spend / new customers won | Finance/Andrew Brown |
| **Win rate** (Closed Won / All Qualified) | HubSpot deal query | Ben Kinard |
| **Average Sales Cycle** | HubSpot stage timestamps | Ben Kinard |
| **NRR / Gross Revenue Retention** | HubSpot Success Pipeline + billing | Ben Harrison |
| **Pilot → Paid conversion rate** | HubSpot (Unpaid Pilot stage) | Ben Harrison |

### Priority 2 — Funnel Health
| Metric | Where to Get It | Owner |
|--------|----------------|-------|
| **BDR show rate (EMH/Meetings)** | #sdr-stats — tracking started Feb 2026 | Adia Barkley |
| **EMH → Qualified opportunity rate** | HubSpot BDR handoff tracking | Ben Kinard + Ben Harrison |
| **Closed Lost reasons** | HubSpot Closed Lost field | Ben Kinard |
| **No Show recovery rate** | HubSpot Stage 2 data | AE team |
| **Lead source attribution** | HubSpot lead source field | Tony Mickelsen |

### Priority 3 — Top of Funnel
| Metric | Where to Get It | Owner |
|--------|----------------|-------|
| **Ad spend → leads (CPL)** | Ad platforms (LinkedIn, Google) | Tony Mickelsen |
| **Website → trial/demo request rate** | PostHog / HubSpot forms | Robert Henderson |
| **HubSpot marketplace installs** | HubSpot Partner Portal | James Hinkson |
| **BDR outreach volume** | Sequencing tool or manual (currently only self-reported) | Adia Barkley |

---

## Gap Analysis: Where to Add Water

### 🔴 Biggest Leaks

1. **BDR Show Rate (~35%)** — of every meeting scheduled, ~65% don't happen. Improving no-show recovery or pre-meeting confirmation process could significantly increase demos without increasing outreach volume.

2. **No Show → Rebook flow** — HubSpot has a "No Show" stage, but there's no tracking of how many no-shows recover. These are warm leads sitting idle.

3. **Pilot → Paid conversion** — Multiple deals go to Unpaid Pilot, but we don't track what % convert. This is a critical revenue timing point.

4. **Lead source attribution** — We don't know if BDR outbound, ads, or HubSpot marketplace delivers the highest LTV customers. This makes marketing spend optimization impossible.

5. **CAC is unmeasured** — Without a CAC number, we can't calculate payback period, LTV:CAC ratio, or determine which channels are most efficient.

### 🟡 High-Leverage Improvements

6. **Adia's stats aren't in the dashboard** — She's the most senior BDR and holds the benchmark rates. Adding her to the tracking would improve team averages visibility.

7. **Top-of-funnel lead volume is invisible** — We know what happens once a BDR touches a lead, but not how many leads are entering the system from marketing each week.

8. **Time-to-first-value in onboarding** — The Kickoff stage has 50% probability, which suggests uncertainty. Defining a clear "first value" milestone (first meeting captured? First workflow triggered?) would reduce early churn.

---

## Recommended Next Steps

| Action | Owner | Priority |
|--------|-------|----------|
| Pull HubSpot stage conversion report (Qualifying → each stage → Closed Won) | Tyler → Ben Kinard | High |
| Define CAC calculation methodology and pull Q4 2025 data | Tyler → Andrew Brown | High |
| Add Adia's stats to BDR dashboard data | Tyler → Adia Barkley | Medium |
| Define "first value" milestone in Onboarding stage | Tyler → Ben Harrison | High |
| Instrument lead source tracking in HubSpot (ad UTMs → Stage 0) | Tony Mickelsen + Robert Henderson | High |
| Pull Pilot → Closed Won conversion rate from HubSpot | Tyler → Ben Kinard | Medium |
| Add Closed Lost reason dropdown + make mandatory in HubSpot | Ben Kinard | Medium |
| Pull NRR from HubSpot Success Pipeline (churn + expansion) | Tyler → Ben Harrison | High |

---

## Data Sources Reference

| Source | What It Tracks | Access | Notes |
|--------|---------------|--------|-------|
| `#sdr-stats` (Slack) | Daily BDR: convs, pitches, meetings, EMH | BDR Stats Dashboard | Channel ID: `C0A05H709SM` |
| BDR Dialer | Phone: dials, connected, conversations, outcomes | **Direct from dialer tool** (unconnected) | Source of truth for phone metrics |
| Slack GTM channel (`C0AJ37A7L3V`) | BDR strategy, funnel numbers, ICP planning | Slack MCP | Contains real funnel stats posted by Adia |
| `#sales-closed-won` | AE wins with deal value + win reason | AskElephant bot auto-posts | Channel ID: `C08EMFMQ1HC` |
| HubSpot Sales Pipeline | All deal stages from Stage 0 → Closed | HubSpot MCP (session: bush) | |
| HubSpot Success Pipeline | Post-sale: Kickoff → 12-month journey | HubSpot MCP | Only 11 accounts tracked |
| HubSpot Products | Pricing tiers | HubSpot MCP | |
| BDR Stats Dashboard | `pm-workspace-docs/status/sdr-stats-dashboard.html` | Local | |
| `#peanut-leads-strategy` | Partnership / warm lead coordination | Slack | Channel ID: `C0ABMEUTLSF` |
| SDR Win Stories | Customer win narratives | [Google Doc](https://docs.google.com/document/d/18gxP_zZ2bK6oqzAjAunAhWNh_hZdrOYGdg2SHkgBuG0/edit) | Shared by Sam Ho |
| SDR Revenue Model | Interactive forecast calculator | [Claude Artifact](https://claude.ai/public/artifacts/3d766589-af15-464f-8bd6-0221360e755c) | Built by Adia, sourced from HubSpot |

## Additional Context from GTM Channel (Mar 4, 2026)

From the same Slack thread, other signals worth tracking:

**ICP targeting process being built** (Tony Mickelsen → Jason Harmon):
1. Adia creates first-pass list in Clay (company size, sub-industry)
2. Tony + Adia get stakeholder approval (Woody, Ben)
3. Adia exports company websites → Jason runs HubSpot detection
4. Jason runs HubSpot detection on the list
5. Adia layers on contact-level targeting

> Jason Harmon (Eng) has built a **HubSpot detection tool** — identifies if a prospect company already uses HubSpot. This is the qualifier for the partnership/BDR warm motion.

**Matt Noxon (Eng) on dogfooding:** "We aren't dogfooding our own product enough — maybe we DO have signals and insights set up throughout our funnel. If not we should figure that out."

**Matthew McNulty's opportunity list** (posted same channel):
- ASAP: Lock ICP, switch Adia's targeting to new process
- Short term: Free value campaign, Peanut workflow, revenue process automation, handoff streamlining, partner TOFU automation
- Medium term: Partner-led expansion opportunities
- Long term: App UX fixes, dashboards
