# FGA Engine — Access Controls PRD

## Overview

- **Owner:** Tyler Sahagun (PM), Matt Noxon (Eng Lead)
- **Target Release:** Beta Q1 2026, GA Q2 2026
- **Status:** Draft — Engineering review
- **Strategic Pillar:** Customer Trust
- **Feature Flag:** `fga-engine-beta` (PostHog)

AskElephant's Fine-Grained Authorization (FGA) engine is a Zanzibar-style relational authorization system that centralizes all access control into a single `userCan()` entry point. **The engine is built.** This PRD covers the missing layer: an **AI-assisted customer journey** that lets non-technical admins configure access controls, understand what's happening, and trust the system — without needing to understand authorization primitives.

The thesis: access controls are fundamentally a **language problem**, not a configuration problem. Admins think in plain English ("Managers should see their team's calls"). The AI translates that into policy rules. The system explains decisions in plain English. The gap between intent and configuration disappears.

---

## Outcome Chain

```
AI-assisted access control configuration
  → so that admins set up access rules in plain language (not policy primitives)
    → so that enterprise teams trust AskElephant with sensitive conversation data
      → so that they adopt with larger teams and more sensitive use cases
        → so that we close enterprise deals and expand ARR
```

---

## Problem Statement

### What Problem?

Authorization logic in AskElephant was scattered across ~50 files, inconsistent across features, and hardcoded. Matt Noxon's FGA engine solved the **backend** problem — unified `userCan()`, tiered policy evaluation, DB-stored rules. But the **human** problem remains: admins can't configure, understand, or audit access controls without developer assistance.

### Who Has It?

Enterprise admins evaluating AskElephant for organizations with data governance requirements. Revenue leaders who want their teams to share calls without manual per-meeting sharing. Sales managers onboarding new hires who should immediately see team history.

### Why Now?

- Enterprise deals (Xerox pattern) are blocked without configurable access controls
- The FGA engine is built and feature-flagged — this is UI/UX work, not infrastructure
- The `fga-engine-beta` flag and `explainPermitted` GraphQL query are ready to build on
- ASK-4585 "FGA Agent" is in Todo — this PRD defines what that agent does

### Evidence

- Notion PRD: Enterprise customers require "granular privacy controls, clear auditability, configurable rules, tenant isolation, meeting-attendee trust boundaries"
- User story (from Notion): _"I want to share my calls with my team without the effort of adding them to the call"_
- User story: _"As a sales manager when I make a new hire I want them to be able to see my team's calls without having to retroactively add them"_
- Weekly status (Feb 5): "No visibility into current development progress" — project stalled waiting for PM direction on customer journey

---

## Goals & Non-Goals

### Goals (Measurable)

1. **Enterprise admins can configure access controls without developer help** — Setup completion rate >80% without support tickets
2. **AI assistant handles 90%+ of policy configuration** — Measured by % of policies created via AI vs. raw editor
3. **Users understand access decisions** — <5% of access-denied events generate support tickets
4. **Beta rollout to 5+ workspaces** within 4 weeks of UI launch
5. **Zero data leaks** from misconfigured policies (safety net prevents catastrophic errors)

### Non-Goals

- Full self-service advanced FGA modeling (Phase 3+ — keep raw editor for power users but don't optimize it)
- Cross-tenant policy inheritance
- On-premise delivery or external policy evaluation API
- Multi-region policy replication
- Replacing the existing raw policy editor (keep it as "Advanced Mode")

---

## User Personas

### Primary: Enterprise Admin / IT Security

- **Job-to-be-done:** Configure enforceable, audit-ready access boundaries that align with governance policies
- **Current pain:** No UI to set access rules; must request engineering changes per-customer
- **Success looks like:** Sets up team-level and role-level access in under 15 minutes using AI guidance
- **Trust factors:** Needs audit trail, impact preview before changes, rollback capability

### Secondary: RevOps / Data Steward

- **Job-to-be-done:** Configure team-based sharing rules that adapt to each team's workflow
- **Current pain:** Different roles require different visibility patterns but there's no way to express this
- **Success looks like:** Creates "Sales team shares all calls within team" and "CSM team sees account calls only" rules in natural language
- **Trust factors:** Needs to see who's affected by a rule before it applies

### Tertiary: Revenue Leadership (Sales & CS Leaders)

- **Job-to-be-done:** Ensure teams have right visibility without over- or under-permissioning
- **Current pain:** New hires can't see team history; sharing requires manual per-meeting effort
- **Success looks like:** New team members automatically inherit team access on day one
- **Trust factors:** Confidence that sensitive exec conversations stay protected

### Affected: Sales Representative

- **Job-to-be-done:** Access the meetings they need for their work
- **Current pain:** Sometimes can't see meetings without understanding why
- **Success looks like:** Clear explanation when access is denied + one-click request access
- **Trust factors:** Transparency — "I can't see this because [reason], I can request access"

---

## User Stories (Per Persona)

### Enterprise Admin Stories

- As an Enterprise Admin, I want to **describe my access policy in plain English** and have AI generate the corresponding rules, so that I don't need to understand authorization primitives
- As an Enterprise Admin, I want to **preview the impact of a policy change** before applying it, so that I don't accidentally lock users out of critical data
- As an Enterprise Admin, I want to **see an audit log of who changed policies and when**, so that I can demonstrate compliance to security reviewers
- As an Enterprise Admin, I want a **guided setup walkthrough** on first visit, so that I can configure basic access controls without reading documentation

### RevOps Stories

- As a RevOps Manager, I want to **configure team-level sharing** ("Sales team members share all calls within the team"), so that I don't need to manage individual meeting permissions
- As a RevOps Manager, I want to **create user groups** and apply policies to groups, so that access rules scale with team changes
- As a RevOps Manager, I want to **set conditional access** ("CSMs see account interactions but not internal exec notes"), so that different roles have appropriate visibility

### Revenue Leader Stories

- As a Sales Manager, I want **new hires to automatically inherit my team's access rules**, so that onboarding doesn't require retroactive meeting sharing
- As a Sales Manager, I want to **share my meetings with teams I'm not part of**, so that cross-functional collaboration doesn't require manual effort

### Sales Rep Stories

- As a Sales Rep, when I can't access a meeting, I want to **see a clear explanation of why** and a **one-click request access** button, so that I'm not confused or blocked

---

## Shared Customer Journey

### Current State (Pain Points)

1. Admin wants to restrict meeting access → **No UI exists** (must ask engineering)
2. Manager wants team to share calls → **Must manually share each meeting**
3. New hire joins team → **Can't see any historical meetings** (must be retroactively added)
4. User can't access a meeting → **No explanation** (just doesn't appear in their list)
5. Security audit requested → **No audit trail** (scattered logs, no dashboard)

### Future State (With FGA UI + AI Assistant)

1. Admin visits Settings → Authorization → **AI guides them through setup** ("Tell me how your teams should share access")
2. Manager asks AI → **"My team should share all calls"** → policy created instantly
3. New hire joins team → **Automatically inherits group access** (zero manual work)
4. User can't access a meeting → **Clear banner: "This meeting is limited to attendees. Request access?"**
5. Security audit → **Full audit log** with filterable history, export, and rollback

### Transformation Moment

The admin types _"Only meeting attendees should see recordings, but managers should see their whole team's calls"_ — and the AI creates two policies, shows who's affected (47 users, 1,200 meetings), and asks for confirmation. No forms. No dropdowns. No authorization vocabulary needed.

---

## End-to-End Experience Design

### 1. Discovery — How does the customer know this exists?

- **For new enterprise workspaces:** During workspace setup, after team invitations, present an "Access & Privacy" step with the AI assistant
- **For existing workspaces:** In-app banner on Settings page: "New: AI-powered access controls. Set up your team's sharing rules in 5 minutes."
- **For admins:** Shield icon in navigation sidebar (already exists, gated by `fga-engine-beta`)
- **In sales process:** Sales reps demo the AI-assisted setup during enterprise security review calls

### 2. Activation — How do they enable/configure without hand-holding?

**Zero-config default:** Open access (everyone in the workspace can see everything) — this matches current behavior so there's no breaking change.

**AI-guided first-time setup (5-minute flow):**

1. Admin clicks "Set Up Access Controls" → AI assistant appears
2. AI asks: _"How should your team share meeting access? Pick a starting point:"_
   - **Open** — Everyone sees everything (current default)
   - **Team-based** — Teams share within their group, managers see their reports
   - **Attendees-only** — Only meeting participants can see content
   - **Custom** — "Describe your policy and I'll set it up"
3. AI generates policies, shows impact preview ("This will affect X users")
4. Admin confirms → policies active
5. AI offers: _"Want me to explain how to modify these later?"_

**No hand-holding required.** The AI handles the translation from intent to policy. The raw policy editor remains available as "Advanced Mode" for power users.

### 3. Usage — What does the first interaction look like?

**Admin's first interaction:**

- Visits Authorization settings → sees dashboard: policies by domain, recent changes, health status
- Clicks "Ask AI" floating button → types "Show me who can see the Xerox account meetings"
- AI responds with a visual showing which users have access and why (uses `explainPermitted` API)

**Regular user's first interaction:**

- Tries to access a meeting they shouldn't see → Instead of the meeting just being invisible, they see:
  - Banner: "This meeting is limited to [attendees / team X]. [Request Access] [Learn More]"
  - "Learn More" explains the policy in plain language
  - "Request Access" sends a notification to the admin

**Manager's first interaction:**

- Goes to their team view → Notices "Team Sharing" badge on settings
- Clicks it → AI says "Your team shares calls within the group. Want to include another team?"

### 4. Ongoing Value — What value do they get on day 2, week 2, month 2?

**Day 2:** New hire joins → automatically has correct access. Admin gets notification: "Alex joined Team Sales. They now have access to 340 team meetings per your sharing rules."

**Week 2:** Admin reviews audit log → sees all policy changes, who made them, impact. No surprises during security review.

**Month 2:** AI proactively suggests: _"3 users have been requesting access to Marketing team calls frequently. Would you like to add them to that team's sharing group?"_ The system learns from access patterns and suggests optimizations.

**Compounding value:** As more policies are set up, the AI gets better at suggesting configurations. The audit trail grows more complete. Trust deepens.

### 5. Feedback Loop — How do we know if this is working?

| Signal                        | Method                                           | Target                                |
| ----------------------------- | ------------------------------------------------ | ------------------------------------- | ---------------- |
| Setup completion rate         | PostHog funnel: first visit → policy created     | >80% complete within first session    |
| AI vs. manual policy creation | PostHog event: `policy_created` with `source: ai | manual`                               | >90% AI-assisted |
| Access-denied support tickets | Intercom tag: "access-denied"                    | <5% of denial events generate tickets |
| "Request Access" usage        | PostHog event: `access_request_sent`             | Validate feature is used              |
| Admin audit log views         | PostHog event: `audit_log_viewed`                | Weekly by enterprise admins           |
| AI suggestion acceptance rate | PostHog event: `ai_suggestion_accepted           | dismissed`                            | >60% acceptance  |
| NPS for access controls       | In-app survey (30 days post-activation)          | >40 NPS                               |

---

## Decisions Made

| #   | Decision                      | Choice                                                  | Rationale                                                                                        |
| --- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | **UI complexity**             | AI-assisted with Advanced Mode fallback                 | Admins think in English, not policy primitives. AI translates. Raw editor stays for power users. |
| 2   | **Rollout strategy**          | Beta per workspace → big bang GA                        | Validate with 5-10 workspaces, fix edge cases, then enable for all.                              |
| 3   | **Default policies**          | Open (everyone sees everything) with AI help to tighten | Matches current behavior (no breaking change). AI guides admins to restrict as needed.           |
| 4   | **Permission explanation UX** | AI-powered explanation + in-app walkthroughs            | "Why can't I see this?" gets a plain-language answer. Walkthroughs for admin setup.              |
| 5   | **Audit UI scope**            | In-app audit log (export to CSV for SIEM)               | Build in-app first, add SIEM export as enterprise upgrade.                                       |

---

## Requirements

### Must Have (MVP — Beta)

- [ ] **AI Policy Assistant** — Chat interface where admins describe policies in natural language and AI generates FGA rules
- [ ] **Policy Templates** — Pre-built starting points: Open, Team-based, Attendees-only (created via AI or manually selectable)
- [ ] **Impact Preview** — Before applying any policy change, show affected users/resources count
- [ ] **Plain-language Policy Display** — Every policy shows human-readable description alongside technical config
- [ ] **"Explain Permission" UI** — When a user can't access something, show why and offer "Request Access"
- [ ] **Guided First-Time Setup** — AI-driven walkthrough for first admin visit to Authorization settings
- [ ] **Audit Log (Basic)** — Who changed what policy, when, with before/after diff

### Should Have (GA)

- [ ] **AI Proactive Suggestions** — "3 users frequently request access to X — add them to the group?"
- [ ] **Policy Simulation** — "What would happen if I apply this policy?" dry-run mode
- [ ] **Rollback** — One-click undo for last policy change
- [ ] **Bulk Rule Management** — Apply/modify policies across multiple domains at once
- [ ] **Admin Notification System** — Alerts when policies create unexpected access patterns
- [ ] **CSV/PDF Export** — Audit log export for compliance reviews

### Could Have (Phase 3+)

- [ ] AI agent that auto-configures policies based on org chart import
- [ ] SIEM integration for real-time security event streaming
- [ ] Visual policy graph showing relationship between users, groups, and resources
- [ ] Cross-domain policy templates (e.g., "HIPAA compliance pack")

---

## User Flows

### Flow 1: AI-Guided First Setup

**Trigger:** Admin visits Authorization settings for the first time (no policies exist beyond system defaults)
**Steps:**

1. Welcome screen: "Set up your team's access controls with AI assistance"
2. AI asks: "How should your team share meeting access?" with starting points
3. Admin selects template or types custom description
4. AI generates policies → shows impact preview (users affected, resources affected)
5. Admin reviews plain-language summary → confirms
6. Policies activated → success banner with link to audit log
7. AI offers: "Want to set up more rules, or are you done for now?"

**Outcome:** Policies active within 5 minutes, no documentation needed
**Error states:** AI can't parse intent → falls back to template selection → falls back to raw editor
**Trust recovery:** Every AI-generated policy shows "Generated by AI — Review and confirm before applying"

### Flow 2: Plain-Language Policy Creation

**Trigger:** Admin clicks "Ask AI" or types in the AI assistant
**Steps:**

1. Admin types: "Only meeting attendees should see recordings, but managers should see their whole team's calls"
2. AI parses → generates two policies with conditions
3. Shows side-by-side: plain-language description + technical policy details
4. Shows impact preview: "This will affect 47 users. 12 users will lose access to meetings they currently see."
5. Admin can adjust → "Actually, include CS team too"
6. AI updates → new preview → admin confirms

**Outcome:** Complex multi-rule policy created without touching any form fields
**Error states:** Conflicting rules detected → AI explains the conflict and suggests resolution
**Trust recovery:** "Want to simulate this for 24 hours before making it permanent?"

### Flow 3: Access Denied Experience (End User)

**Trigger:** User navigates to a meeting they can't access
**Steps:**

1. Meeting page shows: "This meeting is restricted" banner
2. AI explains in one sentence why: "Only meeting attendees can view this recording (set by your admin)"
3. "Request Access" button → sends notification to admin with context
4. Admin reviews request → approves/denies with one click
5. User notified of decision

**Outcome:** User understands why, can take action, admin has context for decision
**Error states:** Admin not available → auto-escalation to workspace owner after 48h
**Trust recovery:** "Your request was sent to [Admin Name]. You'll be notified when they respond."

### Flow 4: Audit & Compliance Review

**Trigger:** Admin visits Audit Log tab
**Steps:**

1. Filterable table: date range, policy type, who changed, domain
2. Each entry shows: before/after diff in plain language
3. "What changed this week?" → AI summarizes recent policy changes
4. Export to CSV for security review
5. Rollback button on each change (with impact preview before undo)

**Outcome:** Admin can demonstrate access control compliance in minutes
**Error states:** Rollback would create conflicting policies → AI warns and suggests alternative

---

## Trust & Privacy Considerations

| Concern                                  | Mitigation                                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| AI generates wrong policy                | Every AI-generated policy requires explicit confirmation. Impact preview shows who's affected before applying.             |
| Admin locks themselves out               | Safety net: workspace owners always retain admin access regardless of policies. System prevents self-lockout.              |
| Policy misconfiguration causes data leak | "Open" default means misconfiguration reduces access (restrictive), never increases it beyond current state.               |
| Audit log tampering                      | Audit entries are append-only, timestamped, and include the authenticated user. Cannot be edited or deleted.               |
| AI understands intent incorrectly        | AI shows both the plain-language interpretation AND the technical policy for review. "Did I get that right?" confirmation. |
| Feature flag leak (beta)                 | PostHog flag `fga-engine-beta` gates all UI routes. No authorization behavior changes without the flag.                    |

---

## Success Metrics

- **North star:** % of enterprise workspaces with at least one custom access policy configured (target: 60% within 6 months of GA)
- **Leading indicators:**
  - AI-assisted policy creation rate (>90% of policies created via AI)
  - Setup completion rate (>80% finish first-time setup)
  - Time to first policy (<15 minutes from first visit)
  - "Explain Permission" click-through rate
  - Access-denied support ticket rate (<5% of denial events)
- **Guardrails:**
  - Zero data leaks from FGA misconfiguration
  - Policy evaluation latency <50ms on hot paths
  - No increase in "can't see my meetings" support tickets during beta

---

## Strategic Alignment

- [x] Outcome chain complete — Enterprise trust → adoption → revenue
- [x] Persona validated — Enterprise Admin, RevOps, Revenue Leaders
- [x] Trust implications assessed — Safety nets, audit trail, AI confirmation
- [x] Not in anti-vision territory — This is uniquely AskElephant (meeting-attendance trust boundary)
- [x] End-to-end experience: All 5 steps addressed (Discovery, Activation, Usage, Ongoing Value, Feedback)
- [x] Feedback method defined — PostHog events, NPS survey, support ticket tracking
- [x] Ownership assigned — Tyler (PM), Matt Noxon (Eng Lead), TBD (Design Lead)

---

## Launch Materials Needed

- [ ] Revenue team training deck — How to demo AI-assisted access controls
- [ ] Help center article — "Setting up access controls with AI"
- [ ] Changelog entry — "AI-powered access controls (Beta)"
- [ ] In-app walkthrough — Guided first-time setup with AI assistant
- [ ] Slack #product-updates post — Internal announcement
- [ ] Customer communication — Beta invite email to enterprise accounts
- [ ] Sales enablement — Security review slide for enterprise prospects

---

## Open Questions

- [ ] How does FGA interact with the Privacy Determination Agent? Complementary or overlapping?
- [ ] Should the AI assistant use the same Global Chat infrastructure or be a standalone widget?
- [ ] What's the performance budget for AI policy parsing? (Latency target for natural language → policy)
- [ ] Is ASK-4585 "FGA Agent" the same as the AI Policy Assistant described here, or separate?
- [ ] Should group management live in Authorization settings or in Team Management?

---

_Last updated: 2026-02-08_
_Owner: Tyler Sahagun_
