# Transcript: Council of Product - Weekly Sync

**Date:** 2026-01-26
**Source:** Internal Product Meeting
**Duration:** 75 minutes
**Participants:** Woody (CEO), Brian (Co-founder), Sam Ho (Product), Tyler (PM), Rob, Tony, Kenzie

## TL;DR

Weekly product sync dominated by Sam Ho's onboarding questions that surfaced critical gaps in product understanding. Key themes: (1) Privacy determination agent is nearly done but lacks sign-off process, (2) Composio integration is exciting but risks making AskElephant "just a wrapper", (3) CRM/HubSpot onboarding takes 12+ hours and weeks of iteration due to dirty CRM data, (4) Global chat not launched to 99.9% of customers yet, and (5) no clear definition of "time to value" exists.

## Key Decisions

- **Privacy Determination Agent:** Needs sign-off process before launch. Currently in closed beta. Jason to create Loom walkthrough for Tyler + Ben to sign off.
- **CRM Experience:** Top priority. Palmer working on it. Admin onboarding is entry point.
- **Global Chat:** Target open beta still stands. Not customer-ready yet.
- **AI Enablement Team:** Rob will clarify scope with team - it's for AI learning, not building random product features.

## Action Items

- [ ] **Tyler + Sam + Ben**: Meet to document CRM onboarding flow in FigJam (time-to-value, latency, pain points) - Before Wednesday
- [ ] **Tyler**: Get Jason to create Loom video for privacy determination sign-off
- [ ] **Tyler + Ben**: Sign off on privacy determination agent (view Loom, approve/block)
- [ ] **Sam**: Research PostHog product data - chat usage, workflow engagement, feature adoption - Report Wednesday
- [ ] **Sam**: Get Pylon access to analyze support ticket patterns
- [ ] **Tyler**: Work with Sam on PostHog gaps - communicate to engineering what metrics are missing
- [ ] **Rob**: Clarify AI Enablement team scope - redirect from "build random features" to "learn to use tools"
- [ ] **Tyler**: Own getting privacy determination shipped - don't let it stall

## Problems Identified

### Problem 1: Privacy Experience Causes Top Support Volume

> "If a meeting is marked private and then it's not showing for people who can't have access to it, it's like, where is this meeting that I have? How why is my meeting marked private? Why isn't it? Who has seen this before? Who hasn't? So it was the most common question that we were getting through support."

- **Persona:** All users, especially Admins and Managers
- **Severity:** High
- **Frequency:** Most common support question
- **Examples:**
  - **Redo:** Aaron Evitt (CRO) auto-marks meetings private → onboarding rep can't access sales call
  - **School AI:** CEO Caleb had workflow run on private meeting → competitor conversation leaked to entire company via competitor channel → nearly lost customer
  - **Unnamed:** Sales leader's therapy session was marked public → employee tried to blackmail him

### Problem 2: "Just a Wrapper on Composio" Risk

> "Everyone is stoked about the other tool. They're not stoked about AskElephant. Because you could put Composio into anything and be like, love how you work with all of those integrations together."

- **Persona:** Internal/Strategic
- **Severity:** High
- **Frequency:** Strategic concern
- **Context:** Integration took ~1 hour to set up. Exciting but needs to be paired with underlying structured data (deal object, customer journey) to differentiate.

### Problem 3: CRM/HubSpot Onboarding Is Consultative and Slow

> "If we were to redo our own HubSpot instance and reconfigure AskElephant and do an admin onboarding, it would take twelve hours."

> "Getting it set up is easy enough to say, these are the teams who's using it, but to get what they're wanting to have automated in HubSpot up and running after that forty five minute call is about two weeks worth of iterative work."

- **Persona:** RevOps, Admins, Implementation Team
- **Severity:** Critical
- **Frequency:** Every customer
- **Root Causes:**
  - Zero engineering effort on onboarding (all human-led)
  - Every company customizes HubSpot differently
  - Customers don't know what they want (deal vs contact vs company objects)
  - Dirty HubSpot data is #1 bottleneck (not AskElephant)
  - High-latency feedback loop: set up → test → report to CS → adjust → repeat

### Problem 4: No Definition of "Time to Value"

> "We don't have a true definition of time to value right now."

> "I'm not trying to save time. I'm trying to create time. And I do think that should make us think differently."

- **Persona:** Product Team, Leadership
- **Severity:** Medium
- **Frequency:** Strategic gap
- **Woody's Reframe:** Goal is "40 hours of work in a day" - create time, not just save it. Challenge assumptions about what's possible.

### Problem 5: Chat Usage vs Automation Usage Unknown

> "What I don't have a good understanding is, what is the average number of chats per user? And is it mainly around meeting notes?"

> "The number of chats that people did manually was far, far less than the workflow automations that were running."

- **Persona:** Product Team
- **Severity:** Medium
- **Frequency:** Data gap
- **Implication:** If workflows are so good users don't follow up, is that success? Or are they not engaging?

### Problem 6: Global Chat vs Command-K Redundancy

> "If we approach a global search and global chat, it's now two methods for people to go in and ask a high level general question. What I wanna fight for is a single experience."

- **Persona:** All users
- **Severity:** Medium
- **Frequency:** UX concern
- **Sam's Proposal:** Notion-style universal search where query auto-detects if it's navigation vs question.

### Problem 7: AI Enablement Team Building Random Features

> "Instead, it's like, I'm building a landing page for AskElephant. It's like, oh, that's that's a no."

- **Persona:** Internal
- **Severity:** Medium
- **Frequency:** Process issue
- **Examples:** Eli built live transcription in Lovable (not integrated), someone building landing pages
- **Root Cause:** Misunderstood charter - team thought it was "build whatever" vs "learn to use AI tools"

### Problem 8: Privacy Determination Agent Stuck in Limbo

> "I knew there was something blocking, but it was hard to define."

- **Persona:** Engineering, Product
- **Severity:** Medium
- **Frequency:** This specific feature
- **Root Cause:** No sign-off step in release process. Jason thinks it's done. Tyler/leadership haven't verified.

## Feature Requests

### Notion-Style Universal Search

> "When I look at that command k, maybe it should be more like Notion. If I ask a question, it just opens up the chat window. But I just type it in the bar, and then I can navigate to things."

- **Persona:** All users
- **Benefit:** Faster navigation, lower system cost, better UX
- **Quote:** "People are just trying to navigate... showing those things that are the most common, like, that are basically recent cache. Like, it'll be a lot faster."

### Proactive Home Page (What to Do Next)

> "The proactive nature of what AskElephant is meant to be... telling me what I need and what I need to do next."

- **Persona:** Sales Rep, CSM
- **Benefit:** Start day in AskElephant, end day in AskElephant
- **Example:** "You have a meeting coming up. This is how to make sure that you're prepped for it."

### CRM Agent Wizard Setup

> "Okay. Well, based on this, it doesn't look like you're using contacts, so that's probably not the option you want. Based on this, you're using deal objects, and I could analyze that, figure out where the best places to go, and make the recommendations."

- **Persona:** RevOps, Admin
- **Benefit:** Reduce 12+ hour setup time, reduce consultative burden
- **Context:** Sam's idea - analyze HubSpot config, auto-recommend where to store data

### Artifacts (Portable Workflow Outputs)

> "Workflow, if it produces an artifact, you could still chat with the artifacts... but then it's portable to where some artifacts might be appropriate to show up in a report on another page."

- **Persona:** All users
- **Status:** Matt working on "Portable Artifacts" project
- **Benefit:** Decouple outputs from chat, enable reuse across views

## Strategic Alignment

- ✅ **CRM Experience priority** aligns with "Outcomes > Outputs" - making AskElephant the place to manage customer journey
- ✅ **Privacy first** aligns with "Trust Is Foundational" principle
- ✅ **Global Chat** aligns with "AI-First UX" principle
- ⚠️ **Composio as wrapper risk** - need to ensure structured data (deals, journey) is the differentiator
- ⚠️ **Time to value undefined** - need measurable North Star for onboarding success
- ⚠️ **AI Enablement chaos** - innovation good, but needs direction to avoid wasted effort

## Hypothesis Matches

| Signal                  | Matches Existing Hypothesis               |
| ----------------------- | ----------------------------------------- |
| CRM onboarding friction | `hyp-crm-readiness-diagnostic`            |
| HubSpot sidebar request | `hyp-hubspot-sidebar-integration`         |
| Rep workspace need      | `hyp-rep-workspace-viral-anchor`          |
| Agent config difficulty | `hyp-agent-skills-reduce-config`          |
| Chat usage questions    | `hyp-job-function-analytics-segmentation` |

## Hypothesis Candidates

### Candidate 1: CRM Wizard Reduces Onboarding Time

- **Problem:** Customers don't know how to configure HubSpot integration (deal vs contact vs company), requiring 12+ hours of consultative setup
- **Hypothesis:** An AI-powered wizard that analyzes HubSpot configuration and recommends setup will reduce onboarding time by 50%+
- **Evidence Count:** 1 (this transcript)
- **Personas:** RevOps, Admin
- **Confidence:** Medium

### Candidate 2: Universal Search > Separate Chat

- **Problem:** Two entry points (command-k search vs global chat) create confusion
- **Hypothesis:** Merging navigation and AI chat into single Notion-style interface will improve usability and reduce cognitive load
- **Evidence Count:** 1 (this transcript)
- **Personas:** All users
- **Confidence:** Medium

### Candidate 3: Feature Sign-Off Process Gap

- **Problem:** Features get stuck in ambiguous "almost done" state with no clear sign-off
- **Hypothesis:** Adding explicit sign-off step to release process will accelerate launches and reduce ambiguity
- **Evidence Count:** 1 (this transcript)
- **Personas:** Engineering, Product
- **Confidence:** High

## Key Quotes

### On Privacy Pain

> "Another massive problem that we almost lost School AI over was their manager, their CEO, Caleb, had a workflow that ran on his private meeting that updated the competitor channel that they were looking at a competitor... by that he was talking to an investor about a competitor buying them. And then the whole company found out about the conversation."

### On Composio Risk

> "Brian's like, everyone is stoked about the other tool. They're not stoked about AskElephant. Because you could put Composio into anything... It took us, if it took eight and an hour, it's not something [defensible]."

### On Time Creation vs Time Saving

> "I'm not trying to save time. I'm trying to create time. And I do think that should make us think differently... If you had if you could live a full week in a day, what would you do?"

### On Sam's Onboarding Questions

> "So your question is, like, who is this a problem for? Is it a problem for the user role, or is it a problem for the manager?"

> "I freaking love that we're feeling interrogated right now. This is so freaking cool. I want more of this, so keep it going."

### On CRM Dirty Data

> "The currently, the biggest bottleneck is not AskElephant. It's how dirty HubSpot is, and the users or their admins and the admin and the manager are not on the same page with what they want."

### On Global Chat Launch Status

> "For context, Sam, we haven't launched global chat yet. 99.9% of our customers don't know about it yet."

## Related Signals

- `sig-2026-01-24-council-of-product` - Previous week's meeting
- `sig-2026-01-21-crispy-product-feedback` - HubSpot partner feedback
- `sig-2026-01-21-maple-billing-feedback` - Rep workspace feedback
- `sig-2026-01-16-crm-exp-ete-planning` - CRM experience planning

## Related Initiatives

- `crm-exp-ete` - CRM Experience End-to-End (Palmer)
- `product-usability` - Product Usability (Matt/Knox)
- `privacy-determination-agent` - Privacy Determination (Jason)
- `user-onboarding` - Admin Onboarding
- `rep-workspace` - Rep Workspace
- `composio-agent-framework` - Composio Integration
- `global-chat` - Global Chat Launch

## Next Steps

1. **Wednesday Council of Product:** Sam presents PostHog findings + remaining questions
2. **This Week:** Tyler coordinates CRM onboarding flow documentation with Sam + Ben
3. **This Week:** Sign off on privacy determination agent (don't let it stall)
4. **Ongoing:** Sam continues ramp-up on product data and customer journey
