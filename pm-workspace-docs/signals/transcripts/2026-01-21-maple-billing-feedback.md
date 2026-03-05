# Transcript: Maple Billing Product Feedback

**Date:** 2026-01-21
**Source:** Customer feedback call
**Participants:** Jared Henriques (Maple), Madelaine Gibson (Maple), Tyler Sahagun (AskElephant), Skylar Sanford (AskElephant)

## TL;DR
Jared (sales team of one at Maple) is using AskElephant primarily for self-coaching and deal preparation. He wants a **pipeline/deal workspace** that mirrors HubSpot, where he can quickly access transcripts and context per account. Key friction: chats list lacks company context making it hard to find past conversations, and HubSpot agent behavior is inconsistent.

## Key Decisions
- Tyler to send video of structured outputs / deterministic CRM updates feature
- Team to add Maple to CRM agent beta with recent improvements
- Follow-up call after Maple explores updates

## Action Items
- [ ] Send structured outputs video to Jared - @Tyler
- [ ] Check Maple's HubSpot agent setup with new improvements - @Skylar
- [ ] Add company/account context to chat list view - Product backlog

---

## Problems Identified

### Problem 1: Chat History Lacks Context
> "On the chats, when I click chats and there's the massive list of chats, can we add the context of either company or something to that just so that I have a a bit of ability to delineate between them?"
- **Persona:** Sales rep (team of one)
- **Severity:** Medium
- **Frequency:** Common (every time they search for past conversations)
- **Related:** Rep Workspace, UX polish

### Problem 2: No Deal-Centric Workspace
> "One of the things that I'd be really keen on is one, just like a pipeline view of mirroring my HubSpot pipeline into, you know, AskElephant for me to very quickly start to say, hey. Cool. Let me hop in on, like, a per account basis or a per deal basis, and then start to see my transcription and actually talk with the the deal property in and of itself"
- **Persona:** Sales rep
- **Severity:** High
- **Frequency:** Common (daily workflow need)
- **Related:** **rep-workspace** initiative (DIRECT MATCH)

### Problem 3: Activity/Email Data Not Stored Locally
> "The thing that I'm also, like, curious about is with the HubSpot saying, really, the thing that I want more than anything else is ensuring that, like, my activities slash emails are being brought into the context of the conversation outside of the transcripts in and of themselves."
- **Persona:** Sales rep
- **Severity:** Medium
- **Frequency:** Common
- **Related:** CRM data sync architecture, customer-journey-map

### Problem 4: HubSpot Agent Inconsistency
> "Make sure you turn it on. It's like, it was on, and I couldn't find that conversation for the life of me to find where that was."
- **Persona:** Sales rep
- **Severity:** Medium
- **Frequency:** Occasional
- **Related:** hubspot-agent-config-ui, CRM agent improvements

### Problem 5: Workflow Sidebar Organization Confusion
> "I also have been just finding the left hand side with, like, the public workflows. Like, sometimes things get duplicated and turned off and all that. And then they're on on the next meeting, and I just, like I'm having a hard time, like, understanding the right organization there."
- **Persona:** Sales rep
- **Severity:** Low
- **Frequency:** Occasional
- **Related:** Workflow builder UX

---

## Feature Requests

### Request 1: Pipeline/Deal Workspace
- **Description:** Mirror HubSpot pipeline in AskElephant for per-deal AI interaction
- **Quote:** "A pipeline view of mirroring my HubSpot pipeline into AskElephant for me to very quickly start to say, hey. Let me hop in on a per account basis or a per deal basis"
- **Persona:** Sales rep
- **Priority:** High (core workflow)
- **Initiative Match:** `rep-workspace` ✅

### Request 2: Company Context in Chat List
- **Description:** Show company/account name in the chat list for easier navigation
- **Quote:** "Can we add the context of either company or something to that just so that I have a bit of ability to delineate between them"
- **Persona:** Sales rep
- **Priority:** Medium (UX friction)
- **Initiative Match:** Rep Workspace polish

### Request 3: Proactive CRM Field Suggestions
- **Description:** Proactively suggest CRM fields to update based on call content
- **Quote:** "Proactively being, like, hey. Here's some suggested, like, fields to update in this opportunity, flagging, hey. You know, we noticed that they talked about this as a potential competitor."
- **Persona:** Sales rep
- **Priority:** Medium
- **Initiative Match:** CRM Agent upgrades

### Request 4: Deal Creation Prompts
- **Description:** Prompt to create deal if none associated with meeting
- **Quote:** "Hey. We noticed there's no deal associated with this. Like, do you want us to create one?"
- **Persona:** Sales rep
- **Priority:** Medium
- **Initiative Match:** CRM Agent proactive actions

---

## Persona Insights

### Sales Team of One (Solo Rep)
Jared represents an underserved persona: the solo sales rep who needs **self-coaching**, not team monitoring.

> "I am a sales team of one, so that's where my workflows are maybe, like, very much predicated upon that... I'm actually way more interested in coaching from the aspect of, like, cool. Pull out some the common questions that have been asked across all my transcripts. Pull out, like, the key details of where I could have adjusted this."

**Implications:**
- Rep Workspace should support self-reflection, not just manager oversight
- Coaching features should work for individuals, not just teams
- "Solo rep" persona may be worth adding to personas list

---

## Strategic Alignment

### ✅ Aligned with Product Vision
- **Deal workspace request** → directly supports "Rep Workspace" initiative
- **Context at your fingertips** → aligns with core value prop
- **Self-coaching** → human-centered AI (orchestration, not replacement)

### ✅ Validates Hypothesis
- `hyp-customer-journey-map`: Jared wants exactly what this describes - a story of the deal with context
- `rep-workspace` PRD: His requests are nearly 1:1 with the planned features

### ⚠️ Watch Items
- Solo rep use case may need explicit coverage in personas
- HubSpot agent reliability flagged again (consistent signal)

---

## Hypothesis Matching

### Matches Found
- **Deal workspace request** → `rep-workspace` initiative (EXACT MATCH)
  - Jared's request for pipeline view + per-deal AI interaction is the core of Rep Workspace
  - His "self-coaching" angle validates the coaching insights future consideration
  
- **Context/narrative need** → `customer-journey-map` initiative
  - "See my transcription and actually talk with the deal property" aligns with journey map vision
  
- **HubSpot agent inconsistency** → `hubspot-agent-config-ui` hypothesis
  - Adds evidence to CRM agent reliability concerns

### New Hypothesis Candidates
- **Solo rep persona**: Sales team of one has distinct needs (self-coaching vs team monitoring)
  - Consider: `hypothesis new solo-rep-coaching`

---

## Key Quotes for Reference

**On deal-centric workflow:**
> "Let me hop in on, like, a per account basis or a per deal basis, and then start to see my transcription and actually talk with the the deal property in and of itself where it would have any activity or transcripts, um, involved with that for me to actually kinda do deal coaching."

**On self-coaching vs team coaching:**
> "I'm actually way more interested in coaching from the aspect of, like, cool. Pull out some the common questions that have been asked across all my transcripts. Pull out, like, the key details of where I could have adjusted this. And so it's more self coaching than it is monitoring."

**On chat navigation friction:**
> "I definitely find myself, like, clicking through a whole bunch of tasks. So I'm like, wait. Where was talking with that?"

**On workflow confusion:**
> "I'm having a hard time, like, understanding the right organization there."

---

## Next Steps

1. **Rep Workspace initiative:** Add Jared's quotes as customer evidence
2. **Quick win:** Add company/account context to chat list (low effort, high value)
3. **Follow-up:** Share structured outputs video, check back after Maple explores beta
4. **Consider:** Solo rep persona documentation

---

*Signal processed: 2026-01-21*
*Related initiatives: rep-workspace, customer-journey-map, hubspot-agent-config-ui*
