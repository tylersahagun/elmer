# Product Definition: Call-Type Meeting Templates

**Week**: 7 (Apr 9 – Apr 15)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define the structural template for each meeting type that the AI auto-detects and applies to the Meeting Impact Report. Engineers map these templates to the `impact_reports` synthesis prompt routing logic.

---

## Overview

The Chief of Staff Agent auto-detects the type of each meeting and applies a template that changes the structure and emphasis of the Impact Report. Users can override the detected type.

**Detection input**: Meeting title + first 500 words of transcript
**Detection logic**: See `engineering-spec.md` Week 7, Section 7.1

---

## Template 1: Discovery Call

**Auto-detect triggers**: Keywords in title/transcript — "intro", "discovery", "first call", "learn more", "explore", "tell me about", "what does your company do"

**Report Structure & Emphasis:**

| Section | Label | Guidance |
|---|---|---|
| Relationship Summary | "First Contact Snapshot" | Where did this lead come from? What is the rep's relationship history with this person (if any)? |
| Meeting Narrative | "What We Learned" | What pain points did the prospect share? What is their buying timeline and process? Who else is involved in the decision? |
| Trajectory Verdict | Standard | ADVANCED = explicit next step agreed (demo, follow-up call). NEUTRAL = "exploring options." DETRACTED = they mentioned a competitor they prefer or no urgency. |
| Next Best Actions | "Next Steps to Advance" | Focus on: scheduling the next meeting, researching their industry, and identifying the decision-maker if not yet known |
| Open Commitments | Standard | |

**Key Questions the Report Must Answer:**
1. What problem are they trying to solve?
2. What is the budget range and timeline?
3. Who makes the final decision?
4. What is the agreed next step?

---

## Template 2: Product Demo

**Auto-detect triggers**: Keywords in title/transcript — "demo", "walkthrough", "platform tour", "show you", "demonstration", "product overview", "feature"

**Report Structure & Emphasis:**

| Section | Label | Guidance |
|---|---|---|
| Relationship Summary | "Deal Context" | Where are we in the deal? What objections have been raised previously? |
| Meeting Narrative | "Demo Reaction Analysis" | What features resonated? What objections or concerns were raised? What questions were asked most frequently? What purchase signals were present (or absent)? |
| Trajectory Verdict | Standard | ADVANCED = excitement signals + concrete next step. DETRACTED = multiple unresolved objections, mention of competitors. |
| Next Best Actions | "Objection Resolution Plan" | Focus on: addressing specific objections raised, sending relevant case studies, connecting to a technical resource if needed |
| Open Commitments | Standard | |

**Key Questions the Report Must Answer:**
1. Which features generated the most engagement?
2. What were the top 1–3 objections raised?
3. Did they mention a competitor?
4. What would need to be true for them to move forward?

---

## Template 3: Internal Meeting

**Auto-detect triggers**: All attendees have the same email domain as the rep; keywords — "standup", "sprint", "team sync", "all-hands", "internal", "planning"

**Report Structure & Emphasis:**

| Section | Label | Guidance |
|---|---|---|
| Relationship Summary | "Team Context" | What project or initiative is this meeting tied to? What was the status going in? |
| Meeting Narrative | "Decisions & Owners" | What was decided? Who owns what next? What blockers were raised? What is the updated status of the project? |
| Trajectory Verdict | Simplified — just ADVANCED or NEUTRAL (no DETRACTED for internal) | ADVANCED = concrete decisions made with owners. NEUTRAL = no clear decisions. |
| Next Best Actions | "Assigned Tasks" | List tasks assigned to the rep specifically from this meeting |
| Open Commitments | Standard | Focus on commitments made by the rep to teammates |

**Key Questions the Report Must Answer:**
1. What was decided?
2. Who owns each next step?
3. What blockers need to be escalated?

---

## Template 4: Renewal / QBR

**Auto-detect triggers**: Keywords in title/transcript — "renewal", "QBR", "quarterly business review", "contract review", "annual review", "check-in", "health check", "ROI review"

**Report Structure & Emphasis:**

| Section | Label | Guidance |
|---|---|---|
| Relationship Summary | "Account Health Context" | What is the account's product usage trend? Are there open support tickets? Any churn signals in prior comms? |
| Meeting Narrative | "Renewal Signals" | How did they react to ROI data presented? Did they raise concerns about pricing, adoption, or expansion? Did they confirm renewal intent? |
| Trajectory Verdict | Standard, with churn sensitivity | ADVANCED = renewal intent confirmed or expansion discussed. DETRACTED = ANY churn language, price objection, or "we need to evaluate alternatives." |
| Next Best Actions | "Renewal Action Plan" | Focus on: resolving open issues, sending renewal terms, connecting to an exec sponsor if churn risk is detected |
| Open Commitments | Standard | |

**Key Questions the Report Must Answer:**
1. Is the renewal at risk?
2. Is there an expansion opportunity?
3. What do they need to feel confident renewing?
4. What are the open action items on our side?

---

## Manual Override

Users can change the detected meeting type by clicking the type label in the Impact Report header. Options shown in a dropdown: Discovery, Demo, Internal, Renewal, and "Other" (uses the Discovery template as default fallback).

Override is stored in `impact_reports.call_type_override` and takes precedence over auto-detection on all future regenerations.

---

## Acceptance Criteria

- [ ] At least 10 real past meetings from the AskElephant dataset correctly classified by the detection prompt
- [ ] Each template generates a structurally different Impact Report (not just reordered text)
- [ ] Users can manually override and the override persists
- [ ] "Other" type falls back to Discovery template gracefully
- [ ] Tyler reviews 3 real Impact Reports per template before engineering ships

---

_Last updated: 2026-02-26_
_Owner: Tyler_
