# Notion Product Workspace V2 — Implementation Guide

**Created:** 2026-02-23  
**Source:** `notion-structure-v2.jsx` (4-Layer PM System)  
**Status:** Structure created. NEXT: Move items to Product teamspace sidebar, add relations, archive old pages.

---

## URGENT: Move Items to Product Teamspace Sidebar

All V2 items were created under **Product System Guide (1)** because the Notion API cannot create workspace-root pages. You need to move them to the Product teamspace sidebar in the Notion UI:

### Steps to Move (5 minutes in Notion UI)
1. Open [Product System Guide (1)](https://www.notion.so/ask-elephant/Product-System-Guide-1-32ef79b2c8ac82878993811a5179966c)
2. You'll see the new pages and databases nested inside
3. For each item below, right-click → **Move to** → select **Product** teamspace (top level)
4. After all items are moved, archive "Product System Guide (1)" — it will be empty
5. Also archive the old "Product System Guide (pre-2026-01-26)" and "Product Command Center (pre-2026-01-26)"

### Items to Move to Sidebar (in order)

| # | Sidebar Item | Type | ID | Notion URL |
|---|---|---|---|---|
| 1 | 🏠 Product Home | Page | `310f79b2-c8ac-81f9-97aa-e293be8079b6` | [Link](https://www.notion.so/Product-Home-310f79b2c8ac81f997aae293be8079b6) |
| 2 | 🧭 Strategy & Context | Page | `310f79b2-c8ac-81f2-992e-e1fe36f9a477` | [Link](https://www.notion.so/Strategy-Context-310f79b2c8ac81f2992ee1fe36f9a477) |
| 3 | 📝 Documentation | Page | `310f79b2-c8ac-81a1-8b6d-d570885ef040` | [Link](https://www.notion.so/Documentation-310f79b2c8ac81a18b6dd570885ef040) |
| 4 | 💬 Feedback | Page | `310f79b2-c8ac-816a-88c6-c34c5634aade` | [Link](https://www.notion.so/Feedback-310f79b2c8ac816a88c6c34c5634aade) |
| 5 | 📅 Meetings | Page | `310f79b2-c8ac-81b8-9cfc-c5de95f4ddf1` | [Link](https://www.notion.so/Meetings-310f79b2c8ac81b89cfcc5de95f4ddf1) |
| 6 | 📈 Product Usage & Metrics | Page | `310f79b2-c8ac-8149-bfbe-c847a033715f` | [Link](https://www.notion.so/Product-Usage-Metrics-310f79b2c8ac8149bfbec847a033715f) |
| 7 | 📋 Process & Templates | Page | `310f79b2-c8ac-8114-b9fe-c562f66ed0ea` | [Link](https://www.notion.so/Process-Templates-310f79b2c8ac8114b9fec562f66ed0ea) |
| 8 | 🔗 External Tool Links | Page | `310f79b2-c8ac-81e1-9cd2-ca2e66bcd8a3` | [Link](https://www.notion.so/External-Tool-Links-310f79b2c8ac81e19cd2ca2e66bcd8a3) |

### New Databases Created

#### Core (Sidebar-Level)
| Database | ID | Layer | Parent |
|---|---|---|---|
| 👥 Teams Roster | `310f79b2-c8ac-814a-b8e4-f525b17e2750` | L1 | Product System Guide |
| 🗺️ Roadmap | `310f79b2-c8ac-8151-980c-c74fd238daa0` | — | Product System Guide |
| 🚀 Initiatives | `310f79b2-c8ac-816b-8abd-f8fcd3824f31` | — | Product System Guide |
| 📢 Weekly Updates | `310f79b2-c8ac-8169-9d3f-f2bcebdc3d15` | L4 | Product System Guide |

#### Under Feedback Section
| Database | ID |
|---|---|
| 🏢 Companies | `310f79b2-c8ac-81b8-907b-cb0fe95378cd` |
| 👤 Contacts | `310f79b2-c8ac-8182-b8d9-cbacddc200c5` |
| 📩 Feedback Triage | `310f79b2-c8ac-8102-ad47-cc8111174e47` |
| 🗳️ Feature Requests | `310f79b2-c8ac-8190-9713-dc5cfc78d976` |

#### Under Documentation Section
| Database | ID |
|---|---|
| 📐 Design Specs | `310f79b2-c8ac-81d1-a39a-e26426a12b30` |
| 🔬 Research | `310f79b2-c8ac-812c-bc08-d580369ff0d8` |
| 🎥 Enablement Videos | `310f79b2-c8ac-8158-a03f-e3d310949b2e` |
| 📖 Help Center Docs | `310f79b2-c8ac-8160-8136-ed4c3d2cee8c` |
| 🎬 Loom Videos | `310f79b2-c8ac-8167-9f65-fc774affbf04` |

#### Under Meetings Section
| Database | ID |
|---|---|
| 🔄 Recurring Meetings | `310f79b2-c8ac-815e-a26d-fd5204d9df26` |
| 📌 One-Off Meetings | `310f79b2-c8ac-8136-95a7-ce9769e4965d` |
| ⚖️ Decision Log | `310f79b2-c8ac-813b-b2d5-cfbfe324f418` |

#### Under Product Usage & Metrics Section
| Database | ID |
|---|---|
| 💡 Insights | `310f79b2-c8ac-814f-a075-ebf99b75211c` |
| 🎯 Events Catalog | `310f79b2-c8ac-8183-a1d6-e4141cf8c61e` |
| 🧪 Experiments / A-B Tests | `310f79b2-c8ac-814c-9feb-e4b10eefb1b4` |

#### Under Process & Templates Section
| Database | ID |
|---|---|
| 🔙 Retrospectives | `310f79b2-c8ac-817d-80bc-dc9aaebba0d7` |

### Existing Databases (Already in Notion)
These already exist and should be referenced/linked, not recreated:

| Database | ID | Maps to V2 Item |
|---|---|---|
| 🐘 Projects Database | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` | Projects (Layer 2) |
| Meeting Notes | `309f79b2-c8ac-804d-b319-f83c1d017074` | Meeting Notes |
| Tasks | `38fa1709-c988-40a6-908a-a8927657b0b4` | Tasks (Layer 3) |
| 👨‍💻 Engineering Specs | `7321cbcb-31a9-470f-b15d-0f472d2c5eb8` | Technical Specs / RFCs |
| Competitor Database | `2d2f79b2-c8ac-8078-95e7-c58d73f7ffc7` | Competitor Research |
| Milestones | `310f79b2-c8ac-815f-91ad-f11d36b8d534` | Milestones |
| Product Documents | `310f79b2-c8ac-8103-b162-c3f3c15924ef` | PRDs |

### HubSpot Data Seeded
8 active customer companies seeded into the Companies database from HubSpot:
- Boostly ($1M ARR, 50 contacts)
- ELB Learning ($105M ARR, 153 contacts)
- CoachCRM ($10M ARR, 2 contacts)
- Parallel (12 contacts)
- Tava Health ($10M ARR, 6 contacts)
- Motivosity ($10M ARR, 31 contacts)
- LinQ Ventures (2 contacts)
- Coro ($50M ARR, 7 contacts)

---

## Manual Steps Required (Notion UI)

### 1. Add Relations Between Databases

The Notion API cannot create relation properties between databases. These must be added manually in the Notion UI.

**Priority 1 — Core Hierarchy:**
| Source DB | Relation Property | Target DB |
|---|---|---|
| Initiatives | `Roadmap Item` | → Roadmap |
| Initiatives | `Projects` | → Projects Database |
| Projects Database | `Initiative` | → Initiatives |
| Projects Database | `Team` | → Teams Roster |
| Milestones | `Project` | → Projects Database |
| Tasks | `Project` | → Projects Database |

**Priority 2 — Documentation:**
| Source DB | Relation Property | Target DB |
|---|---|---|
| PRDs (Product Documents) | `Project` | → Projects Database |
| Design Specs | `Project` | → Projects Database |
| Engineering Specs | `Project` | → Projects Database |
| Research | `Project` | → Projects Database |
| Research | `Initiative` | → Initiatives |

**Priority 3 — Feedback Pipeline:**
| Source DB | Relation Property | Target DB |
|---|---|---|
| Contacts | `Company` | → Companies |
| Feedback Triage | `Company` | → Companies |
| Feedback Triage | `Contact` | → Contacts |
| Feedback Triage | `Feature Request` | → Feature Requests |
| Feature Requests | `Roadmap Item` | → Roadmap |
| Feature Requests | `Initiative` | → Initiatives |

**Priority 4 — Meetings & Decisions:**
| Source DB | Relation Property | Target DB |
|---|---|---|
| Recurring Meetings | `Team` | → Teams Roster |
| One-Off Meetings | `Project` | → Projects Database |
| Meeting Notes | `Project` | → Projects Database |
| Decision Log | `Project` | → Projects Database |
| Decision Log | `Meeting Notes` | → Meeting Notes |

**Priority 5 — Metrics & Retros:**
| Source DB | Relation Property | Target DB |
|---|---|---|
| Insights | `Related Project` | → Projects Database |
| Experiments | `Project` | → Projects Database |
| Experiments | `Related Insights` | → Insights |
| Retrospectives | `Project` | → Projects Database |

### 2. Promote to Sidebar

In the Notion UI, drag these items from inside Product System Guide to the Product teamspace sidebar:
1. 🏠 Product Home
2. 👥 Teams Roster
3. 🧭 Strategy & Context
4. 🗺️ Roadmap
5. 🚀 Initiatives (nested under Roadmap or standalone)
6. 📢 Weekly Updates
7. 📝 Documentation
8. 💬 Feedback
9. 📅 Meetings
10. 📈 Product Usage & Metrics
11. 📋 Process & Templates
12. 🔗 External Tool Links

### 3. Move Existing DBs Into Sections

Drag existing databases into the appropriate sections:
- `Competitor Database` → inside Strategy & Context
- `Product Documents` → inside Documentation (as PRDs)
- `Engineering Specs` → inside Documentation (as Technical Specs)
- `Meeting Notes` → inside Meetings
- `Milestones` → keep nested under Roadmap hierarchy

### 4. Create Linked Database Views

On the **Product Home** page, add linked views:
- Active Projects (filtered from Projects Database)
- Recent Weekly Updates
- Open Feature Requests
- Missing Core Docs alert

### 5. Populate Select Options

Add select options to the new databases:
- **Roadmap.Status**: Planned, In Progress, Shipped, Deferred
- **Roadmap.Quarter**: Q1 2026, Q2 2026, Q3 2026, Q4 2026
- **Initiatives.Status**: Discovery, Define, Build, Validate, Launch, Done
- **Companies.Health Score**: Healthy, Needs Attention, At Risk, Churned
- **Companies.Plan/Tier**: Customer, Prospect, Trial, Churned
- **Feedback Triage.Source**: Slack, Email, Call, Support Ticket, Meeting
- **Feedback Triage.Status**: New, Reviewed, Actioned
- **Feedback Triage.Sentiment**: Positive, Neutral, Negative, Urgent
- **Feature Requests.Status**: Proposed, Accepted, Declined, Shipped
- **Decision Log.Status**: Proposed, Final, Reversed
- **Recurring Meetings.Cadence**: Daily, Weekly, Biweekly, Monthly
- **Insights.Source**: PostHog, Survey, Support, Customer Call
- **Insights.Impact**: High, Medium, Low
- **Experiments.Status**: Planned, Running, Analyzing, Complete
- **Help Center Docs.Status**: Draft, Published, Needs Update

---

## 4-Layer System Reference

| Layer | DB | Audience | Question |
|---|---|---|---|
| L1 | Teams Roster | Leadership, PMs | WHO is building? |
| L2 | Projects | Sales, Support, Marketing, Eng | WHAT is being built & WHEN? |
| L3 | Tasks (or Linear Sync) | Engineers, Designers, PMs | HOW is the work broken down? |
| L4 | Weekly Updates | Entire company | What should I PAY ATTENTION to? |

### Self-Reinforcing Loop
- Weekly Updates embed Projects tracker at bottom → incentivizes keeping projects current
- Projects link to Teams via relation → filtered views on team pages show their projects
- Tasks embed inside Project pages → anyone opening a project sees work breakdown
- Product Marketing pulls launch dates from Projects → launch calendar stays current

---

## Architecture Diagram

```
Product Teamspace (Sidebar)
├── 🏠 Product Home (dashboard with linked views)
├── 👥 Teams Roster [DB, L1]
├── 🧭 Strategy & Context
│   ├── 🏢 Company Context (page)
│   └── 🔭 Competitor Research [existing DB]
├── 🗺️ Roadmap [DB]
│   ├── 🚀 Initiatives [DB]
│   │   └── 📦 Projects [existing DB, L2]
│   │       ├── 🏁 Milestones [existing DB]
│   │       └── 🎟️ Tasks [existing DB / Linear Sync, L3]
│   └── (Timeline, Board, Table views)
├── 📢 Weekly Updates [DB, L4]
├── 📝 Documentation
│   ├── 📋 PRDs [existing Product Documents DB]
│   ├── 📐 Design Specs [DB]
│   ├── ⚙️ Technical Specs / RFCs [existing Engineering Specs DB]
│   ├── 🔬 Research [DB]
│   ├── 🎥 Enablement Videos [DB]
│   ├── 📖 Help Center Docs [DB]
│   └── 🎬 Loom Videos [DB]
├── 💬 Feedback
│   ├── 🏢 Companies [DB, seeded from HubSpot]
│   ├── 👤 Contacts [DB]
│   ├── 📩 Feedback Triage [DB]
│   └── 🗳️ Feature Requests [DB]
├── 📅 Meetings
│   ├── 🔄 Recurring Meetings [DB]
│   ├── 📌 One-Off Meetings [DB]
│   ├── 📝 Meeting Notes [existing DB]
│   └── ⚖️ Decision Log [DB]
├── 📈 Product Usage & Metrics
│   ├── 📊 PostHog Dashboards (page)
│   ├── 💡 Insights [DB]
│   ├── 🎯 Events Catalog [DB]
│   └── 🧪 Experiments / A-B Tests [DB]
├── 📋 Process & Templates
│   ├── 🔄 Product Process (page)
│   ├── 🚦 Release Cycle Gates (page)
│   ├── 📣 Product Marketing (page)
│   ├── 👥 Org Chart (page)
│   └── 🔙 Retrospectives [DB]
└── 🔗 External Tool Links
    ├── 📐 Linear Projects (synced)
    ├── 💬 Slack Channels Directory
    ├── 📊 PostHog Dashboards
    └── 🐙 GitHub Repos
```
