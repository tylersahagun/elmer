# Notion MCP Implementation Plan: Sidebar & Data Model Alignment

**Created:** 2026-02-22  
**Purpose:** A step-by-step plan to implement the Notion Information Architecture (IA) gap analysis using the available Notion MCP tools (via Composio).

---

## 1. Available Notion MCP Tools

Based on our integrations, we have the following tools available through the `user-composio` MCP server:

- `NOTION_SEARCH_NOTION_PAGE`: Find existing pages and databases (e.g., "Product Home", "Projects").
- `NOTION_CREATE_NOTION_PAGE`: Create new container pages and new databases.
- `NOTION_UPDATE_PAGE`: Update page properties, titles, and icons.
- `NOTION_DUPLICATE_PAGE`: Duplicate pages to move them into new containers.
- `NOTION_ARCHIVE_NOTION_PAGE`: Archive original pages after duplication (if they are not workspace-level).
- `NOTION_FETCH_BLOCK_CONTENTS`: List child pages or blocks under a specific page.
- `NOTION_RETRIEVE_PAGE`: Get metadata for an existing page.

---

## 2. Phase 1: Establish the Top-Level Containers

**Goal:** Create the 5 target folders under the main "Product Home" page to act as our sidebar hierarchy.

1. **Find "Product Home"**
   - Use `NOTION_SEARCH_NOTION_PAGE` with `query: "Product Home"` to retrieve the `parent_id`.
2. **Create the 5 Containers**
   - Execute `NOTION_CREATE_NOTION_PAGE` five times, passing the `parent_id` from step 1:
     - `title: "Definition"`, `icon: "📁"`
     - `title: "Feedback & Signals"`, `icon: "📁"`
     - `title: "Strategy & Context"`, `icon: "📁"`
     - `title: "Templates"`, `icon: "📁"`
     - `title: "Archive"`, `icon: "📁"`
3. **Capture Container IDs**
   - Save the returned IDs for these 5 new pages. They will serve as the parents for Phase 2 and 3.

---

## 3. Phase 2: Migrate Existing Pages into Containers

**Goal:** Move loose wiki pages from the root/sidebar into the new containers. Since Notion's API doesn't have a direct "move" endpoint for all cases, we will use Duplicate + Archive where applicable, or flag for manual drag-and-drop if they are workspace-level.

1. **Search for Target Pages**
   - Use `NOTION_SEARCH_NOTION_PAGE` to find pages like "Product Process", "Product Strategy", "Customer Personas", "DEFINITION OF DONE", "Launch Tracker".
2. **Duplicate to New Containers**
   - Strategy & Context: Duplicate "Product Process", "Org-chart" (if exists), "Customer Personas".
   - Templates: Duplicate "Product Brief Template", "DEFINITION OF DONE".
   - Archive: Duplicate old PRDs ("Voice Prints - PRD", etc.) if not migrating them to the DB yet.
   - Use `NOTION_DUPLICATE_PAGE` passing the target container's ID as the new parent.
3. **Archive Originals**
   - Use `NOTION_ARCHIVE_NOTION_PAGE` on the original page IDs to clean them up. *(Note: If a page is at the workspace root, this API call will fail and require a manual drag in the UI).*

---

## 4. Phase 3: Database Schema Upgrades & Creation

**Goal:** Enhance the existing Projects database and build the missing relational databases to support traceability.

*(Note: While MCP tools can create pages, modifying database schema properties (adding new columns like Select, Relation, Rollup) via the standard `NOTION_UPDATE_PAGE` or creating entirely new databases with complex schemas often hits Notion API limitations through basic MCP actions. These structural changes are best done manually in the UI, followed by populating them via MCP).*

### Action Items (UI + MCP Hybrid)

1. **Upgrade "Initiatives" (Projects) DB (Manual UI Setup Required First)**
   - Add properties: `Phase` (Select), `Outcome Status` (Select), `Confidence` (Select), `Baseline` (Number), `Target` (Number), `Actual` (Number).
   - Move the database into the `Definition` container (drag and drop).

2. **Create New Databases (Manual UI Setup Recommended)**
   - **Product Documents DB**: Inside `Definition`. Properties: `Type` (Select), `Project` (Relation to Initiatives), `Phase` (Select), `Stage` (Select), `Canonical` (Checkbox).
   - **Milestones DB**: Inside `Definition`. Properties: `Target Date` (Date), `Status` (Select), `ETA Confidence` (Select), `Initiative` (Relation).
   - **Customer Requests DB**: Inside `Feedback & Signals`. Properties: `HubSpot Company` (URL), `Slack Signal` (URL), `Initiative/Milestone` (Relation).
   - **Meeting Notes DB**: Inside `Feedback & Signals`. Properties: `Type` (Select), `Initiative` (Relation).

3. **Populate Data via MCP**
   - Once the DBs exist, use `NOTION_SEARCH_NOTION_PAGE` to get the Database IDs.
   - We can write scripts to batch create records in the "Product Documents DB" by reading the local `pm-workspace-docs/initiatives/active/*` folders and pushing metadata using `NOTION_CREATE_NOTION_PAGE` targeting the Database ID.

---

## 5. Phase 4: Construct Command Views (Dashboards)

**Goal:** Build the operational dashboards on "Product Home".

1. **Create Dashboard Layout (Manual UI)**
   - The Notion API does not currently support creating complex layout blocks (like 2-column structures or dynamically filtered Linked Database views) seamlessly via MCP.
   - **Action:** Open "Product Home" in the Notion UI.
   - Type `/linked database` to insert the **Outcomes Cockpit**. Select the Initiatives DB and filter for `Outcome Status` = "Needs Attention".
   - Type `/linked database` to insert the **Missing Core Docs** view.

---

## Execution Summary for Agent

When you ask me to execute this plan, I will:
1. Run the MCP commands for **Phase 1** entirely autonomously to build your folder structure.
2. Run the search/duplicate commands for **Phase 2** to clean up the loose wiki pages.
3. Provide you with the exact Notion links to the new containers and the list of database properties to click-to-add for **Phase 3 and 4**, as those require UI interactions for reliable schema creation.