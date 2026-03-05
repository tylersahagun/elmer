# Customer Voice Consolidation Audit & Implementation Plan

**Date:** February 27, 2026  
**Author:** Tyler Sahagun  
**Status:** Read-Only Research & Planning  
**Objective:** Consolidate all customer feedback channels into Linear as the single source of truth, with AskElephant workflows automating intake and triage.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State: Slack Audit](#current-state-slack-audit)
3. [Current State: Linear Audit](#current-state-linear-audit)
4. [Gap Analysis](#gap-analysis)
5. [Recommended Architecture](#recommended-architecture)
6. [Implementation Plan](#implementation-plan)
7. [Operational Cadences](#operational-cadences)
8. [Appendices](#appendices)

---

## Executive Summary

Customer voice is currently fragmented across **15+ active Slack channels**, a manual triage process, and a partially-configured Linear workspace. The core problem: there is no single view of "what are customers actually requesting and how impactful is each request?"

**Key findings:**
- **69 product-related Slack channels** exist (41 active, 28 archived), with feedback scattered across `#product-requests`, `#product-issues`, `#product-forum`, `#voice-of-the-customer`, `#customer-feedback`, `#partner-bugs-and-issues`, and many external customer channels
- **Linear has 4 teams** but the **Requests team** (key: `REQUEST`) is underutilized -- only 1 member (Tyler), 0 projects, though it has the correct triage workflow states
- **The Product team** (key: `EPD`) has 34 projects but no structured feedback-to-project linking
- **Customer Requests** is enabled but lacks systematic intake automation
- **13 initiatives** exist but most lack clear customer-feedback linkage

**Recommendation:** Transform the existing `Requests` team into a fully automated product feedback hub, with AskElephant workflows routing Pylon, email, Slack, and conversation signals directly into Linear. Bugs route to `Development` (ASK), feature requests route to `Requests` (REQUEST) -> triaged to `Product` (EPD) projects.

---

## Current State: Slack Audit

### Total Workspace Inventory
- **363+ total channels** across the AskElephant Slack workspace
- **41 active product-related channels**
- **28 archived product-related channels**
- **~148 active non-product channels** (ext-customer channels, team channels, etc.)

### Product Signal Channels (Active)

#### Primary Feedback Channels
| Channel | Members | You're In | Purpose |
|---------|---------|-----------|---------|
| `#product-requests` | 34 | Yes | Feature requests (manual workflow to Linear) |
| `#product-issues` | 52 | Yes | Bug reports and product issues |
| `#product-forum` | 40 | Yes | Open discussion about product experience |
| `#voice-of-the-customer` | 20 | Yes | Customer voice aggregation |
| `#customer-feedback` | 25 | Yes | General customer feedback |
| `#product-updates` | 38 | Yes | Sharing product changes and releases |
| `#product-learnings` | 6 | No | Resources and learnings |
| `#product-marketing-updates` | 27 | Yes | PMM updates |
| `#product-bounty` | 4 | No | Product bounties |
| `#council-of-product` | 12 | Yes | Private product council |

#### Customer & Revenue Signal Channels
| Channel | Members | You're In | Purpose |
|---------|---------|-----------|---------|
| `#customer-quotes` | 40 | Yes | Notable customer quotes |
| `#customer-message-queue` | 18 | No | Customer message queue |
| `#customer-questions-for-blogs` | 4 | No | Blog content from customers |
| `#churn-alert` | 40 | Yes | Churn risk signals |
| `#partner-feedback` | 5 | No | Partner feedback |
| `#partner-bugs-and-issues` | 18 | Yes | Partner bug reports |
| `#notetaker-issue-quotes` | 10 | No | Notetaker-specific issues |
| `#support-chat-log` | 9 | No | Support conversation logs |

#### Request & Triage Channels
| Channel | Members | You're In | Purpose |
|---------|---------|-----------|---------|
| `#askelephant-internal-workflow-requests` | 24 | Yes | Internal AskElephant workflow requests |
| `#solution-request` | 19 | Yes | Solution requests |
| `#agent-requests` | 10 | No | Agent ideas and requests |
| `#access-requests` | 48 | Yes | Access requests |
| `#demo-request` | 9 | No | Demo requests |

#### Engineering & Ops
| Channel | Members | You're In | Purpose |
|---------|---------|-----------|---------|
| `#incidents` | 47 | Yes | incident.io announcements |
| `#team-dev` | 28 | Yes | Dev team |
| `#team-dev-code-review` | 25 | Yes | Code reviews |
| `#epd-all` | 30 | Yes | All EPD |
| `#bug-bounty` | 14 | No | Bug bounty |
| `#design-ux` | 20 | Yes | Design and UX |

#### Integration & HubSpot
| Channel | Members | You're In | Purpose |
|---------|---------|-----------|---------|
| `#internal-hubspot-agent` | 17 | Yes | Internal HubSpot Agent |
| `#hubspot-partners` | 15 | No | HubSpot partner ecosystem |
| `#index-feedback-all` | 1 | No | Aggregated feedback index |

#### External Customer Channels (Active, 20+)
Notable: `#ext-kixie-askelephant`, `#ext-newbreed-askelephant`, `#ext-saleslift`, `#ext-finally-askelephant`, `#ext-tilt-askelephant`, `#askelephant-strivepharmacy`, etc.

These are shared Slack channels with individual customers -- a significant but scattered source of direct feature requests and bug reports.

### Channel Overlap & Redundancy Issues

**Problem 1: Fragmented feedback paths.** A customer request could land in any of:
- `#product-requests` (general feature requests)
- `#product-forum` (open discussion)
- `#voice-of-the-customer` (customer voice)
- `#customer-feedback` (general feedback)
- `#partner-feedback` (partner-specific)
- `#solution-request` (solutions)
- `#agent-requests` (agent ideas)
- Any `#ext-*` customer channel

**Problem 2: Bug reports split across:**
- `#product-issues` (product bugs)
- `#partner-bugs-and-issues` (partner bugs)
- `#incidents` (operational incidents)
- `#notetaker-issue-quotes` (notetaker bugs)
- `#bug-bounty` (security bugs)

**Problem 3: No systematic routing.** Messages in these channels require manual copy/paste into Linear. There's no automation ensuring every actionable signal gets captured.

---

## Current State: Linear Audit

### Team Structure

| Team | Key | Members | Projects | Triage Enabled | Purpose |
|------|-----|---------|----------|----------------|---------|
| **Requests** | `REQUEST` | 1 (Tyler) | 0 | Yes | Product feedback triage |
| **Product** | `EPD` | 5 | 34 | Yes | Product management |
| **Development** | `ASK` | 15 | 50 | Yes | Engineering |
| **IT** | `IT` | 1 (Kaden) | 0 | Yes | IT operations |

### Requests Team (REQUEST) - Workflow States
This team has the right bones but is currently empty:

| State | Type | Purpose |
|-------|------|---------|
| **Triage** | triage | Incoming, unreviewed requests |
| **Needs Info** | unstarted | Requires additional context |
| **Backlog** | backlog | Reviewed but not yet scheduled |
| **Validated** | started | Confirmed as valid need |
| **Ready for Engineering** | started | Spec'd and ready to build |
| **Shipped** | completed | Feature delivered |
| **Done** | completed | Request resolved |
| **Won't Do** | canceled | Declined |

### Requests Team - Labels (Product Areas & Types)
Well-structured label taxonomy already exists:

**Type labels:** `bug`, `feature-request`, `improvement`, `question`, `spike`, `initiative`  
**Product Area labels:** `area/mobile-desktop`, `area/platform`, `area/integrations`, `area/automations`, `area/insights-search`, `area/conversations`  
**Stage labels:** `stage:alpha`, `stage:invite-beta`, `stage:open-beta`, `stage:ga`  
**Cross-team labels:** `needs-rev-team`, `needs-design`

### Product Team (EPD) - Key Projects

#### Active/Started Projects on Product Team
- Chief of Staff Agent (Project Babar)
- Chief-of-Staff Hub
- Onboarding v2 (carousel & seeding)
- Desktop App
- Salesforce Integration
- Support Process
- Billing & Pricing
- Training & Enablement
- Website
- Sales Process
- Google Drive Integration
- Notion Integration
- Microsoft Teams Integration
- Zoom Integration
- Slack Integration
- HubSpot Integration
- Integrations (General)
- Meeting Prep
- Onboarding & Activation
- Security & Compliance
- Performance & Reliability
- Mobile Experience
- Super Admin

#### Active/Started Projects on Development Team (ASK)
- Conversation-Level Analytics Metadata (Palmer)
- Company Normalization & Deduplication (Jason)
- CRM Object Association (Bryan)
- Speaker Identity Resolution (Dylan)
- Chat (Dylan)
- Public API (Kaden)
- Agent Devboxes (Kaden)
- Usage Dashboard (Kaden)
- Tools Autopilot / Composio (Kaden)
- MCP Server (Kaden)
- Product Clarity & Communication (Jason)
- SOC 2 (Bryan)
- Design System v2 (Jason)
- Edge State (Bryan)
- Speaker Identification via Voiceprinting (Dylan)
- Mobile v2 - Redesign (Eduardo)
- Settings Refresh (Jason)
- Universal Signals (Dylan)

### Linear Initiatives (13 total)

| Initiative | Status | Owner | Projects | Target |
|-----------|--------|-------|----------|--------|
| Save Redo | Active | -- | 7 | 2026-03-20 |
| 2026 Hackathon | Active | Bryan | 1 | -- |
| Quality & Reliability | Active | Ivan | 0 | -- |
| CRM Data Confidence | Active | -- | 2 | -- |
| Trust | Active | -- | 6 | -- |
| Data | Active | -- | 1 | -- |
| Quality Improvement | Active | Bryan | 1 | 2025-12-31 |
| 10-Week EOY Sprint | Active | Bryan | 1 | 2025-11-14 |
| Develop extensible agent arch | Active | Kaden | 5 | 2025-09-30 |
| Streamlined Workflow Builder | Completed | Sam | 0 | 2025-09-30 |
| Reduce churn (notetaker) | Completed | Sam | 2 | 2025-12-31 |
| Reduce time to value | Completed | Sam | 0 | 2025-09-30 |
| Trust (planned) | Planned | -- | 0 | -- |

### Customer Requests Feature Status
Customer Requests is enabled at the workspace level. Key observations:
- The `Requests` team exists as the designated receiver for new customer request issues
- Labels for `feature-request`, `bug`, `improvement`, and product areas are in place
- But: **no automated intake** is routing requests from Pylon, AskElephant, or Slack
- But: **no customer entities** appear to be systematically created or linked
- But: **the Requests team has 0 projects** -- meaning feedback can't be linked to active work

---

## Gap Analysis

### What's Missing

| Gap | Current State | Desired State | Impact |
|-----|--------------|---------------|--------|
| **Automated intake** | Manual Slack -> Linear copy | AskElephant workflow auto-creates issues | Eliminates lost signals |
| **Duplicate detection** | None | Auto-merge duplicates, increment count | Reveals true demand signal |
| **Customer entity linking** | Not systematically used | Every request links to customer + MRR | Revenue-weighted prioritization |
| **Bug vs Request routing** | Both land in same channels | Bugs -> ASK triage, Requests -> REQUEST triage | Clear ownership |
| **Project linkage** | Requests team has 0 projects | Each validated request links to EPD project | Feedback traces to roadmap |
| **Revenue visibility** | No MRR on requests | Customer revenue attached to each request | Prioritize by impact |
| **Pylon integration** | Pylon -> Slack (manual) | Pylon -> Linear (automated) | Support signals captured |
| **Email intake** | Gmail manual review | Gmail -> AskElephant -> Linear | Email signals captured |
| **Conversation intake** | Transcripts in PM workspace | AskElephant transcript -> Linear issues | Meeting signals captured |
| **Feedback-to-initiative mapping** | Ad hoc | Structured triage -> project -> initiative | Strategic alignment |

### What's Working Well
- **Label taxonomy is solid** -- Product Area and Type labels are well-designed
- **Workflow states are well-designed** -- Triage -> Needs Info -> Backlog -> Validated -> Ready for Engineering -> Shipped
- **Team structure makes sense** -- REQUEST for intake, EPD for product management, ASK for engineering
- **Initiatives exist** though they need customer feedback linkage
- **PM workspace has signal processing infrastructure** -- `signal-router.py`, `linear_notion_triage.py`, routing config

---

## Recommended Architecture

### The Flow: Customer Signal -> Linear Issue -> Project -> Initiative

```
INTAKE SOURCES                    AskElephant              LINEAR
─────────────────                 ─────────                ──────

Pylon (help desk)  ──┐
                     │
Gmail (email)      ──┤
                     ├──> AskElephant ──> Feature Request? ──> REQUEST team (Triage)
Slack channels     ──┤    Workflow        │                         │
                     │                    │                    Triage Captain
AskElephant Chat   ──┤                    │                    reviews weekly
                     │                    │                         │
Transcripts        ──┘                    │                    ┌────┴────┐
                                          │                    │         │
                                          │               Validated   Won't Do
                                          │                    │
                                          │              Link to Project
                                          │              (EPD team)
                                          │                    │
                                          │              Link to Initiative
                                          │
                                          └──> Bug Report? ──> ASK team (Triage)
                                                                   │
                                                              Dev fixes it
                                                                   │
                                                              Shipped / Done
```

### Linear Structure (Recommended)

#### Requests Team (REQUEST) - The Product Feedback Hub

**Purpose:** Single triage inbox for ALL product feedback. No feature request or improvement should bypass this team.

**Workflow:**
1. **Triage** - New requests land here automatically from AskElephant workflows
2. **Needs Info** - Request requires clarification from customer or internal team
3. **Backlog** - Valid request, not yet prioritized
4. **Validated** - Confirmed customer need with sufficient detail
5. **Ready for Engineering** - Linked to EPD project, spec'd for development
6. **Shipped** - Feature has been delivered
7. **Won't Do** - Declined with explanation

**Required fields on acceptance:**
- Priority (Urgent / High / Medium / Low / None)
- Product Area label (area/*)
- Type label (feature-request, improvement, bug, question)
- Customer link (via Customer Requests feature)

**Members to add:** Product team members (Sam, Matt Bennett, Ivan) should join as reviewers. Tyler remains primary triage captain.

#### Product Team (EPD) - Strategic Planning

**Purpose:** Product management, project planning, and roadmap execution. Issues move here FROM Requests when they're validated and ready for project scoping.

**Projects structure (recommended product pillars):**
- **Conversations** - Meeting recording, notetaking, transcription
- **Integrations** - CRM, Slack, Zoom, Teams, Google, Salesforce, etc.
- **Automations** - Workflows, agents, actions
- **Platform** - APIs, MCP, security, compliance, billing
- **Insights & Search** - Analytics, search, data intelligence
- **Mobile & Desktop** - Mobile app, desktop app experience
- **Onboarding & Activation** - First-run experience, training

These align with your existing `area/*` labels and represent the product's major surfaces.

#### Development Team (ASK) - Engineering Execution

**Purpose:** Engineering implementation. Issues arrive from EPD projects when ready to build. Bug reports from AskElephant workflows route directly here.

### AskElephant Workflow Configuration (Conceptual)

#### Workflow 1: Feature Request Intake
```
Trigger: Feature request detected in Pylon / Chat / Email / Slack
Action:
  1. Check Linear for duplicate (search by title + description similarity)
  2. If duplicate found:
     - Add Customer Request to existing issue
     - Increment request count
     - Link source (Pylon ticket, email, Slack message, transcript)
  3. If new:
     - Create issue in REQUEST team with Triage state
     - Attach Customer Request with customer name, MRR, source link
     - Apply Type: feature-request label
     - Auto-suggest Product Area label based on content
```

#### Workflow 2: Bug Report Intake
```
Trigger: Bug report detected in Pylon / Chat / Email / Slack
Action:
  1. Create issue in ASK team with Triage state
  2. Apply Type: bug label
  3. Attach source link and customer context
  4. If severity is critical, set priority to Urgent
```

#### Workflow 3: Duplicate Merging
```
Trigger: New request matches existing issue (> 80% similarity)
Action:
  1. Add new customer's request as Customer Request on existing issue
  2. Post comment with new signal source and context
  3. Notify triage captain of merged request
```

### Slack Channel Consolidation Plan

#### Keep (Primary channels)
| Channel | New Role | Action |
|---------|----------|--------|
| `#product-forum` | Internal product discussion | Keep as-is, not a signal source |
| `#product-updates` | Release announcements | Keep as-is |
| `#product-learnings` | Learning sharing | Keep as-is |
| `#incidents` | Ops incidents | Keep, separate from product bugs |
| `#team-dev` | Dev discussion | Keep as-is |
| `#epd-all` | EPD coordination | Keep as-is |

#### Consolidate (Merge into automated Linear flow)
| Channel | Current Use | Recommendation |
|---------|------------|----------------|
| `#product-requests` | Feature requests | **Archive after AskElephant workflow is live.** All requests flow through AskElephant -> Linear REQUEST team. Keep a `#linear-requests-feed` channel that mirrors new REQUEST issues for visibility. |
| `#product-issues` | Bug reports | **Archive after AskElephant workflow is live.** Bugs flow through AskElephant -> Linear ASK team. Keep `#linear-bugs-feed` for visibility. |
| `#voice-of-the-customer` | Customer voice | **Archive.** Customer voice is captured via Customer Requests in Linear, visible on customer pages. |
| `#customer-feedback` | General feedback | **Archive.** Feedback goes through AskElephant -> Linear. |
| `#partner-feedback` | Partner feedback | **Archive.** Route through same pipeline with "partner" tag. |
| `#solution-request` | Solution requests | **Archive.** These are feature requests by another name. |
| `#agent-requests` | Agent ideas | **Archive.** Route through REQUEST team with `area/automations` label. |

#### Monitor but Don't Change
| Channel | Reason |
|---------|--------|
| `#churn-alert` | Critical business signal, different workflow |
| `#customer-quotes` | Marketing/sales use case, not feedback pipeline |
| `#internal-hubspot-agent` | Separate CRM agent workflow |
| `#ext-*` channels | Customer relationship channels; use Linear Asks to create issues from conversations |
| `#partner-bugs-and-issues` | Keep until AskElephant handles partner bug routing |

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

**Goal:** Configure Linear as the destination before turning on any automation.

1. **Staff the Requests team**
   - Add Sam, Matt Bennett, and Ivan as members
   - Set Tyler as default triage captain
   - Configure triage notifications for new members

2. **Create Product Area projects in EPD team**
   - Create "candidate projects" for each product pillar (Conversations, Integrations, Automations, Platform, Insights & Search, Mobile & Desktop, Onboarding & Activation)
   - Map existing EPD projects under these pillars
   - Ensure each pillar project can receive Customer Requests

3. **Configure Customer Requests**
   - Set Requests (REQUEST) as the default team for new customer request issues
   - Configure revenue tiers to match your pricing model
   - Set up customer status values (Active, Churned, Trial, etc.)
   - Create initial customer entities for top accounts

4. **Set up Linear Asks templates**
   - Create "Feature Request" Asks template (routes to REQUEST team)
   - Create "Bug Report" Asks template (routes to ASK team)
   - Install Linear Slack integration in key channels
   - Link ext-* Slack channels to their customer pages in Linear

5. **Create Custom Views**
   - "Most Requested Features" -- REQUEST issues ordered by customer request count
   - "Enterprise Requests" -- filtered by Tier = Enterprise
   - "Revenue-Weighted Backlog" -- ordered by total requesting customer revenue
   - "Unreviewed Triage" -- REQUEST issues in Triage state
   - "This Week's Intake" -- REQUEST issues created this week

### Phase 2: Automation (Week 3-4)

**Goal:** Wire up AskElephant workflows to automate intake.

1. **Configure AskElephant Feature Request workflow**
   - Pylon tickets tagged as "feature request" -> create LINEAR issue in REQUEST
   - AskElephant chat feature requests -> create LINEAR issue in REQUEST
   - Email feature requests -> create LINEAR issue in REQUEST
   - Include duplicate detection logic

2. **Configure AskElephant Bug Report workflow**
   - Pylon tickets tagged as "bug" -> create LINEAR issue in ASK
   - AskElephant chat bug reports -> create LINEAR issue in ASK
   - Email bug reports -> create LINEAR issue in ASK

3. **Configure Slack integration**
   - Enable Linear Asks in `#product-requests` and `#product-issues` (transition period)
   - Set up Slack notifications for new REQUEST triage items
   - Create `#linear-product-feed` channel for issue updates

4. **Test with parallel running**
   - Run old manual process AND new automated process for 2 weeks
   - Compare coverage: are signals being captured that were previously missed?
   - Tune duplicate detection thresholds

### Phase 3: Consolidation (Week 5-6)

**Goal:** Archive redundant Slack channels, establish new rhythms.

1. **Archive redundant channels** (see consolidation plan above)
2. **Communicate changes** to the team
3. **Train team** on new Linear Asks workflow for ad-hoc submissions
4. **Establish triage rotation** (see cadences below)

### Phase 4: Strategic Integration (Week 7-8)

**Goal:** Connect feedback to roadmap and initiatives.

1. **Link validated requests to EPD projects**
   - Each validated request should reference the relevant product pillar project
   - Use project-level Customer Requests view to see demand per project

2. **Create initiatives from patterns**
   - When multiple validated requests point to the same theme, create an initiative
   - Link the initiative to its component projects
   - Set owner, target date, and status

3. **Build the roadmap view**
   - Use Initiatives page as the top-level roadmap
   - Each initiative contains projects; each project has linked customer requests
   - Revenue and customer count visible at every level

---

## Operational Cadences

### Daily: Triage Captain Review (15 min)

**Who:** Rotating triage captain (from Requests team members)  
**What:**
- Review all new issues in REQUEST Triage state
- For each issue:
  - Is this a duplicate? -> Merge with existing issue
  - Is this a bug? -> Move to ASK team
  - Needs more info? -> Move to "Needs Info," leave comment
  - Valid request? -> Accept, apply priority + Product Area label, move to Backlog
- Check for stale "Needs Info" items (> 3 days)

**Linear view:** "Unreviewed Triage" custom view, favorited in sidebar

### Weekly: Product Feedback Review (30 min)

**Who:** Tyler + Product team  
**What:**
- Review "This Week's Intake" view -- what came in?
- Review "Most Requested Features" -- are any crossing a threshold?
- Look at new Customer Request counts on active projects
- Identify patterns: are multiple requests pointing to a new theme?
- Promote high-signal backlog items to "Validated"
- Link validated items to existing EPD projects or create new candidate projects

**Output:** Updated backlog priorities, new candidate projects identified

### Monthly: Feedback Intelligence Report (1 hour)

**Who:** Tyler  
**What:**
- Generate report from Linear Customer Requests data:
  - Total requests received this month
  - Top 10 most-requested features (by customer count)
  - Top 10 by revenue impact
  - New patterns emerging
  - Customer churn signals in requests
- Review initiative health: are the right initiatives getting traction?
- Identify gaps: are there recurring themes not yet tied to an initiative?
- Share report with leadership

**Output:** Monthly Product Feedback Intelligence Report

### Quarterly: Roadmap Planning (Half-day)

**Who:** Product + Engineering leadership  
**What:**

**Step 1: Review candidate projects**
- Open EPD project list, ordered by customer request count + revenue
- Each candidate project should have accumulated customer requests over the quarter
- Review which projects have the highest demand signal

**Step 2: Prioritize using Linear's continuous planning model**
- Assign priority to candidate projects:
  - **No priority** = Won't do this quarter
  - **Low** = Nice to have
  - **Medium** = Should do
  - **High** = Must do
- Consider: customer count, revenue impact, strategic alignment, engineering cost

**Step 3: Group into initiatives**
- Create or update initiatives for the quarter
- Assign projects to initiatives
- Set target dates and owners
- Update initiative descriptions with goals and success criteria

**Step 4: Staff and kick off**
- Assign project leads
- Move prioritized projects from "backlog" to "planned" or "started"
- Create Linear cycle for the quarter

**Output:** Updated roadmap visible in Initiatives view, projects staffed and started

### Quarter-over-Quarter: Retrospective

**Who:** Full EPD team  
**What:**
- How many requests were received? Resolved? Declined?
- What was the average time from request -> shipped?
- Which initiatives had the most customer demand?
- Which shipped features generated the best customer response?
- What feedback patterns are we not yet addressing?
- Update the product pillar structure if needed

---

## Appendices

### Appendix A: Full Slack Channel Inventory (Product-Related, Active)

**Primary Product Channels:**
1. `#product-requests` (34 members) - Feature requests
2. `#product-issues` (52 members) - Bug reports
3. `#product-forum` (40 members) - Product discussion
4. `#product-updates` (38 members) - Release announcements
5. `#product-learnings` (6 members) - Resources
6. `#product-marketing-updates` (27 members) - PMM
7. `#product-bounty` (4 members) - Product bounties
8. `#council-of-product` (12 members, private) - Product council

**Customer Signal Channels:**
9. `#voice-of-the-customer` (20 members)
10. `#customer-feedback` (25 members)
11. `#customer-quotes` (40 members)
12. `#customer-message-queue` (18 members)
13. `#customer-questions-for-blogs` (4 members)
14. `#churn-alert` (40 members)
15. `#partner-feedback` (5 members)
16. `#partner-bugs-and-issues` (18 members)
17. `#notetaker-issue-quotes` (10 members)
18. `#support-chat-log` (9 members)
19. `#index-feedback-all` (1 member)

**Request Channels:**
20. `#askelephant-internal-workflow-requests` (24 members)
21. `#solution-request` (19 members)
22. `#agent-requests` (10 members)
23. `#access-requests` (48 members)
24. `#demo-request` (9 members)

**Engineering & Ops:**
25. `#incidents` (47 members)
26. `#team-dev` (28 members)
27. `#team-dev-code-review` (25 members)
28. `#team-dev-learning` (10 members)
29. `#epd-all` (30 members)
30. `#bug-bounty` (14 members)
31. `#design-ux` (20 members)

**Integration & HubSpot:**
32. `#internal-hubspot-agent` (17 members)
33. `#hubspot-partners` (15 members)

**Sales Signal:**
34. `#sales-closed-won` (22 members)
35. `#sales-closed-lost` (8 members)
36. `#sales-coaching` (3 members)

**External Customer Channels (active, with "askelephant"):**
37-55. `#ext-kixie-askelephant`, `#ext-newbreed-askelephant`, `#ext-saleslift`, `#ext-schoolai-askelephant`, `#ext-pestshare-askelephant`, `#ext-reva-askelephant`, `#ext-sequifi-askelephant`, `#ext-signpost-askelephant`, `#ext-finally-askelephant`, `#ext-revcast-askelephant`, `#ext-zestey-askelephant`, `#ext-teamprometheus-askelephant`, `#ext-hapily-askelephant`, `#ext-tilt-askelephant`, `#ext-secondmile-askelephant`, `#ext-applause-internal-search`, `#ext-hexmodal-askelephant`, `#askelephant-strivepharmacy`

### Appendix B: Linear Team Details

**Requests Team (REQUEST)**
- ID: `3db8af11-ae15-4568-ab02-e1003b4c6a1b`
- States: Triage -> Needs Info -> Backlog -> Validated -> Ready for Engineering -> Shipped / Done / Won't Do
- Labels: Full Type + Product Area taxonomy
- Members: Tyler Sahagun

**Product Team (EPD)**
- ID: `ff631bc1-8b68-4900-937f-969fe4a3b532`
- States: Triage -> Needs Info -> Backlog -> In Progress -> In Review -> Validated -> Ready for Engineering -> In Engineering -> Shipped / Done / Canceled / Duplicate
- Members: Ivan Garcia, Sam Ho, Matt Bennett, Tyler Sahagun, AskElephant Support
- Projects: 34 (see main report)

**Development Team (ASK)**
- ID: `2b25052e-675d-4530-90c6-f2b6085d15e2`
- States: Triage -> Blocked -> Todo -> In Progress -> In Code Review -> Acceptance Review -> Done / Canceled / Duplicate
- Members: 15 engineers
- Projects: 50 (see main report)
- Labels: Extended with area/* (notion, imports, slack, hubspot, support, salesforce, website, teams, ux-general, zoom, google-drive, sales-process, training, billing) + workflow/* labels

**IT Team (IT)**
- ID: `943a02c9-a455-4167-beca-d4349b3c8fc3`
- States: Triage -> Needs Approval -> Approved -> Done / Denied / Duplicate
- Members: Kaden Wilkinson

### Appendix C: Linear Best Practices Reference

**From Linear's documentation and practices:**

1. **Triage** -- Route all unplanned work to a single triage inbox per team. Assign a rotating triage captain. Review daily. Accept, reject, merge, or snooze.

2. **Customer Requests** -- Enable and configure a dedicated team to receive requests. Link customers with revenue/tier data. Use Customer Request counts and revenue to prioritize. Subscribe to custom views for alerts.

3. **Continuous Planning** -- Don't wait for quarterly planning to organize feedback. Create candidate projects as patterns emerge from customer requests. When planning time comes, you already have a vetted list of possibilities ordered by demand.

4. **Initiatives** -- Group projects by company objective. Use initiatives to express goals and track progress. Leadership uses the Initiatives view as the roadmap. Each initiative contains multiple projects with health tracking.

5. **Duplicate Detection** -- Linear's Triage Intelligence suggests duplicates. When merging, customer request links and details carry over. This naturally aggregates demand signals.

6. **SLAs** -- Set SLAs on urgent/high-priority issues to ensure time-sensitive feedback gets addressed. Example: Urgent = 24h SLA, High + Bug = 1 week.

7. **Linear Asks** -- Use Slack Asks templates (one for bugs, one for feature requests) to let anyone in the company file issues from Slack. Minimal required fields, automatic customer association.

### Appendix D: Signal Source -> Linear Mapping

| Source | Signal Type | Destination | Method |
|--------|-----------|-------------|--------|
| Pylon (help desk) | Feature Request | REQUEST triage | AskElephant workflow |
| Pylon (help desk) | Bug Report | ASK triage | AskElephant workflow |
| AskElephant Chat | Feature Request | REQUEST triage | AskElephant workflow |
| AskElephant Chat | Bug Report | ASK triage | AskElephant workflow |
| Gmail | Feature Request | REQUEST triage | AskElephant workflow |
| Gmail | Bug Report | ASK triage | AskElephant workflow |
| Slack (`#ext-*`) | Any | REQUEST or ASK | Linear Asks (manual) |
| Slack (internal) | Feature idea | REQUEST triage | Linear Asks template |
| Slack (internal) | Bug report | ASK triage | Linear Asks template |
| AskElephant Transcripts | Feature mention | REQUEST triage | AskElephant workflow |
| AskElephant Transcripts | Bug mention | ASK triage | AskElephant workflow |
| Incident.io | Incident | ASK triage | Existing integration |

### Appendix E: Roadmap Hierarchy

```
INITIATIVE (e.g., "CRM Data Confidence")
  └── PROJECT (e.g., "CRM Agent Upgrades")
       └── ISSUE (e.g., "ASK-1234: Support custom field mapping")
            └── CUSTOMER REQUESTS
                 ├── Acme Corp (Enterprise, $50k MRR) - "Need custom field sync"
                 ├── Widget Inc (Growth, $15k MRR) - "HubSpot custom objects"
                 └── ... 12 more customers
```

This hierarchy enables:
- **Bottom-up:** "What are customers asking for?" -> sort by request count/revenue
- **Top-down:** "How is this initiative progressing?" -> see project health + customer demand
- **Cross-cutting:** "What does Enterprise customer X care about?" -> customer page shows all their requests
