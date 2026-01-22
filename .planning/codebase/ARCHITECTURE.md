# Architecture

**Analysis Date:** 2026-01-21

## Pattern Overview

**Overall:** Layered Next.js application with dual execution systems (Agent-based job processing and Stage-based run execution)

**Key Characteristics:**
- Next.js 16 App Router with React 19 for UI
- PostgreSQL with Drizzle ORM for persistence
- Dual worker patterns: AgentExecutor for automated jobs and ExecutionWorker for stage automation
- React Query for client-side state and server synchronization
- Zustand for UI state management
- Real-time streaming via Server-Sent Events (SSE)
- Component-driven UI with Radix UI + Tailwind CSS v4
- Provider abstraction for pluggable AI backends (Anthropic, CLI)

## Layers

**Presentation Layer:**
- Purpose: User-facing React components and pages
- Location: `src/app/`, `src/components/`
- Contains: Pages, layouts, UI components, form dialogs, kanban board
- Depends on: React Query, Zustand store, hooks
- Used by: Browser clients

**API Layer:**
- Purpose: HTTP endpoints for client-server communication
- Location: `src/app/api/`
- Contains: Route handlers for workspaces, projects, jobs, documents, runs, artifacts
- Depends on: Database queries, execution systems
- Used by: Frontend via React Query

**Business Logic Layer:**
- Purpose: Core domain logic and business rules
- Location: `src/lib/`
- Contains: Database queries, job processing, execution orchestration, skills/rules
- Depends on: Database layer, Anthropic SDK, external integrations
- Used by: API routes, workers, components

**Execution Layer:**
- Purpose: Job and run processing systems
- Location: `src/lib/agent/`, `src/lib/execution/`
- Contains: AgentExecutor, ExecutionWorker, stage executors, providers
- Depends on: Database, Anthropic SDK, execution providers
- Used by: Background workers, API endpoints

**Data Layer:**
- Purpose: Database schema and queries
- Location: `src/lib/db/`
- Contains: Drizzle ORM schema, query builders, migrations
- Depends on: Drizzle ORM, PostgreSQL
- Used by: All business logic layers

**Integration Layer:**
- Purpose: External service connections
- Location: `src/lib/knowledgebase/`, `src/lib/git/`, `src/lib/skills/`, `src/lib/prototypes/`
- Contains: Knowledge base sync, git operations, skill definitions, prototype management
- Depends on: External APIs, filesystem
- Used by: Business logic and execution systems

## Data Flow

**Project Creation and Automation Flow:**

1. User creates workspace via UI → POST `/api/workspaces` → Database
2. Workspace created → Auto-triggers knowledge base sync → `syncKnowledgeBase()`
3. User creates project in kanban → POST `/api/projects` → Database + card appears
4. User triggers job (e.g., "Generate PRD") → POST `/api/jobs` → Creates Job record
5. Background worker polls → `getQueuedJobs()` → Executes via AgentExecutor
6. AgentExecutor calls Anthropic SDK with tools → Tool execution
7. Results streamed via SSE → Client receives updates
8. Job completes → Updates project metadata in database

**Stage Automation Flow (New):**

1. Project card moves to new stage in kanban UI
2. Triggers stage automation via ExecutionWorker (if enabled)
3. Card transitions to "waiting" status
4. ExecutionWorker:
   - Creates Run record with stage context
   - Polls for queued runs
   - Executes stage-specific automation (e.g., PRD generation)
   - Creates Artifacts (documents, code, etc.)
   - Records stage transition history
   - Updates card to completion/ready status
5. Real-time logs streamed to UI via streaming callbacks
6. Card locked during execution prevents dragging

**State Management:**

- **Server State:** PostgreSQL database via Drizzle ORM (workspaces, projects, documents, jobs, runs, artifacts)
- **Client State:**
  - React Query: API data caching and synchronization
  - Zustand store (`src/lib/store.ts`): Project cards, kanban columns, UI state
  - React component state: Local forms, dialogs, selections
  - LocalStorage: Display mode preferences

## Key Abstractions

**Project Card:**
- Purpose: Represents a product initiative moving through workflow stages
- Examples: `src/lib/store.ts`, `src/components/kanban/ProjectCard.tsx`
- Pattern: Immutable stage transitions, lock mechanism during processing

**Kanban Column (Stage):**
- Purpose: Workflow stage with visibility and automation rules
- Examples: inbox, discovery, prd, design, prototype, validate, tickets, build, alpha, beta, ga
- Pattern: Configurable per workspace, can enable/disable, auto-trigger jobs

**Job/Run:**
- Purpose: Autonomous work units (Job = legacy API-based, Run = new execution-based)
- Examples: `src/lib/db/schema.ts`, `src/lib/agent/executor.ts`, `src/lib/execution/run-manager.ts`
- Pattern: Queued → Running → Completed/Failed lifecycle

**Stage Executor:**
- Purpose: Stage-specific automation logic
- Examples: `src/lib/execution/stage-executors/{inbox|discovery|prd|design|prototype|validate|tickets}-executor.ts`
- Pattern: Each stage has dedicated executor with `executeStage(context)` interface

**Execution Provider:**
- Purpose: Pluggable backend for AI execution
- Examples: `AnthropicProvider` (hosted LLM), `CLIProvider` (local tooling)
- Pattern: Implements `ExecutionProvider` interface with `execute()` method

**Document:**
- Purpose: Project artifacts (PRDs, design briefs, specs, etc.)
- Examples: `src/lib/db/schema.ts`, generated via stage automation
- Pattern: Type-specific (PRD, design_brief, engineering_spec, gtm_brief, transcript, measurement_plan)

**Artifact:**
- Purpose: Run output (files, links, generated content)
- Examples: Generated code, design files, test results
- Pattern: Created by ExecutionWorker during stage automation, linked to runs

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to root URL
- Responsibilities: Workspace listing, workspace creation, project stats display

**Workspace Page:**
- Location: `src/app/(dashboard)/workspace/[id]/page.tsx` → `WorkspacePageClient.tsx`
- Triggers: User clicks workspace
- Responsibilities: Kanban board display, project management, job triggering, real-time updates

**Project Detail Page:**
- Location: `src/app/(dashboard)/projects/[id]/page.tsx` → `ProjectDetailPage.tsx`
- Triggers: User clicks project card
- Responsibilities: Project details, document display, job history, artifact viewing

**Background Worker (Agent):**
- Location: `src/worker.ts`
- Triggers: `npm run worker`
- Responsibilities: Poll pending jobs, execute via AgentExecutor, update database

**Background Worker (Execution):**
- Location: `src/execution-worker.ts`
- Triggers: `npm run execution-worker`
- Responsibilities: Poll queued runs, execute stage automation, stream logs, create artifacts

**API Routes:**
- Location: `src/app/api/**/route.ts`
- Triggers: HTTP requests from client or external services
- Responsibilities: CRUD operations, job creation, run management, document sync

## Error Handling

**Strategy:** Try-catch with structured logging, fallback responses, non-blocking error recovery

**Patterns:**

1. **API Error Responses:**
   ```typescript
   // Validation errors (400)
   { error: "Name is required" }

   // Not found (404)
   { error: "Project not found" }

   // Server errors (500)
   { error: "Failed to fetch projects" }
   ```

2. **Execution Error Handling:**
   - Job failures stored in database with error message
   - Run failures trigger retry logic via rescueStuckRuns()
   - ExecutionWorker logs errors to run_logs table
   - Client displays error via UI toast/notification

3. **Knowledge Base Sync Errors:**
   - Non-fatal during workspace creation (logs but doesn't fail)
   - Can be manually triggered via API
   - Stores sync results and errors in database

4. **Uncaught Exception Handling in Workers:**
   - Process.on("uncaughtException") triggers graceful shutdown
   - Process.on("unhandledRejection") triggers graceful shutdown
   - Heartbeat mechanism detects stuck workers, triggers rescue

## Cross-Cutting Concerns

**Logging:**
- Pattern: Console.log in development, structured logging in workers
- Example: `console.log(\`📊 Status: ...\`)` in worker status reporting
- Run logs: Stored in database via `addRunLog()` and streamed to UI

**Validation:**
- API: Required field checks (workspaceId, type, etc.)
- Database: Drizzle schema constraints (.notNull(), .references())
- Job creation: Valid job type enum checks

**Authentication:**
- Pattern: Not implemented (assumed single-tenant or internal deployment)
- Context: Workspace ID passed as parameter assumes implicit auth

**Rate Limiting:**
- Agent Worker: Configurable tokens/minute and requests/minute limits
- Execution Worker: Configurable max concurrent runs per workspace
- Example: 50 requests/min, 80K tokens/min in default config

**State Transitions:**
- Projects: Locked during active jobs (isLocked flag prevents dragging)
- Runs: Queued → Claimed → Running → Completed/Failed
- Cards: Transitions between stages tracked in stage_transitions table

**Workspace Settings Context:**
- WorkspaceSettings stores automation preferences: mode (manual/auto_to_stage/auto_all)
- Controls whether stage changes auto-trigger jobs
- Defines approval workflows and notification preferences
