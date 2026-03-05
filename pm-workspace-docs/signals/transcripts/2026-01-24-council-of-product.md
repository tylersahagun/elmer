# Council of Product Meeting - January 24, 2026

**Signal ID:** `sig-2026-01-24-council-of-product`
**Type:** transcript
**Source:** internal-product-meeting
**Captured:** 2026-01-24
**Status:** processed

---

## TL;DR

Weekly product council meeting covering hackathon momentum, Composio integration status (not ready for customer sales), rep workspace development as priority viral feature, global chat beta launch targeting Feb 1, and alignment discussion on ensuring product work drives revenue outcomes.

---

## Participants

- Woody (CEO)
- Rob (Product)
- Sam Ho (Product/Strategy)
- Skylar (PMM)
- Tyler (PM)
- Additional mentions: Brian, Adam, Jason, Kaden, Gabe, Eduardo, Knox (Hawk), Palmer, Ben Harrison, Matt Bennett, Oliver, Erica, Chris (customer), Crispy

---

## Key Decisions

| Decision | Context | Owner |
|----------|---------|-------|
| Composio is NOT live to customers yet | Revenue team confused, saw tools in Composio list | Rob to clarify with revenue |
| Global chat open beta target: Feb 1 | "New month, new loss, new skills" launch timing | Rob, Skylar |
| Job title field needed for analytics | PostHog meeting today, want to segment usage by role | Sam Ho |
| Site performance revert needed | Knox's DB query optimization removed participant data | Knox |
| Rep workspace is #1 priority | Rob focused here with Brian for viral potential | Rob, Brian |

---

## Action Items

| Who | What | When | Status |
|-----|------|------|--------|
| Rob | Clarify Composio status to revenue team | Today | pending |
| Rob | Talk to Sam about settings redesign | Today | pending |
| Rob | Get feature flag/release stage clarity (Adam, Jason, Ben) | EOD | pending |
| Skylar | Prepare global chat training materials | Before Feb 1 | pending |
| Skylar | Get loom walkthrough from engineering | Monday | pending |
| Team | Create Slack agent for integration capability questions | Soon | pending |
| Team | Backfill job titles (Clay/LinkedIn enrichment?) | TBD | pending |
| Knox | Revert site visual regression | EOD | pending |
| Knox | Provide performance improvement estimate | EOD | pending |
| Tyler/Rob | Talk to revenue leaders about product priorities for top of funnel | Next week | pending |
| Contractor (Peanut dev) | Get Peanut SDK working with AskElephant desktop | First project | in_progress |

---

## Problems Extracted

### Critical

1. **Revenue team confused about Composio availability**
   > "There's a general confusion on the revenue team of, do if Composer works with workflows... there's an assumption that they do and that they're available for everybody."
   
   - Ben Harrison already reaching out to prospects about ClickUp/Go High Level
   - Composio has 877 toolkits listed but many only have 6 tools
   - Need guardrails before sales uses this

2. **Release lifecycle/feature flags not ready**
   > "The true clarity and delineations that we talked about last time that is the expectation for this isn't there yet."
   
   - Early access features UI reverted site to 3 months ago look
   - PostHog limitations discovered
   - No clear criteria for moving features through stages

3. **No definition of "time to value"**
   > "Do we have a definition, or is it just the field?"
   
   - Probably needs to be persona-based
   - Not one onboarding journey

### High

4. **AI enablement squad feeling sidelined**
   > "Hey. I like, I have this initiative, but then EPD took it over... I kinda wanted to carry that."
   
   - Matt Bennett on agents
   - Ty on onboarding
   - Need to reset expectations - they amplify revenue processes, not own features

5. **Site performance work caused visual regression**
   > "Rather than showing the single tag, it now says, what the heck?"
   
   - Removed queries for participants, tags, companies
   - Being reverted

6. **User groups status unclear**
   > "He said that it's finished, and I don't know what that actually means."

---

## Feature Requests / Ideas

### Rep Workspace (Priority #1)
- Pipeline view mirroring HubSpot
- Deal data + Composio actions
- Proactive insights for deal progression
- Not just explicit action items - AI-suggested next steps

> "What I'm trying to prove here is the next milestone is that, one, we can take the data and now have it in ours. And then based off that data and the full context of the entity, we can actually drive real actual insights of things that they should be doing."

### HubSpot Integrations
- **HubSpot audit tool** - Chris (partner) says biggest problem is CRM config, not AskElephant
- **HubSpot widget/sidebar** - Internal search in HubSpot (via Breeze or custom widget)

> "A lot of us actually just want a widget inside of HubSpot that can use internal search to ask questions."

### Desktop / Mobile
- Peanut SDK integration for dictation in desktop app
- Global chat on mobile (quick UX cleanup)
- Contractor (3 hrs/day) starting on Peanut integration

### Internal Tools
- Slack agent to answer "what integrations do we support?" questions
- Pull Composio API data into knowledge base

---

## Strategic Insights

### Revenue Funnel Focus Needed
> "The last week, we've done these hackathon projects. There's a lot of cool excitement. We need to probably early next week, again, level set it back with revenue and make sure that what we're trying to drive is gonna have some early indicators this quarter for revenue growth."

**Funnel priorities identified:**
1. Top of funnel (primary)
2. Time to value
3. Close rate

### Success Metrics Discussion
Sam Ho:
> "Every feature, you should have some success metric. It doesn't have to be revenue... looking at that usage and what a good usage goal would be to infer that it's worth it. So look at the usage of those features and the adoption and seven day weekly actives."

### Hackathon Momentum
Team experiencing rapid iteration cycles with AI tools:
> "Every single day, sometimes twice a day, I'm like, holy shit. That completely changes how I need to think about things."
> "We're constantly reunderwriting. It feels like three or four times a day right now."

---

## Project Updates

| Initiative | Status | Notes |
|------------|--------|-------|
| **Rep Workspace** | Active | Brian dedicating 4+ hours, proving deal context + Composio actions |
| **Settings Redesign** | Blocked | Rob needs to loop in Sam, Erica had good feedback |
| **Privacy Agent** | Shipped | Adam + Sam collaboration, great example of iteration |
| **Global Chat** | Beta ready | 2-3 days of polish, then Feb 1 launch |
| **Speaker ID/Voiceprint** | Research | Exploring Hugging Face, talking to vendors, hard to estimate |
| **Product Usability** | Active | Knox on site speed, user groups unclear |
| **Dialpad Integration** | Done | Eduardo finished after long struggle |
| **User Onboarding** | Active | Need job title field for PostHog analytics |

---

## Verbatim Quotes

### On Hackathon Energy
> "Most fun twenty four hours in twelve weeks."

### On Platform Capabilities
> "I am so freaking impressed by how much work I'm actually getting done through AskElephant now. I now want four chat windows."

### On Rep Workspace Vision
> "I think they're starting to get to the just normal tasks that can do. It doesn't have to be tied to the deal, but it can be tied to just this meeting and having stuff that is, like, it's like, just my whole day. Like, I can have AskElephant working for me."

### On Revenue Alignment
> "This thing would drive x to our dollars, but none of them really have a system to answer that explicitly."

---

## Personas Mentioned

- **Sales Reps** - Rep workspace, HubSpot widget
- **AEs** - Tool awareness, chat with tools
- **RevOps** - Integration questions, funnel analysis
- **Implementation Partners** - HubSpot audit tool (Chris/Crispy)
- **CSMs** - Onboarding, privacy agent
- **Sales Leaders** - Usage analytics by role

---

## Initiative Matches

| Initiative | Relevance |
|------------|-----------|
| `rep-workspace` | Primary focus, Brian building deal context + Composio |
| `composio-agent-framework` | Status update, not customer-ready |
| `settings-redesign` | Needs Sam involvement, Erica feedback |
| `speaker-id-voiceprint` | Research phase, talking to vendors |
| `product-usability` | Knox on site speed |
| `user-onboarding` | Job title field for analytics |
| `release-lifecycle-process` | Blocked, PostHog limitations |
| `hubspot-agent-config-ui` | HubSpot widget/sidebar exploration |
| `crm-readiness-diagnostic` | HubSpot audit tool for partners |

---

## Hypothesis Candidates

1. **Rep workspace as viral anchor** - "A really cool viral thing that could go really hard" - gives clear demo story and entry point
2. **Proactive deal intelligence over explicit action items** - "Taking the full context, suggesting and covering hashtags that you may not that weren't spoken"
3. **HubSpot sidebar reduces context switching** - Partners want AskElephant accessible without leaving HubSpot
4. **Job function segmentation reveals usage patterns** - Which personas actually engage with which features?

---

## Open Questions

1. What is the explicit single definition of "time to value" per persona?
2. What specific top-of-funnel gaps can product solve?
3. How do we recognize AI enablement squad contributions without them "owning" features?
4. What are clear graduation criteria for release stages?

---

## Raw Transcript

[Transcript attached - ~40 minutes, internal product meeting]

---

*Processed: 2026-01-24*
*Strategic alignment: HIGH - direct discussion of revenue outcomes, feature prioritization, and 2026 initiative progress*
