# Projects Database: Source of Truth Plan

> From Sam/Tyler/Skylar conversation on Feb 5, 2026
> Notion DB: https://www.notion.so/ask-elephant/2c0f79b2c8ac802c8b15c84a8fce3513

---

## TL;DR

Sam wants the **Projects Database** in Notion to be the single source of truth for all product launches. The conversation exposed three systemic problems: (1) no clear release lifecycle stages, (2) no weekly status discipline, and (3) no outcome tracking. This plan addresses all three.

---

## What Exists Today

### Current Schema (18 projects)

| Property | Type | State |
|---|---|---|
| Project name | title | Good |
| Project Phase | status | Discovery → Definition → Build → Test → Done |
| Visibility | select | Alpha, Invite-only Beta, Open Beta, GA |
| Weekly Status Update | rich_text | New -- only 3/18 projects have updates |
| Objectives & Success | rich_text | New -- only 2/18 projects have data |
| Outcome | rich_text | Mostly one-word ("Trust", "Quality") |
| PMM Tier | select | p1-p4, but 0/18 projects have it set |
| Linear Link | url | ~10/18 populated |
| GTM | relation | Linked to separate launch planning DB |
| Product Tickets | relation | Linked to product tickets DB |
| Closed Beta Launch/Target | date x2 | All empty |
| Open Beta Launch/Target | date x2 | Only 1 populated |
| GA Target Launch/Release | date x2 | Only 2 populated |

### Active Projects (not Done)

| Project | Phase | Visibility | Status Update? | Objectives? |
|---|---|---|---|---|
| Privacy Determination Agent (v2) | Test | Open Beta | Yes (2/5) | No |
| Global Chat & Internal Search | Test | GA | Yes (2/5) | No |
| Structured Hubspot Agent Node | Build | Open Beta | Yes (2/5) | Yes |
| FGA Engine | Build | Alpha | No | No |
| Universal Signal Tables | Build | Alpha | No | No |
| Feature Flag Audit & Cleanup | Build | -- | No | No |
| Settings Redesign | Build | -- | No | No |
| Rep Workspace | Build | Alpha | No | No |
| Speaker ID / Voice Print | Definition | Alpha | No | No |
| Admin Onboarding | Test | Invite-only Beta | No | No |
| Composio Agent Framework | Definition | Alpha | No | No |
| Release Lifecycle Process | Build | Alpha | No | No |
| CRM Update Artifact on Engagement Pages | Build | Open Beta | No | Yes |
| Deprecate Legacy Hubspot Nodes | Discovery | -- | No | No |
| Client-specific usage metrics | Discovery | -- | No | No |

---

## Problems Identified in the Conversation

### 1. Release Lifecycle Confusion
- **What happened:** Global Chat was announced as "open beta" on Monday, then launched GA on Wednesday. Sales was confused, design was frustrated.
- **Root cause:** No formal definition of what Alpha/Closed Beta/Open Beta/GA mean, and no gate criteria between stages.
- **Sam's direction:** Define clear stages with target dates. "If you release GA, it better be launch-ready."

### 2. No Weekly Status Discipline
- **What happened:** Sam couldn't see at a glance what happened this week on any project.
- **Root cause:** Status updates are ad-hoc, scattered across Slack, conversations, and Tyler's memory.
- **Sam's direction:** Weekly status in a consistent format: **Done** (what happened) / **Up Next** (what's planned) / **Blocked** (what's stuck). Date-stamped.

### 3. Outcomes Not Defined
- **What happened:** Projects are shipping without clear success metrics. "Outputs vs outcomes" was the central theme.
- **Root cause:** No field requiring objectives before build starts. "Outcome" field is one-word vague.
- **Sam's direction:** Each project needs an "Objectives & Success" with measurable goals (e.g., "100 workspaces with structured HubSpot agent workflow created").

### 4. Launch Materials Not Tracked
- **What happened:** Things ship without KB articles, Loom demos, sales enablement, or support docs.
- **Root cause:** No checklist or tracking of launch readiness materials per project.
- **Sam's direction:** At minimum: KB article, Loom demo, sales enablement presentation, Storylane (for complex features).

### 5. Feedback Loops Are Passive
- **What happened:** Privacy agent in open beta for 10 days with zero feedback. Team is "waiting" but not actively seeking.
- **Root cause:** No ownership of feedback collection, no process for beta feedback synthesis.
- **Sam's direction:** Own the outcome. If you're not getting feedback, go get it.

### 6. Terminology Misalignment
- **Agreed definitions:**
  - **Alpha** = Internal only, not customer-facing
  - **Closed Beta** = Invite-only customers
  - **Open Beta** = Anyone can use it, but no proactive enablement
  - **GA** = Launched. Full enablement, launch materials, the works.
  - **Release** = Code is deployed (can be at any stage)
  - **Launch** = Full marketing + enablement push (only at GA)

---

## The Plan

### Phase 1: Schema Cleanup (This Week)

**Goal:** Make the database structurally sound so Sam can review it in weekly syncs.

#### Actions:
1. **Clean up duplicate projects** -- There are two "Global Chat & Internal Search" entries (original + "(1)" copy). Consolidate into one and archive the other.

2. **Fill PMM Tier** for all active projects (Sam expects this for planning):
   - p1 = Full launch campaign (press, webinar, sales deck)
   - p2 = Blog post + enablement training
   - p3 = In-app announcement + KB article
   - p4 = Silent release (internal only)

3. **Fill target dates** for all active projects in at least one stage column. Sam specifically asked for dates in the visibility columns.

4. **Fill "Objectives & Success"** for all projects in Build or later. Use the format from the conversation:
   - Primary metric (e.g., "100 workspaces with workflow created")
   - Engagement metric (e.g., "30 workspaces with workflow active 2+ weeks")
   - Leading indicator (e.g., "Total successful CRM update runs per month")

5. **Write weekly status updates** for all active projects using the format:
   ```
   📅 YYYY-MM-DD
   Done: [what happened this week]
   Up Next: [what's planned next week]
   Blocked: [what's stuck and who owns unblocking]
   ```

### Phase 2: Process Definition (Next Week)

**Goal:** Document the release lifecycle so there's no ambiguity.

#### Actions:
1. **Create a "Release Lifecycle" reference page** in Notion (or update the existing "Release Lifecycle Process" project):
   - Define gate criteria for each stage transition
   - Define what launch materials are required at each stage
   - Define who owns what (product owns release, PMM owns launch)

2. **Add a "Launch Readiness Checklist" property** (or subpage template) to each project:
   - [ ] KB Article written
   - [ ] Loom demo recorded
   - [ ] Sales enablement deck created
   - [ ] Storylane (if p1/p2)
   - [ ] Support team briefed
   - [ ] In-app guidance (if applicable)
   - [ ] Posthog instrumentation verified

3. **Define the weekly review cadence:**
   - Tyler updates status every Wednesday (before Thursday council meeting)
   - Sam reviews the database view filtered to "not Done" projects
   - Blockers escalated in the meeting, not after

### Phase 3: Views & Automation (Week 3)

**Goal:** Make it easy for different audiences to consume.

#### Views to Create:
1. **Execution View** -- Active projects only (not Done), sorted by phase, showing: Project, Phase, Visibility, Weekly Status, Objectives, Owner
2. **Marketing View** -- Projects approaching Open Beta/GA, showing: Project, PMM Tier, Launch Materials status, Target dates
3. **Engineering View** -- Projects in Build/Test, showing: Project, Phase, Linear Link, Blocked status
4. **Sam's Review** -- All non-Done projects with Weekly Status and Objectives prominent

#### Automation Opportunities:
- MCP-based weekly status pull (Tyler's PM workspace can auto-populate from Linear + Slack signals)
- Auto-flag projects with no status update in 7+ days
- Auto-generate launch material drafts from project context

### Phase 4: Ongoing Discipline (Continuous)

**Goal:** Make this sustainable, not another abandoned doc.

1. **Tyler's weekly habit:** Wednesday afternoon, update all active project statuses
2. **Monthly objectives review:** Are we tracking toward the metrics? Do we need to adjust?
3. **After every release:** Update visibility, add actual launch date, write post-launch status
4. **Quarterly cleanup:** Archive Done projects older than 90 days, review if Discovery items are still relevant

---

## Tyler's Immediate Action Items

| # | Action | Target Date | Notes |
|---|---|---|---|
| 1 | Consolidate duplicate Global Chat entries | Feb 6 | Archive the "(1)" copy |
| 2 | Fill PMM Tier for all active projects | Feb 7 | At least p3/p4 for most |
| 3 | Fill Objectives & Success for Build+ projects | Feb 7 | Start with Structured HubSpot Node (already has data) as template |
| 4 | Write weekly status for all active projects | Feb 7 | Use Done/Up Next/Blocked format |
| 5 | Set target dates for Beta/GA columns | Feb 7 | Even rough estimates help |
| 6 | Sync with Skylar on HubSpot node UI feedback | Feb 6 | Design needed by Feb 7 |
| 7 | Message CSM team about Privacy Agent feedback | Feb 6 | Active outreach, not passive waiting |
| 8 | Create Execution View in Notion | Feb 7 | Filter: Phase != Done |
| 9 | Prep launch materials for Structured HubSpot Node | Feb 7 | KB article, Loom demo, sales enablement deck |
| 10 | Share PostHog CRM update metrics with Sam | Feb 7 | New instrumentation from yesterday |

---

## Key Quotes from Sam

> "Let's just have where's the...let's create the source of truth. Let's bring up that document."

> "Let's just reuse this as, like, we review this and we update it, and we put target dates for each of these phases."

> "If you release GA, it better be launch-ready."

> "We're already with our heads cut off thinking about the next thing, we have no idea. But that's always the trap for a lot of product aid outputs versus outcomes."

> "Let's understand what our users are doing, and then let's solve their problems versus I believe they should be doing xyz."

> "What is my metric of success? Objectives and success."

---

## How This Connects to Tyler's Role

From the role-definition-prototype: Tyler's 3 core responsibilities are:
1. **Know what is happening across product** -- This database IS the answer
2. **Facilitate engineering-to-release handoff** -- The lifecycle stages + launch materials checklist covers this
3. **Learn product discovery from Sam** -- The objectives/outcomes thinking is exactly this

This is not scope creep. This is the foundation of responsibility #1 and #2.
