# Agent Command Center - PRD

## Overview

The Agent Command Center is a chat-centric experience where users configure their agents, monitor agent activity, consume polished artifacts, and manage deals — all from a single surface. Instead of navigating between workflow builders, settings pages, meeting views, and scattered outputs, users interact through conversation. Chat is the command center.

This initiative merges four previously separate streams: CRM workflow configuration (CRM-ETE), rep dashboard (Rep Workspace), daily proactive hub (Chief-of-Staff Hub), and recap artifact delivery (Chief-of-Staff Recap Hub). The convergence point is clear: all four initiatives pointed at the same problem — **AskElephant's automation is powerful but the experience of configuring, monitoring, and consuming it is fragmented, opaque, and trust-eroding.**

> "Your settings are not toggles anymore...It's a chat...AI first." — Leadership (Product direction)

> "I would put every penny towards experience of how someone interacts with workflows today." — James Hinkson, Internal RevOps

## Outcome Chain

```
Chat becomes the single surface for agent configuration and output
  → so that users configure agents through conversation instead of workflow builders
    → so that time-to-value drops from 80+ hours to minutes
      → so that users trust automation and engage daily
        → so that adoption churn drops from 42% and retention increases
          → so that revenue expansion and NRR improve
```

## Problem Statement

### What problem?

Users have **no single place** to configure agents, see what they've done, or consume their output. Today's experience requires:

- **80-100 hours** in the workflow builder to configure a single CRM agent (James Hinkson)
- **Navigating through "a thousand workflows"** to find a meeting recap (Sam Ho)
- **Zero visibility** into what agents did or why they failed (James Hinkson)
- **Constant approval fatigue** that trains users to ignore automation (Sam Ho)
- **Testing that contaminates production data** by triggering 40+ unrelated workflows (James Hinkson)

The result: **42% of churn is adoption failure.** Users try an agent twice, it does something they don't understand, they turn it off and never come back. Trust loss cascades from a single feature to the entire platform.

> "The trust isn't lost in a single workflow. It's not lost in the HubSpot agent. It's AskElephant's problem. Like, it's 'I don't trust AskElephant with my information or to manage my CRM.'" — James Hinkson

### Who has it?

- **Sales Reps (~45%)** — Need deal context, recaps, and self-coaching without configuration overhead
- **RevOps/Admins (~20%)** — Need to configure, monitor, and troubleshoot CRM agents in minutes, not months
- **Sales Leaders (~25%)** — Need a daily hub with approvals, team visibility, and coaching tools
- **CSMs (~10%)** — Need consistent recap delivery and account risk surfacing

### Evidence

| Problem                               | Severity | Evidence                                                               |
| ------------------------------------- | -------- | ---------------------------------------------------------------------- |
| Configuration takes 80-100 hours      | Critical | James: "I'm probably like a hundred hours now"                         |
| Testing causes cascade effects        | Critical | James: "Triggering 40 other things just to test one workflow"          |
| Zero visibility into execution        | Critical | James: "Zero confidence that an admin or rep can find out why"         |
| Partners abandon after first use      | Critical | James: "Use it twice. Don't know what it does. Turn it off forever."   |
| Trust loss spreads to entire platform | Critical | James: "It's AskElephant's problem"                                    |
| Meeting page is cluttered             | High     | Sam: "It's just a lot of things I could click here. Cannot have that." |
| Approval fatigue                      | High     | Sam: "I hate that Cloud Code asks me all the time to approve"          |
| 42% adoption churn                    | Critical | Slack synthesis: "42% of churn is adoption failure"                    |
| No deal-centric workspace             | High     | Maple/Jared: "pipeline view mirroring HubSpot"                         |

## Target Personas

- [x] **Sales Representative** (Primary) - Daily user, deal context, recaps, self-coaching
- [x] **RevOps Admin/Partner** (Primary) - Agent configuration, monitoring, troubleshooting
- [x] **Sales Leader** - Daily hub, approvals, team coaching
- [x] **CSM** - Account prep, risk surfacing, recap consistency

## Success Metrics

| Metric                                 | Current           | Target           | Timeline |
| -------------------------------------- | ----------------- | ---------------- | -------- |
| Time to configure first agent          | ~80 hours         | < 10 minutes     | Q2 2026  |
| Daily hub engagement rate              | N/A               | > 50% DAU        | Q2 2026  |
| Adoption churn (failure to adopt)      | 42%               | < 25%            | Q3 2026  |
| Recap engagement (views within 24h)    | Unknown           | > 50%            | Q2 2026  |
| Time from failure to root cause        | Hours/days        | < 5 min          | Q2 2026  |
| Approval completion time (median)      | Unknown           | < 2 min          | Q2 2026  |
| Workflow test iterations (prod impact) | Contaminates data | Zero prod impact | Q2 2026  |
| Rep daily active usage                 | Unknown           | > 70%            | Q3 2026  |
| Data quality bar                       | Unknown           | Board-ready      | Q3 2026  |

## User Stories

### Epic 1: Chat-Based Agent Configuration (P0)

**As a** workspace admin,
**I want to** describe my automation goals in natural language and have AskElephant configure the right agents,
**So that** I don't need 100 hours of prompt engineering to get it right.

#### Acceptance Criteria

- [ ] User describes goal in chat: "I need CRM updates after discovery calls"
- [ ] Chat identifies required agent type, fields, and workflows
- [ ] Live preview shows what the agent would do before activation
- [ ] Configuration saves as a named agent visible in management view
- [ ] User can adjust agent config through follow-up conversation
- [ ] Templates available for common use cases (discovery, demo, close won/lost)
- [ ] Per-meeting-type templates with auto-detection and manual override
- [ ] Config changes are transparent, reversible, and auditable

---

### Epic 2: Agent Activity Feed & Visibility (P0)

**As a** user (any persona),
**I want to** see exactly what my agents did — which records, when, successes, failures,
**So that** I can trust automation and debug issues in minutes instead of days.

#### Acceptance Criteria

- [ ] Daily hub shows three buckets: **Done**, **Needs Approval**, **Scheduled**
- [ ] Each action card shows: summary, owner, rationale, source, confidence, timestamp
- [ ] Drill into any action to see before/after data, source meeting, confidence explanation
- [ ] Filter by: agent type, date range, status (success/failed/pending), persona
- [ ] Link to both CRM record AND AskElephant event for every action
- [ ] Alerts when something is broken or anomalous
- [ ] Admin sees all agents; users see only their own activity
- [ ] Full audit trail with export capability

---

### Epic 3: Artifact Delivery (Recaps, Prep, Coaching) (P0)

**As a** sales rep,
**I want to** see polished artifacts (recap, prep, coaching) on my meeting page — not buried in workflow chat,
**So that** I can quickly prepare for calls and share professional summaries.

#### Acceptance Criteria

- [ ] Meeting page defaults to clean recap summary (no workflow chip clutter)
- [ ] Tabs: Recap (default), Prep, Coaching — tabs appear only when content exists
- [ ] Recaps are polished, scannable, and shareable
- [ ] Feedback icon opens chat for in-place template edits
- [ ] Template changes apply to future recaps; optional regenerate for current
- [ ] Share modal: Slack, HubSpot, Teams, Email, Copy with preview
- [ ] Privacy status chip visible; share blocked while privacy is pending
- [ ] Pre-share checklist + explicit confirmation for external delivery

---

### Epic 4: Isolated Testing / Manual Enrollment (P0)

**As a** workspace admin,
**I want to** test an agent on a specific record without triggering other workflows or contaminating production data,
**So that** I can iterate quickly and build confidence before going live.

#### Acceptance Criteria

- [ ] "Test" button to run agent on selected record
- [ ] Record selection from CRM (deals, contacts, companies)
- [ ] Runs as if record met trigger criteria but doesn't actually trigger
- [ ] Does NOT trigger other CRM workflows
- [ ] Dry run option: show what would happen without executing
- [ ] Test results appear in activity feed, clearly labeled as test
- [ ] One-click to convert test config → production agent

---

### Epic 5: Deal-Centric Workspace (P1)

**As a** sales rep,
**I want to** see my pipeline mirrored in AskElephant with AI context per deal,
**So that** I can prep for meetings, track progress, and self-coach — all in one place.

#### Acceptance Criteria

- [ ] Pipeline view showing deals from CRM with status/stage
- [ ] Per-deal view: all meetings, transcripts, AI insights, agent activity
- [ ] Ask questions about a deal through chat ("what happened in the last Acme call?")
- [ ] Action items extracted from meetings, linked to deals
- [ ] Self-coaching insights: common questions, talk patterns, areas for improvement
- [ ] Account context visible when navigating between deals
- [ ] Company/account label in chat history for navigation

---

### Epic 6: Approval by Exception (P1)

**As a** user,
**I want to** only be asked to approve high-risk actions while low-risk actions auto-run,
**So that** I'm not overwhelmed with approval requests and can trust that routine work happens automatically.

#### Acceptance Criteria

- [ ] Risk tiers defined per persona and action type
- [ ] Low-risk actions auto-run with audit trail
- [ ] High-risk actions surface with rationale, receipts, and confidence indicator
- [ ] Users can adjust their own thresholds via chat
- [ ] Admin can set organizational default thresholds
- [ ] Undo window for auto-run actions (where possible)
- [ ] Audit log captures all approvals, auto-runs, and edits

---

### Epic 7: Proactive Anomaly Detection (P2)

**As a** workspace admin,
**I want to** receive proactive alerts about trends and anomalies in agent behavior,
**So that** I can address issues before they become problems.

#### Acceptance Criteria

- [ ] System detects unusual patterns in agent behavior
- [ ] Alerts surface in activity feed (not just email/Slack)
- [ ] Each alert explains: what happened, why it matters, recommended action
- [ ] Tunable thresholds to reduce false positives
- [ ] Alerts feel helpful, not alarming

---

### Epic 8: Intelligent Property Management (P2)

**As a** workspace admin,
**I want to** create or repurpose CRM properties from within chat,
**So that** I don't have to switch tabs or muddy my CRM with duplicate fields.

#### Acceptance Criteria

- [ ] Chat reads existing CRM properties before suggesting creation
- [ ] Identifies unused/repurposable fields
- [ ] Admin approval required before property creation
- [ ] Auto-detect field type and format
- [ ] "Muddying someone's CRM is the worst thing we can do" standard

---

## End-to-End Experience Design (REQUIRED)

### 1. Discovery -- How does the customer know this exists?

**For new users:** During onboarding, after CRM connection, AskElephant introduces the Command Center: "I can manage your CRM automation, prep you for meetings, and show you what's happening with your deals. Want me to set up your first agent?" The chat-first experience IS the product — there's no separate feature to discover.

**For existing users:** In-app banner on the old workflow builder: "You can now configure agents through chat. Try it." Changelog entry. Slack #product-updates post. Revenue team training deck covers the shift from builder to chat.

**For admins:** First login after launch shows guided tour of the new activity feed and chat-based config. CSM outreach for key accounts.

### 2. Activation -- How do they enable/configure without hand-holding?

Chat handles activation entirely. No settings page required.

1. Chat asks: "What types of meetings do you have?" (Discovery, Demo, Follow-up, etc.)
2. For each type, chat suggests a pre-built agent template with live preview
3. User reviews preview on a real recent meeting: "Here's what this would have done"
4. User adjusts via conversation: "Actually, don't include pricing details in the recap"
5. User activates: "Looks good, turn it on"

**Time to first value:** < 5 minutes from "set up my first agent" to active agent running.

**Admin variant:** Chat walks through CRM field mapping, reads existing properties, suggests configurations, tests on real data before activating. Target: 50 minutes for full CRM agent setup (vs. 80+ hours today).

### 3. Usage -- What does the first interaction look like?

**Next morning after activation:**

- User opens AskElephant → sees the daily hub with three buckets: Done (3), Needs Approval (1), Scheduled (2)
- "Done" shows: "Recap generated for Acme Discovery call" with link to polished artifact
- "Needs Approval" shows: "Update deal stage to Proposal? [Approve / Edit / Skip]"
- "Scheduled" shows: "Meeting prep generating for Widget Inc demo at 2pm"

**User clicks recap →** Clean meeting page with tabs: Recap | Prep | Coaching. Recap is polished and shareable. Feedback icon opens chat to adjust template.

**User asks chat:** "What happened in the last 3 Acme calls?" → Chat pulls deal context, meeting summaries, action items, and surfaces insights.

### 4. Ongoing Value -- What value do they get on day 2, week 2, month 2?

**Day 2:** Hub becomes daily habit. "Check what my agents did" replaces "manually update CRM."

**Week 2:** Agent accuracy improves from feedback. User adjusts templates via chat ("add competitive mention tracking to my discovery recaps"). Self-coaching insights start appearing: "You asked about budget in 80% of discovery calls but only 30% of demos."

**Month 2:** User has full pipeline view with AI context per deal. Agents handle routine CRM updates automatically. Admin sees organization-wide activity dashboard with anomaly detection. Data quality meets "board-ready" standard. User configures personal automations: "After every call with Acme, send a Slack summary to #acme-team."

**Compounding value:** Every meeting makes the system smarter. Deal context enriches over time. Template refinements compound. Agent accuracy improves via feedback loop.

### 5. Feedback Loop -- How do we know if this is working for them?

| Method                          | What It Measures                      | Cadence                  |
| ------------------------------- | ------------------------------------- | ------------------------ |
| Daily hub engagement rate       | Is the hub the daily entry point?     | Continuous (PostHog)     |
| Chat config completion rate     | Can users set up agents through chat? | Per setup (PostHog)      |
| Recap view rate within 24h      | Are artifacts being consumed?         | Per meeting (PostHog)    |
| Approval completion time        | Is approval-by-exception working?     | Per action (PostHog)     |
| Template edit frequency         | Are users refining their experience?  | Weekly (PostHog)         |
| Agent accuracy NPS              | Do users trust agent output?          | Monthly (in-app survey)  |
| Support ticket patterns         | Where are users getting stuck?        | Weekly (support tickets) |
| Churn reasons tagged "adoption" | Is adoption churn decreasing?         | Monthly (HubSpot)        |
| Time-to-first-agent metric      | How fast do new users activate?       | Per user (PostHog)       |

## Scope

### In Scope (v1)

- Chat-based agent configuration with templates and live preview
- Daily hub with Done / Needs Approval / Scheduled buckets
- Artifact views on meeting pages (Recap, Prep, Coaching tabs)
- Agent activity feed with full audit trail
- Isolated testing / manual enrollment for CRM agents
- Approval by exception with configurable thresholds
- Share modal for artifact delivery (Slack, CRM, Email)
- Privacy gating on external shares

### Out of Scope (v1)

- Full CRM feature replication in AskElephant (users have HubSpot/Salesforce)
- Company pages with property panels (future consideration)
- Mobile-native experience (web-first MVP)
- Advanced coaching analytics (separate initiative)
- Team-level approval routing
- Template inheritance (leader to rep)
- Real-time in-call summaries

### Future Considerations

- HubSpot app card integration
- Salesforce parity
- Custom CRM object support
- Template analytics and usage insights
- Team-level approval workflows
- Voice-based agent configuration
- Weekly executive rollup artifacts

## Design

### Architecture: Chat as Orchestration Layer

```
┌───────────────────────────────────────────────────────────────────┐
│                    Agent Command Center                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  CHAT (Primary Surface)                                      │ │
│  │  Configure | Ask | Review | Adjust                           │ │
│  │  "Set up my CRM agent for discovery calls"                   │ │
│  │  "What happened in the last Acme call?"                      │ │
│  │  "Change my recap template to include next steps"            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│         ┌─────────────────┼─────────────────┐                    │
│         ▼                 ▼                 ▼                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐         │
│  │ Daily Hub    │  │ Meeting     │  │ Deal Workspace   │         │
│  │             │  │ Page        │  │                  │         │
│  │ Done        │  │ Recap tab   │  │ Pipeline view    │         │
│  │ Approval    │  │ Prep tab    │  │ Per-deal context │         │
│  │ Scheduled   │  │ Coaching    │  │ Action items     │         │
│  └─────────────┘  └─────────────┘  └─────────────────┘         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ADMIN LAYER (RevOps/Leaders only)                           │ │
│  │  Activity Dashboard | Anomaly Alerts | Policy Management     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### User Flow

```
User opens AskElephant
  ├── New user → Chat onboarding ("What meetings do you have?")
  │   ├── Template selection with live preview
  │   ├── Test on real meeting data
  │   └── Activate → Daily hub appears
  │
  ├── Returning user → Daily Hub
  │   ├── Done → Click to see artifact (recap, prep)
  │   ├── Needs Approval → Quick approve/reject/edit
  │   ├── Scheduled → Preview upcoming actions
  │   └── Chat → Ask anything about deals or agents
  │
  └── Admin → Management Dashboard
      ├── All agent activity across organization
      ├── Anomaly alerts with recommended actions
      ├── Test agents on specific records
      └── Chat → Configure agents, adjust thresholds
```

### Wireframes/Mockups

<!-- Link to Figma or embed screenshots — to be created -->

### Prototype

<!-- To be created in prototypes/AgentCommandCenter/ -->

## Technical Considerations

- **Global Chat dependency** — Agent Command Center chat may be the same surface as Global Chat or a specialized view. Requires alignment with Global Chat initiative.
- **Real-time updates** — Activity feed needs WebSocket or polling for live status
- **CRM integration** — HubSpot API for pipeline view, property management, record search
- **Agent execution** — Composio framework for running agents
- **Artifact rendering** — Template engine for generating polished recaps, prep docs
- **Audit logging** — Comprehensive logging for all agent actions, approvals, config changes
- **Privacy gating** — Privacy Determination Agent must classify before external shares
- **Isolated testing** — Execute agents without triggering CRM webhooks

## Dependencies

- **Global Chat** — Chat infrastructure and AI intent recognition
- **Composio Agent Framework** — Agent execution and tool access
- **Admin Onboarding** — CRM connection and initial setup flow
- **Privacy Determination** — Share guardrails for artifacts
- **HubSpot/Salesforce integrations** — CRM data, property management
- **Meeting type detection** — Auto-selecting templates per call type

## Risks & Mitigations

| Risk                                       | Impact   | Likelihood | Mitigation                                                           |
| ------------------------------------------ | -------- | ---------- | -------------------------------------------------------------------- |
| Chat can't handle config complexity        | Critical | Medium     | Fallback to workflow builder for power users; progressive disclosure |
| Users abandon after first bad agent output | Critical | High       | Isolated testing, confidence scores, easy rollback                   |
| Trust loss cascades to entire platform     | Critical | High       | Full audit trail, transparency, "board-ready" data standard          |
| Scope too large for single initiative      | High     | High       | Phase by epic: E1-E4 (P0) first, E5-E8 (P1-P2) later                 |
| Global Chat not ready                      | High     | Medium     | Build chat-config as standalone first, integrate later               |
| Approval thresholds set wrong              | Medium   | Medium     | Conservative defaults, user-adjustable, audit trail                  |
| Artifact quality inconsistent              | Medium   | Medium     | Templates with live preview, feedback loop for refinement            |

## Strategic Alignment

- [x] Clear outcome chain: Chat config → faster setup → trust → adoption → retention → revenue
- [x] Evidence exists: 7+ sources including customer (Maple), internal RevOps (James), leadership (Sam, Rob, Woody)
- [x] Specific personas identified: Reps, RevOps, Leaders, CSMs
- [x] Not in anti-vision territory: Orchestrating human outcomes, not replacing judgment
- [x] Trust/privacy implications considered: Privacy gating, audit trails, approval by exception
- [x] End-to-end experience: All 5 steps addressed (Discovery, Activation, Usage, Ongoing Value, Feedback)
- [x] Feedback method defined: PostHog analytics + monthly in-app NPS + support ticket patterns
- [x] Ownership assigned: Tyler (PM)

## Timeline

### Milestones

| Milestone                     | Date       | Status |
| ----------------------------- | ---------- | ------ |
| Research consolidated (merge) | 2026-02-07 | ✅     |
| PRD complete                  | 2026-02-07 | ✅     |
| Design brief                  | TBD        | ⬜     |
| Prototype v1                  | TBD        | ⬜     |
| Stakeholder review (Sam, Rob) | TBD        | ⬜     |
| Engineering spec              | TBD        | ⬜     |
| Development start             | TBD        | ⬜     |
| Beta                          | TBD        | ⬜     |
| GA                            | TBD        | ⬜     |

## Launch Materials Needed

- [ ] Revenue team training deck (chat-based config demo)
- [ ] Help center article (getting started with Agent Command Center)
- [ ] Changelog entry (merging old experiences into unified chat)
- [ ] In-app announcement / guided tour for existing users
- [ ] Slack #product-updates post
- [ ] Customer communication for key accounts (migration from workflow builder)
- [ ] Demo script for sales: "This is where you live"

## Open Questions

- [ ] Is the Agent Command Center chat the same surface as Global Chat, or specialized?
- [ ] Which persona is v1 primary: reps (deal context) or admins (config)?
- [ ] What auto-run thresholds are safe by persona for Day 1?
- [ ] How do existing workflow builder users migrate to chat-based config?
- [ ] Should recap configuration happen during onboarding or on first use?
- [ ] What's the minimum viable artifact set for Day 1?
- [ ] How does the pipeline view technically pull from HubSpot/Salesforce?

---

## Related Documents

- [Research](./research.md) - Consolidated from 4 initiatives
- [Decisions](./decisions.md) - Decision log with rationale
- [Global Chat](../global-chat/) - Chat infrastructure dependency
- [Composio Agent Framework](../composio-agent-framework/) - Agent execution layer
- [Admin Onboarding](../admin-onboarding/) - First-time setup

## Predecessor Initiatives (Archived)

- [CRM Experience E2E](../../archived/crm-update-artifact/) - Workflow visibility, testing, CRM config
- [Rep Workspace](../../archived/rep-workspace/) - Deal-centric dashboard, pipeline view
- [Chief of Staff Hub](../../archived/chief-of-staff-hub/) - Daily proactive hub concept
- [Chief of Staff Recap Hub](../../archived/chief-of-staff-recap-hub/) - Recap artifacts, chat-based config

---

_Last updated: 2026-02-07_
_Owner: Tyler_
