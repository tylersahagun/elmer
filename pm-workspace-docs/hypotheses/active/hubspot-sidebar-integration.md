# Hypothesis: HubSpot Sidebar Integration

## Status
- **Current:** active
- **Created:** 2026-01-24
- **Last Updated:** 2026-01-24
- **Linked Initiative:** hubspot-agent-config-ui (related)

---

## Problem Statement

**Who:** Sales reps who live in HubSpot

**What:** Reps won't leave HubSpot to access AskElephant insights, creating a context-switching barrier

**When:** During deal work, meeting prep, CRM updates

**Impact:** AskElephant value is locked behind a tab switch; reps don't get insights at the moment they need them

> One-sentence summary: As a sales rep who lives in HubSpot, I struggle to get AskElephant insights because I have to leave my CRM to access them, which causes me to either skip insights or waste time context-switching.

---

## Evidence

### Signal 1: Partner Feedback - 2026-01-21
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-21-crispy-product-feedback-session.md`
- **Quote:** "I would love a global chat to be a card or a on the record sidebar in HubSpot directly. I would use the fuck out of that."
- **Interpretation:** Strong demand from power user/partner for in-HubSpot access.

### Signal 2: Internal Product Meeting - 2026-01-24
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-24-council-of-product.md`
- **Quote:** "A lot of us actually just want a widget inside of HubSpot that can use internal search to ask questions."
- **Interpretation:** Customer Chris echoed same need - search/chat accessible without leaving CRM.

### Signal 3: Internal Product Meeting - 2026-01-24
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-24-council-of-product.md`
- **Quote:** "There also is Breeze, and there's Breeze agents. So you can also do it through Breeze."
- **Interpretation:** HubSpot's Breeze provides a reference model for sidebar integration.

### Signal 4: Partner Feedback - 2026-01-21
- **Source:** transcript
- **Link:** `signals/transcripts/2026-01-21-crispy-product-feedback-session.md`
- **Quote:** "Sales reps just wanna do whatever they're rogue cowboys want to do... Make money."
- **Interpretation:** Reps won't adopt new tools that require workflow changes; meet them where they are.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | High | Context-switching is adoption killer |
| **Frequency** | Common | Every HubSpot-using rep, every deal |
| **Personas Affected** | Sales reps | Primary; Any HubSpot user |
| **Evidence Strength** | Strong | Multiple sources, explicit feature requests |

---

## Outcome Chain

If we solve this problem:

```
HubSpot sidebar integration
  → so that reps access AskElephant without leaving CRM
    → so that insights are available at moment of need
      → so that rep efficiency increases and adoption improves
        → so that stickiness and retention increase
```

---

## Validation Criteria

To move from `active` → `validated`:
- [x] 3+ independent evidence sources (Crispy, Chris, internal)
- [x] Clear persona identification (HubSpot-using sales reps)
- [x] Severity/frequency assessed
- [x] Outcome chain articulated

To move from `validated` → `committed`:
- [ ] Prioritized against alternatives
- [ ] Owner assigned
- [ ] Capacity allocated
- [ ] Technical feasibility confirmed (widget vs Breeze)

---

## Technical Options

1. **Custom HubSpot CRM Card** - Widget in record sidebar
2. **Breeze Agent Integration** - Use HubSpot's AI framework
3. **Chrome Extension** - Overlay on HubSpot pages
4. **Deep Link + Quick Return** - Minimize context switch even if not embedded

### Consideration
> "As long as the messages would be... push and hint to get them back at AskElephant, I know it's great... I want to give them enough till they give some of the answer, but not enough that they don't believe HubSpot does."

Strategy: Provide value in HubSpot, but drive deeper engagement back to AskElephant.

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-24 | Created | From Council of Product + partner feedback |

---

## Related

- **Similar Hypotheses:** hyp-hubspot-agent-config-ui (HubSpot integration)
- **Related Initiative:** hubspot-agent-config-ui, crm-exp-ete
- **Competing Hypotheses:** None - different delivery mechanism
- **Prior Art:** HubSpot Breeze, Gong for Salesforce, LinkedIn Sales Navigator
