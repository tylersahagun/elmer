# Elmer: Pre-Roadmap Decisions

> Generated: 2026-03-05
> Linear Project: [Elmer](https://linear.app/askelephant/project/elmer-e42608f6079d/overview) — Created 2026-03-04, "Exploring" status, 1 issue (GTM-1: Internal comms spring cleaning)
> Purpose: Everything that must be decided before issuing the full milestone + issue breakdown

---

## Current State of the Project

The Linear project was created yesterday. It has:
- Status: Exploring
- Team: Operations (GTM)
- Lead: Tyler
- 1 issue (GTM-1, internal comms spring cleaning -- a separate signal)
- No milestones, no description, no target date

The architecture is fully designed across 11 documents. What remains before creating the full roadmap are 8 decisions, one of which is a critical architectural fork that changes the entire execution plan.

---

## The 8 Decisions (Must Resolve First)

### Decision 1 — CRITICAL: Convex vs. Incremental Architecture Path

**This is the fork that changes everything downstream.**

| Path | What It Means | Duration | End State |
|------|--------------|----------|-----------|
| **A: Incremental** | Keep PostgreSQL + workers. Fix MCP server to call REST API instead of SQLite. Add memory graph as new tables. Agents still mostly run via Cursor, Elmer provides visibility. | 13–17 weeks | Good, pragmatic, some Cursor dependency remains |
| **B: Convex Rebuild** | Replace entire backend (PostgreSQL → Convex, NextAuth → Clerk, workers → Convex Actions, SSE → useQuery). Keep all React UI components. | 14–18 weeks | Clean, fully server-side, no Cursor dependency for PM workflows, real-time is native |

**The difference is ~4 weeks up front for Path B, but you get:**
- True real-time with no polling hacks (Convex `useQuery`)
- No separate worker processes to deploy and monitor
- Native scheduling (no Vercel cron + CRON_SECRET)
- All agents run server-side with no Cursor session required
- The multi-agent visibility (concurrent agents on a project) works natively
- The HITL system works without someone being in Cursor

**Who needs to decide:** Tyler, with input from Ben on build capacity.

---

### Decision 2 — Deployment Target

**Where does Elmer deploy?**

| Option | Cost | Setup | Best For |
|--------|------|-------|---------|
| Vercel + Neon (if Path A) | ~$30-50/mo | 1 day | Fastest to get team access |
| Vercel + Convex (if Path B) | ~$50-100/mo | 2 days | Clean, serverless, real-time native |
| Railway | ~$20-40/mo | 2-3 days | More control, self-managed |
| Self-hosted VPS | ~$20/mo + ops | 1 week | Maximum control, highest maintenance |

**Recommendation:** Vercel + Convex (if Path B) or Vercel + Neon (if Path A). Lowest friction to team access.

**Who decides:** Tyler.

---

### Decision 3 — GitHub Access Method for pm-workspace Sync

**How does Elmer read from and write to pm-workspace and elephant-ai repos?**

The sync needs to:
- Read `.cursor/agents/`, `.cursor/skills/`, `.cursor/commands/`, `.cursor/rules/`
- Read `pm-workspace-docs/` recursively
- Write via git webhook (receive push events)
- Commit prototype code to elephant-ai

| Option | Pros | Cons |
|--------|------|------|
| **GitHub App** (recommended) | Fine-grained repo permissions, installable by org, works for any team member | Takes 1-2 hours to set up |
| **Personal Access Token** | Simplest to start | Tied to Tyler's account, breaks if rotated |
| **GitHub OAuth (existing)** | Already in Elmer's auth | User-scoped, not workspace-scoped; each user needs their own token |

**Recommendation:** GitHub App with repo read + write permissions on `pm-workspace` and `elephant-ai`. This is the right long-term path and only takes an afternoon to set up.

**Who decides:** Tyler (can be done in Phase 0).

---

### Decision 4 — Team That Owns Elmer in Linear

**Currently assigned to Operations (GTM team).** Given that Elmer is a PM + engineering tool that eventually becomes a product, this may need to move.

| Option | Makes Sense If |
|--------|---------------|
| Keep in Operations/GTM | Elmer is internal tooling, Tyler drives it |
| Move to Product/EPD | Elmer is a product, engineering will contribute |
| Create a new "Platform" team | Elmer gets its own identity |

**Who decides:** Tyler + Brian/Woody (depends on Decision 5).

---

### Decision 5 — Internal Tool vs. Product

**Is Elmer an internal PM tool or a product AskElephant ships to customers?**

This doesn't block Phase 0-2 work (foundation, agents, sync). But it affects:
- What gets hardcoded vs. per-workspace (already workspace-scoped, good)
- Whether multi-workspace is a priority
- Whether Elmer gets its own brand, domain, and pricing
- Who outside Tyler uses it (just AskElephant team vs. customers)

**Recommendation:** Build as product (multi-workspace already in schema), use internally first. Decide the external launch timing separately.

**Who decides:** Brian, Tyler, Woody.

---

### Decision 6 — Execution Mode for Agents That Write Code

**Three agents currently need local filesystem or complex code execution:**
- `figma-sync` — calls Figma MCP, generates React components
- `iterator` — iterates on prototype code
- `workspace-admin` — manages `.cursor/` config files

**With Path B (Convex), these become:**
- `figma-sync`: Figma REST API + GitHub API commit → fully server-side
- `iterator`: GitHub API read existing prototype + commit changes → fully server-side  
- `workspace-admin`: GitHub API to update `.cursor/` files + trigger sync → fully server-side

**The question:** Are you comfortable with agents committing code to repos directly via GitHub API without going through Cursor's code editing experience?

**The tradeoff:** Server-side execution is less interactive (you see the result, not the process) but works for the whole team without Cursor. Cursor mode is more interactive but requires Tyler to be present.

**Recommendation:** All agents server-side. The GitHub API commit pattern is already implemented in Elmer for document publishing. Extend it to prototype code.

---

### Decision 7 — Vector Strategy (if Path B)

**Convex doesn't support pgvector.** Signal clustering, semantic search, and `findSimilarSignals` currently use Neon + pgvector.

| Option | Complexity | Cost |
|--------|-----------|------|
| **Keep Neon as vector sidecar** (recommended) | Low — Convex Actions call Neon HTTP endpoint for embedding ops only | ~$0-20/mo for light use |
| Migrate to Pinecone | Medium — new service, new API | ~$20-70/mo |
| Migrate to Convex vector search | Low — but Convex's vector search is for text fields, not 1536-dim embeddings | May not support the full signal clustering use case |

**Recommendation:** Keep Neon as a thin sidecar. One small API service that handles embedding generation and cosine similarity queries. Everything else in Convex.

---

### Decision 8 — Convex Action Timeout Mitigation Pattern

**Convex Actions have a 10-minute wall-clock limit.** Most agents complete in under 5 minutes. But `prd-writer` (generates 4 documents), `validator` (runs 100-persona jury), and `prototype-builder` (complex code generation) could exceed this.

**Two patterns:**
- **State machine chunking:** One Convex Action per step, each step writes output to DB, schedules the next step. PRD generation becomes: `start → generate_research_summary → generate_prd → generate_design_brief → generate_eng_spec → generate_gtm → complete`. Each step is independent and resumable.
- **Streaming chunks:** Stream partial results to DB as they're generated, complete the action early, final assembly is a separate mutation.

**Recommendation:** State machine chunking. It's more explicit, easier to debug, and naturally supports the HITL pattern (a step can pause for human input, then resume).

**This needs to be designed per-agent before Phase 1 work begins on Path B.**

---

## What's Fully Resolved (No More Decisions Needed)

These are locked in across all 11 architecture documents:

| Area | Decision |
|------|---------|
| Memory graph | 5 new tables (graph_nodes, graph_edges, graph_observations, graph_communities, graph_events), Sven-style learning, pgvector in Neon sidecar |
| Notion | Read-only downstream. One-way push from Elmer. No more bidirectional sync. |
| Ansor | Replaced by Elmer's memoryEntries + graph |
| elephant-ai submodule | `product-repos/elephant-ai/` in Elmer. Elmer owns metadata, elephant-ai owns code. Sync before prototype sessions. |
| Prototype variants | Storybook/Chromatic canonical + nano-banana, v0, Magic Patterns, Figma Make, Replit variants in `prototype_variants` table |
| MCP architecture | 95 tools total (P0: 46, P1: 20, P2: 6, PM workspace: 23). UI = MCP principle. |
| MCP Apps | 8 priority apps, pragmatic hybrid (native React Kanban + MCP Apps for cross-surface views) |
| Model routing | `.cursor/` frontmatter (haiku/sonnet/inherit) → synced to `executionProfile` in DB → resolved at execution time |
| Composio server-side | Already works via SDK. Same tools as Cursor MCP, different transport. |
| New tool services needed | Brave Search API (web search), Browserless.io (screenshots), sandbox service for CLI tools (nano-banana) |
| pm-workspace migration | Phase A (Elmer reads from GitHub), Phase B (write-through to Elmer DB), Phase C (pm-workspace-docs becomes export) |
| Document types | 14 types: existing 9 + feature_guide, competitive_landscape, success_criteria, gtm_plan, retrospective |
| Task persistence | New `tasks` table in Convex. Tasks link to agents, documents, signals. |
| Signal inbox | Auto-TL;DR + impact score on ingest. Direction change detection. Vision update proposals. |
| Project TL;DR | Machine-generated 4-sentence TL;DR per project, in system prompt context for all agents |
| HITL mechanism | `pendingQuestions` table, inline choice cards in Elmer UI, resume execution on answer |

---

## The Pre-Roadmap Checklist

Before creating the Linear milestone/issue breakdown:

```
□ 1. Decide: Convex rebuild (Path B) or incremental (Path A)?  [Tyler + Ben]
□ 2. Decide: Deployment target (Vercel + Convex recommended)?  [Tyler]
□ 3. Decide: GitHub App setup for pm-workspace + elephant-ai?  [Tyler -- afternoon task]
□ 4. Decide: Which Linear team owns Elmer?  [Tyler + Brian/Woody]
□ 5. Decide: Internal tool only or product roadmap?  [Brian, Tyler, Woody]
□ 6. Confirm: All agents server-side via GitHub API commits?  [Tyler]
□ 7. Confirm: Neon as vector sidecar (Convex path only)?  [Tyler]
□ 8. Confirm: State machine chunking for long-running agents?  [Tyler + Ben]
```

**Once Decisions 1 and 5 are made, the full roadmap can be issued.**

- If **Path A (incremental):** 6 phases, 13–17 weeks, mostly Tyler driving with Ben reviewing
- If **Path B (Convex):** 7 phases, 14–18 weeks, needs dedicated engineering time (Tyler or contracted)

The issue and milestone structure in Linear will be significantly different depending on this choice.
