# PostHog Best Practices - Sachin Ranchod (TAM) Session

**Date:** January 23, 2026  
**Participants:** Sachin Ranchod (PostHog TAM), Tyler Sahagun, Sam Ho (VP Product)  
**Type:** Technical Account Manager Consultation

---

## TL;DR

Sachin helped clarify the distinction between cohorts (people-based filtering) vs groups (event-level company aggregation), recommended a question-first approach to analytics, and emphasized building dashboards around key business questions rather than auditing existing insights. Key takeaway: define activation levels and time-to-value metrics before diving into implementation.

---

## Key Insights

### 1. Cohorts vs Groups - The Critical Distinction

> "Think of cohorts as groups of users. Specifically, people. They are groups of people that don't have to belong to the same company."

**Cohorts:**

- Groups of **people** used for **filtering**
- Two types:
  1. **Behavioral** - "Users who have done X" or "Users who haven't done X"
  2. **Property-based** - "Users with attribute Y"
- Examples:
  - Users who completed onboarding
  - Users who stopped using meeting recorder
  - Users signed up in Utah (property-based)

> "With groups, it lets you actually say, I wanna understand what this unique group did. So I wanna understand, you know, activation by company."

**Groups:**

- Tied to **events** for **aggregation**
- Every event associated with a company/workspace
- Enables questions like "How many unique companies activated this week?"
- Think: unique organizations, not individuals

**Decision Framework:**

- Use **cohorts** when filtering analysis by user behavior/attributes
- Use **groups** when aggregating by company/workspace

### 2. Question-First Approach

> "Start with the questions, see if you can find matching insights that might exist for those questions... and then saying, okay. These are the main things that we care about."

**Process Sachin Recommends:**

1. Start with business questions
2. Check if matching insights exist
3. Verify data looks correct
4. If no insight exists, identify what events are needed
5. Check if those events exist in PostHog
6. Build the insight/dashboard

> "It might be a little bit of a futile exercise to go through and try and understand all of the insights. I would maybe kinda go the other way around."

**Key Takeaway:** Don't audit 700 insights. Start from questions and work backward.

### 3. Activation & Time-to-Value Levels

Sam articulated multiple levels of value:

> "Basic value, you're getting meeting notes transcribed... The next level... you probably need to connect to your CRM and are we doing the proper updates."

**Value Ladder (from conversation):**

| Level            | Description                                    | Key Events                                 |
| ---------------- | ---------------------------------------------- | ------------------------------------------ |
| **Basic**        | Meeting notes, follow-up emails, briefings     | `meeting:processed`, `email:sent`          |
| **Intermediate** | CRM connected, updates syncing properly        | `hubspot_agent:enabled`, CRM sync events   |
| **Deep**         | Workflows running, automation delivering value | `workflows:run_completed`, successful runs |

> "Pricing by seat becomes a challenge when things are happening automatically in the agentic world."

**Implication:** Need to track automated value delivery, not just user actions.

### 4. Workflow Value Attribution

> "There's I don't know if you would consider... do you consider activation to be someone actually just, like, doing the basics like you said? Like, they get meeting notes and see a summary... versus they're inviting other people in, they're asking questions."

**The Workflow Paradox:**

- Successful workflow runs = value delivered
- But user NOT interacting could mean:
  - Trust (good) - automation working as expected
  - Ignored (bad) - output not useful

> "Does that count as, like, cool something? Like, they got value from it. I think that probably does."

**Recommendation:** Track successful runs as value delivery events.

### 5. Event Schema Management

Sachin demonstrated PostHog's Data Management → Event Definitions:

> "You can essentially add, like, property groups, like, what are the properties that it should have... you can download the schema through the CLI."

**Workflow:**

1. Define event schemas in PostHog UI
2. Add property groups (reusable sets of expected properties)
3. Download via CLI as TypeScript/Go/Python types
4. Enforce in codebase

> "You can add, like, a AGENTS.md file in there and just say, like, make sure that any sort of user actions are instrumented."

**CI Integration:** Add `posthog.json` schema to repo + AGENTS.md guidance for AI code review.

### 6. Persona-Based Analysis

Sam's framing on user segmentation:

> "We have different types of user personas, whether that's like individual sales user, a sales manager, a RevOps person that's building workflows versus a customer success manager."

**Key Question:** How are these different groups using the product?

**Implication:** Need role/persona context on events to filter/segment analysis.

### 7. PostHog AI for Exploration

> "My suggestion there would be just use the AI. Use PostHog AI. You can even ask it which insights you should look at."

**Caveat:**

> "It needs a little bit of help understanding your internal terms and how it might map them."

**Tip:** Teach PostHog AI your terminology - it will remember for future sessions.

---

## Specific Recommendations from Sachin

### Dashboards to Build

> "The most value from PostHog is gonna come from zooming out a little bit saying, okay. These are the main things that we care about and plotting out some of those dashboards."

**Recommended Dashboard Types:**

1. **Activation Dashboard** - Light activation → deep activation funnel
2. **Retention Dashboard** - By feature area and cohort
3. **Feature Funnels** - Per-feature journey (discover → configure → use → success)

### Analysis Workflow

> "I'm looking at this funnel. I'm seeing a drop off here... I wanna go watch some session replays. I wanna ask the AI to summarize what's going on with the users that are dropping off."

**Full Loop:**

1. Funnel analysis shows dropoff
2. Watch session replays of dropoff users
3. Ask AI to summarize patterns
4. Form hypothesis
5. Create feature flag + experiment
6. Measure improvement

### External Data Integration

> "You need to bring that into PostHog... you'd need to sync that back to the person somehow on PostHog."

**For HubSpot partner field example:**

- Cannot create cohorts from external data directly
- Must sync external attributes to PostHog person profiles
- Then use property-based cohorts

---

## Questions Raised (For Future Exploration)

1. **Time to Value Definition:** "At what point are users no longer trialing?"
2. **Automated Value Measurement:** How to measure value when user doesn't interact?
3. **Persona Attribution:** How to track role/persona consistently across events?
4. **LLM Evaluation Integration:** How to use PostHog's eval tools for agent workflows?

---

## Action Items from Call

- [ ] Set up cohorts based on behavioral patterns (power users, at-risk, etc.)
- [ ] Add workspace context to chat events (identified gap)
- [ ] Define activation levels/time-to-value metrics
- [ ] Build persona-segmented dashboards
- [ ] Explore PostHog AI for existing insight discovery
- [ ] Set up event schema management for new features

---

## Key Quotes for Reference

**On starting point:**

> "Start with the questions, see if you can find matching insights that might exist for those questions."

**On cohorts vs groups:**

> "With cohorts, think about it as, like, filtering, whereas with groups that's around, like, the unique organization company."

**On activation:**

> "Do you consider activation to be someone actually just, like, doing the basics... versus they're setting up a workflow?"

**On workflow value:**

> "Successful runs of workflows probably seems like something to have a sense of, like, who's being impacted by that."

**On schema management:**

> "You can add a AGENTS.md file in there and just say, like, make sure that any sort of user actions are instrumented."

---

_Extracted from PostHog TAM consultation - January 23, 2026_
