# Research: Agent Command Center

## Summary

Chat is the central surface where users configure their agents, manage workflows, review agent activity, and consume artifacts — all from a single place. This initiative merges four previously separate streams (CRM Experience E2E, Rep Workspace, Chief of Staff Hub, Chief of Staff Recap Hub) into one unified vision: **the chat-centric Agent Command Center**.

The core insight across all source initiatives: **AskElephant's automation capabilities are powerful but the experience of configuring, monitoring, and consuming agent output is fragmented, opaque, and trust-eroding.** Users bounce between workflow builders, settings pages, meeting pages, and scattered outputs. Chat should be the single orchestration layer.

**Merged from:**

- `crm-update-artifact` — Workflow visibility, testing, CRM config (P0, Build)
- `rep-workspace` — Deal-centric dashboard, pipeline view, self-coaching (P0, Build)
- `chief-of-staff-hub` — Daily proactive hub concept (Archived, empty)
- `chief-of-staff-recap-hub` — Recap artifacts, chat-based config, approvals (P2, Build)

---

## Primary Job-to-Be-Done

**When** I open AskElephant each day, **I want to** see what my agents have done, configure them through conversation, and consume polished artifacts — **so that** I can trust automation, take action on deals, and stop manually managing workflows.

---

## User Breakdown & Quantitative Context

| Persona      | Estimated % of Users | Key JTBD                                                                | Evidence Source                                    |
| ------------ | -------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Sales Rep    | ~45%                 | See deal context, consume recaps, take action on follow-ups, self-coach | Maple (Jared), Council of Product                  |
| RevOps/Admin | ~20%                 | Configure and monitor CRM agents, ensure data quality, troubleshoot     | James Hinkson (internal RevOps), planning sessions |
| Sales Leader | ~25%                 | Review team activity, approve high-risk actions, coach efficiently      | Rob Henderson, Sam Ho                              |
| CSM          | ~10%                 | Prep for calls, surface account risks, consistent recap delivery        | Chief-of-staff-recap-hub research                  |

---

## Evidence Synthesis (Cross-Initiative)

### Theme 1: Chat Should Be the Configuration Layer (Critical)

Users shouldn't have to navigate workflow builders and settings pages to configure agents. Configuration should happen through natural conversation.

> "Your settings are not toggles anymore...It's a chat...AI first." — Leadership (Product direction)

> "I don't want to click a meeting then a workflow out of a thousand workflows." — Sam Ho
> (`signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`)

> "Right now, to generate a meeting recap, you have to go to workflows..." — Tyler
> (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)

> "Having all context built into workflow builder so some RevOps leader just says 'I need close won analytics' and it executes the whole thing." — James Hinkson (CRM planning session)

**Sources:** CRM-ETE research, Chief-of-Staff Recap Hub research, Product Vision

---

### Theme 2: Zero Visibility into Agent Behavior (Critical)

Users can't see what agents do, can't debug failures, and lose trust entirely when something goes wrong.

> "There is zero confidence that an admin or rep can find out why things were updated the way they were in the CRM and cannot therefore fix anything that's broken nor can they identify very quickly when and where things happen inside of AskElephant." — James Hinkson

> "For both the user and an admin, I should be to see everywhere that the HubSpot agent is touching, what data it's touching, where it's running." — Woody (CRM user story)

> "Not seeing what happened is one of the bigger pains today." — James Hinkson

> "I want a place where I can see the agent communicating to me. This is what I did." — Woody (CRM user story)

**Sources:** CRM-ETE research (7 sources including James Hinkson interview, planning sessions)

---

### Theme 3: Testing and Configuration Takes Too Long (Critical)

Users invest 80-100 hours to configure a single workflow. Testing contaminates production data.

> "I'm probably like a hundred hours now of chatting with AskElephant to find out why something would or would not work every single time." — James Hinkson

> "To test something, I have to mark a stage as close won or lost. So I'm triggering 40 other things just to test one workflow. Makes you wanna punch a baby." — James Hinkson

> "My goal is that this should take five minutes per node." — James Hinkson

**Sources:** CRM-ETE research (James Hinkson interview, planning sessions)

---

### Theme 4: Need a Proactive Daily Hub (Critical)

Users want a single place that tells them what happened, what needs attention, and what's scheduled.

> "Tell me what you've done, what needs approval, and what's scheduled." — Rob Henderson
> (`signals/transcripts/2026-01-29-product-vision-robert-henderson.md`)

> "It gives us an anchor point of this is where you live. This is how we can demo it." — Council of Product (2026-01-24)

> "42% of churn is adoption failure." — Slack synthesis
> (`signals/slack/2026-01-26-14day-slack-synthesis.md`)

**Sources:** Chief-of-Staff Recap Hub research, Rep Workspace research, Council of Product

---

### Theme 5: Outputs Should Be Artifacts, Not Workflow Chat (Critical)

Workflow outputs should be polished, shareable artifacts — not buried in chat threads.

> "These workflows don't generate a chat. They generate artifacts." — Sam Ho
> (`signals/transcripts/2026-01-30-meeting-page-view-brainstorm.md`)

> "I go to this meeting... it's just a lot of things I could click here. There's a lot of options for me. Cannot have that." — Sam Ho

> "Chief of Staff… Meeting Summary, Meeting Prep, Daily Briefing, Daily Review, Weekly Reporting" — Sam Ho
> (`research/synthesis/2026-02-01-sam-slack-chief-of-staff-meeting-recap.md`)

**Sources:** Chief-of-Staff Recap Hub research, meeting page brainstorm

---

### Theme 6: Deal-Centric Workspace with Pipeline View (High)

Reps need their pipeline mirrored with AI context — not a generic dashboard.

> "One of the things that I'd be really keen on is one, just like a pipeline view of mirroring my HubSpot pipeline into, you know, AskElephant for me to very quickly start to say, hey. Cool. Let me hop in on, like, a per account basis or a per deal basis, and then start to see my transcription and actually talk with the the deal property in and of itself." — Jared Henriques, Maple

> "I am a sales team of one... I'm actually way more interested in coaching from the aspect of, like, cool. Pull out some the common questions that have been asked across all my transcripts." — Jared Henriques, Maple

**Sources:** Rep Workspace research (Maple customer validation, 2026-01-21)

---

### Theme 7: Approval Fatigue Is Trust-Eroding (High)

Constant approval requests train users to ignore automation rather than engage with it.

> "I hate that Cloud Code asks me all the time to approve X, Y, Z." — Sam Ho
> (`signals/transcripts/2026-01-29-product-conversation-sam-ho-skylar-sanford.md`)

> "It actually like requires a manual trigger to run where it should just happen before every single call..." — Tyler
> (`signals/transcripts/2026-01-28-tyler-sam-flagship-meeting-recap-ux.md`)

**Sources:** Chief-of-Staff Recap Hub research

---

### Theme 8: Trust Loss Cascades to Entire Platform (Critical)

When one agent fails and users can't debug it, they lose trust in AskElephant entirely — not just the one feature.

> "We've had a lot of partners and clients who use the HubSpot agent, like, twice. It does something. They don't know what it does. So they turn it off and they'll never use it again." — James Hinkson

> "The trust isn't lost in a single workflow. It's not lost in the HubSpot agent. It's AskElephant's problem. Like, it's 'I don't trust AskElephant with my information or to manage my CRM.'" — James Hinkson

**Sources:** CRM-ETE research

---

## User Problems Consolidated

| Problem                                                 | Severity | Frequency           | Source Initiatives     | Key Quote                                                             |
| ------------------------------------------------------- | -------- | ------------------- | ---------------------- | --------------------------------------------------------------------- |
| No centralized hub for agent activity                   | Critical | Every session       | All 4                  | "Tell me what you've done, what needs approval, and what's scheduled" |
| Agent configuration requires workflow builder expertise | Critical | Every setup         | CRM-ETE, CoS-Recap     | "100 hours of chatting with AskElephant"                              |
| Zero visibility into what agents did                    | Critical | Every session       | CRM-ETE, Rep-Workspace | "Zero confidence that an admin or rep can find out why"               |
| Testing contaminates production data                    | Critical | Every test          | CRM-ETE                | "Triggering 40 other things just to test one workflow"                |
| Workflow outputs buried in chat threads                 | Critical | Every meeting       | CoS-Recap              | "These workflows don't generate a chat. They generate artifacts"      |
| Meeting page cluttered with options                     | High     | Every meeting view  | CoS-Recap              | "It's just a lot of things I could click here. Cannot have that"      |
| Approval fatigue from constant requests                 | High     | Daily               | CoS-Recap              | "I hate that Cloud Code asks me all the time to approve X, Y, Z"      |
| No deal-centric workspace for reps                      | High     | Daily               | Rep-Workspace          | "Pipeline view mirroring HubSpot"                                     |
| Trust loss cascades to entire platform                  | Critical | After first failure | CRM-ETE                | "It's AskElephant's problem... I don't trust AskElephant"             |
| 42% churn from adoption failure                         | Critical | Ongoing             | CoS-Recap              | "42% of churn is adoption failure"                                    |
| Solo reps need self-coaching, not monitoring            | Medium   | Common              | Rep-Workspace          | "More self coaching than monitoring"                                  |

---

## Customer Validation Summary

| Source                          | Date                               | Type          | Validation Strength     | Key Finding                                            |
| ------------------------------- | ---------------------------------- | ------------- | ----------------------- | ------------------------------------------------------ |
| James Hinkson (Internal RevOps) | 2026-01-06, 2026-01-16             | Internal      | **Strong**              | CRM workflow config is painful; 4-priority stack       |
| Maple / Jared Henriques         | 2026-01-21                         | Customer      | **Strong** - unprompted | Pipeline view, deal-centric workspace, self-coaching   |
| Council of Product              | 2026-01-24                         | Stakeholder   | **Strong**              | Rep Workspace = #1 priority, viral anchor              |
| Sam Ho                          | 2026-01-28, 2026-01-29, 2026-01-30 | Stakeholder   | **Strong**              | Chat-based config, artifact-first, no workflow clutter |
| Rob Henderson                   | 2026-01-29                         | Stakeholder   | **Strong**              | Daily proactive hub, approval-by-exception             |
| 14-Day Slack Synthesis          | 2026-01-26                         | Internal data | **Medium**              | 42% adoption churn                                     |

---

## Feedback Plan

| Method             | Target Audience    | Timeline       | Owner  | Status                       |
| ------------------ | ------------------ | -------------- | ------ | ---------------------------- |
| Customer interview | Maple (Jared)      | Post-prototype | Tyler  | Not started                  |
| Internal testing   | Eileen (sales rep) | Post-prototype | Skylar | Completed (v1 rep workspace) |
| Stakeholder review | Sam, Rob           | Post-PRD       | Tyler  | Not started                  |
| RevOps validation  | James Hinkson      | Post-prototype | Tyler  | Not started                  |
| Usage analytics    | All users          | Post-launch    | Tyler  | Not started                  |

### Feedback Already Collected

- Maple: Unprompted validation of pipeline view + self-coaching (2026-01-21)
- Council of Product: Rep workspace = #1 priority (2026-01-24)
- James Hinkson: 4-priority stack for CRM config (2026-01-16)
- Sam Ho: Artifact-first, chat-based config, no workflow clutter (multiple sessions)
- Rob Henderson: Daily proactive hub (2026-01-29)

---

## Strategic Decision: Chat as the Unified Surface

The convergence point across all four initiatives is clear: **chat is the command center**. Instead of:

- A separate workflow builder for CRM config
- A separate rep dashboard
- A separate daily hub for approvals
- A separate meeting page for recaps

We build **one chat-centric experience** where users:

1. **Configure agents** through conversation ("set up my CRM agent for discovery calls")
2. **Monitor agent activity** in a proactive feed ("here's what I did today")
3. **Consume artifacts** as polished outputs (recaps, prep, coaching — not workflow chat)
4. **Approve actions** by exception (auto-run low-risk, surface high-risk only)
5. **Manage deals** with AI context (pipeline view with conversation history)

> "I would put every penny towards experience of how someone interacts with workflows today." — James Hinkson

---

## Open Questions

1. How does this relate to Global Chat technically? Is it the same surface or a new one?
2. What's the v1 scope — which personas do we serve first?
3. How do we migrate existing workflow users to the new chat-based configuration?
4. What auto-run thresholds are safe by persona for Day 1?
5. Should recap configuration be part of onboarding or triggered on first use?

---

## Related Initiatives

- [Global Chat](../global-chat/) — The underlying chat infrastructure
- [Composio Agent Framework](../composio-agent-framework/) — Agent execution layer
- [Admin Onboarding](../admin-onboarding/) — First-time setup experience

---

## Sources

1. CRM-ETE Research — James Hinkson interview (2026-01-06), Leadership brain dump (2026-01-16), Planning session (2026-01-16), Product Insights (2025-11-20), Workflow Builder Concerns (2025-12-04), Customer Feedback Prompts (2025-12-06), CRM Agent Upgrades PRD (2025-12-05)
2. Rep Workspace Research — Internal planning (2026-01-16), Maple customer validation (2026-01-21)
3. Chief-of-Staff Recap Hub Research — Sam Ho conversations (2026-01-28, 2026-01-29, 2026-01-30), Rob Henderson product vision (2026-01-29), 14-day Slack synthesis (2026-01-26)
4. Council of Product — Priority stack (2026-01-24)
5. Product Vision — Leadership direction on AI-first UX, chat-centric configuration

---

_Last updated: 2026-02-07_
_Owner: Tyler_
