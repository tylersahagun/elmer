# Hypothesis: 1-Seat Customers Churn Without Proactive Engagement

## Status
- **Current:** active
- **Created:** 2026-01-26
- **Last Updated:** 2026-01-26
- **Linked Initiative:** onboarding-exp

---

## Problem Statement

**Who:** 1-seat customers (single user accounts)

**What:** Churn within 6 months due to failure to adopt the platform

**When:** After initial signup, without proactive CSM engagement or optimization calls

**Impact:** 42% of all churns are adoption failures; MRR loss from preventable churn

> One-sentence summary: As a 1-seat customer, I struggle with adopting AskElephant without proactive guidance, which causes me to churn before realizing value.

---

## Evidence

### Signal 1: Churn Data - 2026-01-26
- **Source:** slack
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Cloud Accountant Staffing - $200 MRR - Failure to adopt - Never engaged"
- **Interpretation:** Small account churned without ever engaging with the platform or receiving optimization guidance.

### Signal 2: Churn Data - 2026-01-26
- **Source:** slack
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Rivvet - $50 MRR - 6 months, no optimization call - 1 seat, never optimized"
- **Interpretation:** Customer had account for 6 months but never received an optimization call, leading to churn. Classic adoption failure pattern.

### Signal 3: Churn Pattern Analysis - 2026-01-26
- **Source:** slack
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "42% of churns are adoption failures on 1-seat accounts"
- **Interpretation:** Systematic pattern - nearly half of all churn is preventable with better engagement strategy.

### Signal 4: CSM Operational Signal - 2026-01-26
- **Source:** slack (#team-csm)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Every month I would like to identify three customers who could really benefit from very regular meetings where we really focus on outcomes that can help them expand."
- **Interpretation:** CSM team recognizes need for proactive engagement program but current approach is reactive.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | High | 42% of all churns; significant MRR impact |
| **Frequency** | Common | Pattern across multiple accounts |
| **Personas Affected** | Solo rep, SMB admin | Small team customers most at risk |
| **Evidence Strength** | Strong | Multiple churn examples + aggregate analysis |

---

## Outcome Chain

If we solve this problem:

```
Proactive engagement for 1-seat customers
  → so that customers receive optimization guidance in first 30 days
    → so that they configure workflows that deliver value
      → so that they see ROI before renewal decision
        → so that 1-seat churn rate decreases by 50%+
```

---

## Validation Criteria

To move from `active` → `validated`:
- [x] 3+ independent evidence sources
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

1. **Automated onboarding sequences** - Triggered emails/in-app prompts for 1-seat accounts
2. **Self-serve optimization tools** - Configuration wizards, templates, best practices
3. **Proactive CSM outreach** - 30-day check-in requirement for all accounts
4. **Health scoring** - Automated detection of at-risk 1-seat accounts
5. **Community/peer learning** - Enable solo users to learn from each other

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-26 | Created | Initial hypothesis from 14-day Slack signal synthesis |

---

## Related

- **Similar Hypotheses:** hyp-solo-rep-self-coaching (adoption enablement)
- **Related Initiative:** onboarding-exp
- **Competing Hypotheses:** None identified
- **Prior Art:** Many SaaS companies have "high-touch low-tier" programs
