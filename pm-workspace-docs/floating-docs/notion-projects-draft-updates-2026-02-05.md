# Notion Projects Database — Draft Updates
## Feb 5, 2026

> **Purpose:** Drafted updates for each active project based on research across Linear, Slack, GitHub, and the AskElephant product. These are DRAFTS only — nothing has been applied to Notion yet.
>
> **Notion DB:** `2c0f79b2-c8ac-802c-8b15-c84a8fce3513`

---

## Housekeeping

### Duplicate to Archive
- **"Global Chat & Internal Seach (1)"** (ID: `2fff79b2-c8ac-8062-9660-ef30efc39957`) should be **archived**. It's a duplicate of the original "Global Chat & Internal Seach" entry (`2c0f79b2-c8ac-8199-8b42-c3e9126cac78`). Both contain identical status updates. Keep the original.

---

## Project-by-Project Draft Updates

---

### 1. Privacy Determination Agent (v2)
**Current:** Phase=Test | Visibility=Open Beta | Has Status=Yes | Has Objectives=No

#### Weekly Status Update (ENRICH existing)
> 📅 2026-02-05
> **Done:** Open Beta launched Jan 27. Privacy agent cited as differentiator in Fifth Dimension AI closed-won deal ($13.2K ACV) — compliance concerns addressed by privacy features. Currently 10 days in open beta with no structured feedback collected.
> **Up Next:** Tyler to message CSM team for active feedback collection. Prep GA release materials (KB article, Loom). Define custom rule creation documentation.
> **Blocked:** No ownership of feedback collection process. Passive waiting vs. active outreach.

#### Objectives & Success (NEW — draft)
```
Primary: X workspaces with privacy rules configured (TBD — need baseline from PostHog)
Engagement: Active custom privacy rule creation rate per workspace
Leading: % of meetings with privacy determination applied
Outcome signal: Cited as differentiator in sales deals (already happening — Fifth Dimension AI win)
```

#### PMM Tier (NEW)
**p2** — Blog post + enablement training. Privacy/compliance is a trust differentiator worth highlighting to prospects.

#### Target Dates (NEW)
- GA Target Release Date: **2026-02-21** (estimated — 2 weeks for feedback collection + refinements)
- GA Target Launch: **2026-02-28** (enablement materials ready)

---

### 2. Global Chat & Internal Search
**Current:** Phase=Test | Visibility=GA | Has Status=Yes | Has Objectives=No

#### Weekly Status Update (ENRICH existing)
> 📅 2026-02-05
> **Done:** Feature flag removed, moved to GA release (code deployed). Unified global chat feature flags (Git: `Unify global chat feature flags`). Fixed chat page UI bug with top bar nav. Fixed bug where Chat says it doesn't have access to transcripts (ASK-4990). Skylar inadvertently showed enablement piece — reverted.
> **Up Next:** Prepare launch materials (KB article, Loom demo). Decide if launch should coincide with Composio integration. Skylar completing enablement materials. Fix remaining issues from `#exp-global-chat` feedback.
> **Blocked:** Decision needed: launch with or without Composio connected integrations? Enablement piece was prematurely shown — need clean rollout.

#### Objectives & Success (NEW — draft)
```
Primary: Time to first "aha moment" — user asks a question and gets useful answer in <10 seconds
Engagement: Daily active users of Cmd+K / global chat (target: 30% of active users within 30 days of GA launch)
Leading: Queries per user per day (target: 3+ average)
Negative signal: Users who try once and never return (< 20% bounce rate)
```

#### PMM Tier (NEW)
**p1** — Full launch campaign. This is the headline feature for Q1. Sam described it as "Command K killed our search problem."

#### Slack Context
- Skylar mentioned global chat enablement and top-level nav in her focus list (Feb 5)
- Active discussion in `#exp-global-chat` about Composio vs. connected integrations preference (ASK-4903)
- Bug reported: Chat doesn't have transcript access on meeting pages (ASK-4990)

---

### 3. Structured HubSpot Agent Node
**Current:** Phase=Build | Visibility=Open Beta | Has Status=Yes | Has Objectives=Yes

#### Weekly Status Update (ENRICH existing with Slack intel)
> 📅 2026-02-05
> **Done:** Positive customer feedback — "keep agents separate" validated. UI config feedback collected: property/object selection window too small, editing multiple objects gets messy. Support ticket resolved (Issue #2268 — "HubSpot Structured Agent: First Run Contact Not Found" — Tyler W. helped customer add `{{externalattendeeemails}}`). Support team confirmed Structured Agent is new and documentation still being refined. ASK-4934 work ongoing (HubSpot CRM analytics wiring). Fifth Dimension AI deal included 10hrs HubSpot config support — validates need.
> **Up Next:** @Tyler Sahagun sync with Skylar on UI redesign for object/property configuration. Prep launch materials: KB Article (Feb 7), Loom Demo (Feb 7), Sales Enablement Presentation (Feb 7), Storylane. Share PostHog CRM update metrics with Sam.
> **Blocked:** Design needed for improved UI configuration (object/property editing UX). No public documentation yet — KB article is critical path.

#### PMM Tier (NEW)
**p1** — Full launch. This is the core CRM automation story. Customer quotes already exist from sales-closed-won. Deal-winning feature.

#### Target Dates (NEW)
- GA Target Release Date: **2026-02-14** (after design feedback implemented)
- GA Target Launch: **2026-02-21** (KB + Loom + enablement ready)

---

### 4. FGA Engine (Fine-Grained Access)
**Current:** Phase=Build | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** No recent Slack discussion or GitHub commits found since Jan 29. Project appears on hold or in background development.
> **Up Next:** Need to check with Brian/engineering on current build status. Determine if this is actively being worked on or deprioritized.
> **Blocked:** No visibility into current development progress. Need Linear project status update.

#### Objectives & Success (NEW — draft)
```
Primary: Admin can restrict user access to specific meetings/workspaces by role
Engagement: % of enterprise accounts using granular access controls
Leading: Admin setup completion rate for FGA rules
```

#### PMM Tier (NEW)
**p3** — In-app announcement + KB article. Infrastructure feature, important for enterprise but not headline-worthy.

#### Linear Link
Already set: `https://linear.app/askelephant/project/fga-engine-071b1bfd3808/overview`

---

### 5. Universal Signal Tables
**Current:** Phase=Build | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** No specific Slack activity found for this project in the last week. Outcome already well-defined: "Leaders extract structured insights from calls in minutes, improving coaching decisions and quota capacity."
> **Up Next:** Check with engineering on build progress. This is a core infrastructure piece that powers the engagement page redesign.
> **Blocked:** Need status update from engineering team.

#### Objectives & Success (NEW — draft)
```
Primary: Leaders can create custom signal tables and get structured data from calls
Engagement: # of workspaces with at least 1 custom signal table active for 14+ days
Leading: Signal extraction accuracy rate (% of signals correctly identified)
```

#### PMM Tier (NEW)
**p2** — Blog post + enablement. A differentiating feature for leader personas.

---

### 6. Feature Flag Audit & Cleanup
**Current:** Phase=Build | Visibility=None | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Git commit: `invalidate all feature flag cache` merged. Global chat feature flags unified. This project is tightly coupled with the Settings Redesign / Beta Features UI work that Jason Harmon is building.
> **Up Next:** Continues as part of the Release Lifecycle Process and Settings Redesign work. Jason's PostHog early access configuration is at 25% and Beta Features UI is at 13% (Linear progress update Feb 5).
> **Blocked:** Dependent on Settings Redesign completion.

#### Objectives & Success (NEW — draft)
```
Primary: All feature flags follow consistent Alpha → Beta → GA naming/lifecycle
Engagement: 0 orphaned or unused flags remaining
Leading: Time-to-toggle for beta features (self-serve for users)
```

#### PMM Tier (NEW)
**p4** — Silent release. Internal infrastructure improvement.

#### Note
This project may be better merged with "Release Lifecycle Process" since they share the same goal.

---

### 7. Settings Redesign
**Current:** Phase=Build | Visibility=None | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Jason Harmon assigned as lead. Skylar shared hi-fi designs for beta features section (Figma prototype: Settings and Integrations 2.0). Sam reviewed and raised questions: auto-enroll scope ambiguity, alpha user targeting unclear, API keys placement. Jason confirmed beta features will be personal scope (not workspace-level). Tyler shared progress with Sam — Jason starting on new UX soon after functional POC of Beta Features. PostHog early access config at 25%, Beta Features UI at 13% (Linear Feb 5). Target date set: Feb 11.
> **Up Next:** Jason implementing hi-fi designs from Skylar. Sam feedback to be addressed (auto-enroll copy, scope clarification). Alpha launch for internal testing.
> **Blocked:** Sam's feedback on scope (personal vs. workspace) needs resolution.

#### Objectives & Success (NEW — draft)
```
Primary: Users can self-serve toggle beta features on/off from Settings
Engagement: % of users who visit Beta Features page and enable at least 1 feature
Leading: Time from feature Alpha → Beta → GA (target: reduce by 30%)
```

#### PMM Tier (NEW)
**p3** — In-app announcement + KB article. Users will discover this in Settings.

#### Target Dates (NEW)
- Closed Beta Target Date: **2026-02-11** (Alpha for internal testing — per Linear)
- Open Beta Target Date: **2026-02-18** (estimate)
- GA Target Release Date: **2026-02-28** (estimate)

#### Linear Link
Already set: `https://linear.app/askelephant/project/workspace-settings-11d0e1b81f1f4654ab72e37e37db747d`

#### Slack Context (key thread)
- `#proj-settings-redesign-and-early-access-features`: Active discussion between Tyler, Sam, Skylar, and Jason. Figma prototype shared. Sam's feedback documented.

---

### 8. Rep Workspace
**Current:** Phase=Build | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** No specific Slack or GitHub activity found for this project in the last week. Outcome defined: "Dashboard so reps see insights and act faster on deals."
> **Up Next:** Need to determine current build status and priority relative to other projects. This may be dependent on Universal Signal Tables and CRM Agent work completing first.
> **Blocked:** No Linear link set. Need to create Linear project or link existing one.

#### Objectives & Success (NEW — draft)
```
Primary: Rep can see deal-relevant insights on a single dashboard
Engagement: Daily active reps using workspace dashboard (target: 50% of active users)
Leading: Time-to-action from insight → CRM update (target: <2 minutes)
```

#### PMM Tier (NEW)
**p2** — Blog post + enablement. Core value proposition for rep persona.

#### Note
**Missing Linear Link** — needs to be created or linked.

---

### 9. Speaker ID / Voice Print
**Current:** Phase=Definition | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** No Slack or GitHub activity found for this project in the last week. Still in Definition phase. Outcome defined: "Voice-based speaker identification for better transcript attribution."
> **Up Next:** Determine engineering feasibility timeline. This is a Definition-phase project — need research/discovery completed before Build.
> **Blocked:** No Linear link set. Need engineering input on ML model requirements and feasibility.

#### Objectives & Success (NEW — draft)
```
Primary: Accurate speaker attribution on multi-party calls (target: 95%+ accuracy)
Engagement: % of calls with correct speaker identification vs. "Unknown Speaker"
Leading: Reduction in manual speaker correction by users
```

#### PMM Tier (NEW)
**p2** — Blog post + enablement. Transcript quality is a competitive differentiator.

#### Note
**Missing Linear Link** — needs to be created or linked.

---

### 10. Admin Onboarding
**Current:** Phase=Test | Visibility=Invite-only Beta | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** No specific recent Slack activity found. Invite-only beta active. Outcome defined: "Guided admin setup with CRM-first experience for faster time-to-value."
> **Up Next:** Collect beta feedback from invited customers. Determine progression timeline to Open Beta. Customer feedback from closed-won deals consistently mentions "time-to-value" and onboarding as critical (e.g., PayHOA deal specifically cited 25% tool adoption historically).
> **Blocked:** Need structured feedback from beta participants.

#### Objectives & Success (NEW — draft)
```
Primary: Time-to-first-value for new workspace admins (target: <30 min from signup to first CRM update)
Engagement: Onboarding completion rate (target: 80%+ complete all setup steps)
Leading: # of support tickets from new customers in first 7 days (target: reduce by 40%)
```

#### PMM Tier (NEW)
**p3** — In-app announcement + KB article. Mostly a behind-the-scenes improvement for new customers.

#### Linear Link
Already set: `https://linear.app/askelephant/project/admin-onboarding-fb8f1181d633`

---

### 11. Composio Agent Framework
**Current:** Phase=Definition | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Active development of Composio integrations visible in GitHub (ASK-4936: Evalite setup for Health Score agent evals). James Benson shared detailed autonomous HubSpot Deal Quality Agent prompts in `#ext-vendilli`. LinkedIn content planner references "Composio Agent Framework" as future direction. Connected to Global Chat decision: should launch coincide with Composio availability?
> **Up Next:** Determine scope: is Composio the replacement for native integrations in the Workflow Builder? Skylar flagged this as related to "Connectors UX" work. Decision needed on Global Chat launch timing.
> **Blocked:** Strategic clarity needed — what's the relationship between Composio agents and the existing workflow builder? Tyler/Sam alignment needed.

#### Objectives & Success (NEW — draft)
```
Primary: # of workflow templates available via Composio-powered agents
Engagement: # of workspaces using Composio-powered automations
Leading: Workflow creation time compared to current builder (target: 50% faster)
```

#### PMM Tier (NEW)
**p1** — Full launch campaign if this becomes the new agent framework. Currently p4 while in Definition.

#### Note
**Missing Linear Link** — needs to be created or linked.

---

### 12. Release Lifecycle Process
**Current:** Phase=Build | Visibility=Alpha | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Stage definitions agreed upon in Sam/Tyler/Skylar conversation today: Alpha (internal only), Closed Beta (invite-only), Open Beta (anyone, no proactive enablement), GA (full launch with enablement). Projects Database plan created (`projects-database-plan.md`). Tightly coupled with Settings Redesign (Beta Features UI) and Feature Flag Audit work.
> **Up Next:** Document formal gate criteria for each stage transition. Create launch readiness checklist template. Define weekly review cadence (Tyler updates Wed, Sam reviews before Thu council). This IS the meta-project that governs all others.
> **Blocked:** Need to document gate criteria before this can move to Test. Jason's Beta Features UI implementation is the technical enabler.

#### Objectives & Success (NEW — draft)
```
Primary: Every project in the database has clear stage definitions and target dates
Engagement: Weekly status discipline maintained (100% of active projects updated every Wed)
Leading: Zero "surprise releases" — every GA launch has all materials ready
Meta: This project succeeds when the other projects succeed at following the process
```

#### PMM Tier (NEW)
**p4** — Silent release. Internal process improvement, not customer-facing.

---

### 13. CRM Update Artifact on Engagement Pages
**Current:** Phase=Build | Visibility=Open Beta | Has Status=No | Has Objectives=Yes (partial)

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Open Beta live. Objectives partially defined: "Users have more Hubspot tooled workflows enabled." Shares Linear project with Structured HubSpot Agent Node (CRM Agent Upgrades). Customer feedback from Dr. Contact Lens prospect: "something like AskElephant if it can present those things to us quicker, sooner, update the fields in HubSpot" — validates the artifact visibility need.
> **Up Next:** Track adoption metrics in PostHog. Sync with Structured HubSpot Agent Node launch timeline — these should launch GA together as a unified CRM story.
> **Blocked:** Dependent on Structured HubSpot Agent Node GA timeline.

#### Objectives & Success (ENRICH existing)
```
Primary: Users have more Hubspot-tooled workflows enabled (existing)
ADD: Engagement pages show CRM update history for 100% of HubSpot-connected meetings
ADD: Reps can see what data was pushed to CRM without leaving AskElephant
ADD: Leading indicator: Page views of engagement CRM artifact section per day
```

#### PMM Tier (NEW)
**p2** — Blog post + enablement. Part of the broader CRM story, visible to reps.

---

### 14. Deprecate Legacy HubSpot Nodes
**Current:** Phase=Discovery | Visibility=None | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** This was added as a discovery item during today's conversation with Sam. The Structured HubSpot Agent Node is the replacement. Support ticket (#2268) showed customers already using the new node but hitting issues — validating the need for migration.
> **Up Next:** Audit how many customers use legacy HubSpot nodes. Create migration plan. Determine sunset timeline (after Structured Agent Node reaches GA).
> **Blocked:** Cannot deprecate until Structured Agent Node is GA and stable. Migration path documentation needed.

#### Objectives & Success (NEW — draft)
```
Primary: 100% of active workflows migrated from legacy to structured agent nodes
Engagement: 0 customers using legacy nodes after sunset date
Leading: # of customers notified and migrated per week during transition
```

#### PMM Tier (NEW)
**p3** — In-app announcement + KB article. Requires proactive customer communication.

---

### 15. Client-Specific Usage Metrics ("How do we get client specific usage metrics")
**Current:** Phase=Discovery | Visibility=None | Has Status=No | Has Objectives=No

#### Weekly Status Update (NEW)
> 📅 2026-02-05
> **Done:** Added as discovery item during today's conversation. Tyler recently added PostHog metrics. Sales deals consistently reference the need for usage reporting (e.g., LSM deal: "prove 10+ minutes daily time savings"). Internal "Demo Health Automation" workflow published in `#askelephant-internal-workflow-requests` shows appetite for operational analytics.
> **Up Next:** Investigate PostHog capabilities for per-workspace reporting. Talk to CSM team about what metrics customers ask for most. Explore building a client-facing usage dashboard.
> **Blocked:** Need to define what "client-specific" means — per workspace? per user? What metrics matter most to CSMs?

#### Objectives & Success (NEW — draft)
```
Primary: CSMs can pull usage report for any workspace on demand
Engagement: % of renewal conversations that include AskElephant usage data
Leading: Reduction in churn where "we didn't know if it was working" is cited as reason
```

#### PMM Tier (NEW)
**p4** — Silent release (internal tool for CSMs). Could become p3 if customer-facing dashboard is built.

---

## Summary: Gaps Across All Active Projects

| Project | Status Update | Objectives | PMM Tier | Target Dates | Linear Link |
|---|---|---|---|---|---|
| Privacy Determination Agent | ✅ Has | ❌ Draft above | ❌ Draft: p2 | ❌ Draft above | ✅ |
| Global Chat & Internal Search | ✅ Has | ❌ Draft above | ❌ Draft: p1 | ❌ Partial (GA only) | ✅ |
| Structured HubSpot Agent Node | ✅ Has | ✅ Has | ❌ Draft: p1 | ❌ Draft above | ✅ |
| FGA Engine | ❌ Draft above | ❌ Draft above | ❌ Draft: p3 | ❌ Needs input | ✅ |
| Universal Signal Tables | ❌ Draft above | ❌ Draft above | ❌ Draft: p2 | ❌ Needs input | ✅ |
| Feature Flag Audit & Cleanup | ❌ Draft above | ❌ Draft above | ❌ Draft: p4 | ❌ Needs input | ❌ Missing |
| Settings Redesign | ❌ Draft above | ❌ Draft above | ❌ Draft: p3 | ❌ Draft above | ✅ |
| Rep Workspace | ❌ Draft above | ❌ Draft above | ❌ Draft: p2 | ❌ Needs input | ❌ Missing |
| Speaker ID / Voice Print | ❌ Draft above | ❌ Draft above | ❌ Draft: p2 | ❌ Needs input | ❌ Missing |
| Admin Onboarding | ❌ Draft above | ❌ Draft above | ❌ Draft: p3 | ❌ Needs input | ✅ |
| Composio Agent Framework | ❌ Draft above | ❌ Draft above | ❌ Draft: p4→p1 | ❌ Needs input | ❌ Missing |
| Release Lifecycle Process | ❌ Draft above | ❌ Draft above | ❌ Draft: p4 | ❌ Needs input | ❌ Missing |
| CRM Update Artifact | ❌ Draft above | ✅ Partial (enrich) | ❌ Draft: p2 | ❌ Needs input | ✅ |
| Deprecate Legacy HubSpot | ❌ Draft above | ❌ Draft above | ❌ Draft: p3 | ❌ Needs input | ❌ Missing |
| Client Usage Metrics | ❌ Draft above | ❌ Draft above | ❌ Draft: p4 | ❌ Needs input | ❌ Missing |

### Stats
- **15 active projects** (excluding 3 Done + 1 duplicate to archive)
- **3/15** have existing weekly status updates (20%)
- **2/15** have objectives defined (13%)
- **0/15** have PMM Tier set
- **8/15** have Linear links (53%)
- **7/15** missing Linear project links

---

## Sources Used

| Source | What was checked |
|---|---|
| **Notion** | Full database query — all 18 project rows with all properties |
| **Slack** | Searched 10+ queries: privacy determination, global chat, hubspot agent, FGA engine, settings redesign, beta features, notifications, admin onboarding, composio agent, universal signal, speaker ID, rep workspace, capture visibility |
| **GitHub** | `git log --since="2026-01-29" --all` on elephant-ai repo (50 non-merge + 30 merge commits) |
| **Linear** | Full project list (50 projects) for ID mapping |
| **PM Workspace** | `projects-database-plan.md` for strategic context and agreed terminology |

---

## Next Steps

1. **Review these drafts** — Tyler to validate each weekly status and objectives proposal
2. **Fill PMM Tier** — Confirm p1/p2/p3/p4 assignments
3. **Set target dates** — Even rough estimates help Sam plan
4. **Apply to Notion** — Once approved, use MCP tools to update each project
5. **Archive duplicate** — Remove "Global Chat & Internal Seach (1)"
6. **Create missing Linear projects** — For the 7 projects without links
