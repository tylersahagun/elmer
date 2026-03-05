# Architecture

**Analysis Date:** 2026-02-04

## Pattern Overview

**Overall:** Layered, Domain-Driven Design with separation of concerns across three main tiers (API, Context, Repository) backed by Firebase Functions, Drizzle ORM, and PostgreSQL. The frontend is a React SPA (Vite) that communicates via GraphQL and REST webhooks. The backend processes events through Pub/Sub handlers and scheduled functions.

**Key Characteristics:**
- Clear separation between API layer (thin entry points), context layer (business logic), and repository layer (data access)
- Domain-driven contexts organized by business capability (engagements, artifacts, workflows, integrations, etc.)
- Event-driven architecture with Pub/Sub for asynchronous processing (media recording, transcription, email delivery)
- Strongly typed with TypeScript, GraphQL code generation, and Drizzle schema inference
- Frontend and backend share type definitions generated from GraphQL schema
- Structured logging with context propagation throughout request execution

## Layers

**API Layer (Thin Entry Points):**
- Purpose: Request parsing, authorization checks, guardrail validation. Delegates all business logic to context layer.
- Location: `functions/src/contexts/*/resolvers/`, `functions/src/contexts/*/*.functions.ts`
- Contains: GraphQL resolvers (in `types.generated.ts` from codegen), HTTP function handlers, Pub/Sub event handlers, scheduled function handlers
- Depends on: Context layer, Auth context for authorization checks
- Used by: Firebase Functions, GraphQL execution, external webhooks

**Context Layer (Business Logic & Orchestration):**
- Purpose: Encapsulate domain workflows, validation logic, and data orchestration. Coordinates work across repositories and calls back to API/UI when needed.
- Location: `functions/src/contexts/*/[name].context.ts`
- Contains: Domain functions (e.g., `getArtifactById`, `createEngagement`, `processTranscription`), workflow orchestration, validation rules, error handling
- Depends on: Repository layer for persistence, auth context for user context, other contexts for cross-domain workflows
- Used by: API layer, other contexts, scheduled/event handlers

**Repository/Data Layer:**
- Purpose: Single source for all Drizzle queries and database interactions. Returns typed objects; Drizzle constructs never leak upward.
- Location: `functions/src/contexts/*/[name].repository.ts`
- Contains: Drizzle query builders, database insert/update/delete operations, type exports (`DbModel`, `ModelCreateParams`)
- Depends on: Drizzle ORM, database schema in `functions/src/db/schema.ts`
- Used by: Context layer only (strict boundary)

**Database Schema & Types:**
- Purpose: Single source of truth for database structure and auto-generated TypeScript types
- Location: `functions/src/db/schema.ts`
- Contains: Drizzle table definitions with relations, enums, indexes. All schema changes flow through migrations.
- Migrations: Auto-generated in `functions/drizzle/` directory—never create manually

**Frontend (React SPA):**
- Purpose: User interface, client-side state management, GraphQL query execution
- Location: `apps/web/src/`
- Contains: Route pages, components (feature-organized and UI primitives), hooks, GraphQL queries/mutations/subscriptions (colocated with consumers), providers for state management
- Depends on: Apollo Client for GraphQL, React Router for navigation, Firebase Client SDK for auth/storage/messaging, shadcn/ui for components
- Used by: Browser, Electron desktop shell (shares codebase)

**Electron Desktop (Main Process & Renderer):**
- Purpose: Desktop application wrapper with native recording capabilities and system tray integration
- Location: `apps/web/electron/`
- Contains: Main process (window management, IPC handlers, recording service), preload script (typed IPC bridge), renderer components (tray UI, recording windows)
- Depends on: Frontend codebase (shared), native Node APIs, electron-recorder for audio capture

## Data Flow

**User Action → Response (GraphQL Query Example):**

1. User interacts with UI component in browser (`apps/web/src/components/*/`)
2. Component renders with GraphQL query/fragment (colocated in same file)
3. Apollo Client executes query via `useLazyQuery` or `useQuery` hook
4. Query resolves at GraphQL endpoint (`functions/src/contexts/*/resolvers/`)
5. GraphQL resolver validates authorization and calls context function
6. Context function orchestrates business logic and calls repository helpers
7. Repository executes Drizzle query against PostgreSQL
8. Result flows back: Repository → Context → Resolver → Apollo → Component
9. UI re-renders with new data

**Asynchronous Event Processing (Pub/Sub Example):**

1. Event published to Pub/Sub topic (e.g., `NewEngagementAvailable`)
2. Cloud Function handler subscribed to topic receives event (`functions/src/contexts/*/[name].functions.ts`)
3. Handler executes within `runWithLoggingContext` to establish tracing context
4. Handler calls context function (e.g., `processEngagement`, `summarizeEngagement`)
5. Context function performs work: validation, API calls, data transformations
6. Context calls repository to persist results
7. If needed, context publishes new events or triggers webhooks
8. All logs include persistent context metadata (requestId, workspaceId, etc.)

**State Management:**

**Client-side:**
- Apollo Cache: Primary source of truth for server state (queries, mutations, subscriptions)
- React Context: Used for workspace/user context (`apps/web/src/contexts/`)
- Local component state: For UI-only state (form inputs, collapsed sections)
- Never attach data to `window` object

**Server-side:**
- Database (PostgreSQL via Drizzle): Persistent application state
- Valkey/Redis: Temporary caches and session data
- Pub/Sub: In-flight event coordination
- No in-memory state; all state is persistent or recoverable

## Key Abstractions

**ViewerPassport (Authentication Context):**
- Purpose: Encapsulates authenticated user, workspace, and authorization information
- Examples: `functions/src/contexts/auth/auth.context.ts`
- Pattern: Created at API layer entry points, threaded through context calls, provides userId, workspaceId, and permission checks
- Import: `import { ViewerPassport } from '@/contexts/auth/auth.context'`

**Logging Context:**
- Purpose: Structured, persistent metadata across an entire request execution
- Examples: `functions/src/utils/loggingContext.ts`, `functions/src/utils/logger.ts`
- Pattern: Wrap entry points in `runWithLoggingContext({ requestId, functionName, workspaceId }, async () => { ... })`
- Enrichment: Use `enrichLoggingContext()` inside context functions to add metadata that appears in all subsequent logs
- All logs: Use `createLogger('ComponentName')` at module level and call `logger.log()`, `logger.warn()`, `logger.error()`, `logger.exception()`

**Drizzle Typed Contexts (dataSources):**
- Purpose: Type-safe database access passed through GraphQL resolver context
- Examples: `ctx.dataSources.engagementDb`, `ctx.dataSources.chatDb`
- Pattern: GraphQL execution builds a context object with data source helpers; resolvers access via `ctx.dataSources.{model}Db`
- Never used in contexts or repositories—only in resolvers for cross-domain lookups

**Fragment Data & makeFragmentData:**
- Purpose: Type-safe GraphQL fragment usage on frontend
- Examples: `apps/web/src/components/*/my-component.tsx`
- Pattern: Define fragment at top of component file, spread into parent queries, use `useFragment()` hook to unwrap
- Testing: Use `makeFragmentData()` to create type-safe mock data in Storybook stories

**App Cloud Events (Pub/Sub Envelope):**
- Purpose: Consistent event envelope for all Pub/Sub messages
- Examples: `AppCloudEvent<'EventName'>` in function handlers
- Pattern: Events wrap typed payloads (JSON-serialized), handlers extract `event.data.message.json`
- Topics: Named after event type (e.g., `NewEngagementAvailable`, `TranscriptionSaved`, `PrimaryMediaClipTranscriptionProcessed`)

**Subcontexts:**
- Purpose: Extract cohesive chunks of functionality within a parent context when it grows too large
- Examples: `functions/src/contexts/workflows/workflow-assistant-runs/` (subcontext within workflows)
- Pattern: Subdirectory with own context, repository, resolvers, schema, keeping tests alongside
- Guidelines: Own distinct data model (separate DB table), self-contained logic, parent contexts don't import subcontext repositories

## Entry Points

**Web Application:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Initialize React root, setup providers (PostHog, Apollo, Analytics), mount router (either web or Electron)

**GraphQL API:**
- Location: `functions/src/contexts/*/resolvers/`
- Triggers: Apollo Client query/mutation/subscription execution
- Responsibilities: Validate authorization, parse arguments, delegate to context layer
- Pattern: Call context functions from resolvers; never touch repositories directly

**Pub/Sub Handlers:**
- Location: `functions/src/contexts/*/*.functions.ts`
- Triggers: Pub/Sub topic publication
- Responsibilities: Wrap in `runWithLoggingContext`, parse event payload, call context function
- Pattern: Keep handlers thin; all work happens in context layer
- Examples: `processNewEngagementEventHandler`, `engagementSummarizerHandler`, `sendPostMeetingEmailsHandler`

**HTTP Handlers (Webhooks):**
- Location: `functions/src/contexts/*/[name].functions.ts` (marked with `onRequest`)
- Triggers: External webhook POST requests (Slack, Zapier, etc.)
- Responsibilities: Validate signature/auth, parse body, call context
- Example: `functions/src/contexts/zapier/zapier.functions.ts`

**Scheduled Handlers (Cloud Scheduler):**
- Location: `functions/src/contexts/scheduled-handlers/`
- Triggers: Cloud Scheduler cron jobs
- Responsibilities: Run periodic tasks (subscription billing, notification cleanup, data sync)
- Pattern: Establish logging context, iterate workspaces, call context functions

**Electron Main Process:**
- Location: `apps/web/electron/main.ts`
- Triggers: Application launch
- Responsibilities: Window management, system tray, IPC event handling, native recording service lifecycle

## Error Handling

**Strategy:** Layered error recovery with clear boundaries; contexts catch and log, API layer converts to user-facing responses.

**Patterns:**

**Context Layer Errors:**
- Prefer explicit error types (not generic `Error`)
- Log with `logger.exception(message, error, metadata)` which auto-serializes stack traces
- Use `throw` to propagate recoverable errors; let API layer decide HTTP status
- Example: `throw new ValidationError('Email already in use')` caught by resolver and converted to GraphQL error

**Repository Layer Errors:**
- Let Drizzle errors propagate naturally; they signal constraint violations (unique, foreign key)
- Wrap database errors with domain context if needed: `throw new EngagementNotFoundError(engagementId)`
- Example: `if (!engagement) throw new EngagementNotFoundError(engagementId)`

**API Layer Errors:**
- Catch context errors and convert to GraphQL errors or HTTP responses
- Add user-friendly messages; never expose internal stack traces to clients
- Example: Resolver catches `ValidationError` and returns `{ errors: [{ message: 'Email already in use' }] }`

**Event Handler Errors:**
- Log the error with full context (workspaceId, engagementId) but don't crash the function
- Create a reprocessing record to allow manual retry (if applicable)
- Example: `await createReprocessingAttemptWithRetries({ status: 'FAILED', error: serializedError })`

## Cross-Cutting Concerns

**Logging:**
- Entry points wrap work in `runWithLoggingContext` to establish requestId and functionName
- All log calls use `createLogger('ComponentName')` at module level
- Use structured metadata: `logger.log('Action', { userId, workspaceId })` not string concatenation
- Avoid nesting `runWithLoggingContext` calls; one per request execution only

**Validation:**
- GraphQL schema enforces input shape and nullability
- Context functions validate business rules (uniqueness, authorization, state transitions)
- Use Zod for complex validation: `z.object({ email: z.string().email() })`
- Return validation errors through context; API layer converts to GraphQL errors

**Authentication:**
- Firebase Auth provides user identity (UID in JWT)
- ViewerPassport wraps userId, workspaceId, roles, carries through context calls
- All API resolvers receive passport from context (established by GraphQL middleware)
- Context functions check `passport.workspaceId` before accessing workspace data

**Authorization:**
- Context functions check user roles/permissions before performing actions
- Example: `if (!passport.isAdmin) throw new UnauthorizedError('Admin required')`
- Resolver-level checks for sensitive operations (mutations, subscriptions)
- Database queries filter by workspace to prevent cross-tenant leaks

**Transactions:**
- All database operations within a single context call happen in a transaction
- Repositories receive `tx: DrizzleDb` parameter; use `tx.insert()` not `db.insert()`
- Tests wrap context calls in `withRollback()` to auto-rollback after each test
- Never mock database interactions in tests; use real transactions

**Pagination & Filtering:**
- List resolvers accept `filter` (input object) and `orderBy` (array of enum) arguments
- Repository helper builds WHERE and ORDER BY clauses from these inputs
- Example: `getEngagementsForWorkspace(workspaceId, filter?: EngagementFilterInput, orderBy?: EngagementOrderBy[])`
- Frontend uses Apollo's cache and `fetchMore` for cursor-based pagination

---

*Architecture analysis: 2026-02-04*
