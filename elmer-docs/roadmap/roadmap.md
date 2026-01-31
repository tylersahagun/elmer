# Product Roadmap — Elmer Parity + UX

**Updated:** 2026-01-28

## North Star

Time from idea to validated prototype < 1 week, with minimal engineering rework.

## Product Goals (Next 90 Days)

1. Full parity with pm-workspace command workflows in Elmer UI.
2. World-class UX: glassmorphic design, embedded prototypes, clear job feedback.
3. Repo-first output: all artifacts written to connected GitHub repo(s).
4. Metrics lifecycle: PostHog-driven alpha → beta → GA gates.

---

## Roadmap Phases

Additions in this version are sourced from
`/.cursor/plans/elmer_complete_audit_a066b790.plan.md`.

### Phase 0 — Stabilize Foundations (Weeks 0-2)

**Outcome:** Core workflows feel reliable; no dead ends in UX.

**Scope**

- Fix job status flicker and show live execution logs.
- Make project card click open project detail by default.
- Wire missing stubs:
  - Persona save/create API
  - Project files save
  - Integrations sync endpoint
  - Re-discover endpoint
  - Metrics dashboard placeholder replacement (basic data wiring)
- Responsive design audit across all viewports (plan: `responsive-audit`).

**Milestones**

- Job execution clarity
  - Normalize job status transitions (no flicker on completed jobs).
  - Surface live logs in project context and job drawer.
  - Show current command name and active stage.
- Core navigation reliability
  - Make card click open project detail (default).
  - Ensure project detail loads with correct tab state.
- Stub completion pass
  - Persona create/save API wired to UI.
  - Project files save persists to repo path.
  - Integrations sync endpoint returns real status.
  - Onboarding re-discover endpoint functional.
  - Metrics dashboard wired to real data source (placeholder removed).
- Responsive QA
  - Audit kanban, project detail, settings, signals, knowledgebase.
  - Fix layout breakpoints and overflow.

**Success Metrics**

- 0 critical UI blockers in core flow (kanban → project → docs → prototype).
- Job state accuracy > 99% (no flicker or false resets).

**Dependencies**

- None (local UI/UX and API fixes).

---

### Phase 1 — Parity MVP (Weeks 2-6)

**Outcome:** Elmer can replace pm-workspace for core PM lifecycle.

**Scope**

- Onboarding wizard upgrades:
  - Repo discovery chat (context paths, initiatives, personas, signals)
  - Template option for new users without existing repo
  - Auto-configure columns from `.cursor/` + `AGENTS.md`
- Command parity surface:
  - Research → PRD → Design → Prototype → Validate → Tickets
  - Iterate with versioning (v1/v2)
  - Signals ingest/assign workflow
- Embedded prototypes in project view (Chromatic/Storybook iframe + feedback)
- Repo writeback for all artifacts (docs, prototype notes, jury outputs)
- Expand ChatSidebar to full 33-command parity (plan: `command-parity`).
- Add signal synthesis engine + hypothesis generation outputs (plan: `signal-synthesis`).
- Inbox redesign for documents/transcripts + assign to projects (plan: `inbox-redesign`).

**Milestones**

- Onboarding parity
  - Conversational context discovery step added.
  - Repo structure mapping saved as workspace config.
  - Template path for “no repo” users.
- Command surface parity
  - ChatSidebar supports all pm-workspace commands.
  - Commands execute against workspace context.
  - Command outputs saved to repo paths.
- Artifact writeback
  - PRD/Design/Eng/GTM docs written to repo.
  - Prototype notes + jury outputs written to repo.
  - Signals ingest writes to repo signals paths.
- Prototype loop in-app
  - Embed Storybook/Chromatic in project detail.
  - Feedback capture attaches to prototype version.
  - Versioned iteration (v1 → v2) surfaced in UI.
- Signals workflow
  - Inbox accepts documents/transcripts.
  - Assign to project or create new project from inbox.
  - Synthesis output creates hypothesis candidates.

**Success Metrics**

- 100% of artifacts written to repo paths.
- Full lifecycle from transcript → prototype validated in < 1 week.

**Dependencies**

- GitHub integration hardening.

---

### Phase 2 — Metrics + Release Lifecycle (Weeks 6-10)

**Outcome:** Alpha → Beta → GA is measurable and automated.

**Scope**

- PostHog integration:
  - Metrics definition per initiative (`METRICS.md`)
  - Alpha/Beta/GA gates based on thresholds
  - Metrics panel in project view
- Release health dashboard:
  - PostHog + error telemetry (GCP) surfaced per project
  - Auto-create follow-up sub-initiatives when metrics regress
- Build PostHog integration modes from pm-workspace (13 modes) (plan: `metrics-integration`).

**Milestones**

- Metrics definition lifecycle
  - Generate `METRICS.md` from PRD outcomes.
  - Map metrics to PostHog dashboards and events.
- Release gating
  - Alpha/Beta/GA gates with threshold rules.
  - Automated stage transitions with audit log.
- Health monitoring
  - Per-project metrics dashboard in UI.
  - Error telemetry integration (GCP) surfaced alongside usage.
- PostHog capability parity
  - Implement 13 PostHog modes (audit, dashboard, metrics, cohorts, alerts, instrument, question, instrument-check, north-star, health, aha-moment, churn-risk, expansion).

**Success Metrics**

- At least 1 initiative fully gated by PostHog metrics.
- GA projects show live usage and error metrics.

**Dependencies**

- PostHog integration + auth.

---

### Phase 3 — Advanced Workflow Parity (Weeks 10-16)

**Outcome:** Power-user parity with pm-workspace (admin, sync, automation).

**Scope**

- Full command parity UI:
  - `/admin` style editing of commands/rules/skills
  - Per-column command summary + editable automation
- Sync workflows:
  - Linear/Jira ticket creation + jury validation
  - Notion publishing for docs
  - Slack/HubSpot signal ingestion
- Context prototypes + placement analysis
- Activate Composio MCP integrations (Slack, Linear, Notion, HubSpot, PostHog) (plan: `mcp-integrations`).
- Auto-generate Linear tickets from validated prototypes (plan: `linear-tickets`).
- Implement full Condorcet Jury system with persona weighting (plan: `jury-system`).

**Milestones**

- Admin command center
  - Commands/rules/skills editable in UI.
  - Per-column command summary + edit flow.
  - Audit log of command changes.
- Integration parity
  - Composio MCP wiring for Slack/Linear/Notion/HubSpot/PostHog.
  - Sync workflows run end-to-end with status reporting.
- Ticket generation + validation
  - Linear/Jira ticket creation from validated prototypes.
  - Ticket ↔ prototype validation loop.
- Jury system parity
  - Condorcet jury with persona weighting and criteria gates.
  - Graduation criteria enforced per phase.
- Context prototypes
  - Placement analysis results stored in repo.
  - Context prototype view in project detail.

**Success Metrics**

- 80% of pm-workspace commands runnable from UI.
- 3+ external integrations active with real data flow.

**Dependencies**

- Composio SDK v2 update.

---

### Phase 4 — World-Class Experience (Weeks 16-24)

**Outcome:** “Apple demo” quality, minimal and delightful.

**Scope**

- Preserve the pseudo-dev macOS window aesthetic (traffic lights, terminal motif) aligned to SkillsMP.
- SkillsMP-style tag header navigation across views (Dashboard, Knowledge, Personas, Signals, Agents, Settings).
- Typography locked to Chillax + Synonym only.
- Responsive, dynamic layouts across desktop/tablet/mobile with consistent headers/backgrounds.
- Glassmorphic design system + aurora animated background.
- Sidebar chat that can run commands and navigate context.
- Iteration loop visualization (animated dashed wave + loop toggle).
- Project quality/confidence indicators per stage.
- Redesign Aurora background to fiber optic/northern lights animation (plan: `fiber-optic-bg`).
- Enhance iteration loop visualization with dependency arrows (plan: `iteration-loops`).
- Add stage confidence scores to project cards (plan: `confidence-scores`).

**Milestones**

- Visual system overhaul
  - Typography and spacing normalized for minimal density.
  - Preserve pseudo-dev macOS window aesthetic and SkillsMP tone.
  - Fonts limited to Chillax + Synonym only.
- Interaction excellence
  - Sidebar chat with full command execution.
  - Context-aware navigation suggestions.
- Responsive consistency
  - Tag header present on all pages with the defined tag list.
  - Consistent headers/shading/backgrounds across all views.
  - Mobile/tablet/desktop layouts verified.
- Iteration clarity
  - Loop visualization toggle + dependency arrows.
  - Loop grouping for sub-cycles (alpha/beta/GA).
- Confidence indicators
  - Per-stage confidence score and quality bar on cards.

**Success Metrics**

- UX score 9/10 in internal review.
- Time-to-understand each screen < 30 seconds for new users.

---

### Phase 5 — Full pm-workspace Parity (No Gaps)

**Outcome:** 100% functional parity with `pm-workspace` commands, artifacts, skills, and rules.

**Scope**

- Command parity completion (all remaining commands not explicitly covered):
  - Git workflow: `/save`, `/update`, `/branch`, `/share`, `/setup`
  - Status/portfolio: `/status`, `/status-all`, `/roadmap`
  - Growth/thinking: `/think`, `/teach`, `/reflect`, `/unstick`, `/collab`
  - Digests/reports: `/eod`, `/eow`, `/visual-digest`, `/publish-digest`
  - Design system/tools: `/design-system`, `/image`
  - Design sync: `/figma-sync`, `/figjam`
  - Admin/maintenance: `/maintain`, `/admin` (full behavior parity)
  - Measurement: `/measure`, `/availability-check`
  - Sync pipelines: `/sync`, `/sync-dev`, `/sync-notion`, `/sync-linear`, `/sync-github`, `/full-sync`
- Artifact parity completion:
  - `pm-workspace-docs/status/` outputs (activity reports, digests, sync reports)
  - `pm-workspace-docs/roadmap/` outputs + snapshots
  - `pm-workspace-docs/agents-docs/` AGENTS.md generation
  - `pm-workspace-docs/hypotheses/` lifecycle + index updates
  - `pm-workspace-docs/signals/_index.json` + synthesis reports
- Skills and subagent parity:
  - Implement missing skills (activity-reporter, portfolio-status, visual-digest, github-sync, linear-sync, notion-sync, design-companion, roadmap-analysis)
  - Implement missing subagents (figma-sync, figjam-generator, slack-monitor, workspace-admin equivalents)
  - Route all commands to appropriate skills/subagents with MCP tool wiring
- Rules parity:
  - Enforce `pm-foundation` style always-on behavior
  - Strategic alignment checks before PM work
  - Response conventions and file output guarantees

**Milestones**

- Command coverage audit
  - 100% pm-workspace commands mapped to UI + execution.
  - Command outputs verified in repo paths.
- Artifact structure parity
  - All pm-workspace file structures and indexes generated.
  - All outputs update indexes consistently.
- Skill/subagent execution parity
  - Skills/subagents execute with MCP integration parity.
  - Outputs match pm-workspace expectations.
- Rule enforcement parity
  - Always-on context enforcement validated in UI.
  - Strategic guardrails enforced in command execution.

**Success Metrics**

- 100% command coverage validated against pm-workspace.
- 100% artifact coverage validated against pm-workspace structure.
- Zero parity gaps in audit checklist.

## Initiative Backlog (Mapped to Phases)

### P0 (Must-ship in Phase 0-1)

**Milestone checklist**

- Job execution clarity
  - Normalize job status transitions (no flicker on completed jobs).
  - Surface live logs in project context and job drawer.
  - Show current command name and active stage.
- Core navigation reliability
  - Make card click open project detail (default).
  - Ensure project detail loads with correct tab state.
- Stub completion pass
  - Persona create/save API wired to UI.
  - Project files save persists to repo path.
  - Integrations sync endpoint returns real status.
  - Onboarding re-discover endpoint functional.
  - Metrics dashboard wired to real data source (placeholder removed).
- Onboarding parity
  - Conversational context discovery step added.
  - Repo structure mapping saved as workspace config.
  - Template path for “no repo” users.
- Command surface parity
  - ChatSidebar supports all pm-workspace commands.
  - Commands execute against workspace context.
  - Command outputs saved to repo paths.
- Prototype loop in-app
  - Embed Storybook/Chromatic in project detail.
  - Feedback capture attaches to prototype version.
  - Versioned iteration (v1 → v2) surfaced in UI.
- Signals workflow
  - Inbox accepts documents/transcripts.
  - Assign to project or create new project from inbox.
  - Synthesis output creates hypothesis candidates.
- Responsive QA
  - Audit kanban, project detail, settings, signals, knowledgebase.
  - Fix layout breakpoints and overflow.

### P1 (Phase 2)

**Milestone checklist**

- Metrics definition lifecycle
  - Generate `METRICS.md` from PRD outcomes.
  - Map metrics to PostHog dashboards and events.
- Release gating
  - Alpha/Beta/GA gates with threshold rules.
  - Automated stage transitions with audit log.
- Health monitoring
  - Per-project metrics dashboard in UI.
  - Error telemetry integration (GCP) surfaced alongside usage.
- PostHog capability parity
  - Implement 13 PostHog modes (audit, dashboard, metrics, cohorts, alerts, instrument, question, instrument-check, north-star, health, aha-moment, churn-risk, expansion).

### P2 (Phase 3-4)

**Milestone checklist**

- Admin command center
  - Commands/rules/skills editable in UI.
  - Per-column command summary + edit flow.
  - Audit log of command changes.
- Integration parity
  - Composio MCP wiring for Slack/Linear/Notion/HubSpot/PostHog.
  - Sync workflows run end-to-end with status reporting.
- Ticket generation + validation
  - Linear/Jira ticket creation from validated prototypes.
  - Ticket ↔ prototype validation loop.
- Jury system parity
  - Condorcet jury with persona weighting and criteria gates.
  - Graduation criteria enforced per phase.
- Context prototypes
  - Placement analysis results stored in repo.
  - Context prototype view in project detail.
- Visual system overhaul
  - Glassmorphic surfaces with consistent depth tokens.
  - Fiber-optic aurora animation background finalized.
  - Typography and spacing normalized for minimal density.
- Interaction excellence
  - Sidebar chat with full command execution.
  - Context-aware navigation suggestions.
- Iteration clarity
  - Loop visualization toggle + dependency arrows.
  - Loop grouping for sub-cycles (alpha/beta/GA).
- Confidence indicators
  - Per-stage confidence score and quality bar on cards.

---

## Risks & Mitigations

- **Risk:** Integration scope creep (Linear/Jira/Notion/PostHog).
  - **Mitigation:** Ship PostHog first; gate others to P2.
- **Risk:** Repo writeback conflicts.
  - **Mitigation:** Enforce atomic commits + preview diff.
- **Risk:** UX polish lagging feature work.
  - **Mitigation:** Phase 4 reserved for visual system + interaction quality.
