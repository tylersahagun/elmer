# Chief of Staff + Meeting Summary — Notion Update Execution Plan

**Date:** 2026-02-17  
**Target Pages:**
- Chief of Staff Experience: https://www.notion.so/ask-elephant/Chief-of-Staff-Experience-30af79b2c8ac8125b850d5df42f68e76
- Meeting Summary: https://www.notion.so/ask-elephant/Meeting-Summary-30af79b2c8ac805985a8fad34b8d07da

---

## Blocker: MCP Not Available in This Session

**Observed:** `list_mcp_resources` returned `Server "notion" not found`. The Notion MCP server is configured in `.mcp.json` but was not connected/available during this session.

**Implication:** Direct API updates (NOTION_UPDATE_PAGE, NOTION_CREATE_NOTION_PAGE, NOTION_QUERY_DATABASE) could not be executed.

**Workaround options:**
1. Run `/notion-admin update chief-of-staff-experience` in a session where Notion MCP is connected (Cursor/Claude with MCP enabled).
2. Run `/full-sync --subpages` to sync PM workspace content and create child pages.
3. Execute manual updates per the field-level plan below.

---

## Task 1: Fill Outcome/Success Properties & PRD Template Sections

### 1a. Chief of Staff Experience (Parent Page)

**Page ID (from URL):** `30af79b2-c8ac-8125-b850-d5df42f68e76`

| Property | Exact Value to Set |
|----------|-------------------|
| **Outcome** | Chief of Staff outcomes become first-class artifacts with AI editability → so that users can consume and modify summaries/briefs/actions without workflow setup → so that daily engagement and action completion increase → so that adoption churn decreases and time-to-value improves → so that retention and expansion improve |
| **Objectives & Success** | **Primary:** Chief of Staff active engagement rate (daily) > 50% targeted users weekly active. **Leading:** Time to first useful artifact < 2 min; Meeting Summary edit completion > 40%; Daily brief open rate > 50%; Weekly brief completion > 35%; 24-hour action completion > 60%. **Guardrail:** Privacy incidents = 0; Incorrect auto-action < 5%; User trust score stable. |
| **Pillar** | Customer Trust |
| **Internal Docs Complete** | PRD, Research, Metrics (if multi-select exists) |

**Page body — PRD template sections (add if empty):**
- Copy full content from `pm-workspace-docs/initiatives/active/chief-of-staff-experience/prd.md`
- Ensure: Overview, Problem Statement, Target Personas, Outcome Chain, Success Metrics, User Stories, E2E Experience (Discovery → Activation → Usage → Ongoing Value → Feedback Loop), Scope, Dependencies, Timeline, Open Questions

### 1b. Meeting Summary (Child Project Page)

**Page ID:** `30af79b2-c8ac-8059-85a8-fad34b8d07da`

| Property | Exact Value to Set |
|----------|-------------------|
| **Outcome** | Meeting Summary as first-class artifact with templates + AI edit → so that users can quickly shape summary output to match team needs → so that recap consumption and trust increase → so that follow-up execution improves → so that revenue workflow reliability improves |
| **Objectives & Success** | **Primary:** Summary edit completion > 40% of opens. **Leading:** Time to first useful summary < 2 min; Summary share/action follow-through > 55%. **Timeline:** Beta for time metric; Beta + 30 days for edit completion; GA + 30 days for follow-through. |

**PRD content:** Sync from `pm-workspace-docs/initiatives/active/chief-of-staff-experience/meeting-summary/prd.md`

---

## Task 2: Create Child Pages for Meeting Prep, Daily Brief, Weekly Brief, Action Items

**Context:** Meeting Prep, Daily Brief, Weekly Brief, and Action Items do **not** have `notion_project_id` in their `_meta.json` — they need to be created as child pages under Chief of Staff Experience.

**Recommended approach:** Create nested pages **inside** the Chief of Staff Experience project page (per notion-schema-proposal: "pages inside pages" is allowed).

### 2a. Create Each Child Page

| Child Page Name | Parent | Content Source | Hypothesis ID |
|-----------------|--------|----------------|----------------|
| Meeting Prep | Chief of Staff Experience | `chief-of-staff-experience/meeting-prep/prd.md` | hyp-chief-of-staff-action-first |
| Daily Brief | Chief of Staff Experience | `chief-of-staff-experience/daily-brief/prd.md` | hyp-chief-of-staff-cross-signal-brief |
| Weekly Brief | Chief of Staff Experience | `chief-of-staff-experience/weekly-brief/prd.md` | hyp-chief-of-staff-cross-signal-brief |
| Action Items | Chief of Staff Experience | `chief-of-staff-experience/action-items/prd.md` | hyp-chief-of-staff-action-first |

### 2b. For Each Child Page — Outcome/Success (copy-paste)

**Meeting Prep**
- **Outcome:** Automated prep artifact before meetings → so that users enter calls with context and clear objectives → so that call quality and decision quality improve → so that post-call follow-through improves → so that revenue outcomes improve
- **Success:** Prep artifact viewed before meeting > 55%; Time spent gathering context -40%; Follow-up quality +20% trend

**Daily Brief**
- **Outcome:** Cross-signal daily brief with action-first ordering → so that users have one trusted daily operating readout → so that they execute higher-priority actions earlier → so that team throughput and consistency increase → so that revenue outcomes improve
- **Success:** Daily brief open rate > 50%; Action completion from daily brief > 60% in 24h; Repeat daily usage (7-day) > 45%

**Weekly Brief**
- **Outcome:** Weekly brief with trends and carry-forward commitments → so that teams can review progress and reset execution → so that missed follow-through decreases → so that forecast confidence improves → so that business outcomes improve
- **Success:** Weekly brief open/completion > 35%; Carry-forward completion next week > 65%; Weekly risk acknowledgment > 70%

**Action Items**
- **Outcome:** Unified action queue with approve/edit/schedule controls → so that users can execute high-impact actions quickly → so that follow-up latency decreases → so that opportunities and accounts progress faster → so that win/retention outcomes improve
- **Success:** 24-hour action completion > 60%; Action recommendation acceptance > 50%; Follow-up scheduling conversion > 35%

### 2c. Command to Run (when MCP available)

```
/full-sync --subpages
```
Or:
```
/notion-admin create project Chief of Staff - Meeting Prep
```
(Repeat for Daily Brief, Weekly Brief, Action Items — then move/link as children of Chief of Staff Experience if the create adds to Projects DB)

**Manual alternative:** In Notion, open Chief of Staff Experience page → click "+" at bottom → add page "Meeting Prep" (etc.) → paste PRD content from local files.

---

## Task 3: Link Product Feedback and Hypotheses to Correct Projects

### 3a. Hypothesis-to-Project Mapping

| Hypothesis ID | Notion Project to Link |
|---------------|------------------------|
| hyp-chief-of-staff-platform | Chief of Staff Experience (parent) |
| hyp-chief-of-staff-first-class-artifacts | Meeting Summary |
| hyp-chief-of-staff-action-first | Meeting Prep, Action Items |
| hyp-chief-of-staff-cross-signal-brief | Daily Brief, Weekly Brief |
| hyp-chief-of-staff-recap-hub | Chief of Staff Experience (related) |
| hyp-chief-of-staff-daily-hub | Chief of Staff Experience (related) |
| hyp-proactive-approval-hub | Chief of Staff Experience, Action Items |

**Note:** If Notion Projects DB has a "Hypotheses" relation column, link these. If hypotheses live in a separate DB, ensure the relation points to the correct project rows.

### 3b. Product Feedback Signals to Link

From `pm-workspace-docs/signals/_index.json`, these signals relate to Chief of Staff sub-initiatives:

| Signal ID | Topic | Related Initiatives | Link to Project |
|----------|-------|---------------------|------------------|
| sig-2026-02-09-rob-feedback-agent-command-center-v9 | agent-command-center validation | agent-command-center, chief-of-staff | Chief of Staff Experience |
| sig-2026-02-01-signal-synthesis-week-5 | signal synthesis | hyp-chief-of-staff-daily-hub, hyp-proactive-approval-hub | Chief of Staff Experience |
| sig-2026-01-30-meeting-page-view-brainstorm | meeting-page-view-chief-of-staff-ux | meeting-summary, chief-of-staff, action-items | Meeting Summary, Action Items |
| sig-2026-01-29-product-conversation-sam-ho-skylar-sanford | product-vision-roadmap-board-deck | chief-of-staff | Chief of Staff Experience |
| sig-2026-01-29-product-vision-robert-henderson | product-vision-chief-of-staff-interface | chief-of-staff | Chief of Staff Experience |

**Product Feedback Database:** `308f79b2-c8ac-81d1-a3ff-f1dad31a4edd`  
**Required:** Ensure Product Feedback DB has "Project" relation to Projects DB (manual setup per notion-db-architecture-2026-02-16.md Phase 3). Then, for each feedback row that matches the above, set Project relation to the correct project.

### 3c. Manual Steps for Feedback Linking

1. Open Product Feedback database in Notion.
2. Search/filter for entries mentioning: chief-of-staff, meeting-summary, meeting-prep, daily-brief, weekly-brief, action-items, Rob Henderson, Sam Ho, meeting page view.
3. For each match: set **Project** relation to the corresponding Notion project (Chief of Staff Experience, Meeting Summary, or sub-project once created).

---

## Summary Checklist

- [ ] Chief of Staff Experience: Outcome, Objectives & Success, PRD body filled
- [ ] Meeting Summary: Outcome, Objectives & Success, PRD body filled
- [ ] Create child page: Meeting Prep
- [ ] Create child page: Daily Brief
- [ ] Create child page: Weekly Brief
- [ ] Create child page: Action Items
- [ ] Link hypotheses to correct projects (if relation exists)
- [ ] Link product feedback rows to correct projects

---

## Files Referenced

| Local Path | Purpose |
|------------|---------|
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/prd.md` | Parent PRD content |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/METRICS.md` | Success metrics detail |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/meeting-summary/prd.md` | Meeting Summary PRD |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/meeting-prep/prd.md` | Meeting Prep PRD |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/daily-brief/prd.md` | Daily Brief PRD |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/weekly-brief/prd.md` | Weekly Brief PRD |
| `pm-workspace-docs/initiatives/active/chief-of-staff-experience/action-items/prd.md` | Action Items PRD |
| `pm-workspace-docs/signals/_index.json` | Product feedback signal index |
| `pm-workspace-docs/hypotheses/_index.json` | Hypothesis index |
