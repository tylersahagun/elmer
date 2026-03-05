# CRM Roadmap Brief: From Meeting Tool to Revenue Platform

> **For**: Sam Ho review
> **From**: Tyler Sahagun
> **Date**: 2026-02-12
> **Time to read**: 10 minutes
> **Supporting research**: [Full competitive analysis](./crm-platform-evolution-research.md) | [Platform thesis](./platform-evolution-thesis.md) | [Feature matrix](./competitive-feature-matrix-expanded.md)

---

## The Problem

AskElephant is perceived as a meeting notetaker. Customers say things like "it's like Fathom but with CRM updates." Meanwhile, competitors like Day.ai are positioning as "Cursor for GTM teams" and building AI-native CRMs that could eventually own the space we want to own.

We need a roadmap that:
1. Ships immediate CRM improvements customers are asking for
2. Progressively shifts perception from "meeting tool" to "revenue intelligence platform"
3. Lays groundwork for eventually becoming the source of truth (not just a pipe to HubSpot)

---

## The Strategic Bet

**Trojan horse, not frontal assault.**

Day.ai, Attio, and Monaco all say "replace your CRM." That's a high-friction, high-risk ask for customers. Our bet is different:

> Enhance the CRM they already have. Earn trust through accuracy. Accumulate signals only we can capture. Become the place they check first.

This works because our conversation intelligence creates data that CRMs literally cannot -- deal stage confidence, champion strength, objection patterns, commitment tracking. That data is our wedge into becoming indispensable.

---

## The Roadmap (4 Pillars)

### Pillar 1: Workflow Builder Enhancements

**What**: Make CRM automation configurable, explainable, and trustworthy.

| Item | Status | Size | Priority | Rationale |
| --- | --- | --- | --- | --- |
| Structured HubSpot agent (property-first config) | Validate phase, core shipped | -- | P0 | Our #1 differentiator. No competitor offers property-first config. Replaces 100+ hours of prompt engineering. |
| Salesforce agent parity | PR open | M | P0 | Customer demand; feature parity with HubSpot agent |
| Deprecate legacy nodes (Pipedream → Composio) | Build phase | L | P1 | Technical debt; blocking new integration work |
| Workflow summary (plain English) | Not started | S | P2 | "This workflow updates 7 HubSpot properties after every sales call." Relay.app and Gumloop both do this. |
| Run history / audit log | Not started | M | P2 | Show last 10 executions with outcomes. Every automation platform has this; we don't. |
| Better variable naming | Not started | S | P3 | "Deal Stage" not `hs_deal_stage`. Quality of life. |
| Explainable elements | Not started | M | P3 | Each node explains what it does in plain English. |
| Prompt editing escape hatch | Not started | S | P3 | Advanced users want custom extraction logic. Offer it without making it the default. |

**Key competitive evidence**: Momentum uses 200+ prompts (James Hinkson: "100+ hours configuring"). We replace that with structured UI. Relay.app's run history and Gumloop's AI Router show the UX bar for workflow builders.

---

### Pillar 2: End User Value & HITL

**What**: Show users the value AskElephant creates, and let them approve CRM writes from where they already work.

| Item | Status | Size | Priority | Rationale |
| --- | --- | --- | --- | --- |
| HITL review -- Slack | Not started | M | P1 | IC reps live in Slack. Approve/reject CRM updates without opening AskElephant. Lindy.ai proves messaging-first works (iMessage). |
| HITL review -- In-app | Partial | M | P1 | RevOps/managers need full review queue with field-level diffs. Relay.app approval model is the benchmark. |
| Value Dashboard ("what I did for you") | Not started | M | P1 | "47 CRM updates this week, 96% accuracy, 12 hours saved." Kills the notetaker perception. Lindy claims "10 hours/week" -- we need our own number. |
| HubSpot App Card enhancements | Shipped (v1) | S | P2 | Show AskElephant-exclusive signals alongside CRM data. Makes the card more valuable than basic CRM views. |
| Showing value in Slack notifications | Not started | S | P2 | Weekly Slack digest: "This week AskElephant completed X updates for your team." |

**Open question**: Where do IC reps actually spend their day? We assume Slack, but need to validate. Proposed method: observational study with 5 IC reps, 1 week.

---

### Pillar 3: CRM Data Structure (Signals) -- The Trojan Horse

**What**: Define and capture structured signals from conversations that CRMs cannot. This is the strategic pivot from "tool that updates CRM" to "intelligence layer that knows more than your CRM."

**The concept**: AskElephant derives structured deal intelligence from every meeting. These "signals" are things HubSpot/Salesforce can never capture from manual data entry:

| Signal | What It Captures | Why CRMs Miss It |
| --- | --- | --- |
| Deal Stage Confidence | True stage vs. CRM-reported | Reps lag on updates; conversations reveal reality |
| Decision Maker Engagement | Who actually decides | CRM tracks contacts, not influence |
| Competitive Mentions | Depth of competitor evaluation | CRM has a field; conversations reveal nuance |
| Objection Themes | Recurring concerns across meetings | CRM captures notes, not patterns |
| Commitment Tracking | Verbal promises with attribution | CRM has no concept of this |
| Champion Strength | Internal advocate's energy over time | CRM tracks contacts, not advocacy |
| Next Steps Adherence | Were agreed actions completed? | CRM captures next steps; no follow-through |
| Buying Signal Density | Positive signals per meeting | CRM has no density concept |
| Stakeholder Sentiment | Emotional tone of participants | CRM is purely factual |
| Deal Velocity | Momentum from conversation cadence | CRM tracks dates, not momentum |

| Item | Status | Size | Priority | Rationale |
| --- | --- | --- | --- | --- |
| Signal ontology v1 (define 10 signals) | Hypothesis only | S | P1 | Must validate with customers before building. Proposed method: co-design workshop with 3-5 RevOps/sales leaders. |
| Signal capture infrastructure | Not started | L | P2 | Backend to extract and store structured signals from meeting content |
| Signal dashboard | Not started | L | P2 | Where users go to see deal intelligence beyond CRM data |
| Enhanced HubSpot App Card (signals) | Not started | M | P2 | Show signals inside HubSpot -- the trojan horse surface |
| Signal-based alerts | Not started | M | P3 | "Deal #1234: champion engagement declining" |
| Cross-deal pattern detection | Not started | L | P3 | "3 deals this quarter mention Competitor X" |

**This is the highest-risk, highest-reward pillar.** The 10 signals are my best hypothesis based on competitive research and customer feedback, but they need validation before we invest in infrastructure.

---

### Pillar 4: Backburner -- HubSpot Audit

**What**: A CRM readiness diagnostic that identifies data quality issues before AskElephant onboarding.

**Why it matters**: The validated hypothesis `crm-readiness-diagnostic` found that implementations fail when HubSpot data is bad (53+ hours of CRM prep before AskElephant can succeed). Partners need diagnostic tools.

**Why it's on backburner**: Not a direct revenue driver today, but becomes strategically important as a wedge into the "CRM expert" positioning and feeds into the signals framework (CRM health as a signal).

**Recommended**: Keep monitoring. Elevate to P2 when signal framework (Pillar 3) is designed. No competitor offers CRM auditing -- this is greenfield.

---

## Timeline View

```
         NOW              Q1 END           Q2 2026         Q3-Q4 2026          2027
          |                  |                |                |                 |
PILLAR 1  |--[Structured Agent]--[SF Parity]--|--[Deprecation]--|                |
          |                  [Run History]    [Workflow UX]     |                |
          |                                                    |                |
PILLAR 2  |         [Slack HITL]--[In-app HITL]               |                |
          |         [Value Dashboard]--------[Slack digest]----|                |
          |                                                    |                |
PILLAR 3  |  [Validate Signals]--[Define Ontology]            |                |
          |                      |  [Signal Infra]---[Signal Dashboard]        |
          |                      |                   [HubSpot Card + Signals]   |
          |                                          [Alerts]--[Patterns]      |
          |                                                    |                |
PILLAR 4  |  .................. backburner ..................   [Evaluate]      |
          |                                                                    |
PLATFORM  |  --- Phase 1: CRM Enhancement ---|- Phase 2: Signal Intelligence -|
          |                                                    | Phase 3: CRM? |
```

---

## What I Need From You (Sam)

### Decisions

1. **Does the trojan horse framing align with how you see the platform evolution?** The research shows Day.ai is our closest strategic competitor. Our advantage is the additive (enhance CRM) vs. replacement (rip out CRM) approach. Does that resonate?

2. **Is the signal ontology the right next strategic investment after Pillar 1 ships?** This is the bridge between "CRM automation tool" and "revenue intelligence platform." It requires signal capture infrastructure -- a non-trivial backend investment.

3. **Priority call: Value Dashboard vs. Slack HITL -- which ships first?** Both are P1 in Pillar 2. Value Dashboard changes perception ("not a notetaker"). Slack HITL changes adoption ("IC reps actually use it"). I lean Slack HITL first because it drives the usage that generates the value metrics.

### Validation I Want to Run

4. **Signal co-design workshop**: I want to run a 60-min session with James Hinkson + 2 other customers to validate the 10 base signals. The signals are hypothesis-driven right now. Before we build infrastructure, I want customers to tell us which signals would change how they run deals. **Proposed timeline**: Next 2 weeks.

5. **"Where do users live?" observational study**: 5 IC reps, 1 week, tracking tool usage patterns. Determines whether Slack HITL or in-app HITL gets invested in first.

### Context

6. **How does this interact with the Standard Agents work (Q1-Q2)?** The board deck mentions Chief of Staff, Coaching, Admin, and Churn Alert agents. The CRM roadmap here is complementary -- it's the data layer those agents act on. Want to make sure we're aligned on sequencing.

---

## Competitive Positioning (One Slide)

```
                       MEETING TOOL              →             REVENUE PLATFORM
                            |                                        |
    Fireflies -------- Fathom ------- Gong ------ Momentum ----- AskElephant ----- Day.ai ----- Attio
    Notes only     Notes + CRM    Analytics    CRM Automation   Revenue Outcomes  CRM Reimagined  CRM Replace
      $20/mo        Free-$29       $$$$$         $$$             Our price          $0-$250       $0-$86/user
```

**We sit between Momentum and Day.ai.** The roadmap moves us rightward without asking customers to make the "replace your CRM" leap.

- **Left of us** (notetakers, CRM automation): We win on trust, accuracy, and configurability
- **Right of us** (CRM replacements): We don't compete yet. We acknowledge the vision but offer a lower-risk path

---

## Risk Summary

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Day.ai adds meeting-specific property config | Medium | Ship structured agent fast; trust features (preview, diff) are harder to copy |
| Signal ontology is wrong (wrong 10 signals) | Medium | Customer co-design before building infrastructure |
| IC reps don't engage with Slack HITL | Medium | Observational study before building; start with simplest approve/reject |
| Engineering capacity for signal infrastructure | High | Start with signal definition (small); defer infra until Phase 2 commitment |
| Fathom "good enough" for most teams | Medium | Differentiate on custom config depth; their ceiling is our floor |

---

## Appendix: What's Already Shipped

For context on where we are today:

- **HubSpot App Card** -- Contact/company pages, company info, recent meetings, chat with agent (shipped)
- **Structured HubSpot Agent Workflow Action** -- Multi-object updates, property config, HITL option, create-if-not-found (shipped)
- **Salesforce Agent** -- In progress, PR open, feature parity with HubSpot agent
- **Deprecate Legacy HubSpot** -- In build phase, migrating Pipedream → Composio
