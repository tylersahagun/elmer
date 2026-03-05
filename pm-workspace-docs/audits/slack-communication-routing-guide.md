# AskElephant Slack Communication Routing Guide

**Generated:** January 24, 2026  
**Based on:** 90-day conversation analysis of 79 internal channels

---

## Quick Reference: Where Should This Go?

### Company Communication

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Announce something company-wide** | #general | #watering-hole, #epd-all |
| **Post something social/fun** | #watering-hole | #general |
| **Share AI industry news** | #ai-news | #general |
| **Report a system incident** | Use incident.io → auto-posts to #incidents | #alerts, #product-issues |
| **Request tool/system access** | Create Linear IT ticket → #access-requests | DM to Kaden |
| **Report phishing attempt** | #phishing-reports | #general |

### Product & Engineering

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Report a bug** | #product-issues (include screenshots + steps) | #team-dev, #product-forum |
| **Request a feature** | #product-requests (include customer context) | #product-issues |
| **Discuss product experience** | #product-forum (use threads) | #product-issues |
| **Announce a release** | #product-updates | #general |
| **Request PR review** | #team-dev-code-review (use `<S06D3PPJ5CZ>` tag) | #team-dev |
| **Ask a technical question** | #team-dev | #team-dev-code-review |
| **Discuss design/UX** | #design-ux | #product-forum |
| **EPD-wide announcement** | #epd-all | #team-dev |

### Sales & Revenue

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Sales team coordination** | #team-sales | #general |
| **Celebrate a closed deal** | #sales-closed-won | #team-sales |
| **Document a lost deal** | #sales-closed-lost | (nowhere - skip it) |
| **Share competitor intel** | #competitors | #team-sales |
| **Escalate at-risk deal** | #deal-intervention | #team-sales |
| **Track expansion opportunity** | #expansion-opportunities | #team-sales |
| **Discuss revenue/forecast** | #revenue (private) | #team-sales |

### Customer Success

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Flag churn risk** | #churn-alert (urgent) | #team-csm |
| **Share customer quote** | #customer-quotes | #customer-feedback |
| **CSM team coordination** | #team-csm | #team-sales |
| **Respond to customer message** | #customer-message-queue | #team-csm |
| **Share strategic customer pattern** | #macro-insights | #customer-feedback |
| **Develop case study** | #case-studies | #customer-quotes |

### Marketing & Growth

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Growth metrics/experiments** | #growth | #marketing |
| **Marketing campaigns** | #marketing | #growth |
| **Product positioning/launch** | #product-marketing | #marketing |
| **Customer LinkedIn posts** | #linkedin-posts | #customer-quotes |

### Partners

| When you need to... | Go to | NOT to |
|---------------------|-------|--------|
| **Partner team coordination** | #team-partners | #team-sales |
| **HubSpot partner program** | #hubspot-partners | #team-partners |
| **New partnership evaluation** | #partnership-opportunities | #team-partners |

---

## Decision Trees

### Bug vs Feature vs Discussion

```
Something's broken?
├─ Yes, it's a bug → #product-issues
│   └─ Include: screenshots, steps to reproduce, customer impact
└─ No, it's working but could be better?
    ├─ Specific feature idea → #product-requests
    │   └─ Include: customer context, business impact
    └─ Want to discuss experience → #product-forum
        └─ Use threads for replies
```

### Customer Communication

```
Customer said something notable?
├─ Quotable testimonial → #customer-quotes
├─ Risk signal/unhappy → #churn-alert (urgent)
├─ Strategic insight (pattern across customers) → #macro-insights
├─ Case study candidate → #case-studies
└─ General feedback → #customer-feedback (automated capture)
```

### Deal Communication

```
Deal status changed?
├─ Won! → #sales-closed-won (celebrate!)
├─ Lost → #sales-closed-lost (document learnings)
├─ At risk → #deal-intervention (escalate)
├─ Expansion opportunity → #expansion-opportunities
└─ Needs coordination → #team-sales
```

---

## Channel Ownership Matrix

| Domain | Primary Channel | Owner Role |
|--------|----------------|------------|
| Company | #general | Leadership |
| Engineering | #team-dev | Engineering Lead |
| Product | #product-issues, #product-requests | Product |
| Design | #design-ux | Design |
| Sales | #team-sales | Sales Leadership |
| CS | #team-csm | CS Leadership |
| Marketing | #marketing | Marketing |
| Partners | #team-partners | Partnerships |
| IT | #access-requests | IT/DevOps (Kaden) |
| Incidents | #incidents | Engineering (via incident.io) |

---

## Automation Summary

These channels are primarily bot-driven:

| Channel | Bot | What it posts |
|---------|-----|---------------|
| #customer-feedback | AskElephant | Extracted feedback from calls |
| #customer-quotes | AskElephant | Notable customer quotes |
| #incidents | incident.io | Incident status updates |
| #access-requests | Linear | IT access ticket updates |
| #team-dev-code-review | GitHub | PR approval/comment notifications |
| #team-sales | HubSpot | Demo bookings, lead assignments |
| #churn-alert | (various) | Churn risk signals |

---

## Channels Needing Purpose Statements

**High Priority (20+ members, no purpose):**
- #customer-quotes (37 members)
- #competitors (27 members)
- #growth (31 members)
- #askelephant-internal-workflow-requests (25 members)

**Medium Priority:**
- All `#proj-*` channels
- All `#team-*` channels without purposes
- #churn-alert
- #alerts

---

## Recommended Channel Changes

### Archive Candidates
- #team-dev-doc-scrape (2 members, dormant)
- #deal-marqvision (deal-specific, archive when closed)
- #clozeloop-scorecard (customer-specific)
- #digitalj2-onboarding (temporary)

### Consolidation Candidates
- #aske-vs-gong → merge into #competitors
- #linkedin-post-ideas → merge into #linkedin-posts
- #cs-team-wins → merge into #team-csm
- #product-learnings → merge into #product-forum

### Add Purpose Statement (Suggested Text)

| Channel | Suggested Purpose |
|---------|------------------|
| #customer-quotes | Quotable customer testimonials for marketing, case studies, and team motivation |
| #competitors | Competitive intelligence - share competitor news, battle cards, positioning insights |
| #growth | Growth metrics, experiments, and acquisition strategies |
| #churn-alert | Churn risk alerts and intervention tracking. High priority - respond quickly |
| #product-requests | Feature requests and ideas. Include customer context and business impact |
| #access-requests | Request tool/system access. Tracked via Linear IT project |

---

## Summary Statistics

| Category | Channels | With Purpose | Without Purpose |
|----------|----------|--------------|-----------------|
| Company-Wide | 6 | 3 | 3 |
| Product & Engineering | 11 | 5 | 6 |
| Sales & Revenue | 15 | 0 | 15 |
| Customer Success | 11 | 1 | 10 |
| Marketing & Growth | 7 | 1 | 6 |
| Projects | 6 | 1 | 5 |
| Partners | 6 | 0 | 6 |
| Operations | 8 | 0 | 8 |
| Culture | 5 | 1 | 4 |
| **Total** | **79** | **12** | **63** |

**Key Finding:** 80% of channels lack documented purpose/topic statements.
