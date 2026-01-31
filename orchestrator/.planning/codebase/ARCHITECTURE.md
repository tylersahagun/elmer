# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Next.js full-stack layered architecture with Next.js App Router for UI/API, Drizzle ORM for database abstraction, and durable task-based execution worker for stage automation.

**Key Characteristics:**
- Modern React 19 + Next.js 16 full-stack framework
- PostgreSQL-backed with Drizzle ORM (supports serverless and standard deployments)
- Separation of concerns: API routes handle requests, `/lib` contains business logic, `/components` contains React UI
- Task-based stage execution system with verification, gates, and atomic commits
- Real-time execution streaming with server-sent events
- Workspace-scoped multi-tenancy throughout database schema

## Layers

**Presentation Layer:**
- Purpose: React components for dashboard UI, modal dialogs, and real-time displays
- Location: `src/components/`, `src/app/(dashboard)/`
- Contains: React components (TSX), hooks, UI primitives (Radix), animation components
- Depends on: React Query for data fetching, Zustand for client state, NextAuth for session
- Used by: Browser clients via Next.js server-side rendering

**Page/Route Layer:**
- Purpose: Next.js App Router pages and layouts defining user-facing flows
- Location: `src/app/(dashboard)/`, `src/app/login/`, `src/app/signup/`
- Contains: Page components, layout wrappers, auth guards
- Depends on: API routes via fetch, useQuery hooks, hooks for real-time data
- Used by: Browser navigation

**API Layer:**
- Purpose: RESTful HTTP endpoints handling all client requests and webhooks
- Location: `src/app/api/`
- Contains: Route handlers (route.ts) organized by resource (signals, projects, workspaces, etc.)
- Depends on: `/lib` services for business logic, Drizzle ORM for data access
- Used by: Frontend via fetch(), webhooks from external services
- Pattern: Each route.ts implements GET, POST, PATCH, DELETE as needed
- Error handling: Permission checks (`requireWorkspaceAccess`), standard HTTP status codes

**Business Logic Layer:**
- Purpose: Core business domain logic, isolated from HTTP concerns
- Location: `src/lib/` (services, helpers, managers)
- Contains: Query builders, execution orchestration, signal processing, validation
- Depends on: Database layer, AI providers, external integrations
- Used by: API layer, execution workers
- Examples:
  - `src/lib/execution/` - Stage executors, run manager, verification
  - `src/lib/signals/` - Signal ingestion and processing
  - `src/lib/github/` - GitHub integration helpers
  - `src/lib/ai/` - AI provider abstractions (embeddings, extraction)
  - `src/lib/automation/` - Signal automation and rate limiting

**Data Access Layer:**
- Purpose: Database queries, schema definition, type inference
- Location: `src/lib/db/`
- Contains:
  - `schema.ts` - Drizzle table definitions with TypeScript inference
  - `queries.ts` - Prepared queries for common operations
  - `index.ts` - Database connection pooling (detects Neon vs standard PostgreSQL)
- Depends on: Drizzle ORM, PostgreSQL
- Used by: All services and API routes

**Execution Worker Layer:**
- Purpose: Background process for durable stage automation
- Location: `src/execution-worker.ts`, `src/lib/execution/worker.ts`
- Contains: Worker loop, run polling, failure recovery
- Depends on: Run manager, stage executors, database
- Runs: As separate Node.js process (npm run execution-worker)
- Features: Heartbeat tracking, stuck-run rescue, concurrent execution limits

## Data Flow

**Signal Ingestion Flow:**

1. External signal arrives (webhook, upload, or API)
   - Location: `src/app/api/signals/ingest/route.ts` or `src/app/api/signals/upload/route.ts`
2. Signal extracted/normalized
   - Location: `src/lib/signals/processor.ts` → `processSignalExtraction()`
3. Vector embedding generated
   - Location: `src/lib/ai/embeddings.ts` → AI provider call
4. Inserted into database with status "new"
   - Location: Database `signals` table
5. Background: Clustering detects similar signals
   - Location: `src/lib/classification/clustering.ts`
6. Suggestions created for user review
   - Location: `src/lib/signals/processor.ts` → suggestion creation

**Project Stage Execution Flow:**

1. User initiates or automation triggers stage transition
   - Location: `src/app/api/projects/[id]/stage` or cron job
2. Stage run created with queued status
   - Location: `src/lib/execution/run-manager.ts` → `createRun()`
3. Run inserted to database, awaits execution
   - Location: `stageRuns` table, status="queued"
4. Execution worker polls for queued runs
   - Location: `src/execution-worker.ts` main loop, calls `src/lib/execution/worker.ts`
5. Worker picks up run, marks as "running"
   - Location: `src/lib/execution/worker.ts` → `pickupRun()`
6. Stage context loaded (project, documents, recipe)
   - Location: `src/lib/execution/stage-executors/index.ts` → `loadStageContext()`
7. Stage-specific executor dispatched
   - Location: `src/lib/execution/stage-executors/[stage]-executor.ts` (e.g., prd-executor.ts)
8. Executor executes tasks sequentially with verification
   - Location: `src/lib/execution/stage-executors/index.ts` → `executeTaskLoop()`
   - For each task:
     a. Skill execution (AI generation or tool invocation)
     b. Document verification against criteria
     c. Optional atomic commit if enabled
9. Gates evaluated if recipe defines them
   - Location: `src/lib/execution/stage-executors/index.ts` → `runGates()`
10. Execution logs and artifacts persisted
    - Location: `src/lib/execution/run-manager.ts` → `addRunLog()`, `createArtifact()`
11. Run marked complete, next stage auto-advanced if all gates pass
    - Location: Database `stageRuns.status` updated to "completed"
12. Real-time UI updates via SSE stream
    - Location: `src/app/api/jobs/stream/route.ts` → StreamCallback callbacks

**State Management:**

- **Server State (Source of Truth):** PostgreSQL database holds all durable state
  - Workspace, projects, documents, signals, runs, execution logs
  - Accessed via Drizzle ORM queries
- **Session State:** NextAuth session (user, permissions) in HTTP-only cookies
  - Client checks via `useSession()` hook
- **Client State (Ephemeral):** React Query cache and Zustand stores
  - React Query: Fetched data with caching and automatic invalidation
  - Zustand: UI-only state (modal open/close, form values, panel widths)
- **Real-time Updates:** Server-sent events (SSE) for execution logs
  - Location: `src/app/api/jobs/stream/route.ts`
  - Callbacks invoked: onLog, onProgress, onComplete
  - Client subscribes: `useRealtimeJobs()` hook

## Key Abstractions

**Workspace:**
- Purpose: Multi-tenant isolation boundary, groups all related data
- Examples: `src/lib/db/schema.ts` → `workspaces` table
- Pattern: Every query filtered by `workspaceId`, permission checks via `requireWorkspaceAccess()`
- Used by: All features - each workspace has isolated signals, projects, documents, settings

**Project/Card:**
- Purpose: Represents a product initiative flowing through the Kanban stage pipeline
- Examples: `src/lib/db/schema.ts` → `projects` table
- Pattern: Has stage, metadata, documents attached, runs tracked in `stageRuns` table
- Properties: name, description, status (stage name), metadata (git branch, Linear ID, etc.)

**Stage:**
- Purpose: Represents a phase in the product workflow (inbox → discovery → prd → design → prototype → validate → tickets)
- Pattern: Projects flow left-to-right through stages, each stage can have automation rules
- Configuration: `stageRecipes` table defines steps, gates, automation level per workspace+stage

**Stage Run:**
- Purpose: Single execution of automation for a card at a specific stage
- Examples: `src/lib/db/schema.ts` → `stageRuns` table
- Pattern: Tracks status (queued, running, completed, failed), automation level, provider, artifacts
- Lifecycle: queued → running → completed/failed → (optionally) next stage auto-advanced

**Recipe (Stage Recipe):**
- Purpose: Declarative specification of automation for a stage
- Structure:
  - `recipeSteps`: Array of tasks/skills to execute
  - `gates`: Quality gates that must pass before advancing
  - `automationLevel`: "human_approval", "auto_to_stage", "full_auto"
  - `provider`: "anthropic", "openai", "composio"
- Example: `src/lib/execution/default-recipes.ts` has default recipes per stage

**Signal:**
- Purpose: Represents a single piece of customer feedback, market intelligence, or product idea
- Pattern: Can be clustered (similar signals grouped), linked to projects/personas
- Properties: text/content, source (webhook, upload, API), status, severity, created_at
- Relationships: Many-to-many with projects via `signalProjects`, with personas via `signalPersonas`

**Document:**
- Purpose: Generated artifact during stage execution (PRD, design brief, spec, etc.)
- Examples: `src/lib/db/schema.ts` → `documents` table
- Pattern: Versioned, tied to project, generated by executors, used as input for next stages
- Used by: Verification checks, gates, downstream executors

## Entry Points

**Web Application:**
- Location: `src/app/layout.tsx` (root layout with providers)
- Triggers: Browser navigation to `/` or any dashboard route
- Responsibilities: Session/auth checks, provider setup (theme, react-query, nextauth), layout wrapper
- Flow: Loads user workspace list, renders dashboard pages

**Authentication:**
- Location: `src/app/api/auth/[...nextauth]/route.ts`
- Triggers: OAuth flow, signup, password reset
- Responsibilities: Session management, role/permission assignment, workspace assignment
- Storage: HTTP-only cookies with NextAuth session

**API Endpoints:**
- Pattern: `/api/[resource]/route.ts` for list/create, `/api/[resource]/[id]/route.ts` for detail operations
- Auth: Most require `await requireWorkspaceAccess(workspaceId, role)` check
- Examples:
  - `src/app/api/workspaces/route.ts` - workspace CRUD
  - `src/app/api/signals/route.ts` - signal list/create with filtering
  - `src/app/api/projects/[id]/route.ts` - project detail
  - `src/app/api/agents/execute/route.ts` - trigger agent execution

**Execution Worker:**
- Location: `src/execution-worker.ts` (entry point), `src/lib/execution/worker.ts` (main loop)
- Triggers: Manual run `npm run execution-worker`
- Responsibilities: Poll for queued runs, execute stages, stream logs, handle failures
- Heartbeat: Reports status every 15 seconds to `workerHeartbeats` table
- Rescue: Detects and rescues stuck runs (queued for >5 min without heartbeat)

**Cron Jobs:**
- Pattern: `/api/cron/[job]/route.ts` endpoints triggered by external cron service
- Examples:
  - `src/app/api/cron/maintenance/route.ts` - duplicate detection, orphan cleanup
  - `src/app/api/cron/signal-automation/route.ts` - auto-trigger PRDs from signal clusters

**Webhooks:**
- Pattern: `/api/webhooks/[service]/route.ts` for external integrations
- Examples:
  - `src/app/api/webhooks/signals/route.ts` - ingest external signals
  - `src/app/api/webhooks/slack/events/route.ts` - handle Slack events
  - `src/app/api/webhooks/pylon/route.ts` - handle Pylon events

## Error Handling

**Strategy:** Permission-first, then validation, then execution errors with graceful degradation

**Patterns:**

1. **Permission Errors:**
   ```typescript
   // Location: src/lib/permissions.ts
   await requireWorkspaceAccess(workspaceId, "editor"); // throws PermissionError
   ```
   - Error handler in API routes: `handlePermissionError()` returns 403
   - Frontend: `useWorkspaceRole()` hook prevents UI rendering

2. **Validation Errors:**
   ```typescript
   // Input validation at route handler level
   if (!workspaceId) return NextResponse.json({error: "..."}, {status: 400})
   ```

3. **Execution Errors:**
   - Stage executors catch and log errors, return `{ success: false, error: string }`
   - Run marked as "failed", UI displays error message
   - Execution logged to `runLogs` table for debugging

4. **Database Errors:**
   - Drizzle ORM throws on constraint violations
   - Caught in route handlers, logged, returned as 500

5. **AI Provider Errors:**
   - Location: `src/lib/execution/providers.ts`
   - Fallback logic: retry, timeout, fallback to different provider
   - Logged to execution logs with token counts

## Cross-Cutting Concerns

**Logging:**
- Server-side: `console.log/error()` throughout codebase
- Execution-specific: `src/lib/execution/run-manager.ts` → `addRunLog()` persists to database
- Real-time: Streamed via SSE callbacks from executors
- No centralized logging infrastructure detected (could add Sentry/LogRocket)

**Validation:**
- Database schema: Drizzle enforces NOT NULL, unique constraints
- Input validation: Route handlers validate request body/params manually
- Document verification: `src/lib/execution/verification.ts` checks generated documents against criteria
- No schema validation library (like Zod) currently integrated

**Authentication:**
- Provider: NextAuth 5 beta with OAuth (GitHub, Google)
- Location: `src/auth.ts` (config), `src/app/api/auth/[...nextauth]/route.ts` (routes)
- Session storage: HTTP-only cookies, edge middleware compatible
- Workspace assignment: Creator becomes admin, can invite others with roles (admin, editor, viewer)

**Rate Limiting:**
- Signal automation: `src/lib/automation/rate-limiter.ts` prevents excessive auto-actions
- Manual: Built into routes with workspace access checks
- Not global/IP-based (no rate limiting library detected)

**Data Privacy:**
- Workspace isolation enforced at database query level (always filter by workspaceId)
- No encryption at rest or in transit beyond HTTPS
- No field-level encryption detected
- Delete operations: Soft deletes via status (not implemented uniformly)

**Observability:**
- Worker heartbeats: `src/lib/execution/worker.ts` writes to `workerHeartbeats` table
- Run logs: Execution logs persisted for later review
- No metrics/monitoring library detected
- Manual inspection via database queries or UI dashboards
