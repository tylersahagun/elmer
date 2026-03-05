# CRM Experience End-to-End - PRD

## Overview

The CRM Experience End-to-End initiative transforms how users configure and trust CRM automation. The core insight: **the underlying CRM workflow capability is differentiated and valuable—the problem is entirely the configuration/visibility experience.**

> "If I was to go to another company today and run RevOps and AskElephant were to never change, I would refuse the role if they didn't buy AskElephant because of the HubSpot agent workflow. Like, literally, it is not just good, it's great. The experience of using it is painful." — James Hinkson, Internal RevOps

**Strategic Decision (2026-01-16):** Focus on workflow configuration experience, NOT building CRM features in-app. Users already have HubSpot/Salesforce—they need us to make automation configuration easy.

## Outcome Chain

```
Admin configures CRM agent through simplified workflow builder
  → so that they can test in isolation without contaminating data
    → so that they build confidence before going live
      → so that CRM data quality meets "board-ready" standards
        → so that leaders trust automation-driven forecasts
          → so that pipeline decisions improve and revenue increases
```

## Problem Statement

### What problem?

CRM workflow configuration is **excellent in capability but painful in experience**. Users invest 80+ hours to configure a single workflow. Testing contaminates production data by triggering 40+ unrelated workflows. There's no visibility into what ran, what failed, or why.

> "Bad data is worse than no data because you're gonna double down on the wrong decision." — James Hinkson

> "I have a workflow that I have eighty hours in." — James Hinkson

> "To test something, I have to mark a stage as close won or lost. So I'm triggering 40 other things just to test one workflow. Makes you wanna punch a baby." — James Hinkson

### Who has it?

- **RevOps Admins/Partners** - Spend 100+ hours becoming proficient; abandon after first bad experience
- **Sales Reps** - Can't see what the agent did or why; lose trust in automation entirely
- **Implementation Team** - Noxin workflow builder creates broken CRM workflows by default

### Evidence

| Problem                                   | Severity | Evidence                                                                                                                    |
| ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Configuration takes 80+ hours             | Critical | "I'm probably like a hundred hours now of chatting with AskElephant to find out why something would or would not work"      |
| Testing causes cascade effects            | Critical | "To test something, I have to trigger 40 other workflows in HubSpot"                                                        |
| Zero visibility into execution            | Critical | "I don't know if it just failed or if it never hit the triggers"                                                            |
| Partners abandon after first use          | Critical | "We've had partners who use the HubSpot agent twice. It does something. They don't know what. So they turn it off forever." |
| Trust loss spreads to entire platform     | Critical | "It's AskElephant's problem. It's 'I don't trust AskElephant with my CRM.'"                                                 |
| Workflow builder defaults to broken tools | High     | "If you don't tell it to use the HubSpot agent, it'll use the v2 tools that don't work"                                     |

## Target Personas

- [x] **RevOps Admin/Partner** (Primary) - Configures and maintains CRM automation
- [x] Sales Representative - Consumes automation output, needs trust
- [x] Sales Leader - Relies on data quality for forecasting
- [ ] CSM - Future consideration

## Success Metrics

| Metric                            | Current                | Target           | Standard                         |
| --------------------------------- | ---------------------- | ---------------- | -------------------------------- |
| Time to configure single workflow | ~80 hours              | < 1 hour         | "5 minutes per node × 10 nodes"  |
| Workflow test iterations          | Contaminates prod data | Zero prod impact | Isolated test runs               |
| Data quality bar                  | Unknown                | Board-ready      | "Good enough to send to a board" |
| Admin proficiency time            | ~100 hours             | < 2 hours        | Guided setup with templates      |
| Workflow success rate             | Inconsistent           | > 99%            | Links to HubSpot record + event  |
| Time from failure to root cause   | Hours/days             | < 5 min          | Clear audit trail                |

---

## James's Priority Stack (Q1 2026 Focus)

Based on internal planning session (2026-01-16), these four improvements—**in order**—deliver the most impact:

### Priority 1: Workflow Visibility (Epic 1)

> "I would love to be able to see what deals it's run on versus hasn't run on. Wait five minutes, I don't know if it just failed or never hit triggers."

**What:** Dashboard showing exactly what each workflow did—which records, when, successes, failures, links to both HubSpot record and AskElephant event.

**Why first:** Without visibility, admins can't debug. Without debugging, they can't improve. Without improvement, they abandon.

### Priority 2: Manual Enrollment/Test (Epic 2)

> "Part of the reason I haven't built a close won workflow is because to test something, I have to mark a stage as close won. So I'm triggering 40 other things."

**What:** Button to run a workflow on a specific record without meeting trigger criteria—like HubSpot's "Enroll" button. Doesn't trigger other HubSpot workflows.

**Why second:** Combined with visibility, admins can now iterate in hours instead of weeks.

### Priority 3: AI Context for CRM (Epic 3)

> "Having all context built into workflow builder so some RevOps leader just says 'I need close won analytics' and it executes the whole thing."

**What:** Workflow builder knows CRM-specific requirements. Uses correct tools automatically. Says "don't use this node for CRM" when appropriate. Knows which scopes/tools to use for each record type.

**Why third:** Reduces the 80+ hours of prompt engineering to minutes. Noxin stops creating broken workflows.

### Priority 4: Property Creation (Epic 4)

> "Those don't exist, would you like to create them? Yes. Sign in here, whatever."

**What:** Workflow builder reads existing HubSpot properties, suggests repurposing unused fields, only creates new when needed. Admin approves before creation.

> "Muddying someone's CRM is the worst thing we can do."

**Why fourth:** Completes the automated setup story. No more tab-switching to HubSpot to create fields.

---

## Epics (Prioritized)

### Epic 1: Workflow Execution Visibility (P0)

**As a** workspace admin,
**I want to** see exactly what each workflow did—which records, when, successes, failures,
**So that** I can debug issues and build confidence in the automation.

#### Acceptance Criteria

- [ ] List of all records a workflow ran on with timestamps
- [ ] Which records hit trigger but failed (with reason)
- [ ] Link to AskElephant event AND HubSpot record for each
- [ ] Filter by workflow, date range, success/failure
- [ ] Confidence score for each update
- [ ] Chat interface to ask "what happened?" about specific runs
- [ ] Alerts when something is broken

> "Any good workflow program on Earth has an audit history of what enrolled in the workflow. Why? What did it change?"

---

### Epic 2: Isolated Testing / Manual Enrollment (P0)

**As a** workspace admin,
**I want to** test a workflow on a specific record without triggering other HubSpot workflows,
**So that** I can iterate quickly without contaminating production data.

#### Acceptance Criteria

- [ ] "Enroll" button to manually run workflow on selected record
- [ ] Record selection from HubSpot (deals, contacts, companies)
- [ ] Runs as if record met trigger criteria (but didn't actually)
- [ ] Does NOT trigger other HubSpot workflows
- [ ] Option for dry run (show what would happen without executing)
- [ ] Results appear in visibility dashboard

> "What I prefer... test and have safeguards. I also want one where I can just say, run on this thing even though it doesn't meet the enrollment criteria."

---

### Epic 3: Admin Config Simplification / AI Context (P0)

**As a** workspace admin,
**I want to** describe my goal in natural language and have the workflow builder create the correct configuration,
**So that** I don't need 100 hours of prompt engineering to get it right.

#### Acceptance Criteria

- [ ] Workflow builder uses HubSpot Agent by default for CRM workflows
- [ ] Knows which scopes/tools to use for each record type automatically
- [ ] Warns against incompatible node combinations
- [ ] Natural language goal → complete workflow ("I need close won analytics")
- [ ] Identifies required fields
- [ ] Suggests templates for common use cases
- [ ] Clear guidance: "do not use this node" for incompatible scenarios

> "Noxin Workflow Builder creates horrible CRM workflows... we should fix that quickly before we just get a pile of trash to deal with."

---

### Epic 4: Intelligent Property Management (P1)

**As a** workspace admin,
**I want to** create or repurpose HubSpot properties from within the workflow builder,
**So that** I don't have to switch tabs and muddy my CRM with duplicate fields.

#### Acceptance Criteria

- [ ] Read existing HubSpot properties before suggesting creation
- [ ] Identify unused/repurposable fields
- [ ] Suggest: "These exist already. Want to use them?"
- [ ] Only create new if truly needed
- [ ] Admin approval required before property creation
- [ ] Auto-detect field type (rich text vs. multiline vs. boolean, etc.)
- [ ] Format outputs correctly (HTML for rich text, plain for multiline)

> "I wanted to read their HubSpot first. We are looking for these four fields. I see they have these ones already. Do you wanna repurpose those?"

---

### Epic 5: Admin Activity Dashboard (P1)

**As a** workspace admin,
**I want to** see a dashboard of all CRM agent activity across my organization,
**So that** I can identify issues, spot anomalies, and ensure data quality.

#### Acceptance Criteria

- [ ] All agent runs with timestamp
- [ ] Filter by agent/workflow type
- [ ] Filter by CRM tool (HubSpot, Salesforce)
- [ ] Drill into specific meeting that triggered update
- [ ] Proactive anomaly/trend detection
- [ ] Easy troubleshooting path to resolution
- [ ] Group related workflows together

---

### Epic 6: User Agent Communication Center (P2)

**As a** sales rep,
**I want to** see what the CRM agent did to my records,
**So that** I trust the automation and can address issues.

#### Acceptance Criteria

- [ ] See all agent actions on my records
- [ ] Human-in-the-loop requests surfaced
- [ ] Easy opt-out path
- [ ] Clear what data was modified
- [ ] Link to HubSpot record

---

### Epic 7: User Self-Service Automations (P2)

**As a** sales rep,
**I want to** build personal automations that only impact my data,
**So that** I can customize my workflow without admin involvement.

#### Acceptance Criteria

- [ ] Easy discovery of automation capabilities
- [ ] Scoped to own data only (not team-wide)
- [ ] Clear separation from admin-managed automations

---

### Epic 8: Proactive Anomaly Detection (P2)

**As a** workspace admin,
**I want to** receive proactive alerts about trends and anomalies,
**So that** I can address issues before they become problems.

#### Acceptance Criteria

- [ ] AskElephant surfaces unusual patterns
- [ ] Alerts for anomalies in agent behavior
- [ ] Recommendations for resolution

---

### Epic 9: Notification Engine Integration (P2)

**As a** user,
**I want to** receive notifications when agents complete or need input,
**So that** I stay informed without checking the app constantly.

#### Acceptance Criteria

- [ ] Slack message after agent runs
- [ ] Notification when approval needed
- [ ] Configurable notification preferences
- [ ] Action buttons in Slack for quick approval

---

### Epic 10: AI Config Assistant (P3 - Future)

**As a** workspace admin,
**I want to** describe my business goal and have AI create the complete automation setup,
**So that** I go from goal to working automation in minutes.

#### Acceptance Criteria

- [ ] "I need weekly close won/loss analytics sent to my board"
- [ ] AI identifies: fields needed, workflows, report format, schedule
- [ ] Creates everything with admin approval
- [ ] End-to-end from business goal to working automation

---

## Out of Scope (Not Q1)

Per strategic decision (2026-01-16):

- **CRM features in AskElephant app** - Users have HubSpot/Salesforce already
- **Company pages with property panels** - Future (year+) consideration
- **HubSpot app card** - Requires foundation work we don't have
- **Salesforce parity** - HubSpot first
- **Custom CRM object support** - After standard objects work
- **Full inbox for all notification types** - Separate initiative

## Technical Considerations

### For Visibility (Epic 1)

- Store workflow run history with record references
- Link to both HubSpot API IDs and AskElephant event IDs
- Real-time updates (WebSocket or polling)
- Search/filter across large run volumes

### For Manual Enrollment (Epic 2)

- Execute workflow actions without triggering HubSpot webhooks
- Isolate test runs from production automation
- Store test results separately for comparison

### For AI Context (Epic 3)

- Embed CRM-specific guidance in workflow builder prompts
- Default to HubSpot Agent for CRM operations
- Tool/scope routing based on record type

### For Property Management (Epic 4)

- HubSpot property creation scopes required
- Read existing properties before suggesting creation
- Property type inference and format handling

---

## Risks & Mitigations

| Risk                                      | Impact   | Likelihood | Mitigation                                      |
| ----------------------------------------- | -------- | ---------- | ----------------------------------------------- |
| Users abandon after first bad experience  | Critical | High       | Visibility + isolated testing before production |
| Trust loss spreads to entire platform     | Critical | High       | "Board-ready" data quality standard             |
| Testing contaminates production data      | Critical | High       | Manual enrollment without HubSpot triggers      |
| Workflow builder defaults to broken tools | High     | High       | AI context with correct defaults                |
| Property creation muddles CRM             | High     | Medium     | Read-before-create, admin approval              |
| Visibility data overwhelms                | Medium   | Medium     | Smart filtering, search, pagination             |

---

## Timeline

### Q1 2026 Focus

| Milestone                           | Date        | Status |
| ----------------------------------- | ----------- | ------ |
| PRD Updated with James's priorities | 2026-01-16  | ✅     |
| Research synthesis complete         | 2026-01-16  | ✅     |
| Epic 1 (Visibility) prototype       | TBD         | ⬜     |
| Epic 2 (Manual enrollment) design   | TBD         | ⬜     |
| Epic 3 (AI context) implementation  | TBD         | ⬜     |
| Epic 4 (Property management) design | TBD         | ⬜     |
| Slack HITL MVP                      | In Progress | 🔄     |
| Q1 scope complete                   | End Q1      | ⬜     |

### Future (Post-Q1)

- Epic 5-9: Activity dashboard, user comm center, self-service, anomaly detection, notifications
- Epic 10: Full AI config assistant
- Company pages in AskElephant
- HubSpot app card integration

---

## Open Questions (Answered)

| Question                                               | Answer (2026-01-16)                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Build CRM features in-app or focus on workflow config? | **Workflow config** - "I would put every penny towards experience of how someone interacts with workflows today" |
| What's the data quality standard?                      | **Board-ready** - "Every piece of data we push should be good enough to send to a board"                         |
| Why do users abandon?                                  | **Trust loss cascades** - "It's not lost in a single workflow. It's AskElephant's problem."                      |
| How do we enable testing?                              | **Manual enrollment** - Like HubSpot's "Enroll" button, without triggering other workflows                       |

## Remaining Open Questions

- [ ] What confidence threshold triggers HITL vs auto-approve?
- [ ] How do we surface anomalies without creating alert fatigue?
- [ ] What's the scope of "personal automations" for users?
- [ ] How do we handle multi-object workflows (deal + contact + company)?

---

_Last updated: 2026-01-16_
_Owner: Tyler_

## Related Documents

- [Research](./research.md) - Includes James's Priority Stack and synthesized feedback
- [HubSpot Agent Config UI PRD](../hubspot-agent-config-ui/prd.md)
- [Transcript: Internal Planning Session](../../signals/transcripts/2026-01-16-internal-crm-exp-ete-planning.md)
- [Design Brief](./design-brief.md)
- [Engineering Spec](./engineering-spec.md)
