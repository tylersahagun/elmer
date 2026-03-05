# ~~Notion Product Home Sidebar Cleanup Guide~~ [SUPERSEDED]

> **SUPERSEDED by `notion-v2-implementation-guide.md` (2026-02-23)**
> The V2 structure replaces all previous sidebar cleanup plans. See the new guide for the current architecture.

**Created:** 2026-02-22  
**Purpose:** ~~Practical guide to organize your Product teamspace sidebar using Notion best practices and MCP tools.~~ DEPRECATED.

---

## How Notion Sidebars Work

### What Appears in the Sidebar

- **Teamspace pages** = Top-level items with `parent: { workspace: true }`
- **Child pages** = Nested under parent pages (expandable sections)
- **Databases** = Can be top-level or nested; often better as linked views inside pages

### Notion’s Guidance (from your research)

1. **Minimize top-level pages** — Prefer a small number of top-level pages; put everything else inside them.
2. **Use containers** — Create 5–7 expandable “folder” pages and nest content under them.
3. **Sidebar = few hubs; discovery = linked views** — Don’t rely on folder browsing; use database views and filters.
4. **Archive old work** — Move completed/deprecated items into an Archive to reduce clutter.
5. **Rotate favorites** — Don’t favorite everything; favorite only what you use often.

---

## Target Sidebar Structure

From `notion-product-synthesis.md` and `notion-product-home-cleanup-plan.md`:

```
Product (teamspace)
├── Product Home                    ← Dashboard (linked views, quick links)
│   ├── 📁 Definition               ← Projects, Documents, Launch Tracker
│   ├── 📁 Feedback & Signals        ← Product Feedback, Tasks
│   ├── 📁 Strategy & Context        ← Product Strategy, Personas, Pillars
│   ├── 📁 Roadmap & Planning        ← Roadmap briefs
│   ├── 📁 Templates                 ← Brief template, Definition of Done
│   └── 📁 Archive                   ← Completed/deprecated initiatives & docs
├── Product System                   ← Single page with all linked database views
└── Archive                          ← High-level archive (optional)
```

---

## MCP Tools Available (Composio Notion)

| Tool | Use |
|------|-----|
| `NOTION_SEARCH_NOTION_PAGE` | Find pages/databases by title |
| `NOTION_FETCH_BLOCK_CONTENTS` | List child pages/blocks under a page |
| `NOTION_CREATE_NOTION_PAGE` | Create new container pages |
| `NOTION_RETRIEVE_PAGE` | Get page metadata (title, parent) |
| `NOTION_DUPLICATE_PAGE` | Copy a page into a new parent |
| `NOTION_ARCHIVE_NOTION_PAGE` | Move to trash (not for workspace-level pages) |
| `NOTION_UPDATE_PAGE` | Change properties, icon, etc. |

---

## Cleanup Steps (Manual + MCP-Assisted)

### Phase 1: Create Container Structure (MCP-assisted)

1. **Find Product Home** (or the main Product page):
   - Search: `NOTION_SEARCH_NOTION_PAGE` with `query: "Product Home"` or `query: "Product"`
   - Or use the page ID if known (e.g., from URLs).

2. **Create 6 container pages** under Product Home:
   ```
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Definition", icon: "📁")
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Feedback & Signals", icon: "📁")
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Strategy & Context", icon: "📁")
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Roadmap & Planning", icon: "📁")
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Templates", icon: "📁")
   NOTION_CREATE_NOTION_PAGE(parent_id: <Product_Home_id>, title: "Archive", icon: "📁")
   ```

### Phase 2: Move Loose Pages into Containers

**Important:** Workspace-level pages (root of teamspace) **cannot be archived via the API**. You must move them in Notion’s UI.

**Option A – Manual (recommended for top-level items):**
1. In Notion, expand Product Home.
2. Drag each loose page into the correct container (Definition, Strategy, etc.).
3. Use the mapping from `notion-product-home-cleanup-plan.md` Part 5.

**Option B – MCP (for pages already under another page):**
- Use `NOTION_DUPLICATE_PAGE` to copy a page into a container, then archive the original with `NOTION_ARCHIVE_NOTION_PAGE` (only if the original is *not* workspace-level).

### Phase 3: Hide Databases from Sidebar (Manual)

- Right-click each database in the sidebar → **Add to Favorites** (optional)
- Or move databases inside a container so they become child pages of that container.
- Prefer **linked database** blocks on Product Home / Product System instead of raw DB pages in the sidebar.

### Phase 4: Consolidate Definition Work

- Move standalone PRDs, research, and decisions into the **Product Documents** database.
- Link each document to its initiative (Projects relation).
- Keep Engineering Specs and Design Briefs as separate DBs (per your plan).

---

## Page → Container Mapping (from your cleanup plan)

| Current Page | Target Container |
|-------------|------------------|
| Product Brief Template | Templates |
| Product Strategy | Strategy & Context |
| 2026 Feb Roadmap Brief | Roadmap & Planning |
| Customer Personas | Strategy & Context |
| DEFINITION OF DONE | Templates |
| Voice Prints - PRD | → Documents DB (type: prd) |
| Signals - PRD | → Documents DB |
| Onboarding - PRD | → Documents DB |
| Product Process / Tools | Strategy & Context |
| Projects Database | Definition |
| Product Feedback | Feedback & Signals |
| Launch Tracker | Definition |
| Tasks | Feedback & Signals |
| Product Pillars | Strategy & Context |
| Knowledge Base | Strategy & Context |

---

## Success Criteria

- [ ] Product Home shows ≤7 expandable sections; no flat list of 20+ items.
- [ ] All definition work (PRDs, research, decisions) lives in Product Documents or Eng Specs / Design Briefs DBs, linked to Projects.
- [ ] Each Project page has a “Documents” linked view.
- [ ] Archive contains deprecated/old initiative docs.

---

## Quick Commands for Agent

To execute cleanup via Cursor/Codex:

1. **Create containers:**  
   "Create 6 container pages (Definition, Feedback & Signals, Strategy & Context, Roadmap & Planning, Templates, Archive) under Product Home using Notion MCP."

2. **Audit current structure:**  
   "Search Notion for all Product-related pages and list what’s at the top level vs nested."

3. **Map pages to containers:**  
   "Using the mapping in notion-sidebar-cleanup-guide.md, suggest which pages to move where."

---

## Created Containers (2026-02-22)

Created under **Product System Guide** (`32ef79b2-c8ac-8287-8993-811a5179966c`):

| Container | Page ID | URL |
|-----------|---------|-----|
| Definition | `30ff79b2-c8ac-81bd-9adb-f08418efe25d` | [Definition](https://www.notion.so/Definition-30ff79b2c8ac81bd9adbf08418efe25d) |
| Feedback & Signals | `30ff79b2-c8ac-8199-87d2-f0fda6953776` | [Feedback & Signals](https://www.notion.so/Feedback-Signals-30ff79b2c8ac819987d2f0fda6953776) |
| Strategy & Context | `30ff79b2-c8ac-81e8-90aa-c0433486dff0` | [Strategy & Context](https://www.notion.so/Strategy-Context-30ff79b2c8ac81e890aac0433486dff0) |
| Roadmap & Planning | `30ff79b2-c8ac-8147-a3c1-fc0ee6a45c1f` | [Roadmap & Planning](https://www.notion.so/Roadmap-Planning-30ff79b2c8ac8147a3c1fc0ee6a45c1f) |
| Templates | `30ff79b2-c8ac-8100-b5ed-e96b0e6c58e5` | [Templates](https://www.notion.so/Templates-30ff79b2c8ac8100b5ede96b0e6c58e5) |
| Archive | `30ff79b2-c8ac-813c-8c2d-d5b34945b94a` | [Archive](https://www.notion.so/Archive-30ff79b2c8ac813c8c2dd5b34945b94a) |

**Next step:** In Notion, drag loose sidebar pages into these containers per the mapping in Part 5.

---

## References

- `pm-workspace-docs/analysis/notion-product-home-cleanup-plan.md`
- `pm-workspace-docs/analysis/notion-product-synthesis.md`
- `pm-workspace-docs/runbooks/command-center-sync-ops.md` (if syncing with PM workspace)
