# Research: CRM Experience End-to-End

## Summary

Comprehensive CRM agent experience from onboarding through daily use. This initiative covers the full user journey for both admins (RevOps) and end users (reps) from initial HubSpot setup through daily proactive engagement with the CRM agent.

## Sources

### Source 1: Product Planning Session

- **Date:** 2026-01-16
- **Participants:** Woody, Tyler, Bryan, Skylar
- **Related PRD:** [hubspot-agent-config-ui](../hubspot-agent-config-ui/prd.md)

### Source 2: User Story Brain Dump

- **Date:** 2026-01-16
- **Type:** Leadership user story walkthrough
- **Focus:** End-to-end CRM experience from admin and user perspectives

---

## Key Insights from User Story

### Admin Journey (RevOps/Partner)

#### Phase 1: Initial Setup & Onboarding

> "I log in to AskElephant. After I get some basic setup within the onboarding, I need to be able to set up my HubSpot and then immediately be able to set up some of the initial groundwork for the HubSpot agent to deliver some outcomes."

**Key requirements:**

1. **Education first** - User needs to understand how it works
2. **Specific examples** - Pre-built templates they can implement quickly
3. **Test & validate** - See actual output before committing
4. **Build confidence** - The key emotion is confidence that it will work

> "I want to be able to actually test and see an output so that I have confidence. That's the key there is I need the confidence of, k. I just got this set up, and it is actually going to work how I want it to work."

#### Phase 2: Initial Configuration

- Start with **one or just a handful of things first**
- Test on real data to build confidence
- Submit only after validation
- Transition to full management view

> "Once I do that and it really should be for probably one or just a handful of things first. I have the confidence. I submit it. It takes me to another page where I can see the full scope of it."

#### Phase 3: Daily Admin Operations

> "I see where those are. I can see that it's running, and then I can configure new ones."

**Day-to-day admin needs:**

1. **Alerts for broken things** - Proactive notification when something fails
2. **Activity logs** - Manual visibility into what's happening
3. **Trend detection** - AskElephant proactively surfaces anomalies
4. **Easy troubleshooting** - Quick path to resolution

> "I'm able to get alerts of if something is broken. I'm able to come in manually and see just activity logs and what's going on."

> "AskElephant is working with me and being proactive to help me understand trends, things that might not be that seem like they're anomalies."

### User Journey (Sales Rep)

#### Passive Engagement (Notifications)

> "Not even logging in, just in general. I should be getting Slack notifications if I want or desktop notifications."

**Notification channels:**

- Slack notifications
- Desktop notifications
- Configurable preferences

#### Active Engagement (In-App)

> "When I log in to AskElephant, I want a place where I can see the agent communicating to me. This is what I did."

**Agent communication types:**

1. **Human-in-the-loop** - Asking for permission
2. **Reporting** - Informing what was done
3. **Opt-out path** - "If you don't want that, then do something else"

#### Visibility Requirements (Both Admin & User)

> "For both the user and an admin, I should be to see everywhere that the HubSpot agent is touching, what data it's touching, where it's running."

**Visibility needs:**

- What data is being touched
- Where the agent is running
- Full audit trail

#### User Self-Service

> "For a user, I should still be able to go easily see how to build my own automations if I want it. That would only impact my own."

**User empowerment:**

- Build personal automations
- Scoped to own data only
- Easy discovery of capabilities

#### HubSpot Query Capability

> "It should be easy for me to query HubSpot and actually get accurate data, and be able to use that HubSpot data within my day to day."

**Query requirements:**

- Easy querying interface
- Accurate data retrieval
- Integration with daily workflows

---

## Key Decisions Made

### Decision 1: Palmer Working on Slack Human-in-the-Loop

**Status:** In Progress
**Details:**

> "What's now possible based off of what David and I finished last night is human in the loop through Slack. So if Palmer needs a brick to work on, that is a very small one to make it so after the agent runs, the human in the loop could then trigger a message to that user in Slack."

**Implications:**

- Slack as primary channel for HITL approvals
- Users can be notified where they already work
- Enables notification engine integration

### Decision 2: Notification Engine Integration

**Status:** Planned
**Details:**

> "There's also the notification engine we should point into... those notifications. Slack."

**Implications:**

- CRM agent connects to broader notification system
- Consistent notification experience across features

### Decision 3: Inbox Required for Agent Approvals

**Status:** Planned
**Details:**

> "The inbox. I think they have an inbox supposed to actually get stuff. It workflows better. It makes the agent runs better. Just being able to know what's happening when."

**Requirements:**

- Centralized inbox for human-in-the-loop approvals
- Filter workflows by tools used
- Aggregate view by user (users see only their own)
- Admin view sees all agents

---

## User Problems Identified

| Problem                            | Severity | Frequency  | Evidence                                                                                                                                     |
| ---------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| No confidence during setup         | High     | Common     | "I need the confidence of, k. I just got this set up, and it is actually going to work how I want it to work"                                |
| No visibility into agent actions   | High     | Common     | "I should be to see everywhere that the HubSpot agent is touching, what data it's touching"                                                  |
| No proactive anomaly detection     | High     | Common     | "AskElephant is working with me and being proactive to help me understand trends, things that might not be that seem like they're anomalies" |
| No centralized inbox for approvals | High     | Common     | "I want a place where I can see the agent communicating to me"                                                                               |
| Troubleshooting is difficult       | Medium   | Common     | "It should be very easy to troubleshoot if something is wrong and get to a resolution"                                                       |
| Can't query HubSpot easily         | Medium   | Common     | "It should be easy for me to query HubSpot and actually get accurate data"                                                                   |
| Users can't build own automations  | Medium   | Occasional | "I should still be able to go easily see how to build my own automations"                                                                    |

---

## User Story Walkthrough (From Earlier Session)

### Admin Onboarding Flow

1. **Connect CRM**: Select CRM type, sign in, connect
2. **Workspace Selection**: Handle multiple workspaces
3. **Scope Selection**: What are you trying to do? (3 options presented)
4. **Agent Introduction**: "Agents work after meetings, analyze conversations, populate CRM, read calls, decide updates, wait for you"
5. **Call Type Selection**: What call type? (e.g., Discovery call)
6. **Pre-built Workflows**: Default areas/workflows for that call type with on/off toggles

> "The cool thing about this is these are prebuilt workflows on our side that we know are necessary for that discovery call."

7. **Test on Real Data**: Pull in data, show confidence scores
8. **Review Low Confidence**: "Requires review" for items needing attention

### Admin Daily Use

- **Activity Log**: See what each agent did across all CRM automation
- **Filter by Agent/Tool**: Break down by different agents, filter by tools
- **Workflow Management**: See all workflows impacting HubSpot grouped together

> "As an admin, if I disagree with it, I will want to figure out how to edit or update or tell the agent what it did wrong so that way it makes improvements."

### User Daily Use

- Users see only their own agent runs (not other users')
- Aggregated activity view for self
- Inbox for approvals

---

## Key Quotes

**On Confidence (Critical Theme):**

> "I want to be able to actually test and see an output so that I have confidence. That's the key there is I need the confidence."

**On Proactive AI:**

> "AskElephant is working with me and being proactive to help me understand trends, things that might not be that seem like they're anomalies."

**On Agent Communication:**

> "I want a place where I can see the agent communicating to me. This is what I did. And if it's human in the loop asking for permission or it's just reporting."

**On Visibility:**

> "For both the user and an admin, I should be to see everywhere that the HubSpot agent is touching, what data it's touching, where it's running."

**On Admin Control:**

> "As an admin, I'm on full control. That's just my persona."

---

## Action Items

| Owner       | Task                                            | Timeline    |
| ----------- | ----------------------------------------------- | ----------- |
| Palmer      | Slack HITL notification after agent runs        | In Progress |
| Tyler/Bryan | Meet with James to define end-to-end experience | Today       |
| Team        | Design inbox experience                         | TBD         |
| Team        | Connect to notification engine                  | TBD         |
| Team        | Design admin activity dashboard                 | TBD         |
| Team        | Design user agent communication center          | TBD         |
| Team        | Design HubSpot query interface                  | TBD         |

---

## Dependencies

- HubSpot Agent Config UI (existing initiative)
- Notification Engine
- Inbox/Approval System
- Admin Onboarding
- Slack Integration

---

## Open Questions

1. What constitutes "success" for the CRM agent onboarding?
2. How do we handle companies vs contacts syncing?
3. Should we support deals as a first-class object?
4. What's the right level of admin control vs. opinionated defaults?
5. How do we surface anomalies and trends to admins?
6. What's the scope of "personal automations" for users?
7. How do we integrate HubSpot querying into daily workflows?

---

## Related Initiatives

- [hubspot-agent-config-ui](../hubspot-agent-config-ui/prd.md)
- Admin Onboarding
- Notification Engine (current/notification-engine)

---

## Synthesized Feedback from Multiple Sources

_Analysis conducted: 2026-01-16_
_Sources: Notion, User Interviews, Internal Research_

---

### Theme 1: Zero Visibility Into Agent Behavior (Critical)

**Frequency:** Every user | **Impact:** Trust erosion, feature abandonment

**Problem Signals:**

- Users turn off agents entirely when something unexpected happens because they can't debug it
- No audit trail of what enrolled in a workflow, why, or what changed
- "Black box" behavior makes RevOps governance impossible

**Verbatim Quotes:**

> "There is zero confidence that an admin or rep can find out why things were updated the way they were in the CRM and cannot therefore fix anything that's broken nor can they identify very quickly when and where things happen inside of AskElephant." — James Hinkson

> "Not seeing what happened is one of the bigger pains today." — James Hinkson

> "Any good workflow program on Earth has an audit history of what enrolled in the workflow. Why? What did it change?" — James Hinkson

**Mapped to Epic:** Epic 4 (Admin Dashboard) & Epic 5 (User Agent Hub)

---

### Theme 2: Testing Is Impossible (Critical)

**Frequency:** Every configuration | **Impact:** Late-night testing, CRM hygiene issues

**Problem Signals:**

- Only way to test is against production data
- Users resort to testing between 10PM-3AM when no one else is online
- No safe way to validate before deploying

**Verbatim Quotes:**

> "If I do get something built, testing is a nightmare. So I have to build it, and then I either have to go and trigger stuff en masse, which isn't great for my CRM hygiene, frankly, or I have to then just wait a bit." — James Hinkson

> "The only way they'll be able to do [testing] without this is what I did where it's between 10PM and 3AM when no one else is online, you're testing workflows, looking at the record in HubSpot, and going back and making changes one at a time." — James Hinkson

**Mapped to Epic:** Epic 2 (Confidence-Building) & Epic 3 (Initial Configuration)

---

### Theme 3: Configuration Takes Forever (Critical)

**Frequency:** Every setup | **Impact:** 100+ hours vs desired 50 minutes

**Problem Signals:**

- Complex prompt engineering required across multiple workflow nodes
- Users need ~100 hours to become proficient
- Partners abandon after first use due to complexity

**Verbatim Quotes:**

> "I'm probably like a hundred hours now of chatting with AskElephant to find out why something would or would not work every single time." — James Hinkson

> "It's this nightmare of a prompt that I spent forever putting together and lives in three or four different nodes in a single workflow." — James Hinkson

> "My goal is that this should take five minutes per node." — James Hinkson

**Desired State:** 5 minutes per node × 10 nodes = ~50 minutes total

**Mapped to Epic:** Epic 3 (Initial Configuration), Epic 7 (User Self-Service)

---

### Theme 4: Partners/Users Abandon After First Experience (Critical)

**Frequency:** Common | **Impact:** Trust in AskElephant as a whole is lost

**Problem Signals:**

- Users try agent twice, don't understand what it does, turn it off forever
- Trust loss spreads from specific feature to entire platform
- No recovery path once trust is broken

**Verbatim Quotes:**

> "We've had a lot of partners and clients who use the HubSpot agent, like, twice. It does something. They don't know what it does. So they turn it off and they'll never use it again." — James Hinkson

> "The trust isn't lost in a single workflow. It's not lost in the HubSpot agent. It's AskElephant's problem. Like, it's 'I don't trust AskElephant with my information or to manage my CRM.'" — James Hinkson

**Mapped to Epic:** Epic 1 (Onboarding), Epic 2 (Confidence-Building)

---

### Theme 5: CRM Workflow Accuracy Issues (Critical)

**Frequency:** Common | **Impact:** Core value prop fails when needed most

**Problem Signals:**

- Workflow builder defaults to legacy v2 HubSpot tools instead of modern agent
- CRM automation is biggest value prop but fails most often
- Inconsistent agent execution (runs only 1/5 of the time sometimes)

**Verbatim Quotes:**

> "If you don't tell it to use the HubSpot agent, it'll use the individual v2 HubSpot tools that don't actually work. You have to explicitly tell it, 'use the HubSpot agent.'" — Product Team

> "If we're like, 'you can build anything you want except what you most want,' that's gonna be a problem." — Product Team

> "This field right here, marketing attribution agent is part of the same workflow as all these, but it runs only a fifth of the time. And I don't know why." — James Hinkson

**Mapped to Epic:** Epic 3 (Initial Configuration), Epic 4 (Admin Dashboard)

---

### Theme 6: Complex Multi-Field Dependencies (High)

**Frequency:** Every advanced use | **Impact:** Forces workarounds

**Problem Signals:**

- Read-before-write logic requires prompt gymnastics
- Field dependencies spread across 3-4 workflow nodes
- Even engineering didn't know some workarounds were possible

**Verbatim Quotes:**

> "This thing, the closed date probability context—before this writes, it reads this, and then it also reads all of these, and then also reads all of these assessments before it updates this. And then once it does this, then it updates this." — James Hinkson

> "Digest the content already in the field in HubSpot. Or are there other fields that should be read before this gets updated?" — James Hinkson

**Mapped to Epic:** Epic 3 (Initial Configuration), Epic 7 (User Self-Service)

---

### Theme 7: Privacy & Security Vulnerabilities (Critical)

**Frequency:** Architectural risk | **Impact:** Potential customer trust erosion

**Problem Signals:**

- Easy to create surveillance-style workflows
- Users not notified when workflows process their data
- External notifications can expose private meeting content

**Verbatim Quotes:**

> "A workflow that listens to specific users' private calls and sends Slack DMs about them — without those users being notified." — Drew (demo video)

> "It's not necessarily the workflow builder that's a concern. It's the ease of access to a flawed system that we already have." — Product Team

**Mapped to Epic:** Epic 4 (Admin Dashboard), Epic 10 (CRM Querying)

---

### Theme 8: Cost & Token Exposure (Critical)

**Frequency:** Ongoing risk | **Impact:** Uncontrolled costs, resource drain

**Problem Signals:**

- No per-workspace or per-workflow token limits
- Users can create unlimited workflows with no cleanup incentive
- No alerts when workflows exceed cost thresholds

**Verbatim Quotes:**

> "Anybody can do that. I mean, they could just create piles of garbage workflows, and then they have no incentive to clean up after themselves because there's no limit on the workflows they can build." — Engineering

**Mapped to Epic:** Epic 4 (Admin Dashboard)

---

### Theme 9: Missing Post-Implementation Diagnostics (High)

**Frequency:** Every use | **Impact:** CSM dependency, incomplete adoption

**Problem Signals:**

- Users get 50-60% of the way with builder, then hit a wall
- Need CSM/support intervention to complete remaining work
- No workflow health monitoring or error diagnostics

**Verbatim Quotes:**

> "What I would really want is now the testing and actually getting it implemented. There's this tail-end process... That's still a very manual process." — Design Team

**Competitive Gap:**

- HubSpot provides reports showing which workflows have issues
- Zapier offers workflow health monitoring and error diagnostics
- AskElephant has no equivalent visibility

**Mapped to Epic:** Epic 4 (Admin Dashboard), Epic 8 (Proactive Anomaly Detection)

---

## Feature Requests Consolidated

### Data Fidelity (from Product Insights)

| Request                                           | Source            | Priority |
| ------------------------------------------------- | ----------------- | -------- |
| Custom object sync & workflow updates (HubSpot)   | Customer feedback | High     |
| Lead object access, stage progression             | Customer feedback | High     |
| Automated meeting disposition based on attendance | Customer feedback | Medium   |
| Record deep-link from item UI                     | Customer feedback | Medium   |
| Markdown-to-HubSpot HTML conversion               | Customer feedback | Medium   |
| Retry policies & error routing for API failures   | Customer feedback | High     |

### Configuration UI (from James Hinkson)

| Request             | Current State              | Desired State             |
| ------------------- | -------------------------- | ------------------------- |
| Select fields       | Write in prompt            | Dropdown from HubSpot     |
| Set instructions    | Embedded in massive prompt | Text box per property     |
| Read before write   | Prompt engineering         | Checkbox toggle           |
| Field dependencies  | Prompt gymnastics          | Visual selector           |
| Order of operations | Multiple nodes             | Single node with sequence |

---

## Risk Assessment

| Risk                                     | Probability | Impact   | Mitigation                                           |
| ---------------------------------------- | ----------- | -------- | ---------------------------------------------------- |
| Users abandon after first bad experience | High        | Critical | Epic 2 (Confidence-building with test-before-commit) |
| Trust loss spreads to entire platform    | High        | Critical | Epic 4 (Full audit trail and transparency)           |
| CRM workflow fails at scale              | Medium      | High     | Fix default tool selection in builder                |
| Privacy incident                         | Medium      | Critical | Epic 4 (Visibility controls), Notification engine    |
| Cost overrun from token usage            | Medium      | High     | Add guardrails and monitoring                        |

---

## James's Priority Stack (2026-01-16 Planning Session)

From internal planning session with James (RevOps), Tyler (PM), Brian (Engineering), Woody (Product), and Palmer (Engineering):

### Strategic Decision: Focus on Workflow Configuration, Not CRM Features

> "From where you're sitting, there's a fork in the road. Try to build out a CRM experience within AskElephant app or ease of configuration for workflows."
>
> "I would put every penny towards experience of how someone interacts with workflows today."

**Key Insight:** Users already have HubSpot/Salesforce. Don't replicate CRM features. Make automation configuration easy.

### James's 4 Priority Improvements (In Order)

| Priority | What                       | Why                                                                                                                                                       |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#1**   | **Workflow Visibility**    | "I would love to be able to see what deals it's run on versus hasn't run on. Wait five minutes, I don't know if it just failed or never hit triggers."    |
| **#2**   | **Manual Enrollment/Test** | "To test something, I have to mark a stage as close won/lost. So I'm triggering 40 other things just to test one workflow. Makes you wanna punch a baby." |
| **#3**   | **AI Context for CRM**     | "Having all context built into workflow builder so some RevOps leader just says 'I need close won analytics' and it executes the whole thing."            |
| **#4**   | **Property Creation**      | "Those don't exist, would you like to create them? Yes. Sign in here, whatever." Plus: "Muddying someone's CRM is the worst thing we can do."             |

### New Problem: Testing Causes Cascade Effects

> "Part of the reason I haven't built a close won close loss workflow is because to test something, I have to mark a stage as close won or lost. So I'm triggering like 40 other things just to test one workflow in AskElephant."

**Impact:** Testing contaminates production data and triggers unrelated workflows.

**Desired State:**

- Manual enrollment like HubSpot's "Enroll" button
- Select specific record, run workflow as if it met criteria
- Doesn't trigger other HubSpot workflows

### Validation of Current Approach

> "If I was to go to another company today and run RevOps and AskElephant were to never change, I would refuse to take the role if they didn't buy AskElephant because of the HubSpot agent workflow. Like, literally, it is not just good, it's great. The experience of using it is painful."

**Translation:** Core capability is differentiated. Problem is 100% experience.

### Data Quality as Non-Negotiable Standard

> "Every piece of data we push should have the standard of quality that when we send some report that's pulling the data that we're pushing to HubSpot. That should be good enough to send to a board."

> "Bad data is worse than no data because you're gonna double down on the wrong decision."

### Future State vs. Now

James outlined both:

1. **Future (Year+):** Company pages in AskElephant with properties panel, HubSpot app card showing what AE changed
2. **Now (Weeks):** Visibility, test/enroll, AI context, property creation

Team decision: Focus on "Now" improvements to workflow configuration experience.

---

## Sources

1. **Product Insights** - Notion (2025-11-20)
2. **Workflow Builder Eng & Design Concerns** - Notion (2025-12-04)
3. **Customer Feedback Prompts** - Notion (2025-12-06)
4. **CRM Agent Upgrades PRD** - Notion (2025-12-05)
5. **James Hinkson Interview** - pm-workspace-docs (2026-01-06)
6. **Leadership Brain Dump** - Internal session (2026-01-16)
7. **Internal CRM-EXP-ETE Planning Session** - pm-workspace signals (2026-01-16)

---

_Last updated: 2026-01-16_
