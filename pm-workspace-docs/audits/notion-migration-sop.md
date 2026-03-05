# Notion Projects Database Migration SOP

> **Status:** Ready for review
> **Date:** February 9, 2026
> **Authors:** Tyler Sahagun (PM), with Kenzie (Marketing) as co-executor
> **Source:** `notion-schema-proposal.md` v3, template README, Trio Sync + Product x Marketing meetings
> **Live Projects DB:** `2c0f79b2-c8ac-802c-8b15-c84a8fce3513`
> **Test Sandbox:** `303f79b2-c8ac-819f-8a5e-ee9a9891df2f` (under AskElephant Product Hierarchy)

---

## 1. Pre-Migration Checklist

Complete every item before touching the live Projects DB.

### Verify access and permissions

- [ ] Tyler has admin access to live Projects DB (`2c0f79b2-c8ac-802c-8b15-c84a8fce3513`)
- [ ] Tyler has admin access to test sandbox DB (`303f79b2-c8ac-819f-8a5e-ee9a9891df2f`)
- [ ] Kenzie has editor access to live Projects DB
- [ ] Kenzie can share the URL to her Launch Planning DB (`296f79b2c8ac805682d2e2c49a1b53ef`)
- [ ] Confirm no one else is actively editing the Projects DB during migration window

### Verify data integrity

- [ ] Count total project rows in live DB (expected: ~22)
- [ ] Export or screenshot all existing column names and types
- [ ] Verify no duplicate project names between Projects DB and Kenzie's Launch Planning DB
- [ ] Note any projects in Kenzie's DB that do NOT exist in the Projects DB (these need new rows)

### Approvals required

| Who | Approves What | When |
|-----|--------------|------|
| **Sam** | Overall schema design (views, no subitems) | Before Phase 1 — already approved in meetings |
| **Tyler** | Column schema, migration sequence | Before Phase 1 |
| **Kenzie** | Launch planning column mapping, her view layout | Before Phase 3 |
| **Sam** | Final views after creation | After Phase 2 |

### Schedule the migration

- [ ] Block 2.5 hours on Tyler's calendar for Phases 1-5
- [ ] Block 30 minutes on Kenzie's calendar for Phase 3 validation
- [ ] Notify in #product-internal: "Migrating Projects DB schema today — expect new columns and views"

---

## 2. Test Sandbox Protocol

### About the test sandbox

The test sandbox DB lives at page `303f79b2-c8ac-819f-8a5e-ee9a9891df2f`, nested under the AskElephant Product Hierarchy in Notion. It was created as a copy of the live Projects DB to safely validate schema changes before going live.

### What to test in the sandbox

| Test | How to Validate | Pass Criteria |
|------|----------------|---------------|
| **Add all new columns** | Add each column from Section 3 below | Columns appear with correct types and options |
| **Create all 9 views** | Create each view with filters/sorts/columns | Each view shows expected data subset |
| **Test select options** | Click through each select/multi-select | All options are selectable, no typos |
| **Test URL columns** | Paste a sample URL into each URL column | Links are clickable and open correctly |
| **Test person column** | Assign Marketing Owner to a project | Person picker works, correct workspace members appear |
| **Test checkbox column** | Toggle Customer-Facing on/off | Filter views respond correctly to checkbox state |
| **Test database templates** | Create a new row from P1 template | Page body pre-populates, nested pages auto-create |
| **Test standalone templates** | Add a PRD template to an existing project | Nested page appears with full structure |
| **Test pages-inside-pages** | Create a KB Article page inside a project page, copy URL to column | URL is clickable from table view; page visible inside project page |

### Sandbox vs production comparison

After completing sandbox testing, compare side by side:

- [ ] All column names match the schema proposal exactly
- [ ] All select/multi-select options are identical
- [ ] All view filters produce the expected row set
- [ ] Templates generate the correct nested pages per tier

### Sandbox sign-off checklist

- [ ] Tyler confirms: all columns added and typed correctly
- [ ] Tyler confirms: all 9 views filter and sort as specified
- [ ] Tyler confirms: tier templates create correct nested pages
- [ ] Kenzie confirms: Product x Marketing view shows her needed columns
- [ ] Kenzie confirms: Launch Planning Status options match her workflow

**Only proceed to live migration after all sandbox items pass.**

---

## 3. Migration Playbook (Step-by-Step)

### Phase 1: Add new columns to live Projects DB (45 min)

Open the live Projects DB. Add each column in the order listed. Existing columns are already present — skip those.

#### New URL columns: Internal Documentation Links

| # | Column Name | Type | Who Populates | Notes |
|---|-------------|------|---------------|-------|
| 1 | **PRD Link** | URL | Tyler | Points to standalone Notion page or Google Doc |
| 2 | **Design Brief Link** | URL | Tyler / Skylar | Points to standalone Notion page or Figma file |
| 3 | **Eng Spec Link** | URL | Tyler / Bryan | Points to standalone Notion page |
| 4 | **Research Link** | URL | Tyler | Points to standalone Notion page |

#### New URL columns: Launch Assets (External)

| # | Column Name | Type | Who Populates | Notes |
|---|-------------|------|---------------|-------|
| 5 | **Loom Video** | URL | Tyler | loom.com recording link |
| 6 | **Storylane Demo** | URL | Kenzie | storylane.io walkthrough link |
| 7 | **In-App Tour** | URL | Kenzie / Tyler | PostHog in-app tour config link |
| 8 | **Product Update Slack** | URL | Tyler | Slack permalink to #product-updates message |

#### New URL columns: Launch Assets (Pages-inside-pages)

| # | Column Name | Type | Who Authors | Notes |
|---|-------------|------|-------------|-------|
| 9 | **KB Article** | URL | Kenzie | Page nested inside project page |
| 10 | **SOP** | URL | Tyler | Page nested inside project page (from Loom AI) |
| 11 | **Marketing Brief** | URL | Kenzie / Tony | Page nested inside project page |
| 12 | **Customer Email Draft** | URL | Kenzie | Page nested inside project page |
| 13 | **FAQ** | URL | Kenzie | Page nested inside project page |

#### New columns: Launch Planning (merged from Kenzie's DB)

| # | Column Name | Type | Options | Notes |
|---|-------------|------|---------|-------|
| 14 | **Launch Planning Status** | Select | `Not Started`, `In Progress`, `Blocked`, `Ready`, `Launched`, `N/A` | Marketing prep status |
| 15 | **Launch Blocked By** | Rich text | Free text | What blocks launch planning |
| 16 | **Target Launch Date** | Date | -- | Expected actual launch date |
| 17 | **Marketing Owner** | Person | -- | Marketing-side owner |

#### New columns: Tracking & Gap Detection

| # | Column Name | Type | Options | Notes |
|---|-------------|------|---------|-------|
| 18 | **Internal Docs Complete** | Multi-select | `PRD`, `Design Brief`, `Eng Spec`, `Research`, `Metrics` | Which internal docs exist |
| 19 | **Launch Assets Complete** | Multi-select | `Loom`, `SOP`, `KB Article`, `Storylane`, `In-App Tour`, `Customer Email`, `Slack Announcement` | Which launch materials are done |
| 20 | **Customer-Facing** | Checkbox | -- | Is this visible to customers now? |

**After adding all columns:**
- [ ] Verify all 20 new columns appear in the DB
- [ ] Spot-check types: selects have correct options, multi-selects have correct options
- [ ] Populate known values for top 5 projects (PRD links, Loom links, existing docs complete status)

---

### Phase 2: Create meeting-specific views (30 min)

Create each view on the Projects DB. For each view: click "+" next to existing views, name it, set layout to Table, then configure columns shown, filters, sort, and grouping.

#### View 1: All Projects (already exists)

- **Action:** Verify it still works. No changes needed.

#### View 2: Council of Product

- **Name:** `Council of Product`
- **Emoji:** Crown
- **Columns:** Project Name, Project Phase, Visibility, PMM Tier, Weekly Status Update, Target Launch Date, Customer-Facing
- **Filter:** Project Phase != Done
- **Sort:** PMM Tier ascending (P1 first), then Project Phase
- **Group by:** None

#### View 3: Product x Marketing

- **Name:** `Product x Marketing`
- **Emoji:** Megaphone
- **Columns:** Project Name, PMM Tier, Visibility, Launch Planning Status, Launch Blocked By, Marketing Owner, Target Launch Date, Launch Assets Complete, Loom Video, KB Article, Storylane Demo, Customer Email Draft
- **Filter:** PMM Tier is not empty AND Project Phase != Done
- **Sort:** Target Launch Date ascending (soonest first)
- **Group by:** Launch Planning Status

#### View 4: Trio Sync

- **Name:** `Trio Sync`
- **Emoji:** Wrench
- **Columns:** Project Name, Project Phase, Visibility, Weekly Status Update, Linear Link, PRD Link, Eng Spec Link, Internal Docs Complete, Launch Blocked By
- **Filter:** Project Phase != Done
- **Sort:** Project Phase (Build first, then Definition, then Test)
- **Group by:** Project Phase

#### View 5: Eng Standup

- **Name:** `Eng Standup`
- **Emoji:** Gear
- **Columns:** Project Name, Project Phase, Linear Link, Prototype Link, Visibility, Weekly Status Update
- **Filter:** Project Phase = Build OR Project Phase = Test
- **Sort:** Project Name alphabetical
- **Group by:** None

#### View 6: Launch Pipeline

- **Name:** `Launch Pipeline`
- **Emoji:** Rocket
- **Columns:** Project Name, PMM Tier, Visibility, Target Launch Date, Launch Planning Status, Launch Assets Complete, Customer-Facing, Loom Video, KB Article
- **Filter:** Visibility = "Open Beta" OR Visibility = "GA" OR Visibility = "Invite-only Beta"
- **Sort:** Target Launch Date ascending
- **Group by:** Visibility

#### View 7: Gap Tracker

- **Name:** `Gap Tracker`
- **Emoji:** Bar chart
- **Columns:** Project Name, PMM Tier, Internal Docs Complete, Launch Assets Complete, Launch Blocked By, Loom Video, PRD Link
- **Filter:** Project Phase != Done AND (Internal Docs Complete or Launch Assets Complete has gaps)
- **Sort:** PMM Tier ascending
- **Group by:** None

> **Note:** Notion cannot natively filter "multi-select is incomplete for tier." Tyler will manually review this view and flag gaps. Consider a formula column later.

#### View 8: Customer-Facing

- **Name:** `Customer-Facing`
- **Emoji:** Target
- **Columns:** Project Name, Visibility, KB Article, Storylane Demo, In-App Tour
- **Filter:** Customer-Facing = checked (or Visibility != "Internal Only")
- **Sort:** Project Name alphabetical
- **Group by:** Visibility

#### View 9: Weekly Snapshot

- **Name:** `Weekly Snapshot`
- **Emoji:** Clipboard
- **Columns:** Project Name, Weekly Status Update, Project Phase, Visibility
- **Filter:** Last Edited Time = This Week
- **Sort:** Last Edited Time descending
- **Group by:** None

**After creating all views:**
- [ ] Click through each view and verify it shows the correct subset of data
- [ ] Verify column visibility matches the spec (hide columns not in the list)
- [ ] Test that filters exclude the right rows

---

### Phase 3: Migrate Kenzie's launch planning data (30 min)

**Prerequisite:** Kenzie's Launch Planning DB URL: `https://www.notion.so/296f79b2c8ac805682d2e2c49a1b53ef`

| Step | Action | Owner |
|------|--------|-------|
| 1 | Open Kenzie's Launch Planning DB side by side with Projects DB | Tyler |
| 2 | For each row in Kenzie's DB, find the matching project in Projects DB by name | Tyler |
| 3 | Copy Launch Planning Status value to the new `Launch Planning Status` column | Tyler |
| 4 | Copy date range to `Target Launch Date` | Tyler |
| 5 | Set `Marketing Owner` to Kenzie (or whoever is listed) | Tyler |
| 6 | Copy blocked-by notes to `Launch Blocked By` | Tyler |
| 7 | Copy any asset links Kenzie already has (Storylane, KB Article URLs, etc.) | Tyler |
| 8 | Flag any projects in Kenzie's DB that have NO match in Projects DB | Tyler |
| 9 | **Validation call with Kenzie** — walk through the migrated data together | Tyler + Kenzie |

**Kenzie validates:**
- [ ] All her projects are accounted for
- [ ] Launch Planning Status values are correct
- [ ] Target Launch Dates are correct
- [ ] Marketing Owner assignments are correct
- [ ] No data was lost or mismatched
- [ ] The "Product x Marketing" view shows everything she needs

---

### Phase 4: Create Weekly Updates DB (30 min)

Create a new database (not inside the Projects DB — this is a separate, related database).

**Location:** Same Notion workspace, under the Product area or next to the Projects DB.

#### Columns to create

| Column | Type | Options / Config |
|--------|------|-----------------|
| **Title** | Title | Short description (e.g., "Beta Features Page v1 shipped internally") |
| **Date** | Date | When it happened |
| **Project** | Relation | Relation to Projects DB (bidirectional) |
| **Type** | Select | `Ship`, `Bug Fix`, `Improvement`, `Decision`, `Milestone`, `Deprecation` |
| **Author** | Person | Who did the work |
| **Summary** | Rich text | 2-3 sentence description |
| **Loom** | URL | Demo video link |
| **Impact** | Select | `Internal Only`, `Customer-Visible`, `Breaking Change` |
| **Week** | Formula | `formatDate(prop("Date"), "YYYY-[W]WW")` |

#### Views to create on the Weekly Updates DB

| View | Filter | Sort | Audience |
|------|--------|------|----------|
| **This Week** | Date = this week | Date descending | Sam, Tyler, Woody |
| **Change Log** | None | Date descending | Anyone |
| **By Project** | Group by Project | Date descending | Engineers, Tyler |
| **Customer-Facing** | Impact = Customer-Visible | Date descending | CS, Revenue, Marketing |

#### Seed data

- [ ] Backfill 3-5 entries from this week's #product-updates Slack messages
- [ ] Verify the relation to Projects DB works bidirectionally

---

### Phase 5: Create Product Updates Hub page (15 min)

Create a new Notion page called **"Product Updates Hub"** in the Product area.

**Page structure:**

```
# Product Updates Hub

## This Week's Updates
[Linked view: Weekly Updates DB — "This Week" view]

---

## Active Projects
[Linked view: Projects DB — "Launch Pipeline" view]

---

## Full Change Log
[Linked view: Weekly Updates DB — "Change Log" view, collapsed by default]
```

**Steps:**
1. Create the page
2. Add a linked view of the Weekly Updates DB (This Week view)
3. Add a divider
4. Add a linked view of the Projects DB (Launch Pipeline view)
5. Add a divider
6. Add a linked view of the Weekly Updates DB (Change Log view)
7. Share the page URL with Sam for feedback

---

### Phase 6: Archive Kenzie's Launch Planning DB (5 min)

**Only after Kenzie signs off on Phase 3.**

| Step | Action |
|------|--------|
| 1 | Confirm with Kenzie: "Are you comfortable archiving your Launch Planning DB?" |
| 2 | Move the Launch Planning DB page to a "Archived" section or add "[ARCHIVED]" prefix to the title |
| 3 | Do NOT delete it — keep for reference if data questions arise |
| 4 | Post in Slack to Kenzie: "Launch Planning DB archived. Use Projects DB > Product x Marketing view going forward." |

---

### Phase 7: Establish team contracts (discussion)

Schedule a 15-minute sync with relevant people to confirm these ongoing responsibilities:

| Person | Responsibility | Frequency |
|--------|---------------|-----------|
| **Tyler** | Populate URL columns as docs are created (PRD, Loom, Eng Spec, etc.) | As created |
| **Tyler** | Update `Internal Docs Complete` and `Launch Assets Complete` multi-selects | Weekly or as docs ship |
| **Tyler** | Update `Weekly Status Update` rich text field on project rows | Weekly (EOW) |
| **Tyler** | Record Looms for features and paste links | As features are ready |
| **Tyler** | Review Gap Tracker view and address missing items | Daily |
| **Kenzie** | Update `Launch Planning Status` for projects she owns | As status changes |
| **Kenzie** | Create KB Articles, Marketing Briefs, Customer Emails as pages inside project pages | Per launch cycle |
| **Kenzie** | Update `Launch Assets Complete` from marketing side | As assets are created |
| **Kenzie** | Work from the "Product x Marketing" view as her primary surface | Ongoing |
| **Engineers** | Add entries to Weekly Updates DB when shipping features | At ship time |
| **Bryan** | Enforce Weekly Updates DB entries from eng team | Ongoing |
| **Sam** | Review "Council of Product" view on Monday mornings | Weekly (Monday) |
| **Tyler + Kenzie** | Review "Product x Marketing" view in weekly meeting | Weekly (meeting) |

---

## 4. Template Usage Guide

### Tier templates: what gets auto-created when you make a new project

When creating a new project in the Projects DB, select the appropriate tier template. The template auto-populates properties and generates nested pages inside the project page.

| Template | PMM Tier | Auto-Created Nested Pages | Launch Checklist |
|----------|----------|--------------------------|-----------------|
| **P1 Launch (Major)** | p1 | KB Article, SOP, Marketing Brief, Customer Email, FAQ, Research, PRD, Design Brief, Eng Spec, Metrics | Full internal + external checklist |
| **P2 Launch (Significant)** | p2 | KB Article, SOP, FAQ, PRD, Design Brief (if applicable), Eng Spec | Internal: Loom, SOP, PRD. External: KB, Storylane or tour, Slack post, newsletter |
| **P3 Launch (Minor)** | p3 | KB Article (shorter, may update existing) | Internal: Loom or written update, PRD if applicable. External: KB update, Slack post, changelog |
| **P4 Launch (Internal-only)** | p4 | None | Internal: Loom or written update, Slack post. External: none |

**How to use a tier template:**
1. Open the Projects DB
2. Click the dropdown arrow next to "+ New"
3. Select the tier template (e.g., "P1 Launch (Major)")
4. A new project row is created with pre-populated properties and nested pages
5. Fill in the project name and content
6. As you complete each nested page, copy its URL into the corresponding URL column

### Standalone document templates: adding docs to existing projects

For the 22 existing projects (created before templates) or when you need a document that your tier didn't auto-generate:

1. Open any project page in Notion
2. Scroll to the bottom and click "Add a page" (or use `/template button`)
3. Copy content from the appropriate template in `pm-workspace-docs/templates/notion-pages/`
4. Fill in the bracketed sections
5. Copy the nested page's URL
6. Paste it into the corresponding URL column on the DB row

**Available standalone templates:**

| Template | File | Typical Owner | When to Use |
|----------|------|---------------|-------------|
| PRD | `prd.md` | Tyler | Any project needing formal requirements |
| Design Brief | `design-brief.md` | Tyler / Skylar | Any project with UI/UX work |
| Eng Spec | `eng-spec.md` | Tyler / Bryan | Any project with technical complexity |
| Research | `research.md` | Tyler | When user research is conducted |
| Metrics | `metrics.md` | Tyler | When Sam asks "how will we measure this?" |
| KB Article | `kb-article.md` | Kenzie | Any customer-facing feature |
| SOP | `sop.md` | Tyler | Any feature needing an internal procedure |
| Marketing Brief | `marketing-brief.md` | Kenzie / Tony | P1/P2 launches with marketing campaigns |
| Customer Email | `customer-email.md` | Kenzie | Launches that warrant email announcement |
| FAQ | `faq.md` | Kenzie | Features generating user questions |
| GTM Brief | `gtm-brief.md` | Kenzie / Tony | Major launches with go-to-market plans |
| Launch Checklist | `launch-checklist.md` | Tyler / Kenzie | Custom checklist beyond tier defaults |

**Example:** A P4 internal project (Storybook overhaul) doesn't auto-create any nested pages. Tyler decides he wants a PRD and Eng Spec anyway. He opens the project page, uses the standalone PRD and Eng Spec templates, fills them in, and pastes their URLs into the columns.

---

## 5. Ongoing Maintenance Contracts

### Tyler's responsibilities (PM)

| What | When | How |
|------|------|-----|
| Record Loom video for features | As features reach demo-ready state | Record Loom, paste URL in `Loom Video` column |
| Generate SOP from Loom AI | After recording Loom | Create SOP page inside project, paste Loom AI output, paste URL in `SOP` column |
| Sync PRDs to Notion | After writing/updating prd.md | Run `/full-sync`, paste standalone page URL in `PRD Link` column |
| Link Design Briefs and Eng Specs | After creating docs | Paste URLs in corresponding columns |
| Update `Internal Docs Complete` multi-select | As docs are finished | Check off completed items |
| Update `Launch Assets Complete` for internal items | As Loom, SOP, Slack post are done | Check off completed items |
| Update `Weekly Status Update` on project rows | Every Friday (EOW) | Run `/eow` or manually update |
| Post to #product-updates in Slack | When features ship or hit milestones | Post update, paste permalink in `Product Update Slack` column |
| Review Gap Tracker view | Daily | Check for missing docs on high-priority projects |

### Kenzie's responsibilities (Marketing)

| What | When | How |
|------|------|-----|
| Update `Launch Planning Status` | As prep progresses | Change select value on each project row |
| Write KB Articles | Per launch cycle | Create page inside project page, write content, paste URL in `KB Article` column |
| Build Storylane demos | For P1/P2 launches | Build in Storylane, paste URL in `Storylane Demo` column |
| Configure In-App Tours | For P1/P2 launches (PostHog) | Set up tour, paste URL in `In-App Tour` column |
| Draft Customer Emails | For P1 launches | Create page inside project page, draft email, paste URL in `Customer Email Draft` column |
| Write Marketing Briefs | For P1 launches | Create page inside project page, write brief, paste URL in `Marketing Brief` column |
| Generate FAQs | From meeting transcripts, beta feedback | Create page inside project page, compile FAQ, paste URL in `FAQ` column |
| Update `Launch Assets Complete` for marketing items | As assets are created | Check off completed items |
| Flag blockers in `Launch Blocked By` | When blocked | Write what's blocking (e.g., "Missing Loom from Tyler") |
| Work from "Product x Marketing" view | Always | This replaces the separate Launch Planning DB |

### Engineers' responsibilities

| What | When | How |
|------|------|-----|
| Add entry to Weekly Updates DB | When shipping a feature, bug fix, or notable change | Create new row: Title, Date, Project relation, Type, Summary |
| Bryan enforces Weekly Updates DB usage | Ongoing | Remind eng team during standups |

### Sam's responsibilities

| What | When | How |
|------|------|-----|
| Review "Council of Product" view | Monday mornings | Open view, scan for status changes, flag concerns |
| Review Product Updates Hub | Weekly | Check "This Week" section for what shipped |

---

## 6. View Reference Card

Quick reference for all 9 views on the Projects DB. Print or bookmark this section.

---

### View 1: All Projects (default)

| Field | Value |
|-------|-------|
| **Emoji** | -- (default) |
| **Purpose** | Master view for database admin |
| **Meeting** | Ad-hoc reference |
| **Columns** | All columns visible |
| **Filter** | None |
| **Sort** | Project Phase, then PMM Tier |
| **Group by** | None |
| **Answers** | "Show me everything." |

---

### View 2: Council of Product

| Field | Value |
|-------|-------|
| **Emoji** | Crown |
| **Purpose** | Executive overview for Sam, Woody, and leadership |
| **Meeting** | Council of Product (weekly, 10:30 AM) |
| **Columns** | Project Name, Project Phase, Visibility, PMM Tier, Weekly Status Update, Target Launch Date, Customer-Facing |
| **Filter** | Project Phase != Done |
| **Sort** | PMM Tier ascending (P1 first), then Phase |
| **Group by** | None (flat list) |
| **Answers** | "What are the top priorities? What's launching soon? Are we on track?" |

---

### View 3: Product x Marketing

| Field | Value |
|-------|-------|
| **Emoji** | Megaphone |
| **Purpose** | Tyler + Kenzie + Tony align on launch materials and marketing readiness |
| **Meeting** | Product x Marketing Weekly (weekly, 1:00 PM) |
| **Columns** | Project Name, PMM Tier, Visibility, Launch Planning Status, Launch Blocked By, Marketing Owner, Target Launch Date, Launch Assets Complete, Loom Video, KB Article, Storylane Demo, Customer Email Draft |
| **Filter** | PMM Tier is not empty AND Project Phase != Done |
| **Sort** | Target Launch Date ascending (soonest first) |
| **Group by** | Launch Planning Status |
| **Answers** | "What is Kenzie blocked on? What does Tyler owe Kenzie? What's launching next and what's the marketing status?" |

---

### View 4: Trio Sync

| Field | Value |
|-------|-------|
| **Emoji** | Wrench |
| **Purpose** | Tyler + Sam + Bryan working session on product + eng status |
| **Meeting** | Trio Sync (daily/weekly, 10:00 AM) |
| **Columns** | Project Name, Project Phase, Visibility, Weekly Status Update, Linear Link, PRD Link, Eng Spec Link, Internal Docs Complete, Launch Blocked By |
| **Filter** | Project Phase != Done |
| **Sort** | Phase (Build first, then Definition, then Test) |
| **Group by** | Project Phase |
| **Answers** | "What's being built? Which projects need PRDs or specs? Where are we blocked?" |

---

### View 5: Eng Standup

| Field | Value |
|-------|-------|
| **Emoji** | Gear |
| **Purpose** | Quick engineering status for active work |
| **Meeting** | Eng Standup (daily, 9:30 AM) |
| **Columns** | Project Name, Project Phase, Linear Link, Prototype Link, Visibility, Weekly Status Update |
| **Filter** | Project Phase = Build OR Project Phase = Test |
| **Sort** | Project Name alphabetical |
| **Group by** | None (flat list for speed) |
| **Answers** | "What are we building? What's in testing? Quick links to Linear boards." |

---

### View 6: Launch Pipeline

| Field | Value |
|-------|-------|
| **Emoji** | Rocket |
| **Purpose** | Everything approaching or at customer-facing release |
| **Meeting** | Always-on reference for CS, Revenue, Marketing leadership |
| **Columns** | Project Name, PMM Tier, Visibility, Target Launch Date, Launch Planning Status, Launch Assets Complete, Customer-Facing, Loom Video, KB Article |
| **Filter** | Visibility = "Open Beta" OR "GA" OR "Invite-only Beta" |
| **Sort** | Target Launch Date ascending |
| **Group by** | Visibility |
| **Answers** | "What's coming to customers? Are we ready to support the launch? Which launches are missing materials?" |

---

### View 7: Gap Tracker

| Field | Value |
|-------|-------|
| **Emoji** | Bar chart |
| **Purpose** | Tyler's personal view to track incomplete items |
| **Meeting** | Tyler's daily check (no meeting) |
| **Columns** | Project Name, PMM Tier, Internal Docs Complete, Launch Assets Complete, Launch Blocked By, Loom Video, PRD Link |
| **Filter** | Project Phase != Done AND (docs/assets have known gaps) |
| **Sort** | PMM Tier ascending |
| **Group by** | None |
| **Answers** | "What do I owe the team? Which high-priority projects have missing materials?" |

---

### View 8: Customer-Facing

| Field | Value |
|-------|-------|
| **Emoji** | Target |
| **Purpose** | CS team (Ben Harrison) needs to know what customers can see and use |
| **Meeting** | No specific meeting -- always-on reference for CS |
| **Columns** | Project Name, Visibility, KB Article, Storylane Demo, In-App Tour |
| **Filter** | Customer-Facing = checked (or Visibility != "Internal Only") |
| **Sort** | Project Name alphabetical |
| **Group by** | Visibility |
| **Answers** | "What can customers access? Where do I send someone who asks about X? Is there a help doc or demo?" |

---

### View 9: Weekly Snapshot

| Field | Value |
|-------|-------|
| **Emoji** | Clipboard |
| **Purpose** | What changed this week -- quick Monday review |
| **Meeting** | Sam's Monday review, Tyler's EOW prep |
| **Columns** | Project Name, Weekly Status Update, Project Phase, Visibility |
| **Filter** | Last Edited Time = This Week |
| **Sort** | Last Edited Time descending |
| **Group by** | None |
| **Answers** | "What moved this week? Which projects had updates?" |

---

## 7. Rollback Plan

### If something goes wrong during migration

The migration is additive (adding columns and views) rather than destructive (deleting or modifying existing data). This makes rollback straightforward.

### Rollback by phase

| Phase | What Could Go Wrong | Rollback Action |
|-------|-------------------|----------------|
| **Phase 1** (Add columns) | Wrong column type, typo in select options | Delete the incorrect column and re-create it. No existing data is affected. |
| **Phase 2** (Create views) | Wrong filters, missing columns | Delete the view and re-create it. Views are just saved filter/sort configurations -- no data is lost. |
| **Phase 3** (Migrate Kenzie's data) | Data mapped to wrong project, values incorrect | Clear the incorrectly populated cells. Kenzie's original DB is still intact (not archived yet). Re-map from source. |
| **Phase 4** (Weekly Updates DB) | Schema wrong, relation broken | Delete the new DB and re-create. It's net-new with only seed data. |
| **Phase 5** (Hub page) | Layout wrong, views incorrect | Delete the page and re-create. It's just a container for linked views. |
| **Phase 6** (Archive Kenzie's DB) | Kenzie needs data from old DB | Un-archive Kenzie's DB (remove "[ARCHIVED]" prefix or move out of Archived section). |

### Data preservation rules

- **Never delete Kenzie's Launch Planning DB** until at least 2 weeks after migration is complete and validated
- **Never delete columns** from the live Projects DB without confirming no views depend on them
- **The test sandbox** (`303f79b2-c8ac-819f-8a5e-ee9a9891df2f`) remains intact as a reference copy -- do not delete it

### Emergency rollback (full revert)

If the entire migration needs to be undone:

1. Delete all 9 new views (not the "All Projects" default)
2. Delete all 20 new columns added in Phase 1
3. Delete the Weekly Updates DB
4. Delete the Product Updates Hub page
5. Un-archive Kenzie's Launch Planning DB
6. Post in Slack: "Projects DB migration rolled back. Using previous setup."

**Time to full rollback:** ~15 minutes (just deleting columns and views).

---

## Appendix: Key IDs and Links

| Resource | ID / Link |
|----------|-----------|
| Live Projects DB | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` |
| Test Sandbox DB | `303f79b2-c8ac-819f-8a5e-ee9a9891df2f` |
| Kenzie's Launch Planning DB | `296f79b2c8ac805682d2e2c49a1b53ef` |
| Schema Proposal | `pm-workspace-docs/audits/notion-schema-proposal.md` |
| Template Files | `pm-workspace-docs/templates/notion-pages/` |
| Template README | `pm-workspace-docs/templates/notion-pages/README.md` |

---

_Last updated: 2026-02-09_
_To be used by: Tyler Sahagun (PM) + Kenzie (Marketing)_
