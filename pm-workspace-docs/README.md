# PM Workspace — Agent Capability Map

This is the definitive reference for everything Tyler's AI agents can do in this workspace. All configuration lives in `.cursor/` — 21 agents, 60 commands, 33 skills, 5 rules.

---

## How It All Works

```
You say something (natural language or /command)
  → Rule (pm-foundation) routes intent to a command
    → Command (thin orchestrator) delegates to either:
        A. Subagent (isolated context, complex multi-step workflow)
        B. Skill (reusable procedural module loaded into current context)
          → Both make MCP tool calls to external systems
            → Output lands in pm-workspace-docs/ or external system
```

**Agent teams** run multiple agents in parallel for complex workflows (research sprints, initiative kickoffs, triage blitzes).

---

## Daily Operations

These are the commands you'll run every day.

### Morning / Evening Cadence

| Command | What Actually Happens |
|---------|----------------------|
| `/morning` | Pulls Google Calendar (today's meetings), Google Tasks (due items), Slack (overnight signals), Linear (your open issues), and active initiative status — synthesizes into a prioritized daily focus plan |
| `/slack-monitor` | Scans 30+ Slack channels, classifies every unread message into Act / Decide / Aware / Capture / Follow-Up, runs reply-verification to skip already-handled items, saves dated digest to `status/slack/digests/` |
| `/gmail` | Triages up to 100 unread emails, applies Gmail labels (`PM/Act`, `PM/Decide`, etc.), drafts responses for high-priority items, archives noise, saves digest to `status/gmail/digests/` |
| `/triage` | Fetches all issues in Linear's EPD/Product "Triage" state, classifies each (Ready for Backlog / Needs Info / Needs Eng Handoff / Duplicate / Defer), applies changes with `--apply` flag |
| `/eod` | Aggregates GitHub PRs merged, Linear issues closed, Slack signals captured, HubSpot deals closed — formats end-of-day report |
| `/eow` | Same as `/eod` but weekly scope, adds revenue summary (ARR won/lost, meetings booked by rep, win rate) |

### Status Checks

| Command | What Actually Happens |
|---------|----------------------|
| `/status [initiative]` | Reads `_meta.json` + all artifact files, checks graduation criteria for current phase, calculates staleness, assigns On Track / At Risk / Blocked / Paused, optionally enriches with live Linear + PostHog + Notion data |
| `/status-all` | Scans every active initiative, builds artifact gap matrix (9 types), calculates health score 0–100, generates prioritized action queue, compares to previous snapshot |
| `/roadmap` | Reads and updates `roadmap.json`, regenerates kanban/gantt/markdown views |
| `/team` | Pulls real-time team status from Linear: who's working on what, blockers, what needs PM definition |

---

## Research & Intelligence

These commands pull from real customer data — Slack, HubSpot, PostHog, Linear — and synthesize it into structured PM artifacts.

### Signal Gathering

| Command | What Actually Happens |
|---------|----------------------|
| `/ingest [source]` | **Slack**: Pulls channel messages, extracts customer pain points / feature requests / churn signals, reads full threads to detect resolutions (fixed/workaround/in-progress), saves to `signals/slack/` with open-vs-resolved categorization. **HubSpot**: Extracts deal-lost reasons, churn causes, and customer pain from CRM notes. **Linear**: Fetches 250 issues, categorizes by status, produces fixed-vs-outstanding report. **Transcript**: Extracts TL;DR, decisions, action items, verbatim problem quotes, JTBD statement, strategic alignment signals, and "context candidates" for promoting into `company-context/` docs. Add `--customer-check` to cross-reference PostHog feature flags for each mentioned feature. |
| `/synthesize` | Loads multiple signal files, clusters by keyword/persona/time/feature-area, scores theme strength (Weak/Moderate/Strong based on source diversity + frequency), matches to existing hypotheses, saves synthesis report to `research/synthesis/` |
| `/context-review` | Presents pending `context_candidates` from signal ingestion (grouped by target doc), asks approval, promotes approved updates into canonical `company-context/` files, logs changes to `CHANGELOG.md` |

### Research Analysis

| Command | What Actually Happens |
|---------|----------------------|
| `/research [initiative]` | Before analysis: pulls HubSpot company context, PostHog usage data, checks Linear for related issues. Then analyzes transcript/notes: extracts JTBD, verbatim quotes by persona, feature requests with outcome chains, open questions, strategic alignment score (Strong/Moderate/Weak per element), anti-vision flags, evidence gaps. Saves to initiative folder, updates `_meta.json`, recommends next step. |
| `/landscape [topic]` | Full competitive analysis: competitor profiles (Direct/Indirect/Adjacent), UX flow capture via browser screenshots, feature matrix vs. AskElephant, differentiation mapping. Saves `competitive-landscape.md` and assets to `initiatives/active/[name]/assets/competitive/` |

### Customer Intelligence (HubSpot)

The `hubspot-activity` subagent (invoked by `/eod` and `/eow`) maps HubSpot CRM data to named team members:
- **AEs**: Michael Cook, Reuben Tang, Pete Belliston
- **SDRs**: Adia Barkley, Carter Thomas, Jamis Benson, Michael Haimowitz
- **Expansion CSM**: Parker Alexander

Calculates: Total ARR Won, deal count, average deal size, meetings by rep, lost ARR, win rate.

---

## Initiative Lifecycle

Full lifecycle from idea to launch, with each phase gated by graduation criteria.

```
Discovery → Define → Build → Validate → Launch
```

### Starting an Initiative

| Command | What Actually Happens |
|---------|----------------------|
| `/new-initiative [name]` | Creates `initiatives/active/[name]/` folder with `_meta.json`, `prd.md`, `research.md`, `design-brief.md`, `engineering-spec.md`, `gtm-brief.md`, `prototype-notes.md`; updates `roadmap.json` |
| `/hypothesis [new]` | Asks for problem statement, initial evidence, and persona; creates hypothesis file in `hypotheses/active/`, updates `_index.json` |
| `/hypothesis [validate]` | Checks 3+ independent evidence sources, clear persona, severity/frequency, and outcome chain — moves to `hypotheses/validated/` if criteria met |
| `/hypothesis [commit]` | Promotes validated hypothesis to full initiative — creates `initiatives/active/[name]/` with evidence-seeded `research.md`, updates roadmap |

### Documentation Creation

| Command | What Actually Happens |
|---------|----------------------|
| `/pm [name]` | Full initiative documentation suite using the `prd-writer` skill — creates PRD (with outcome chain, user stories, success metrics, risks), design brief, engineering spec, and GTM brief; pushes back if outcomes are vague or evidence is missing |
| `/metrics [initiative]` | Produces a five-layer Metrics Map: Eligibility & Coverage → Activation & Adoption → Behavioral Conversion → Trust & Reliability → Proof of Value Outcomes. Each metric has: definition, unit, segmentation, time window, target threshold, ship/iterate/rollback decision rule, and instrumentation source. Also defines 6 trust-proxy metrics and explicit anti-metrics to avoid. Concludes with a Launch Gate (SLI requirements to ship). |
| `/brainstorm-board` | Structured divergent ideation — generates problem reframes, solution directions, analogous problems, wild ideas, then converges to ranked top directions |

### Prototyping

| Command | What Actually Happens |
|---------|----------------------|
| `/proto [initiative]` | Reads PRD + design brief + `figma-language.md` + real `components/ui/`. Builds versioned `prototypes/[Initiative]/v1/` containing: 2–3 creative directions (Max Control / Balanced / Max Efficiency), all AI states (Loading, LoadingLong, Success, Error, LowConfidence, Empty), interactive Flow stories, Demo, and Walkthrough. Deploys to Chromatic, generates FigJam customer-story diagram, sends Slack DM to Tyler with all links. |
| `/lofi-proto [initiative]` | Quick wireframe version of `/proto` — same structure, lower fidelity |
| `/context-proto [initiative]` | Places the feature *in the real app*: does placement analysis first (What type? Where do similar features live? How discovered? Best container?), then builds context shells: InPage (sidebar layout), InPanel (Sheet), Navigation. Context stories: AsFullPage, AsSidePanel, NavigationDiscovery, WithAdjacentFeatures, Flow_HappyPath, Flow_ErrorRecovery. |
| `/placement [initiative]` | Placement analysis only — reads real app structure and saves `placement-research.md` without building |
| `/figma-sync [name] [url]` | Extracts Figma design and generates typed `.tsx` scaffold + `.stories.tsx` with all variants/states + Figma embed. Cross-references existing production components to avoid duplication. |
| `/figjam [description]` | Generates flowcharts, sequence diagrams, state machines, or Gantt charts directly in FigJam via Mermaid.js. Returns clickable FigJam URL. |
| `/visual-design [initiative]` | Generates 2–3 visual mockup directions per key screen (Familiar / Elevated / Distinctive), informed by competitive analysis and design brief. Saves `visual-directions.md` and mockup images. |

### Validation

| Command | What Actually Happens |
|---------|----------------------|
| `/validate [initiative]` | Checks phase graduation criteria (artifact checklists). Runs Condorcet Jury System: stratified sample of synthetic personas by role (Sales Rep 40%, Sales Leader 25%, CSM 20%, RevOps 15%) and AI adoption stage (always includes 15% skeptics). Each juror does: first impression, step-by-step task walkthrough, hesitation points, heuristic scores. Aggregates: ≥60% = Validated, 40–60% = Contested, <40% = Rejected. Saves to `initiatives/active/[name]/jury-evaluations/`, updates `_meta.json`. |
| `/iterate [initiative]` | Auto-pulls all linked signals newer than last update. Synthesizes feedback: merges problems, deduplicates feature requests by frequency, identifies deltas (validates/contradicts previous version). Updates PRD, design brief, prototype-notes. Builds full new `vN+1/` version. Deploys to Chromatic. |

### Design Workflows

| Command | What Actually Happens |
|---------|----------------------|
| `/design [name]` | Human-centric AI design review for trust, emotion, and accessibility — checks against AskElephant personas and guardrails |
| `/design-handoff [name]` | Design-to-engineering handoff documentation — specs, component mapping, token usage, interaction notes |
| `/design-system` | Explore and document AskElephant component library — maps components to Storybook, variants, and usage patterns |
| `/mockup` | Generate image mockups from description |

---

## Syncing & External Systems

### Notion (Product Command Center)

| Command | What Actually Happens |
|---------|----------------------|
| `/notion-admin audit` | Queries all Notion DBs, finds missing Linear links, orphaned/stale projects (30+ days), overdue launches |
| `/notion-admin projects` | CRUD on Notion Projects database — always fetches schema before updating |
| `/notion-admin launches` | Tracks feature flags, rollout percentages, success criteria in Launch Planning |
| `/notion-admin prd` | Creates/updates PRD pages in Notion, links to Launch Planning |
| `/notion-admin eow` | Creates End-of-Week sync pages auto-populated from active Build/Test projects |
| `/notion-admin flags` | Creates/updates Launch Planning entry for a project, records rollout percentage history |
| `/full-sync` | Bidirectional interactive sync — PM workspace ↔ Notion Projects DB, matched by `notion_project_id` in `_meta.json` |
| `/full-sync --subpages` | Creates PRD/Research/Design Brief child pages under each Notion project |
| `/sync-notion` | One-way pull: syncs Notion Projects, Engineering Specs, Design Briefs to PM workspace |

### Linear

| Command | What Actually Happens |
|---------|----------------------|
| `/sync-linear` | Syncs Linear projects, active cycles, and in-progress issues to PM workspace initiative files — updates `_meta.json` with Linear IDs and statuses |
| `/epd-triage` | Same as `/triage` but explicitly scoped to EPD/Product team |

### GitHub

| Command | What Actually Happens |
|---------|----------------------|
| `/sync-github` | Pulls merged PRs and release notes from GitHub — updates `status/` with what shipped |
| `/sync-dev` | Runs all three: `/sync-linear` + `/sync-github` + `/sync-notion` |

### Analytics (PostHog)

| Command | What Actually Happens |
|---------|----------------------|
| `/posthog audit` | Health-scores current PostHog setup: events, dashboards, feature flags, experiments, surveys, error tracking |
| `/posthog dashboard` | Creates initiative dashboard with trend/retention/funnel/engagement insights, links to `_meta.json` |
| `/posthog metrics` | Defines five-layer metrics map from PRD outcome chain, creates PostHog insights, identifies instrumentation gaps |
| `/posthog instrument` | Generates event naming plan (`domain:entity:action`), TypeScript implementation code, creates Linear ticket for engineering |
| `/posthog north-star` | Tracks "Workspaces with ≥3 successful workflow runs/week" trend |
| `/posthog health` | Workspace health scores (0–100) across Usage/Value/Trend/Fit/Technical — identifies at-risk and expansion candidates |
| `/posthog churn-risk` | Scores workspaces by leading churn signals: login drop, feature abandonment, NPS detractors, team shrinkage |
| `/posthog expansion` | Scores workspaces by upsell signals: seat ceiling, API limits, team growth, power users emerging |
| `/posthog cohorts` | Documents behavioral and property-based cohorts: Power Users, At-Risk, Value Tiers, persona roles |
| `/posthog alerts` | Configures proactive alerting: WAU drops, workflow failures, bot failures, error spikes |
| `/posthog question` | Ad-hoc PostHog query in natural language |
| `/posthog-sql` | Direct PostHog SQL query |
| `/availability-check` | Cross-references product updates and signals against PostHog feature flags to classify each feature as GA / Partial / Internal |

---

## Content & Documentation

| Command | What Actually Happens |
|---------|----------------------|
| `/feature-guide [name]` | Synthesizes Slack discussions, GitHub PRs, Linear issues, and initiative docs into a nine-section customer-facing feature guide: Overview, Who it's for, Where to find it, How it works, Q&A, Troubleshooting, Release notes snapshot, Known limitations, Internal references. Saved to `feature-guides/<slug>.md`. |
| `/pmm-video [name]` | Runs interactive intake (must-haves, tone, duration, CTA), validates outcome chain, creates `remotion-pmm/briefs/[name].json`, updates Remotion composition in `remotion-pmm/src/`. Returns render commands. |
| `/agents [path]` | Generates product-focused `AGENTS.md` for `elephant-ai` code — maps user flows, trust factors, error recovery, and AI agent guidelines for any component or feature directory |
| `/image` | Generate images from description using AI image generation |

---

## Workspace Administration

| Command | What Actually Happens |
|---------|----------------------|
| `/maintain audit` | Checks folder structure, `_meta.json` presence, index validity, phase consistency, staleness (initiatives >14d, hypotheses >30d), missing artifacts by phase, orphaned files. Saves to `maintenance/latest-audit.md`. |
| `/maintain fix` | Auto-repairs safe issues: regenerates missing `_meta.json`, stale indexes, missing `.gitkeep` |
| `/maintain sync` | Regenerates all derived files: `roadmap.json`, roadmap markdown/kanban/gantt, hypotheses `_index.json`, signals `_index.json` |
| `/maintain clean` | Identifies orphaned/old files — requires explicit confirmation before any deletion |
| `/admin` | Creates/updates `.cursor/` rules, commands, skills, and subagent definitions following Cursor format best practices |
| `/save` | `git add -A` + auto-generated commit message + `git push` |
| `/update` | Stash → pull main → update elephant-ai submodule → rebase → restore stash → install deps if changed |
| `/share` | Commit + push + create GitHub PR |
| `/setup` | One-time setup: Node check, git config, submodule init, npm install, creates personal branch, verifies Storybook |
| `/merge-initiative` | Compares two initiatives (doc presence matrix, overlap/conflict summary), asks approval, consolidates docs if approved |
| `/new-initiative [name]` | Creates full initiative folder structure with all template files |
| `/help` | Categorized command reference |

### Collaboration & Growth

| Command | What Actually Happens |
|---------|----------------------|
| `/collab` | Routes current work to the right stakeholder using org chart context |
| `/engineer-profile` | Generates AskElephant engineer profiles |
| `/think` | Guided brainstorming — asks probing questions, does NOT jump to solutions |
| `/reflect` | Structured values-aligned reflection (Purpose/Mastery/Growth/Empowerment) saved to `personal/reflections/` |

---

## Parallel Agent Teams

Use `/agent-team` or describe multi-faceted work to spin up coordinated parallel agents:

| Preset | Agents | What They Do in Parallel |
|--------|--------|--------------------------|
| `morning` | 3 | Slack scout + email triage + Linear triage |
| `research` | 4 | Customer signals + competitive + technical + devil's advocate |
| `review` | 3 | PRD reviewer + design reviewer + feasibility reviewer |
| `proto` | 5 | Design scout + prototype builder + feedback analyst + jury validator + iterator |

---

## Rules (Always Active)

Rules modify agent behavior automatically based on what files are open.

| Rule | When Active | What It Does |
|------|------------|--------------|
| `pm-foundation` | **Always** | Loads company context before any PM work. Routes natural language to correct commands. Enforces strategic alignment checklist (outcome chain, evidence, persona, anti-vision, trust). Pushes back on misaligned requests using a structured template. |
| `component-patterns` | When `elephant-ai/web/src/components/**` is open | Enforces component placement decisions (ui/ primitives vs. domain folders vs. standalone), barrel export conventions, prototype→production promotion path, Storybook title conventions |
| `cursor-admin` | When `.cursor/**` files are open | Switches to admin persona — suppresses PM context. Enforces correct YAML frontmatter format for rule/command/agent files. Advises minimal `alwaysApply: true` usage. |
| `remotion-video` | When `remotion-pmm/**` files are open | Enforces Remotion coding conventions: scene durations explicit, data-driven JSON props, brand-consistent output, copy concise and outcome-focused |
| `growth-companion` | On request | Personal resilience mode: `/think` (probing questions, no jumping to solutions), `/teach` (Socratic teach-back), `/reflect` (values-aligned reflection), `/unstick` (acknowledge difficulty → reframe → smallest next step) |

---

## MCP Server Map

| System | Server | What Agents Can Do |
|--------|--------|--------------------|
| **AskElephant API** | `ask-elephant` | Meeting intelligence, transcripts, contacts, CRM data from the product itself (SSE) |
| **Slack** | `composio` (tool router) | Read channels, search messages, fetch threads, check reactions, send messages |
| **Linear** | `composio` | List teams/states/issues/labels, create issues, add comments, update status |
| **Notion** | `composio` | Query databases, create/update pages, append blocks, search, full CRUD |
| **HubSpot** | `composio` | Search CRM objects, get deals/companies/tickets, retrieve owners |
| **Google** | `composio` | Gmail (fetch/label/draft/reply), Calendar (events), Tasks, Drive, Sheets |
| **GitHub** | `composio` / `gh` CLI | PRs, commits, branches |
| **Figma** | `composio` | Design extraction, variable definitions, FigJam diagram generation |
| **PostHog** | `mcp-posthog-zps2ir` | Dashboards, insights, feature flags, experiments, cohorts, surveys, event definitions |
| **Pylon** | `pylon` | Customer support tickets and conversations |

---

## Skills Reference (Loaded on Demand)

Skills are reusable procedural modules loaded into the agent's context when needed by a command.

| Skill | Loaded By | Core Capability |
|-------|-----------|----------------|
| `activity-reporter` | `/eod`, `/eow` | Aggregates GitHub + Linear + Slack + HubSpot into time-bounded activity reports |
| `agents-generator` | `/agents` | Product-focused AGENTS.md from code — user flows, trust factors, AI guidelines |
| `brainstorm` | `/brainstorm-board` | Structured divergent ideation with convergence |
| `competitive-analysis` | `/landscape` | Competitor profiles, UX screenshots, feature matrix, differentiation mapping |
| `daily-planner` | `/morning` | Synthesizes Calendar + Tasks + Slack + Linear into daily focus plan |
| `design-companion` | `/design`, `/design-handoff` | Human-centric AI design review: trust, emotion, accessibility |
| `digest-website` | `/publish-digest` | Generates shareable newspaper-style website from digest reports |
| `feature-availability` | `/availability-check` | Maps product updates against PostHog feature flags for customer visibility |
| `figma-component-sync` | `/figma-sync` | Figma URL → typed React components + Storybook stories |
| `github-sync` | `/sync-github` | Syncs merged PRs and releases to PM workspace |
| `initiative-status` | `/status` | Phase progress, artifact completeness, graduation readiness, health score |
| `jury-system` | `/validate` | Condorcet Jury evaluation with stratified synthetic personas |
| `linear-sync` | `/sync-linear` | Syncs Linear projects/cycles/issues to initiative files |
| `notion-admin` | `/notion-admin`, `/full-sync` | Full Notion V2 4-layer system management |
| `notion-sync` | `/sync-notion` | Syncs Notion Projects, specs, launch planning to workspace |
| `placement-analysis` | `/placement`, `/context-proto` | Analyzes real app structure to determine component placement |
| `portfolio-status` | `/status-all` | All-initiatives health matrix with prioritized action queue |
| `prd-writer` | `/pm` | Structured PRDs with outcome chains, alignment checks, and pushback |
| `prototype-builder` | `/proto`, `/lofi-proto` | Multi-direction Storybook prototypes with all AI states |
| `prototype-notification` | After `/proto` | Slack DM with Chromatic + FigJam + docs links |
| `remotion-video` | `/pmm-video` | Remotion PMM video scenes from initiative briefs |
| `research-analyst` | `/research` | Transcript analysis with strategic alignment checks |
| `roadmap-analysis` | `/roadmap` | Roadmap health, priorities, initiative scoring |
| `signals-synthesis` | `/synthesize` | Pattern detection across signals, hypothesis candidates |
| `slack-block-kit` | Any Slack-sending command | Formats Slack messages with Block Kit for polished output |
| `slack-sync` | `/eod`, `/eow` | Pulls Slack channel activity for reports |
| `team-dashboard` | `/team` | Real-time team status from Linear |
| `visual-design` | `/visual-design` | 2–3 visual directions per screen from design brief |
| `visual-digest` | `/visual-digest` | Branded visual posters/emails from activity reports |
| `skylar-component-explorer` | On request | Navigate and describe AskElephant component library |
| `skylar-design-review` | On request | 8-point design QA audit with scored report |
| `skylar-start-here` | On request | Get AskElephant app + Storybook running locally |
| `skylar-visual-change` | On request | Apply visual changes to components in plain language |

---

## Artifact Locations

| What | Where |
|------|-------|
| Company context | `pm-workspace-docs/company-context/` |
| Active initiatives | `pm-workspace-docs/initiatives/active/[name]/` |
| Signals | `pm-workspace-docs/signals/` |
| Research synthesis | `pm-workspace-docs/research/synthesis/` |
| Feature guides | `pm-workspace-docs/feature-guides/` |
| Hypotheses | `pm-workspace-docs/hypotheses/` |
| Roadmap | `pm-workspace-docs/roadmap/` |
| Status reports | `pm-workspace-docs/status/` |
| Slack digests | `pm-workspace-docs/status/slack/digests/` |
| Gmail digests | `pm-workspace-docs/status/gmail/digests/` |
| Runbooks | `pm-workspace-docs/runbooks/` |
| Maintenance | `pm-workspace-docs/maintenance/` |
| Prototypes | `prototypes/[Initiative]/v[N]/` |
| PMM videos | `remotion-pmm/briefs/` + `remotion-pmm/src/` |
