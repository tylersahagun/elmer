# SOP: Projects Database Migration

> Standard Operating Procedure for the Projects DB schema upgrade
> Created: 2026-02-09
> Owner: Tyler Sahagun

---

## 1. Overview

This SOP covers the migration of the AskElephant **Projects Database** in Notion from its current schema to an expanded schema that adds internal documentation links, launch asset tracking, launch planning fields, and gap detection columns. The migration uses a **test-first approach** — all changes are validated in a sandbox copy before touching the live database.

### Key References

| Item | ID / URL |
|------|----------|
| Live Database | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` |
| Test Database | `303f79b2-c8ac-81fc-b1dc-c57aec61df61` |
| Sandbox Page | `303f79b2-c8ac-819f-8a5e-ee9a9891df2f` |
| Migration Plan | `projects-database-plan.md` |

---

## 2. How to Use the Test Database

### 2.1 What It Contains

The test database ("Projects DB -- Test Copy") is a full clone of the live database with:
- **All 26 project rows** copied with their current data (titles, phases, visibility, PMM tiers, links, outcomes, objectives, weekly status updates, and dates)
- **19 existing columns** matching the live schema
- **17 new proposed columns** ready for validation

### 2.2 What Is Different from Live

| Difference | Details |
|-----------|---------|
| Project Phase type | `select` instead of `status` (Notion API limitation -- CREATE_DATABASE cannot create status-type properties) |
| Relation columns | GTM, Weekly Updates, Product Tickets were **not copied** -- they would point to wrong databases |
| Non-URL prototype values | Values like "Not Customer Facing" and "Not Sure" were skipped (invalid URLs) |
| Rich text truncation | Outcome, Objectives & Success, and Weekly Status Update are capped at 2000 characters per the Notion API limit |

### 2.3 New Columns Available for Testing

**Internal Documentation Links:**
- PRD Link (url)
- Design Brief Link (url)
- Eng Spec Link (url)
- Research Link (url)

**Launch Assets -- External:**
- Storylane Demo (url)
- In-App Tour (url)
- Product Update Slack (url)

**Launch Assets -- Pages-inside-pages:**
- SOP (url)
- Marketing Brief (url)
- Customer Email Draft (url)
- FAQ (url)

**Launch Planning (merged from Kenzie's DB):**
- Launch Planning Status (select): Not Started, In Progress, Blocked, Ready, Launched, N/A
- Launch Blocked By (rich_text)
- Target Launch Date (date)

**Tracking & Gap Detection:**
- Internal Docs Complete (multi_select): PRD, Design Brief, Eng Spec, Research, Metrics
- Launch Assets Complete (multi_select): Loom, SOP, KB Article, Storylane, In-App Tour, Customer Email, Slack Announcement
- Customer-Facing (checkbox)

### 2.4 How to Test

1. **Open the test DB** in Notion at the sandbox page
2. **Try filling in new columns** for 2-3 projects (e.g., Privacy Determination Agent, Structured Hubspot Agent Node, Chat V2)
3. **Test the views** -- create filtered views (Execution View, Marketing View, etc.) and confirm the new columns work in filters, sorts, and grouping
4. **Test multi_select options** -- add values to "Internal Docs Complete" and "Launch Assets Complete" to confirm the dropdown options appear correctly
5. **Test Launch Planning Status** -- cycle through Not Started / In Progress / Blocked / Ready / Launched / N/A
6. **Verify Customer-Facing checkbox** -- toggle it on a few projects and confirm it works in filters

### 2.5 What NOT to Do in the Test DB

- Do not create relations to other live databases
- Do not share the test DB URL externally -- it is a sandbox
- Do not expect data to stay in sync with live -- this is a point-in-time snapshot from Feb 9, 2026

---

## 3. How to Validate Changes

### 3.1 Validation Checklist

Before approving the migration to live, confirm each item:

**Schema Validation:**
- [ ] All 19 existing columns are present and correctly typed
- [ ] All 17 new columns are present and correctly typed
- [ ] Project Phase select options match: Discovery, Definition, Build, Test, Done
- [ ] Visibility select options match: Open Beta, GA, Invite-only Beta, Internal Only
- [ ] PMM Tier select options match: p1, p2, p3, p4
- [ ] Launch Planning Status select options are correct: Not Started, In Progress, Blocked, Ready, Launched, N/A
- [ ] Internal Docs Complete multi_select options: PRD, Design Brief, Eng Spec, Research, Metrics
- [ ] Launch Assets Complete multi_select options: Loom, SOP, KB Article, Storylane, In-App Tour, Customer Email, Slack Announcement

**Data Validation:**
- [ ] Row count matches live (currently 26)
- [ ] All project names match exactly
- [ ] Project Phase values match live for all rows
- [ ] Visibility values match live for all rows
- [ ] PMM Tier values match live for all rows
- [ ] Linear Link URLs are correct for projects that have them
- [ ] Date fields are populated where they existed in live (Privacy Agent Open Beta Launch = 2026-01-27, Global Chat GA Target Launch = 2026-02-04)
- [ ] Rich text fields (Outcome, Objectives, Weekly Status) have content where the live DB has content

**View Validation:**
- [ ] Can create a view filtered to "Phase != Done" (active projects)
- [ ] Can create a view grouped by Project Phase
- [ ] Can create a view sorted by PMM Tier
- [ ] New columns appear in view column options
- [ ] Multi-select filters work (e.g., "Internal Docs Complete contains PRD")

### 3.2 Who Validates

| Validator | What They Check |
|-----------|----------------|
| Tyler | Schema correctness, data integrity, all checklist items |
| Sam | Views match his review needs, fields make sense for weekly council |
| Kenzie | Launch Planning columns match her requirements |

### 3.3 How to Report Issues

If validation reveals problems:
1. Note the column name, expected value, and actual value
2. Determine if it is a schema issue (wrong type, missing option) or data issue (wrong value copied)
3. Schema issues must be fixed before go-live; data issues can be fixed post-migration

---

## 4. Migration Playbook: Going Live

### 4.1 Pre-Migration (Day Before)

1. **Get sign-off** from Sam and Kenzie that the test DB schema is approved
2. **Take a snapshot** of the live DB by querying all rows via the Notion API and saving the JSON
3. **Announce the migration** in #product-team Slack: "Projects DB schema upgrade happening tomorrow. Read-only during migration window (expect ~30 min)."
4. **Confirm no one is actively editing** the Projects DB during the migration window

### 4.2 Migration Steps

**Option A: Add columns to live DB (Preferred -- lower risk)**

This is the recommended approach because it preserves all existing data, relations, views, and page content.

1. Use the Notion API `NOTION_UPDATE_SCHEMA_DATABASE` to add each new column to the live DB (`2c0f79b2-c8ac-802c-8b15-c84a8fce3513`)
2. Add columns in this order:
   - Internal Documentation Links: PRD Link, Design Brief Link, Eng Spec Link, Research Link
   - Launch Assets External: Storylane Demo, In-App Tour, Product Update Slack
   - Launch Assets Pages: SOP, Marketing Brief, Customer Email Draft, FAQ
   - Launch Planning: Launch Planning Status, Launch Blocked By, Target Launch Date
   - Tracking: Internal Docs Complete, Launch Assets Complete, Customer-Facing
3. Verify each column was created correctly after adding it
4. Do NOT change the Project Phase column type (keep status -- it works, we just could not create it via the API)

**Option B: Replace live DB (Higher risk -- only if schema changes require it)**

Use this only if fundamental schema changes are needed that cannot be done via column additions.

1. Rename the live DB to "Projects DB -- ARCHIVED [date]"
2. Move the test DB out of the sandbox page to the live location
3. Rename the test DB to "Projects DB"
4. Recreate any relation columns (GTM, Weekly Updates, Product Tickets) pointing to the correct databases
5. Update any Notion pages or bookmarks that link to the old DB ID
6. Re-create any views that existed on the live DB

### 4.3 Post-Migration Verification

1. **Count rows** -- confirm 26 projects still present
2. **Spot-check 5 projects** -- verify title, phase, visibility, and at least one URL field
3. **Check existing views** -- confirm Sam's review view and any other saved views still work
4. **Test a new column** -- fill in "Customer-Facing" checkbox on one project to confirm it works
5. **Announce completion** in #product-team Slack: "Projects DB schema upgrade complete. X new columns added. Please report any issues."

### 4.4 Rollback Plan

If something goes wrong:

- **Option A (columns added):** Delete the newly added columns via `NOTION_UPDATE_SCHEMA_DATABASE` with remove=true. Existing data is untouched.
- **Option B (DB replaced):** Rename the replacement DB, restore the archived original, rename it back. Update any links that were changed.

The JSON snapshot from step 4.1.2 serves as the ultimate backup for data recovery.

---

## 5. Ongoing Maintenance

### 5.1 Weekly Cadence

| Day | Who | Action |
|-----|-----|--------|
| Wednesday | Tyler | Update Weekly Status Update for all active projects (Done / Up Next / Blocked) |
| Wednesday | Tyler | Check "Internal Docs Complete" and "Launch Assets Complete" for projects approaching beta/GA |
| Thursday | Sam + Tyler | Review Projects DB in council meeting, filtered to Phase != Done |
| Friday | Tyler | Update any dates or phases that changed during the week |

### 5.2 Per-Project Lifecycle Maintenance

When a project **enters Build phase:**
- Fill in Objectives & Success (Primary / Engagement / Leading metrics)
- Set PMM Tier (p1-p4)
- Check "Customer-Facing" if applicable
- Add PRD Link if a PRD exists

When a project **approaches Beta:**
- Set Launch Planning Status to "In Progress"
- Set Target Launch Date
- Start filling "Internal Docs Complete" (PRD, Design Brief, Eng Spec, Research, Metrics)
- Start filling "Launch Assets Complete" as assets are created
- Add links to: KB Article, Loom Video, Storylane Demo (as created)

When a project **reaches GA:**
- Update Project Phase to Done
- Update Visibility to GA
- Set actual launch dates in GA Target Launch / GA Target Release Date
- Confirm all "Launch Assets Complete" items are checked
- Write final Weekly Status Update noting the GA launch
- Update Launch Planning Status to "Launched"

### 5.3 Monthly Cleanup

- Archive "Done" projects older than 90 days (move to an archived view, do not delete)
- Review "Discovery" projects -- are they still relevant? If no activity in 30+ days, discuss in council
- Check for projects with empty Objectives & Success that are in Build or later -- these need filling

### 5.4 Quarterly Review

- Review if column schema still meets team needs
- Evaluate if Launch Planning Status options need updating
- Check if Internal Docs Complete / Launch Assets Complete multi-select options need new items
- Audit gap detection: which projects went to GA without full launch materials?

### 5.5 Adding New Projects

When creating a new project row:
1. Set Project name (required)
2. Set Project Phase (default: Discovery)
3. Set Visibility (default: Internal Only for Discovery)
4. Set Customer-Facing checkbox
5. Leave new columns empty until the project progresses -- they will be filled as part of the lifecycle maintenance above

### 5.6 Column Change Process

If the schema needs to change after go-live:
1. Propose the change in #product-team or the weekly council
2. Test the change in the sandbox test DB first
3. Get sign-off from Sam
4. Apply to live DB via API or Notion UI
5. Update this SOP to reflect the change

---

## 6. Known Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| Project Phase is "status" type in live, "select" in test | Cannot create status type via API | Use Option A migration (add columns only, keep existing status column) |
| Rich text fields capped at 2000 chars via API | Long weekly updates may be truncated when writing via API | Edit long text directly in Notion UI |
| Relation fields not migrated to test DB | Cannot test GTM, Weekly Updates, or Product Tickets relations in sandbox | These stay unchanged in live DB -- no migration needed |
| Multi-select options created on first use | Options like "PRD" for Internal Docs Complete are created when first selected | Pre-populate by setting values on at least one row during initial setup |
| No "Marketing Owner" person column | Person type not supported in CREATE_DATABASE | Add manually in Notion UI after migration, or use the API PATCH endpoint |

---

## 7. Quick Reference

### Notion API Commands Used

| Action | API Call | Purpose |
|--------|---------|---------|
| Create test DB | `NOTION_CREATE_DATABASE` | Create sandbox copy with full schema |
| Copy rows | `NOTION_INSERT_ROW_DATABASE` | Insert project rows into test DB |
| Add column to live | `NOTION_UPDATE_SCHEMA_DATABASE` | Add new properties to live DB |
| Remove column | `NOTION_UPDATE_SCHEMA_DATABASE` (remove=true) | Rollback if needed |
| Query all rows | `NOTION_QUERY_DATABASE` | Snapshot/backup before migration |
| Update a row | `NOTION_UPDATE_ROW_DATABASE` | Fix individual row data |

### Key Database IDs

```
Live DB:    2c0f79b2-c8ac-802c-8b15-c84a8fce3513
Test DB:    303f79b2-c8ac-81fc-b1dc-c57aec61df61
Sandbox:    303f79b2-c8ac-819f-8a5e-ee9a9891df2f
```
