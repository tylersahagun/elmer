# Transcript: CRM-EXP-ETE Experience Planning Session

**Date:** 2026-01-16
**Source:** Internal planning meeting
**Participants:** Tyler (PM), Brian (Engineering), James (RevOps/Internal Customer), Woody (Product), Palmer (Engineering)
**Initiative:** crm-exp-ete

## TL;DR

Internal planning session focused on defining the ideal CRM agent experience. James articulated that while the underlying CRM workflow power is "great," the configuration experience is painful (80+ hours to build a single workflow). The team identified four priority improvements: workflow visibility, manual test/enrollment capability, better AI context in workflow builder, and property creation automation.

## Key Decisions

- **Focus on workflow configuration experience** over building CRM features within AskElephant app
- **Data quality is non-negotiable** - "every piece of data we push should be good enough to send to a board"
- **Four priority improvements identified** for immediate impact (see below)
- **Future CRM features** (company pages, property panels) are valid but not Q1 priorities

## Action Items

- [ ] Implement workflow-level visibility (which records, when ran, what failed) - @Palmer
- [ ] Add manual enrollment/test capability for workflows - @Engineering
- [ ] Improve workflow builder AI context for CRM workflows - @Engineering
- [ ] Explore property creation from workflow builder - @Engineering

---

## Problems Identified

### Problem 1: Zero Visibility Into Workflow Execution
> "I would love to be able to see what deals it's run on versus hasn't run on. Wait five minutes, I don't know if it just failed to run or if it never hit the triggers."

> "A rep needs to know what AskElephant is doing. And if they have to go sort through a call, it's gonna be very hard to find that."

- **Persona:** RevOps Admin, Sales Rep
- **Severity:** Critical
- **Frequency:** Every workflow interaction

**Desired State:**
- Link to all CRM records updated by a workflow
- Timestamp of when each ran
- Which records hit trigger but failed
- Link to AskElephant event AND HubSpot record

### Problem 2: Testing Workflows Triggers Cascading Side Effects
> "Part of the reason I haven't built a close won close loss workflow in AskElephant is because to test something, I have to go mark a stage as close won or lost. And so I'm triggering like 40 other things to be able to test one workflow in AskElephant. And it makes you wanna punch a baby."

> "I'm muddying up my data, and it was bad data."

- **Persona:** RevOps Admin
- **Severity:** Critical
- **Frequency:** Every test iteration

**Desired State:**
- Manual enrollment capability like HubSpot's "Enroll" button
- Select a specific record and run workflow as if it met criteria
- Doesn't trigger other workflows in HubSpot

### Problem 3: Configuration Takes 80+ Hours Per Workflow
> "I have a workflow that I have eighty hours in."

> "If they want a beautiful, easy, like Gamma-esque experience where some halfwit can log in and build the correct workflow that will function correctly... that's the kind of standard I have with these workflows."

- **Persona:** RevOps Admin, Implementation Team
- **Severity:** Critical  
- **Frequency:** Every new workflow

**Desired State:**
- Describe goal in natural language ("I need close won analytics")
- AI identifies required fields, creates them if needed
- AI suggests repurposing existing unused fields
- Workflow just works on first try

### Problem 4: Noxin Workflow Builder Creates Bad CRM Workflows
> "There are in Nuxin Workflow Builder, it creates horrible CRM workflows... I actually we should fix that quickly before we just get a pile of trash to deal with."

- **Persona:** Implementation Team, RevOps Admin
- **Severity:** High
- **Frequency:** Every new customer setup

**Desired State:**
- Workflow builder has CRM-specific context built in
- If building HubSpot workflow, uses HubSpot agent (not generic)
- Knows which nodes require which other nodes
- Says "do not use this node" for incompatible combinations

### Problem 5: Property Creation Requires Manual HubSpot Work
> "What I would love for the experience actually is if... we do have some more parameters in place... I wanted to read their HubSpot first. We are looking for these four fields. I see they have these ones already. Do you wanna repurpose those?"

> "Muddying someone's CRM is like the worst thing we can do."

- **Persona:** RevOps Admin
- **Severity:** High
- **Frequency:** Every workflow that needs new fields

**Desired State:**
- AI reads existing HubSpot properties first
- Suggests repurposing unused fields
- Only creates new if needed
- Admin approves before creation

### Problem 6: Data Quality Failures Are Catastrophic
> "Bad data is worse than no data because you're gonna double down on the wrong decision."

> "Every piece of data we push should have the standard of quality that when we send some report that's pulling the data that we're pushing to HubSpot. That should be good enough to send to a board."

> "If you have something go wrong, they will churn forever. And if they don't, they're bad admins."

- **Persona:** RevOps Admin, Sales Leader
- **Severity:** Critical
- **Frequency:** Foundation for all CRM work

---

## Feature Requests

### 1. Workflow Execution Visibility Panel
- **Request:** See all records a workflow ran on, when, and failures
- **Quote:** "I would love to be able to see what deals it's run on versus hasn't run on"
- **Persona:** RevOps Admin
- **Priority:** P0 (James's #1)

### 2. Manual Workflow Enrollment
- **Request:** Button to run workflow on specific record without meeting trigger criteria
- **Quote:** "Be able to just kind of find and pick some stupid deal... and say, okay, imagine as if this just hit the criteria"
- **Persona:** RevOps Admin
- **Priority:** P0 (James's #2)

### 3. CRM Context in Workflow Builder
- **Request:** AI knows CRM-specific requirements and uses correct nodes automatically
- **Quote:** "Having all of that context built within workflow builder so that some RevOps leader literally just comes up and says, I need close won and lost analytics. And then it executes the whole thing."
- **Persona:** RevOps Admin, Implementation Team
- **Priority:** P0 (James's #3)

### 4. Property Creation from Workflow Builder
- **Request:** Create HubSpot properties directly from AskElephant during workflow setup
- **Quote:** "Those don't exist, would you like to create them? Yes. Sign in here, whatever."
- **Persona:** RevOps Admin
- **Priority:** P1 (James's #4)

### 5. Chat with Workflow for Debugging
- **Request:** Chat interface within workflow to ask "what happened?"
- **Quote:** "I would love if there was a chat in the workflow where I could just talk with it and be like, hey, I saw you ran here. What happened? Tell me."
- **Persona:** RevOps Admin
- **Priority:** P2

### 6. HubSpot App Card (Future)
- **Request:** AskElephant panel in HubSpot showing what AE changed and why
- **Quote:** "What I want in this app card is things like this record, AskElephant changed these things from these workflows... a trigger date"
- **Persona:** Sales Rep, RevOps Admin
- **Priority:** P3 (requires foundation work)

---

## Strategic Insights

### The Real Problem Statement
> "AskElephant is our app. It does not have a CRM experience so you describe it. But at least it has workflows. So if the quality was high enough with the workflows and the configuration easy enough, is it still valuable?"

> "If I was to go to another company today and run RevOps and AskElephant were to never change, I would refuse to take the role if they didn't buy AskElephant because of the HubSpot agent workflow. Like, literally, it is not just good, it's great. The experience of using it is painful."

**Key Insight:** The underlying CRM workflow capability is differentiated and valuable. The problem is entirely configuration/visibility experience.

### Fork in the Road Decision
> "From where you're sitting, there's a fork in the road. Try to build out a CRM experience within AskElephant app or ease of configuration for workflows."

> "I would put every penny towards experience of how someone interacts with workflows today."

**Decision:** Focus on workflow configuration experience, not building CRM-like features in app.

### Why Not Build CRM Features First
> "Like, you go into AskElephant and you wanna accomplish this. Like, what does that look like from start to finish?"

> "Anybody who wants to accomplish automating their CRM with AskElephant and doesn't have a way to vet all of the things that happened on a record in HubSpot doesn't have a finished experience."

> "I can do a lot of this kind of stuff well enough in the CRM... it comes back to can the workflow builder just can I give it my goal... and it know I need these fields in my CRM?"

**Insight:** Users already have HubSpot/Salesforce. They don't need us to replicate CRM features. They need us to make automation configuration easy.

---

## Hypothesis Candidates

Based on this transcript, consider these hypotheses:

1. **Configuration complexity is the primary barrier to CRM workflow adoption** - matches existing: ✅ Yes (Epic 3: Admin Config Simplification)

2. **Testing in isolation is required before admins trust production workflows** - matches existing: ✅ Yes (Epic 2: Approval Gates)

3. **Visibility into workflow execution is required for ongoing trust** - matches existing: ✅ Yes (Epic 1: Visibility Center)

4. **Bad data from automation causes churn faster than missing features** - NEW hypothesis candidate

5. **Natural language goal → complete workflow is the ideal end state** - matches existing: ✅ Yes (Epic 10: AI Config Assistant)

---

## James's Priority Stack (In Order)

1. **Visibility** - What workflows ran on what records, when, successes/failures
2. **Manual Enrollment/Test** - Run workflow on specific record without triggering others
3. **AI Context for CRM** - Workflow builder knows HubSpot-specific requirements
4. **Property Creation** - Create/repurpose fields from within workflow builder

---

## Quotes for Reference

### On Data Quality
> "Bad data is worse than no data because you're gonna double down on the wrong decision."

> "Every piece of data we push should have the standard of quality that when we send some report that's pulling the data that we're pushing to HubSpot. That should be good enough to send to a board."

### On Current Value
> "If I was to go to another company today and run RevOps and AskElephant were to never change, I would refuse to take the role if they didn't buy AskElephant because of the HubSpot agent workflow."

### On Configuration Pain
> "I have a workflow that I have eighty hours in."

> "The experience of using it is painful, and I feel..."

### On Testing
> "To test something, I have to go mark a stage as close won or lost. And so I'm triggering like 40 other things to be able to test one workflow in AskElephant. And it makes you wanna punch a baby."

### On Visibility
> "A rep needs to know what AskElephant is doing. And if they have to go sort through a call, it's gonna be very hard to find that."

---

*Processed: 2026-01-16*
*Source: Internal CRM-EXP-ETE Planning Session*
