# Hypothesis: Native CRM Integration Reduces Competitive Churn

## Status
- **Current:** active
- **Created:** 2026-01-26
- **Last Updated:** 2026-01-26
- **Linked Initiative:** crm-exp-ete

---

## Problem Statement

**Who:** Sales leaders and RevOps evaluating AskElephant vs Gong

**What:** Choose Gong over AskElephant because of native Salesforce integration

**When:** During competitive evaluation or renewal decision

**Impact:** Lost deals and churn to Gong; perception gap despite automation advantage

> One-sentence summary: As a sales leader, I choose Gong over AskElephant when native CRM integration is critical, which causes us to lose deals we could win on automation value.

---

## Evidence

### Signal 1: Competitive Churn - 2026-01-26
- **Source:** slack (#churn-alert)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Dental Intel - $1,978 MRR - Competitive - Gong feature parity. 'Gong has new features and access that makes them closer to AskElephant capabilities... if Gong and AskE are essentially the same platform we are going to hedge our bets on the established one'"
- **Interpretation:** Customer perceived feature parity and chose established platform trust. Native integration could have differentiated.

### Signal 2: Competitive Intel - 2026-01-26
- **Source:** slack (#competitors)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "Gong Strengths: Native Salesforce integration (frequently cited), Strong coaching and forecasting, Established platform trust"
- **Interpretation:** Native Salesforce integration is consistently cited as Gong's advantage in competitive evaluations.

### Signal 3: Lost Deal Pattern - 2026-01-26
- **Source:** slack (#competitors)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "We LOSE when: Native Salesforce integration is critical"
- **Interpretation:** Pattern recognition from sales team - this is a known loss trigger.

### Signal 4: Customer Comparison - 2026-01-26
- **Source:** slack (#customer-quotes)
- **Link:** `signals/slack/2026-01-26-14day-slack-synthesis.md`
- **Quote:** "I'm obviously looking to Gong and stuff, and their workflows are pretty shit, to be honest. So I'm happier with this system."
- **Interpretation:** Customers who DON'T prioritize native CRM see AskElephant's automation advantage clearly.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | High | $1,978+ MRR churns to Gong; competitive deal losses |
| **Frequency** | Common | Gong is #1 competitor (25+ mentions in 14 days) |
| **Personas Affected** | Sales leader, RevOps | Enterprise buyers most affected |
| **Evidence Strength** | Strong | Multiple data points from competitive intelligence |

---

## Outcome Chain

If we solve this problem:

```
Native CRM integration (Salesforce sidebar, embedded views)
  → so that AskElephant appears in CRM where reps work
    → so that evaluation perception shifts ("embedded" not "tab switch")
      → so that native integration objection is neutralized
        → so that competitive win rate against Gong increases 50%+
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

1. **Salesforce sidebar app** - Embedded AskElephant in Salesforce UI
2. **HubSpot CRM card** - Native AskElephant card in HubSpot sidebar
3. **CRM object embedding** - AskElephant insights as CRM fields/objects
4. **Native activity logging** - Direct write to CRM activity timeline
5. **CRM-first navigation** - Open AskElephant from CRM context

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-26 | Created | Initial hypothesis from 14-day Slack signal synthesis |

---

## Related

- **Similar Hypotheses:** hyp-hubspot-sidebar-integration (HubSpot variant)
- **Related Initiative:** crm-exp-ete
- **Competing Hypotheses:** None identified
- **Prior Art:** Gong has native Salesforce integration; Chorus has similar
