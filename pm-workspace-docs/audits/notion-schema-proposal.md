# Notion Schema Proposal: Projects Database as Source of Truth

> **Status:** Draft v3 — refined document architecture (pages-inside-pages vs external links)
> **Date:** February 9, 2026
> **Source meetings:**
>
> - Trio Sync (Tyler, Sam, Bryan) — Feb 9, 10:04 AM
> - Product x Marketing Weekly (Tyler, Sam, Kenzie, Skylar, Tony) — Feb 9, 1:01 PM
> - Post-meeting refinement: Tyler clarified document hosting model
>
> **Launch Planning DB (to merge):** https://www.notion.so/296f79b2c8ac805682d2e2c49a1b53ef?v=2e1f79b2c8ac80f7802c000c60de2cd1

---

## Revision History

| Version | Source | Key Change |
|---------|--------|------------|
| **v1** | Trio Sync | Proposed subpages per project for PRDs, Design Briefs, etc. |
| **v2** | Product x Marketing | Sam rejected subitems/subpages. Merge Kenzie's DB. URL columns + views. |
| **v3** | Post-meeting refinement | Clarified document hosting: **pages-inside-pages** for Notion-authored content, external links for everything else. No subitems (database hierarchy), but nested pages inside project pages are fine. |

### Sam's Directives (unchanged from v2)

| Topic | Directive | Quote |
|-------|-----------|-------|
| Subitems | **No database subitems/subprojects** | "Let's not use the subprojects for this... before we change the hierarchy, it gets messier" |
| Separate DBs | **Merge Kenzie's Launch Planning DB** into Projects DB | "Your source of truth, your project names, there should not be two separate project names" |
| Links | **Links in columns are fine** | "You can have links in the column. I think that's totally fine." |
| Views | **Custom views per audience** | "Create a custom view that has its default filters just for product marketing purposes" |

### Clarification: "Subitems" vs "Pages inside pages"

**These are two different things in Notion:**

- **Subitems/Subprojects** = A database feature where rows have parent-child relationships in the DB hierarchy. This creates nested rows in table view. **Sam said NO to this.**
- **Pages inside pages** = Regular Notion page nesting. When you open a project page, you can create pages inside it — they appear at the bottom of the page body. This is just normal content organization. **This is fine.**

The approach: project pages in the DB can contain nested pages for documents authored in Notion (KB articles, SOPs, marketing briefs). URL columns on the DB row link to those nested pages. From the table view, you see a link. When you open the project page, you see the documents listed.

---

## Problem Statement

- Product updates live in Slack (#product-updates) and are ephemeral — no archive, no history
- Project documentation (PRDs, design briefs, specs) lives in Tyler's PM workspace (git) — not accessible to non-engineers
- No single view to answer: "What changed this week across all projects?"
- No single view to answer: "Which projects are missing launch materials?"
- Weekly updates from Tyler exist but aren't connected to the projects they reference
- CS team (Ben Harrison) keeps getting surprised by changes
- **Kenzie maintains a separate launch planning database** with different project names — causes maintenance overhead, sync drift, and duplication
- **No tier-based template** for what deliverables are required at each launch tier
- **No triggered onboarding** — features launch to all users at once instead of journey-based activation

## Design Principles (Updated v3)

1. **One database, multiple views** — no duplicating databases for different audiences
2. **No database subitems** — no parent-child row hierarchy in the DB (Sam's directive)
3. **Pages-inside-pages for Notion-authored content** — KB articles, SOPs, marketing briefs live as pages nested inside the project page. URL columns link to them.
4. **External links for external content** — Loom, Storylane, Slack, Figma links point outward. URL columns link to them.
5. **Flexible hosting for PM docs** — PRDs, Design Briefs, Eng Specs can live wherever makes sense (Notion page, Google Doc, git). The column is just a URL.
6. **Tyler writes in PM workspace, company reads in Notion** — authoring stays fast (markdown + AI), consumption is in Notion
7. **Tier-based templates define required deliverables** — each PMM tier (P1-P4) has a defined checklist of what's needed at each release stage
8. **Merge, don't mirror** — Kenzie's launch planning merges INTO the Projects DB; no separate copy

---

## Architecture Overview

```
📊 Projects DB (existing - 2c0f79b2-c8ac-802c-8b15-c84a8fce3513)
│
│   22+ project rows, each with:
│   ├── Properties (columns) for ALL tracking + URL links
│   ├── Launch planning status & dates
│   └── Page body containing:
│       ├── Narrative content (outcome, objectives, decisions)
│       └── Nested pages for Notion-authored docs:
│           ├── 📄 KB Article (authored by Kenzie in Notion)
│           ├── 📄 SOP (pasted from Loom AI)
│           ├── 📄 Marketing Brief (authored by Kenzie)
│           └── 📄 [other Notion-native content]
│
│   Multiple VIEWS on this single DB:
│   ├── "All Projects" (default — existing)
│   ├── "🚀 Launch Planning" (replaces Kenzie's separate DB)
│   ├── "📣 Product x Marketing" (filtered for PMM meetings)
│   ├── "👑 Council of Product" (leadership view)
│   ├── "🔧 Trio Sync" (Tyler + Sam + Bryan working view)
│   ├── "⚙️ Eng Standup" (engineering status)
│   ├── "📊 Gap Tracker" (missing assets/docs)
│   ├── "🎯 Customer-Facing" (for CS/Revenue team)
│   └── "📋 Weekly Snapshot" (what changed this week)
│
├── 📰 Weekly Updates DB (NEW — separate, related database)
│   └── [Time-stamped update entries, each related to a Project]
│
└── 📋 Product Updates Hub (NEW — page with linked views from both DBs)
```

**Key design:** The Projects DB is the **single source of truth** for all project tracking. Kenzie's launch planning data merges in as columns. Different audiences see different views — nobody maintains a separate copy.

---

## Document Hosting Model

Not all documents live in the same place. The URL columns are **format-agnostic** — they just point to wherever the content lives. Here's the decision framework:

### Three hosting patterns

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. PAGES INSIDE PAGES (Notion-authored content)                     │
│                                                                     │
│    For: Content written/edited directly in Notion by the team       │
│    Examples: KB articles, SOPs, marketing briefs, launch checklists │
│    How: Create a page inside the project page → copy its URL →      │
│         paste into the URL column on the DB row                     │
│    Who sees it: From table view = clickable link.                   │
│                 From project page = listed at bottom of page body.  │
│                                                                     │
│    📊 Projects DB row: [Global Chat]                                │
│         │  KB Article column = notion.so/kb-global-chat-abc123      │
│         │                                                           │
│         └── 📄 Project page body                                    │
│              ├── Outcome, Objectives, Decisions...                  │
│              └── 📄 KB Article: Global Chat  ← URL points here     │
│                   └── (full help article content)                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 2. STANDALONE NOTION PAGES (PM docs synced to Notion)               │
│                                                                     │
│    For: Documents Tyler writes in PM workspace, synced for reading  │
│    Examples: PRDs, Design Briefs, Eng Specs, Research               │
│    How: Tyler syncs doc to a standalone Notion page → pastes URL    │
│         into the URL column on the DB row                           │
│    Why standalone: These docs are "reference" — people read them,   │
│         not edit them. They don't need to live inside the project.  │
│    Alternative: Link to Google Doc or git file instead.             │
│                                                                     │
│    📊 Projects DB row: [Global Chat]                                │
│         PRD Link column = notion.so/prd-global-chat-xyz789          │
│                              ↓                                      │
│         📄 PRD: Global Chat & Internal Search (standalone page)     │
│              └── (synced from pm-workspace/initiatives/...)         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 3. EXTERNAL LINKS (content hosted elsewhere)                        │
│                                                                     │
│    For: Content that natively lives on another platform             │
│    Examples: Loom videos, Storylane demos, Slack messages,          │
│              Figma files, PostHog dashboards, Linear projects       │
│    How: Paste the external URL into the URL column                  │
│                                                                     │
│    📊 Projects DB row: [Global Chat]                                │
│         Loom Video column = loom.com/share/abc123                   │
│         Storylane Demo column = storylane.io/demo/xyz               │
│         Linear Link column = linear.app/project/ABC                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Document hosting decision matrix

| Document | Hosting Pattern | Where It Lives | URL Column Points To | Who Authors |
|----------|----------------|----------------|---------------------|-------------|
| **KB Article** | Pages-inside-pages | Page inside project page | Internal Notion URL | Kenzie |
| **SOP** | Pages-inside-pages | Page inside project page (pasted from Loom AI) | Internal Notion URL | Tyler |
| **Marketing Brief** | Pages-inside-pages | Page inside project page | Internal Notion URL | Kenzie / Tony |
| **Launch Checklist** | Pages-inside-pages | Page inside project page | Internal Notion URL | Kenzie |
| **Customer Email Draft** | Pages-inside-pages | Page inside project page | Internal Notion URL | Kenzie |
| **FAQ** | Pages-inside-pages | Page inside project page | Internal Notion URL | Kenzie (from meeting transcripts) |
| **PRD** | Standalone page | Standalone Notion page (synced from PM workspace) | Internal Notion URL | Tyler |
| **Design Brief** | Standalone page | Standalone Notion page OR Figma link | Internal or external URL | Tyler / Skylar |
| **Eng Spec** | Standalone page | Standalone Notion page (synced from PM workspace) | Internal Notion URL | Tyler |
| **Research** | Standalone page | Standalone Notion page (synced from PM workspace) | Internal Notion URL | Tyler |
| **Loom Video** | External | loom.com | External URL | Tyler |
| **Storylane Demo** | External | storylane.io | External URL | Kenzie |
| **In-App Tour** | External | PostHog | External URL | Kenzie / Tyler |
| **Slack Update** | External | Slack permalink | External URL | Tyler |
| **Linear Project** | External | linear.app | External URL | Tyler |
| **Prototype** | External | Chromatic / Storybook | External URL | Tyler |
| **Figma Design** | External | figma.com | External URL | Skylar |

### Why this hybrid works

1. **From the table view:** Every document looks the same — it's just a clickable URL in a column. Sam's directive is satisfied: no subitems, no database hierarchy.
2. **From the project page:** Notion-authored content (KB articles, SOPs, briefs) appears at the bottom of the page body as nested pages. Kenzie opens the project → sees everything in context → edits inline.
3. **From cross-project views:** You can still filter "KB Article column is empty" to find gaps — it doesn't matter whether the URL points to a page-inside-page or an external site.
4. **No maintenance overhead:** Pages-inside-pages are self-contained within the project. If you archive the project, the nested pages go with it. No orphaned documents.

### Workflow example: Kenzie creates a KB article

```
1. Kenzie opens Projects DB → "Product x Marketing" view
2. Clicks on "Global Chat" project row → opens project page
3. At bottom of page, clicks "+ Add a page" → names it "KB Article: Global Chat"
4. Writes the help article content inside that page
5. Copies the URL of that nested page
6. Goes back to the DB table view
7. Pastes the URL into the "KB Article" column
8. Done — now the link appears in all views, and the content lives inside the project
```

### Workflow example: Tyler links a PRD

```
1. Tyler writes/updates prd.md in PM workspace
2. Tyler runs /full-sync → syncs PRD to a standalone Notion page
3. Tyler copies the Notion page URL
4. Tyler pastes it into the "PRD Link" column on the Projects DB row
5. Done — Sam, Bryan, Kenzie can click the link to read the PRD
```

---

## 1. Projects DB: Complete Column Schema

### Existing columns (keep as-is)

| Column               | Type      | Status                                                  |
| -------------------- | --------- | ------------------------------------------------------- |
| Project name         | Title     | Exists                                                  |
| Project Phase        | Status    | Exists (Done, Test, Build, Definition)                  |
| Visibility           | Select    | Exists (Internal Only, Invite-only Beta, Open Beta, GA) |
| Outcome              | Rich text | Exists                                                  |
| Objectives & Success | Rich text | Exists                                                  |
| Weekly Status Update | Rich text | Exists (running log)                                    |
| Linear Link          | URL       | Exists                                                  |
| Prototype Link       | URL       | Exists                                                  |
| PMM Tier             | Select    | Exists (p1, p2, p3, p4)                                 |
| GTM                  | Relation  | Exists                                                  |
| Weekly Updates       | Relation  | Exists (will link to new Weekly Updates DB)             |
| Product Tickets      | Relation  | Exists                                                  |
| Closed Beta Target   | Date      | Exists                                                  |
| Open Beta Target     | Date      | Exists                                                  |
| GA Target Launch     | Date      | Exists                                                  |

### New columns: Internal Documentation Links (→ Standalone Notion pages or external)

URL columns pointing to standalone Notion pages (synced from PM workspace) or external docs. Tyler populates these after authoring/syncing. See "Document Hosting Model" section above for full details.

| Column | Type | Points To | Hosting Pattern | Who Populates |
|--------|------|-----------|-----------------|---------------|
| **PRD Link** | URL | Standalone Notion page (synced) or Google Doc | Standalone page | Tyler |
| **Design Brief Link** | URL | Standalone Notion page or Figma file | Standalone / External | Tyler / Skylar |
| **Eng Spec Link** | URL | Standalone Notion page (synced) | Standalone page | Tyler / Bryan |
| **Research Link** | URL | Standalone Notion page (synced) | Standalone page | Tyler |

### New columns: Launch Assets — External links

URL columns pointing to content hosted on external platforms.

| Column | Type | Points To | Hosting Pattern | Who Populates |
|--------|------|-----------|-----------------|---------------|
| **Loom Video** | URL | loom.com recording | External | Tyler |
| **Storylane Demo** | URL | storylane.io interactive walkthrough | External | Kenzie |
| **In-App Tour** | URL | PostHog in-app tour config | External | Kenzie / Tyler |
| **Product Update Slack** | URL | Slack permalink to #product-updates message | External | Tyler |

### New columns: Launch Assets — Pages-inside-pages (Notion-authored content)

URL columns pointing to pages **nested inside the project page**. Content is authored directly in Notion by the team. From the DB table view, they look like any other link. From inside the project page, the documents appear at the bottom as nested pages — editable in place.

| Column | Type | Points To | Hosting Pattern | Who Authors |
|--------|------|-----------|-----------------|-------------|
| **KB Article** | URL | Page nested inside the project page | Pages-inside-pages | Kenzie |
| **SOP** | URL | Page nested inside the project page (pasted from Loom AI) | Pages-inside-pages | Tyler |
| **Marketing Brief** | URL | Page nested inside the project page | Pages-inside-pages | Kenzie / Tony |
| **Customer Email Draft** | URL | Page nested inside the project page | Pages-inside-pages | Kenzie |
| **FAQ** | URL | Page nested inside the project page (generated from transcripts) | Pages-inside-pages | Kenzie |

### New columns: Launch Planning (merged from Kenzie's DB)

These columns replicate what Kenzie tracked separately so her launch planning DB can be retired.

| Column                     | Type      | Options                                                             | Purpose                                                              |
| -------------------------- | --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Launch Planning Status** | Select    | `Not Started`, `In Progress`, `Blocked`, `Ready`, `Launched`, `N/A` | Where is the marketing prep for this launch?                         |
| **Launch Blocked By**      | Rich text | Free text                                                           | What's blocking launch planning (e.g., "Missing Loom from Tyler")    |
| **Target Launch Date**     | Date      | —                                                                   | When this is expected to actually launch (may differ from GA Target) |
| **Marketing Owner**        | Person    | —                                                                   | Who on marketing owns the launch materials                           |

### New columns: Tracking & Gap Detection

| Column                     | Type         | Options                                                                                         | Purpose                                                                                             |
| -------------------------- | ------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Internal Docs Complete** | Multi-select | `PRD`, `Design Brief`, `Eng Spec`, `Research`, `Metrics`                                        | Which internal docs exist? (for gap tracking)                                                       |
| **Launch Assets Complete** | Multi-select | `Loom`, `SOP`, `KB Article`, `Storylane`, `In-App Tour`, `Customer Email`, `Slack Announcement` | Which launch materials are done? (for gap tracking)                                                 |
| **Customer-Facing**        | Checkbox     | —                                                                                               | Is this visible to customers right now? (derived from Visibility field, but explicit for filtering) |

### Project page body structure

Each project page has two layers: **inline content** (visible when you open the page) and **nested pages** (listed at the bottom, authored directly in Notion).

```
📦 [Project Name] — project page

  ┌─── INLINE CONTENT (visible immediately when page opens) ───┐
  │                                                             │
  │  ## Overview                                                │
  │  [Outcome + Objectives — exists in rich text fields]        │
  │                                                             │
  │  ## Key Links                                               │
  │  - PRD: [link]                                              │
  │  - Design: [link]                                           │
  │  - Linear: [link]                                           │
  │  - Prototype: [link]                                        │
  │                                                             │
  │  ## Key Decisions                                           │
  │  [Running log of important decisions made]                  │
  │                                                             │
  │  ## Weekly Status Log                                       │
  │  [Running log — also in the rich text DB column]            │
  │                                                             │
  │  ## Notes                                                   │
  │  [Free-form context]                                        │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

  ┌─── NESTED PAGES (listed at bottom, authored in Notion) ────┐
  │                                                             │
  │  📄 KB Article: [Project Name]       ← Kenzie authors here │
  │  📄 SOP: [Project Name]             ← Tyler pastes from    │
  │                                        Loom AI output       │
  │  📄 Marketing Brief: [Project Name]  ← Kenzie/Tony author  │
  │  📄 Customer Email Draft             ← Kenzie drafts here  │
  │  📄 FAQ: [Project Name]             ← Generated from       │
  │                                        meeting transcripts  │
  │                                                             │
  │  (Each of these has its own URL that goes into              │
  │   the corresponding URL column on the DB row)               │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

**No database subitems.** These nested pages are regular Notion page nesting — they don't create parent-child rows in the database. From the table view, you only see the URL columns linking to them.

---

## 2. Database Templates & Nested Page Templates

Notion database templates let you pre-create the entire project page structure -- including nested pages -- in one click. Each PMM tier gets a template that auto-generates only the nested pages required for that tier's launch process.

### How Notion database templates work

1. Open the Projects DB → click the dropdown arrow next to "+ New" → "New template"
2. Build a template page with pre-populated properties, sections, and nested pages
3. When anyone creates a new project from that template, they get the full structure instantly
4. For **existing** projects, use a Notion "Button" block inside the project page to generate missing nested pages on demand

### Template: 🔴 P1 Launch (Major)

**Examples:** Chat V2, Global Chat GA, Mobile v2 Redesign

**Pre-populated properties:**
- PMM Tier → `p1`
- Launch Planning Status → `Not Started`

**Page body sections:**
```
## Overview
> [Describe the feature, who it's for, and the business outcome]

## Key Links
- PRD: [link]
- Design: [link]  
- Linear: [link]
- Prototype: [link]

## Key Decisions
| Date | Decision | Who | Context |
|------|----------|-----|---------|
| | | | |

## Launch Checklist
### Internal (Tyler owns)
- [ ] Loom video recorded → paste URL in Loom Video column
- [ ] SOP generated from Loom AI → create SOP page below
- [ ] PRD synced to Notion → paste URL in PRD Link column
- [ ] Design brief linked → paste URL in Design Brief Link column
- [ ] Eng spec linked → paste URL in Eng Spec Link column
- [ ] PostHog instrumentation confirmed
- [ ] #product-updates Slack post → paste permalink in column

### External (Kenzie owns)
- [ ] KB article written → create KB Article page below, paste URL in column
- [ ] Storylane interactive demo → paste URL in Storylane Demo column
- [ ] In-app onboarding tour (PostHog) → paste URL in In-App Tour column
- [ ] Customer email announcement → create Customer Email page below
- [ ] Sales enablement brief → create Marketing Brief page below
- [ ] FAQ document → create FAQ page below
- [ ] Release notes entry
- [ ] Newsletter feature

## Weekly Status Log
[Running updates — also synced to Weekly Status Update column]
```

**Auto-created nested pages (inside the project page):**

📄 **KB Article: [Project Name]**
```
# [Project Name] — Knowledge Base Article

## What is [Feature Name]?
> [1-2 sentence explanation for customers]

## How to use it
### Getting started
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Key features
- **[Feature A]:** [description]
- **[Feature B]:** [description]

## Frequently Asked Questions

### [Question 1]?
[Answer]

### [Question 2]?
[Answer]

## Troubleshooting
| Issue | Solution |
|-------|----------|
| | |

## Related articles
- [Link to related KB article]

---
*Last updated: [date]*
*Owner: Kenzie*
```

📄 **SOP: [Project Name]**
```
# [Project Name] — Standard Operating Procedure

> Generated from Loom AI — paste Loom transcript output below, then refine.

## Purpose
[What process does this SOP document?]

## When to use
[Triggers / scenarios where this SOP applies]

## Steps
1. **[Action]** — [detail]
2. **[Action]** — [detail]
3. **[Action]** — [detail]

## Common scenarios
### Scenario A: [description]
[Steps specific to this scenario]

### Scenario B: [description]
[Steps specific to this scenario]

## Escalation
[When to escalate, who to contact]

---
*Source: Loom recording [link]*
*Owner: Tyler*
```

📄 **Marketing Brief: [Project Name]**
```
# [Project Name] — Marketing Brief

## Summary
[2-3 sentences: what it is, who it's for, why it matters]

## Target audience
- **Primary:** [persona]
- **Secondary:** [persona]

## Key messages
1. [Message 1 — benefit-oriented]
2. [Message 2 — differentiation]
3. [Message 3 — urgency/timeliness]

## Positioning
**Before:** [How users solve this today]
**After:** [How they solve it with this feature]

## Launch channels
- [ ] Email announcement
- [ ] Newsletter mention
- [ ] In-app tour
- [ ] Storylane demo
- [ ] Social post
- [ ] Blog post

## Competitive context
[How competitors handle this. What makes our approach different.]

## Success metrics
[How will we know the launch was successful?]

---
*Owner: Kenzie / Tony*
```

📄 **Customer Email Draft: [Project Name]**
```
# [Project Name] — Customer Email

**Subject:** [draft subject line]

**Preview text:** [draft preview]

---

Hi [First Name],

[Opening — context for why this matters to them]

[Body — what's new, how to use it, key benefit]

[CTA — what you want them to do next]

[Closing]

Best,
The AskElephant Team

---
*Segment: [who receives this]*
*Send date: [target]*
*Owner: Kenzie*
```

📄 **FAQ: [Project Name]**
```
# [Project Name] — Frequently Asked Questions

> Start by pasting questions from meeting transcripts, CS team, and beta feedback.
> Then refine into customer-facing FAQ.

## Internal FAQ (for CS/Sales team)

### [Question from CS]?
[Answer with internal context]

### [Question from Sales]?
[Answer with internal context]

## External FAQ (for customers)

### [Question]?
[Answer — customer-facing language]

### [Question]?
[Answer — customer-facing language]

---
*Sources: [meeting transcripts, beta feedback, CS questions]*
*Owner: Kenzie*
```

📄 **Research: [Project Name]**
```
# [Project Name] — User Research

## Research goals
[What questions are we trying to answer?]

## Methodology
[Interviews / surveys / analytics / beta feedback]

## Participants
| # | Role | Company type | Date |
|---|------|-------------|------|
| 1 | | | |

## Key findings

### Finding 1: [title]
> "[Verbatim quote from user]" — [Role, Company]

[Analysis]

### Finding 2: [title]
> "[Verbatim quote from user]" — [Role, Company]

[Analysis]

## Jobs to be done
- **When** [situation], **I want to** [action], **so I can** [outcome]

## Recommendations
1. [Recommendation based on findings]
2. [Recommendation based on findings]

---
*Owner: Tyler*
```

📄 **PRD: [Project Name]**
```
# [Project Name] — Product Requirements Document

## TL;DR
[2-3 sentences: what, why now, success looks like]

## Problem statement
[What problem are we solving? For whom?]

## Outcome chain
[Feature] → [user behavior change] → [business result]

## Personas
- **Primary:** [persona name + description]
- **Secondary:** [persona name]

## User stories
- As a [persona], I want [capability], so I can [outcome]

## Requirements

### Must have (P0)
- [ ] [Requirement]
- [ ] [Requirement]

### Should have (P1)
- [ ] [Requirement]

### Nice to have (P2)
- [ ] [Requirement]

## Out of scope
- [Explicitly not doing]

## Success metrics
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| | | | |

## E2E Experience
1. **Discovery:** How do users find this?
2. **Activation:** What's the first-run experience?
3. **Usage:** What does ongoing use look like?
4. **Ongoing Value:** How does this compound over time?
5. **Feedback Loop:** How do we learn post-launch?

---
*Owner: Tyler*
*Status: Draft / In Review / Approved*
```

📄 **Design Brief: [Project Name]**
```
# [Project Name] — Design Brief

## Context
[Link to PRD. What's the feature? Who's it for?]

## Design goals
1. [Goal — tied to user outcome]
2. [Goal — tied to usability]
3. [Goal — tied to brand/trust]

## User flow
[Step-by-step of the ideal user journey]

## Key screens / states
- **Default state:** [description]
- **Loading state:** [description]
- **Success state:** [description]
- **Error state:** [description]
- **Empty state:** [description]

## Constraints
- [Technical constraints]
- [Brand/design system constraints]
- [Accessibility requirements]

## References
- [Competitive examples]
- [Internal patterns to follow]

## Figma link
[link]

---
*Owner: Tyler / Skylar*
```

📄 **Eng Spec: [Project Name]**
```
# [Project Name] — Engineering Specification

## TL;DR for Engineers
- **What:** [one sentence]
- **Why now:** [one sentence]
- **Success looks like:** [one sentence]
- **Scope boundary:** [what's in / what's out]
- **Ship date:** [target]

## Technical approach
[High-level architecture / approach]

## API changes
[New endpoints, schema changes, etc.]

## Data model
[Database changes, new tables, migrations]

## Dependencies
| Dependency | Owner | Status |
|-----------|-------|--------|
| | | |

## Acceptance criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

## Edge cases
| Scenario | Expected behavior |
|----------|------------------|
| | |

## Feature flag
[Flag name, rollout plan]

## Definition of done
- [ ] All acceptance criteria pass
- [ ] Feature flag configured
- [ ] Staging deployment verified
- [ ] Tyler has seen it working

---
*Owner: Tyler / Bryan*
```

📄 **Metrics: [Project Name]**
```
# [Project Name] — Success Metrics

## North Star metric
[The one metric that matters most for this feature]

## Leading indicators
| Metric | Source | Baseline | Target | Timeframe |
|--------|--------|----------|--------|-----------|
| | PostHog / HubSpot / etc. | | | |

## Lagging indicators
| Metric | Source | Baseline | Target | Timeframe |
|--------|--------|----------|--------|-----------|
| | | | | |

## Guardrail metrics
[Metrics that should NOT get worse]
| Metric | Current | Acceptable range |
|--------|---------|-----------------|
| | | |

## Instrumentation plan
| Event name | Trigger | Properties |
|-----------|---------|------------|
| | | |

## Dashboard
[Link to PostHog dashboard when created]

---
*Owner: Tyler*
```

---

### Template: 🟠 P2 Launch (Significant)

**Examples:** Structured HubSpot Agent, CRM Agent Upgrades, Speaker ID

**Pre-populated properties:**
- PMM Tier → `p2`
- Launch Planning Status → `Not Started`

**Auto-created nested pages:** Same templates as P1, but only these:
- 📄 KB Article
- 📄 SOP
- 📄 FAQ
- 📄 PRD
- 📄 Design Brief (if applicable)
- 📄 Eng Spec

**Launch checklist (in page body):**
```
### Internal (Tyler owns)
- [ ] Loom video recorded
- [ ] SOP generated from Loom AI
- [ ] PRD linked

### External (Kenzie owns)
- [ ] KB article / help doc
- [ ] Storylane interactive demo OR in-app tour
- [ ] #product-updates Slack post
- [ ] Newsletter mention
```

---

### Template: 🟡 P3 Launch (Minor)

**Examples:** UI polish, Speaker ID improvements, minor agent tweaks

**Pre-populated properties:**
- PMM Tier → `p3`
- Launch Planning Status → `Not Started`

**Auto-created nested pages:**
- 📄 KB Article (shorter version — update to existing article if applicable)

**Launch checklist (in page body):**
```
### Internal (Tyler owns)
- [ ] Loom video OR written update
- [ ] PRD linked (if applicable)

### External (Kenzie owns)
- [ ] KB article update (if applicable)
- [ ] #product-updates Slack post
- [ ] Changelog entry
```

---

### Template: 🟢 P4 Launch (Internal-only)

**Examples:** Storybook overhaul, infra changes, internal tooling

**Pre-populated properties:**
- PMM Tier → `p4`
- Launch Planning Status → `Not Started`

**Auto-created nested pages:** None (internal-only, minimal docs)

**Launch checklist (in page body):**
```
### Internal (Tyler owns)
- [ ] Loom video OR written update
- [ ] #product-updates Slack post

### External
- None required (internal-only change)
```

---

### Standalone Document Templates (use à la carte)

Independent of the tier templates, these are **one-off templates** you can create inside any project page at any time. Use them when a project needs a document that its tier didn't auto-generate, or when you want to add structure to a lower-tier project.

**How to use:** Open any project page → type `/template button` → select from the list → a new nested page appears with the full structure.

| Template | What it's for | Typical owner |
|----------|--------------|---------------|
| 📄 PRD | Product requirements — outcome chain, user stories, success metrics | Tyler |
| 📄 Design Brief | Design goals, user flow, key states, constraints, Figma link | Tyler / Skylar |
| 📄 Eng Spec | TL;DR for engineers, technical approach, acceptance criteria, edge cases | Tyler / Bryan |
| 📄 Research | Research goals, methodology, findings with verbatim quotes, JTBD | Tyler |
| 📄 Metrics | North star metric, leading/lagging indicators, instrumentation plan | Tyler |
| 📄 KB Article | Customer-facing help doc with how-to steps, FAQ, troubleshooting | Kenzie |
| 📄 SOP | Internal operating procedure (often pasted from Loom AI output) | Tyler |
| 📄 Marketing Brief | Positioning, key messages, launch channels, competitive context | Kenzie / Tony |
| 📄 Customer Email | Draft announcement email with subject, body, segment, send date | Kenzie |
| 📄 FAQ | Internal + external FAQ (seed from meeting transcripts and beta feedback) | Kenzie |
| 📄 GTM Brief | Go-to-market plan — audience, channels, timeline, success criteria | Kenzie / Tony |
| 📄 Launch Checklist | Custom checklist when the tier template doesn't cover it | Tyler / Kenzie |

**Example:** You have a P4 internal project (Storybook overhaul). The P4 tier template doesn't auto-create any nested pages. But you decide you want a PRD and an Eng Spec for it anyway. You open the project page, use the standalone PRD template and the Eng Spec template, and those two pages appear inside the project. You paste their URLs into the corresponding columns.

**Example:** A P2 project doesn't auto-create a Metrics page. Midway through build, Sam asks "how will we measure success?" You drop the Metrics standalone template into the project page, fill it in, and paste the link into the column.

The standalone templates use the **same content structure** as the tier templates above -- same headings, same prompts, same owner callouts. They're just available individually so you're never locked into what the tier auto-generates.

### Adding templates to existing projects

For the 22 existing projects that were created before templates existed:

**Option A: Standalone templates (recommended)**
1. Open any existing project page
2. Use the standalone document templates above to add whichever nested pages you need
3. Copy each nested page's URL → paste into the corresponding URL column
4. Most flexible — add only what's needed per project

**Option B: Button block for batch generation**
1. Add a `/button` block labeled "Generate Launch Pages" to the project page
2. Configure the button to create the full set of pages for the project's PMM tier
3. Click the button → nested pages appear inside the project
4. Best for catching up multiple projects quickly

**Option C: Tyler batch-generates via `/notion-admin`**
- Run a batch operation to generate nested pages for existing high-priority projects
- Best for initial migration of the top 5-10 projects

### How templates work in practice

**New project flow:**
```
Tyler creates new project → selects "P1 Launch" template
         │
         ▼
Project page created with:
  - Pre-populated properties (PMM Tier = p1, Launch Status = Not Started)
  - Page body with launch checklist
  - 10 nested pages auto-created from tier template
         │
         ▼
Tyler fills in PRD, records Loom, pastes links into URL columns
Kenzie fills in KB Article, Marketing Brief, Customer Email, FAQ
         │
         ▼
As each is completed, they update the Launch Assets Complete multi-select
"Gap Tracker" view shows what's still missing
```

**Existing project flow (standalone templates):**
```
Tyler opens existing project
         │
         ▼
Decides which docs are needed: "This needs a PRD and Metrics page"
         │
         ▼
Uses standalone PRD template + standalone Metrics template
         │
         ▼
Two nested pages appear inside the project with full structure
         │
         ▼
Fills in content, pastes URLs into columns, updates multi-selects
```

**Ad-hoc addition flow:**
```
Sam asks: "Do we have research for this P3 project?"
         │
         ▼
Tyler opens the project → uses standalone Research template
         │
         ▼
Research page appears inside the project
         │
         ▼
Tyler fills it in, pastes URL into Research Link column
"Docs Complete" multi-select updated to include "Research"
```

---

## 3. Meeting-Specific Views

Each recurring meeting gets its own saved view on the Projects DB. Views share the same data — they just filter and display different columns.

### "All Projects" (default — existing)

**Purpose:** Master view for database admin
**Columns shown:** All
**Filter:** None
**Sort:** Project Phase, then PMM Tier
**Used in:** Ad-hoc reference

---

### "👑 Council of Product" View

**Purpose:** Sam + Woody + leadership get the executive view of what's happening across product
**Meeting:** Council of Product (weekly, 10:30 AM)

| Column               | Why                         |
| -------------------- | --------------------------- |
| Project Name         | What it is                  |
| Project Phase        | Where it's at               |
| Visibility           | Who can see it              |
| PMM Tier             | How big is the launch       |
| Weekly Status Update | What changed recently       |
| Target Launch Date   | When it's expected          |
| Customer-Facing      | Is this live for customers? |

**Filter:** Phase != Done
**Sort:** PMM Tier ascending (P1 first), then Phase
**Group by:** None (flat list, sorted by priority)

**What this view answers:**

- "What are the top-priority items across product?"
- "What's launching soon?"
- "Are we on track?"

---

### "📣 Product x Marketing" View

**Purpose:** Tyler + Kenzie + Tony align on launch materials and marketing readiness
**Meeting:** Product x Marketing Weekly (weekly, 1:00 PM)

| Column                 | Why                               |
| ---------------------- | --------------------------------- |
| Project Name           | What it is                        |
| PMM Tier               | What tier of launch               |
| Visibility             | Current release stage             |
| Launch Planning Status | Marketing prep status             |
| Launch Blocked By      | What's holding up marketing       |
| Marketing Owner        | Who owns this on marketing side   |
| Target Launch Date     | When it's going out               |
| Launch Assets Complete | Which materials are done          |
| Loom Video             | Has Tyler recorded the Loom?      |
| KB Article             | Has Kenzie written the help doc?  |
| Storylane Demo         | Has Kenzie built the walkthrough? |
| Customer Email         | Is the announcement draft ready?  |

**Filter:** PMM Tier != empty AND Phase != Done
**Sort:** Target Launch Date ascending (soonest first)
**Group by:** Launch Planning Status

**What this view answers:**

- "Which projects am I (Kenzie) blocked on?"
- "What does Tyler still owe me (Loom, PRD)?"
- "What's launching next and what's the marketing status?"
- "Which launch materials are missing for upcoming releases?"

---

### "🔧 Trio Sync" View

**Purpose:** Tyler + Sam + Bryan working session — product + eng status, decisions needed
**Meeting:** Trio Sync (daily/weekly, 10:00 AM)

| Column                 | Why                            |
| ---------------------- | ------------------------------ |
| Project Name           | What it is                     |
| Project Phase          | Where it's at                  |
| Visibility             | Current release stage          |
| Weekly Status Update   | What happened since last sync  |
| Linear Link            | Jump to engineering tracking   |
| PRD Link               | Quick access to requirements   |
| Eng Spec Link          | Quick access to technical spec |
| Internal Docs Complete | Are eng docs ready?            |
| Launch Blocked By      | Anything blocking progress?    |

**Filter:** Phase != Done
**Sort:** Phase (Build first, then Define, then Test)
**Group by:** Project Phase

**What this view answers:**

- "What's being built right now?"
- "Which projects need PRDs or specs?"
- "Where are we blocked?"
- "What decisions do we need to make?"

---

### "⚙️ Eng Standup" View

**Purpose:** Quick engineering status — what's in progress, what shipped, what's blocked
**Meeting:** Eng Standup (daily, 9:30 AM)

| Column               | Why                          |
| -------------------- | ---------------------------- |
| Project Name         | What it is                   |
| Project Phase        | Current phase                |
| Linear Link          | Jump to sprint board         |
| Prototype Link       | See latest UI                |
| Visibility           | Release stage                |
| Weekly Status Update | Recent changes (abbreviated) |

**Filter:** Phase = Build OR Phase = Test
**Sort:** Project name alphabetical
**Group by:** None (flat list — standup is fast)

**What this view answers:**

- "What are we actively building?"
- "What's in testing?"
- "Quick links to jump into each project's Linear board"

---

### "🚀 Launch Pipeline" View

**Purpose:** Everything approaching or at customer-facing release — for CS, Revenue, and Marketing leadership
**No specific meeting — always-on reference**

| Column                 | Why                  |
| ---------------------- | -------------------- |
| Project Name           | What it is           |
| PMM Tier               | Launch size          |
| Visibility             | Current stage        |
| Target Launch Date     | When it's expected   |
| Launch Planning Status | Is marketing ready?  |
| Launch Assets Complete | What materials exist |
| Customer-Facing        | Live for customers?  |
| Loom Video             | Demo available?      |
| KB Article             | Help doc available?  |

**Filter:** Visibility = "Open Beta" OR Visibility = "GA" OR Visibility = "Invite-only Beta"
**Sort:** Target Launch Date ascending
**Group by:** Visibility

**What this view answers:**

- "What's coming to customers next?"
- "Are we ready to support this launch?"
- "Which launches are missing materials?"

---

### "📊 Gap Tracker" View

**Purpose:** Tyler's personal view to track what's incomplete across all projects
**No specific meeting — Tyler's daily check**

| Column                 | Why                       |
| ---------------------- | ------------------------- |
| Project Name           | What it is                |
| PMM Tier               | Priority                  |
| Internal Docs Complete | Missing PRDs, specs?      |
| Launch Assets Complete | Missing Looms, SOPs?      |
| Launch Blocked By      | What's blocking?          |
| Loom Video             | Empty = Tyler owes a Loom |
| PRD Link               | Empty = Tyler owes a PRD  |

**Filter:** Phase != Done AND (Internal Docs Complete != complete set for tier OR Launch Assets Complete != complete set for tier)
**Sort:** PMM Tier ascending
**Group by:** None

**What this view answers:**

- "What do I owe the team?"
- "Which high-priority projects have missing materials?"

---

### "🎯 Customer-Facing" View

**Purpose:** CS team (Ben Harrison) needs to know what customers can actually see and use
**No specific meeting — reference for CS team**

| Column         | Why                                     |
| -------------- | --------------------------------------- |
| Project Name   | What it is                              |
| Visibility     | Release stage                           |
| KB Article     | Where to send customers for help        |
| Storylane Demo | Interactive walkthrough for CS to share |
| In-App Tour    | Is there guided onboarding?             |

**Filter:** Customer-Facing = checked (OR Visibility != "Internal Only")
**Sort:** Project name
**Group by:** Visibility

**What this view answers:**

- "What can customers currently access?"
- "Where do I send a customer who asks about X?"
- "Is there a help doc / demo for this feature?"

---

### "📋 Weekly Snapshot" View

**Purpose:** What changed this week — quick view for Monday review
**Used in:** Sam's Monday review, Tyler's EOW prep

| Column               | Why                |
| -------------------- | ------------------ |
| Project Name         | What it is         |
| Weekly Status Update | What changed       |
| Project Phase        | Current phase      |
| Visibility           | Any stage changes? |

**Filter:** Last Edited Time = This Week (or manual Weekly Status Update not empty)
**Sort:** Last Edited Time descending
**Group by:** None

**What this view answers:**

- "What moved this week?"
- "Which projects had updates?"

---

## 4. Weekly Updates DB (NEW — Separate Related Database)

### Purpose

Time-bound record of what changed, shipped, or was decided. Each entry relates to a project. Replaces the ephemeral nature of #product-updates Slack messages with a persistent, filterable archive.

This is the **one exception** to the "one database" rule — it's a separate DB because updates are time-series data (many-to-one relationship with projects), not project properties.

### Schema

| Column      | Type                   | Purpose                                                                  |
| ----------- | ---------------------- | ------------------------------------------------------------------------ |
| **Title**   | Title                  | Short description: "Beta Features Page v1 shipped internally"            |
| **Date**    | Date                   | When it happened                                                         |
| **Project** | Relation → Projects DB | Links to the project (bidirectional)                                     |
| **Type**    | Select                 | `Ship`, `Bug Fix`, `Improvement`, `Decision`, `Milestone`, `Deprecation` |
| **Author**  | Person                 | Who did the work (engineer/designer)                                     |
| **Summary** | Rich text              | 2-3 sentence description of what happened and why it matters             |
| **Loom**    | URL                    | Demo video link if applicable                                            |
| **Impact**  | Select                 | `Internal Only`, `Customer-Visible`, `Breaking Change`                   |
| **Week**    | Formula                | `formatDate(prop("Date"), "YYYY-[W]WW")` for grouping by week            |

### Views

| View Name           | Filter                    | Sort      | Primary Audience       |
| ------------------- | ------------------------- | --------- | ---------------------- |
| **This Week**       | Date = this week          | Date desc | Sam, Tyler, Woody      |
| **Change Log**      | None                      | Date desc | Anyone wanting history |
| **By Project**      | Group by Project          | Date desc | Engineers, Tyler       |
| **Customer-Facing** | Impact = Customer-Visible | Date desc | CS, Revenue, Marketing |

### Relationship to Slack

```
Engineer ships feature
  → Posts in #product-updates (Slack) — notification
  → Adds row to Weekly Updates DB (Notion) — archive
       → Relation auto-links to Project
       → Shows up in "This Week" view
       → Shows up on project page via relation
```

---

## 5. Product Updates Hub (Page with Linked Views)

A single page that embeds linked views from **both** databases for cross-cutting visibility.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Product Updates Hub
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📰 This Week's Updates
[Linked view: Weekly Updates DB — "This Week" view]

---

## 📊 Active Projects
[Linked view: Projects DB — "Launch Pipeline" view]

---

## 📚 Full Change Log
[Linked view: Weekly Updates DB — "Change Log" view, collapsed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This hub is **supplementary** — the primary working surface is always the Projects DB with its meeting-specific views.

---

## 6. Kenzie's Launch Planning DB Migration

### What migrates into Projects DB as new columns

From Kenzie's existing Launch Planning DB:

| Kenzie's Column       | Maps To (Projects DB)  | Notes                              |
| --------------------- | ---------------------- | ---------------------------------- |
| Project name          | Already exists (Title) | Must match exactly — no duplicates |
| Launch tier           | PMM Tier               | Already exists                     |
| Status                | Launch Planning Status | New select column                  |
| Date range            | Target Launch Date     | New date column                    |
| Deliverables tracking | Launch Assets Complete | New multi-select column            |
| Blocked by            | Launch Blocked By      | New rich text column               |
| Marketing owner       | Marketing Owner        | New person column                  |

### What Kenzie creates as a view instead

Instead of maintaining a separate database, Kenzie creates the "📣 Product x Marketing" view on the Projects DB, showing only the columns she needs.

### Migration steps

1. Tyler adds new columns to Projects DB (Launch Planning Status, Launch Blocked By, Target Launch Date, Marketing Owner, all asset URL columns, Internal Docs Complete, Launch Assets Complete, Customer-Facing checkbox)
2. Tyler populates existing values from PM workspace knowledge (PRD links, Loom links, docs complete statuses)
3. Kenzie creates her "Product x Marketing" view with her preferred columns/filters
4. Kenzie maps her existing launch planning rows to the matching Projects DB rows by updating the new columns
5. Kenzie archives the old Launch Planning DB once all data is migrated
6. Kenzie works exclusively from the Projects DB "Product x Marketing" view going forward

---

## 7. Integration with PM Workspace

### Tyler's authoring flow (unchanged)

Tyler continues to write all documentation in the PM workspace (`pm-workspace-docs/initiatives/active/[name]/`). This is version-controlled, AI-assisted, and fast.

### Sync commands (updated for v3 hosting model)

| Command | What it does |
|---------|-------------|
| `/full-sync` | Syncs PM workspace metadata to Notion project properties (phase, visibility, docs complete) AND syncs PM docs to standalone Notion pages, then populates URL columns |
| `/eow` | Generates weekly report, creates Weekly Updates DB entries, updates Weekly Status Update field |
| `/eod` | Generates daily summary, optionally creates a Weekly Updates DB entry |
| `/notion-admin eow` | Updates the Weekly Status Update rich text field on each project |

Note: `/full-sync --subpages` is **deprecated** — no database subitems. Instead, `/full-sync` creates standalone Notion pages for PM docs and populates the URL columns on the Projects DB rows.

### How links get populated (by hosting pattern)

**Pattern 1: PM docs → Standalone Notion pages**

```
Tyler writes prd.md in PM workspace
         │
         ▼
/full-sync creates/updates a standalone Notion page for the PRD
         │
         ▼
/full-sync pastes the Notion page URL into "PRD Link" column
         │
         ▼
Sam, Bryan, Kenzie click the link → opens PRD in new window
```

**Pattern 2: Notion-authored content → Pages inside project pages**

```
Kenzie opens project page in Notion
         │
         ▼
Creates a page inside the project: "KB Article: Global Chat"
         │
         ▼
Writes the help article content directly in Notion
         │
         ▼
Copies the nested page URL → pastes into "KB Article" column
         │
         ▼
From table view: clickable link
From project page: document visible at bottom of page
```

**Pattern 3: External content → Platform URLs**

```
Tyler records Loom video
         │
         ▼
Copies loom.com/share/... URL → pastes into "Loom Video" column
         │
         ▼
Anyone clicks → opens Loom in new window
```

The key: every URL column is **format-agnostic**. It doesn't matter where the doc lives — Notion page, external platform, or nested page inside the project. The column is just a link.

---

## 8. Process: Beta Feedback Collection

Discussed in the meeting — adding this as a process note for implementation.

### Privacy Determination Agent (current beta — 31 users, ~20 workspaces)

1. Tyler sends personal email to 31 beta users asking for feedback
2. Set up PostHog in-app survey triggered on settings page for beta users
3. Kenzie owns collecting and synthesizing responses
4. 5+ responses → sufficient to make launch decision

### Future betas

1. Create opt-in list for users who want beta communications (via newsletter signup or in-app toggle)
2. Work with Ben Harrison on Client Advisory Board list for early feedback
3. Use PostHog feature flags to trigger onboarding guides/surveys **based on user journey** not launch date (Sam's directive: "Think about it being triggered by them having done something")

---

## 9. Migration Plan (Updated)

### Phase 1: Add columns to Projects DB (45 min)

- Add all new URL columns (PRD Link, Design Brief Link, Eng Spec Link, Research Link, Loom Video, Loom SOP, KB Article, Storylane Demo, In-App Tour, Product Update Slack, Customer Email)
- Add all new tracking columns (Launch Planning Status, Launch Blocked By, Target Launch Date, Marketing Owner, Internal Docs Complete, Launch Assets Complete, Customer-Facing checkbox)
- Populate values for existing 22 projects based on PM workspace knowledge

### Phase 2: Create meeting-specific views (30 min)

- Create all 9 views listed in section 3
- Set filters, sorts, and visible columns for each
- Test that each view shows the right data

### Phase 3: Migrate Kenzie's launch planning data (30 min)

- Map each row in Kenzie's Launch Planning DB to the matching Projects DB row
- Populate Launch Planning Status, Target Launch Date, Marketing Owner
- Populate any asset links Kenzie already has
- Validate with Kenzie that nothing was lost

### Phase 4: Create Weekly Updates DB (30 min)

- Create database with schema from section 4
- Add relation to Projects DB (bidirectional)
- Backfill with this week's updates as seed data

### Phase 5: Create Product Updates Hub page (15 min)

- Create page with linked views from both DBs
- Share with Sam for feedback

### Phase 6: Archive Kenzie's Launch Planning DB (5 min)

- After Kenzie confirms migration is complete
- Archive (don't delete) the old DB

### Phase 7: Establish contracts (discussion)

- Engineers post to Weekly Updates DB when shipping (Bryan owns enforcement)
- Tyler populates asset link columns as docs are created
- Tyler updates Internal Docs Complete and Launch Assets Complete multi-selects
- Kenzie updates Launch Planning Status and Launch Assets Complete from marketing side
- Sam reviews Projects DB "Council of Product" view Monday mornings
- Tyler + Kenzie review "Product x Marketing" view in weekly meeting

---

## 10. What This Replaces

| Before                               | After                                                   |
| ------------------------------------ | ------------------------------------------------------- |
| #product-updates Slack only          | Slack notification + Weekly Updates DB archive          |
| Tyler's EOW markdown report          | EOW generated from Weekly Updates DB                    |
| "Ask Tyler what's going on"          | Open Projects DB "Council of Product" view              |
| "Where's the PRD for this?"          | PRD Link column on project row                          |
| "Which projects are missing docs?"   | "Gap Tracker" view                                      |
| "What launched this week?"           | "Weekly Snapshot" view OR Weekly Updates DB "This Week" |
| Kenzie's separate Launch Planning DB | "Product x Marketing" view on Projects DB               |
| Multiple databases / spreadsheets    | One Projects DB + One Updates DB + views                |
| Guessing what marketing needs        | Tier-based templates define requirements                |

---

## 11. Resolved Questions

| Question | Answer | Source |
|----------|--------|--------|
| Should we use database subitems? | **No.** No parent-child row hierarchy in the DB. | Sam, Product x Marketing meeting |
| Can we use pages inside project pages? | **Yes.** Regular page nesting is fine — not the same as subitems. KB articles, SOPs, marketing briefs live as nested pages. | Tyler, post-meeting refinement |
| Should Kenzie keep a separate DB? | **No.** Merge into Projects DB with views. | Sam, Product x Marketing meeting |
| How do assets get tracked? | URL columns (to nested pages, standalone pages, or external) + multi-select for gap tracking | Sam + Tyler |
| Where does Notion-authored content live? | **Pages nested inside the project page.** URL columns link to them. | Tyler, v3 refinement |
| Where do PM docs live? | **Standalone Notion pages** (synced from PM workspace) or external links. | Tyler |
| Where do external assets live? | **External platforms** with URL columns linking out (Loom, Storylane, Slack, Figma). | Inherent |
| Who owns launch materials per tier? | Kenzie owns external-facing (KB, Storylane, email, FAQ), Tyler owns internal (Loom, SOP, PRD) | Tyler + Kenzie, meeting |

## 12. Open Questions

1. **Who creates Weekly Updates DB entries?** Engineers directly? Tyler from Slack? Automated from #product-updates?
2. **How granular should updates be?** Every PR? Every feature? Only launches?
3. **Should the Hub page replace the existing Projects DB page?** Or sit alongside it?
4. **Beta user opt-in list:** Who manages this — Tyler, Kenzie, or Ben Harrison?
5. **PostHog in-app tours:** Does Kenzie or Tyler own creating these? (Kenzie volunteered to explore PostHog + Storylane today)
6. **Agent-generated PMM content:** Sam mentioned agents auto-creating initial versions of marketing content. When do we set this up? What inputs does Kenzie need to define?
7. **Customer research ownership:** Sam wants engineers to eventually do more direct user research. When and how do we start? Kenzie expressed interest in helping.

---

_Drafted: 2026-02-09 from Trio Sync + Product x Marketing discussions_
_Updated: 2026-02-09 after Product x Marketing Weekly (1:01 PM)_
_To discuss: Kenzie to create her view + begin migration; Sam to review views_
