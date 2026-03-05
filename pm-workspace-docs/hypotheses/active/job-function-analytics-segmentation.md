# Hypothesis: Job Function Analytics Segmentation

## Status
- **Current:** active
- **Created:** 2026-01-24
- **Last Updated:** 2026-01-24
- **Linked Initiative:** user-onboarding

---

## Problem Statement

**Who:** Product team, PMM, leadership

**What:** Cannot segment product usage by job function/role (AE, SDR, CSM, RevOps, Leader)

**When:** During analytics review, feature adoption analysis, PMM targeting

**Impact:** Product decisions lack persona-specific data; can't answer "Are AEs using chat with tools?"

> One-sentence summary: As the product team, we struggle to understand which personas are using which features because we don't capture job title/function, which causes us to make product decisions without persona-specific evidence.

---

## Evidence

### Signal 1: Internal Product Meeting - 2026-01-24
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-24-council-of-product.md`
- **Quote:** "Wanna add it back for analytics and tracking so that we can know which users are using the platform for what reason."
- **Interpretation:** Analytics need requires job function data.

### Signal 2: Internal Product Meeting - 2026-01-24
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-24-council-of-product.md`
- **Quote:** "We're meeting with PostHog today, and we wanna get better at how the usage metrics and being able to sort that out by role to figure out, like, what you're saying. Or can we get AEs to actually chat with tools?"
- **Interpretation:** PostHog meeting specifically to enable persona-based analytics.

### Signal 3: Internal Product Meeting - 2026-01-24
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-24-council-of-product.md`
- **Quote:** "We have exactly 2,000 users that have a job title. Super weird."
- **Interpretation:** Data exists but is incomplete; need to capture at onboarding.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | Medium | Internal tooling, not customer-facing |
| **Frequency** | Common | Every analytics decision affected |
| **Personas Affected** | Product team, PMM | Internal personas |
| **Evidence Strength** | Moderate | Clear internal need, less external validation |

---

## Outcome Chain

If we solve this problem:

```
Job function captured at onboarding
  → so that PostHog can segment by persona
    → so that product decisions are persona-informed
      → so that features are built/prioritized for the right personas
        → so that product-market fit improves for each segment
```

---

## Validation Criteria

To move from `active` → `validated`:
- [x] 3+ independent evidence sources (meeting, PostHog, data check)
- [x] Clear persona identification (internal - product team)
- [x] Severity/frequency assessed
- [x] Outcome chain articulated

To move from `validated` → `committed`:
- [ ] Prioritized against alternatives
- [ ] Owner assigned
- [ ] Capacity allocated
- [ ] Field added to onboarding

---

## Implementation Notes

1. **Field exists in database** - Just not populated
2. **Onboarding capture** - Add to signup/onboarding flow
3. **Backfill strategy** - Clay/LinkedIn enrichment for existing users
4. **PostHog integration** - Map to user properties for segmentation

### Friction Consideration
Previous discussion about whether requiring job title adds too much onboarding friction. Current consensus: the analytics value outweighs the friction.

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-24 | Created | From Council of Product - PostHog meeting prep |

---

## Related

- **Similar Hypotheses:** None directly
- **Related Initiative:** user-onboarding (capture point)
- **Competing Hypotheses:** None
- **Prior Art:** Most SaaS products capture job title at signup
