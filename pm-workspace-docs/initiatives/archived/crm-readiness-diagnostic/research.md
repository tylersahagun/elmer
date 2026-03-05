# Research: CRM Readiness Diagnostic

> **Status:** Discovery
> **Hypothesis:** `hyp-crm-readiness-diagnostic`
> **Primary Personas:** RevOps, Sales Leaders, Implementation Partners
> **Pillar:** Trust Foundation

---

## Summary

AskElephant implementations fail or underperform when customers have poorly configured HubSpot accounts. Partner feedback reveals that **90%+ of customers** have CRM configuration issues that block success—missing object associations, unused contacts/companies, bad data quality. Expert partners require **53+ hours of prerequisite CRM work** before AskElephant can be introduced successfully.

**The core insight:** When CRM is clean, AskElephant "sells itself." The problem is getting customers to that state—and most don't know they have a problem until AskElephant fails to deliver value.

---

## User Interviews

| Date | Participant | Role | Key Insights |
|------|-------------|------|--------------|
| 2026-01-21 | Crispy | HubSpot Partner / Implementation Lead | 90%+ of customers have CRM config issues; can only introduce AE at END of engagements; needs 53+ hours of prep work |
| 2026-01-21 | Zipcio Methodology | Partner Documentation | Phase 3 (AskElephant) comes AFTER 26+ hours of CRM dev; $5,000 AE setup; clear exit criteria for CRM readiness |
| 2026-01-21 | Internal (Tyler/Matt) | Prototype Review Session | **NEW** - Positioning concerns for partner channel; pivot toward partner-enablement tool |

---

## Key Findings

### Finding 1: CRM Trust is a Prerequisite

**Evidence:** 
> "The client use it as my HubSpot account. Don't fully trust it. So why am I adding another system to add more data to it on top of shit? That's the most common thing that I run into when I'm working with this with customers."
> — Crispy

**Implications:**
- Customers won't adopt new tools if they don't trust their existing data
- AskElephant is perceived as "adding to the mess" rather than solving problems
- Trust must be established BEFORE automation can be accepted
- **Aligns with Woody's principle:** "Trust and reliability must be solved before automation can be adopted at scale"

---

### Finding 2: Object Association Determines Success

**Evidence:**
> "I think I believe fully dictate whether AskElephant will be successful with that team because most sales teams will only use deals, and they won't use contacts. They won't use companies."
> — Crispy

**Implications:**
- Basic CRM hygiene (using contacts/companies/deals properly) is a non-negotiable prerequisite
- 90%+ of customers aren't doing this correctly
- AskElephant's value depends on being able to link conversations to structured CRM objects
- **Diagnostic opportunity:** Detect if deals lack contacts/company associations

---

### Finding 3: Partners Quantified the Prerequisite Work

**Evidence:**
> Zipcio AI-as-a-Service methodology shows:
> - Phase 1 (ICP + Clay): 26 hours, $4,500
> - Phase 2 (Conversion): 27 hours, $5,000
> - **Phase 3 (AskElephant): 24 hours, $5,000** — only introduced after Phases 1-2 complete
> 
> **Exit criteria for Phase 2:** "Your HubSpot account is properly configured with properties, personas, segments, reports."

**Implications:**
- Expert partners have empirically determined 53+ hours of CRM work is required before AskElephant
- Self-serve customers are expected to do this themselves—and can't
- Partner model is proven but not scalable for mid-market customers without dedicated support
- **Opportunity:** Compress 53 hours to <10 hours with automated diagnostics + guided remediation

---

### Finding 4: Clean CRM = Easy Sale

**Evidence:**
> "The help of the customers that have converted are at the end of their sales or at the end of their customer cycle with us because they're on a clean build. And that's why it's a no brainer."
> — Crispy

**Implications:**
- AskElephant literally sells itself when CRM is properly configured
- The value prop is clear and obvious once the foundation is solid
- Our activation problem may be a CRM readiness problem in disguise
- **Metric to track:** Activation rate segmented by CRM health score

---

### Finding 5: 🆕 Partner Channel Risk (Prototype Feedback)

**Evidence:**
> "If we make it super easy for us to, like, simulate the fix and fix and go do that, then it, like, comes up with a question of, like, why is Crispy even needed?"
> — Internal feedback on prototype

> "I wanna make sure that, like, we're not only stepping on toes, but, like, crushing, you know, toes. Yeah. Right? Because that could, like, even burn potential partnerships in the future."
> — Internal feedback

> "He is the HubSpot partner to them where he's gonna come in and he's gonna fix it. He's gonna be the professional that walks them through."
> — Internal feedback

**Implications:**
- **Critical Risk**: Current prototype positions diagnostic + auto-fix for end customers
- This directly threatens HubSpot partners' core business model (they bill for this work)
- Could damage partner relationships and referral pipeline
- Partners are our primary distribution channel in HubSpot ecosystem

---

### Finding 6: 🆕 Partner-First Positioning (Prototype Feedback)

**Evidence:**
> "So what if instead, this is not check your HubSpot health. This is a tool only for partners, and it's part of our partner program. It's like, hey. You spend so much time auditing HubSpot. We wanna give you more billable hours. We want to actually increase your top line."
> — Tyler (prototype discussion)

> "This is a tool to a specific type of partner. Maybe we even upcharge for this specific type of tool... That's not gonna just be AskElephant premium. That's gonna be AskElephant, like, whatever, right, additional."
> — Internal feedback

> "They would want essentially that to be almost, like, private. Creating that moat around their money making tool."
> — Internal feedback

**Implications:**
- **Strategic pivot opportunity**: Partner-enablement tool vs. customer self-serve tool
- Partners would pay premium for a diagnostic that speeds up their work
- Estimated partner value: $500/month mentioned as potential price point
- Partner sees results ONLY (not customer) → protects partner's advisory role
- Configurable to match partner's methodology

---

### Finding 7: 🆕 Auto-Fix Feature is High-Risk (Prototype Feedback)

**Evidence:**
> "Deals missing contact associations. 847 associated. One button here could be, like, create association... do you wanna update those 847 deals to find the contacts?"
> — Tyler (demonstrating prototype)

> "This is really, like, really cool about it. I love it. Like, everything you're saying up until this point... But the [auto-fix] definitely scares you."
> — Internal feedback

**Implications:**
- Auto-remediation is technically impressive but strategically risky
- Partners see this as their billable work being automated away
- Even if partners like the diagnostic, the "fix it" button crosses a line
- **Possible middle ground**: Diagnostic + playbook (tells partner what to fix, doesn't fix itself)

---

## Prototype Feedback: v2 Positioning Analysis

### Current Design (Customer-Facing)
- Customer runs diagnostic
- Customer sees issues
- Customer clicks "fix" or "get partner help"
- **Risk:** Threatens partners; may not drive partner referrals

### Alternative Design (Partner-Enablement)
- Partner has exclusive access to diagnostic tool
- Partner runs diagnostic on client's HubSpot
- Partner sees issues with recommended playbook
- Partner bills client for remediation work
- **Benefit:** Accelerates partner work; strengthens partner relationship; premium revenue

### Hybrid Design (Both)
- **Self-serve customers**: Basic diagnostic with "Connect to Partner" CTA
- **Partner customers**: Advanced diagnostic with playbooks + methodology config
- **Key distinction**: Partners see MORE detail; customers see enough to understand + engage help

---

## User Problems Identified

| Problem | Severity | Frequency | Evidence |
|---------|----------|-----------|----------|
| Customers don't know their CRM is blocking AskElephant success | High | Common (90%+) | "Why am I adding another system on top of shit?" |
| Self-serve customers fail without understanding why | High | Common | Partner can only introduce AE at end of engagement |
| AskElephant failures appear as product bugs, not CRM config | High | Common | Support burden increases |
| Partners need 53+ hours to get customer CRM ready | Medium | Common | Zipcio methodology shows prerequisite work |
| No way to assess "readiness" before implementation | High | Universal | No diagnostic exists today |
| 🆕 **Partner business model threatened by self-serve diagnostic** | High | — | Internal feedback: "Why is Crispy even needed?" |

---

## Competitive Context

- **HubSpot Breeze AI:** Ships embedded in HubSpot—doesn't have the "leave your CRM" problem. But doesn't address CRM quality either.
- **EBSTA:** "Failed because of bad data" per Crispy. Forecasting tools that depend on clean CRM also fail when CRM is dirty.
- **Fathom:** "Product sucks" - no real CRM integration. Doesn't have this problem because doesn't integrate deeply.
- **Gong/Chorus:** Enterprise focus with dedicated implementation resources. Can force CRM cleanup as part of deal.

**Strategic Implication:** Mid-market self-serve customers hit this wall hardest. Enterprise has implementation support; SMB doesn't integrate deeply enough to care. We're in the worst spot without a solution.

---

## Solution Hypotheses (Updated)

### H1: Automated CRM Diagnostic (Customer-Facing)
- ✅ Validated as useful
- ⚠️ Risk: Partner channel conflict
- **Recommendation:** Proceed with softer positioning; primary CTA = "Get Partner Help"

### H2: Readiness Scorecard
- ✅ Validated: Traffic light system resonates (74% jury approval)
- **Recommendation:** Keep in v2; focus on guidance not auto-fix

### H3: Guided Remediation (AI Assist)
- ⚠️ High-risk per partner feedback
- **Recommendation:** Deprioritize or make partner-only

### H4: Partner Enablement Tools 🆕 ELEVATED
- **Hypothesis:** If we give partners a premium diagnostic tool that accelerates their work and protects their advisory role, we strengthen the partner channel and create premium revenue.
- **Test approach:**
  - Partner-only diagnostic dashboard
  - Configurable to partner's methodology
  - Playbook output (not auto-fix)
  - Pricing: ~$500/month
- **Next step:** Validate with Crispy directly; get James's input

---

## Open Questions (Updated)

| # | Question | Status | Notes |
|---|----------|--------|-------|
| 1 | What's the minimum CRM configuration that makes AskElephant successful? | 🔄 | Need readiness checklist with Crispy |
| 2 | Can we detect CRM issues through HubSpot API alone? | ⬜ | Technical feasibility TBD |
| 3 | What's the conversion rate of "diagnosed" customers? | ⬜ | Do they fix issues? |
| 4 | Should we gate features behind CRM health? | ⬜ | E.g., "This workflow requires associated contacts" |
| 5 | Is there a self-serve path, or do all Red customers need partners? | ⬜ | Cost/ROI of guided remediation |
| 6 | How do we message this without blaming the customer? | ✅ | Solved in v2 prototype |
| 7 | 🆕 **Should this be partner-only vs. customer-facing?** | 🔄 | Critical decision—need Crispy + James input |
| 8 | 🆕 **What would partners pay for this tool?** | ⬜ | ~$500/month hypothesized |
| 9 | 🆕 **Does Crispy feel threatened or enabled by prototype?** | ⬜ | Need to show him directly |

---

## Related Research

- [Crispy Product Feedback Session](../../signals/transcripts/2026-01-21-crispy-product-feedback-session.md) - Primary source transcript
- [Zipcio AI as a Service Methodology](../../signals/documents/Zipcio_%20AI%20as%20a%20Service.md) - Partner service structure
- [Prototype Feedback Session](../../signals/transcripts/2026-01-21-crispy-feedback.md) - 🆕 Internal positioning discussion
- [hyp-hubspot-agent-config-ui](../../hypotheses/committed/hubspot-agent-config-ui.md) - Related hypothesis on workflow config
- [crm-exp-ete initiative](../crm-exp-ete/) - End-to-end CRM experience work

---

## Next Steps (Updated)

| Priority | Action | Owner | Status |
|----------|--------|-------|--------|
| **1** | 🆕 Show prototype to James for input | Tyler | ⬜ Pending |
| **2** | 🆕 Show prototype to Crispy directly—gauge reaction | Tyler | ⬜ Pending |
| **3** | 🆕 Design partner-only variant of diagnostic | Tyler | ⬜ Pending |
| 4 | Define Readiness Criteria with partner input | Tyler | 🔄 In progress |
| 5 | Technical Feasibility: HubSpot API assessment | Eng | ⬜ Pending |
| 6 | Customer Interviews: Churned customers | Tyler | ⬜ Pending |

---

## Strategic Alignment Check

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Trust Foundation** | ⭐⭐⭐⭐⭐ | Directly addresses "trust your data before trusting automation" |
| **Outcome Orientation** | ⭐⭐⭐⭐ | Clear chain: diagnostic → remediation → activation → retention |
| **Human Empowerment** | ⭐⭐⭐⭐ | Helps customers understand and fix their own CRM |
| **Data Capture** | ⭐⭐⭐ | Indirectly improves data quality by ensuring CRM is clean |
| **Differentiation** | ⭐⭐⭐⭐ | Competitors don't address this; unique onboarding investment |
| **Expansion Driver** | ⭐⭐⭐⭐ | Solves churn/activation; enables partner scale |
| 🆕 **Partner Channel** | ⭐⭐⭐⭐⭐ | Partner-first positioning strengthens distribution |

**Total: 28/35** — Strong strategic fit. Partner-first variant may be optimal path.

---

## Tags

`#crm-readiness` `#hubspot` `#onboarding` `#retention` `#partner-feedback` `#trust-foundation` `#partner-enablement`
