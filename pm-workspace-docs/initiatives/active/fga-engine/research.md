# FGA Engine — Research & Gap Analysis

> **Initiative:** FGA Engine (Fine-Grained Authorization)
> **Date:** 2026-02-08
> **Phase:** Build (engine done) → needs Define/Build (UI + customer journey)
> **Sources:** Notion PRD, Linear project, GitHub PR #4929, codebase analysis
> **Strategic Alignment:** Strong (Trust Foundation pillar)

---

## TL;DR

The FGA engine backend is largely **built and functional** — a Zanzibar-style relational authorization system with `userCan()` entry point, tiered policy evaluation (workspace → role → custom), DB-stored policies, and audit logging. The core issue: **customers can't see or use any of this**. The current UI is a technical admin tool (ag-grid policy table, condition builder dialogs) hidden behind the `fga-engine-beta` PostHog feature flag. What's missing is a **customer journey** — onboarding, progressive disclosure, trust transparency, and the ability for non-technical admins to actually configure access controls without understanding authorization primitives.

**Outcome chain:**

```
FGA gives admins granular, configurable access controls
  → so that enterprise customers trust AskElephant with sensitive data
    → so that they adopt with higher confidence and broader teams
      → so that we close enterprise deals (Xerox pattern)
        → so that we expand ARR in mid-market and enterprise
```

---

## Strategic Alignment: **Strong**

| Dimension           | Score (1-5) | Notes                                                     |
| ------------------- | ----------- | --------------------------------------------------------- |
| Trust Foundation    | **5**       | Core trust infrastructure — enterprise deal blocker       |
| Outcome Orientation | **5**       | Direct tie to enterprise revenue (Xerox was the catalyst) |
| Human Empowerment   | **3**       | Backend empowers devs; UI doesn't yet empower admins      |
| Data Capture        | **3**       | Enables audit logging of access decisions                 |
| Differentiation     | **4**       | Meeting-attendance-as-trust-boundary is unique            |
| Expansion Driver    | **5**       | Enterprise deals blocked without this                     |

**Total: 25/30** — Strong alignment, proceed.

> "Trust and reliability must be solved _before_ automation can be adopted at scale." — Product Vision

FGA is literally the infrastructure that makes this principle enforceable at the enterprise level.

---

## What's Built (Current State)

### Backend (57 files in `contexts/authorization/`)

- **Policy engine** — `userCan(user, action, resource)` unified entry point
- **Tiered evaluation** — Workspace isolation → Role defaults → Custom policies
- **DB schema** — `authz_policies`, `authz_policy_conditions`, `authz_condition_groups`, `authz_policy_condition_groups` tables
- **Entity domains** — Engagements, Companies, Contacts, Users, Workflows, Tags, Policies, API Keys, Workspace Settings
- **GraphQL API** — Full CRUD for policies, condition groups, attach/detach operations
- **System defaults** — Seeder with baseline policies per workspace
- **Drizzle filter builder** — Translates policies into SQL `WHERE` clauses for paginated queries
- **Feature flag** — `fga-engine-beta` in PostHog (currently disabled for most users)
- **Entity domain registry** — Extensible registry for adding new protected domains
- **Condition validation** — Validates policy conditions before saving
- **Metrics** — `authorization.metrics.ts` for tracking policy evaluation performance
- **Comparison engine** — `authorization.comparison.ts` for diffing old vs new behavior
- **Tests** — `fga-permissions-mirror.test.ts`, `drizzle-filter-builder.test.ts`, `policy-mutations-security.test.ts`, `authorization.seeder.test.ts`, `user-eligibility.test.ts`

### Frontend (7 files in `components/authorization/`)

- **Authorization settings page** — Grid of entity domain cards with policy counts
- **Policies table** — ag-grid table showing effect, actions, principal, scope, description
- **Policy form dialog** — Create/edit policy with conditions
- **Condition builder** — Raw condition configuration (target, mode, match type, operator, value)
- **Condition groups tree** — Tree view of reusable condition groups
- **Condition group form dialog** — Create/edit condition groups
- **Path builder** — JSON path builder for field-level conditions
- **Policy row actions** — Edit/delete actions per policy row

### Linear Issues (FGA Engine Project)

| Issue    | Title                         | Status            | Assignee   |
| -------- | ----------------------------- | ----------------- | ---------- |
| ASK-4460 | Implement FGA for engagements | Acceptance Review | Unassigned |
| ASK-4361 | Create auth page              | (unknown)         | (unknown)  |
| ASK-4320 | Add query builder service     | (unknown)         | (unknown)  |
| ASK-4318 | Add authz table migrations    | (unknown)         | (unknown)  |
| ASK-4317 | Add extensive test cases      | (unknown)         | (unknown)  |
| ASK-4585 | FGA Agent                     | Todo              | Unassigned |
| ASK-4507 | Missing FGA domains           | Done              | Matt Noxon |
| ASK-4286 | FGA POC                       | Done              | Matt Noxon |

### GitHub PR

- **PR #4929** — "Ask 4460 fga engagements beta" — FGA integration for engagements domain (feature-flagged)

---

## What's Missing (The Gap)

### 1. Customer Journey (Critical)

The current UI assumes the user is a developer who understands authorization primitives. There is no:

- **Onboarding flow** — "Welcome to Access Controls. Here's what this does for your team."
- **Progressive disclosure** — Start simple (team sharing), reveal complexity (custom policies) as needed
- **Plain-language rules** — "Managers can see their team's meetings" vs. `{effect: "Allow", target: "Principal", matchType: "ROLE", value: "Manager"}`
- **Impact preview** — "This change will affect 47 users and 1,200 meetings"
- **Setup wizard** — Guided first-time setup ("How does your team share meeting access?")
- **Audit trail UI** — Who changed what, when, with rollback

### 2. User-Facing Scenarios (Not Yet Designed)

From the Notion PRD, these are the user stories that need UI flows:

| Scenario                                                                | Persona          | Current State                                |
| ----------------------------------------------------------------------- | ---------------- | -------------------------------------------- |
| "I want to share my calls with my team without adding them to the call" | Revenue Leader   | No UI to set team sharing rules              |
| "I want to configure user groups that share our conversations"          | Revenue Leader   | Condition groups exist but are technical     |
| "When I make a new hire, they should see my team's calls immediately"   | Sales Manager    | No group membership auto-grant               |
| "I want to share my meetings with teams I'm not a part of"              | Sales Manager    | Cross-team sharing not surfaced              |
| Admin restricts access by role                                          | Enterprise Admin | Policy exists but configuration is raw       |
| Admin audits "who accessed what"                                        | Enterprise Admin | Audit logging exists but no audit UI         |
| CSMs view account interactions but not internal exec notes              | RevOps           | Conditional policies work but hard to set up |

### 3. Design System Gaps

- No **empty state** guidance for the authorization page
- No **success/confirmation** patterns for policy changes (high-stakes action)
- No **error recovery** for misconfigured policies (could lock users out)
- No **breadcrumb navigation** between domain → policies → conditions
- The "Condition Groups" concept is too abstract for non-technical users

### 4. Trust & Safety

- **No "safe mode"** — admins can create policies that lock themselves out
- **No policy simulation** — can't test "what would this policy do?" before applying
- **No rollback** — if a policy breaks access, there's no one-click undo
- **No "explain why"** — when a user can't access something, there's no explanation
- **No admin-only vs. user-visible distinction** — users don't know why access was denied

---

## Key Decisions Needed

| #   | Decision                                                                                | Options                                                                                                                 | Who Decides         |
| --- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | **UI complexity level** — Should admins configure raw policies or use preset templates? | A) Full policy editor (current), B) Template-based with advanced mode, C) Chat-based "describe your policy"             | Tyler + Woody       |
| 2   | **Rollout strategy** — Feature flag per domain or all-at-once?                          | A) Per-domain rollout, B) Big bang, C) Beta → GA per workspace                                                          | Tyler + Brian       |
| 3   | **Default policies** — What ships out of the box?                                       | A) Open (everyone sees everything), B) Meeting-attendance boundary (PRD default), C) Customer chooses during onboarding | Tyler + Product     |
| 4   | **Audit UI scope** — Build a full audit log viewer or integrate into existing tools?    | A) In-app audit log, B) Export to customer's SIEM, C) Both                                                              | Tyler + Engineering |
| 5   | **"Explain permission" UX** — How do users understand why they can/can't see something? | A) Toast on access denied, B) Permission explainer panel, C) "Request access" button                                    | Tyler + Design      |

---

## Questions to Answer Before PRD Update

### On the Problem

1. Which enterprise customers beyond Xerox are blocked on FGA? How many deals?
2. What's the current workaround customers use today? (manual sharing? nothing?)
3. How often do admins change access policies? (one-time setup vs. ongoing?)
4. What's the cost of a misconfigured policy? (data leak? locked-out users?)

### On the Solution

1. Can the `fga-engine-beta` flag be enabled for internal testing now?
2. What's the ASK-4585 "FGA Agent" issue? Is this AI-assisted policy creation?
3. Is the `explainPermitted` GraphQL query (already built) exposed in any UI?
4. What's the performance impact of policy evaluation on hot paths (meeting list, search)?

### On Strategic Fit

1. How does FGA interact with Privacy Determination Agent? Are they complementary or competing?
2. Is FGA part of "Workspace Settings redesign" or standalone?
3. Should FGA UI be admin-only or should regular users see "why can I/can't I see this?"

---

## Primary JTBD

**When** an enterprise admin is evaluating AskElephant for their organization,
**I want to** see transparent, configurable access controls that align with our company's data governance policies,
**So that** I can confidently approve the tool for my organization knowing sensitive customer conversations are protected.

---

## User Breakdown

| Persona              | JTBD                                        | Frequency                       | Severity                         |
| -------------------- | ------------------------------------------- | ------------------------------- | -------------------------------- |
| **Enterprise Admin** | Configure and audit access policies         | Weekly (setup), Monthly (audit) | **Deal-blocking**                |
| **RevOps**           | Set up team-based sharing rules             | Monthly                         | High                             |
| **Sales Manager**    | Share team calls without manual effort      | Daily (implicit)                | Medium                           |
| **Sales Rep**        | Understand why they can/can't see a meeting | Ad-hoc                          | Low (but trust-damaging if poor) |

---

## Recommended Next Steps

### Immediate (This Sprint)

1. **Enable `fga-engine-beta` flag internally** — Let Tyler and team test the current UI
2. **Get demo from Matt Noxon** — He built the engine; understand edge cases and intended UX
3. **Check with Brian** — What's the current build status? The weekly status says "on hold or in background"

### Short-term (Next 2-3 Weeks)

4. **Design the customer journey** — Run `/pm fga-engine` to create a proper PRD update with E2E experience flows
5. **Prototype "Team Sharing" as entry point** — The most common use case; doesn't require understanding policies
6. **Design the "Policy Templates" concept** — Pre-built policies like "Manager sees team's calls", "Attendees-only"

### Medium-term (4-6 Weeks)

7. **Build audit log UI** — Enterprise admins need "who changed what, when"
8. **Build "Explain Permission" UX** — Why can/can't I see this meeting?
9. **Policy simulation** — "Preview impact before applying"

### Deferred

10. Self-service advanced FGA modeling (PRD explicitly defers this to Phase 3+)
11. Cross-tenant policy inheritance
12. On-premise delivery

---

## Feedback Plan

| Method                      | Timing          | Target                                                        |
| --------------------------- | --------------- | ------------------------------------------------------------- |
| Internal dogfooding         | Immediate       | Enable flag, use internally for 2 weeks                       |
| Enterprise admin interviews | After prototype | 3-5 enterprise admin personas                                 |
| Xerox-specific walkthrough  | After prototype | Validate against their specific requirements                  |
| PostHog analytics           | Post-launch     | Track policy creation rate, audit log usage, "explain" clicks |

---

## Appendix: Codebase Architecture

```
elephant-ai/
├── apps/functions/src/contexts/authorization/     # Backend FGA engine (57 files)
│   ├── authorization.data-source.ts              # DB operations
│   ├── authorization.feature-flag.ts             # PostHog flag check
│   ├── drizzle-filter-builder.ts                 # SQL WHERE from policies
│   ├── entity-domain-registry.ts                 # Extensible domain registry
│   ├── system-default-policies.ts                # Out-of-box defaults
│   ├── user-eligibility.ts                       # User permission evaluation
│   ├── resolvers/                                # GraphQL resolvers
│   │   ├── Mutation/ (create/update/delete policy, condition groups)
│   │   └── Query/ (policy, explainPermitted, entityDomainInfo)
│   └── *.test.ts                                 # Comprehensive test suite
│
├── apps/web/src/
│   ├── components/authorization/                  # UI components (7 files)
│   │   ├── policies-table.tsx                    # ag-grid policy table
│   │   ├── policy-form-dialog.tsx                # Policy CRUD dialog
│   │   ├── condition-builder.tsx                 # Raw condition config
│   │   ├── condition-groups-tree.tsx             # Tree view
│   │   └── ...
│   └── routes/.../settings/authorization.tsx      # Settings page with domain cards
│
└── apps/functions/src/db/schema.ts               # DB tables (authz_*)
```

**Feature Flag:** `fga-engine-beta` in PostHog — gates UI routes and nav item visibility.

**Key API:** `explainPermitted` query already exists — returns why a user can/can't access a resource. This is the foundation for the "explain permission" UX but has no frontend yet.
