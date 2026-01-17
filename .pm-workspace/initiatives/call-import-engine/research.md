# Research Summary: Call Import Engine

**Date:** 2026-01-12  
**Participants:** Eduardo Gueiros, Tyler Sahagun, Skylar Sanford, Brian (2 meetings)

---

## TL;DR

AskElephant needs a scalable call import system to bring historical data from competitor platforms (Gong, Grain, RingCentral, etc.) when customers switch. Currently, this is a painful engineering burden requiring custom work for each import. The team discussed two paths: API-based integrations with full metadata vs. a simpler "bucket drop" approach. **Strategic alignment is strong**—this directly supports the outcome chain by reducing time-to-value for new customers and enabling consistent data capture.

---

## Strategic Alignment

**Score:** Strong ✅

**Aligned:**
- ✅ **Clear outcome chain**: Import calls → customers have data immediately → workflows run on day 1 → faster time-to-value → expansion/retention
- ✅ **Data Capture pillar**: Directly improves consistency of data capture from external sources
- ✅ **Reduces zero-state problem**: New customers can immediately query historical data vs. waiting 24+ hours for first call
- ✅ **Expansion driver**: Customers switching from Gong/Grain/others bring data = smoother migration = higher close rates
- ✅ **Internal efficiency**: Reduces engineering burden; moves toward support-manageable process

**Concerns:**
- ⚠️ **Privacy implications identified but not solved**: Who owns imported calls? Privacy determination doesn't run on historical data. Team acknowledged this as out-of-scope but it's a trust gap.
- ⚠️ **Expectation management unclear**: Sales pitch implies 5,000 imported calls = fully queryable context. Reality is metadata may be incomplete, no speaker assignment, limited utility for AI chat.
- ⚠️ **Scope creep risk high**: Team already discussing continuous sync, voice ID, customer-facing portals, pricing—need hard boundaries.

---

## Key Decisions

1. **No design/UI work in v1** — This is backend architecture + process documentation only
2. **Historical import is primary scope** — Continuous/live sync is explicitly deferred (but architecture should consider it)
3. **Two-path solution proposed**:
   - Path A: API integrations for platforms with good export APIs (Gong, Grain, RingCentral)
   - Path B: Bucket drop for platforms without good APIs (generic file upload)
4. **Grain import is the proof-of-concept** — Eduardo targeting Noah's 5,000 calls as first test
5. **Out of scope**: Mobile app, white-labeling, customer-facing self-service, privacy classification, continuous sync

---

## Action Items

- [ ] **Tyler**: Send draft PRD to Eduardo and Brian by end of day (2026-01-12) — @tylersahagun
- [ ] **Tyler**: Get list of 7-10 platforms to prioritize (current + requested) — @tylersahagun
- [ ] **Tyler**: Talk to revenue team re: historical imports vs. continuous sync priority — @tylersahagun
- [ ] **Eduardo**: Push PR for import engine framework draft — @eduardo (today)
- [ ] **Eduardo**: Complete Grain proof-of-concept import for Noah — @eduardo (midweek)
- [ ] **Team**: Use AI/Deep Research to analyze API docs for all prioritized platforms — @tylersahagun
- [ ] **Team**: Schedule follow-up meeting — @eduardo (tomorrow)

---

## User Problems

### 1. Sales/CS Can't Confidently Answer "Can We Import?"

> "What we're actually trying to get to is a state where a sales rep or a CSM can confidently say when asked a question, 'Can I import calls from X platform?' They can either say we do or we don't support it."
> — Tyler

- **Severity:** High
- **Frequency:** Common (happens on most competitive deals)
- **Persona:** Sales Rep, CSM

### 2. Import Process is Engineering-Heavy and Unpredictable

> "I've submitted to Andrew personally for the hire... That's the hardest thing."
> — Tyler (on the engineering burden)

> "Every time I try to tackle this, I feel like it starts to spiral."
> — Tyler

- **Severity:** High  
- **Frequency:** Every import request
- **Persona:** Engineering, Support

### 3. Zero-State Experience is Painful

> "When I was onboarding, it was really hard to show someone the platform... The conversation was literally like, 'When is your next call?' Looks like you have a call tomorrow at twelve. So over twenty-four hours passed..."
> — Tyler

- **Severity:** High
- **Frequency:** Every new customer
- **Persona:** Sales Rep (prospect), CSM (onboarding)

### 4. API Reliability/Rate Limiting is Unpredictable

> "I was running the script and did it five days around, come back, and Gong had just decided to, like, put a limit one day that made it so that we only got five of the 20,000."
> — Tyler

- **Severity:** High
- **Frequency:** Occasional but catastrophic when it happens
- **Persona:** Engineering

### 5. Metadata Quality Varies Wildly

> "If they do that, we're only getting the media files. We might be missing our metadata that only comes through API."
> — Eduardo

> "If you have 5,000 calls in, you're not actually querying all that data. It's just storage."
> — Participant (on expectations vs. reality)

- **Severity:** Medium
- **Frequency:** Every import
- **Persona:** All (creates expectation mismatch)

---

## Feature Ideas & Requests

### Core (In Scope)

| Feature | Outcome Chain | Notes |
|---------|---------------|-------|
| Support-manageable import process | Engineering freed → faster imports → faster customer activation | Primary goal |
| Standardized platform support list | Clear yes/no answers → better sales confidence → higher close rates | Includes process for new platform evaluation |
| Import engine framework | Reusable architecture → easier to add new platforms → scalable | Eduardo already started |
| Error handling & notifications | Visibility → trust → fewer support escalations | Status updates, completion notifications |

### Future Considerations (Explicitly Deferred)

| Feature | Notes |
|---------|-------|
| Continuous/live sync | Architecture should support, but not implementing now |
| Customer-facing self-service portal | "Import from platform" button, pricing, status tracking |
| Voice ID integration | Would solve speaker assignment without metadata |
| Privacy classification for imports | Privacy Determination Agent could process, but not guaranteed |
| Bucket/FTP drop zone | Simpler path for platforms without APIs |

---

## Insights

1. **Competitors don't want us to succeed at this** — "These platforms are not highly motivated to get rid of their data." Integration friction is a defensive moat for Gong, etc.

2. **Unified.to is the only potential buy option** — Everything else (Zapier, Workato) is workflow-focused, not data-import-focused. Missing Grain, Fathom coverage.

3. **PipeDream auth could help** — Tyler exploring whether Dialpad integration through PipeDream could simplify OAuth flows for future integrations.

4. **The "just add a bucket" approach has limits** — Solves the file-getting problem but loses all metadata (participants, company, contacts). Could be a second-class tier.

5. **AI could help with platform research** — Team suggested using AI/Deep Research to analyze API docs and categorize platforms by import difficulty.

---

## Platforms Mentioned

### Currently Supported/Used
- Gong ✓
- RingCentral ✓ (5-min polling)
- HubSpot ✓
- Grain (proof-of-concept in progress)

### Requested/Known Needs
- Dialpad (in progress)
- Fathom
- Zoom Phone (painful OAuth setup)
- Five9
- Aircall
- Go To (Microsoft)
- Microsoft Teams (SharePoint export issues)

### Evaluated for Buy
- Unified.to (closest match, missing key platforms)
- Zapier/Workato (not data-import focused)

---

## Questions to Answer Before PRD

Based on gaps detected:

1. **What's the priority: historical imports or continuous sync?** Tyler to confirm with revenue team.
2. **What metadata is minimum viable?** Meeting title only? Or do we require participants/company?
3. **What's the expectation for imported calls in AI chat?** Can they be queried? Searched? Workflows run?
4. **How do we handle privacy for imported calls?** Default public? Run through Privacy Agent? User disclaimer?
5. **What's the SLA for evaluating new platform requests?** How long do we commit to for research?
6. **What's the success metric?** Time-to-import? Engineering hours saved? Support CSAT?

---

## Open Questions

1. Should we pursue Unified.to for platforms they do support? (Hybrid approach)
2. What's the realistic capacity for building new integrations post-v1?
3. How do we communicate metadata limitations to customers without killing deals?
4. Is there budget for test accounts on these platforms? (RingCentral costs $30/seat × 5 minimum)
5. Who maintains the platform support documentation long-term?

---

## Raw Notes

### Meeting 1 Highlights (Project Kickoff)
- Focus on giving sales/CS clarity on what's supported
- Two-path approach: API integrations vs. bucket drop
- Explicitly deferring: mobile, white-label, customer self-service, privacy, continuous sync
- Eduardo started framework, targeting Grain as first proof-of-concept
- Acknowledged scope creep is the biggest risk

### Meeting 2 Highlights (Tyler + Eduardo Follow-up)
- Only found Unified.to as potential buy option (missing key platforms)
- Agreed: No design work needed for v1
- Tyler to send PRD draft by end of day
- Main outcomes: Support-manageable process, clarity on supported platforms
- Dialpad/PipeDream auth exploration as potential pattern for OAuth simplification
