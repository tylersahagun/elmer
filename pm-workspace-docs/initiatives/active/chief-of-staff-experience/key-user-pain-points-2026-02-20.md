# Key User Pain Points — Prototype Feedback Analysis

**Date:** 2026-02-20  
**Source:** Prototype feedback session (Slack #proj-babar)  
**Initiative:** Chief of Staff Experience  

---

## Executive Summary

Prototype testing revealed 7 critical pain points that must be addressed before Build phase. The feedback validates the core Chief of Staff hypothesis (artifact-first, proactive operating surface) but exposes significant execution gaps in action items, onboarding, and visual design.

**The core insight:** Users want to see value *before* configuring. Current flows ask users to prove the product works before they've experienced it.

---

## Pain Points Ranked by Impact

### 🔴 Critical (Must Fix Before Beta)

#### 1. Action Items Are Broken — "Underwhelmed for 6+ Months"

**Evidence:**
- James (30+ customer interviews): "I have been underwhelmed with the action items."
- Working solution exists internally: "The recap email workflow... highlights action items and next steps very well."

**Root Cause:** Wrong extraction logic in meeting summary; better prompt already exists in recap email workflow.

**Fix:**
1. Audit recap email prompt for action item extraction
2. Port extraction logic to meeting summary generation
3. A/B test against current extraction

**Effort:** Medium | **Impact:** High | **Blocks:** Action Items sub-initiative credibility

---

#### 2. No Checkboxes = No Accountability

**Evidence:**
- Skylar: "Anytime we actually present action items, they need to be a checkbox... I may not be completing it here, but I could."
- Skylar: "I think not seeing where AskElephant is gonna do these action items for me is what's really missing."

**Root Cause:** Action items are read-only text. No completion state. No visibility into automated vs. manual actions.

**Fix:**
1. Add checkbox UI to all action items
2. Add completion state (pending/done/snoozed)
3. Add automation indicator: "AskElephant will do this" badge
4. Track completion in analytics

**Effort:** Low-Medium | **Impact:** High | **Blocks:** Action Items adoption

---

#### 3. Configuration Overload Kills Onboarding

**Evidence:**
- Palmer: "I don't wanna do all that... If I'm writing more than that [2 sentences], just like, damn."
- Tyler (data): "24 out of 25 users skip [onboarding]. One person filled out every page."

**Root Cause:** Value-last design. Users must configure before seeing any output.

**Fix:**
1. Redesign onboarding to value-first model
2. Show example output *before* asking for preferences
3. Reduce required fields to absolute minimum (name, role)
4. Auto-infer settings from first meeting type
5. Apply "Overwatch model" — opinionated defaults with few tweaks, not "Diablo model" — customize every stat

**Design Principle:**
> "Here's what you need, with a few tweaks" > "Pick every stat"

**Effort:** Medium-High | **Impact:** Critical | **Blocks:** Activation and retention

---

### 🟠 High Priority (Sprint 1-2)

#### 4. TLDR Already Extracted But Not Shown

**Evidence:**
- Palmer: "We extract that from the transcript, put it in this field, and *we use it nowhere*."
- Tyler: "Even in its raw state, that is fantastic."

**Root Cause:** Backend extracts TLDR/description field; frontend doesn't display it.

**Fix:**
1. Surface TLDR description on My Meetings cards
2. Estimated effort: "5 minute job" per Tyler

**Effort:** Very Low | **Impact:** High | **Blocks:** Nothing — immediate win

---

#### 5. Summary Visual Design is "Super Stale"

**Evidence:**
- Skylar: "Almost on the other side of the spectrum where it's just super stale."

**Root Cause:** Minimal visual hierarchy. No color, emojis, or engaging layout. Reads like raw text output.

**Fix:**
1. Add visual hierarchy (headings, spacing, dividers)
2. Use color for action types (task = blue, risk = red, win = green)
3. Allow emoji in section headers
4. Consider full-screen layout option
5. Reference competitive designs (Fathom, Fireflies)

**Effort:** Medium | **Impact:** High | **Blocks:** Summary engagement

---

#### 6. Negative Client Calls Send Blame

**Evidence:**
- James: "I have seen other notetakers cause problems by sending out summaries that literally say... 'this product is the worst solution that we could have possibly rolled out.' And that was the one that went to 10 people who weren't on the meeting either."

**Root Cause:** No sentiment awareness. Summary distribution doesn't consider call tone.

**Fix:**
1. Add sentiment detection to call processing
2. If negative sentiment detected:
   - Flag for review before auto-distribution
   - Reframe summary to focus on resolution items
   - Limit distribution scope
3. Add privacy/sensitivity tier to meetings

**Effort:** Medium-High | **Impact:** High (trust damage prevention) | **Blocks:** Enterprise trust

---

### 🟡 Medium Priority (Sprint 2-3)

#### 7. Section-Level Edit Missing

**Evidence:**
- Feedback: "Click 'edit' on a section, refine just that part (not whole template)"

**Status:** Already in Meeting Summary PRD as Must Have requirement (section-level AI rewrite)

**Validation:** Confirms PRD requirement priority is correct

---

## Immediate Action Plan (Next 2 Weeks)

### Week 1: Quick Wins

| # | Action | Owner | Est. Time | Dependency |
|---|--------|-------|-----------|------------|
| 1 | Surface TLDR on My Meetings page | Eng | 1-2 hours | None |
| 2 | Add checkboxes to action items (UI only) | Eng | 2-4 hours | None |
| 3 | Add "AE will do this" badge to automated actions | Eng | 2 hours | Action item schema |

### Week 2: High-Impact Fixes

| # | Action | Owner | Est. Time | Dependency |
|---|--------|-------|-----------|------------|
| 4 | Audit recap email prompt for action extraction | PM | 2 hours | Access to prompt library |
| 5 | Port recap email extraction to summary | Eng | 4-8 hours | Prompt audit complete |
| 6 | Add completion state to action items | Eng | 4-6 hours | Checkbox UI |
| 7 | Design: Summary visual refresh mockups | Design | 8 hours | None |

### Sprint 3+: Structural Fixes

| # | Action | Owner | Est. Time | Dependency |
|---|--------|-------|-----------|------------|
| 8 | Onboarding redesign (value-first) | PM + Design | 2-3 sprints | User research |
| 9 | Sentiment detection for summaries | Eng | 1-2 sprints | ML/NLP integration |
| 10 | Auto-detect template from call metadata | Eng | 1 sprint | Metadata schema |

---

## Success Criteria

After implementing the immediate action plan:

1. **Action item checkboxes** visible on 100% of summaries
2. **TLDR** visible on My Meetings cards
3. **Completion tracking** operational in analytics
4. **Visual refresh** design approved and in dev

---

## Open Questions for Leadership

1. **Recap email prompt access** — Who owns the prompt library? Can PM audit extraction logic?
2. **Onboarding redesign scope** — Is this a separate initiative or part of Chief of Staff?
3. **Sentiment detection priority** — Should this block any distribution flows?
4. **Design resources** — Who is available for summary visual refresh?

---

## Appendix: The "Overwatch vs. Diablo" Framework

The feedback crystallized a key design philosophy:

| Model | Description | User Experience |
|-------|-------------|-----------------|
| **Overwatch** | Opinionated defaults, few customization options | "Here's what you need, with a few tweaks" |
| **Diablo** | Every stat customizable, deep configuration | "Pick every stat" |

**Chief of Staff should follow the Overwatch model.** Users should get value immediately with sensible defaults. Customization is optional and progressive.

**Anti-pattern:** Requiring configuration before showing value (current onboarding).

---

_Analysis completed: 2026-02-20_  
_Owner: Tyler_  
_Next review: After Week 1 quick wins shipped_
