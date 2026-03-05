# ~~Plan for Remaining Floating Pages in Product Teamspace~~ [SUPERSEDED]

> **SUPERSEDED by `notion-v2-implementation-guide.md` (2026-02-23)**
> The V2 structure replaces all previous cleanup plans.

The automated script successfully moved all pages that were nested *inside* other pages, but Notion's API strictly prohibits moving or archiving pages that sit at the very root of your workspace (`parent_type: workspace`). 

There are 113 items sitting at the workspace root. Below is a categorized plan for the **Product-relevant** items, detailing exactly which folder to drag them into using the Notion UI. (The rest are personal or belong to other teams).

---

## 1. Drag into 📁 Strategy & Context
These are your wiki-style reference documents, operating guidelines, and strategy pages:
- `Product System Guide (1)`
- `Personas`
- `Customer Personas`
- `How to Run Successful Initiatives V2`
- `PERSONA OUTCOMES & ASSOCIATED WORKFLOWS`
- `GTM Change Log (PMM-Focused)`
- `Messaging Matrix`
- `Bug Triage Process & SLA`
- `AskElephant CRM Disruption Blueprint`

## 2. Drag into 📁 Feedback & Signals
These pages relate to processing customer input and usage data:
- `Signals`
- `Customer Feedback Prompts`
- `Combining Customer Feedback with Usage Data`
- `Usage SQL Queries`
- `Scorecard Artifact`

## 3. Drag into 📁 Roadmap & Planning
These pages dictate future scoping and high-level prioritization:
- `2026 Feb Roadmap Brainstorm` (If this exists as a loose page)
- `Release Planning`
- `Quality Improvement Initiative`

## 4. Drag into 📁 Templates
These are reusable frameworks:
- `Master Integration Template` (and its sub-templates like `Integration Template — Build`)
- `Connected Workspace Template`

## 5. Drag into 📁 Archive (or Delete)
These pages are stale snapshots or explicitly marked as deprecated. You can select them all, right click, and hit "Delete", or drag them to the Archive folder:
- `Product System Guide (pre-2026-01-26)`
- `Product Command Center (pre-2026-01-26)`
- `DEPRECATED DON'T USE - Integrations Home - DEPRECATED DON'T USE`
- Any `(untitled)` blank pages.

---

### What about the rest of the pages?
The remainder of the 113 pages fall into three categories that you should **leave alone** or move to their respective teamspaces:
1. **Engineering/CS/Sales Homes:** (`Engineering Home`, `SDR HOME`, `Client Success`, `Marketing Hub`)
2. **Personal/School:** (`CS 180 Midterm`, `CS 340 Midterm Study Guide`, `Financial Goals`, `2026 Goals & Habits`, `Personal OS`)
3. **Client-Specific Notes:** (`Stout`, `Lindsey Fine`, `Loveable`, `ROI CX x AskElephant - Sync`)