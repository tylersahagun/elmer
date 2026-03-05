# Elmer Audit: Option 3 Readiness Assessment

> Generated: 2026-03-04
> Purpose: Honest audit of Elmer's actual state, what to keep/remove/fix, and what must be true for Option 3 (hybrid) to work

---

## Correction from Earlier Analysis

The earlier assessment underestimated Elmer. Key corrections:

1. **The main orchestrator uses PostgreSQL, not SQLite.** The SQLite reference was only for the separate `mcp-server/` package. The orchestrator itself is fully PostgreSQL with Drizzle ORM, pgvector, and 18 applied migrations.

2. **API routes are almost entirely working.** Out of ~120 route files, only 1 is broken (`/api/webhooks/signals/[key]` calls a non-existent endpoint). Everything else has real implementations backed by DB queries.

3. **All 9 project detail tabs work.** Documents, Signals, Prototypes, Files, Metrics, History, Validation, Tickets, and Commands all connect to real backends.

4. **Signal processing works end-to-end.** Create, classify (embeddings + LLM), cluster, link to projects, find duplicates, find orphans, merge, archive, suggest -- all real code.

5. **Agent execution exists and works** -- for the `execute_agent_definition` job type. The agent executor uses Anthropic SDK with prompt caching and a real tool set.

---

## What to Keep

### Core (do not touch)

| Component | Why Keep | State |
|-----------|---------|-------|
| **PostgreSQL schema** (30+ tables) | Comprehensive data model that covers everything PM workspace needs | 18 migrations applied, schema is stable |
| **Drizzle ORM + queries** | ~100 working query functions in `lib/db/queries.ts` | Only 2 unused (`getWorkspaces`, `getProjectMemory`) |
| **Signal processing pipeline** | End-to-end: create -> extract -> embed -> classify -> cluster -> link -> maintain | Working with OpenAI embeddings + Anthropic extraction |
| **Job system** (worker + executor) | Background job processing with polling, SSE logs, status tracking | Auto-starts with Next.js, configurable concurrency |
| **Agent executor** | Real Anthropic SDK integration with tool use and prompt caching | Handles `execute_agent_definition` jobs |
| **Execution worker** | Stage automation with recipe steps, gates, and providers | Separate process, needs `npm run execution-worker` |
| **Webhook handlers** | Slack Events API, Pylon, generic signal ingest with HMAC auth | 4 of 5 routes working |
| **Cron endpoints** | Signal automation (hourly) + maintenance (daily) | Protected by `CRON_SECRET` |
| **Maintenance module** | Orphan detection, duplicate detection (via embeddings), archival, merge | Used by signal routes and cron |
| **Classification module** | Two-step classifier (embedding match + optional LLM), clustering | Used by signal processing |

### UI (keep and extend)

| Component | Why Keep | State |
|-----------|---------|-------|
| **Kanban board** | Drag-and-drop with dnd-kit, real-time job status, column automation | Connected to DB, zustand store |
| **Project detail** (9 tabs) | Documents, Signals, Prototypes, Files, Metrics, History, Validation, Tickets, Commands | All tabs wired to real backends |
| **Agents page** | Lists agent definitions by type, enable/disable, execution panel | Real DB data, execution creates jobs |
| **Signals page** | Table with filters, create/edit/delete, AI suggestions, orphans, clusters, bulk operations | End-to-end working |
| **Knowledge base** | Categories (company-context, personas, roadmap, etc.), file view/edit | Reads/writes via API |
| **Chat sidebar** | AI assistant with slash commands, job creation | Working with Anthropic SDK |
| **Settings** (8 tabs) | General, Pipeline, Execution, Automation, Admin, Integrations, Team, Activity | Most settings persist and affect behavior |
| **SSE real-time** | Job status stream, job log stream, discovery stream | Adaptive polling, auto-reconnect |
| **Notification inbox** | Job notifications, mark read, navigate | Working |
| **Zustand stores** (6) | Kanban, UI, Tour, Onboarding, Discovery, Conversation | All implemented and used |

---

## What to Remove

| Component | Why Remove | Size |
|-----------|-----------|------|
| **`lib/queue/`** | Dead code. `dequeueJob`, `getReadyJobs`, `markJobDelayed` are never imported. Worker polls DB directly. | Small |
| **`@tiptap/extension-bubble-menu`** | Not imported anywhere | Dependency only |
| **`@tiptap/extension-floating-menu`** | Not imported anywhere | Dependency only |
| **`@tiptap/extension-code-block-lowlight`** + `lowlight` | Not imported; StarterKit code block used instead | Dependencies only |
| **`rehype-highlight`** | Not imported in source | Dependency only |
| **`motion`** (separate from `framer-motion`) | Redundant; `framer-motion` is the one actually used | Dependency only |
| **Home page hardcoded stats** | Stats (5, 12, 8, 24) are not from real data. Replace with real workspace queries or remove. | Cosmetic |

---

## What to Fix

### Critical Fixes (Block Option 3)

| Issue | Details | Fix | Effort |
|-------|---------|-----|--------|
| **MCP server uses SQLite** | `mcp-server/` is a separate package with `better-sqlite3`. It does NOT access the PostgreSQL database. Agents calling Elmer MCP tools get a completely different data store. | Rewrite MCP server to call orchestrator REST API (or use Drizzle against the same PostgreSQL) | 1-2 weeks |
| **13 MCP tools are stubs** | generate-prd, generate-design-brief, analyze-transcript, run-jury-evaluation, etc. all return instruction templates | Either: (a) make them call the orchestrator's `/api/ai/generate` which already works, or (b) remove stubs and let Cursor agents use the REST API directly | 1 week |
| **Embedding vector gap** | `updateSignalProcessing` writes to `embedding` (base64 text) but pgvector queries use `embedding_vector`. New signals aren't findable by similarity search until `migrate-vectors.ts` runs. | Wire `processSignalExtraction` to write to both columns, or run migration as post-processing hook | 2-3 days |
| **Broken webhook route** | `POST /api/webhooks/signals/[key]` calls `/api/signals/${signal.id}/process` which doesn't exist | Call `processSignalExtraction(signal.id)` directly instead of the missing API route | 1 hour |

### Important Fixes (Should Do for Option 3)

| Issue | Details | Fix | Effort |
|-------|---------|-----|--------|
| **Agent execution tracking is narrow** | Only `execute_agent_definition` jobs create execution records. Other job types (generate_prd, run_jury, etc.) don't. | Expand `executeJob` to create execution records for all job types | 2-3 days |
| **Auth gaps on routes** | `/api/knowledgebase`, `/api/jobs/process`, `/api/jobs/[id]`, `/api/chat` have no `requireWorkspaceAccess` | Add auth middleware | 1-2 days |
| **Signal detail modal doesn't refresh table** | `onUpdate={() => {}}` means edits in the modal don't invalidate the signals query | Add query invalidation callback | 1 hour |
| **Execution worker not auto-started** | Requires separate `npm run execution-worker` process. Not integrated with Next.js startup. | Either auto-start like the job worker, or document as required process | 1 day |
| **Docker port mismatch** | docker-compose maps `5433:5432` but README/.env.example say `localhost:5432` | Update documentation to use port 5433 | 30 min |
| **`getProjectMemory` unused** | Query function exists but nothing imports it | Remove or wire into memory routes | 30 min |

---

## What Must Be True for Option 3

Here are the prerequisites, organized as a decision checklist. Every item needs a "yes" before committing.

### Infrastructure Prerequisites

| # | Question | Current State | Required State | Effort to Close |
|---|----------|--------------|---------------|----------------|
| 1 | Can Cursor agents read/write to Elmer's PostgreSQL database? | No. MCP server uses separate SQLite. | MCP server talks to PostgreSQL (same DB as UI). | 1-2 weeks |
| 2 | Is Elmer deployed and accessible to the team? | Unknown. Local dev only confirmed. | Deployed (Vercel/Railway/VPS) with PostgreSQL (Neon or hosted). | 1-2 days if Vercel + Neon |
| 3 | Can team members log in and see projects? | Auth works (NextAuth + Google OAuth). Members/invitations work. | Team accounts created, workspace invitations sent. | 1 hour |
| 4 | Is the job worker running reliably? | Auto-starts with Next.js dev. Production deployment unknown. | Worker running in production with monitoring. | Depends on hosting |
| 5 | Are webhooks reachable from external services? | Slack, Pylon handlers work locally. Need public URL. | Deployed with SSL, webhook URLs configured in Slack/Pylon. | 1 day |

### Data Migration Prerequisites

| # | Question | Current State | Required State | Effort to Close |
|---|----------|--------------|---------------|----------------|
| 6 | Is PM workspace data seeded into Elmer? | Empty database (or prior test data). | All active initiatives imported as projects, documents imported, company context in knowledge base. | 2-3 days |
| 7 | Is the agent architecture imported? | Agent sync from GitHub exists and works. | PM workspace agents, skills, commands, rules synced into `agent_definitions`. | 1 hour (run sync) |
| 8 | Are signals migrated? | Empty or test signals. | Existing `signals/_index.json` and signal files imported. | 1-2 days |
| 9 | Is company context in the knowledge base? | Knowledge base CRUD works. | `product-vision.md`, `strategic-guardrails.md`, `personas.md`, `org-chart.md` imported. | 1 hour |

### Agent Integration Prerequisites

| # | Question | Current State | Required State | Effort to Close |
|---|----------|--------------|---------------|----------------|
| 10 | Can `pm-foundation` rule load context from Elmer? | Loads from local files only. | Loads from Elmer MCP `get-company-context` with local file fallback. | 3-5 days |
| 11 | Can agents write outputs to Elmer? | Agents write to local files only. | Key agents (signals-processor, research-analyzer, validator) write to Elmer via MCP + keep local copies. | 1-2 weeks |
| 12 | Does `_meta.json` sync with Elmer projects? | No connection. | Elmer project state is source of truth; `_meta.json` is a local cache updated via write-through. | 1 week |
| 13 | Can Elmer push to Notion? | No Notion push. `/notion-admin` in PM workspace is separate. | One-way Elmer -> Notion push for team visibility. Replaces bidirectional `/full-sync`. | 1 week |

### New Feature Prerequisites

| # | Question | Current State | Required State | Effort to Close |
|---|----------|--------------|---------------|----------------|
| 14 | Can I see agent execution traces? | `agentExecutions` table exists; only `execute_agent_definition` tracked. | All agent runs tracked with input, output, tokens, duration, tool calls. Trace viewer in UI. | 2-3 weeks |
| 15 | Is there an orchestrator proposing next actions? | No orchestrator. | Orchestrator watches project state, proposes next command, waits for approval. | 2-3 weeks |
| 16 | Do agents have guardrails? | `strategic-guardrails.md` is philosophical. `hubspot-activity` has `disallowedTools`. | Per-agent cost caps, recursion limits, permission scoping enforced by harness. | 1-2 weeks |
| 17 | Can agents run on schedule? | Cron endpoints exist for signals and maintenance. No agent scheduling. | Morning planner, EOD, EOW run on schedule via cron -> job creation. | 3-5 days |
| 18 | Are there MCP Apps for inline visualization? | None. | 3-5 MCP Apps for initiative dashboard, signal map, jury viewer. | 2-3 weeks |

---

## Phased Implementation for Option 3

### Phase 0: Foundation (1 week)

**Goal: Elmer runs and has real data.**

- [ ] Deploy Elmer (Vercel + Neon PostgreSQL, or Railway + managed Postgres)
- [ ] Run migrations, set up env vars
- [ ] Create workspace, invite Tyler
- [ ] Import PM workspace agent architecture (run `/api/agents/sync`)
- [ ] Import company context into knowledge base
- [ ] Import active initiatives as projects
- [ ] Fix Docker port documentation
- [ ] Fix broken webhook route (`/api/webhooks/signals/[key]`)
- [ ] Remove dead code (`lib/queue/`, unused deps)

**Validation:** Log into Elmer, see projects on Kanban, browse knowledge base, see agent definitions.

### Phase 1: MCP Bridge (2 weeks)

**Goal: Cursor agents can read/write Elmer's real database.**

- [ ] Rewrite `mcp-server/` to call orchestrator REST API instead of SQLite
- [ ] Implement real MCP tools: `get-project-details` (calls `/api/projects/[id]`), `save-document` (calls `/api/documents`), `get-company-context` (calls `/api/knowledgebase`), `create-signal` (calls `/api/signals`), `store-memory` (calls `/api/memory`)
- [ ] Remove stub MCP tools that duplicate what Cursor agents already do well (generate-prd, analyze-transcript, etc.)
- [ ] Fix embedding vector gap (write to both `embedding` and `embedding_vector`)
- [ ] Add `elmer` MCP server to PM workspace `.cursor/mcp.json`
- [ ] Test: run `/status` and verify it reads initiative state from Elmer

**Validation:** Agent reads project from Elmer, creates signal in Elmer, stores memory in Elmer. All visible in Elmer UI.

### Phase 2: Write-Through (2 weeks)

**Goal: Agents use Elmer as source of truth while keeping local files as cache.**

- [ ] Update `pm-foundation` rule to load company context from Elmer MCP with local fallback
- [ ] Update `signals-processor` to write signals to Elmer + local `signals/` folder
- [ ] Update `research-analyzer` to write research.md to Elmer documents + local file
- [ ] Update `validator` to write jury verdict to Elmer + local `jury-evaluations/`
- [ ] Update `prd-writer` skill to write PRD to Elmer documents + local file
- [ ] Build `_meta.json` sync: Elmer project state -> local `_meta.json` (one-way, on-demand)
- [ ] Expand agent execution tracking to all job types
- [ ] Add auth middleware to unprotected routes

**Validation:** Run `/research`, `/pm`, `/validate` -- outputs appear in both Elmer UI and local files. Team member logs into Elmer and sees research output.

### Phase 3: Team Access + Observability (2-3 weeks)

**Goal: Team can see everything. Tyler can debug agent behavior.**

- [ ] Invite team members (Rob, Ben, Kenzi, Adam) with appropriate roles
- [ ] Build one-way Elmer -> Notion push for initiative status
- [ ] Build execution trace viewer: expand `agentExecutions` to capture tool calls, add timeline view in UI
- [ ] Add execution dashboard: queue depth, recent runs, failure rate, token usage
- [ ] Wire SSE job logs to execution traces
- [ ] Set up webhook URLs in Slack and Pylon for production

**Validation:** Rob opens Elmer, sees initiative roadmap and latest research. Tyler opens execution viewer, sees trace of last `/validate` run with all tool calls.

### Phase 4: Orchestration + Autonomy (2-3 weeks)

**Goal: Agents can be triggered by events and propose next actions.**

- [ ] Build orchestrator: watches Elmer project state, checks artifact completeness, proposes next command
- [ ] Wire scheduled execution: `/morning` at 8am, `/eod` at 5pm, `/eow` Friday via cron -> jobs
- [ ] Wire Slack webhook -> signal ingestion -> classification -> auto-link to projects
- [ ] Add per-agent guardrails: cost caps, recursion limits, permission scoping
- [ ] Build agent harness: retry on failure, timeout management, error notification
- [ ] Add confidence thresholds for HITL escalation

**Validation:** Slack message in #product-feedback auto-creates signal, classifies it, links to project, notifies Tyler. EOD report runs automatically at 5pm.

### Phase 5: Visualization + Evals (2-3 weeks)

**Goal: 10/10 across AX framework.**

- [ ] Build 3-5 MCP Apps: initiative dashboard, signal map, jury viewer, execution trace, memory browser
- [ ] Build agent evaluation framework: trajectory testing for key workflows
- [ ] Add quality gates: agent definition changes require eval pass
- [ ] Add autonomous loop capability: circuit breakers, rate limiting, exit conditions
- [ ] Add session replay: re-run an agent execution with modified inputs

**Validation:** Run `/synthesize` in Cursor, see inline signal map MCP App. Run agent evals in CI, block deploy on quality regression.

---

## Cost/Benefit Summary

| Investment | What You Get |
|-----------|-------------|
| **Phase 0** (1 week) | Elmer running with real data; team can log in |
| **Phase 0+1** (3 weeks) | Agents read/write to shared database; signals and research visible to team |
| **Phase 0+1+2** (5 weeks) | Full write-through; Elmer is source of truth; local files are cache |
| **Phase 0+1+2+3** (7-8 weeks) | Team collaboration; execution observability; Notion downstream |
| **All phases** (14-16 weeks) | AX 10/10; autonomous execution; MCP Apps; agent evals |

The critical question: **how much of this do you need before it's useful?**

- Phase 0+1 alone makes Elmer useful for signal visibility and team access.
- Phase 0+1+2 makes it the actual source of truth.
- Everything after that is incremental improvement toward full automation.

---

## What Elmer is NOT Good At (and Shouldn't Try)

| Capability | Why Elmer Shouldn't Own It |
|-----------|--------------------------|
| **Prototype code execution** | Prototypes are React components in `elephant-ai/`. They need Storybook, Chromatic, and a real codebase. Elmer can track prototype metadata, not run Storybook. |
| **Cursor IDE interaction** | Agents run in Cursor. Elmer orchestrates and stores; Cursor executes. Don't try to replace the IDE. |
| **Full Notion replacement** | Elmer is a PM command center and agent platform, not a general-purpose wiki. Notion stays for docs the team creates directly. |
| **Linear replacement** | Linear is the engineering work tracker. Elmer consumes Linear data; it doesn't replace the sprint board. |
| **Real-time pair programming** | Elmer is not Figma or Google Docs. Collaboration is async: one person writes, others view. |
