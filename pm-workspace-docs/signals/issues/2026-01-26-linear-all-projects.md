# Linear Signal Ingest: All Projects

**Source**: Linear (all projects)
**Date**: 2026-01-26
**Issues Analyzed**: 250
**Signal-Rich Issues**: 108 (bugs, features, improvements)

## Executive Summary

Analyzed 250 most recent Linear issues across all projects. Key patterns:

1. **Conversation/Chat stability** - 9 conversation-related bugs, chat timeouts, context issues
2. **Workflow reliability** - 8 workflow bugs affecting customer automations
3. **Bot/Notetaker issues** - 7 recording-related bugs impacting meeting capture
4. **Analytics gaps** - Missing workspace context and user_role across events
5. **Onboarding friction** - Multiple reports of onboarding retriggering

---

## Issue Status Overview

### Status Distribution (Signal-Rich Issues)

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Done | 57 | Recently fixed |
| 🔄 In Progress | 6 | Actively being worked |
| 👀 Acceptance Review | 8 | Awaiting QA/approval |
| 📝 Code Review | 1 | In PR review |
| 📋 Todo | 12 | Scheduled, not started |
| 🔍 Triage | 17 | Needs prioritization |
| 📦 Backlog | 22 | Known, not scheduled |
| ❌ Canceled | 2 | Won't fix |

---

## ✅ Recently Fixed (Key Wins)

These issues have been resolved - **no longer blocking customers**:

### Chat/Conversation Fixes
- **VAN-485** - Chat timeouts/not responding ✅
- **VAN-473** - Loop Prompt doesn't use enabled tools ✅
- **VAN-474** - Chat doesn't recognize Knowledge Base docs ✅
- **ASK-4492** - Attaching meetings on company page error ✅
- **VAN-470** - Page context removed too easily by backspace ✅

### Mobile/Auth Fixes
- **ASK-4537** - Mobile app login issues ✅
- **CEX-383** - Internal user "Unauthenticated" on settings ✅
- **CEX-380** - Recorded meetings don't load on My Meetings page ✅

### Workflow Fixes
- **ASK-4542** - Duplicate workflow outputs ✅
- **CEX-384** - Can't add nodes by clicking plus button ✅
- **VAN-465** - Notion "Create page from datasource" node error ✅
- **ASK-4462** - Auto-tagging testing error ✅

### Recording/Bot Fixes
- **CEX-393** - 'Record Now' not capturing audio ✅
- **CEX-385** - Unknown Speaker & manual assignment error ✅
- **CEX-387** - Meeting "Missing Required Keys" ✅

### Other Fixes
- **ASK-4451** - Seat counter showing 0/0 ✅
- **VAN-468** - Signals not running on customer workspaces ✅
- **CEX-390** - HubSpot Agent doesn't recognize "Project" object ✅

---

## 🚨 Outstanding: Needs Immediate Attention

### P1-P2 (Critical/High Priority)

| ID | Issue | Status | Priority |
|----|-------|--------|----------|
| ASK-4567 | Platform Loading and Speed Issues | 🔍 Triage | P1 |
| ASK-4576 | Onboarding retriggering for existing users | 🔍 Triage | P2 |
| CEX-391 | Inactive user still recording meetings | 👀 Review | P2 |
| EPD-1329 | Missing workspace context on chat events | 🔍 Triage | P2 |
| EPD-1330 | Missing workspace context on agent events | 🔍 Triage | P2 |
| EPD-1331 | Missing workspace context on mobile events | 🔍 Triage | P2 |
| EPD-1327 | No processing state visibility in UI | 🔍 Triage | P2 |
| EPD-1326 | Can't paste images in chat | 🔍 Triage | P2 |

### P3 (Medium Priority - Blocking Workflows)

| ID | Issue | Status | Blocking |
|----|-------|--------|----------|
| ASK-4558 | Meeting prep workflow not triggering | 📋 Todo | Customer automation |
| ASK-4554 | Copy/paste workflows broken | 📋 Todo | Workflow reuse |
| CEX-389 | Tag Meeting node "Meeting not found" | 📋 Todo | Tagging automation |
| ASK-4482 | HubSpot Add Notes to Deals failing | 📋 Todo | CRM sync |
| CEX-396 | "Show me how" button errors out | 📋 Todo | Onboarding |
| CEX-386 | Share page not recognizing context | 📋 Todo | Sharing |
| VAN-489 | Multi-workspace toggle broken | 📝 Review | Multi-workspace users |

---

## 🔄 Currently In Progress

| ID | Issue | Assignee/Status |
|----|-------|-----------------|
| ASK-4604 | Enhanced prompt when empty | In Progress |
| ASK-4600 | Batch bot details queries (perf) | In Progress |
| ASK-4597 | Personalization steps in onboarding | In Progress |
| ASK-4532 | User registry for admin onboarding | In Progress |
| ASK-4527 | Copy engagements between workspaces | In Progress |

---

## 📦 Backlog: Known Issues Not Yet Scheduled

### High-Impact Backlog (Should Prioritize)

| ID | Issue | Impact |
|----|-------|--------|
| CEX-382 | Can't add nodes after workflow builder | UX friction |
| ASK-4416 | Notion pages not accessible after new creation | Integration broken |
| ASK-4465 | Infinite load-more on admin pages | Admin UX |
| ASK-4458 | Workflow builder reverting changes | Data loss |
| ASK-4521 | Inactive team members sending recaps | Data governance |

### Lower Priority Backlog

- ASK-4572 - Zoom bypass host settings
- ASK-4579 - Deleted calendar events still showing
- ASK-4580 - Integration icons flickering
- ASK-4536 - Untitled chats auto-created
- ASK-4487 - Loop Prompt errors with Calendar Events
- ASK-4500 - Notion MCP error

---

## Pattern Analysis

### By Label Distribution

| Category | Count | % of Signal Issues |
|----------|-------|-------------------|
| bug | 74 | 69% |
| feature | 21 | 19% |
| improvement | 17 | 16% |
| conversation | 9 | 8% |
| workflow | 8 | 7% |
| notetaker | 7 | 6% |

### By Project Activity

| Project | Issues | Focus Area |
|---------|--------|------------|
| No Project | 168 | Miscellaneous/Triage |
| Global Chat | 26 | Chat experience (active development) |
| Privacy Determination Agent P.2 | 19 | Privacy features |
| Noxon Usability | 11 | Platform usability |
| CRM Agent Upgrades | 5 | HubSpot/Salesforce agents |
| Call & Data Imports | 5 | Import functionality |

---

## Critical Signals (P1-P2)

### Platform Loading (P1)
- **ID**: ASK-4567
- **Project**: Noxon Usability
- **Problem**: Users experiencing slow load times affecting overall UX
- **Impact**: Top priority usability issue

### Chat Timeouts (P3 but recurring)
- **ID**: VAN-485
- **Problem**: Chats timing out/not responding - similar to bug from 1-2 months ago
- **Quote**: "When people ask questions in the chat, Ask often isn't responding, and it seems like it's timing out."
- **Impact**: Multiple customer reports

### Mobile Login Broken (P2)
- **ID**: ASK-4537
- **Problem**: Mobile app login reroutes to desktop instead of authenticating
- **Quote**: "To YSTech USA the mobile app it is incredibly important! They are trying to log in to their mobile app, and when they attempt to do so, AskElephant prompts them to check their email. Once they check their email, it just reroutes them to the desktop app."
- **Impact**: Multiple users at single company affected

---

## Workflow Bugs (Customer-Impacting)

### Meeting Prep Not Triggering (P3)
- **ID**: ASK-4558
- **Project**: Noxon Usability
- **Problem**: Meeting prep workflow not triggering reliably after onboarding setup
- **Impact**: Customers expect automation that isn't running

### Loop Prompt Tool Access (P2)
- **ID**: VAN-473
- **Problem**: Loop Prompt doesn't use enabled tools (WebSearch, HubSpotMCP, PastMeetings)
- **Quote**: "Every test run comes back and says that it is not possible to use those tools. But the node has the configurations for those tools."

### Duplicate Workflow Outputs (P4)
- **ID**: ASK-4542
- **Problem**: Workflow shows 1 run but creates duplicate outputs
- **Quote**: "Customer has a workflow that triggered twice on a meeting, but only shows one workflow run."

### Copy/Paste Workflows Broken (P3)
- **ID**: ASK-4554
- **Project**: Noxon Usability
- **Problem**: Copying workflow between workspaces doesn't paste correctly

### Tag Meeting Node Failing (P3)
- **ID**: CEX-389
- **Problem**: Tag Meeting node errors with "Meeting not found" despite valid meeting variable

### HubSpot Notes Not Pushing (P3)
- **ID**: ASK-4482
- **Problem**: Add Notes to Deals node not actually pushing notes despite valid input

---

## Bot/Recording Issues

### Inactive User Still Recording (P2)
- **ID**: CEX-391
- **Problem**: Inactive user's meetings still being recorded and pushed to HubSpot
- **Quote**: "Sam Smith @ Studiohawk, an inactive user, is recording meetings with workflows running on them."
- **Impact**: Data governance concern

### Zoom Waiting Room Bypass Failed (P4)
- **ID**: ASK-4572
- **Problem**: Bot didn't bypass waiting room despite bypass setting enabled
- **Impact**: Meeting not recorded

### Record Now Audio Capture (P2)
- **ID**: CEX-393
- **Problem**: 'Record Now' button sometimes captures no audio/transcript
- **Quote**: "He claims to be using the same input every single time, and it works sometimes while it doesn't other times."

---

## Analytics/Instrumentation Gaps

### Missing Workspace Context (P2)
- **IDs**: EPD-1329, EPD-1330, EPD-1331
- **Problem**: Chat, agent, and mobile events lack workspace context
- **Impact**: Cannot attribute usage to companies
- **Quote**: "This means we cannot track CRM/integration adoption by company."

### Missing User Role (P3)
- **ID**: EPD-1332
- **Problem**: `user_role` property inconsistent across events
- **Impact**: Cannot analyze usage by persona (IC vs manager vs admin)

---

## Feature Requests (New Capabilities)

### Transcription-Only Mode
- **ID**: EPD-1319
- **Project**: Meetings & Recordings
- **Request**: Transcribe without recording audio/video for confidentiality requirements
- **Quote**: "I want to transcribe conversations without recording audio or video, so that I can capture conversation insights legally without recording concerns."

### Image Paste in Chat (P2)
- **ID**: EPD-1326
- **Project**: AskElephant Chat
- **Request**: Paste images directly into chat as reference

### Meeting Summary in Recap Email
- **ID**: CEX-392
- **Request**: Include summary directly in email, not just link
- **Quote**: "I just want to be given that information [without] having to click into something, then ask a question, then get my meeting summary."

### Telegram Bot Integration (P4)
- **ID**: EPD-1313
- **Request**: Access AskElephant workspace data through Telegram

### Project/Candidate Tagging for Recruiters
- **IDs**: EPD-1321, EPD-1322, EPD-1323, EPD-1325
- **Request**: Create named projects, tag contacts to projects, generate candidate bios
- **Persona**: Executive search professionals

---

## UX/Usability Issues

### Chat Complete Popup Annoyance (P3)
- **ID**: ASK-4538
- **Problem**: Popup appears center-screen after every chat, doesn't auto-dismiss
- **Quote**: "It's honestly really annoying because I have to dismiss after every single chat!"

### Onboarding Retriggering (P2)
- **ID**: ASK-4576
- **Problem**: Onboarding experience keeps appearing for existing users
- **Quote**: "kevin@chilipublish keeps receiving the onboarding experience when trying to access AskElephant. This also is happening to myself."

### Processing State Visibility (P2)
- **ID**: EPD-1327
- **Problem**: No indication when AI is processing in background
- **Quote**: "Users can't tell if the system is working, stalled, or broken."

---

## Initiative Matches

| Signal Pattern | Related Initiative | Action |
|----------------|-------------------|--------|
| Chat stability issues | Global Chat | Prioritize reliability over features |
| Workflow bugs | Noxon Usability | Debug automation triggers |
| Analytics gaps | Product Analytics | Add workspace_id to all events |
| Onboarding friction | User Onboarding | Fix retriggering bug |
| Recording reliability | Meetings & Recordings | Investigate bot failures |

---

## Hypothesis Candidates

1. **Workflow reliability is blocking activation** - Multiple customers set up workflows during onboarding that don't run
2. **Analytics blind spots mask true usage** - Missing workspace context prevents company-level insights
3. **Chat popup friction reduces engagement** - Non-dismissing popups interrupt workflow
4. **Mobile importance underestimated** - YSTech reports mobile as "incredibly important" but login broken

---

## Recommended Actions

### Immediate (P1-P2)
1. Fix platform loading performance (ASK-4567)
2. Investigate chat timeout regression (VAN-485)
3. Fix mobile login flow (ASK-4537)
4. Add workspace_id to chat/agent/mobile events (EPD-1329/30/31)

### This Sprint
1. Debug meeting prep workflow triggers (ASK-4558)
2. Fix Loop Prompt tool access (VAN-473)
3. Fix inactive user recording (CEX-391)
4. Auto-dismiss chat complete popup (ASK-4538)

### Backlog Review
1. Transcription-only mode - evaluate demand
2. Telegram bot - check if strategic fit
3. Recruiter project tagging - potential new persona

---

## Raw Issue Links

- [ASK-4567 - Platform Loading](https://linear.app/askelephant/issue/ASK-4567)
- [VAN-485 - Chat Timeouts](https://linear.app/askelephant/issue/VAN-485)
- [ASK-4537 - Mobile Login](https://linear.app/askelephant/issue/ASK-4537)
- [ASK-4558 - Meeting Prep Workflow](https://linear.app/askelephant/issue/ASK-4558)
- [VAN-473 - Loop Prompt Tools](https://linear.app/askelephant/issue/VAN-473)
- [CEX-391 - Inactive User Recording](https://linear.app/askelephant/issue/CEX-391)
- [EPD-1329 - Chat Workspace Context](https://linear.app/askelephant/issue/EPD-1329)

---

## Progress Summary

### What's Fixed (No Longer Issues)

| Area | Fixed Issues | Impact |
|------|--------------|--------|
| **Chat/Conversation** | VAN-485, VAN-473, VAN-474, VAN-470 | Chat stability improved |
| **Mobile/Auth** | ASK-4537, CEX-383, CEX-380 | Login flow restored |
| **Workflows** | ASK-4542, CEX-384, VAN-465, ASK-4462 | Automation reliability |
| **Recording** | CEX-393, CEX-385, CEX-387 | Meeting capture fixed |
| **Integrations** | CEX-390, VAN-468 | HubSpot/Signals working |

**Total Fixed**: 57 signal-rich issues ✅

### What Still Needs Help

| Priority | Count | Key Issues |
|----------|-------|------------|
| **P1** | 1 | Platform loading (ASK-4567) |
| **P2** | 7 | Onboarding, analytics gaps, inactive recordings |
| **P3** | 12 | Workflow triggers, HubSpot sync, share page |
| **P4+** | 22 | Backlog bugs (lower severity) |

**Total Outstanding**: 42 signal-rich issues requiring attention

### Week-over-Week Trend

- **Resolved this period**: 57 issues
- **Still in progress**: 6 issues
- **Awaiting review**: 9 issues (8 acceptance + 1 code review)
- **Needs prioritization**: 29 issues (12 todo + 17 triage)

### Recommended Focus

1. **Immediate**: Triage ASK-4567 (P1 platform loading) 
2. **This Week**: Close out the 9 issues in review
3. **Next Sprint**: Address P2 analytics gaps (EPD-1329/30/31) to enable data-driven decisions
4. **Backlog Grooming**: Review 22 backlog items for prioritization
