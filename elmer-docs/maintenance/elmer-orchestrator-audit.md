# Elmer Orchestrator Audit (Parity + UX)

Date: 2026-01-28

## Scope

Audit current `orchestrator` against:

- PM workspace reference (`pm-workspace` repo)
- Voice memo requirements (project lifecycle, automation, UX)
- elmer product vision (glassmorphic, minimal, discovery compression)

## Sources Reviewed

- Voice memos: `elmer-docs/signals/voice-memos/memo-1.md` → `memo-7.md`
- PM workspace reference docs (GitHub):
  - `AGENTS.md`
  - `.cursor/commands/*` (`proto.md`, `pm.md`, `research.md`, `validate.md`, `iterate.md`)
  - `README.md`
- Orchestrator app (code + routes):
  - UI pages: `orchestrator/src/app/(dashboard)/workspace/[id]/*`, `projects/[id]/*`, `knowledgebase/*`, `personas/*`, `signals/*`, `settings/*`, `agents/*`, `commands/*`
  - APIs: `orchestrator/src/app/api/**`
  - Execution + integrations: `orchestrator/src/lib/**`, `orchestrator/src/lib/execution/**`

---

## Executive Summary

Elmer’s orchestrator covers the core workflow surface (workspace → kanban → projects → docs → jobs) but is **missing parity with the PM workspace command system** (especially analytics, syncs, admin/maintenance, and rich command editing). Several **critical UX gaps** block “world-class” feel: embedded prototypes, clear job execution feedback, functioning chat, and a glassmorphic visual system are not yet fully realized. Key integrations (PostHog, Notion, Jira, Linear sync workflows, Composio v2) are partial or stubbed, limiting end‑to‑end automation.

---

## Parity Matrix (PM Workspace → Orchestrator)

### A) Command/Workflow Parity

Status key: **Implemented / Partial / Missing**

- **/research** (transcript analysis → research.md): **Partial**
  - Orchestrator has signal ingestion and discovery pipeline, but lacks a direct “research command” UI/flow with strategic guardrails and explicit research artifact output.

- **/pm** (PRD + design/eng/gtm docs): **Partial**
  - Docs exist and editable; generation pipeline exists in stage executors, but no visible “/pm command” equivalent or explicit strategic alignment check UI.

- **/proto / /lofi-proto** (multi-direction prototypes + states + Flow\_\* + Chromatic): **Partial**
  - Prototype links exist; generation via jobs exists. Missing explicit multi‑direction outputs and Flow\_\* story coverage surfaced in UI.

- **/context-proto / /placement** (placement analysis + in‑app context): **Missing**
  - No explicit placement analysis UI or contextual prototypes tied to app components.

- **/validate** (jury evaluation + graduation criteria): **Partial**
  - Jury results UI exists, but graduation criteria linkage and gating is not enforced in UI.

- **/iterate** (auto‑pull signals + rebuild vN prototypes): **Missing**
  - No visible iteration pipeline tied to signals index with automatic versioning.

- **/ingest / /synthesize** (signal processing + patterns): **Partial**
  - Signal ingestion and clustering exist; synthesis output to a dedicated report is not surfaced as a first‑class artifact.

- **/status / /status-all / /roadmap**: **Missing**
  - No initiative health/status dashboard or portfolio view with artifact completeness matrix.

- **/hypothesis**: **Missing**
  - No hypothesis lifecycle UI or storage mapping.

- **/posthog** (analytics lifecycle): **Missing**
  - Metrics tab exists but is placeholder; no PostHog integration workflows or dashboards.

- **/figma-sync / /figjam**: **Missing**
  - No design system sync or diagram generation.

- **/admin / /maintain / /agents**: **Partial**
  - Agents list + architecture importer exists; no rule/command/skill edit surface comparable to pm‑workspace `/admin`.

- **/sync\* (linear/notion/github/dev/full-sync)**: **Missing**
  - GitHub integration exists; sync workflows are not implemented as end‑to‑end processes.

- **/eod / /eow / /slack-monitor / /visual-digest**: **Missing**
  - No reporting or Slack digest automation in UI.

### B) Artifact Parity (Initiative Folder)

Expected files (pm‑workspace): `research.md`, `prd.md`, `design-brief.md`, `engineering-spec.md`, `gtm-brief.md`, `prototype-notes.md`, `placement-research.md`, `METRICS.md`, `jury-evaluations/`, `_meta.json`.

- Research docs: **Partial** (signals and discovery exist; explicit research artifact not consistently mapped)
- PRD / Design / Eng / GTM docs: **Partial** (doc tabs exist; generation and completeness signals not surfaced)
- Prototype notes: **Partial** (prototype metadata exists, notes not emphasized)
- Placement research: **Missing**
- Metrics (PostHog): **Missing**
- Jury evaluations: **Partial** (UI exists, lifecycle gating not enforced)
- `_meta.json` and graduation criteria: **Missing** (no visible metadata management)

### C) Data Location / Repo Writeback Parity

PM‑workspace expects **all output to write into a connected GitHub repo**, not local app state.

- GitHub writeback exists but **partial**:
  - Projects can link to repo; content browsing exists.
  - No visible end‑to‑end workflow that writes all artifacts to repo paths.
  - No explicit submodule prototype path mapping (e.g., `elephant-ai/web/src/components/prototypes/`).

---

## Functionality Gaps (from Voice Memos + Parity)

### 1) Onboarding & Context Setup

- **Missing**: “Get‑stuff‑done” style onboarding chat that discovers repo structure, artifacts, context folders, and pipeline definition.
- **Partial**: GitHub connect + discovery exists but does not ask deep context questions or auto‑configure columns from `.cursor/`/`AGENTS.md`.
- **Missing**: Template path for users without a PM workspace repo.

### 2) Kanban Workflow & Automation

- **Partial**: Stage automation exists; **missing** explicit automation level controls per lane (hands‑off vs. human‑in‑loop) as a clear UI.
- **Missing**: Iteration loop visualization toggle with animated arrows or grouped loop lanes tied to validation dependencies.
- **Missing**: Confidence/quality scoring on project cards for prior stages (e.g., PRD confidence bar).

### 3) Command Parity & Agent Control

- **Missing**: UI for editing agent prompts / commands / rules (equivalent to `/admin`).
- **Missing**: Per‑column command list and AI summary of what each column does (editable).
- **Partial**: Agent architecture importer exists but not exposed as a live “agent control panel.”

### 4) Prototypes & Feedback

- **Partial**: Prototype links exist; **missing** embedded Chromatic/Storybook view in project page.
- **Missing**: Shareable stakeholder link flow with feedback capture and iteration triggers.
- **Missing**: Context prototypes in production UI (placement analysis + constrained design).

### 5) Jobs & Execution Visibility

- **Reported UX Bug**: Job status flickers between finished/processing.
- **Missing**: Live job logs visible from project card or job row; no transparent “what’s running now.”
- **Missing**: Job outputs linked to generated artifacts (what file was written, what changed).

### 6) Signals & Inbox

- **Partial**: Signals ingestion exists; **missing** “inbox as document staging” workflow for assigning transcripts to projects/personas.
- **Missing**: Webhook intake configuration for transcript sources (beyond Slack/Pylon).
- **Missing**: “Assign to project” triage flow as a core step.

### 7) Knowledgebase & Personas

- **Partial**: Knowledgebase supports editing; Personas appears read‑only.
- **Missing**: Persona create/save APIs and UX.
- **Missing**: Full mapping to pm‑workspace docs (e.g., org chart, company context variants).

### 8) Integrations

- **Partial**: GitHub, Chromatic hooks exist.
- **Missing**: Linear/Jira ticket creation with validation pass (ticket realism jury).
- **Missing**: Notion sync for documentation publishing.
- **Missing**: PostHog metrics lifecycle (alpha/beta/GA gating + auto‑move).
- **Missing**: GCP error metrics integration.

### 9) Release & Metrics Lifecycle

- **Missing**: Alpha → Beta → GA gating by metrics with auto‑advance.
- **Missing**: GA dashboard per project (PostHog insights + error telemetry + tickets).
- **Missing**: Sub‑initiative structure for feature iteration tied to parent metrics.

---

## UX / UI Gaps (World‑Class Experience)

### Visual System

- **Missing**: Glassmorphic depth system (layered translucent surfaces, weighted depth).
- **Missing**: Animated aurora / fiber‑optic background and ambient motion.
- **Missing**: Consistent “Apple‑demo” minimalism (currently dense and dashboard‑like).

### Interaction Quality

- **Missing**: Inline editing for all markdown docs with autosave and version clarity.
- **Missing**: Sidebar chat with contextual awareness and command execution.
- **Partial**: Navigation to project detail from card click not default.
- **Missing**: Embedded prototype player + in‑app feedback.

### Responsiveness & Polish

- **Unknown/likely partial**: Responsive layout for complex tables and settings.
- **Missing**: Empty/Loading/Success/Failure states for all views and job runs.

---

## Known Code‑Level Gaps (from Orchestrator)

These are explicit stubs/placeholder areas found in the current app:

- Metrics dashboard is a placeholder (no real data surface).
- Persona create/save APIs are not implemented.
- File save in Project Files tab is stubbed.
- Loom video support is marked “coming soon.”
- Integrations sync endpoint is stubbed.
- Re‑discover endpoint for onboarding is stubbed.
- Jury score enforcement TODO in stage executor.
- Composio SDK update TODO (v2).

---

## Coverage Checklist (What “100% Parity” Requires)

### Core Lifecycle

- [ ] End‑to‑end: transcript → research → PRD → design → prototype → validate → tickets → build → release
- [ ] Graduation criteria enforcement and visibility per phase
- [ ] Iteration loop automation with feedback integration

### Command & Agent System

- [ ] Full command parity with pm‑workspace (including status/roadmap/admin)
- [ ] Agent/command editing UI
- [ ] Command audit log per project (what ran, when, output)

### Data & Repo Mapping

- [ ] Repo‑first writeback for every artifact
- [ ] Submodule prototype output path mapping
- [ ] Multi‑repo support per workspace

### Integrations

- [ ] GitHub writeback + PR flows
- [ ] Linear/Jira ticket creation + validation
- [ ] PostHog metrics + alpha/beta/GA gating
- [ ] Notion sync for documentation
- [ ] Slack/HubSpot/Signals pipeline parity

### UX / Visual

- [ ] Glassmorphic UI + aurora background
- [ ] Embedded prototypes + feedback loop
- [ ] Sidebar chat w/ command execution
- [ ] Minimal information density with single‑context focus

---

## Recommended Next Actions (Audit → Roadmap)

1. **Define Parity MVP**: Choose which pm‑workspace commands are P0 for Elmer UI parity.
2. **Onboarding Revamp**: Build guided chat wizard that maps repo context and pipeline.
3. **Prototype Loop**: Embed Chromatic/Storybook + feedback capture + iterate pipeline.
4. **Metrics & Release**: Implement PostHog integration and alpha/beta/GA gating.
5. **Agent Control Center**: Create Commands/Agents admin UI (edit, run, audit).
6. **Visual System Pass**: Apply glassmorphic + animated background + typography system.
