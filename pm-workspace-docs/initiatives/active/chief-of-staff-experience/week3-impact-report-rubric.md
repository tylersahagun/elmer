# Product Definition: Meeting Impact Report Rubric

**Week**: 3 (Mar 12 – Mar 18)
**Owner**: Tyler Sahagun
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define the precise criteria the AI synthesis engine uses to evaluate whether a meeting ADVANCED, was NEUTRAL, or DETRACTED from a deal/relationship. This rubric governs the `trajectory_verdict` field in all Impact Reports.

---

## Rubric Overview

The trajectory verdict answers the question: **"Did this meeting move the story in the right direction?"**

A meeting is evaluated against the pre-meeting baseline (the state of the relationship from prior emails, Slack messages, and meetings). The verdict reflects the *delta* — not the absolute state of the deal.

---

## Verdict: ADVANCED

**Definition**: The meeting produced a clear positive shift in the deal's likelihood to close, the relationship's strength, or the project's momentum.

**Signal Evidence (at least 2 of the following must be present):**
1. A concrete next step was agreed upon with an owner and timeline
2. A key stakeholder committed to moving forward (budget approval, internal champion agreed to escalate, contract signed)
3. A blocker or objection was resolved during the meeting
4. New information surfaced that makes the deal more viable (e.g., budget confirmed, timeline accelerated)
5. Post-meeting communication shows positive momentum (e.g., follow-up email sent within 24 hours, attendee responded positively in Slack)
6. A new stakeholder was introduced who strengthens the relationship

**LLM Instruction for ADVANCED:**
> Score ADVANCED if: the meeting produced at least 2 positive momentum signals and no significant negative signals.

---

## Verdict: NEUTRAL

**Definition**: The meeting maintained the current state of the relationship without meaningfully advancing or harming it. These are often relationship-maintenance or status check meetings.

**Signal Evidence:**
- No new commitments made (or only vague commitments)
- No blockers resolved, but no new blockers introduced
- Post-meeting communication is routine (e.g., "Thanks for your time")
- The meeting was informational without a decision or next step
- A next step was discussed but ownership was unclear or left open

**LLM Instruction for NEUTRAL:**
> Score NEUTRAL if: there are no clear advancement signals AND no clear detraction signals. Default to NEUTRAL when evidence is ambiguous.

---

## Verdict: DETRACTED

**Definition**: The meeting produced signals that the deal, relationship, or project is at risk or moving backwards.

**Signal Evidence (any 1 of the following is sufficient):**
1. A stakeholder raised a new blocker or objection that was not resolved
2. The meeting was cut short, rescheduled by the other party, or key stakeholders didn't attend
3. Post-meeting communication shows cooling: no follow-up from their side within 72 hours after a high-intent meeting
4. A previously committed next step was cancelled or pushed back
5. Negative sentiment detected in post-meeting Slack/email (e.g., "we need to think about this more" after a near-close scenario)
6. The rep failed to deliver on a pre-meeting commitment (e.g., promised pricing deck wasn't sent)
7. The deal stage should have advanced based on the meeting but hasn't been updated in CRM

**LLM Instruction for DETRACTED:**
> Score DETRACTED if: any single detraction signal is present. A deal at risk is more important to surface than a deal advancing — err on the side of flagging.

---

## Trajectory Evidence Requirement

Every `trajectory_verdict` must be accompanied by a `trajectory_evidence` field — a direct quote or specific observation from the context that drove the verdict.

**Good trajectory_evidence examples:**
- ADVANCED: "Sarah Chen replied within 2 hours: 'Excited to move forward — I'll get legal to look at the contract this week.'"
- NEUTRAL: "No explicit next steps agreed. Meeting ended with 'let's circle back after the holidays.'"
- DETRACTED: "Marcus hasn't responded to follow-up email sent 5 days ago. Prior to this meeting, he was responding same-day."

**Bad trajectory_evidence (too vague):**
- "The meeting went well."
- "No action items."
- "The call was productive."

---

## Edge Cases & Overrides

| Scenario | Verdict | Notes |
|---|---|---|
| First meeting with a new prospect | ADVANCED (default) | First contact is always forward movement; no prior baseline to compare |
| Internal meeting (no external stakeholders) | NEUTRAL (default unless specific decision made) | Internal syncs rarely advance or detract the external deal |
| Meeting with no transcript (audio issues, not recorded) | NULL | Do not generate a verdict without transcript; show "No recording available" in UI |
| Very short meeting (< 5 minutes) | NEUTRAL | Too little signal to assess trajectory |
| Meeting with 0 post-meeting context | Proceed with transcript only; reduce confidence | Flag in report: "Based on meeting only — no post-meeting communication available yet" |

---

## Evaluation Test Cases for Engineering

Before shipping the synthesis prompt, engineers must run it against these 5 test cases and verify the verdict matches:

| Test Case | Expected Verdict |
|---|---|
| Meeting where buyer confirmed budget and agreed to send PO next week; followed by positive email | ADVANCED |
| Weekly check-in with no agenda, no action items, friendly tone throughout | NEUTRAL |
| Demo meeting where buyer raised 3 unresolved objections about security; no follow-up in 4 days | DETRACTED |
| First discovery call with a new prospect; ended with "let's schedule a demo" | ADVANCED |
| Renewal meeting where buyer said "we need to think about it" after two prior positive signals | DETRACTED |

---

_Last updated: 2026-02-26_
_Owner: Tyler_
