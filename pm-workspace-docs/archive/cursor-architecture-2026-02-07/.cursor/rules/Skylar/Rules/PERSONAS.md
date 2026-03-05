# Personas -- Design Decision Cards

Every design decision should serve a specific person. When you're unsure, ask: "Who is this for?"

---

## Sales Representative

**Goal:** Close deals faster with better preparation.

**Their day:** Back-to-back calls, context-switching constantly, updating CRM between meetings, trying to remember what was said last week.

**Biggest frustration:** "I forget what happened on the call by the time I open Salesforce. And then I spend 15 minutes logging what I remember, which is probably wrong."

**Trust concern:** Will the AI log something incorrect and make me look bad to my manager? Will it record something I said in confidence?

**What they abandon:** Anything that takes more than 2 clicks. Anything that made them look bad once. Anything their peer said was "not worth it."

**Designs for this persona should:**
- Have big, obvious primary actions -- they're scanning, not reading
- Show them what the AI did (not just that it did something)
- Let them verify and correct before anything goes to their manager or CRM
- Work in the 30 seconds between calls
- Feel fast, even if the data is still loading (skeletons, not spinners)
- Never surprise them with something their manager can see

---

## Sales Leader

**Goal:** Coach effectively and forecast accurately without being on every call.

**Their day:** Pipeline reviews, 1:1s, strategy meetings, looking at dashboards, trying to spot which deals need attention before it's too late.

**Biggest frustration:** "I only find out a deal is in trouble when it's too late. I wish I could coach proactively instead of reacting to lost deals."

**Trust concern:** Is the data accurate enough to base coaching conversations on? Will reps resent the tool if it feels like surveillance?

**Sub-types to remember:**
- **Executive leader:** Wants ROI proof, delegates evaluation, leaves if value isn't clear in a month
- **SDR leader:** Hands-on, consensus-driven, needs the team to adopt first
- **Small team leader:** Wants simplicity over features, no time for complex setup

**Designs for this persona should:**
- Lead with summaries and dashboards -- they scan for patterns, not details
- Make drill-down optional but fast (click a metric to see the calls behind it)
- Show confidence levels on AI-generated insights ("based on 12 calls" vs. "based on 1 call")
- Never feel like surveillance -- frame everything as coaching, not monitoring
- Surface the 3 things that need attention today, not a wall of data

---

## CSM (Customer Success Manager)

**Goal:** Retain and expand through proactive engagement.

**Their day:** Health check reviews, renewal prep, escalation management, handoffs from sales, trying to prevent churn before it's visible in the data.

**Biggest frustration:** "By the time I know a customer is unhappy, they've already decided to leave. I need earlier signals."

**Trust concern:** Can I trust the health score, or will I look foolish acting on bad AI analysis?

**Designs for this persona should:**
- Surface risk signals with evidence (verbatim quotes from calls, not just a red/yellow/green score)
- Support handoff workflows -- they inherit context from sales and need to get up to speed fast
- Show change over time (is sentiment trending up or down?)
- Make renewal timelines visible and actionable
- Assume they manage 30-80 accounts and need to triage quickly

---

## RevOps / Operations

**Goal:** Data quality and process compliance across the revenue team.

**Their day:** Configuring tools, auditing data hygiene, building reports, evaluating new integrations, training teams on process.

**Biggest frustration:** "Every tool promises easy setup. Then I spend 3 weeks configuring it and nobody uses it anyway."

**Trust concern:** Is the integration reliable? Will it create more data problems than it solves? Can I trust the automation to not break our CRM data?

**Critical role:** Often the gatekeeper in purchasing decisions. Does hands-on evaluation. Has a ~45 minute patience window to see value.

**Designs for this persona should:**
- Make setup feel "Apple easy" -- guided, progressive, obvious
- Show data quality metrics (completeness, accuracy, freshness)
- Provide admin controls that are powerful but not overwhelming
- Show what the AI is doing to their data (audit trails, change logs)
- Surface configuration issues proactively, don't hide them
- Respect their time -- every screen should have a clear purpose

---

## Strategic Consultant / SME

**Goal:** Scale expertise without becoming a bottleneck.

**Their day:** Advisory calls, preparing frameworks, reviewing deals for their specialized insight, trying to capture what's in their head so others can use it.

**Biggest frustration:** "I say the same thing on every call. If I could capture my frameworks and have them applied automatically, I'd get hours back."

**Trust concern:** Will the AI oversimplify my expertise? I'd rather have nothing than bad AI output that makes my knowledge look generic.

**Designs for this persona should:**
- Treat AI as a starting point, never a replacement -- they want to refine, not accept
- Show provenance (where did this insight come from? which calls?)
- Support iterative refinement of AI outputs
- Never use the word "automated" in a way that implies their judgment is unnecessary
- Prioritize quality and nuance over speed
- Give them control over what gets shared and what stays draft

---

## Cross-Persona Design Principles

These apply to every persona:

1. **Show the work.** Users need to see what the AI did and why before they trust it. Transparency builds trust; black boxes destroy it.

2. **Fail gracefully.** When something goes wrong, explain what happened and offer a clear recovery path. Never show a generic error.

3. **Progressive disclosure.** Show the essential first. Let users dig deeper if they want to. Don't front-load complexity.

4. **Consistency is trust.** A rough element in an otherwise polished UI undermines confidence in the entire product. Every pixel reflects the quality bar.

5. **Speed as a feature.** Perceived performance matters as much as actual performance. Use skeletons, optimistic updates, and progressive loading.
