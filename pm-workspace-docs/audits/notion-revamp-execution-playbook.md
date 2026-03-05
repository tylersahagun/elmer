# Notion Teamspace Revamp — Execution Playbook

> **Status:** Active
> **Start date:** February 15, 2026
> **Owner:** Tyler Sahagun
> **Draft Home v2:** [Notion page](https://www.notion.so/DRAFT-Product-Team-Home-v2-308f79b2c8ac814d9163d9063d67c146)
> **Architecture doc:** `pm-workspace-docs/audits/notion-teamspace-revamp-plan.md`

---

## Current State

| Asset | Status |
|-------|--------|
| Architecture plan (research, schemas, relations map) | Done |
| Draft Product Home v2 page in Notion | Done — skeleton with placeholders |
| Projects DB (existing, 30+ columns, 9 views) | Live — do not touch |
| Weekly Updates DB | Needs verification — may need creation |
| 6 new databases (Initiatives, Requests, Feedback, KB, Decision Log, Roadmap) | Not started |
| Core pages (Vision, Roadmap, Intake, Feedback Hub) | Not started |
| Knowledge pages (KB Index, Personas, Competitive, Onboarding, Ops, Metrics) | Not started |
| Team hub pages (Sales, CS, Marketing, Eng, Leadership) | Not started |
| Automations, buttons, verification | Not started |

---

## Decision Gate: Get Sam's Sign-Off

Before building anything, Tyler needs to get Sam's approval on:

1. **Database architecture** — Hub-and-spoke with 6 new databases. Show him the relations graph.
2. **Initiatives DB concept** — Does Sam want strategic themes tracked in Notion, or is this overkill for now?
3. **Request intake** — Is Sam on board with a formal request form? Or does he prefer Slack-first?
4. **Knowledge Base consolidation** — Combining FAQ + KB + PRDs + Research + Specs into one DB with Type filtering.
5. **Audience hub pages** — Does he want Sales/CS/Marketing to self-serve, or does he prefer Tyler as the routing layer?

**How to get sign-off:**
- [ ] Send Sam a 5-minute Loom walking through the Draft Home v2 page and the relations graph
- [ ] Ask 3 questions: "Does this scope feel right? Should I add/remove any databases? Any concerns about maintenance?"
- [ ] Get verbal or Slack approval before starting Phase 1

**Sam's likely concerns:**
- "Is this too much for one PM to maintain?" → Show the ownership matrix (Tyler daily, Kenzie per-launch, engineers per-ship, Sam weekly review)
- "Will people actually use it?" → Point to the audience hubs and forms — self-serve means fewer "Tyler, where is X?" messages
- "What about the existing stuff?" → Nothing gets deleted. New databases add alongside. Old home stays until v2 is ready.

---

## Execution Sequence

### Sprint 1: Foundation (Week of Feb 17)
**Goal:** Databases exist, relations work, forms accept submissions.
**Time:** ~4 hours total

#### Day 1: Create databases (2 hours)

**What Tyler can delegate to the AI copilot (me):**
I can create all 6 databases via the Notion API with the exact schemas from the architecture plan. Tell me "create the databases" and I'll build them with every column, type, option, and relation wired up.

**What Tyler must do manually in Notion:**
- Add linked database views to the Draft Home v2 (the API can't insert linked views — Notion requires this be done in the UI by typing `/linked view` and selecting the source DB)
- Configure Form views on Requests and Feedback databases (click `+` → Form on each DB)
- Test: create 1 row from each form, verify it works

| Database | Columns | Relations | Can AI Create? |
|----------|---------|-----------|---------------|
| Initiatives DB | 12 columns | → Projects DB (bidirectional) | Yes |
| Product Requests DB | 15 columns | → Projects DB, → Feedback DB | Yes |
| Product Feedback DB | 16 columns | → Projects DB, → Requests DB | Yes |
| Knowledge Base DB | 13 columns | → Projects DB | Yes |
| Decision Log DB | 11 columns | → Projects DB, → Initiatives DB | Yes |
| Product Roadmap DB | 9 columns | → Projects DB, → Initiatives DB | Yes |

After DB creation:
- [ ] Add "Initiative" relation column to existing Projects DB → Initiatives DB
- [ ] Add "Feedback" relation column to existing Projects DB → Feedback DB
- [ ] Add "Requests" relation column to existing Projects DB → Requests DB
- [ ] Add "Knowledge Base" relation column to existing Projects DB → KB DB
- [ ] Add "Decisions" relation column to existing Projects DB → Decision Log DB
- [ ] Add "Roadmap Item" relation column to existing Projects DB → Roadmap DB

#### Day 2: Seed data + wire up Draft Home (2 hours)

**Seed each database with real data:**

| Database | Seed With | Count |
|----------|-----------|-------|
| Initiatives DB | Current strategic themes from roadmap brainstorm (Revenue Intelligence, Self-Serve Onboarding, CRM Sync, etc.) | 4-6 rows |
| Requests DB | Pull 5-10 recent requests from Slack #product-requests or #customer-feedback | 5-10 rows |
| Feedback DB | Pull 5-10 verbatim quotes from recent customer calls or churn interviews | 5-10 rows |
| Knowledge Base DB | Create entries for existing PRDs, Research docs, KB articles referenced in Projects DB | 10-15 rows |
| Decision Log DB | Document 3-5 recent product decisions (e.g., "No subitems," "Merge Kenzie's DB") | 3-5 rows |
| Roadmap DB | Map current Q1/Q2 planned work to roadmap items | 5-8 rows |

**Wire up Draft Home v2 (Tyler in Notion UI):**
- [ ] Replace "This Week's Updates" placeholder with linked view of Weekly Updates DB
- [ ] Replace "Active Projects" placeholder with linked board view of Projects DB (Phase ≠ Done)
- [ ] Replace "Upcoming Launches" placeholder with linked view of Projects DB (Launch Pipeline)
- [ ] Replace "Open Requests" placeholder with linked view of Requests DB (Status = Submitted)
- [ ] Update Quick Actions callouts with links to the actual Notion forms

---

### Sprint 2: Core Content Pages (Week of Feb 24)
**Goal:** The 5 most important sub-pages exist and have real content.
**Time:** ~4 hours total

| Page | Content Source | Who Creates | Time |
|------|---------------|-------------|------|
| **Product Vision & Principles** | `pm-workspace-docs/company-context/product-vision.md` + `strategic-guardrails.md` | AI syncs content → Tyler reviews | 30 min |
| **Product Roadmap** | 3 linked views of Roadmap DB (Timeline, By Initiative, By Quarter) | Tyler in Notion UI (linked views) | 30 min |
| **Product Request Intake** | Form link + "My Requests" linked view + "How It Works" instructions | AI creates page structure → Tyler adds form link | 30 min |
| **Feedback Hub** | 4 linked views of Feedback DB (New, By Feature, Churn Signals, By Persona) | Tyler in Notion UI (linked views) | 30 min |
| **Product Updates Hub** | Already exists — enhance with linked views from Weekly Updates + Projects DB | Tyler modifies existing page | 30 min |

After creating pages:
- [ ] Link all 5 pages from the Draft Home v2 Navigate section
- [ ] Enable wiki on Vision & Principles, set verification owner = Tyler, cadence = quarterly
- [ ] Review with Sam: "Here's the new roadmap page — does this view work for you?"

---

### Sprint 3: Knowledge Layer (Week of Mar 3)
**Goal:** Reference pages that people can self-serve from.
**Time:** ~4 hours total

| Page | Content Source | Priority |
|------|---------------|----------|
| **Knowledge Base Index** | Linked views of KB DB by type (Published, FAQs, PRDs, SOPs, Specs) | High — Sales and CS need this |
| **Personas** | `pm-workspace-docs/company-context/personas.md` + linked Feedback DB by persona | High — foundation for decisions |
| **Product Ops / Processes** | Meeting cadences, how requests work, how launches work, PMM tiers table | High — reduces "how does this work?" questions |
| **Onboarding Guide** | Week 1-2-3 structure with links to all key pages | Medium — needed for next hire |
| **Competitive Intelligence** | Competitor profiles from `pm-workspace-docs/initiatives/active/*/research.md` | Medium — Sales wants this |
| **Metrics & Analytics Hub** | PostHog dashboard links + KPI definitions + success criteria view | Medium — Sam wants this |

After creating pages:
- [ ] Link all 6 pages from Draft Home v2 Navigate section
- [ ] Enable wiki verification on Personas, Processes, Competitive Intel
- [ ] Seed Knowledge Base DB with 10+ existing PRDs and research docs from PM workspace

---

### Sprint 4: Team Hubs + Views (Week of Mar 10)
**Goal:** Each audience has a self-serve page.
**Time:** ~3 hours total

Build 5 pages, each with 4-6 linked views:

| Hub | Primary Audience | Key Views |
|-----|-----------------|-----------|
| **Sales Product Hub** | Ben Kinard's team, Pete, Reuben | Customer-facing features, FAQ, competitive positioning, upcoming launches |
| **CS Product Hub** | Ben Harrison's team | KB articles, feature status, known issues, release notes |
| **Marketing Product Hub** | Kenzie, Tony | Launch pipeline, asset readiness, KB articles to write |
| **Engineering Product Hub** | Bryan, engineers | Specs, PRDs, priorities, technical decisions |
| **Leadership Product Hub** | Sam, Woody, Robert | Initiatives, roadmap, portfolio status, risk items, decisions |

After creating hubs:
- [ ] Link all 5 hubs from Draft Home v2 Team Hubs section
- [ ] Send Slack DM to Ben Harrison: "CS Product Hub is ready — feedback?"
- [ ] Send Slack DM to Kenzie: "Marketing Product Hub is ready — feedback?"
- [ ] Walk Sam through Leadership Hub in next Council of Product

---

### Sprint 5: Polish + Go-Live (Week of Mar 17)
**Goal:** Automations running, verification active, old home retired.
**Time:** ~3 hours + 30 min launch comms

#### Automations to configure:

| Trigger | Action | Database |
|---------|--------|----------|
| New request submitted | Set Status = "Submitted" | Requests DB |
| Request status → Accepted/Declined | Slack notification to requestor | Requests DB |
| New feedback submitted | Set Status = "New" | Feedback DB |
| Project Phase changed | Slack notification to #product-internal | Projects DB |
| KB article age >90 days | Set Status = "Needs Update" | Knowledge Base DB |

#### Go-live checklist:

- [ ] All linked views working on Draft Home v2
- [ ] All sub-pages linked from Navigate section
- [ ] All Team Hub pages linked from Team Hubs section
- [ ] All automations tested with dummy data
- [ ] Forms tested: submit request, submit feedback
- [ ] Wiki verification active on Vision, Personas, Processes, Competitive Intel, Onboarding
- [ ] Remove `[DRAFT]` prefix from page title
- [ ] Move page to top of teamspace sidebar (or replace old wiki home)
- [ ] Archive old product home wiki (prefix with `[OLD]`, keep for reference)
- [ ] Post in #general: "Product Team has a new self-serve hub in Notion"
- [ ] Post in #team-sales: "Sales Product Hub is live — here's your link"
- [ ] Post in #cx-team: "CS Product Hub is live — here's your link"
- [ ] Post in #team-marketing: "Marketing Hub is live — here's your link"
- [ ] Post in #team-dev: "Engineering Hub is live — here's your link"
- [ ] Walk Sam + Woody through Leadership Hub in Council of Product

#### Data migration (can happen anytime during Sprint 4-5):

- [ ] Migrate Integration Roadmap DB rows → Requests DB (Type = Integration)
- [ ] Migrate Marketing Feedback & Requests DB rows → Requests DB (Dept = Marketing)
- [ ] Archive old Project Roadmap DB (prefix with `[OLD]`)
- [ ] Evaluate Notion native Projects DB — keep or archive
- [ ] Archive old Integration Roadmap DB
- [ ] Archive old Marketing Feedback DB

---

## What I (the AI Copilot) Can Do For You

At each step, tell me what to execute and I'll handle the API calls:

| Task | Command | What I Do |
|------|---------|-----------|
| Create all 6 databases | "Create the databases" | Build all DBs with exact schemas, columns, options, and relations via Notion API |
| Seed initiatives | "Seed initiatives from roadmap" | Pull from PM workspace initiatives and create rows |
| Seed knowledge base | "Seed KB from existing docs" | Create entries for all PRDs, research, specs in PM workspace |
| Create sub-pages | "Create the core pages" | Build Vision, Request Intake, Feedback Hub page structures |
| Create team hubs | "Create the team hubs" | Build all 5 audience hub pages with section structure |
| Sync content | "Sync vision to Notion" | Push product-vision.md and strategic-guardrails.md content to Vision page |
| Migrate data | "Migrate marketing requests" | Move rows from old DBs to new Requests DB |

**What I can NOT do (Tyler must do in Notion UI):**
- Insert linked database views (requires `/linked view` slash command in Notion)
- Configure Form views on databases
- Set up automations (requires Notion automation UI)
- Enable wiki verification (requires Notion UI)
- Reorder teamspace sidebar
- Create template buttons (requires Notion button builder UI)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sam says "this is too much" | Start with Sprints 1-2 only. The 6 DBs + Home + core pages deliver 80% of the value. Team hubs and automations can wait. |
| Nobody uses the request form | Announce in all-hands. Have Robert mention it to Sales. Track submission volume weekly for first month. |
| Tyler gets overwhelmed maintaining it | Enforce the ownership matrix. Kenzie owns KB content. Engineers own Weekly Updates. Tyler only owns triage and strategy pages. |
| Data gets stale | Wiki verification with expiry dates. Quarterly calendar reminders for review. |
| People can't find things | The audience hub pages solve this. If someone asks "where is X?" — point them to their hub page. |

---

## Immediate Next Action

**Right now, today:**

1. **Record a 5-minute Loom** walking through the Draft Home v2 and the architecture plan
2. **Send to Sam** with: "Here's my plan for the Product teamspace. 3 questions: Scope right? Anything to add/cut? Concerns about maintenance?"
3. **While waiting for Sam's response**, come back here and say **"Create the databases"** — I'll build all 6 with the exact schemas so they're ready the moment Sam approves

---

_Last updated: February 15, 2026_
