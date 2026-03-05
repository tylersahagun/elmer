# User Interview Summary: HubSpot Agent Configuration

**Date:** 2026-01-06 **Participant:** James Hinkson (Internal Power User / Sales Leader) **Interviewer:** Tyler Sahagun **Type:** Discovery Interview (2 transcripts combined)

---

## TL;DR

The current HubSpot agent configuration is a "nightmare" requiring ~100 hours to master, with zero visibility into what happened or why. James wants a property-first UI where he can select HubSpot fields from dropdowns, define read-before-write logic, and set custom rules—all in 5 minutes per node instead of wrestling with complex prompts across multiple workflow nodes.

---

## Key Pain Points

### 1. Zero Visibility Into Agent Behavior

**Severity:** Critical | **Frequency:** Every Use

> "There is zero confidence that an admin or rep can find out why things were updated the way they were in the CRM and cannot therefore fix anything that's broken nor can they identify very quickly when and where things happen inside of AskElephant."

> "Not seeing what happened is one of the bigger pains today."

**Impact:** Users turn off the agent entirely when something unexpected happens because they can't debug it.

---

### 2. Testing Is Impossible

**Severity:** High | **Frequency:** Every Configuration

> "If I do get something built, testing is a nightmare. So I have to build it, and then I either have to go and trigger stuff en masse, which isn't great for my CRM hygiene, frankly, or I have to then just wait a bit."

> "The only way they'll be able to do [testing] without this is what I did where it's between 10PM and 3AM when no one else is online, you're testing workflows, looking at the record in HubSpot, and going back and making changes one at a time."

---

### 3. Configuration Takes Forever

**Severity:** Critical | **Frequency:** Every Setup

> "I'm probably like a hundred hours now of chatting with AskElephant to find out why something would or would not work every single time."

> "It's this nightmare of a prompt that I spent forever putting together and lives in three or four different nodes in a single workflow."

**Desired state:** 5 minutes per node, 10 nodes per workflow = ~50 minutes total, not 100 hours.

---

### 4. Partners Abandon After First Use

**Severity:** Critical | **Frequency:** Common

> "We've had a lot of partners and clients who use the HubSpot agent, like, twice. It does something. They don't know what it does. So they turn it off and they'll never use it again."

> "The trust isn't lost in a single workflow. It's not lost in the HubSpot agent. It's AskElephant's problem. Like, it's 'I don't trust AskElephant with my information or to manage my CRM.'"

---

### 5. Inconsistent Agent Execution

**Severity:** High | **Frequency:** Occasional

> "This field right here, marketing attribution agent is part of the same workflow as all these, but it runs only a fifth of the time. And I don't know why."

> "When it runs, it runs perfect."

---

### 6. Complex Multi-Field Dependencies

**Severity:** High | **Frequency:** Every Advanced Use

> "This thing, the closed date probability context—before this writes, it reads this, and then it also reads all of these, and then also reads all of these assessments before it updates this. And then once it does this, then it updates this."

Current workaround: Complex prompts spread across 3-4 workflow nodes that even Brian (engineering) didn't know was possible.

---

## Desired Configuration Behaviors

### Core Requirement: Field-First Configuration

> "What it could look like is when I click on that instead of an agent prompt, it has, like, select the properties from HubSpot you wanna update. And I literally pick the record type and the property specifically."

| Capability          | Current State              | Desired State             |
| ------------------- | -------------------------- | ------------------------- |
| Select fields       | Write in prompt            | Dropdown from HubSpot     |
| Set instructions    | Embedded in massive prompt | Text box per property     |
| Read before write   | Prompt engineering         | Checkbox toggle           |
| Field dependencies  | Prompt gymnastics          | Visual selector           |
| Order of operations | Multiple nodes             | Single node with sequence |

### Read-Before-Write Logic

> "Digest the content already in the field in HubSpot. Or are there other fields that should be read before this gets updated?"

**Example:** Before updating `close_date_probability`, read:

- Sales skill total score
- Next step + next step date
- Why will they buy?
- Why will this fail?
- Who drives and influences it?
- How do they buy?
- Anything to create urgency?
- All skill score context

### Append vs. Overwrite

> "If four calls all say it came from one place, and then another call says, 'oh, yeah. I heard about you from this online app.' I want both things tracked in HubSpot. I want to append it, not override it."

### Global Downshifts / Custom Rules

> "If I'm talking to an AE, not a CRO, I don't care how good the demo is. They can't have a perfect score. Because that deal cannot close."

> "If there's no buyer validation present, meaning at no point in any of my calls has someone who actually has authority to buy present, they cannot have a 10. They lose at least one point always."

**Need:** Open sandbox for custom business logic that can't be captured in simple checkboxes.

---

## Specific UI/UX Requirements

### 1. Property Selector (Not Prompt)

```
┌─────────────────────────────────────────────┐
│ Select properties to update:                │
│ ☑ Probability to Close                      │
│ ☑ Close Date Probability Context            │
│ ☑ Next Step                                 │
│ ☑ Next Step Date                            │
│ ☐ Marketing Attribution                     │
└─────────────────────────────────────────────┘
```

### 2. Per-Property Configuration

> "And then if there's another box at the end that says, or a little checkbox, read before write."

Each selected property gets:

- Text box for instructions/prompt
- "Read before write" checkbox
- Field dependencies selector (which fields to read first)
- Custom rules (sandbox text area)

### 3. Scorecard Builder (Tyler's Mockup Discussion)

| Property           | Context Prompt            | Weight | Special Rules  | Sync to HubSpot |
| ------------------ | ------------------------- | ------ | -------------- | --------------- |
| Buyer Involvement  | "Rate buyer authority..." | 25%    | If < 50%, -10% | ☑               |
| Objection Overcome | "Read from HubSpot..."    | 20%    | —              | ☑               |
| Amount             | —                         | 15%    | —              | ☐               |

> "This structure would work for anything I'd wanna do in HubSpot. Like, the scorecard principles apply to any other fields. 100% this is exactly correct."

### 4. Read Context From HubSpot

> "If I had a 'read these fields before doing anything' and then I could say 'these are the fields I'm gonna update.' And when I click one, it gives me a little prompt window below just for that property. That would be ideal."

### 5. Single Node, Not Four

> "I don't have to go have four nodes. I can do it in one node, and it becomes way easier."

---

## Success Metrics Discussed

### Primary Metric: Forecast Accuracy

> "I am convinced that forecast accuracy is actually what we do at AskElephant."

> "When I adjust those probabilities... this weighted pipeline can be an accurate forecast. I want to come in here and say, Josh is gonna close $70,000 next month."

### Secondary Metrics

| Metric             | Current                | Target          | Notes                          |
| ------------------ | ---------------------- | --------------- | ------------------------------ |
| Time to configure  | ~100 hours             | ~50 minutes     | 5 min/node × 10 nodes          |
| Agent retention    | Users try 2x then quit | Continued usage | "Less likely to stop using it" |
| Debug time         | Hours/days             | Minutes         | "Find out why faster"          |
| Partner activation | Unknown                | Measurable      | Check PostHog for usage        |

### Measurement Approach

> "I would go on PostHog, and I would see who is literally using the HubSpot agent the most."

> "Pick two or three that were using it a lot in September, October, November and stopped using it. And didn't use it at all in December. And be like, 'hey, I noticed usage went down. We're doing something to improve this. We'd love to get your feedback.'"

---

## Action Items

- [ ] Tyler to follow up on "updated property pieces for deal updates in HubSpot" - @Tyler
- [ ] Tyler to send Loom video with mockups for feedback - @Tyler
- [ ] Identify 5-10 HubSpot partners for testing via PostHog usage data - @Tyler
- [ ] Find partners who used agent heavily then stopped (Sept-Nov → Dec drop) - @Tyler
- [ ] Mock up scorecard builder UI based on discussion - @Tyler

---

## Key Quotes to Remember

On the core problem:

> "Any good workflow program on Earth has an audit history of what enrolled in the workflow. Why? What did it change?"

On trust:

> "The trust isn't lost in a single workflow... It's 'I don't trust AskElephant with my information.'"

On desired experience:

> "My goal is that this should take five minutes per node."

On testing:

> "I held a gun to my head" (hyperbole about 10PM-3AM testing sessions)

On what success looks like:

> "My outcome is that I know 100% confidently that every field I want updated in HubSpot is updated after every call."

---

## Related Research

- Check Notion for prior HubSpot agent feedback
- Compare to Fathom ($29) and Fireflies ($20) basic offerings
- Review PostHog data for HubSpot agent usage patterns

---

## Open Questions

1. How do we visualize "read before write" dependencies without overwhelming users?
2. Should "Scorecard" be a first-class object type in AskElephant?
3. What's the MVP version of field-first configuration?
4. How do we handle the tension between power users (James) and new partners who need simplicity?
5. Can we auto-detect when an agent stops running and surface that proactively?

---

_Last updated: 2026-01-06_ _Analyst: Tyler Sahagun_
