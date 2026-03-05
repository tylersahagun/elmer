# Research Summary: Customer Journey Map

**Date:** 2026-01-14  
**Participants:** Skylar Sanford (Product), Jasmin Beckwith (CS), Parker Alexander (CS), Benjamin Kinard (Sales Leader), Josh (Sales), Pete Belliston (Sales), Robert Henderson (CEO)  
**Sources:** 7 transcript files + Revenue qualification criteria document

---

## TL;DR

This initiative addresses a fundamental visibility gap: reps and leaders can't see where customers are in their journey or what actions will make the most impact—forcing reliance on mental tracking, manual CRM audits, and disconnected tools. The vision is strategically aligned with AskElephant's core identity as a "revenue outcome system" rather than a note-taker. However, the scope is exceptionally large ("first version of an outcomes platform"), spanning multiple personas and touching every workflow. Clear phasing and success metrics will be critical to avoid scope creep while delivering genuine outcome-chain value.

---

## Strategic Alignment

**Score:** Strong / Needs Scope Definition

### Aligned:

- ✅ **Strong outcome chain**: Know where customers are → Know what to do → Make impact → Progress customers → Drive revenue outcomes
- ✅ **Human-centered AI explicitly discussed**: "What are those human elements that AskElephant shouldn't be offloading?"
- ✅ **Trust pillar reinforced**: Transparency with customers about journey, showing work, avoiding selfish funnel language
- ✅ **Clear persona coverage**: Sales reps, Sales leaders, CSMs, RevOps all interviewed with specific workflows documented
- ✅ **Evidence-backed need**: Multiple customer references (Gong comparison, sales leader interviews), internal user pain points well-documented
- ✅ **Differentiation potential**: "AI inside HubSpot is not going to be this granular"

### Concerns:

- ⚠️ **Scope is very large**: Called "first version of an outcomes platform" and a "huge product" - risk of trying to do everything at once
- ⚠️ **Terminology undefined**: Customer journey vs revenue experience vs workspace vs dashboard - needs canonical naming
- ⚠️ **Dependencies unclear**: "I have to know who my customers are, what my journey is, what those stages are" - are these prerequisites or part of the build?
- ⚠️ **Measurement gap**: How do we prove value? Jazz noted "we don't actually know how to track" outcomes - customers must self-report
- ⚠️ **Persona scope for v1 unclear**: Discussed "stacking builds before release" but MVP scope not defined

---

## Key Decisions Made

1. **Unified journey model**: Customer journey = one single journey from first contact to ongoing success (not separate pre-sales/post-sales)
2. **Journey is customer-led**: "The journey that me and the customer go on together needs to be led by them"
3. **Focus on outcomes over workflows**: Sell customers on outcomes, not specific automations
4. **First launch focus on reps**: "The first version is gonna give initial value mostly to the reps"
5. **Beta feature terminology**: Moving to "experimental" and "closed beta" (not alpha - ICP may not understand)
6. **Rep workspace concept adopted**: James's language of "rep workspace" embraced
7. **Anti-funnel positioning**: Intentionally moving away from "pipeline" and "funnel" language toward "journey"

---

## Action Items

- [ ] Define MVP scope for v1 launch - which personas, which capabilities - @Skylar
- [ ] Create outcome measurement framework (how we prove value when customers self-report) - @Skylar + CS
- [ ] Define canonical terminology (journey vs workspace vs dashboard) - @Skylar
- [ ] Share Jazz's outcomes-by-role matrix with product (the "incredible page") - @Jasmin
- [ ] Create design principles doc for AI-generated prototypes - @Skylar
- [ ] Log search bug (Stat IO not appearing in results) - @Skylar
- [ ] Send Jazz/Skylar customer journey conversation transcript - @Tyler (referenced in Understanding transcript)

---

## User Problems

### Problem 1: No visibility into customer position in journey

> "In HubSpot, I can see deals under my name... but there isn't any valuable information here outside of their names."

> "At a glance, it's really hard to tell what actions can actually be taken where they're at outside of just this stage."

- **Severity:** High
- **Frequency:** Every day, every rep
- **Personas:** Sales Reps, CSMs, Sales Leaders

### Problem 2: Manual tracking and mental load

> "Because you're good at your job, you're able to hold on to all that context and be able to make judgment calls of what's important... that's where you're able to scale your capacity is because you can now offload the mental tracking and rely on the system to track it."

> "Using AskElephant, it should increase my capacity to have more clients... from 30 to sixty, ninety clients, in which case, I'm not gonna be able to memorize all of that."

- **Severity:** High
- **Frequency:** Constant
- **Personas:** CSMs (enterprise), Sales Reps

### Problem 3: Disconnected journey between sales and CS

> "I actually don't know where this deal was sourced from. Who sold the account, what that sales cycle was like, what was promised to them, what they're expecting from us."

> "I don't know how the SDR interacted with them. I don't know if there's important things that they're waiting on."

- **Severity:** High
- **Frequency:** Every handoff
- **Personas:** CSMs, Sales Reps

### Problem 4: Leaders lack clean visibility for forecasting/coaching

> "This is dog shit. Like, this is absolutely inefficient and horrible... Get a really clean visual through AskElephant of everyone's pipeline, health assessment, ICP scoring, touch points, meetings held, follow ups, next recommended next steps."

> "High level clarity, visibility, and a clean view... I'm gonna be able to very quickly report back or even just have faith that forecasting is perfect and clean and up to date."

- **Severity:** High
- **Frequency:** Weekly+ (forecasting cadence)
- **Personas:** Sales Leaders

### Problem 5: Creating collateral is the real time sink

> "The piece that takes me the most time, it's not just the following up, sending the email. The piece that I have to take time away is now I have to go create a document. I have to go create a one page."

> "If there's something that AskElephant can do that helps me create those documents, that is huge for me."

- **Severity:** Medium-High
- **Frequency:** Per deal
- **Personas:** Sales Reps, CSMs

### Problem 6: Task prioritization is unclear

> "What would be the primary thing that you wanna see about this company at a given point in time?"

> "I need to know... of the pipe I'm working, who has the highest probability, what steps have been taken, and these are the tasks that need to be done."

- **Severity:** High
- **Frequency:** Daily
- **Personas:** Sales Reps, CSMs

---

## Feature Ideas / Requirements

### Rep Workspace
- See book of business with customers ranked by priority
- Clear next actions per customer
- Tasks ranked by impact/urgency
- Outcome: "Cut through all the bullshit and just tell you what the freak you need to do"

### Customer Home/Dashboard
- Per-customer view with:
  - Event timeline (visual with dots)
  - Account mapping (champion, decision maker, signer, legal)
  - Associated docs/contracts
  - Contacts list
  - Persistent chat about that customer
- Outcome chain: ✅ Clear - enables informed action on each account

### Team/Leader View
- See all reps' pipelines in one place
- Health assessment, ICP scoring, touch points
- Deal activity timeline board (visual progression)
- Calendar overlay showing "good meetings vs bad meetings"
- Ability to suggest rescheduling low-value meetings
- Outcome chain: ✅ Clear - enables coaching, forecasting, deal intervention

### Outcome Tracking by Role (Jazz's Framework)
| Role | Primary Outcomes |
|------|-----------------|
| AEs | Deal velocity, win rate, close rate, time saved, ICP alignment, likely-to-close % |
| CSMs | Churn prevention, expansion, time saved, customer retention |
| Enablement | Operational scaling, process consistency, reporting accuracy |
| Solutions/Impl | Customer time-to-value, handoff quality, ramp efficiency |
| RevOps | Forecasting accuracy, pipeline health, revenue trends |

### Journey Definition Tool
- Help companies define their customer journey (consulting/enablement opportunity)
- Show journey to customers transparently (not selfish funnel)
- Outcome chain: ⚠️ Needs clarification - is this product or service?

### Auto-generated Collateral
- One-pagers, documents from call context
- Outcome chain: ✅ Clear - time savings for reps

---

## Insights

### Three-Tier System Framework (from CS)
1. **Tier 1 - Individual Contributor**: Automate manual/mental load tasks
2. **Tier 2 - Manager/Executive Reporting**: Sales alignment, methodology, ICP, expansion opportunities
3. **Tier 3 - Aggregation**: Trend lines over time + recommended next actions based on patterns

### Human Elements That Cannot Be Automated
1. **North Star alignment**: Realigning customers when they lose the plot
2. **In-the-moment discovery**: "What else can I unearth? What else?"
3. **Timing/EQ for expansion**: Knowing when NOT to ask for expansion
4. **Relationship building**: Being the tour guide through the journey

### Key Quote on Vision Alignment

> "Stop forcing your customers through a funnel... We should go criticize pipelines and funnels and focus on journey."

This positions the product as differentiated from traditional CRM thinking.

### Customer Reference Evidence

- Sales leader (Jason) called deal activity timeline board "top two of what he loved most about Gong"
- Multiple customers comparing AskElephant to Gong on this capability
- Dental Intel actively comparing us to Gong for this reason

### Revenue Qualification Context
The Revenue.md document outlines 6 criteria for qualified deals:
1. Pain Acuteness - "This problem is costing me too much to ignore"
2. Value Conviction - "I believe AskElephant will solve my problem"
3. Stakeholder Alignment - "Everyone who matters is on board"
4. Commercial Readiness - "We have budget and can move through procurement"
5. Implementation Readiness - "Quick time to value, resources allocated"
6. Adoption Readiness - "My team will actually use this"

**Implication for Customer Journey product**: The product should help AEs validate and progress these criteria, and help CSMs maintain them post-sale.

---

## Questions to Answer Before PRD

_Based on gaps detected:_

1. **What is the MVP scope?** Which personas and which capabilities ship in v1 vs future releases?
2. **What are the prerequisites?** Does the customer need to define their journey first, or can we infer it?
3. **How do we measure success?** If customers self-report outcomes, how do we validate product-market fit?
4. **What is the data model?** How do we represent "journey" and "stage" in a way that works for both sales and CS?
5. **What's the relationship to HubSpot/CRM?** Is this a replacement view, or does it pull from and push to CRM?
6. **What terminology do we use externally?** Customer journey map, rep workspace, revenue experience?
7. **What's the trust/privacy consideration?** If we surface customer data aggregated across journey, are there visibility concerns?

---

## Open Questions

1. How does this interact with the Global Chat initiative? (They seem complementary but could conflict on "where does the user start their day")
2. Should partners help customers define their journeys (service model) or should the product infer it (product model)?
3. What does "journey" look like for multi-threaded, multi-deal enterprise accounts?
4. How do we avoid becoming "just a dashboard" when the vision is AI-driven action?
5. What competitive positioning do we take vs Gong's deal activity timeline? Match or differentiate?

---

## Addendum: Prototype Feedback (Option B)

**Source:** Rob's feedback session + Product Channel strategy discussion

### New Requirements
1. **Narrative-first hierarchy**: Users want a short story-like summary before actions.
2. **Journey health visibility**: Show which journey requirements are met or broken.
3. **Context-based alerts**: Alerts must explain why they matter in this journey, not just that they occurred.
4. **Deal workspace mode**: A dedicated, full-page view is needed for deep work with AI + artifacts.
5. **Language shift**: Use customer-centered outcomes ("customer hasn't articulated value") vs rep blame.
6. **Progressive disclosure**: High-level view first, then drill down for context.

### Product Channel Implications
- Teams need a **product channel definition** (pains, personas, messaging, product fit).
- AI should draft channel content from call history, but **human review** is required for updates.
- Channel context should inform deal guidance and meeting prep.

### MVP Scope Signals
- v1 should prioritize **rep workflow** + **deal deep work**, not manager-level analytics.
- Success depends on **confidence + evidence** for any AI conclusion.

---

## ⚠️ Recommendation: Define Scope Before Full PRD

> "Before moving to full PRD, I'd recommend answering:
> 
> 1. What is the explicit v1 scope (which personas, which capabilities)?
> 2. What are the 3-5 must-have features vs nice-to-haves?
> 3. What is the success metric we can measure without customer self-reporting?
> 
> This aligns with our principle: 'We need to learn to...slow down first.'"

The research is rich and the need is validated. The risk is building too much at once without clear phasing. Consider a focused v1 that solves one persona's problem completely before expanding.

---

## Next Steps

1. **Scope workshop**: Define v1 boundaries with engineering capacity in mind
2. **Create PRD**: Once scope is defined, generate full project documentation
3. **Prototype**: Build visual prototype for rep workspace concept

**Ready to proceed?** Say `PM customer-journey-map` to create full project documentation once scope questions are answered.
