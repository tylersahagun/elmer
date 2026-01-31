# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
orchestrator/
├── src/
│   ├── app/                          # Next.js App Router (pages & API routes)
│   │   ├── (dashboard)/              # Authenticated routes layout group
│   │   │   ├── projects/             # Project/card Kanban views
│   │   │   ├── workspace/            # Workspace settings, signals, commands
│   │   │   ├── knowledgebase/        # Knowledge base management
│   │   │   ├── personas/             # Persona management
│   │   │   └── search/               # Global search page
│   │   ├── api/                      # RESTful API endpoints
│   │   │   ├── workspaces/           # Workspace CRUD and members
│   │   │   ├── projects/             # Project CRUD and signals
│   │   │   ├── signals/              # Signal CRUD, ingestion, clustering
│   │   │   ├── jobs/                 # Job/run management and logs
│   │   │   ├── agents/               # Agent execution and sync
│   │   │   ├── github/               # GitHub API integration
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── cron/                 # Scheduled jobs (maintenance, automation)
│   │   │   ├── webhooks/             # Webhook receivers (Slack, signals, etc.)
│   │   │   └── [other services]/     # Knowledge sources, personas, skills, etc.
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   ├── invite/                   # Invitation acceptance page
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home/workspace switcher
│   │   └── globals.css               # Tailwind + custom styles
│   ├── components/                   # React components (presentational & container)
│   │   ├── ui/                       # Base UI primitives (button, dialog, tabs, etc.)
│   │   ├── animate-ui/               # Animated/interactive UI components
│   │   ├── chrome/                   # Layout chrome (navbar, sidebar, windows)
│   │   ├── kanban/                   # Kanban board and card components
│   │   ├── signals/                  # Signal management components
│   │   ├── projects/                 # Project detail components
│   │   ├── jobs/                     # Job/run display components
│   │   ├── settings/                 # Settings panel components
│   │   ├── execution/                # Execution status and health components
│   │   ├── documents/                # Document upload and display
│   │   ├── files/                    # File browser components
│   │   ├── chat/                     # Chat/messaging UI
│   │   ├── commands/                 # Command/recipe editor components
│   │   ├── providers/                # Context providers (session, theme)
│   │   └── [domain-specific]/        # Other component groups
│   ├── lib/                          # Core business logic & utilities
│   │   ├── db/                       # Database layer
│   │   │   ├── schema.ts             # Drizzle table definitions
│   │   │   ├── queries.ts            # Prepared/common queries
│   │   │   ├── index.ts              # Database connection factory
│   │   │   ├── migrate.ts            # Migration runner
│   │   │   └── migrate-vectors.ts    # Vector migration utility
│   │   ├── execution/                # Stage execution orchestration
│   │   │   ├── index.ts              # Main executor dispatcher
│   │   │   ├── run-manager.ts        # Run lifecycle management
│   │   │   ├── worker.ts             # Worker process loop
│   │   │   ├── providers.ts          # AI provider abstractions
│   │   │   ├── verification.ts       # Document/output verification
│   │   │   ├── stage-executors/      # Stage-specific executors
│   │   │   │   ├── index.ts          # Dispatcher and task loop
│   │   │   │   ├── inbox-executor.ts # Inbox stage logic
│   │   │   │   ├── discovery-executor.ts # Discovery research logic
│   │   │   │   ├── prd-executor.ts   # PRD generation logic
│   │   │   │   ├── design-executor.ts # Design brief generation
│   │   │   │   ├── prototype-executor.ts # Prototype creation
│   │   │   │   ├── validate-executor.ts # Validation gate checks
│   │   │   │   └── tickets-executor.ts # Ticket creation
│   │   │   └── default-recipes.ts    # Default automation recipes
│   │   ├── signals/                  # Signal processing & clustering
│   │   │   ├── index.ts              # Signal service exports
│   │   │   ├── processor.ts          # Signal ingestion pipeline
│   │   │   └── [other signal libs]/  # Clustering, suggestion logic
│   │   ├── ai/                       # AI provider integrations
│   │   │   ├── index.ts              # Exports
│   │   │   ├── embeddings.ts         # Vector embedding generation
│   │   │   └── extraction.ts         # AI extraction utilities
│   │   ├── github/                   # GitHub API integration
│   │   │   ├── auth.ts               # GitHub OAuth and token management
│   │   │   └── [other github utils]  # Repo access, tree fetch, etc.
│   │   ├── agent/                    # Agent orchestration (worker agents)
│   │   │   ├── executor.ts           # Execute agents for complex tasks
│   │   │   ├── tools.ts              # Tools available to agents
│   │   │   ├── prompts.ts            # System prompts for agents
│   │   │   ├── security.ts           # Agent permission/security model
│   │   │   └── [other agent libs]/   # Parser, worker, types
│   │   ├── auth/                     # Authentication helpers
│   │   │   ├── index.ts              # NextAuth config export
│   │   │   ├── helpers.ts            # Auth utility functions
│   │   │   └── env.ts                # Auth environment validation
│   │   ├── permissions.ts            # Role-based access control
│   │   ├── knowledgebase/            # Knowledge base sync & management
│   │   │   ├── sync.ts               # GitHub sync logic
│   │   │   └── index.ts              # KB exports
│   │   ├── jobs/                     # Job/run processing
│   │   │   ├── index.ts              # Job service exports
│   │   │   ├── processor.ts          # Background job processing
│   │   │   └── executor.ts           # Single job execution
│   │   ├── automation/               # Signal automation rules
│   │   │   ├── signal-automation.ts  # Auto-PRD, auto-initiative logic
│   │   │   ├── rate-limiter.ts       # Rate limiting for auto-actions
│   │   │   └── auto-actions.ts       # Action executors
│   │   ├── skills/                   # Skill/recipe management
│   │   │   ├── index.ts              # Exports
│   │   │   ├── skills-service.ts     # Skill CRUD
│   │   │   └── stage-recipes-service.ts # Recipe CRUD
│   │   ├── integrations/             # Third-party integrations
│   │   │   ├── slack.ts              # Slack integration
│   │   │   ├── pylon.ts              # Pylon integration
│   │   │   ├── types.ts              # Integration types
│   │   │   └── index.ts              # Exports
│   │   ├── maintenance/              # Data cleanup utilities
│   │   │   ├── duplicate-detector.ts # Find duplicate signals
│   │   │   ├── orphan-detector.ts    # Find orphaned data
│   │   │   ├── merge.ts              # Merge operations
│   │   │   ├── archival.ts           # Archive old data
│   │   │   └── index.ts              # Exports
│   │   ├── classification/           # Signal clustering & classification
│   │   │   ├── classifier.ts         # Classify signals
│   │   │   ├── clustering.ts         # Vector clustering algorithm
│   │   │   └── index.ts              # Exports
│   │   ├── context/                  # Context resolution for verification
│   │   │   ├── resolve.ts            # Load personas, guardrails, company context
│   │   │   └── [other context libs]/ # Context builders
│   │   ├── webhooks/                 # Webhook handling
│   │   │   ├── processor.ts          # Webhook processing logic
│   │   │   ├── auth.ts               # Webhook authentication
│   │   │   └── index.ts              # Exports
│   │   ├── video/                    # Video caption extraction
│   │   │   ├── extractCaptions.ts    # YouTube/video caption parsing
│   │   │   ├── validators.ts         # Video input validation
│   │   │   └── [other video utils]/  # Formatters
│   │   ├── files/                    # File upload & parsing
│   │   │   ├── extractText.ts        # PDF/document text extraction
│   │   │   ├── validators.ts         # File validation
│   │   │   └── index.ts              # Exports
│   │   ├── git/                      # Git operations
│   │   │   ├── branches.ts           # Feature branch management
│   │   │   └── [other git utils]/
│   │   ├── migrations/               # Data migration utilities
│   │   ├── notifications/            # Notification management
│   │   ├── prototypes/               # Prototype management
│   │   ├── rules/                    # Rules engine (if any)
│   │   ├── queue/                    # Job queue implementation
│   │   ├── cursor/                   # Cursor IDE integration
│   │   ├── composio/                 # Composio tool integration
│   │   ├── utils.ts                  # General utilities
│   │   ├── store.ts                  # Zustand stores (client state)
│   │   ├── animations.ts             # Animation helpers
│   │   ├── get-strict-context.tsx    # Context provider helper
│   │   └── activity.ts               # Activity logging
│   ├── hooks/                        # Custom React hooks
│   │   ├── index.ts                  # Hook exports
│   │   ├── useJobPolling.ts          # Poll for job updates
│   │   ├── useRealtimeJobs.ts        # SSE connection for real-time logs
│   │   ├── useRunStatus.ts           # Track run status
│   │   ├── useBrowserNotifications.ts # Browser notification API
│   │   ├── use-resizable-panel.ts    # Resizable panel hook
│   │   ├── use-controlled-state.tsx  # Controlled state wrapper
│   │   ├── use-is-in-view.tsx        # Intersection observer hook
│   │   └── useWorkspaceRole.ts       # Get current workspace role
│   ├── types/                        # TypeScript type definitions
│   │   └── [domain types]/           # Type files
│   ├── __tests__/                    # Test files
│   │   ├── api/                      # API endpoint tests
│   │   ├── auth/                     # Auth tests
│   │   └── execution/                # Execution tests
│   ├── auth.ts                       # NextAuth configuration
│   ├── middleware.ts                 # Next.js middleware (redirects, auth)
│   ├── execution-worker.ts           # Worker process entry point
│   └── worker.ts                     # [Deprecated/legacy worker]
├── drizzle/                          # Drizzle ORM metadata
│   └── meta/                         # Migration journal
├── public/                           # Static assets
│   ├── fonts/                        # Custom fonts (Chillax, Synonym)
│   └── [other assets]/
├── scripts/                          # Utility scripts
│   └── start-local.sh                # Local development startup
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
└── .planning/                        # GSD planning documents
    └── codebase/                     # Codebase analysis docs
```

## Directory Purposes

**src/app/(dashboard):**
- Purpose: All authenticated pages behind login
- Contains: Kanban board, project detail, workspace settings, knowledge base UI
- Grouping: Routes prefixed with `/` (routes are at `/projects`, `/workspace`, etc. not `/dashboard/...`)

**src/app/api:**
- Purpose: All REST API endpoints
- Pattern: `[id]` = dynamic route segments, `route.ts` = handler file
- Organization: One directory per resource, routes deeply nested matching API structure
- Access control: Most routes require `requireWorkspaceAccess()` check

**src/components:**
- Purpose: All React components
- Structure:
  - `ui/` = Base primitives from Radix UI with Tailwind styling
  - `animate-ui/` = Framer Motion animated components (alternative to base ui)
  - Domain-specific folders: Components for signals, projects, jobs, etc.
  - No sub-component nesting - all components at same level, import from index.ts

**src/lib:**
- Purpose: Business logic isolated from React/HTTP concerns
- Critical files:
  - `db/schema.ts` - Single source of truth for database structure (>2000 LOC)
  - `db/queries.ts` - Prepared queries for common operations
  - `execution/` - Main execution system (run manager, stage executors, verification)
  - `github/` - All GitHub API interactions
  - `signals/` - Signal ingestion and clustering
- Dependency rule: `/lib` imports only other `/lib` modules or node_modules, never components

**src/hooks:**
- Purpose: Custom React hooks (not Radix hooks, not hooks from /components)
- Focus: Data fetching (useJobPolling, useRealtimeJobs), notifications, browser APIs
- Pattern: Exported from `index.ts` for convenient imports

**src/types:**
- Purpose: Shared TypeScript types
- Note: Most types generated from Drizzle schema in `lib/db/schema.ts`

**src/__tests__:**
- Purpose: Vitest test files
- Organization: Mirrors src/ structure
- Location: Co-located tests (test file next to implementation) OR in __tests__/ folder

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx` - Root layout with providers (theme, session, react-query)
- `src/app/page.tsx` - Home page (workspace list)
- `src/app/(dashboard)/layout.tsx` - Dashboard auth guard and layout
- `src/auth.ts` - NextAuth configuration
- `src/execution-worker.ts` - Execution worker entry point

**Configuration:**
- `package.json` - Scripts: `dev`, `build`, `start`, `test`, `execution-worker`, `db:push`, `db:studio`
- `tsconfig.json` - Path aliases: `@/*` = `src/*`
- `next.config.ts` - Next.js settings
- `drizzle.config.ts` - Drizzle ORM configuration (if exists)

**Core Logic:**
- `src/lib/db/schema.ts` - All database table definitions (Workspaces, Projects, Signals, Runs, etc.)
- `src/lib/db/queries.ts` - Common query helpers
- `src/lib/db/index.ts` - Database connection with Neon vs standard detection
- `src/lib/execution/index.ts` - Main stage executor dispatcher
- `src/lib/execution/run-manager.ts` - Run creation, logging, artifact tracking
- `src/lib/execution/worker.ts` - Execution worker loop
- `src/lib/execution/stage-executors/[stage]-executor.ts` - Stage-specific logic

**API Routes (by domain):**
- **Workspaces:** `src/app/api/workspaces/route.ts`, `[id]/route.ts`
- **Projects:** `src/app/api/projects/route.ts`, `[id]/route.ts`
- **Signals:** `src/app/api/signals/route.ts`, `[id]/route.ts`, `ingest/route.ts`, `upload/route.ts`
- **Execution:** `src/app/api/agents/execute/route.ts`, `src/app/api/jobs/stream/route.ts`
- **GitHub:** `src/app/api/github/[owner]/[repo]/analyze/route.ts`, `repos/route.ts`, `write/commit/route.ts`
- **Webhooks:** `src/app/api/webhooks/signals/route.ts`, `slack/events/route.ts`
- **Auth:** `src/app/api/auth/[...nextauth]/route.ts`, `signup/route.ts`

**Testing:**
- `src/__tests__/auth/auth.test.ts` - Authentication tests
- `src/__tests__/api/` - API endpoint tests
- `src/__tests__/execution/stage-recipes.test.ts` - Execution tests

## Naming Conventions

**Files:**
- `*.ts` - Node.js/server code (no React)
- `*.tsx` - React components (client or server components)
- `route.ts` - Next.js route handler (API endpoints)
- `page.tsx` - Next.js page component
- `layout.tsx` - Next.js layout component
- `[dynamic].ts/tsx` - Dynamic route segment
- `[...slug].ts/tsx` - Catch-all route segment

**Directories:**
- `[resource-name]/` - API resource folders (signals, projects, workspaces)
- `(group)/` - Route groups (dashboard is auth-only group)
- `[id]/` - Dynamic segments for resource IDs
- Kebab-case for multi-word directories: `stage-executors`, `stage-recipes`, `knowledge-sources`

**TypeScript/Functions:**
- PascalCase: React components (`<ProjectCard>`), Drizzle tables (`workspaces`), types (`WorkspaceRole`)
- camelCase: Functions, variables, hook names (`createWorkspace`, `useJobPolling`)
- UPPER_SNAKE_CASE: Constants (`DATABASE_URL`, `POLL_INTERVAL`)

**Database:**
- Table names: snake_case plural (`workspaces`, `stage_runs`, `signal_projects`)
- Column names: snake_case (`created_at`, `workspace_id`, `is_active`)
- JSON fields: Stored as JSONB, typed with interfaces (e.g., `WorkspaceSettings`)

## Where to Add New Code

**New Feature (e.g., new stage type):**
1. **Database:** Add tables/columns to `src/lib/db/schema.ts`
2. **Queries:** Add query helpers to `src/lib/db/queries.ts`
3. **Business Logic:** Create `src/lib/[domain]/[feature].ts` for core logic
4. **Executor:** If adding stage, create `src/lib/execution/stage-executors/[stage]-executor.ts`
5. **API:** Create `src/app/api/[resource]/route.ts` route handler(s)
6. **UI:** Create component(s) in `src/components/[domain]/`
7. **Page:** Create `src/app/(dashboard)/[path]/page.tsx` if new dashboard page
8. **Tests:** Add to `src/__tests__/` mirroring the feature path

**New Component:**
- Location: `src/components/[domain]/[ComponentName].tsx`
- Export from: `src/components/[domain]/index.ts` (if barrel file exists)
- Use: Import with `@/components/[domain]/[ComponentName]`

**New Hook:**
- Location: `src/hooks/[hookName].ts`
- Export from: `src/hooks/index.ts`
- Use: Import with `@/hooks`

**New Query/DB Helper:**
- Location: `src/lib/db/queries.ts`
- For domain-specific: `src/lib/[domain]/queries.ts` or `[domain].ts`
- Export: Re-export from the domain's `index.ts`

**New Utility/Service:**
- Location: `src/lib/[domain]/[service].ts`
- Domain folders: Use existing folders (signals, github, execution, ai, etc.) or create new
- Export: `src/lib/[domain]/index.ts` for public API

**Tests:**
- Location: `src/__tests__/[path]/[file].test.ts`
- OR: Co-locate as `[file].test.ts` next to implementation
- Pattern: Use Vitest with assertions matching existing tests
- Run: `npm test` or `npm run test:run`

## Special Directories

**src/components/animate-ui:**
- Purpose: Alternative UI components with Framer Motion animations
- Generated: No (manually maintained)
- Committed: Yes
- Examples: `sidebar.tsx`, `dialog.tsx`, `progress.tsx` with animation support
- Use: Import from `@/components/animate-ui/` when animations needed

**drizzle/meta:**
- Purpose: Drizzle ORM migration journal and metadata
- Generated: Yes (by drizzle-kit)
- Committed: Yes
- Files: `_journal.json` tracks migration history
- Update: Run `npm run db:generate` after schema changes, then `npm run db:push` or `npm run db:migrate`

**public/fonts:**
- Purpose: Custom fonts (Chillax, Synonym) loaded in root layout
- Contents: WOFF2 files for performance
- Reference: `src/app/layout.tsx` loads with next/font/local
- Committed: Yes

**src/lib/execution/stage-executors:**
- Purpose: Stage-specific execution logic
- Pattern: Each stage (inbox, discovery, prd, design, prototype, validate, tickets) has dedicated executor
- Entry: `index.ts` dispatches to correct executor based on `run.stage`
- Pattern: Each executor exports `export async function execute[Stage](context, callbacks)`
- Shared: `loadStageContext()`, `runGates()`, `executeTaskLoop()` in index.ts

**Drizzle Migrations:**
- Command: `npm run db:generate` - generates migration from schema changes
- Then: `npm run db:push` - pushes to database OR `npm run db:migrate` - runs migration script
- Files: Stored in `drizzle/` directory
- Status: Check `drizzle/meta/_journal.json` for applied migrations
