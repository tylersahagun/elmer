# Research: Universal Signal Tables

**Date:** 2026-01-07
**Participants:** Tyler (PM), Woody Klemetson (CEO), Adam Shumway (Design), Adia Toll (SDR/Clay Expert), Matt Bennett (Revenue Sponsor), Skyler (PM)

---

## TL;DR

Universal Signal Tables aims to give sales leaders a "flashlight in the dark" — AI-powered tables that let them explore engagement data, aggregate insights across calls, and answer questions they don't yet know how to ask. The conversation revealed strong strategic alignment with the "revenue outcome system" vision and human-centered AI principles, but also uncovered significant scope ambiguity and a gap between the wide vision (Clay-like enrichment platform) and a defined MVP.

---

## Strategic Alignment

**Score:** Moderate — Strong intent, needs scope clarity before PRD

### Aligned:

- ✅ **Strong outcome chain**: Revenue leaders get structured insights → better coaching decisions → improved quota capacity → revenue outcomes
- ✅ **Human-centered**: Explicitly framed as "giving leaders a flashlight, not a light at the end of the tunnel" — tool for exploration, not AI replacement
- ✅ **Clear primary personas**: Sales Leader (Roger) and RevOps (Otis) explicitly called out as primary users
- ✅ **Trust consideration**: Discussion of not wanting to be "scary" like Clay; emphasis on transparency in AI building
- ✅ **Data Knowledge pillar**: Directly supports V3 strategic pillar of structured insights and trend visibility
- ✅ **AI-first UX alignment**: Chat + builder paradigm matches "configure through conversation" principle

### Concerns:

- ⚠️ **Scope creep risk**: Conversation spans roll-up data, persistent data, web scraping, CRM integration, rep coaching, forecasting, dashboards — what's the boundary?
- ⚠️ **MVP undefined**: No explicit definition of minimum viable table that tests the core hypothesis
- ⚠️ **Clay comparison trap**: Repeated "we're not Clay" but UX discussion keeps referencing Clay patterns — what's our differentiation?
- ⚠️ **Pricing uncertainty**: Usage-based pricing mentioned with concerns about adoption friction — not resolved
- ⚠️ **Technical complexity**: Annotations vs Universal Signals distinction needs engineering clarity before scope can lock

---

## Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| **Leadership tool, not rep tool** | "Reps won't do this... This is a leadership tool" | Accepted |
| **Persistent but not dynamic** | Data saves with timestamp; not auto-refreshing. Users pay to re-run. | Accepted |
| **Roll-up data always fresh** | Aggregations from annotations calculated on-the-fly | Accepted |
| **Column → Signal graduation** | Users can promote a one-time column to ongoing signal extraction | Proposed |
| **Chat + Builder UI** | Similar to Cursor's approach: chat to build, builder for visibility/trust | Proposed |
| **Prototype by tomorrow afternoon** | Tyler pushing for speed; "This is a table, not a big design lift" | Action Item |

---

## Action Items

- [ ] **Adam** — Create low-fi prototype of table + chat builder by EOD tomorrow
- [ ] **Adia** — Record Loom videos of Clay workflows showing thought process and how she gets answers
- [ ] **Tyler** — Feed transcript to Cursor/prototype generator after this meeting
- [ ] **Engineering (Dylan)** — Review technical distinction between Annotations vs Universal Signals before sprint planning
- [ ] **Matt** — Validate use case with Ben Harrison/Ben Bernard as leadership tool testers

---

## User Problems Identified

### Problem 1: No aggregated insights from calls
**Severity:** High | **Frequency:** Common | **Persona:** Sales Leader

> "Right now, I cannot tell you which competitor has been brought up the most, if we win or lose, what they like about that competitor, why they like that competitor." — Woody

**Implications:** Leaders make decisions based on emotion and anecdote, not data. Product gets feature requests without evidence. The whole company ends up misaligned.

---

### Problem 2: Signal setup is burdensome
**Severity:** High | **Frequency:** Common | **Persona:** RevOps

> "School AI example: 25 annotations, 2+ hours to set up churn tracking" — Context from project overview

**Implications:** Current signals require too much configuration upfront. Users give up before getting value. Need AI-assisted setup or simpler patterns.

---

### Problem 3: Leaders don't know the question to ask
**Severity:** High | **Frequency:** Common | **Persona:** Sales Leader

> "Every sales leader pretends like they're confident, but they are tiny little kids inside crying for real." — Woody

> "I don't know what question to ask on how to help my team convert more deals... It's like wandering through the woods." — Woody

**Implications:** Tool must support exploration and iteration, not just pre-defined reports. The "choose your own adventure" framing is critical UX requirement.

---

### Problem 4: RevOps gatekeeping slows insight generation
**Severity:** Medium | **Frequency:** Common | **Persona:** Sales Leader

> "Hey, RevOps. Can we add this competitor to the field? And then in the next month or two, I can see how often it's brought up. And then I forget about it and never do anything." — Woody

**Implications:** Self-service data exploration is key. Leaders shouldn't need to wait for RevOps to add fields to CRM.

---

### Problem 5: Clay is too complex/scary for most users
**Severity:** Medium | **Frequency:** Common | **Persona:** Sales Leader

> "Clay scares people. I hear at least a couple times a week from SDR leaders... that they don't know how to use Clay or that Clay is too complicated for anyone to use." — Adia

> "Our version cannot scare people. That should be a banner." — Woody

**Implications:** Simplicity is a competitive advantage. AI-assisted building may be table stakes, not a luxury.

---

## Feature Ideas Captured

| Idea | Outcome Chain | Priority Signal |
|------|---------------|-----------------|
| Clay-like table with AI-powered columns | Leaders extract insights → coaching decisions → quota capacity | Core to MVP |
| Chat interface for building/filtering tables | Lower barrier to entry → more exploration → better decisions | Core to MVP |
| Conditional column execution (if A is true, run B) | Cost savings + focused analysis → more exploration | Core to MVP |
| Entity-level views (Companies, Deals, Reps) | Aggregated views → faster pattern recognition | Important |
| "Graduate" column to ongoing signal | One-time insight → continuous monitoring → proactive action | Important |
| Web scraping / CRM data enrichment | External context + call data → complete picture | ⚠️ Needs outcome chain |
| Export to dashboard/graph | Visual storytelling → executive communication | Nice to have for v1 |
| Rep performance aggregations | Coaching visibility → targeted development → better outcomes | Important |

---

## Insights & Patterns

### 1. The "Flashlight vs Lighthouse" Metaphor
Woody's framing is powerful: leaders don't want a pre-built answer (lighthouse), they want tools to explore (flashlight). They need to find their own path because:
- Every company believes they're unique
- The question changes daily/hourly
- Building the insight yourself creates ownership

**Design implication:** Exploration and iteration > pre-built dashboards

---

### 2. Data Type Taxonomy Matters for Architecture
The project overview distinguishes:
- **Roll-up Metrics**: Always fresh, calculated on-the-fly
- **Persistent Facts**: Saved once, no refresh expected
- **Semi-Persistent Fields**: Occasional updates based on new data
- **Ephemeral Columns**: One-time analysis, not persisted

**Design implication:** UX must signal freshness expectations to users

---

### 3. Trust Through Visibility
Woody and Skyler both referenced Cursor's planning agent as inspiration:

> "When I use the Cursor plan agent and it shows me a flowchart, then I review the plan... I have to understand it." — Woody

**Design implication:** Show AI's work. Builder panel provides trust. Pure chat may feel like magic users don't trust.

---

### 4. Cost Model Creates UX Pressure
Clay criticism: "Their UI encourages you to do things in the way that is going to cost you the most of your credits."

AskElephant approach: Conditional execution (if this is true, run this) saves tokens and focuses analysis.

**Design implication:** Guide users toward efficient patterns by default

---

## Competitive Context

### Clay
- **What they do:** AI-powered data enrichment tables for prospecting
- **Strengths:** Powerful, flexible, huge integration ecosystem
- **Weaknesses:** Complex, expensive, "scares people"
- **Our angle:** We own the engagement data; Clay doesn't. We can do things with call content they can't.

### HubSpot/Salesforce Reporting
- **What they do:** Traditional structured reporting on CRM data
- **Strengths:** Familiar, integrated
- **Weaknesses:** Only as good as the data entered; can't analyze unstructured content
- **Our angle:** We extract structure from conversations, not require manual entry

### Gong/Chorus
- **What they do:** Conversation intelligence with some aggregation
- **Strengths:** Market leader mindshare
- **Weaknesses:** [Need competitive research]
- **Our angle:** [Need to articulate]

---

## Questions to Answer Before PRD

> "Before moving to PRD, I'd recommend answering these critical questions. This aligns with our principle: 'It matters about the outcome that what they build delivers.'"

### On Scope

1. **What is the MVP table?** A table of engagements with 3-5 AI columns? Or do we need entity selection (companies/deals) from day one?
2. **Do we need external enrichment in v1?** Web scraping, CRM pulls, etc. — or can we prove value with just call data first?
3. **What's the relationship to current Signals?** Deprecation path? Co-existence? Migration?

### On UX

4. **Chat-first or builder-first?** Do we lead with chat that outputs to builder, or equal weight?
5. **How do we prevent "Clay scary" reaction?** What's our onboarding moment that shows value before complexity?
6. **How do we show AI's work?** What transparency affordances build trust?

### On Technical

7. **Annotations vs Universal Signals architecture** — Can Engineering scope this before we commit to UX?
8. **Token cost model** — What does a realistic usage session cost us? Can we price sustainably?
9. **Real-time vs batch processing** — Do columns execute immediately or queue?

### On Business

10. **Pricing model** — Credit-based? Included in tier? Usage-based? How does this affect adoption?
11. **Who are the design partners?** Matt's team? Which external customers?
12. **What's the competitive response to Gong if they build this?**

---

## Open Questions (From Discussion)

1. When a user adds a column like "What industry is this company in?" via web scrape, do they expect it to auto-update if the company pivots industries? Or is it understood as a point-in-time snapshot?

2. How do we handle the "I don't know the question" user journey in the UI?

3. What's the graduation path from ad-hoc column → persistent signal → automated workflow?

4. How do we test this with "Rob who doesn't use a computer" vs "Woody who is technical"?

5. What templates/presets should we offer to reduce blank-slate paralysis?

---

## Related Research

- `.pm-workspace/company-context/product-vision.md` — Core outcome chain and principles
- `.pm-workspace/company-context/strategic-guardrails.md` — Evaluation framework
- Clay documentation / competitive analysis (needed)
- School AI churn tracking case study (reference for signal complexity)

---

## Recommendation

### ⚠️ Discovery Needed Before Full PRD

This initiative has strong strategic alignment and clear user need, but scope is too wide for confident PRD writing. I recommend:

1. **Define MVP boundary** — What's the smallest table that proves the hypothesis?
2. **Technical spike** — Engineering reviews Annotations vs Universal Signals architecture
3. **Design partner identification** — Lock 2-3 internal/external testers
4. **Competitive research** — What does Gong's aggregation story look like?

Once these are answered, we can write a focused PRD. Proceeding now risks building Clay-lite instead of something uniquely AskElephant.

> *"If you are not helping orchestrate a human outcome, then you are not working on the right thing."* — Woody Klemetson

The outcome chain is clear: **Insights → Decisions → Actions → Revenue**. The path to get there needs sharpening.

---

*Last updated: 2026-01-07*
*Analyst: Tyler (via PM Copilot)*

