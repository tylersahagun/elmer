# Product Team Teamspace Revamp — Implementation Plan

> **Status:** Ready for review
> **Date:** February 14, 2026
> **Author:** Tyler Sahagun (PM)
> **Scope:** Complete revamp of Product Team teamspace in Notion
> **Plan Horizon:** 5 phases over 4–6 weeks
> **Constraint:** Notion Business plan (not Enterprise)

---

## Table of Contents

1. [Research Findings & Recommendations](#research-findings--recommendations)
2. [Existing Assets Inventory](#existing-assets-inventory)
3. [Phase 1: Architecture — Database Schema & Relations](#phase-1-architecture)
4. [Phase 2: Core Pages — Homepage, Vision, Roadmap, Intake, Feedback](#phase-2-core-pages)
5. [Phase 3: Knowledge Layer — FAQ, Help Center, Personas, Competitive Intel](#phase-3-knowledge-layer)
6. [Phase 4: Cross-Functional Views — Audience-Specific Filtered Views](#phase-4-cross-functional-views)
7. [Phase 5: Automation & Polish — Buttons, Automations, Verification, Onboarding](#phase-5-automation--polish)
8. [Appendix: Database Relations Graph](#appendix-database-relations-graph)

---

## Research Findings & Recommendations

### 1. Database Relation Architecture

**Recommendation: Hub-and-Spoke with Projects DB as the Hub**

The Projects DB is already the central node. All new databases should relate TO Projects, not to each other, except where a direct relationship is semantically necessary (e.g., Initiatives → OKRs).

**Optimal relation graph:**

```
                    ┌──────────────┐
                    │  Initiatives  │ (strategic themes)
                    │    DB (NEW)   │
                    └──────┬───────┘
                           │ 1:many
                           ▼
┌──────────┐    ┌──────────────────┐    ┌──────────────┐
│ Requests │───▶│   Projects DB    │◀───│  Feedback DB │
│ DB (NEW) │    │   (EXISTING)     │    │    (NEW)     │
└──────────┘    └────────┬─────────┘    └──────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌──────────────┐
   │  Weekly    │ │ Knowledge  │ │  Decision    │
   │ Updates DB │ │  Base DB   │ │  Log DB      │
   │ (EXISTING) │ │  (NEW)     │ │  (NEW)       │
   └────────────┘ └────────────┘ └──────────────┘
```

**Rules to avoid problems:**
- **No circular relations.** If A → B and B → C, don't also create A → C unless there's a clear read-path reason.
- **Prefer rollups over duplicate data.** If you need to see Initiative status on a Project, use a rollup, not a separate status column.
- **Limit depth to 2 hops.** Any query that requires traversing 3+ relation chains will be slow and confusing.
- **Every relation must answer a specific question.** "Which projects belong to this initiative?" "Which requests became this project?" If you can't articulate the question, don't create the relation.

### 2. Notion Teamspace Homepage Patterns

**Best-in-class product team homepages include:**

1. **Hero callout** — Mission statement or current quarter theme (2 sentences max)
2. **Status counters** — "X projects in Build" / "Y requests awaiting triage" / "Z launches this month" (use callout blocks with emoji — Notion doesn't support dynamic counters natively, but buttons can link to filtered views)
3. **This Week section** — Linked view of Weekly Updates DB filtered to this week
4. **Quick actions strip** — Template buttons: "Submit Request" / "New Project" / "New Meeting Note"
5. **Active Projects gallery** — Linked view of Projects DB in Board layout, grouped by phase
6. **Upcoming Launches** — Linked view of Projects DB filtered to target launch dates in next 30 days
7. **Reference links** — Grid of page links: Vision, Roadmap, Personas, Processes, Onboarding

**Recommendation:** Use a 2-column layout. Left column (60%): dynamic content (this week, active projects). Right column (40%): quick actions, reference links, status callouts.

### 3. Product Request Intake

**Best pattern: Form → Triage Queue → Project (or Archive)**

Key design decisions:
- **Use Notion Forms** (native, available on Business plan) for intake. Forms create rows in the Requests DB.
- **Auto-set "Status: Submitted"** via database automation on new row creation.
- **Triage weekly** — Tyler reviews "Submitted" requests in a dedicated view, changes status to "Accepted" (creates relation to Project), "Declined" (adds reason), or "Deferred."
- **Close the loop** — When status changes, use @-mention in a comment to notify the requestor. Notion's automation can trigger a Slack notification.
- **Avoid the graveyard** by:
  - Monthly review of "Deferred" items (calendar reminder)
  - Status-based aging: items deferred >90 days get auto-flagged for archive review
  - Requestors can see their requests in a "My Requests" filtered view

**Required properties on Requests DB:**
| Property | Type | Purpose |
|----------|------|---------|
| Title | Title | Brief description of the request |
| Requestor | Person | Who submitted it |
| Department | Select | Sales, CS, Marketing, Engineering, Leadership |
| Priority (Requestor) | Select | How urgent the requestor thinks it is |
| Priority (PM) | Select | Tyler's triage priority |
| Type | Select | Feature Request, Bug, Enhancement, Integration, Data/Reporting |
| Customer Name | Text | If customer-driven |
| Revenue Impact | Text | ARR at risk, expansion opportunity, or N/A |
| Status | Status | Submitted → Under Review → Accepted → Declined → Deferred |
| Related Project | Relation | → Projects DB (set when accepted) |
| Triage Notes | Rich text | Tyler's notes on why accepted/declined/deferred |
| Submitted Date | Created time | Auto-set |
| Source | Select | Slack, Meeting, Email, HubSpot, Support Ticket, Direct |

### 4. Feedback Taxonomy

**Recommendation: Hierarchical taxonomy with two levels**

**Level 1: Source** (where it came from)
- Customer Call, Customer Email, Slack (internal), Slack (customer), HubSpot Ticket, Support Ticket, User Research, NPS Survey, In-App Feedback, Sales Call, CS Check-in, Churn Exit Interview

**Level 2: Type** (what kind of feedback)
- Feature Request, Bug Report, Usability Issue, Praise, Complaint, Competitive Loss, Churn Risk, Expansion Signal, Confusion, Integration Request

**Additional properties that make feedback actionable:**
| Property | Type | Purpose |
|----------|------|---------|
| Title | Title | One-line summary |
| Verbatim Quote | Rich text | Exact words from the customer/user |
| Source | Select | See Level 1 above |
| Type | Select | See Level 2 above |
| Persona | Select | Aaron (AE), Celine (CSM), Roger (Revenue Leader), Odis (Ops), Irina (Implementation) |
| Feature Area | Multi-select | CRM Sync, Workflows, Analytics, Engagement, Settings, Onboarding, etc. |
| Sentiment | Select | Positive, Neutral, Negative, Critical |
| Customer | Text | Company/customer name |
| ARR | Number | Customer ARR (for prioritization) |
| Status | Status | New → Reviewed → Linked → Archived |
| Related Project | Relation | → Projects DB |
| Related Request | Relation | → Requests DB |
| Submitted By | Person | Who captured this feedback |
| Date | Date | When the feedback was received |

### 5. Feature FAQ vs Help Center — One DB or Two?

**Recommendation: ONE database ("Knowledge Base") with a Type property**

Rationale:
- At AskElephant's current size (39 people, <50 features), splitting into two databases creates unnecessary overhead.
- The distinction between "FAQ" and "KB article" is a content format difference, not a data model difference.
- Use a **Type** property (Select: FAQ, KB Article, SOP, Video Tutorial, Getting Started Guide) to filter views.
- When a FAQ entry grows beyond 3-4 Q&A pairs, that's the signal to "graduate" it: change the Type from FAQ to KB Article and expand the content.

**Knowledge Base DB schema:**
| Property | Type | Purpose |
|----------|------|---------|
| Title | Title | Article/FAQ title |
| Type | Select | FAQ, KB Article, SOP, Video Tutorial, Getting Started Guide |
| Feature Area | Multi-select | Which features this covers |
| Status | Status | Draft → In Review → Published → Needs Update → Archived |
| Related Project | Relation | → Projects DB |
| Author | Person | Who wrote/owns this |
| Last Reviewed | Date | When it was last verified |
| Audience | Multi-select | Sales, CS, Marketing, Engineering, All, External |
| Content | Page body | The actual content |
| Loom Link | URL | Video walkthrough if applicable |
| Storylane Link | URL | Interactive demo if applicable |

### 6. Notion's Latest Features to Leverage (2025-2026)

| Feature | How We'll Use It | Phase |
|---------|-----------------|-------|
| **Notion Forms** | Product request intake, feedback submission | Phase 2 |
| **Database Automations** | Auto-set status on new rows, notify on status changes, recurring review reminders | Phase 5 |
| **Database Buttons** | "Submit Request" button on homepage, "Escalate" button on request rows, "Mark Verified" button | Phase 5 |
| **Wiki + Verification** | Verify Product Vision, Personas, Processes pages with assigned owners and review cadence | Phase 2, 5 |
| **AI Autofill** | Auto-summarize long feedback entries, suggest feature area tags | Phase 5 |
| **Webhook Actions** | Post to Slack when project status changes, notify requestors on triage decisions | Phase 5 |
| **Linked Database Views** | Cross-functional views on a single page without duplicating data | Phase 4 |
| **Charts** | Roadmap timeline visualization, request volume by department, feedback sentiment over time | Phase 2, 5 |
| **Notion AI (Claude integration)** | Q&A across verified pages, auto-generate meeting agendas from project status | Phase 5 |
| **People Directory** | Not relevant (we have Justworks + org-chart) | Skip |
| **Data Sources** | Explore later — allows multiple data sources in one DB container. Useful if we ever merge Projects + Initiatives | Future |

### 7. Scaling Patterns — What Breaks and How to Prevent It

| Risk | Threshold | Mitigation |
|------|-----------|------------|
| **Slow page loads** | >20 properties with formulas/rollups on a single DB | Keep complex formulas in dedicated "analytics" views only. Hide rollup columns from default views |
| **Relation spaghetti** | >5 databases all relating to each other | Hub-and-spoke model: Projects DB is the hub, everything else speaks to Projects |
| **Stale data** | No update cadence defined | Every DB and page gets an explicit owner + review frequency in this plan |
| **View explosion** | >15 views on a single DB | Limit to 12 views max per DB. Use audience-specific PAGES with linked views instead |
| **Template drift** | Templates diverge from schema over time | Review templates quarterly. Add template review to Phase 5 automations |
| **Naming inconsistency** | Similar databases with different naming conventions | Enforce: `[Noun]` for databases (Projects, Requests, Feedback), `[Noun] [View Purpose]` for views |
| **Permission confusion** | Different teamspace access levels | Set teamspace defaults in Phase 5. Default: everyone can view, editors can edit assigned items |

---

## Existing Assets Inventory

### PRESERVE (Do Not Restructure)

| Asset | ID | Notes |
|-------|----|-------|
| Projects DB | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` | 30+ columns, 9 views, tier templates. Hub of everything. |
| Weekly Updates DB | _(to verify — may need creation per migration SOP)_ | If it exists, keep. If not, Phase 1 creates it. |
| Product Updates Hub | _(page)_ | Keep, enhance with new linked views |
| GTM / Launch Planning relation | Already exists as dual-property relation to `296f79b2-c8ac-8056-82d2-e2c49a1b53ef` | Kenzie's DB — keep relation active until Phase 2 migration |
| All 9 meeting-specific views | On Projects DB | Do not modify. Add new views alongside. |
| Tier templates (P1-P4) | On Projects DB | Extend in Phase 5 if needed |
| Document generator templates | In PM workspace | Keep as authoring source. Sync to Notion via `/full-sync` |

### EXISTING DATABASES IN WORKSPACE (Potentially Related)

| Database | ID | Notes |
|----------|----|-------|
| Notion Projects & Tasks | `29bf79b2-c8ac-81be-83a4-e7d9073878c2` | Native Notion Projects feature. Has Owner, Status, Priority, Linear URL, PRD. **Evaluate merge with Projects DB or deprecation.** |
| Project Roadmap (inline) | `235f79b2-c8ac-8194-9df0-d9dc2b9bbf22` | Basic roadmap DB with Assign, Date, Status. Inline. **Candidate for replacement by new Roadmap DB.** |
| Integrations Road Map | `292f79b2-c8ac-802c-aad3-dbb499c0e920` | Integration requests from customers. **Merge into Requests DB.** |
| Marketing Website Feedback & Requests | `2cef79b2-c8ac-80ce-9f1f-cdfdb46377f9` | Marketing-specific requests. **Merge into Requests DB with "Department: Marketing" tag.** |
| Feedback Agents | `7c916666-8b1d-4efe-8537-8629dc678dfe` | Synthetic persona profiles for jury. **Keep separate — specialized use case.** |
| Feedback Form (inline) | `2a1f79b2-c8ac-8064-a6a1-cf8657186291` | KB CSAT feedback form. **Keep — feeds into Knowledge Base quality metrics.** |
| Weekly Persona Insights | `0a379bbb-35ba-4ae2-8fa9-8f97d5b94a5c` | Research output. **Keep separate — specialized analysis.** |

---

## Phase 1: Architecture — Database Schema & Relations

> **Time estimate:** 3-4 hours
> **Dependencies:** None (foundational)
> **Owner:** Tyler
> **Deliverable:** 6 new databases created with correct schemas and relations

### 1.1 Initiatives DB (NEW)

Strategic bets / themes that group multiple projects. This is the HIGHEST-LEVEL grouping.

**Location:** Workspace level (same level as Projects DB)

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Initiative Name** | Title | — | e.g., "Revenue Intelligence Suite," "Self-Serve Onboarding" |
| **Description** | Rich text | — | 2-3 sentence summary of the strategic bet |
| **Status** | Status | Active, Paused, Completed, Cancelled | To-do: Active, Paused. In progress: (none). Complete: Completed, Cancelled |
| **Owner** | Person | — | Tyler, Sam, or other PM |
| **Quarter** | Select | Q1 2026, Q2 2026, Q3 2026, Q4 2026, 2027+ | When this initiative is targeted |
| **Pillar** | Select | Revenue Growth, Customer Trust, Platform Foundation, GTM Enablement | Strategic pillar alignment |
| **Outcome** | Rich text | — | What success looks like for this initiative |
| **Projects** | Relation | → Projects DB (bidirectional) | Which projects roll up to this initiative |
| **OKR Link** | URL | — | Link to company OKR tracking (if external) |
| **Evidence** | Rich text | — | User quotes, data points supporting this bet |
| **Created** | Created time | — | Auto |
| **Last Edited** | Last edited time | — | Auto |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **Active Initiatives** | Board | Status = Active | Quarter | Sam, Woody, Tyler |
| **By Pillar** | Table | Status ≠ Cancelled | Pillar group, then Quarter | Tyler |
| **Timeline** | Timeline | Status = Active | Quarter | Sam, Bryan |

**Relation to Projects DB:**
- Add a new **"Initiative"** Relation column to the existing Projects DB pointing to Initiatives DB
- This is bidirectional: Initiatives DB gets a "Projects" rollup showing all related projects

### 1.2 Product Requests DB (NEW)

Internal requests from anyone in the company.

**Location:** Workspace level

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Request Title** | Title | — | Brief description |
| **Requestor** | Person | — | Who submitted |
| **Department** | Select | Sales, CS, Marketing, Engineering, Leadership, Product, Ops | Auto-detect from person if possible |
| **Type** | Select | Feature Request, Bug, Enhancement, Integration, Data/Reporting, Process Change | What kind of request |
| **Customer Name** | Text | — | If customer-driven (blank for internal) |
| **Revenue Impact** | Select | No direct impact, <$10K ARR, $10K-$50K ARR, $50K-$100K ARR, >$100K ARR | Helps prioritization |
| **Urgency (Requestor)** | Select | Nice to have, Important, Urgent, Critical | How the requestor rates it |
| **Priority (PM)** | Select | P1 - Do Now, P2 - Next Up, P3 - Backlog, P4 - Won't Do | Tyler's triage assignment |
| **Status** | Status | Submitted, Under Review, Accepted, Declined, Deferred | To-do: Submitted. In progress: Under Review. Complete: Accepted, Declined, Deferred |
| **Triage Notes** | Rich text | — | Tyler's rationale |
| **Related Project** | Relation | → Projects DB | Set when accepted |
| **Related Feedback** | Relation | → Feedback DB | Link to supporting evidence |
| **Source** | Select | Slack, Meeting, Email, HubSpot, Support Ticket, Direct, Form | Where it originated |
| **Submitted Date** | Created time | — | Auto |
| **Closed Date** | Date | — | When triaged |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **Triage Queue** | Table | Status = Submitted | Submitted Date ascending | Tyler |
| **All Requests** | Table | None | Submitted Date descending | Tyler |
| **My Requests** | Table | Requestor = Me | Submitted Date descending | Anyone |
| **By Department** | Board | Status ≠ Declined | Group by Department | Tyler, Sam |
| **Accepted → Projects** | Table | Status = Accepted | Priority (PM) | Tyler |

**Form to create:**
- Name: "Submit a Product Request"
- Fields shown: Title, Department, Type, Customer Name, Revenue Impact, Urgency, Source
- Fields hidden (auto-set): Status = Submitted, Requestor = form submitter, Submitted Date

### 1.3 Product Feedback DB (NEW)

Customer and internal feedback with source tagging.

**Location:** Workspace level

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Feedback Title** | Title | — | One-line summary |
| **Verbatim Quote** | Rich text | — | Exact words |
| **Source** | Select | Customer Call, Customer Email, Slack (internal), Slack (customer), HubSpot Ticket, Support Ticket, NPS Survey, In-App Feedback, Sales Call, CS Check-in, Churn Exit Interview, User Research | Where it came from |
| **Type** | Select | Feature Request, Bug Report, Usability Issue, Praise, Complaint, Competitive Loss, Churn Risk, Expansion Signal, Confusion, Integration Request | What kind |
| **Persona** | Select | Aaron (AE), Celine (CSM), Roger (Revenue Leader), Odis (Ops), Irina (Implementation), Unknown | Which persona |
| **Feature Area** | Multi-select | CRM Sync, Workflows, Analytics, Engagement, Settings, Onboarding, Integrations, AI/Chat, People Intelligence, Company Intelligence, Meeting Intelligence | Which product area |
| **Sentiment** | Select | Positive, Neutral, Negative, Critical | Overall sentiment |
| **Customer** | Text | — | Company name |
| **ARR** | Number | Currency format | Customer ARR for weighting |
| **Status** | Status | New, Reviewed, Linked to Project, Archived | Triage workflow |
| **Related Project** | Relation | → Projects DB | When linked to active work |
| **Related Request** | Relation | → Requests DB | If it originated from or supports a request |
| **Submitted By** | Person | — | Who captured this |
| **Date** | Date | — | When feedback was received |
| **Tags** | Multi-select | Churn driver, Expansion blocker, Competitive gap, Quick win, Strategic | Meta-tags for pattern detection |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **New (Untriaged)** | Table | Status = New | Date descending | Tyler |
| **By Feature Area** | Board | Status ≠ Archived | Group by Feature Area | Tyler |
| **Churn Signals** | Table | Tags contains "Churn driver" OR Type = Churn Risk | ARR descending | Tyler, Sam, Robert |
| **By Persona** | Board | Status ≠ Archived | Group by Persona | Tyler |
| **All Feedback** | Table | None | Date descending | Tyler |

**Form to create:**
- Name: "Submit Product Feedback"
- Fields shown: Title, Verbatim Quote, Source, Type, Feature Area, Customer, Sentiment
- Fields hidden (auto-set): Status = New, Submitted By = form submitter, Date = today

### 1.4 Knowledge Base DB (NEW — combines FAQ + Help Center)

Single DB for all reference documentation: FAQs, KB articles, SOPs, video tutorials.

**Location:** Workspace level

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Title** | Title | — | Article/FAQ title |
| **Type** | Select | FAQ, KB Article, SOP, Video Tutorial, Getting Started Guide, Release Note, PRD, Product Research, Design Brief, Eng Spec, GTM Brief, Metrics | Content format |
| **Feature Area** | Multi-select | (same list as Feedback DB) | Which features this covers |
| **Status** | Status | Draft, In Review, Published, Needs Update, Archived | Content lifecycle |
| **Related Project** | Relation | → Projects DB | Which project this documents |
| **Author** | Person | — | Content owner |
| **Last Reviewed** | Date | — | Last verification date |
| **Review Cadence** | Select | Monthly, Quarterly, Annually, One-time | How often to re-verify |
| **Audience** | Multi-select | Sales, CS, Marketing, Engineering, All, External | Who needs this |
| **Loom Link** | URL | — | Video walkthrough |
| **Storylane Link** | URL | — | Interactive demo |
| **CSAT Score** | Number | Percent format | From inline feedback form (if applicable) |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **Published** | Gallery | Status = Published | Title A-Z | Everyone |
| **By Feature** | Board | Status = Published | Group by Feature Area | CS, Sales |
| **Needs Update** | Table | Status = Needs Update | Last Reviewed ascending | Tyler, Kenzie |
| **All Content** | Table | None | Last Edited descending | Tyler, Kenzie |
| **FAQs Only** | Table | Type = FAQ | Title A-Z | CS, Sales |
| **SOPs Only** | Table | Type = SOP | Title A-Z | Internal |
| **PRDs** | Table | Type = PRD | Last Edited descending | Tyler, Sam, Bryan |
| **Research** | Table | Type = Product Research | Date descending | Tyler, Sam |
| **Specs & Briefs** | Table | Type = Design Brief OR Eng Spec OR GTM Brief | Last Edited descending | Tyler, Bryan, Kenzie |

### 1.5 Decision Log DB (NEW)

Key product decisions with context, alternatives, and rationale.

**Location:** Workspace level

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Decision** | Title | — | What was decided |
| **Context** | Rich text | — | Why this decision was needed |
| **Alternatives Considered** | Rich text | — | What else was on the table |
| **Rationale** | Rich text | — | Why this option won |
| **Decided By** | Person | — | Who made the call |
| **Date** | Date | — | When decided |
| **Related Project** | Relation | → Projects DB | Which project(s) affected |
| **Related Initiative** | Relation | → Initiatives DB | Which initiative(s) affected |
| **Category** | Select | Architecture, UX, Scope, Priority, Integration, Process, Pricing | Type of decision |
| **Reversibility** | Select | Easily Reversible, Reversible with Effort, Irreversible (One-Way Door) | Decision weight |
| **Status** | Select | Active, Superseded, Reversed | Is this still the current decision? |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **Recent Decisions** | Table | Status = Active | Date descending | Everyone |
| **By Project** | Table | Status = Active | Group by Related Project | Tyler, Bryan |
| **One-Way Doors** | Table | Reversibility = Irreversible | Date descending | Sam, Woody |

### 1.6 Product Roadmap DB (NEW — replaces inline Project Roadmap)

Timeline view of what ships when, grouped by quarter and initiative.

**Location:** Workspace level

| Column | Type | Options / Config | Notes |
|--------|------|-----------------|-------|
| **Roadmap Item** | Title | — | Feature/milestone name |
| **Quarter** | Select | Q1 2026, Q2 2026, Q3 2026, Q4 2026, 2027+ | Target quarter |
| **Date Range** | Date | — | Start and end dates for timeline view |
| **Related Project** | Relation | → Projects DB | 1:1 with a project |
| **Related Initiative** | Relation | → Initiatives DB | Which strategic bet |
| **Status** | Status | Planned, In Progress, Shipped, Delayed, Cut | Delivery status |
| **Confidence** | Select | High, Medium, Low | How confident are we in the date |
| **Team** | Multi-select | Frontend, Backend, Data, Design, Product, Marketing | Which teams involved |
| **Notes** | Rich text | — | Any additional context |

**Views to create:**
| View | Layout | Filter | Sort | Audience |
|------|--------|--------|------|----------|
| **Timeline (Default)** | Timeline | Status ≠ Cut | Date Range | Sam, Woody, Bryan |
| **By Quarter** | Board | Status ≠ Cut | Group by Quarter | Leadership |
| **By Initiative** | Board | Status ≠ Cut | Group by Related Initiative | Tyler, Sam |
| **Shipped** | Table | Status = Shipped | Date Range descending | Everyone |

### 1.7 Relations to Add to Existing Projects DB

Add these columns to the live Projects DB (`2c0f79b2-c8ac-802c-8b15-c84a8fce3513`):

| New Column | Type | Target | Notes |
|------------|------|--------|-------|
| **Initiative** | Relation | → Initiatives DB | Which strategic bet this project serves |
| **Feedback** | Relation | → Feedback DB | Customer evidence linked to this project |
| **Requests** | Relation | → Requests DB | Internal requests that led to this project |
| **Knowledge Base** | Relation | → Knowledge Base DB | KB articles, FAQs, SOPs for this project |
| **Decisions** | Relation | → Decision Log DB | Key decisions made for this project |
| **Roadmap Item** | Relation | → Roadmap DB | Timeline position |

**CRITICAL: Do NOT modify or delete existing columns or views. Only ADD.**

### 1.8 Meeting Notes DB (NEW — Optional for Phase 1)

> **Recommendation:** Defer to Phase 3 or skip entirely. Meeting notes currently live in Google Docs via AskElephant's own product. Creating a Notion DB for this adds a maintenance burden without clear ROI. If needed later, it's a simple add.

If built:

| Column | Type | Notes |
|--------|------|-------|
| **Title** | Title | Meeting name + date |
| **Date** | Date | When |
| **Meeting Type** | Select | Trio Sync, Council of Product, Product x Marketing, Eng Standup, 1:1, Ad Hoc |
| **Attendees** | Person | Who was there |
| **Related Projects** | Relation | → Projects DB |
| **Action Items** | Rich text | What needs to happen |
| **Notes** | Page body | Full notes |

### Phase 1 Checklist

- [ ] Create Initiatives DB with schema above
- [ ] Create Product Requests DB with schema above
- [ ] Create Product Feedback DB with schema above
- [ ] Create Knowledge Base DB with schema above
- [ ] Create Decision Log DB with schema above
- [ ] Create Product Roadmap DB with schema above
- [ ] Add 6 new relation columns to existing Projects DB
- [ ] Verify all bidirectional relations work
- [ ] Create Notion Forms for Requests and Feedback
- [ ] Seed 3-5 rows in each new DB for testing
- [ ] Test rollups from Initiatives → Projects

---

## Phase 2: Core Pages — Homepage, Vision, Roadmap, Intake, Feedback

> **Time estimate:** 3-4 hours
> **Dependencies:** Phase 1 (databases must exist)
> **Owner:** Tyler
> **Deliverable:** 5 core pages created and configured

### 2.1 Teamspace Home / Dashboard

**Page structure:**

```
🐘 Product Team Home
├── [Callout] Mission statement: "We turn customer conversations into
│   structured insights and actions that drive GTM outcomes."
│
├── [Heading 2] Quick Actions
│   ├── [Button] Submit a Product Request → opens Requests form
│   ├── [Button] Submit Feedback → opens Feedback form
│   ├── [Button] New Project → creates row in Projects DB from template
│   └── [Button] View Roadmap → links to Roadmap page
│
├── [Heading 2] This Week
│   └── [Linked View] Weekly Updates DB → "This Week" view
│
├── [Divider]
│
├── [Heading 2] Active Projects
│   └── [Linked View] Projects DB → Board view, grouped by Project Phase,
│       filtered to Phase ≠ Done
│
├── [Divider]
│
├── [Heading 2] Upcoming Launches
│   └── [Linked View] Projects DB → "Launch Pipeline" view
│
├── [Divider]
│
├── [Heading 2] Open Requests
│   └── [Linked View] Requests DB → "Triage Queue" view
│
├── [Divider]
│
├── [Heading 2] Navigate
│   ├── [2-column layout]
│   │   ├── [Left Column]
│   │   │   ├── 📋 Product Vision & Principles
│   │   │   ├── 🗺️ Product Roadmap
│   │   │   ├── 👥 Personas
│   │   │   └── 📊 Metrics & Analytics Hub
│   │   └── [Right Column]
│   │       ├── 📖 Knowledge Base
│   │       ├── 🏆 Competitive Intelligence
│   │       ├── 🔧 Product Ops / Processes
│   │       └── 🆕 Onboarding Guide
```

### 2.2 Product Vision & Principles (Wiki + Verified)

**Content source:** `pm-workspace-docs/company-context/product-vision.md` + `strategic-guardrails.md`

**Page structure:**
```
📋 Product Vision & Principles [Wiki — Verified ✓]
├── [Callout — Blue] Owner: Tyler Sahagun | Review: Quarterly | Verified: Feb 2026
│
├── [Heading 2] Our Mission
│   └── (from product-vision.md)
│
├── [Heading 2] What We Build
│   └── Revenue outcome system for sales & CS teams
│
├── [Heading 2] What We Don't Build (Anti-Vision)
│   └── (from strategic-guardrails.md — the "We will NEVER..." list)
│
├── [Heading 2] Strategic Pillars
│   └── Revenue Growth | Customer Trust | Platform Foundation | GTM Enablement
│
├── [Heading 2] Product Principles
│   └── (from strategic-guardrails.md — the decision framework)
│
├── [Heading 2] Personas (linked)
│   └── [Link to Personas page]
```

**Verification:** Enable wiki verification. Owner = Tyler. Review cadence = Quarterly.

### 2.3 Product Roadmap (Page with Linked Views)

**Page structure:**
```
🗺️ Product Roadmap
├── [Callout] "What we're building, when, and why."
│   Owner: Tyler | Updated: Weekly | Last update: [date]
│
├── [Heading 2] Timeline View
│   └── [Linked View] Roadmap DB → Timeline view
│
├── [Heading 2] By Initiative
│   └── [Linked View] Roadmap DB → Board view grouped by Initiative
│
├── [Heading 2] By Quarter
│   └── [Linked View] Roadmap DB → Board view grouped by Quarter
│
├── [Heading 2] Recently Shipped
│   └── [Linked View] Roadmap DB → "Shipped" table view
```

### 2.4 Product Request Intake (Page + Form)

**Page structure:**
```
📬 Product Requests
├── [Callout — Green] "Have a product idea, bug report, or feature request?
│   Submit it here and Tyler will triage it within 1 week."
│
├── [Button] Submit a Product Request → opens form view of Requests DB
│
├── [Heading 2] My Requests
│   └── [Linked View] Requests DB → "My Requests" view
│
├── [Heading 2] How It Works
│   ├── 1. Submit your request using the button above
│   ├── 2. Tyler triages within 1 week and assigns a priority
│   ├── 3. Accepted requests get linked to a project
│   ├── 4. You'll be notified when status changes
│   └── 5. Check "My Requests" view anytime for updates
│
├── [Heading 2] All Requests (PM View)
│   └── [Linked View] Requests DB → "All Requests" view
```

### 2.5 Feedback Hub

**Page structure:**
```
💬 Feedback Hub
├── [Callout — Yellow] "Customer voice = product direction.
│   Capture feedback from any source here."
│
├── [Button] Submit Feedback → opens form view of Feedback DB
│
├── [Heading 2] New (Untriaged)
│   └── [Linked View] Feedback DB → "New (Untriaged)" view
│
├── [Heading 2] By Feature Area
│   └── [Linked View] Feedback DB → Board view by Feature Area
│
├── [Heading 2] Churn Signals
│   └── [Linked View] Feedback DB → "Churn Signals" view
│
├── [Heading 2] By Persona
│   └── [Linked View] Feedback DB → Board view by Persona
```

### Phase 2 Checklist

- [ ] Create Teamspace Home page with all sections
- [ ] Create Product Vision & Principles page (sync content from PM workspace)
- [ ] Enable wiki verification on Vision page
- [ ] Create Product Roadmap page with linked views
- [ ] Seed Roadmap DB with current quarter's planned work
- [ ] Create Product Request Intake page with form link
- [ ] Create Feedback Hub page with linked views
- [ ] Link all pages from Homepage navigation section
- [ ] Test: Can Sales submit a request via the form?
- [ ] Test: Can CS submit feedback via the form?

---

## Phase 3: Knowledge Layer — FAQ, Help Center, Personas, Competitive Intel

> **Time estimate:** 3-4 hours
> **Dependencies:** Phase 1 (Knowledge Base DB must exist)
> **Owner:** Tyler (pages), Kenzie (KB content seeding)
> **Deliverable:** 6 pages created, initial content seeded

### 3.1 Feature Library / Knowledge Base Index

**Page structure:**
```
📖 Knowledge Base
├── [Callout] "Everything you need to know about AskElephant's features,
│   product specs, and research."
│   Owner: Tyler & Kenzie | Search by feature, type, or audience.
│
├── [Heading 2] Published Content
│   └── [Linked View] Knowledge Base DB → "Published" gallery view
│
├── [Heading 2] PRDs & Product Research
│   └── [Linked View] Knowledge Base DB → "PRDs" view
│   └── [Linked View] Knowledge Base DB → "Research" view
│
├── [Heading 2] Specs & Briefs
│   └── [Linked View] Knowledge Base DB → "Specs & Briefs" view
│
├── [Heading 2] FAQs
│   └── [Linked View] Knowledge Base DB → "FAQs Only" view
│
├── [Heading 2] SOPs
│   └── [Linked View] Knowledge Base DB → "SOPs Only" view
│
├── [Heading 2] Needs Update
│   └── [Linked View] Knowledge Base DB → "Needs Update" view (Tyler/Kenzie only)
```

**Seed content:** Migrate existing KB Articles and FAQs from project page nesting into the Knowledge Base DB. Also create entries for existing PRDs and Research docs (Tyler's PM workspace has these for most active initiatives — sync them via `/full-sync` and create KB DB rows with Type = PRD or Product Research). Keep the URLs in the Projects DB columns pointing to the new location, so there are two access paths: URL shortcut on the project row, and searchable entry in the KB DB.

### 3.2 Personas

**Content source:** `pm-workspace-docs/company-context/personas.md` + existing Feedback Agents DB

**Page structure:**
```
👥 Personas [Wiki — Verified ✓]
├── [Callout — Purple] Owner: Tyler | Review: Quarterly
│   "Who we build for — with evidence."
│
├── [Heading 2] Primary Personas
│   ├── 🎯 Aaron — Account Executive
│   │   └── JTBD, pain points, key quotes, evidence links
│   ├── 💼 Celine — Customer Success Manager
│   ├── 📊 Roger — Revenue Leader
│   ├── ⚙️ Odis — Revenue Operations Manager
│   └── 🔧 Irina — Implementation Specialist
│
├── [Heading 2] Persona Evidence
│   └── [Linked View] Feedback DB → Board view by Persona
│
├── [Heading 2] Validation Status
│   └── [Linked View] Weekly Persona Insights DB (existing)
```

### 3.3 Competitive Intelligence

**Page structure:**
```
🏆 Competitive Intelligence [Wiki — Verified ✓]
├── [Callout — Red] Owner: Tyler | Review: Monthly
│   "Know the landscape. Build what only we can build."
│
├── [Heading 2] Direct Competitors
│   ├── Gong — [Profile subpage]
│   ├── Clari — [Profile subpage]
│   ├── Chorus — [Profile subpage]
│   └── Salesloft — [Profile subpage]
│
├── [Heading 2] Feature Comparison Matrix
│   └── [Table or DB view — manual update]
│
├── [Heading 2] Our Differentiation
│   └── What we do that they can't/don't
│
├── [Heading 2] Competitive Feedback
│   └── [Linked View] Feedback DB → filtered to Type = Competitive Loss
│
├── [Heading 2] Win/Loss Analysis
│   └── Summary of recent competitive wins and losses
```

### 3.4 Onboarding Guide

**Page structure:**
```
🆕 New to Product? Start Here.
├── [Callout — Green] "Welcome! This page gets you up to speed
│   on how Product works at AskElephant."
│
├── [Heading 2] Week 1: Orient
│   ├── Read Product Vision & Principles [link]
│   ├── Meet the team [org chart link]
│   ├── Watch product overview Loom [link]
│   └── Get access: Notion, Linear, PostHog, Slack channels
│
├── [Heading 2] Week 2: Understand
│   ├── Read all 5 persona cards [link]
│   ├── Review active projects in Projects DB [link]
│   ├── Review current roadmap [link]
│   └── Shadow 2 customer calls
│
├── [Heading 2] Week 3: Contribute
│   ├── Submit your first product request [link to form]
│   ├── Capture 3 pieces of feedback from customer calls [link to form]
│   └── Review the Product Ops / Processes page [link]
│
├── [Heading 2] Key Resources
│   └── [Grid of page links to all major sections]
```

### 3.5 Product Ops / Processes

**Page structure:**
```
🔧 Product Ops / Processes [Wiki — Verified ✓]
├── [Callout] Owner: Tyler | Review: Quarterly
│
├── [Heading 2] Meeting Cadences
│   ├── Council of Product — Weekly, Mon 10:30 AM [link to view]
│   ├── Trio Sync — Daily/Weekly, 10:00 AM [link to view]
│   ├── Product x Marketing — Weekly, 1:00 PM [link to view]
│   └── Eng Standup — Daily, 9:30 AM [link to view]
│
├── [Heading 2] How to Submit a Product Request
│   └── [Link to request intake page + brief instructions]
│
├── [Heading 2] How Projects Work
│   └── Discovery → Definition → Build → Test → Launch
│   └── [Link to Projects DB "All Projects" view]
│
├── [Heading 2] PMM Tiers (P1-P4)
│   └── What each tier requires [table from migration SOP]
│
├── [Heading 2] How Launches Work
│   └── Launch checklist, who does what, timeline expectations
│
├── [Heading 2] Tools We Use
│   └── Notion, Linear, PostHog, HubSpot, Loom, Storylane, Slack
```

### 3.6 Metrics & Analytics Hub

**Page structure:**
```
📊 Metrics & Analytics Hub
├── [Callout] Owner: Tyler | Updated: As dashboards change
│
├── [Heading 2] PostHog Dashboards
│   └── [List of bookmarked URLs to key PostHog dashboards]
│
├── [Heading 2] KPI Definitions
│   └── [Table: KPI name, definition, data source, owner, target]
│
├── [Heading 2] Success Criteria by Project
│   └── [Linked View] Projects DB with "Objectives & Success" column visible
│
├── [Heading 2] Experiment & Hypothesis Tracker
│   └── [Link to pm-workspace hypotheses or inline DB if needed later]
```

### Phase 3 Checklist

- [ ] Create Knowledge Base Index page with linked views
- [ ] Seed 10+ KB articles from existing project page nesting
- [ ] Create Personas page from PM workspace content
- [ ] Enable wiki verification on Personas
- [ ] Create Competitive Intelligence page
- [ ] Seed 2-3 competitor profiles
- [ ] Create Onboarding Guide page
- [ ] Create Product Ops / Processes page
- [ ] Enable wiki verification on Processes
- [ ] Create Metrics & Analytics Hub page
- [ ] Link all new pages from Homepage navigation

---

## Phase 4: Cross-Functional Views — Audience-Specific Filtered Views

> **Time estimate:** 2-3 hours
> **Dependencies:** Phase 1-3 (databases and pages must exist)
> **Owner:** Tyler
> **Deliverable:** 5 audience-specific pages with linked views

### 4.1 For Sales

**Page:** "Sales Product Hub"

| Section | Source DB | View Config |
|---------|----------|-------------|
| Customer-Facing Features | Projects DB | Filter: Customer-Facing = checked. Columns: Name, Visibility, KB Article, Storylane |
| Feature FAQ | Knowledge Base DB | Filter: Type = FAQ AND Audience contains Sales. Gallery view |
| Competitive Positioning | Competitive Intel page | Link to profiles and comparison matrix |
| Upcoming Launches | Projects DB | Filter: Target Launch Date in next 30 days. Columns: Name, Visibility, Target Launch Date, Loom |
| Submit Feedback | — | Button linking to Feedback form |

### 4.2 For CS

**Page:** "CS Product Hub"

| Section | Source DB | View Config |
|---------|----------|-------------|
| KB Articles | Knowledge Base DB | Filter: Status = Published AND Audience contains CS. Gallery view |
| Feature Status | Projects DB | Filter: Customer-Facing = checked. Columns: Name, Project Phase, Visibility, Weekly Status |
| Known Issues / Bugs | Requests DB | Filter: Type = Bug AND Status ≠ Declined. Columns: Title, Status, Related Project |
| Recent Releases | Weekly Updates DB | Filter: Impact = Customer-Visible. Last 30 days |
| Submit Feedback | — | Button linking to Feedback form |

### 4.3 For Marketing

**Page:** "Marketing Product Hub"

| Section | Source DB | View Config |
|---------|----------|-------------|
| Launch Pipeline | Projects DB | "Product x Marketing" view (existing) |
| Asset Readiness | Projects DB | "Gap Tracker" view with marketing-relevant columns |
| KB Articles to Write | Knowledge Base DB | Filter: Status = Draft AND Author = Kenzie |
| Positioning Docs | Competitive Intel page | Link to differentiation notes |
| Submit Request | — | Button linking to Request form |

### 4.4 For Engineering

**Page:** "Engineering Product Hub"

| Section | Source DB | View Config |
|---------|----------|-------------|
| Active Build | Projects DB | "Eng Standup" view (existing) |
| Specs & PRDs (Project Links) | Projects DB | Filter: Phase = Build OR Phase = Definition. Columns: Name, PRD Link, Eng Spec Link, Research Link, Linear Link |
| Specs & PRDs (Full Docs) | Knowledge Base DB | Filter: Type = PRD OR Eng Spec OR Product Research. Columns: Title, Type, Feature Area, Status, Related Project |
| Technical Decisions | Decision Log DB | Filter: Category = Architecture. Recent first |
| Priorities | Projects DB | "Trio Sync" view (existing) |
| Sprint-Relevant | Roadmap DB | Filter: Quarter = current quarter AND Status = In Progress |

### 4.5 For Leadership

**Page:** "Product Leadership Hub"

| Section | Source DB | View Config |
|---------|----------|-------------|
| Strategic Initiatives | Initiatives DB | "Active Initiatives" board view |
| Roadmap Overview | Roadmap DB | Timeline view |
| Portfolio Status | Projects DB | "Council of Product" view (existing) |
| Risk Items | Projects DB | Filter: Weekly Status Update contains "blocked" OR Launch Blocked By is not empty |
| Request Volume | Requests DB | Board view by Department (shows demand distribution) |
| Decision Log | Decision Log DB | "One-Way Doors" view |

### Phase 4 Checklist

- [ ] Create "Sales Product Hub" page with linked views
- [ ] Create "CS Product Hub" page with linked views
- [ ] Create "Marketing Product Hub" page with linked views
- [ ] Create "Engineering Product Hub" page with linked views
- [ ] Create "Product Leadership Hub" page with linked views
- [ ] Link each hub from the Teamspace Home navigation section
- [ ] Test: Can Ben Harrison (CS) self-serve answers from CS Hub?
- [ ] Test: Can Robert (Revenue) find upcoming launches without asking Tyler?

---

## Phase 5: Automation & Polish — Buttons, Automations, Verification, Onboarding

> **Time estimate:** 3-4 hours
> **Dependencies:** Phase 1-4 (all databases and pages must exist)
> **Owner:** Tyler
> **Deliverable:** Automations configured, buttons placed, verification enabled, onboarding complete

### 5.1 Database Automations

| Database | Trigger | Action | Purpose |
|----------|---------|--------|---------|
| **Requests DB** | New page added | Set Status = "Submitted", Set Submitted Date = today | Auto-triage prep |
| **Requests DB** | Status changed to "Accepted" | Send Slack notification to requestor | Close the loop |
| **Requests DB** | Status changed to "Declined" | Send Slack notification to requestor | Close the loop |
| **Feedback DB** | New page added | Set Status = "New" | Auto-triage prep |
| **Projects DB** | Project Phase changed | Send Slack notification to #product-internal | Team awareness |
| **Knowledge Base DB** | Last Reviewed > 90 days ago + Status = Published | Set Status = "Needs Update" | Freshness enforcement |
| **Weekly Updates DB** | New page added | Send Slack notification to #product-updates | Auto-broadcast |

### 5.2 Template Buttons

| Location | Button Text | Action |
|----------|------------|--------|
| Teamspace Home | "Submit Product Request" | Opens Requests DB form |
| Teamspace Home | "Submit Feedback" | Opens Feedback DB form |
| Teamspace Home | "New Project (P1-P4)" | Opens Projects DB with tier template picker |
| Product Ops page | "New Decision" | Creates row in Decision Log DB |
| Knowledge Base page | "New KB Article" | Creates row in Knowledge Base DB with template |
| Each audience hub | "Submit Feedback" | Opens Feedback DB form |

### 5.3 Wiki Verification

| Page | Owner | Review Cadence | Verification |
|------|-------|---------------|-------------|
| Product Vision & Principles | Tyler | Quarterly | Verified indefinitely, re-verify each quarter |
| Personas | Tyler | Quarterly | Verified with 90-day expiry |
| Product Ops / Processes | Tyler | Quarterly | Verified with 90-day expiry |
| Competitive Intelligence | Tyler | Monthly | Verified with 30-day expiry |
| Onboarding Guide | Tyler | Quarterly | Verified with 90-day expiry |

### 5.4 Teamspace Defaults

| Setting | Value |
|---------|-------|
| Default access | Full access for Product team members |
| Teamspace icon | 🐘 |
| Teamspace description | "AskElephant Product Team — what we're building, why, and where it is." |
| Sidebar organization | Flat top-level pages, databases hidden behind "Databases" section |
| Default sort for pages | Manual (curated order: Home, Vision, Roadmap, Requests, Feedback, KB, Personas, Competitive, Ops, Onboarding, audience hubs) |

### 5.5 Data Migration & Cleanup

| Task | Source | Target | Notes |
|------|--------|--------|-------|
| Migrate Integration Roadmap requests | `292f79b2-c8ac-802c-aad3-dbb499c0e920` | Requests DB | Set Type = Integration, Department = Engineering |
| Migrate Marketing Feedback & Requests | `2cef79b2-c8ac-80ce-9f1f-cdfdb46377f9` | Requests DB | Set Department = Marketing |
| Deprecate old Project Roadmap DB | `235f79b2-c8ac-8194-9df0-d9dc2b9bbf22` | Archive | Replace with new Roadmap DB |
| Evaluate Notion native Projects DB | `29bf79b2-c8ac-81be-83a4-e7d9073878c2` | Decision: keep or deprecate | If it has active tasks, keep. If dormant, archive. |

### 5.6 Launch Communication

| Step | Channel | Message |
|------|---------|---------|
| 1 | #product-internal | "Product teamspace revamped! Here's what changed and where to find things." |
| 2 | #general | "Product team has a new self-serve hub in Notion. Sales, CS, Marketing — here are your pages." |
| 3 | Each audience Slack | Link to their specific hub page |
| 4 | Council of Product | Walk Sam and Woody through the Leadership Hub |
| 5 | Product x Marketing | Walk Kenzie through Marketing Hub and request/feedback forms |

### Phase 5 Checklist

- [ ] Configure all 7 database automations
- [ ] Test automations: create test rows, verify Slack notifications fire
- [ ] Place template buttons on all specified pages
- [ ] Enable wiki verification on 5 reference pages
- [ ] Set teamspace defaults
- [ ] Migrate data from Integration Roadmap DB → Requests DB
- [ ] Migrate data from Marketing Feedback DB → Requests DB
- [ ] Archive deprecated databases (prefix with [ARCHIVED])
- [ ] Post launch communication in all channels
- [ ] Walk through with Sam, Kenzie, Ben Harrison
- [ ] Create recurring calendar event: "Quarterly Notion Maintenance" for Tyler

---

## Appendix: Database Relations Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE RELATIONS MAP                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐                                                   │
│  │ Initiatives  │ ◄─── "What strategic bets are we making?"         │
│  │    DB        │                                                   │
│  └──────┬───────┘                                                   │
│         │ 1:many                                                    │
│         ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    PROJECTS DB (HUB)                          │   │
│  │                 "What are we building?"                       │   │
│  │  ← Initiative (relation to Initiatives DB)                   │   │
│  │  ← Requests (relation to Requests DB)                        │   │
│  │  ← Feedback (relation to Feedback DB)                        │   │
│  │  ← Knowledge Base (relation to KB DB)                        │   │
│  │  ← Decisions (relation to Decision Log DB)                   │   │
│  │  ← Roadmap Item (relation to Roadmap DB)                     │   │
│  │  ← Weekly Updates (relation — existing)                      │   │
│  │  → GTM / Launch Planning (relation — existing)               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         ▲              ▲             ▲              ▲                │
│         │              │             │              │                │
│  ┌──────┴─────┐ ┌──────┴──────┐ ┌───┴────────┐ ┌──┴──────────┐    │
│  │ Requests   │ │  Feedback   │ │ Knowledge  │ │ Decision    │    │
│  │ DB         │ │  DB         │ │ Base DB    │ │ Log DB      │    │
│  │            │ │             │ │            │ │             │    │
│  │ → Feedback │ │ → Requests  │ │            │ │→ Initiative │    │
│  │ (optional) │ │ (optional)  │ │            │ │             │    │
│  └────────────┘ └─────────────┘ └────────────┘ └─────────────┘    │
│                                                                     │
│  ┌─────────────┐  ┌─────────────────┐                              │
│  │ Roadmap DB  │  │ Weekly Updates   │                              │
│  │ → Initiative│  │ DB (EXISTING)    │                              │
│  │ → Project   │  │ → Project        │                              │
│  └─────────────┘  └─────────────────┘                              │
│                                                                     │
│  STANDALONE (no relations to Projects):                             │
│  • Feedback Agents DB (jury system)                                 │
│  • Weekly Persona Insights DB (research analytics)                  │
│  • KB Feedback Form DB (CSAT collection)                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Ownership & Update Cadence Summary

| Database / Page | Owner | Update Frequency | Backup Maintainer |
|-----------------|-------|------------------|-------------------|
| Projects DB | Tyler | Daily | Kenzie (launch columns) |
| Initiatives DB | Tyler | Quarterly | Sam (reviews) |
| Requests DB | Tyler (triage) | Weekly | — |
| Feedback DB | Tyler (triage) | Weekly | CS team (submission) |
| Knowledge Base DB | Kenzie | Per launch cycle | Tyler (SOPs) |
| Decision Log DB | Tyler | As decisions happen | — |
| Roadmap DB | Tyler | Monthly | Sam (reviews) |
| Weekly Updates DB | Engineers | Per ship | Bryan (enforcement) |
| Teamspace Home | Tyler | Monthly refresh | — |
| Vision & Principles | Tyler | Quarterly review | Sam (verification) |
| Personas | Tyler | Quarterly review | — |
| Competitive Intelligence | Tyler | Monthly refresh | Sales (input) |
| Product Ops / Processes | Tyler | Quarterly review | — |
| Audience hub pages | Tyler | Monthly review | — |

### Phase Timeline Summary

| Phase | What | Time | Week |
|-------|------|------|------|
| **Phase 1** | Database schema + relations | 3-4 hours | Week 1 |
| **Phase 2** | Core pages (home, vision, roadmap, intake, feedback) | 3-4 hours | Week 1-2 |
| **Phase 3** | Knowledge layer (KB, personas, competitive, onboarding, ops, metrics) | 3-4 hours | Week 2-3 |
| **Phase 4** | Cross-functional views (5 audience hubs) | 2-3 hours | Week 3-4 |
| **Phase 5** | Automation, buttons, verification, migration, launch | 3-4 hours | Week 4-5 |
| **Buffer** | Fixes, feedback from Sam/Kenzie/Bryan, iteration | 2-3 hours | Week 5-6 |
| **TOTAL** | | **~17-22 hours** | **4-6 weeks** |

---

## Appendix: Notion API IDs for Implementation

| Resource | ID | Notes |
|----------|----|-------|
| Live Projects DB | `2c0f79b2-c8ac-802c-8b15-c84a8fce3513` | DO NOT restructure |
| GTM / Launch Planning DB (Kenzie) | `296f79b2-c8ac-8056-82d2-e2c49a1b53ef` | Keep relation |
| Test Sandbox DB | `303f79b2-c8ac-819f-8a5e-ee9a9891df2f` | Available for testing |
| Notion native Projects DB | `29bf79b2-c8ac-81be-83a4-e7d9073878c2` | Evaluate for merge/deprecation |
| Old Project Roadmap DB | `235f79b2-c8ac-8194-9df0-d9dc2b9bbf22` | Replace with new Roadmap DB |
| Integrations Road Map | `292f79b2-c8ac-802c-aad3-dbb499c0e920` | Migrate → Requests DB |
| Marketing Feedback & Requests | `2cef79b2-c8ac-80ce-9f1f-cdfdb46377f9` | Migrate → Requests DB |
| Feedback Agents DB | `7c916666-8b1d-4efe-8537-8629dc678dfe` | Keep (specialized) |
| KB Feedback Form | `2a1f79b2-c8ac-8064-a6a1-cf8657186291` | Keep (CSAT) |
| Weekly Persona Insights | `0a379bbb-35ba-4ae2-8fa9-8f97d5b94a5c` | Keep (research) |

---

_Last updated: 2026-02-14_
_Author: Tyler Sahagun (PM)_
_Review: Sam Ho (GM of Product) before Phase 1 execution_
