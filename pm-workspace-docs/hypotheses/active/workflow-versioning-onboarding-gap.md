# Hypothesis: Workflow Versioning Education Reduces Support Tickets

## Status
- **Current:** active
- **Created:** 2026-01-26
- **Last Updated:** 2026-01-26
- **Linked Initiative:** onboarding-exp

---

## Problem Statement

**Who:** New customers configuring workflows

**What:** Don't understand that workflows don't re-run when edited

**When:** During onboarding and early workflow configuration

**Impact:** Confusion, support tickets, wasted CSM time on calls explaining basics

> One-sentence summary: As a new customer, I don't understand workflow versioning behavior when I edit a workflow, which causes confusion and support burden that could be prevented with better education.

---

## Evidence

### Signal 1: CSM Feedback - 2026-01-26
- **Source:** slack (#team-csm)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "An onboarding gap I've been seeing more recently is a note about how workflows will not re-run when you make changes... It will make the calls I hop on with customers way more productive if they already have seen the builder at least briefly."
- **Interpretation:** CSM team has identified this as a recurring onboarding gap that wastes call time.

### Signal 2: Problem Pattern - 2026-01-26
- **Source:** slack (#team-csm)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Workflow versioning education gap in onboarding"
- **Interpretation:** Documented as a systematic problem, not one-off.

### Signal 3: Onboarding Request - 2026-01-26
- **Source:** slack (#askelephant-internal-workflow-requests)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** Multiple workflow transcripts show customers learning workflow builder during onboarding calls
- **Interpretation:** Time spent explaining workflow basics could be reduced with better pre-education.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | Medium | Support burden, not churn risk |
| **Frequency** | Common | Recurring onboarding gap |
| **Personas Affected** | Admin, RevOps | Anyone configuring workflows |
| **Evidence Strength** | Moderate | CSM team pattern recognition |

---

## Outcome Chain

If we add workflow versioning education to onboarding:

```
Workflow versioning explanation in onboarding deck
  → so that customers understand behavior before building
    → so that they avoid confusion when editing workflows
      → so that CSM calls focus on value, not basics
        → so that time-to-value decreases and CSM efficiency improves
```

---

## Validation Criteria

To move from `active` → `validated`:
- [x] 3+ independent evidence sources (need 1 more)
- [x] Clear persona identification
- [x] Severity/frequency assessed
- [x] Outcome chain articulated

To move from `validated` → `committed`:
- [ ] Prioritized against alternatives
- [ ] Owner assigned
- [ ] Capacity allocated
- [ ] Initiative created

---

## Potential Solutions

1. **Onboarding deck update** - Add workflow versioning slide
2. **In-app tooltip** - Warning when editing existing workflow
3. **KB article** - "Understanding Workflow Versions"
4. **Video walkthrough** - Workflow builder introduction
5. **Checklist item** - "Understand workflow versioning" in onboarding

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-26 | Created | Initial hypothesis from 14-day Slack signal synthesis |

---

## Related

- **Similar Hypotheses:** hyp-one-seat-adoption-churn (onboarding theme)
- **Related Initiative:** onboarding-exp
- **Competing Hypotheses:** None identified
- **Prior Art:** Many SaaS products have "immutable workflow" concepts
