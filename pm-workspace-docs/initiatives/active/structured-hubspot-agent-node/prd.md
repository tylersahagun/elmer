# HubSpot Agent Configuration UI PRD

## Overview

- **Owner:** Tyler Sahagun
- **Target Release:** Q1 2026
- **Status:** Draft
- **Research:** [James Hinkson Interview](../../research/user-interviews/2026-01-06-hubspot-agent-configuration-james-hinkson.md)

---

## Outcome Chain
HubSpot agent configuration enables RevOps and sales leaders to define CRM updates without prompt engineering
  → so that they can trust updates before they run
    → so that CRM data stays accurate and useful for forecasting
      → so that pipeline decisions improve and revenue outcomes increase

---

## Problem Statement

### What problem?

Configuring the HubSpot agent to update CRM fields correctly requires complex prompt engineering spread across 3-4 workflow nodes. Users spend **100+ hours** learning to configure agents through trial and error, with zero visibility into what's happening or why.

### Who has it?

- **RevOps admins** trying to set up CRM automation
- **Sales leaders** who want accurate forecasting via automated field updates
- **HubSpot partners** evaluating AskElephant for CRM integration

### Why now?

> "We've had a lot of partners and clients who use the HubSpot agent, like, twice. It does something. They don't know what it does. So they turn it off and they'll never use it again."

Partner churn is directly tied to configuration complexity. The trust loss cascades:

> "The trust isn't lost in a single workflow... It's 'I don't trust AskElephant with my information or to manage my CRM.'"

### Evidence

| Data Point                                                | Source                  |
| --------------------------------------------------------- | ----------------------- |
| 100+ hours to configure properly                          | James Hinkson interview |
| Partners abandon after 2 uses                             | James Hinkson interview |
| Marketing attribution runs 1/5 of the time, cause unknown | Internal testing        |
| Testing requires 10PM-3AM isolated sessions               | James Hinkson interview |

---

## Goals & Non-Goals

### Goals (Measurable)

- [ ] **5 minutes** to configure a single property update (vs. current ~10 hours of prompt iteration)
- [ ] **50 minutes** to configure a complete 10-field workflow (vs. current 100+ hours)
- [ ] **30% increase** in HubSpot agent retention (users who configure → continue using)
- [ ] **Zero prompt engineering required** for standard use cases

### Non-Goals

- **Custom code execution** — This is configuration, not a scripting environment
- **Non-HubSpot CRMs** — Salesforce/other CRMs are separate initiatives
- **Replacing workflows entirely** — This improves the HubSpot agent node, not workflow architecture
- **Real-time streaming updates** — Batch timing is sufficient for MVP

---

## User Personas

### Primary: RevOps Admin

- **Job-to-be-done:** Configure AskElephant to automatically update HubSpot fields after every sales call so data is accurate for reporting
- **Current pain:** "It's this nightmare of a prompt that I spent forever putting together and lives in three or four different nodes"
- **Success looks like:** "I know 100% confidently that every field I want updated in HubSpot is updated after every call"

### Secondary: Sales Leader

- **Job-to-be-done:** Set up automated deal scoring and probability calculations to improve forecast accuracy
- **Current pain:** "Testing is a nightmare... between 10PM and 3AM when no one else is online"
- **Success looks like:** "Come in here and say, Josh is gonna close $70,000 next month" with confidence

---

## User Stories

### Configuration

- As a **RevOps admin**, I want to **select HubSpot properties from a dropdown** so that I don't have to write prompts that reference internal field IDs
- As a **RevOps admin**, I want to **define instructions per property** so that each field update has clear, isolated logic
- As a **RevOps admin**, I want to **specify field dependencies** so that the agent reads context before writing
- As a **RevOps admin**, I want to **choose which signals to match (domain, email, deal name)** so that the correct object is updated every time
- As a **RevOps admin**, I want to **create a new object when none is found** so that updates never fail silently
- As a **RevOps admin**, I want to **choose update vs create vs update-or-create** so that I can control when a record is created
- As a **Sales leader**, I want to **configure notes or tasks as outputs** so that CRM follow-ups are consistent
- As a **Sales leader**, I want to **set custom scoring rules** so that deal probabilities reflect my specific business logic

### Visibility

- As a **RevOps admin**, I want to **see which fields will be updated before running** so that I can verify my configuration
- As a **RevOps admin**, I want to **preview the read-before-write chain** so that I understand the data flow
- As a **RevOps admin**, I want to **set the execution order** so that dependent fields update in the right sequence
- As a **RevOps admin**, I want to **see a direct HubSpot record link** so that I can verify the exact object being updated

### Trust

- As a **HubSpot partner**, I want to **configure in 5 minutes** so that I can evaluate AskElephant's value quickly
- As a **RevOps admin**, I want to **review changes before syncing** so that I can prevent bad updates
- As a **RevOps admin**, I want to **toggle append vs. overwrite per field** so that I don't lose historical data
- As a **RevOps admin**, I want **human review at the object level** so that approvals aren't required for every single field

---

## Requirements

### Jury-Validated P0 Requirements (Critical)

> **Source:** Condorcet Jury Evaluation (1000 personas, 50.6% pass rate)
> **Threshold:** These must be addressed to reach >70% pass rate

#### Rollback & Undo System

**Friction Point:** "Rollback if something breaks" (282/1000 personas flagged as abandonment trigger)

- [ ] **One-click rollback** for any automated sync action
- [ ] **30-day undo window** — users can revert any change within 30 days
- [ ] **Rollback preview** — show exactly what will be restored before confirming
- [ ] **Undo toast** — show "Undo" option immediately after every sync
- [ ] **Audit log** — capture all rollback actions for compliance

**Acceptance Criteria:**
- Rollback completes in <5 seconds
- Rollback confirmation shows exact fields/values being restored
- Works for individual fields or entire sync batch

#### Preview & Test Mode

**Friction Point:** "Testing before go-live" (248/1000 personas flagged)

- [ ] **Sandbox mode** — test configuration against sample data without affecting production
- [ ] **Preview sync** — show what would be written before actually writing
- [ ] **Side-by-side diff** — visual comparison of current vs. proposed values
- [ ] **Dry run logging** — execute full logic but log instead of write
- [ ] **Test against specific meeting** — select a historical meeting to test against

**Acceptance Criteria:**
- Every configuration change can be previewed before applying
- Test mode clearly labeled "TEST" vs "LIVE"
- Preview shows confidence score for each field extraction

#### Configuration Simplicity

**Friction Point:** "Configuration complexity" (248/1000 personas flagged)

- [ ] **3-step basic setup** — object type → property → instruction
- [ ] **5+ pre-built templates** — Deal Scoring, Next Steps, Meeting Notes, etc.
- [ ] **Progressive disclosure** — hide advanced options until explicitly requested
- [ ] **Contextual help** — inline guidance at every configuration step
- [ ] **Guided wizard** — first-time setup flow with explanations

**Acceptance Criteria:**
- Basic configuration completes in <5 minutes
- New users complete setup without external documentation
- Template adoption >50% for new users

#### Pause/Resume Controls

**Jury Suggestion:** "One-click to pause/resume" (161/1000 personas requested)

- [ ] **Global pause** — stop all HubSpot syncs with one click
- [ ] **Per-field pause** — pause individual property syncs
- [ ] **Resume confirmation** — show what will sync when resuming
- [ ] **Pause status indicator** — clear visual when syncs are paused

---

### Must Have (MVP — Original)

#### Property Selector

- [ ] Fetch and display all properties from connected HubSpot account
- [ ] Filter by object type (Deal, Contact, Company, Meeting, Note, Task, Custom)
- [ ] Search/filter properties by name
- [ ] Show property type (text, number, date, dropdown, etc.)
- [ ] Multi-select properties to update in a single agent run

#### Per-Property Configuration

- [ ] **Instruction text box** — Natural language prompt for what value to extract
- [ ] **Read existing value toggle** — When enabled, read existing field value before updating
- [ ] **Field dependencies selector** — Multi-select other properties to read first
- [ ] **Write mode selector** — Overwrite | Append | Append if different

#### Association & Object Handling

- [ ] **Match signal selection** — Domain, email, deal name, meeting title
- [ ] **No match behavior** — Skip update or create new object
- [ ] **Required fields for create** — minimum fields before creation

#### Context Source

- [ ] **Latest call** as default context
- [ ] **Select meeting** for testing against historical calls
- [ ] **Paste transcript** to configure outside a live conversation

#### Human Review

- [ ] **Sync mode** — Auto-sync or review-first
- [ ] **Review preview** — Show proposed changes before approval
- [ ] **Object-level approval** — One approval gate for the object, not per property

#### Execution Order

- [ ] **Order controls** — Set property execution order
- [ ] **Dependency awareness** — Highlight dependency-driven order

#### Action-First Configuration

- [ ] **Action type selector** — Update existing | Create new | Update or create
- [ ] **No update timing** — Configuration is action-based, not a trigger
- [ ] **Optional condition** — Gate the action with a simple rule

### Should Have (Jury-Validated P1)

#### Activity Log & Audit Trail

**Jury Suggestion:** "Clear activity log I can review" (180/1000 personas requested)

- [ ] **Per-meeting activity log** — show all fields updated from each call
- [ ] **Per-field history** — timeline of all changes to a specific property
- [ ] **Filter by status** — success, failed, skipped, rolled back
- [ ] **Export capability** — CSV/JSON export for compliance
- [ ] **Search/filter** — find specific updates by date, field, value

#### Sync Preview

**Jury Suggestion:** "Show exactly what will sync before it syncs" (174/1000 personas requested)

- [ ] **Pre-sync summary** — modal showing all pending changes before execution
- [ ] **Field-level approval** — accept/reject individual field updates
- [ ] **Batch approval** — approve all or reject all
- [ ] **Scheduled preview** — see what will sync in next batch run

#### Mobile Status View

**Jury Suggestion:** "Mobile-friendly status view" (185/1000 personas requested)

- [ ] **Responsive design** — configuration status viewable on mobile
- [ ] **Push notifications** — alert on sync failures or issues
- [ ] **Quick pause** — pause syncs from mobile

---

### Should Have (Original)

#### Run Conditions

- [ ] **Run condition field** — Only run if [field] equals [value]

#### CRM Linkouts

- [ ] **HubSpot record link** — View the exact record being updated
- [ ] **Post-sync summary** — Show the record link and fields updated

#### Dependency Visualization

- [ ] Visual graph showing read/write order
- [ ] Highlight circular dependency errors
- [ ] Show estimated execution sequence

#### Templates

- [ ] Pre-built configurations for common use cases:
  - Next Step + Date
  - Deal Probability Score
  - Meeting Summary
  - Action Items
- [ ] Clone existing configuration as template

### Could Have

#### Scorecard Builder

- [ ] Define weighted scoring across multiple input fields
- [ ] Set percentage weights per input
- [ ] Global downshift rules ("if no buyer present, max score is 80%")
- [ ] Custom business logic sandbox (advanced text area)

#### Testing Sandbox

- [ ] Run against a specific meeting transcript
- [ ] Show before/after field values
- [ ] Dry run mode that logs but doesn't write

---

## User Flows

### Flow: Configure a New Property Update

**Trigger:** User clicks "Add Property" in HubSpot agent configuration

**Steps:**

1. User selects context source (latest call or select meeting)
2. Property selector opens showing HubSpot properties for selected object type
3. User searches/filters and selects "Close Date Probability"
4. Configuration panel expands below the selected property
5. User enters instruction: "Based on the conversation, estimate probability of closing by the stated close date. Consider objections raised, buyer enthusiasm, and timeline discussed."
6. User enables "Read existing value" toggle
7. User selects dependencies: [Sales Skill Score, Why Will This Fail, Buyer Involvement]
8. User selects write mode: "Overwrite"
9. User chooses sync mode: "Review first"
10. Configuration saves automatically

**Outcome:** Property is added to the agent's update list with full configuration visible

**Success Metric:** < 5 minutes from start to saved configuration

---

### Flow: View Field Dependencies

**Trigger:** User clicks "View Dependencies" or expands dependency section

**Steps:**

1. Visual diagram renders showing:
   - Properties that will be READ (inputs)
   - Property being WRITTEN (output)
   - Order of operations
2. If circular dependency exists, show error with specific fields involved
3. User can click any node to edit its configuration

**Outcome:** User understands data flow before execution

**Success Metric:** User can identify dependency issues without running the agent

---

### Flow: Handle Missing Match

**Trigger:** Agent cannot find a matching HubSpot object

**Steps:**

1. System displays "No match found" summary with signals attempted
2. User chooses: "Skip update" or "Create new object"
3. If "Create," user fills required fields (e.g., deal name, amount)
4. System shows a preview of the object to be created
5. User approves or cancels

**Outcome:** User controls whether a new object is created or the update is skipped

**Success Metric:** No silent failures when associations fail

---

### Flow: Review Before Sync

**Trigger:** Sync mode set to "Review first"

**Steps:**

1. Agent generates proposed updates for all properties
2. User reviews a pre-sync summary with before/after values
3. User approves all changes or rejects specific fields
4. Approved changes sync to HubSpot

**Outcome:** User confirms changes before writing to CRM

**Success Metric:** Increased trust and lower rollback rates

---

### Flow: Quick Start with Template

**Trigger:** New HubSpot partner connects account and opens agent configuration

**Steps:**

1. System shows "Quick Start" modal with template options:
   - 📊 Deal Scoring (5 fields)
   - 📝 Meeting Notes (3 fields)
   - ✅ Next Steps (2 fields)
   - 🎯 Custom (blank)
2. User selects "Deal Scoring"
3. Template loads with pre-configured properties:
   - Probability to Close
   - Close Date Probability Context
   - Next Step
   - Next Step Date
   - Deal Risk Assessment
4. User reviews and adjusts instructions per their sales process
5. User clicks "Activate"

**Outcome:** Working HubSpot agent in < 10 minutes

**Success Metric:** 70% of new partners use a template; 50% activate within first session

---

## UI Specification

### Property Selector Component

```
┌─────────────────────────────────────────────────────────────┐
│ HubSpot Agent Configuration                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Object Type: [Deal ▾]                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Search properties...                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Properties to Update:                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Probability to Close              [number]        │   │
│  │ ☑ Close Date Probability Context    [text]          │   │
│  │ ☑ Next Step                         [text]          │   │
│  │ ☑ Next Step Date                    [date]          │   │
│  │ ☐ Marketing Attribution             [dropdown]      │   │
│  │ ☐ Deal Risk Assessment              [text]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Add Property]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Per-Property Configuration Panel

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Probability to Close                           [🗑 Remove]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Instructions                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Based on the conversation, estimate the probability │   │
│  │ of closing this deal. Consider: buyer enthusiasm,   │   │
│  │ objections raised, decision timeline, and...        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ☑ Read existing value                                      │
│     Read existing value and factor into update              │
│                                                             │
│  Dependencies (read these first):                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Sales Skill Score ×] [Why Will Fail ×] [+ Add]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Write Mode: (○) Overwrite  ( ) Append  ( ) Append if new   │
│                                                             │
│  Sync mode: Review first                                    │
│                                                             │
│  [Preview Output]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Visualization

```
┌─────────────────────────────────────────────────────────────┐
│ Execution Order                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐                                          │
│   │ Sales Skill  │──┐                                       │
│   │    Score     │  │                                       │
│   └──────────────┘  │    ┌──────────────────┐              │
│                     ├───▶│  Probability to   │              │
│   ┌──────────────┐  │    │      Close        │              │
│   │ Why Will     │──┤    └──────────────────┘              │
│   │   Fail       │  │              │                        │
│   └──────────────┘  │              ▼                        │
│                     │    ┌──────────────────┐              │
│   ┌──────────────┐  │    │  Close Date      │              │
│   │ Buyer        │──┘    │  Probability     │              │
│   │ Involvement  │       │  Context         │              │
│   └──────────────┘       └──────────────────┘              │
│                                                             │
│   Legend: [READ] ──▶ [WRITE]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Considerations

### Dependencies

- HubSpot API integration (existing)
- Property metadata fetching from HubSpot
- Workflow node schema updates

### Integration Points

- Existing workflow builder UI
- HubSpot agent execution engine
- Activity/audit logging system

### Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| HubSpot rate limits on property fetch | Medium | Low | Cache property list, refresh on demand |
| Complex dependency chains cause execution delays | Medium | Medium | Limit dependency depth to 3 levels |
| Users create circular dependencies | High | Medium | Detect and block at save time |
| Existing prompt-based configs need migration | High | High | Run both systems in parallel; gradual migration |

### Migration Strategy

1. **Phase 1:** New UI available alongside existing prompt interface
2. **Phase 2:** Auto-convert simple prompt configs to structured format
3. **Phase 3:** Deprecation warning on prompt-only configs
4. **Phase 4:** Full migration, prompt interface removed

---

## Success Metrics

### North Star

**Configuration-to-value time:** Minutes from starting configuration to first successful HubSpot update

| Segment                       | Current       | Target       |
| ----------------------------- | ------------- | ------------ |
| New partner (first config)    | 100+ hours    | < 30 minutes |
| Experienced admin (new field) | 30-60 minutes | < 5 minutes  |

### Leading Indicators

- % of new HubSpot connections that complete first configuration
- % of configured agents that execute successfully on first run
- Time spent in configuration UI per property
- Template adoption rate

### Guardrails

- No increase in failed HubSpot writes due to configuration errors
- No increase in support tickets about "agent not working"
- Maintain < 2s UI response time for property fetch

---

## Open Questions

1. **Migration:** How do we handle existing complex prompt configurations that can't be auto-converted?
2. **Association:** What signals are reliable enough to default (domain, email, deal name)?
3. **Action Type:** Should the default be update-only or update-or-create?
4. **Approval:** Should "Review first" be the default for new users or only for skeptics?
5. **Notes/Tasks:** Are these in scope for MVP or in a follow-on release?
6. **HubSpot Links:** How do we ensure record links are accurate and consistent?
7. **Validation:** How do we validate instructions before execution? LLM-based check?

---

## Appendix

### Competitive Landscape

| Product         | CRM Config Approach                           |
| --------------- | --------------------------------------------- |
| Fathom          | 5 basic fields, no customization ($29/mo)     |
| Fireflies       | Meeting notes only, no field mapping ($20/mo) |
| Gong            | Enterprise-grade, complex setup               |
| **AskElephant** | Custom configurations (our differentiator)    |

> "If all we're doing is pushing meeting notes, then great. Fireflies does that for $20... The thing that we genuinely sell that no one else does is custom configurations." — James Hinkson

### Key Quotes from Research

**On the core problem:**

> "There is zero confidence that an admin or rep can find out why things were updated the way they were in the CRM."

**On desired experience:**

> "When I click on that instead of an agent prompt, it has, like, select the properties from HubSpot you wanna update. And I literally pick the record type and the property specifically."

**On complexity:**

> "Being able to dictate that order will be great. Instead, it's this nightmare of a prompt that I spent forever putting together and lives in three or four different nodes."

**On success:**

> "My outcome is that I know 100% confidently that every field I want updated in HubSpot is updated after every call."

---

_Last updated: 2026-01-06_ _Status: Draft — Awaiting review_
