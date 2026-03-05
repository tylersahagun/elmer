# Linear Signal: Product Team (EPD) Full Backlog Analysis

**Date:** 2026-01-26
**Source:** Linear MCP
**Team:** Product (EPD)
**Team Key:** EPD

## Summary

Comprehensive analysis of the Product team's Linear backlog - the centralized repository for customer feedback, feature requests, and product issues. This is the **intake/triage board** for product work, not the development execution board.

| Metric | Value |
|--------|-------|
| Total Issues | 1,327 |
| Customer-Labeled | 407 (31%) |
| Feature Requests | 450 (34%) |
| Bugs | 152 (11%) |
| Active (In Progress/Triage/Validated) | 23 |
| Backlog | 902 |
| Duplicate/Closed | 400 |

## Status Breakdown

| Status | Count | % |
|--------|-------|---|
| Backlog | 902 | 68% |
| Duplicate | 381 | 29% |
| Won't Do | 19 | 1.4% |
| Triage | 13 | 1.0% |
| Validated | 7 | 0.5% |
| In Progress | 3 | 0.2% |
| Done | 1 | 0.1% |
| Needs Info | 1 | 0.1% |

## Priority Distribution (Open Issues)

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (No priority) | 37 | Uncategorized/new |
| P1 (Urgent) | 31 | High priority |
| P2 (High) | 97 | Important |
| P3 (Medium) | 14 | Normal |
| P4 (Low) | 1 | Nice to have |

---

## 🔴 Triage Queue (Needs Attention)

These 13 issues are awaiting product decision:

| ID | Title | Priority | Created |
|----|-------|----------|---------|
| EPD-1332 | Add user_role property consistently across all events | P3 | 2026-01-24 |
| EPD-1331 | Add workspace context to mobile events for platform analytics | P2 | 2026-01-24 |
| EPD-1330 | Add workspace context to agent events for company-level analytics | P2 | 2026-01-24 |
| EPD-1329 | Add workspace context to chat events for company-level analytics | P2 | 2026-01-23 |
| EPD-1327 | Web Interface: Add processing state visibility & transparency during async operations | P2 | 2026-01-22 |
| EPD-1326 | Allow pasting images directly into chat | P2 | 2026-01-22 |
| EPD-1325 | US-007: Prevent Company-Based Auto-Categorization in Projects | P0 | 2026-01-22 |
| EPD-1324 | US-006: View and Filter Candidates by Project | P0 | 2026-01-22 |
| EPD-1323 | US-005: Tag Contacts/Candidates to Projects | P0 | 2026-01-22 |
| EPD-1322 | US-004: Create Named Projects with Tags | P0 | 2026-01-22 |
| EPD-1321 | US-003: Create Formatted Output (e.g., Candidate Bio) | P0 | 2026-01-22 |
| EPD-1320 | US-002: Generate Post-Call Notes from Transcription | P0 | 2026-01-22 |
| EPD-1319 | US-001: Enable Transcription-Only Mode | P0 | 2026-01-22 |

**Pattern:** Recent triage items (Jan 22-24) focus on:
- Analytics instrumentation gaps (workspace context on events)
- New vertical/use case (candidate tracking - US-001 through US-007)
- UX improvements (image paste, processing visibility)

---

## 🔄 In Progress

| ID | Title | Priority | Assignee |
|----|-------|----------|----------|
| EPD-1317 | Direct Dialpad integration | P0 | Eduardo Gueiros |
| EPD-1316 | Dialpad/Pipedream integration | P0 | Eduardo Gueiros |
| EPD-1315 | Gran import filed test | P0 | Eduardo Gueiros |

**Note:** All in-progress items are integration work (Dialpad/Gran) assigned to Eduardo.

---

## 📊 Label Distribution

### By Type

| Label | Count | % of Total |
|-------|-------|------------|
| type/feature-request | 450 | 34% |
| customer | 407 | 31% |
| type/improvement | 348 | 26% |
| type/question | 177 | 13% |
| type/bug | 152 | 11% |

### By Product Area

| Area | Count | Key Focus |
|------|-------|-----------|
| area/automations | 272 | Workflow builder, triggers, agents |
| area/hubspot | 124 | HubSpot integration/agent |
| area/integrations | 121 | General integration gaps |
| area/conversations | 120 | Chat, meeting prep, insights |
| area/ux-general | 120 | UI/UX improvements |
| area/salesforce | 109 | Salesforce integration |
| area/website | 106 | Marketing site, docs |
| area/platform | 98 | Core platform, infrastructure |
| area/training | 57 | Onboarding, education |
| area/sales-process | 44 | Sales workflow features |
| area/insights-search | 41 | Search, analytics |
| area/slack | 36 | Slack integration |
| area/zoom | 35 | Zoom integration |
| area/imports | 31 | Call/data imports |
| area/billing | 26 | Billing, pricing |

**Top Areas by Volume:**
1. **Automations** (272) - Largest focus area
2. **HubSpot** (124) - CRM integration critical
3. **Integrations** (121) - Ecosystem expansion requests
4. **Conversations** (120) - Core AI feature
5. **UX** (120) - Polish and usability

---

## 🐛 Open Bug Issues

Issues tagged `type/bug` that are NOT Done/Duplicate/Won't Do:

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| EPD-1107 | Web push: web portion has an issue while mobile is fine | P0 | Backlog |
| EPD-1106 | Duplicate meeting appears intermittently | P0 | Backlog |
| EPD-1080 | Meeting recording/transcription failure for today's session | P0 | Backlog |
| EPD-1057 | HubSpot UI: show every HubSpot agent update in the updates component | P0 | Backlog |
| EPD-1055 | HubSpot user-level connection fails when user can't grant ticket scope | P0 | Backlog |
| EPD-1047 | Workflow Builder is "not super intuitive" - changes "glitch out" | P0 | Backlog |
| EPD-1036 | Reliability: customer observed brief system outage | P0 | Backlog |
| EPD-928 | Knowledge base query suddenly taking much longer | P0 | Backlog |
| EPD-899 | Meeting prep/chat not loading for short meeting | P0 | Backlog |
| EPD-792 | Automations: Deal intervention workflow run fails | P0 | Backlog |
| EPD-755 | Workflow context attachment: hard to "distinguish" / confirm | P0 | Backlog |
| EPD-636 | Super admin should not see privacy details/reasons on events | P0 | Backlog |
| EPD-561 | AskElephant notetaker being turned off leads to incorrect ICP scoring | P0 | Backlog |
| EPD-516 | Workflow Builder: 'New workflow with AI' can get stuck | P0 | Backlog |

**Pattern:** Workflow Builder reliability and HubSpot integration are recurring bug themes.

---

## 👥 Customer-Labeled Issues (Recent)

Issues explicitly tagged `customer` - direct customer feedback/requests:

| ID | Title | Priority | Status | Created |
|----|-------|----------|--------|---------|
| EPD-1261 | Auto-assign CSM to deal when onboarding scheduled via round-robin | P2 | Backlog | 2025-12-23 |
| EPD-1276 | Prioritize incoming customer communications over rep actions in timeline | P2 | Backlog | 2025-12-23 |
| EPD-1294 | Prospecting dashboard: show 'who should I be talking to next' | P2 | Backlog | 2025-12-23 |
| EPD-1301 | Round-robin scheduling shows only Cook's calendar | P2 | Backlog | 2025-12-23 |
| EPD-1105 | Support "investor question card" / randomized objection prompts | P1 | Backlog | 2025-12-22 |
| EPD-1150 | Wrong number / intended contact mismatch | P1 | Backlog | 2025-12-22 |
| EPD-1174 | Clarify 'workflow' vs 'agent' terminology in product messaging | P1 | Backlog | 2025-12-22 |
| EPD-1192 | Reps feel 'big brother' risk with meeting playback and monitoring | P2 | Backlog | 2025-12-22 |
| EPD-1193 | Need clear, 'yes or no' documentation of what AE can and cannot do | P2 | Backlog | 2025-12-22 |
| EPD-1194 | Security concerns: stakeholders hesitant to give broad HubSpot access | P1 | Backlog | 2025-12-22 |
| EPD-1206 | CRM agent: improve reliability/accuracy (reduce need for "perfect prompt") | P2 | Backlog | 2025-12-22 |
| EPD-1212 | Desktop app: enable recording screen/audio | P2 | Backlog | 2025-12-22 |
| EPD-1215 | In-product adoption: clarify/educate users about "chat feature" | P1 | Backlog | 2025-12-22 |
| EPD-1217 | Fast "scorecard in 30 seconds" flow after mobile recording | P2 | Backlog | 2025-12-22 |
| EPD-1220 | Salesforce field mapping requires customer to provide field label + API name | P2 | Backlog | 2025-12-22 |

**Customer Pain Themes:**
1. **Trust/Privacy Concerns** - "Big brother" perception, security hesitation
2. **CRM Reliability** - Agent accuracy, prompt sensitivity
3. **Terminology Confusion** - Workflow vs agent, capability clarity
4. **Feature Discovery** - Users don't know chat exists
5. **Sales Process Automation** - Round-robin, prospecting, CSM assignment

---

## ⭐ Top Feature Requests (by Priority)

Issues tagged `type/feature-request` sorted by priority:

| ID | Title | Priority | Status | Created |
|----|-------|----------|--------|---------|
| EPD-1325 | US-007: Prevent Company-Based Auto-Categorization in Projects | P0 | Triage | 2026-01-22 |
| EPD-1323 | US-005: Tag Contacts/Candidates to Projects | P0 | Triage | 2026-01-22 |
| EPD-1322 | US-004: Create Named Projects with Tags | P0 | Triage | 2026-01-22 |
| EPD-1321 | US-003: Create Formatted Output (e.g., Candidate Bio) | P0 | Triage | 2026-01-22 |
| EPD-1320 | US-002: Generate Post-Call Notes from Transcription | P0 | Triage | 2026-01-22 |
| EPD-1319 | US-001: Enable Transcription-Only Mode | P0 | Triage | 2026-01-22 |
| EPD-1305 | Add deal interaction sentiment timeline graph + risk factor breakdown | P0 | Backlog | 2025-12-23 |
| EPD-1263 | Capture offline updates: quick 'record yourself' note in company view | P0 | Backlog | 2025-12-23 |
| EPD-1247 | Auto-tag + auto-assign bug tickets from description | P0 | Backlog | 2025-12-22 |
| EPD-1183 | Make it easier to reduce bias by analyzing churned/new/non-users feedback | P0 | Backlog | 2025-12-22 |
| EPD-1182 | Need ability to 'chat with' and quickly synthesize across many calls | P0 | Backlog | 2025-12-22 |
| EPD-1118 | Auto-run deal summary template without manual query | P0 | Backlog | 2025-12-22 |
| EPD-1051 | Create follow-up tasks from call commitments | P0 | Backlog | 2025-12-19 |
| EPD-1050 | Filter/Search Past Meetings to exclude voicemails | P0 | Backlog | 2025-12-19 |
| EPD-1007 | Gmail agent: handle large inboxes without context window maxing out | P0 | Backlog | 2025-12-19 |

**Feature Request Themes:**
1. **New Vertical (Recruiting)** - US-001 through US-007 series
2. **Deal Intelligence** - Sentiment timeline, risk breakdown, proactive summaries
3. **Conversation Intelligence** - Multi-call synthesis, call filtering
4. **Automation** - Task creation, auto-tagging, templates
5. **Integration Scaling** - Gmail large inbox handling

---

## ✅ Recently Completed (Done/Validated)

| ID | Title | Updated |
|----|-------|---------|
| EPD-4 | Organize chats in AskElephant and remove grey background on paste | 2026-01-22 |
| EPD-7 | Allow adding domains to prevent call recording | 2026-01-22 |
| EPD-1314 | Grain call import setup | 2026-01-21 |
| EPD-2 | Determine if Notetaker bot stops screenshare recording when pinning a speaker | 2026-01-13 |
| EPD-9 | Separate experimental feature flags into dedicated workspace | 2026-01-13 |
| EPD-3 | Add version history to restore previous workflow states | 2025-12-20 |
| EPD-5 | Pull Salesforce dialer calls into Askelephant like HubSpot | 2025-12-17 |
| EPD-10 | Sync Strive TSM Pilot with AskElephant customer feedback platform | 2025-12-06 |

---

## 🎯 Strategic Patterns

### High-Volume Areas Requiring Investment

1. **Automations (272 issues)** - Workflow builder complexity, reliability, UX
2. **HubSpot (124 issues)** - Deep integration demand, agent accuracy
3. **General Integrations (121 issues)** - Ecosystem expansion pressure
4. **UX/Conversations (240 combined)** - Core product polish

### Emerging Themes

1. **Recruiting/Staffing Vertical** - US-001-007 series suggests new market
2. **Analytics Gaps** - Workspace context missing from events
3. **Trust & Transparency** - Privacy concerns, "big brother" perception
4. **Self-Service** - Documentation, capability clarity, feature discovery

### Backlog Health Concerns

- **High Duplicate Rate (29%)** - May indicate redundant intake processes
- **No Priority on 37 P0 issues** - Need triage attention
- **Only 1 Done issue** - This is a capture board, not execution board
- **902 items in Backlog** - Needs prioritization framework

---

## Related Initiatives

- `product-usability` - UX improvements
- `crm-exp-ete` - HubSpot/Salesforce experience
- `composio-agent-framework` - Integration framework
- `rep-workspace` - Deal workspace features
- `user-onboarding` - Feature discovery issues

## Hypothesis Candidates

Based on patterns in this backlog:

1. **Recruiting vertical expansion** - US-001-007 series suggests untapped market
2. **Automation reliability blocks activation** - Workflow bugs dominate customer issues
3. **Feature discovery is adoption barrier** - Multiple "didn't know it existed" signals
4. **Trust/privacy friction** - "Big brother" perception affecting adoption
5. **Analytics instrumentation incomplete** - Missing workspace context on events

---

## Next Steps

1. **Triage Queue** - Process 13 items in Triage status
2. **P0 Prioritization** - Assign priority to 37 uncategorized items
3. **Bug Investigation** - Workflow Builder reliability (EPD-1047, EPD-516)
4. **Customer-Labeled Review** - Trust/privacy concerns (EPD-1192, EPD-1194)
5. **New Vertical Analysis** - Evaluate recruiting use case (US-001-007)
