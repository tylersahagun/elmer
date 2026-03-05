# Product Definition: CSM Beta Program Runbook

**Week**: 9 (Apr 23 – Apr 29)
**Owner**: Tyler Sahagun + Robert Henderson
**Initiative**: Project Babar — Chief of Staff Agent
**Purpose**: Define how to run the beta, what feedback to collect, how to synthesize it, and what must be true before advancing to GA.

---

## Beta Program Goals

1. Validate that the Agent feed is removing cognitive load for real CSMs, not just AskElephant employees
2. Identify the top 3 friction points before GA
3. Validate that Impact Reports are accurate and trustworthy enough to act on
4. Catch any alert fatigue or notification spam issues in production conditions
5. Confirm at least 1 design iteration based on real user behavior

---

## Participant Profile

**Target**: 5–10 CSMs currently using AskElephant who have external-facing customer meetings
**Sourced by**: Robert Henderson
**Channel**: Dedicated Slack channel (`#babar-beta` or similar)
**Required integrations**: At minimum Gmail and Google Calendar (Slack optional for v1 beta)

---

## Week 9 Schedule

| Day | Activity |
|---|---|
| Monday Apr 23 | Beta group onboarded, feature flag enabled, intro Slack message sent |
| Tuesday Apr 24 | First Impact Reports should be generating (following meetings on Monday) |
| Wednesday Apr 25 | Tyler 1:1 async check-ins with 2–3 beta users via Slack |
| Thursday Apr 26 | First synthesis: compile beta feedback, share with team, surface top issues |
| Friday Apr 27 | Ship at least 1 fix based on feedback; update Palmer + Skylar on second iteration |
| Sunday Apr 29 | Beta week complete; final synthesis written to Linear milestone |

---

## Feedback Collection Framework

### Weekly Synthesis Template (Post to Linear and `#product-team` Slack)

**Section 1: What's Working**
- Quote from at least 1 user per positive signal

**Section 2: Top 3 Friction Points**
- Each friction point must have: user quote + count of how many users reported it + severity (blocks GA / does not block GA)

**Section 3: Alert Fatigue Signals**
- How many feed items are being snoozed vs. actioned? (Pull from PostHog `cos_feed_item_snoozed / cos_feed_item_viewed`)
- Are any users reporting too many notifications?

**Section 4: Impact Report Quality**
- Are trajectory verdicts trusted? Did any user express that an ADVANCED/DETRACTED rating felt wrong?
- Are drafted replies being sent or discarded?

**Section 5: Beta Advancement Verdict**
- Are we ready to GA? Yes / No / Conditional
- If Conditional: what must be resolved?

---

## Beta Advancement Criteria (Must All Be True to Proceed to Week 10 GA)

- [ ] 0 P0 bugs reported by beta users
- [ ] Alert fatigue indicator (`cos_feed_item_snoozed / viewed`) < 30% for at least 3 consecutive days
- [ ] At least 3 of 5+ beta users report the Agent "saved them time" without prompting
- [ ] Draft approval rate > 50% in beta cohort (users are trusting the drafted replies)
- [ ] Skylar has shipped at least 1 design fix based on beta feedback
- [ ] Tyler has reviewed at least 3 Impact Reports per call-type template against the rubric

---

## TriggerEngine Tuning Based on Beta

The following levers must be adjusted based on feedback (engineer owns execution, Tyler owns decision):

**If alert fatigue is too high** (snooze rate > 40%):
- Reduce `max_feed_items_per_day` from 15 to 10
- Raise urgency threshold: reclassify borderline `medium` events to `low`

**If feed feels empty** (< 5 items per day for most users):
- Lower `min_deal_value_for_p1` threshold
- Expand VIP contact definition to include lower-tier contacts

**If drafted replies are being discarded** (approval rate < 40%):
- Add a "What context should I use?" prompt to the draft card before auto-drafting
- Reduce draft confidence threshold: only auto-draft if context match score > 0.8

---

## Rollback Criteria

If any of the following occur, disable the beta feature flag immediately and notify Palmer + Skylar:

- Impact Reports generating with clearly incorrect trajectory verdicts (e.g., ADVANCED when deal was lost)
- Drafts sending without explicit user approval (critical trust failure)
- Any unauthorized data being surfaced (cross-user data leak)
- Ingestion worker backing up > 500 unprocessed events per user

---

## Post-Beta Artifacts

After Week 9, Tyler must produce:
1. Beta synthesis document (file in `project-babar/` folder)
2. Linear comment on GA milestone with: top 3 learnings, go/no-go verdict, and any remaining GA blockers
3. Slack post to `#product-team` summarizing results

---

_Last updated: 2026-02-26_
_Owner: Tyler Sahagun_
