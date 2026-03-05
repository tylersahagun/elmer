# Product Command Center: Dashboard & View Specifications

**Created:** 2026-02-21  
**Purpose:** Implementation specs for building the Notion command views across Product Home and Product System.

## 1. Product Home (Dashboard)

This is the primary entry point for the Product teamspace. It acts as a dashboard, not a folder.

**Layout Structure:**
- **Header:** Quick Links (Product System, Archive, Key Initiative Pages)
- **Main Content Area (2 Columns):**
  - **Left Column (Execution & Delivery):**
    - `Outcomes Cockpit`
    - `Roadmap with Confidence`
    - `Launch Tracker`
  - **Right Column (Attention Required):**
    - `Missing Core Docs`
    - `Recent Documents`

### View Definitions (Product Home)

#### 1. Outcomes Cockpit
- **Source Database:** Initiatives (Projects)
- **View Type:** Gallery or Board
- **Filters:** 
  - `Phase` is NOT `Done`, `Archived`, `Cancelled`
  - `Outcome Status` is `Needs Attention` OR `Off Track`
- **Properties to Show:** Target Launch, PM Owner, Target, Actual, Confidence, Outcome Status
- **Grouping:** By `Roadmap Theme`

#### 2. Roadmap with Confidence
- **Source Database:** Milestones
- **View Type:** Timeline or List
- **Filters:** 
  - `Status` is NOT `Shipped`, `Delayed`
- **Properties to Show:** Initiative, Target Date, Status, ETA Confidence
- **Sorting:** `Target Date` Ascending

#### 3. Missing Core Docs
- **Source Database:** Initiatives (Projects)
- **View Type:** List
- **Filters:** 
  - `Phase` = `Define`
  - `% Core Docs Complete` < 100%
- **Properties to Show:** PM Owner, Phase, % Core Docs Complete

---

## 2. Product System (Discovery Hub)

This is the single page housing all linked database views for discovery, planning, and reporting.

**Layout Structure:**
Use a Notion sync block or a set of toggles/tabs to organize the views cleanly.

### View Definitions (Product System)

#### 1. Initiatives by Phase
- **Source Database:** Initiatives (Projects)
- **View Type:** Board (Kanban)
- **Grouping:** By `Phase` (Discovery → Define → Build → Validate → Launch → Done)
- **Properties to Show:** Priority, PM Owner, Eng Lead, Target Launch, Confidence

#### 2. Who’s Working On What
- **Source Database:** Initiatives (Projects)
- **View Type:** Board (Kanban) or Table
- **Grouping:** By `PM Owner` or `Eng Lead`
- **Filters:** `Phase` is NOT `Done`, `Archived`
- **Properties to Show:** Title, Phase, Target Launch

#### 3. Documents by Type (Library)
- **Source Database:** Documents
- **View Type:** List or Table
- **Grouping:** By `Doc Type` (PRD, Research, Design Brief, etc.)
- **Properties to Show:** Initiative, Stage, Canonical, Last Updated, Owner

#### 4. Customer Impact Queue
- **Source Database:** Customer Requests
- **View Type:** Table or Board
- **Grouping:** By `Status` (Logged, Addressed, Notified)
- **Properties to Show:** HubSpot Company, HubSpot Contact, Initiative/Milestone, Slack Signal

#### 5. Release Impact (Shipped Outcomes)
- **Source Database:** Initiatives (Projects)
- **View Type:** Table
- **Filters:** 
  - `Phase` = `Launch` or `Done`
- **Properties to Show:** Target Launch, Target, Actual, Confidence, Metric Links (PostHog/Stripe)

---

## 3. Initiative Page Template

Every initiative in the Initiatives database must use this template to unify the hierarchy.

### Template Layout
**Top Metadata:** Phase, Priority, Owners, Target Launch, Linear Link, Slack Channel

**1. Delivery Milestones**
- **Linked DB:** Milestones
- **Filter:** `Initiative` = `[This Page]`

**2. Definition Work (Documents)**
- **Linked DB:** Documents
- **Filter:** `Initiative` = `[This Page]`
- **Grouping:** By `Doc Type`

**3. Customer Demand & Outcomes**
- **Linked DB:** Customer Requests
- **Filter:** `Initiative/Milestone` contains `[This Page]`
- **Linked DB:** Metric Links
- **Filter:** `Initiative/Milestone` contains `[This Page]`

**4. Engineering Specs & Design Briefs**
- **Linked DBs:** Engineering Specs, Design Briefs
- **Filter:** `Related Project` = `[This Page]`