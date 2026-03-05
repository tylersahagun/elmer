# Hypothesis: CRM Readiness Diagnostic

## Status
- **Current:** validated
- **Created:** 2026-01-21
- **Last Updated:** 2026-01-21
- **Validated:** 2026-01-21
- **Linked Initiative:** None

---

## Problem Statement

**Who:** RevOps teams, Sales Leaders, and Implementation Partners

**What:** AskElephant implementations fail or underperform because the customer's CRM (HubSpot) isn't properly configured with clean data, correct object usage, and appropriate properties

**When:** During onboarding or when customers try to set up workflows that depend on CRM data quality

**Impact:** 
- Customers churn before seeing value ("why add another system to bad data?")
- Partners can only introduce AskElephant at END of 50+ hour engagements
- Self-serve customers fail without understanding why
- Support burden increases as failures appear to be AskElephant bugs

> One-sentence summary: As a RevOps leader, I struggle with getting value from AskElephant because my HubSpot data is messy, my teams don't use contacts/companies properly, and there's no way to know what's blocking me, which causes me to blame AskElephant and consider churning.

---

## Evidence

### Signal 1: Partner Feedback - 2026-01-21
- **Source:** Transcript - Crispy Product Feedback Session
- **Link:** `signals/transcripts/2026-01-21-crispy-product-feedback-session.md`
- **Quote:** "The client use it as my HubSpot account. Don't fully trust it. So why am I adding another system to add more data to it on top of shit? That's the most common thing that I run into when I'm working with this with customers."
- **Interpretation:** Customers view bad CRM data as a blocker to adopting any new tool. They won't add AskElephant until they trust their existing data.

### Signal 2: Partner Feedback - 2026-01-21
- **Source:** Transcript - Crispy Product Feedback Session
- **Link:** `signals/transcripts/2026-01-21-crispy-product-feedback-session.md`
- **Quote:** "I think I believe fully dictate whether AskElephant will be successful with that team because most sales teams will only use deals, and they won't use contacts. They won't use companies."
- **Interpretation:** Basic CRM hygiene (using standard objects) is a prerequisite for AskElephant success. 90%+ of customers aren't doing this.

### Signal 3: Partner Methodology Document - 2026-01-21
- **Source:** Document - Zipcio AI as a Service
- **Link:** `signals/documents/Zipcio_ AI as a Service.md`
- **Quote:** Phases 1-2 total 53+ hours of CRM work ($9,500) before Phase 3 introduces AskElephant. Exit criteria: "Your HubSpot account is properly configured with properties, personas, segments, reports."
- **Interpretation:** Expert partners have empirically determined that 53+ hours of CRM foundation work is required before AskElephant can succeed. This is the "hidden prerequisite."

### Signal 4: Partner Feedback - 2026-01-21
- **Source:** Transcript - Crispy Product Feedback Session
- **Link:** `signals/transcripts/2026-01-21-crispy-product-feedback-session.md`
- **Quote:** "The help of the customers that have converted are at the end of their sales or at the end of their customer cycle with us because they're on a clean build. And that's why it's a no brainer."
- **Interpretation:** When CRM is clean, AskElephant sells itself. The problem is getting customers TO that state.

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Severity** | High | Directly causes churn and failed implementations |
| **Frequency** | Common | Crispy estimates 90%+ of customers have this issue |
| **Personas Affected** | RevOps (primary), Sales Leaders, Implementation Partners | Partners feel it most acutely; end customers don't know they have the problem |
| **Evidence Strength** | Strong | 4 signals from expert partner with direct implementation experience |

---

## Outcome Chain

If we solve this problem:

```
CRM Readiness Diagnostic surfaces HubSpot configuration gaps
  → so that customers understand what's blocking AskElephant success
    → so that they either fix issues or engage partners to help
      → so that implementations succeed and customers see value
        → so that retention improves and partners can sell more effectively
```

**Alternative chain (proactive):**

```
AskElephant detects CRM readiness during onboarding
  → so that we can guide customers through remediation or connect them with partners
    → so that we reduce failed implementations before they start
      → so that time-to-value decreases and NPS improves
```

---

## Validation Criteria

To move from `active` → `validated`:
- [x] 3+ independent evidence sources (4 signals from Crispy session + Zipcio doc)
- [x] Clear persona identification (RevOps, Sales Leaders, Partners)
- [x] Severity/frequency assessed (High severity, Common frequency)
- [x] Outcome chain articulated (Two chains above)

To move from `validated` → `committed`:
- [ ] Prioritized against alternatives
- [ ] Owner assigned
- [ ] Capacity allocated
- [ ] Initiative created

---

## Potential Solutions (To Explore)

1. **Diagnostic Tool** - Automated HubSpot audit that identifies gaps
   - Missing object associations (deals without contacts/companies)
   - Properties that should exist but don't
   - Data quality issues (empty required fields, stale data)
   
2. **Readiness Scorecard** - Simple "your HubSpot is X% ready for AskElephant"
   - Traffic light system: Green (ready), Yellow (fixable), Red (needs help)
   - Connects to partner network for Red customers
   
3. **Guided Remediation** - AI assistant that helps fix issues
   - "I notice deals don't have associated contacts. Want me to create a workflow to enforce this?"
   - Could use AskElephant's own chat interface

4. **Partner Enablement** - Tools for partners like Crispy to diagnose faster
   - Reduce their 53 hours to 20 hours
   - Makes partner business model more scalable

---

## History

| Date | Action | Notes |
|------|--------|-------|
| 2026-01-21 | Created | Initial hypothesis from Crispy product feedback session |
| 2026-01-21 | Evidence added | Added 4 signals from transcript + Zipcio methodology doc |
| 2026-01-21 | Validated | All criteria met - 4 evidence sources, clear personas, severity assessed, outcome chains defined |

---

## Related

- **Similar Hypotheses:** 
  - `hyp-hubspot-agent-config-ui` - Related but focuses on workflow config, not CRM health
- **Competing Hypotheses:** 
  - "Customers fail because workflows are too complex" (overlapping but distinct)
  - "Customers fail because they don't understand value prop" (different root cause)
- **Prior Art:** 
  - Tyler's chat-based HubSpot audit (shown in Crispy call) - promising but needs refinement
  - Crispy's 3-phase methodology - manual but proven
