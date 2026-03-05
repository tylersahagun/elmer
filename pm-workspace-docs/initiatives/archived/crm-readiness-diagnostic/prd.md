# PRD: CRM Readiness Diagnostic

> **Status:** Design
> **Owner:** TBD
> **Hypothesis:** `hyp-crm-readiness-diagnostic`
> **Last Updated:** 2026-01-21
> **Jury Validation:** ✅ 74% approval (v1 prototype)

---

## Problem Statement

AskElephant implementations fail or underperform when customers have poorly configured HubSpot accounts. Partner feedback reveals that **90%+ of customers** have CRM configuration issues blocking success. Expert partners require **53+ hours of prerequisite work** before AskElephant can be introduced—work that self-serve customers can't do themselves.

### Impact

- **Churn:** Customers blame AskElephant when the real problem is CRM configuration
- **Activation:** Self-serve customers fail without understanding why
- **Support:** Failures appear as product bugs, increasing support burden
- **Partner Dependency:** Can only succeed with dedicated partner implementation

### User Quote

> "The client use it as my HubSpot account. Don't fully trust it. So why am I adding another system to add more data to it on top of shit? That's the most common thing that I run into when I'm working with this with customers."
> — Crispy, HubSpot Partner

---

## Target Personas

| Persona | Need | Current Pain | Jury Approval |
|---------|------|--------------|---------------|
| **RevOps/Operations** | Understand what's blocking AskElephant value | No visibility into CRM readiness; trial and error | 82% ✅ |
| **Sales Leader** | Get team using AskElephant successfully | AE fails silently; blames product not process | 76% ✅ |
| **Sales Rep** | Know why things aren't working | Confusion, can't self-diagnose | 65% ⚠️ |
| **Implementation Partner** | Diagnose customer CRM faster | 53+ hours manual assessment per customer | 93% ✅ |

### Persona-Specific Requirements (from Jury)

| Persona | Key Request | Priority |
|---------|-------------|----------|
| Sales Rep | "Tell me WHO can fix this, not just how" | P0 |
| Sales Leader | "Let me assign this to RevOps" | P1 |
| Operations | "Export report to share with leadership" | P2 |
| Partner | "More granular checks, exportable audit" | P2 |

---

## Success Metrics

| Metric | Current | Target | Rationale |
|--------|---------|--------|-----------|
| Activation rate (first workflow running) | X% | +20% | Diagnostic should unblock stuck customers |
| Time to activation | X days | -30% | Guided remediation accelerates setup |
| Customer churn (first 90 days) | X% | -25% | Solve root cause of early churn |
| Support tickets (CRM-related) | X/week | -50% | Customers self-diagnose instead of filing tickets |
| **Jury approval (skeptics)** | 54% | 65%+ | Close the skeptic gap with better messaging |

---

## User Journey

### Current State

```
Customer signs up
  → Connects HubSpot
    → Creates workflow
      → Workflow fails silently (missing associations)
        → Customer frustrated, doesn't know why
          → Files support ticket OR churns
            → We discover CRM was misconfigured all along
```

### Desired State

```
Customer signs up
  → Connects HubSpot
    → AE runs automatic diagnostic
      → Shows "CRM Readiness Score" with specific issues
        → Green: "You're ready to go!"
        → Yellow: "Here's how to unlock full value" (guided remediation)
        → Red: "Let's get you some expert help" (partner connection)
          → Customer understands blockers BEFORE they fail
            → Either self-remediates or gets help
              → Workflows succeed on first try
                → Customer sees value immediately
```

---

## MVP Scope

### P0: Must Have (v1 Launch)

Based on jury validation, these are non-negotiable:

#### 1. CRM Diagnostic Engine
- [ ] Automatically assess HubSpot configuration during onboarding
  - Check: Deal → Contact → Company associations
  - Check: Required properties exist and are populated
  - Check: Data freshness (stale records)
  - Check: Object usage patterns (are contacts/companies being used?)

#### 2. Readiness Score UI (Traffic Light)
- [ ] Green: "Ready to go"
- [ ] Yellow: "Opportunities to unlock full value" *(not "Needs attention")*
- [ ] Red: "Let's get you some expert help" *(not "Action required")*

> **Jury Insight:** RED status must NOT feel accusatory. 31% of users felt "blamed" with original copy. Skeptics especially sensitive (52%).

#### 3. Issue Detail Cards with Actionable Guidance
- [ ] What's wrong (clear, non-technical description)
- [ ] Why it matters for AskElephant (which features affected)
- [ ] **How to fix it with step-by-step guidance** *(P0 from jury)*
  - Video tutorial link OR
  - In-app guided wizard OR
  - Clear "who should fix this" guidance

> **Jury Insight:** 42% said guidance was too vague. Sales reps especially need hand-holding (58% mentioned this).

#### 4. Normalization Messaging
- [ ] Add context that CRM issues are common: "90% of HubSpots have configuration gaps—this is normal"
- [ ] Frame as "opportunities" not "problems"
- [ ] Lead with benefit: "Fixing these will improve your experience"

### P1: Should Have (v1.1)

These significantly improve the experience but can ship shortly after launch:

#### 5. Time Estimates per Issue
- [ ] Show estimated time to fix: "~15 min" or "Typically needs admin help"
- [ ] Help users prioritize and plan

> **Jury Insight:** 28% requested this, especially Sales Leaders (45%)

#### 6. Impact Indicators per Issue
- [ ] Show which AskElephant features are affected
- [ ] Example: "This affects: Deal insights, Pipeline forecasting"

> **Jury Insight:** 24% wanted to understand priority based on impact

#### 7. Dismiss/Snooze Functionality
- [ ] Allow users to dismiss issues that are intentional CRM choices
- [ ] Example: "We don't use Companies" → dismiss that issue
- [ ] Persist dismissals per workspace

> **Jury Insight:** 21% mentioned this, especially Power Users (38%)

#### 8. Enhanced Partner CTA for Red Status
- [ ] Elevate "Get help from a partner" to primary CTA when status is RED
- [ ] Make partner connection frictionless

> **Jury Insight:** 18% said partner link was too buried

#### 9. "Who Can Help" Guidance
- [ ] For each issue, indicate who typically fixes it:
  - "You can do this yourself" (with guide)
  - "Ask your HubSpot Admin"
  - "Connect with a partner"

> **Jury Insight:** Sales reps' top request—they don't know HOW to fix HubSpot

### P2: Nice to Have (Future)

- [ ] Export report (PDF/CSV) for sharing with leadership
- [ ] Historical trend view (CRM health over time)
- [ ] Technical detail toggle for power users
- [ ] API access for programmatic checks (partner request)
- [ ] "Assign to RevOps" action (Sales Leader request)
- [ ] White-label version for partners (CSM request)

### Out of Scope (v1)

- Automated remediation (AI fixes issues for you)
- Property creation from AskElephant
- Partner matching/marketplace
- Integration with workflow builder (gating)

---

## Messaging Guidelines

### ✅ Do Say

| Situation | Copy |
|-----------|------|
| Yellow status headline | "Opportunities to unlock full value" |
| Red status headline | "Let's get you some expert help" |
| Issue framing | "Optimization opportunity" |
| Normalization | "90% of HubSpots have gaps—this is normal" |
| Benefit-first | "Fixing this will improve your deal insights" |

### ❌ Don't Say

| Situation | Avoid |
|-----------|-------|
| Yellow status headline | "Needs attention", "Issues found" |
| Red status headline | "Action required", "Critical problems" |
| Issue framing | "Problem", "Error", "Misconfigured" |
| Blame language | "Your CRM is broken", "You need to fix" |

---

## Open Questions (Updated)

| # | Question | Status | Answer |
|---|----------|--------|--------|
| 1 | What's the minimum readiness checklist? | 🔄 In Progress | Need partner input |
| 2 | Where does diagnostic live? | ✅ Resolved | Settings > Integrations (post-connection) |
| 3 | How do we refresh scores? | ⬜ Open | Recommend: On-demand + daily background |
| 4 | What permissions do we need? | ⬜ Open | Needs engineering input |
| 5 | How do we message Red customers? | ✅ Resolved | See Messaging Guidelines above |

---

## Technical Considerations

*To be filled out after engineering review*

- HubSpot API endpoints needed
- Data access requirements
- Performance implications (diagnostic speed)
- Caching strategy for diagnostic results

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Jury Validated? |
|------|------------|--------|------------|-----------------|
| Customers feel blamed for "bad CRM" | High | High | Non-accusatory messaging, normalization | ✅ Jury confirmed risk; messaging fixes in P0 |
| Diagnostic creates more friction in onboarding | Medium | Medium | Make it fast (<30 sec) and skippable | ⬜ Not yet tested |
| Partners see this as threat to their business | Low | Medium | Position as enablement tool | ✅ 93% partner approval |
| HubSpot API limitations block key checks | Medium | High | Prototype early to validate feasibility | ⬜ Needs engineering |
| Sales reps can't act on guidance | High | Medium | Add "who can help" + video tutorials | ✅ Jury confirmed; P0 fix |

---

## Jury Validation Summary

### Prototype v1 Results (2026-01-21)

| Metric | Result |
|--------|--------|
| Overall Approval | 74% |
| Would Use | 78% |
| Sample Size | 300 personas |
| Verdict | ✅ Validated with improvements |

### Approval by Segment

| Segment | Approval | Action |
|---------|----------|--------|
| Power Users | 89% | ✅ Ship |
| Operations | 82% | ✅ Ship |
| Partners | 93% | ✅ Ship |
| Sales Leaders | 76% | ✅ Ship |
| Sales Reps | 65% | ⚠️ Improve guidance |
| **Skeptics** | 54% | ⚠️ Fix messaging |

### Key Improvements Made (v2)

- [x] Soften RED status messaging
- [x] Add step-by-step guidance with video links
- [x] Add time estimates per issue
- [x] Add "who can help" guidance
- [x] Add dismiss functionality
- [x] Add impact indicators

---

## References

- [Research: CRM Readiness Diagnostic](./research.md)
- [Hypothesis: hyp-crm-readiness-diagnostic](../../hypotheses/validated/crm-readiness-diagnostic.md)
- [Signal: Crispy Product Feedback](../../signals/transcripts/2026-01-21-crispy-product-feedback-session.md)
- [Signal: Zipcio Methodology](../../signals/documents/Zipcio_%20AI%20as%20a%20Service.md)
- [Jury Report: Prototype v1](./jury-evaluations/jury-report.md)
- [Placement Research](./placement-research.md)
- [Prototype Notes](./prototype-notes.md)
