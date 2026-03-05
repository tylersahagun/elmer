# Today: Monday February 9, 2026

## Chief of Staff Briefing (9:15 AM MST)

---

## IMMEDIATE ACTIONS (Before 9:30)

### 1. Reply to Skylar (DM)

Skylar messaged you saying she's **behind on CRM node design** and needs a **15-minute walkthrough** from you. She missed her Friday deadline.

> "I am behind on the CRM node design stuff. I think we had a goal for me to be design done on Friday. But i never executed on that. I would like to get that done with. I think you can help by giving me a 15 minute walkthrough."

**Action:** Reply in DM. Propose scheduling the 15-min walkthrough after your morning meeting block (11:30 or during lunch at 12:00).
[Slack link](https://askelephant.slack.com/archives/D08KN9RS3CN/p1770619976350129)

### 2. Reply to Jamis Benson (DM)

SDR Jamis asked "Any new AskElephant updates?" - quick reply with recent wins (Settings v1, Beta Features page, Chat V2 progress).
[Slack link](https://askelephant.slack.com/archives/D094Q8A1VM2/p1770653648286569)

### 3. Note: Woody DECLINED Council of Product (10:30)

Woody's responseStatus for today's Council is **declined**. This changes the meeting dynamic. Sam, Bryan, Skylar, Rob, Tony, Kenzi are still on.

---

## Calendar (9 events, 2 conflicts)

| Time        | Event                          | Attendees                            | Status                     |
| ----------- | ------------------------------ | ------------------------------------ | -------------------------- |
| All day     | Elephant Pen                   | Everyone                             | Tyler declined             |
| 9:30-10:00  | **Eng Standup**                | Bryan, Devs, Adam, Skylar, Sam       | Go                         |
| 10:00-10:15 | ~~RepX Launch (Storylane)~~    | External                             | Skip (conflicts with Trio) |
| 10:00-10:30 | **Trio Sync**                  | Skylar, Bryan, Sam                   | Go - Tyler accepted        |
| 10:30-11:30 | **Council of Product**         | Bryan, Skylar, Rob, Tony, Kenzi, Sam | Go - **Woody declined**    |
| 12:00-12:30 | Reminder to eat                | Skylar                               |                            |
| 13:00-13:30 | **Product x Marketing Weekly** | Bryan, Skylar, Tony, Kenzi, Sam      | Go                         |
| 13:00-13:15 | Dell Data Center Updates       | Russell Wagman (external)            | **Decline**                |

**Conflict Resolution:**

- RepX Launch vs Trio Sync at 10:00 → **Skip RepX**, Trio is higher value (Skylar, Bryan, Sam)
- Dell meeting vs Product x Marketing at 13:00 → **Decline Dell** (unsolicited vendor outreach)
- Woody not at Council → Adjust agenda: don't raise items that need his approval today

---

## Meeting Prep Topics

### Eng Standup (9:30) - Listen for:

- Palmer: Chat V2 / Agent Architecture progress (37 issues)
- Jason: Settings + Beta Features page iteration
- Ivan: Composio migration / Call imports
- Eduardo: Mobile v2 redesign
- Dylan: Speaker ID / Voice Print (in Acceptance Review!)
- Matt: Any FGA engine progress

### Trio Sync (10:00) - Bring to discuss:

1. **Skylar's CRM node design delay** - she needs a 15-min walkthrough, coordinate timing
2. **Loom recording plan** - 7 recordings due, need to prioritize
3. **Settings v1 feedback** - Sam had questions about auto-enroll scope and API keys

### Council of Product (10:30) - Key topics:

1. **Chat V2 Loom is HIGHEST priority** - Rob needs visibility on Palmer's 37-issue project
2. **Woody not present** - deprioritize items needing his approval (Composio design review, Deprecation comms)
3. **FGA Engine ready for review** - full docs suite + prototype complete
4. **Weekly status updates current** - all 22 Notion projects updated (Feb 5 or Feb 9)
5. **Privacy Agent** - 10 days in Open Beta, cited in Fifth Dimension AI deal ($13.2K ACV), but no structured feedback collected yet

### Product x Marketing (13:00) - Bring:

1. **Launch materials status** for projects approaching GA
2. **Global Chat decision needed**: launch with or without Composio connected integrations?
3. **Structured HubSpot Agent Node**: KB article is critical path blocker

---

## Slack Summary

| Priority   | Message                                                        | Action                |
| ---------- | -------------------------------------------------------------- | --------------------- |
| **ACTION** | Skylar DM: Behind on CRM node design, needs 15-min walkthrough | Reply + schedule      |
| **ACTION** | Jamis DM: Wants product updates                                | Quick reply with wins |
| **FYI**    | AskElephant bot: Meeting prep for Eng standup                  | Informational         |
| **FYI**    | Matt Noxon: TikTok in dev group chat                           | Fun, no action        |

---

## Gmail Status

20 unread emails in inbox. Mostly promotional (Maven courses, newsletters). Need full triage later.
**Recommended:** Run `/gmail` after morning meetings for proper classification.

---

## Linear: Your Open Issues (22 total)

### Needs Immediate Attention

| Issue                                       | State          | Priority | Action                                 |
| ------------------------------------------- | -------------- | -------- | -------------------------------------- |
| EPD-1368: Meeting-Join Filter               | **Triage**     | -        | Quick classify (CHILI Publish request) |
| ASK-4934: HubSpot analytics instrumentation | In Code Review | Urgent   | Review if ready to merge               |
| ASK-4900: Add PRD to Settings project       | Todo           | **P1**   | Write Settings PRD                     |

### Backlog (Council of Product tasks, Feb 4)

| Issue                                                   | State   | Theme         |
| ------------------------------------------------------- | ------- | ------------- |
| EPD-1361: Instrument PostHog for HubSpot workflow usage | Backlog | CRM Analytics |
| EPD-1362: Draft E2E CRM agent journey                   | Backlog | CRM Story     |
| EPD-1363: Create training Looms for workflow builder    | Backlog | Enablement    |
| EPD-1359: Deprecate non-working HubSpot nodes           | Backlog | CRM Cleanup   |
| EPD-1360: Define Linear boundaries                      | Backlog | Process       |
| EPD-1357: Rename HubSpot agent variants                 | Backlog | UX Clarity    |
| EPD-1364: Schedule hackathon demo                       | Backlog | Coordination  |
| EPD-1358: Validate HubSpot engagement release           | Backlog | CRM Feedback  |

### Validated (Customer requests ready for roadmap)

| Issue                                               | State      | Customer      |
| --------------------------------------------------- | ---------- | ------------- |
| EPD-1349: Saved filters on search page              | Validated  | CHILI Publish |
| EPD-1348: GDPR Compliance                           | Needs Info | CHILI Publish |
| EPD-1347: Workflow visibility by role               | Validated  | CHILI Publish |
| EPD-1346: Microsoft 365 Integration                 | Validated  | CHILI Publish |
| EPD-1345: Atlassian Integration (Jira & Confluence) | Validated  | CHILI Publish |
| EPD-1344: User meeting deletion/privacy             | Validated  | CHILI Publish |
| EPD-1343: Automation folders/organization           | Validated  | CHILI Publish |

### Shipped/Done

| Issue                                               | State   |
| --------------------------------------------------- | ------- |
| EPD-1326: Paste images in chat                      | Shipped |
| ASK-4901: Create Slack channel for Settings updates | Done    |
| ASK-4467: ITS Gong Imports                          | Done    |

---

## Notion Projects Database: FULL AUDIT (22 projects)

### Health Score: 8/10 - In Good Shape

All 22 projects have:

- Weekly status updates (most dated 2026-02-05 or 2026-02-09)
- Outcomes defined
- Objectives & Success criteria
- Linear links (except Rep Workspace and Release Lifecycle)

### Projects by Phase

| Phase          | Count | Projects                                                                                                                                                                                                        |
| -------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Done**       | 3     | Observability & Monitoring, Capture Visibility, Notification Engine                                                                                                                                             |
| **Test**       | 3     | Privacy Agent (v2), Global Chat & Internal Search, Admin Onboarding                                                                                                                                             |
| **Build**      | 12    | Structured HubSpot Node, FGA Engine, Feature Flag Audit, Settings Redesign, Speaker ID, Composio Agent, Release Lifecycle, CRM Update Artifact, Chat V2, Mobile v2, Call & Data Imports, Storybook Architecture |
| **Definition** | 4     | Universal Signal Tables, Rep Workspace, Client Usage Metrics, Deprecate Legacy HubSpot                                                                                                                          |

### Gaps to Address

1. **Rep Workspace** - No Linear link set
2. **Client Usage Metrics** - No Outcome defined, no Linear link
3. **Storybook Architecture** - No PMM Tier set
4. **Several projects** missing Closed Beta / GA target dates
5. **Global Chat** has typo in name: "Internal Seach" (missing 'r')

### Projects Updated Today (Feb 9)

- Composio Agent Framework (comprehensive update)
- Deprecate Legacy HubSpot Nodes (prototype + docs)
- Chat V2 / Agent Architecture (v9 prototype)
- FGA Engine (full docs suite + prototype)
- Storybook Architecture Overhaul (new project added)

---

## Loom Recordings Due Today (7 total)

| Recording                           | Priority | Focus Block | Notes                                             |
| ----------------------------------- | -------- | ----------- | ------------------------------------------------- |
| **Chat V2 / Agent Architecture**    | HIGHEST  | 11:30-12:00 | 37 issues from Palmer - Rob needs visibility      |
| Beta Features Page v1               | High     | 12:30-13:00 | Jason shipped Feb 7 - quick win                   |
| Settings Redesign v1                | High     | 12:30-13:00 | Jason shipped Feb 7 - combine with Beta Features? |
| Global Chat & Internal Search (GA)  | Medium   | 13:30+      | Feature flag removed, moved to GA                 |
| Call & Data Imports                 | Medium   | 13:30+      | Ivan's Avoma/Grain importers                      |
| Admin Onboarding (invite-only beta) | Medium   | 13:30+      | CRM-first experience                              |
| Mobile v2 Redesign                  | Lower    | 13:30+      | Eduardo's work                                    |

---

## Communication Plan

### Today's Visibility Actions

1. **Reply to Skylar** about CRM node walkthrough (before Trio)
2. **Reply to Jamis** with product updates digest
3. **Raise Chat V2 Loom urgency** in Council (Rob needs this)
4. **Share Notion status** - all 22 projects updated this week
5. **After meetings:** Record Chat V2 Loom (highest priority)

### This Week's Communication Needs

- Weekly status updates are current (last batch: Feb 5 + Feb 9)
- Privacy Agent needs active feedback collection (message CSM team)
- Composio availability messaging needs clarification with Rob
- Structured HubSpot Agent Node KB article is critical path

---

## Overdue Tasks (Google Tasks)

| Task                             | Due    | Recommendation                                        |
| -------------------------------- | ------ | ----------------------------------------------------- |
| composio                         | Feb 5  | Close if Composio design handoff is tracked in Notion |
| privacy agent flag analysis      | Feb 5  | Close - Privacy Agent is in Open Beta                 |
| product app queues               | Feb 5  | Check status, close or defer                          |
| global chat docs                 | Feb 3  | GA walkthrough Loom covers this                       |
| Get link for round robin product | Feb 3  | Close or defer                                        |
| Internal Search Docs             | Feb 3  | Combine with Global Chat GA Loom                      |
| Work with Ivan on Integrations   | Jan 30 | Ivan is deep in Composio - defer                      |

**Action:** Clear 5+ overdue items during afternoon open block.

---

## TIME-BLOCKED SCHEDULE (on your Google Calendar)

| Time            | Block                                                 | Status  |
| --------------- | ----------------------------------------------------- | ------- |
| 9:30-10:00      | Eng Standup                                           | Meeting |
| 10:00-10:30     | Trio Sync (Skylar, Bryan, Sam)                        | Meeting |
| 10:30-11:30     | Council of Product (Woody DECLINED)                   | Meeting |
| **11:30-12:00** | **FOCUS: Record Loom - Chat V2 / Agent Architecture** | Blocked |
| 12:00-12:30     | Reminder to eat + Skylar CRM walkthrough (15 min)     | Blocked |
| **12:30-13:00** | **FOCUS: Record Loom - Beta Features + Settings**     | Blocked |
| 13:00-13:30     | Product x Marketing Weekly                            | Meeting |
| **13:30-14:00** | **FOCUS: Record Loom - Global Chat GA**               | Blocked |
| **14:00-14:30** | **FOCUS: Record Loom - Call & Data Imports**          | Blocked |
| **14:30-15:00** | **FOCUS: Record Loom - Admin Onboarding**             | Blocked |
| **15:00-15:30** | **FOCUS: Record Loom - Mobile v2 Redesign**           | Blocked |
| **15:30-16:30** | **FOCUS: Task Cleanup + Gmail + Notion Updates**      | Blocked |

All focus blocks have talking points + notes embedded in the calendar event descriptions.

---

## Google Tasks Status

### Completed Today (4 cleared)

- ~~composio~~ - Tracked in Notion
- ~~privacy agent flag analysis~~ - PDA in Open Beta
- ~~global chat docs~~ - Covered by GA Loom recording
- ~~Internal Search Docs~~ - Combined with Global Chat

### Deferred (3 rescheduled)

| Task                             | New Due      | Reason                             |
| -------------------------------- | ------------ | ---------------------------------- |
| product app queues               | Feb 11 (Wed) | Midweek review                     |
| Get link for round robin product | Feb 11 (Wed) | Ask in standup                     |
| Work with Ivan on Integrations   | Feb 14 (Fri) | Ivan focused on Composio migration |

### Due Today (1 remaining + 7 Looms)

| Task                                       | List      | Action                                   |
| ------------------------------------------ | --------- | ---------------------------------------- |
| Privacy Determination Agent lifecycle      | My Tasks  | Message CSM team for feedback collection |
| Record Loom: Chat V2 / Agent Architecture  | Loom List | 11:30 block                              |
| Record Loom: Beta Features Page v1         | Loom List | 12:30 block                              |
| Record Loom: Settings Redesign v1          | Loom List | 12:30 block                              |
| Record Loom: Global Chat & Internal Search | Loom List | 13:30 block                              |
| Record Loom: Call & Data Imports           | Loom List | 14:00 block                              |
| Record Loom: Admin Onboarding              | Loom List | 14:30 block                              |
| Record Loom: Mobile v2 Redesign            | Loom List | 15:00 block                              |

---

## Your Chief of Staff is Standing By

Throughout the day, I can:

- **Draft Slack messages** for you (product updates, status shares)
- **Triage Gmail** when you have a break (`/gmail`)
- **Update Notion** after meetings with decisions/status changes
- **Fix Notion gaps** (missing Linear links, typos, target dates)
- **Prep Loom talking points** for any recording
- **Classify EPD-1368** (Meeting-Join Filter) for you
- **Mark Loom tasks complete** as you finish each recording
- **Paste Loom URLs into Notion** after recordings
- **Send EOD summary** at end of day

Just say the word on any of these.

---

_Generated: 2026-02-09T09:37:00-07:00 | Sources: Slack, Gmail, Calendar, Linear, Notion, Google Tasks_
_Chief of Staff mode active - time blocks on calendar_
