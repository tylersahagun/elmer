# Call Import Engine - PRD

## Overview

- **Owner:** Tyler Sahagun
- **Target Release:** Q1 2026
- **Status:** Draft
- **Strategic Pillar:** Data Knowledge (consistent capture from external sources)
- **2026 Initiative:** Supports CRM Agent Upgrades (data foundation)

The Call Import Engine provides a scalable, support-manageable system for importing historical call recordings from competitor platforms (Gong, Grain, RingCentral, etc.) into AskElephant. This enables customers switching to AskElephant to bring their historical data, eliminating the painful zero-state experience and accelerating time-to-value.

## Problem Statement

When customers switch from Gong, Grain, or other call recording platforms to AskElephant, they face a frustrating experience:

> "When I was onboarding, it was really hard to show someone the platform... The conversation was literally like, 'When is your next call?' Looks like you have a call tomorrow at twelve. So over twenty-four hours passed..." — Tyler

Currently, importing calls requires custom engineering work for each request, creating unpredictable timelines and blocking both sales and onboarding:

> "Every time I try to tackle this, I feel like it starts to spiral." — Tyler

The result: Sales can't confidently answer "Can we import your calls?", customers wait days for value, and engineering is constantly pulled into one-off migrations.

## Target Personas

- [x] **Sales Representative** — Needs confident answers on import capabilities during competitive deals
- [x] **CSM** — Needs smooth onboarding with immediate data availability
- [ ] Sales Leader
- [x] **RevOps** — Needs reliable, consistent data from day one

---

## Outcomes Framework

### Customer Outcome
**Target State:** New customers switching from competitors have their first 100+ calls available in AskElephant within 1 hour, with full import completion within 1–5 business days—enabling AI analysis and workflows from day one, not after their first recorded call.

**Current State:** Customers wait 24+ hours for their first call to be recorded before they can use AskElephant meaningfully. Historical imports require weeks of engineering coordination with unpredictable timelines.

**Gap:** No standardized, support-manageable process for importing calls. Each import is a custom engineering project with unknown scope.

**Platform Expansion:** New integrations can be spun up within 5–10 business days, enabling rapid response to customer requests.

### Business Outcome
**Target State:** Call import becomes a competitive advantage that accelerates deal close rates and improves onboarding satisfaction, directly supporting expansion and retention.

**How this drives:** 
- [x] **Land** — Removes "can you import my data?" as a deal blocker; confident yes/no answers
- [x] **Expand** — Customers see value faster → higher NPS → more likely to expand seats
- [x] **Retain** — Smooth migration experience reduces early churn risk

### Success Metrics
| Metric                               | Type    | Current      | Target                           |
| ------------------------------------ | ------- | ------------ | -------------------------------- |
| Time to first 100 calls available    | Leading | N/A          | <1 hour (supported platforms)    |
| Time to full import completion       | Leading | 2–4 weeks    | 1–5 business days                |
| Time to spin up new platform         | Leading | Weeks+       | 5–10 business days               |
| Engineering hours per import         | Leading | 8–16 hrs     | <2 hrs                           |
| Sales confidence on import questions | Leading | Low (ad-hoc) | "Yes/No" for supported platforms |
| Onboarding CSAT (import customers)   | Lagging | Unknown      | >8/10                            |


### Success Criteria
| Criteria                              | Target                             | Timeline            | How We'll Measure               |
| ------------------------------------- | ---------------------------------- | ------------------- | ------------------------------- |
| Grain POC complete (Noah's 5K calls)  | 100% imported, queryable           | Mid-January 2026    | Confirmed by Noah               |
| Support-manageable process documented | Runbook exists                     | End of January 2026 | Support can execute without eng |
| Platform support list published       | 10+ platforms categorized          | End of January 2026 | Internal doc + sales enablement |
| First 100 calls under 1 hour          | Demonstrated on supported platform | Mid-January 2026    | Internal testing                |
| New platform integration time         | <10 business days                  | Q1 2026             | Track from request to live      |
| First paid import completed           | >10K calls                         | Q1 2026             | Revenue recorded                |

---

## Outcome Chain

```
Import engine enables historical call imports
  → so that customers have data immediately upon switching
    → so that AI analysis and workflows run from day one
      → so that time-to-value is reduced from weeks to days
        → so that close rates increase and churn risk decreases
          → so that expansion and retention improve
```

---

## User Stories

### Epic: Historical Call Import

**As a** Sales Rep selling against Gong,
**I want to** confidently tell prospects we can import their historical calls,
**So that** data migration isn't a deal blocker.

#### Acceptance Criteria
- [ ] Published list of supported platforms with yes/no import capability
- [ ] Estimated timeline for each platform tier
- [ ] Clear messaging on what imported calls can/can't do

---

**As a** CSM onboarding a new customer,
**I want to** have their historical calls imported before their first training session,
**So that** I can demo real value with their actual data.

#### Acceptance Criteria
- [ ] First 100+ calls available within 1 hour of import initiation (supported platforms)
- [ ] Full import completion within 1–5 business days
- [ ] Imported calls visible in meeting list
- [ ] At minimum: searchable, playable, with transcripts

---

**As a** Support team member,
**I want to** execute imports without engineering involvement,
**So that** customers don't wait on engineering availability.

#### Acceptance Criteria
- [ ] Documented runbook for each supported platform
- [ ] Self-service API key/credential collection process
- [ ] Status notifications during import process

---

## Scope

### In Scope (MVP)

1. **Import framework architecture** — Reusable patterns for adding new platforms
2. **Grain integration** — Proof-of-concept with Noah's 5,000 calls
3. **Support runbook** — Documentation for executing imports without engineering
4. **Platform support matrix** — Clear yes/no/maybe for top 10 platforms
5. **Error handling & notifications** — Status updates, failure alerts
6. **Pricing guidance** — Cost estimates for revenue team

### Out of Scope (v1)

- **Customer-facing self-service UI** — No "Import from Gong" button yet
- **Continuous/live sync** — Architecture should support, but not implementing
- **Privacy classification for imports** — Imported calls default to customer's privacy settings
- **Voice ID/speaker assignment** — Dependent on metadata from source
- **Mobile app considerations**

### Future Considerations

- Continuous sync for ongoing data capture
- Self-service import portal with pricing
- Voice ID integration for speaker assignment
- Privacy Determination Agent processing for imported calls

---

## User Flows

### Flow: Support-Managed Import (v1)

**Trigger:** Customer requests historical import during sales or onboarding

**Steps:**
1. Sales/CS confirms platform is supported (platform matrix)
2. CS collects API credentials or export files from customer
3. CS submits import request via internal process
4. Import engine prioritizes first 100+ calls for rapid availability (<1 hr)
5. Remaining calls process in background (full completion: 1–5 business days)
6. CS receives completion notification
7. CS confirms with customer and provides guidance on limitations

**Outcome:** Customer has historical calls visible and searchable in AskElephant

**Error states:**
- API rate limit exceeded → Retry with backoff, notify CS of delay
- Invalid credentials → Immediate notification to CS, customer re-auth
- Corrupted files → Flag individual failures, continue with valid files

**Trust recovery:** Clear communication at each stage; no silent failures

---

## Trust & Privacy Considerations

- **Privacy determination interaction:** Imported calls do NOT run through Privacy Determination Agent in v1. They inherit customer's default privacy settings.
- **Data access implications:** Customer must own the source data. We don't store credentials beyond import session.
- **Transparency to users:** Imported calls should be visually distinguished (if needed) so users know provenance.
- **Error recovery plan:** Failed imports are logged; customers can re-request without losing progress.

> ⚠️ **Trust Gap Acknowledged:** Leadership principle says "Trust is foundational." Imported calls without privacy classification is a known gap. Future iteration should consider Privacy Agent integration.

---

## Technical Considerations

- **Dependencies:** Existing import contexts (Gong, RingCentral, Fireflies, HubSpot, Zapier)
- **Integration points:** `functions/src/contexts/media-recording-processing/`
- **Rate limiting:** Internal limit ~5,000 calls/12 hrs; Gong API 10K/day
- **Priority queue:** First 100 calls prioritized for <1 hour availability; remaining calls queued for background processing
- **Reliability risks:** Third-party API changes, rate limit enforcement, OAuth expiration
- **Processing window:** Night-only for bulk processing to avoid production impact; priority queue runs during business hours
- **New platform development:** Architecture must support 5–10 business day integration cycles for new platforms

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep (continuous sync, UI, etc.) | High | High | Hard scope boundary; defer to v2 |
| API rate limits cause delays | Medium | Medium | Set timeline expectations upfront |
| Metadata quality varies by platform | Medium | High | Document limitations per platform; set expectations |
| Engineering pulled into every import | High | High | Runbook + support training = primary goal |
| Expectation mismatch (storage vs. insights) | High | Medium | Clear messaging: "imported = searchable, not coached" |

---

## Strategic Alignment

- [x] Outcomes Framework complete (all 4 components)
- [x] Outcome chain complete
- [x] Persona validated (Sales, CS, RevOps)
- [x] Trust implications assessed (privacy gap acknowledged)
- [x] Not in anti-vision territory (this is infrastructure, not "me-too AI features")
- [x] Supports 2026 initiative stack (data foundation for CRM agents)

---

## Open Questions

1. **What's minimum viable metadata?** — Title only acceptable? Or require participants?
2. **SLA for new platform evaluation?** — How quickly do we commit to research requests?
3. **Absorb costs for enterprise?** — Is import free for large deals as "migration assistance"?
4. **Continuous sync pricing?** — Separate SKU or included in higher tiers?

---

*Last updated: 2026-01-13*
*Owner: Tyler Sahagun*
