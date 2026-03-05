# Transcript: Crispy Product Feedback Session

**Date:** 2026-01-21
**Source:** Internal product feedback meeting
**Participants:** Woody, Brian, Palmer, Tyler, Sam Ho (new Head of Product), Crispy (HubSpot consultant/partner)

---

## TL;DR

Crispy, a HubSpot partner who implements AskElephant for customers, provided deep product feedback on how sales reps actually work. The core insight: **AskElephant's success is directly tied to HubSpot configuration quality**, and reps won't leave their CRM to use another tool. The highest-impact feature would be embedding Global Chat as a HubSpot sidebar—putting AskElephant where reps already work. Also revealed: workflow builder complexity is causing friction, and "hidden auto-fill fields" represent the future of CRM enrichment.

---

## Key Decisions

- Sam Ho confirmed as new Head of Product
- Acknowledged that many workflow builder nodes should be deprecated/hidden
- Recognized HubSpot sidebar integration as a high-priority feature request
- Agreed that HubSpot agent is the most reliable node; others are legacy

---

## Action Items

- [ ] Follow up with Crispy to review workflow builder improvements and test new agent nodes - @Tyler
- [ ] Enable tags/filters on workflow list for Crispy - @Tyler
- [ ] Explore HubSpot sidebar/card integration feasibility - @Brian/Palmer
- [ ] Consider deprecating legacy workflow nodes (search field, update field) - @Product

---

## Problems Identified

### Problem 1: AskElephant Success Depends on HubSpot Configuration Quality

> "The the client use it as my HubSpot account. Don't fully trust it. So why am I adding another system to add more data to it on top of shit? That's the most common thing that I run into when I'm working with this with customers."

> "I think I I believe fully dictate whether AskElephant will be successful with that team because most sales teams will only use deals, and they won't use contacts. They won't use companies."

- **Persona:** RevOps, Implementation Partners
- **Severity:** Critical
- **Frequency:** Common
- **Context:** Crispy can only successfully implement AskElephant at the END of a HubSpot engagement when the CRM is clean. Pre-requisite work takes 80+ hours.

### Problem 2: Sales Reps Won't Leave HubSpot to Use AskElephant

> "I don't see AskElephant being the center of our reps universe... The thing that the rep wants to do is I don't want to have to leave the current system that I'm in to do the action that I wanna take. And the beauty of this is, like, deals are where I make money. That's where I wanna spend all my time."

> "As a rep, the only thing I wanna see is if I'm gonna hit quota. That's pretty much it."

- **Persona:** Sales Rep, AE
- **Severity:** High
- **Frequency:** Universal
- **Context:** Reps are "rogue cowboys" - they won't adopt new tools unless embedded in existing workflow. The CRM is "center of universe."

### Problem 3: Global Chat Should Be Embedded in HubSpot as a Sidebar

> "I would love a global chat to be a card or a on the record sidebar in HubSpot directly. I would use the fuck out of that... Having AskElephant as a sub bar here would be incredible, incredible."

> "Not just on deals, but on all objects would be extremely powerful... It delivers the context that a rep with a user needs at any given time, and, also, I think it increases adoption of the platform because you're there."

- **Persona:** Sales Rep, Sales Manager, RevOps
- **Severity:** High
- **Frequency:** Multiple mentions
- **Context:** Brandon from another HubSpot partner has brought this up multiple times. Direct comparison to HubSpot's Breeze AI sidebar.

### Problem 4: Workflow Builder Has Too Many Confusing Legacy Nodes

> "I think that we should deprecate a lot of these notes to make it a lot more clear of what we can do to simplify... people struggle with Zapier for the exact reason. Where it's like Zaps end up erring out because they don't know the right action to take. There's too many options."

> "The only one I actually trust is the HubSpot agent."

- **Persona:** RevOps, Implementation Partners
- **Severity:** Medium
- **Frequency:** Common
- **Context:** Crispy built complex workflows using "search field" and "update field" nodes when the agent is better. Legacy options create confusion and failure.

### Problem 5: No Visibility Into What Workflows Are Actually Doing

> "I want to be able to aggregate my workflows or agents into folders because I'm treated as a library... Having to scroll and find all my things that I'm doing is, like, not great for me."

> "Having, like, a resync button would be awesome... It takes twenty minutes for the API to rest"

- **Persona:** RevOps
- **Severity:** Medium
- **Frequency:** Common
- **Context:** With 700+ workflows, organization and monitoring becomes critical. Can't easily see what's connected, what's running, what failed.

### Problem 6: Meeting Prep Takes Too Long / Reps Don't Do It

> "Gathering context before a meeting is I would argue to say that's rare for most sales reps. They're sell they're do the hustle. They're gonna go off muscle memory."

> "I almost never have... my worst meeting prep at AskElephant is better than most of my best meeting prep before AskElephant."

- **Persona:** Sales Rep, AE
- **Severity:** Medium
- **Frequency:** Common
- **Context:** Reps don't have time to prep. Contextual delivery at the point of work (HubSpot sidebar) solves this.

### Problem 7: CRM Reporting Doesn't Answer "So What?"

> "It's it's actually an appointment of, like, so what? I like, I can see the total payment volume by month. So what what am I supposed to do? What's the action I'm supposed to take?"

> "HubSpot reporting only goes so far to give you the ability to drill down into the things that you need to understand."

- **Persona:** Sales Leader, CRO, RevOps
- **Severity:** High
- **Frequency:** Common
- **Context:** Dashboards show data but don't guide action. Leaders dig for context constantly. This is the "AI sales manager" opportunity.

---

## Feature Requests

### Request 1: HubSpot Sidebar Integration (Global Chat as Card)

> "If you had it embedded on the sidebar... Having AskElephant as a sub bar here would be incredible."

- **Persona:** Sales Rep, Sales Leader, RevOps
- **Priority:** High
- **Technical Note:** Can be done as HubSpot React card or iframe. Similar to Breeze AI sidebar.

### Request 2: Workflow Folders / Organization

> "Having to scroll and find all my things... I'll need to hop into a folder and see all my things are running right now."

- **Persona:** RevOps
- **Priority:** Medium

### Request 3: Auto-Generated Workflow Summary/Description

> "HubSpot does a really good job of this... it actually auto titles and auto leads you description every time you build one. And I found it to be extremely accurate."

> "If you just don't like all deals that don't have a close date in this time frame, really easy for you to understand, like, bite sized sentence."

- **Persona:** RevOps
- **Priority:** Medium

### Request 4: Hidden Auto-Fill Fields for CRM Enrichment

> "RevOps one zero one for the old way of doing things was the fewest fields possible... And now I'm trying to get to any context I want to service later... I'm pushing the hidden fields, like, as often as I can. And I am convinced that is the best practice of the future."

- **Persona:** RevOps, Sales Leader
- **Priority:** High
- **Context:** Store structured data from conversations without cluttering rep view. Sam validated this approach.

### Request 5: Property Creation from AskElephant

> "If we could, in a workflow, say, it looks like they have these six fields that are being used... You also should go create these five others in order for this workflow to work. Do you want me to go create those?"

- **Persona:** RevOps
- **Priority:** Medium
- **Context:** Tyler mentioned this was previously blocked but now sees the value. Needs guardrails (check if exists first, validate naming conventions).

### Request 6: Best Practice Workflow Recommendations

> "The AI tool should recommend the next process rule based upon current data that we see... Hey. We see these workflows running. You're kinda missing this one over here that we recommend."

- **Persona:** RevOps, Sales Leader
- **Priority:** Medium-High

---

## Strategic Alignment

### ✅ Strong Alignment

- **Human-Centered AI:** Crispy explicitly framed value as "AI is not replacement for people, it's replacement for situations" - perfectly aligned with Woody's vision
- **Outcome Orientation:** "I can be a true power dialer... because I don't have to call, send all my notes, do my recap" - clear outcome chain
- **Trust Foundation:** "The client doesn't trust HubSpot data, so why add another system?" - validates trust-first approach
- **Data Knowledge Pillar:** Hidden auto-fill fields = enriching structured insights without rep burden

### ⚠️ Concerns / Questions

- **CRM Replacement:** Palmer asked about replacing HubSpot entirely. Crispy strongly cautioned against this - HubSpot is full suite (marketing, sales, service, ops). Would be "enormous project."
- **Self-Service Gap:** Crispy can only successfully implement at end of HubSpot engagement. How do we serve customers without a HubSpot partner?
- **Workflow Complexity:** Current builder creates friction even for expert users. Needs simplification.

---

## Key Quotes for Reference

### On Value Proposition

> "Something as simple as I can be hands off keyboard and conduct the sale and the actions I'm supposed to take as a rep still happen. That's very powerful for sales teams because what you're removing from that is the friction that a sales rep has being processed."

### On Why AskElephant Beats Fathom

> "Fathom is, like, fucking... the product just sucks... Number one is, like, value is terrible... Number two is I show them very simply. I'm like, hey. Watch this. I'm gonna go and say these specific things... Slack gets pinged immediately."

### On Sales Rep Behavior

> "Sales reps from process are, like, imposing forces. Yeah. And sales reps just wanna do whatever they're rogue cowboys want to do... Make money."

> "Most sales reps probably don't look at dashboards at all in HubSpot, and they just look at deals."

### On AI Sales Manager Vision

> "What we want to help the sales managers, CROs, directors, whoever owns revenue for the business is answer the questions that they have in their brain at a given time... Most sales managers, most CROs have to dig for data, have to dig for context all the time. It sucks."

### On Trust/Data Quality

> "AskElephant is really only successful if you have the right bill or, like, data, right chart, and stuff like that... Unless you're using HubSpot and you trust the data and your sales team believes in using deals, contacts, and companies, something as simple as that."

### On Future Best Practice (Hidden Fields)

> "RevOps one zero one for the old way of doing things was the fewest fields possible to accomplish what you're looking forward for decision making... And now I'm trying to get to any context I want to surface later... I'm pushing the hidden fields, like, as often as I can. And I am convinced that is the best practice of the future."

---

## Personas Validated/Mentioned

| Persona | Key Insight |
|---------|-------------|
| **Sales Rep (AE)** | Won't leave HubSpot. Wants hands-off automation. Only cares about hitting quota. |
| **SDR** | Power dialers. Even less likely to leave CRM. |
| **Sales Manager/CRO** | Constantly digging for context. Gets pinged at 11pm asking "what happened on this deal?" |
| **RevOps** | Expert user but still struggles with workflow complexity. Needs organization tools. |
| **HubSpot Admin** | Often a secondary job function for marketing or sales leader. Not dedicated. |
| **Implementation Partner** | Critical intermediary. Can make or break AskElephant success. |

---

## Hypothesis Candidates

Based on this transcript, consider these hypotheses:

### 1. HubSpot Sidebar Integration
**Problem:** Sales reps won't leave HubSpot to use AskElephant, limiting adoption and value delivery.
**Hypothesis:** If we embed Global Chat as a HubSpot sidebar card, reps will access AskElephant context without leaving their workflow, increasing daily active usage by 3x+.
- **Matches existing:** Partially - relates to `hyp-hubspot-agent-config-ui`
- **Action:** Consider new hypothesis or expand existing

### 2. CRM Configuration Prerequisite
**Problem:** AskElephant success depends on HubSpot being configured correctly, which most customers haven't done.
**Hypothesis:** If we can diagnose HubSpot configuration gaps and either fix them or guide customers to fix them, we'll reduce implementation time and increase activation rates.
- **Matches existing:** Partially - relates to `hyp-hubspot-agent-config-ui`
- **Action:** Consider new hypothesis for "CRM readiness" diagnostic

### 3. Workflow Builder Simplification
**Problem:** Too many legacy nodes in workflow builder create confusion and failures.
**Hypothesis:** If we hide/deprecate legacy nodes and surface only HubSpot agent + key actions, customer success rates with workflows will increase significantly.
- **Matches existing:** Yes - `hyp-hubspot-agent-config-ui`
- **Action:** Add this as evidence

### 4. AI Sales Manager / Deal Intelligence
**Problem:** Sales leaders dig for context constantly and can't answer "what should I do about this deal?"
**Hypothesis:** If we surface actionable deal insights (not just data) with recommendations, we become the "AI sales manager" that answers questions before they're asked.
- **Matches existing:** Partially - `hyp-customer-journey-map`, `hyp-universal-signal-tables`
- **Action:** May warrant new hypothesis for "proactive deal intelligence"

### 5. Hidden Auto-Fill Fields Strategy
**Problem:** Traditional RevOps limits fields to what reps will fill. AI can enrich unlimited structured data.
**Hypothesis:** If we auto-populate hidden CRM fields from conversations, customers get rich data for reporting/AI without burdening reps.
- **Matches existing:** Partially - relates to CRM agent work
- **Action:** Consider new hypothesis or capture as strategic insight

---

## Competitive Intelligence

| Competitor | Crispy's Assessment |
|------------|---------------------|
| **Fathom** | "The product just sucks" - no real CRM integration, trying to add but not there yet |
| **HubSpot Breeze AI** | Reference point for sidebar integration - "Breeze record summary" is the model |
| **EBSTA** | Forecasting tool that failed because "bad data, bad data" - acquired/failed in HubSpot marketplace |
| **SuperB** | Crispy's previous company - had "package builder" and "process rules" but hit constraint of "customers don't know their process" |

---

## Follow-Up Questions

1. **For Crispy:** What's the minimum HubSpot configuration that makes AskElephant successful? Can we define a "readiness checklist"?
2. **For Product:** What's the technical lift for HubSpot sidebar card? Is this on roadmap?
3. **For Sam:** How do we balance opinionated workflows vs. flexibility given Crispy's feedback?
4. **For Partnership:** How do we scale the "Crispy model" - HubSpot partner who implements AskElephant as capstone?

---

---

## Related Documents

### [Zipcio: AI as a Service Methodology](../documents/Zipcio_%20AI%20as%20a%20Service.md)

Crispy's company (Zipcio) shared their service structure, which **validates key insights from this call**:

| Phase | Focus | AskElephant Role |
|-------|-------|------------------|
| **Phase 1** | ICP Definition + Clay tables | Not used |
| **Phase 2** | Conversion sequences + messaging | Not used |
| **Phase 3** | Revenue Intelligence | **AskElephant introduced here** |

**Key Validation Points:**

1. **AskElephant is Phase 3 (last)** - confirms Crispy's statement that they only introduce AskElephant at end of engagement when CRM is clean
2. **Prerequisite work:** 26+ hours of CRM dev before AskElephant can be successful
3. **Pricing:** $5,000 for AskElephant agent setup + scoring rubrics
4. **Success metrics:** 80% of calls scoring 7+, <10 process violations per rep/week
5. **Systems stack:** HubSpot + AskElephant + Supered (process rules)

**Deliverables they create with AskElephant:**
- AI Enriched Scoring Rubric (call scoring → HubSpot)
- Supered Process Board with Rules (violation tracking)
- "The Zipcio Sales Agent" - AskElephant agent for MOFU/BOFU

**Hourly allocation for Phase 3:**
- Strategy: 6 hours
- Scoring Rubric: 6 hours  
- Supered Process Board: 4 hours
- Optimization: 3 hours
- CRM Dev: 5 hours
- **Total: 24 hours** (before AskElephant touches anything)

---

## Tags

`#hubspot-integration` `#workflow-builder` `#sales-rep-persona` `#partner-feedback` `#crm-agent` `#global-chat` `#partner-methodology`
