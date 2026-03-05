# Multi-Agent + A2UI Phased Migration Plan

Date: 2026-02-01  
Status: Draft  
Owner: Tyler Sahagun

## Goal

Migrate the PM workspace from a Cursor-bound single-player system to a multi-agent, A2UI-aligned team experience using AI SDK 6, while preserving existing commands, research, and workflows.

## Guiding Principles

- Trust first: every agent action must be transparent and controllable
- Preserve existing command semantics (`/research`, `/proto`, `/validate`, `/eod`, `/ingest`)
- Ship value in phases with explicit go/no-go gates

## Phase 0: Pilot Definition (Weeks 1-2)

**Objective:** Prove outcome impact before full migration  
**Deliverables:** outcome chain, metrics baseline, scoped pilot  
**Exit Criteria:**

- Agreement on outcome metrics and success thresholds
- Pilot scope defined (2-3 high-value workflows)

## Phase 1: Foundation (Weeks 3-6)

**Objective:** Establish web app shell and data layer  
**Deliverables:**

- Auth + team model (single-tenant first)
- Core database schema (teams, users, agents, runs)
- Command-to-API mapping skeleton  
  **Exit Criteria:**
- Team login + workspace created
- API routes exist for top 3 commands

## Phase 2: AI SDK 6 Runtime (Weeks 7-10)

**Objective:** Implement agent runtime with AI SDK 6  
**Deliverables:**

- ToolLoopAgent-based agent definitions
- Typed UI streaming (`createAgentUIStreamResponse`, `useChat`)
- Structured outputs for planner/worker/judge  
  **Exit Criteria:**
- `/research` and `/proto` run end-to-end via API
- Structured output validated against schemas

## Phase 3: A2UI Core (Weeks 11-13)

**Objective:** Build A2UI interaction layer  
**Deliverables:**

- Agent presence badge
- Thinking transparency panel
- Action cards with tool approval flow  
  **Exit Criteria:**
- Tool approval UX tested and accepted
- Agent actions are fully auditable in UI

## Phase 4: Memory + Threads (Weeks 14-16)

**Objective:** Add persistent, searchable agent context  
**Deliverables:**

- Conversations and message threads
- Semantic memory storage (pgvector)
- Memory panel UI  
  **Exit Criteria:**
- Thread history persists across sessions
- Memory retrieval improves agent outputs (measured qualitatively)

## Phase 5: Orchestration + Teams (Weeks 17-20)

**Objective:** Enable multi-agent collaboration  
**Deliverables:**

- Agent teams + delegation rules
- Consensus mode for validation/jury flows
- Agent team panel UI  
  **Exit Criteria:**
- Multi-agent handoff works end-to-end
- Consensus outputs recorded and reviewable

## Phase 6: Integrations (Weeks 21-24)

**Objective:** Replace Cursor-bound MCP with direct integrations  
**Deliverables:**

- MCP OAuth + resources + prompts via @ai-sdk/mcp
- Slack/Linear/Notion connections  
  **Exit Criteria:**
- At least 2 integrations used in live workflows
- Tool calls are permissioned and auditable

## Phase 7: Hardening + Adoption (Weeks 25-26)

**Objective:** Reliability, performance, adoption readiness  
**Deliverables:**

- Observability via AI SDK DevTools
- Performance and cost tuning
- Team onboarding guide  
  **Exit Criteria:**
- P0 bugs resolved
- Pilot success metrics met

## Preservation Plan (Commands + Research)

- Map commands to API routes with the same input/output contracts
- Keep existing research files as the source of truth
- Add import pipeline for existing initiatives, signals, and personas

## Risks and Mitigations

- **Scope creep:** enforce go/no-go gates each phase
- **Trust regressions:** require tool approval for sensitive actions
- **Infra drag:** restrict to single-tenant MVP until outcomes prove value
