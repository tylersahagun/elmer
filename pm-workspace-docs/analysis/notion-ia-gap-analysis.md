# Notion IA Gap Analysis

**Created:** 2026-02-22
**Purpose:** Align the proposed mental model for Notion tracking with the execution-oriented synthesis model to ensure end-to-end traceability from roadmap to outcomes.

---

## 1. Mapping User Draft to Canonical Entities

Here is how your draft hierarchy maps to the canonical Notion entities defined in the synthesis architecture:

| Your Draft Section | Canonical Notion Entity/Location | Notes |
| :--- | :--- | :--- |
| **Process Documentation** | **Strategy & Context** (Container) | Lives as wiki pages within this container. |
| ↳ *Northstar, Business/Customer Outcomes, Success Metrics/Criteria* | **Initiatives (Projects) Database** (Properties) | These shouldn't be isolated docs; they must be properties directly on the Initiative (`Baseline`, `Target`, `Actual`, `Outcome Status`). |
| **Product Usage & Metrics** | **Metric Links DB** & **Outcomes Cockpit** | Standalone dashboards are hard to track. Map specific PostHog dashboards to the `Metric Links` junction database, which relates directly back to the Initiative/Milestone. |
| **Templates** | **Templates** (Container) | Correct. Keep this as a folder for reusable page templates. |
| **Release Cycle Gates & Requirements** | **Milestones DB** & **Launch Planning DB** | Internal testing, beta, and GA are mapped as Milestones (`Target Date`, `Status`, `ETA Confidence`). |
| **Product Marketing** | **Documents DB** (Type: `gtm-brief`) | Keep marketing artifacts linked directly to the Initiative they support via the Documents database. |
| **Org-chart, Product Process** | **Strategy & Context** (Container) | Core company context lives as wiki pages here. |
| **Meetings (Recurring / One-Off)** | **Meetings DB** (New) or **Feedback & Signals** | Your draft introduces "Meetings." This should be a database linked to Initiatives and Contacts. |
| **Feedback (Companies, Contacts, Triage)** | **Customer Requests DB** (Junction) | Perfect fit. This DB connects HubSpot Companies/Contacts and Slack signals to Initiatives and Milestones. |
| **Roadmap** | **Roadmap Theme** (Property/Relation) | A top-level grouping for Initiatives. |
| ↳ *Initiatives* | **Initiatives (Projects) DB** | The core source of truth for execution. |
| ↳ *Projects* | **Parent/Child Initiatives** | If a "Project" is smaller than an Initiative, map it as a Sub-initiative (self-relation) or a Milestone. |
| ↳ *Milestones* | **Milestones DB** | Bridges Initiatives to Linear execution tracking. |
| **Documentation (PRDs, Research, etc.)** | **Product Documents DB** | Unifies all doc types (PRD, Research, Competitor Research) into one DB, linked to the Initiative. |
| ↳ *Enablement Videos, Help Center, Looms* | **Product Documents DB** (Type: `handoff` or `other`) | Can be added as new Document Types in the same unified database. |

---

## 2. Identify Critical Gaps

While your draft captures the "what," it is missing the governance properties and command views necessary for the "how" and "why."

**Missing Entities & Integrations:**
1. **Linear Integrations:** You need to map Milestones directly to Linear Work (via URL or sync) to drive capacity and confidence forecasting.
2. **Revenue Metrics (Stripe):** Product Usage (PostHog) is listed, but Revenue/Churn signals (Stripe) are needed for the full Outcome Scorecard.
3. **Metric Links Junction DB:** You need a way to link an Initiative directly to a PostHog URL/Stripe metric with an "Impact Delta" rather than just a static text doc.

**Missing Governance Properties:**
1. **Confidence & Outcomes:** The Initiative needs `Confidence` (High, Medium, Low, At Risk) and `Outcome Status` (On Track, Needs Attention, Off Track).
2. **Doc Lifecycle:** Documents need a `Stage` (Draft, In Progress, Approved) and a `Canonical` checkbox to indicate the source of truth.
3. **Core Docs Completion:** A rollup on the Initiative showing `% Core Docs Complete` to enforce process.

**Missing Operating Views (Command Center):**
1. **Outcomes Cockpit:** Target vs. Actual (usage + revenue) grouped by Roadmap Theme.
2. **Missing Core Docs View:** A queue showing which active initiatives lack approved PRDs/Research.
3. **Customer Impact Queue:** A view driving the "GTM Notification Loop" to automatically identify who to email when a milestone ships.

---

## 3. Minimum Viable Product (MVP) Structure Proposal

To preserve your intent while injecting operational rigor, here is the MVP sidebar and database structure.

**Sidebar Structure (Visible in Notion):**
```
Product (teamspace)
├── Product Home (Dashboard with Outcomes Cockpit, Missing Docs views)
│   ├── 📁 Definition (Execution)
│   │   ├── Initiatives (Projects) DB
│   │   ├── Milestones DB
│   │   ├── Product Documents DB
│   │   └── Launch Planning DB
│   ├── 📁 Feedback & Signals (Input)
│   │   ├── Customer Requests DB (Feedback)
│   │   ├── Meeting Notes DB (New - for your recurring/one-off meetings)
│   │   └── Metric Links DB (Usage & Event Dashboards)
│   ├── 📁 Strategy & Context (Wiki)
│   │   ├── Northstar & Product Process
│   │   ├── Org-chart
│   │   └── Competitor Landscape
│   ├── 📁 Templates
│   └── 📁 Archive
└── Product System (Single page with all linked DB views)
```

**Keep / Add / Change Summary:**
- **KEEP:** Your focus on grouping Feedback (Companies/Contacts), Process Documentation, and Templates.
- **CHANGE:** Instead of treating "Documentation" (PRDs/Research) and "Product Metrics" as folders, treat them as *Databases* linked to *Initiatives*. Your PRD doesn't live in a "Documentation" folder; it lives in the Documents DB, relationally linked to the "Settings Redesign" Initiative.
- **ADD:** `Meeting Notes DB` inside Feedback & Signals. Add `Confidence` and `Baseline/Target/Actual` properties directly onto your Initiatives. Add the `Customer Impact Queue` so your feedback actually drives GTM notifications.

---

## 4. Immediate Implementation Checklist

Follow this sequence in Notion to set up the MVP:

- [ ] **1. Create Top-Level Containers:** Under "Product Home", create 5 Pages with the folder icon: `Definition`, `Feedback & Signals`, `Strategy & Context`, `Templates`, `Archive`.
- [ ] **2. Upgrade the Initiatives (Projects) DB:** Add `Phase`, `Outcome Status` (On Track/Off Track), `Confidence` (High/Medium/Low), `Baseline`, `Target`, and `Actual` properties.
- [ ] **3. Create the Product Documents DB:** Place it inside `Definition`. Add a `Type` select field (PRD, Research, Competitor, GTM, Loom) and a `Relation` to Initiatives.
- [ ] **4. Create the Milestones DB:** Place it inside `Definition`. Add `Target Date`, `Status` (Planned, Shipped), and a `Relation` to Initiatives.
- [ ] **5. Create the Customer Requests DB:** Place it inside `Feedback & Signals`. Add `HubSpot Company`, `Contact`, `Slack URL`, and a `Relation` to Initiatives/Milestones.
- [ ] **6. Set Up the Meeting Notes DB:** Place it inside `Feedback & Signals`. Add a `Type` (Recurring, One-off) and `Relation` to Initiatives.
- [ ] **7. Move Loose Wiki Pages:** Drag your Process, Northstar, Org-chart, and Release Cycle pages into `Strategy & Context`.
- [ ] **8. Build Product Home Views:** On the Product Home page, add linked database views for `Outcomes Cockpit` (Initiatives filtered by Phase/Status) and `Missing Core Docs` (Initiatives missing PRDs).
