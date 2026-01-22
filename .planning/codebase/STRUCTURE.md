# Codebase Structure

**Analysis Date:** 2026-01-21

## Directory Layout

```
orchestrator/
├── src/
│   ├── app/                          # Next.js App Router - Pages & API routes
│   │   ├── (dashboard)/              # Grouped layout - Dashboard pages
│   │   │   ├── layout.tsx            # Dashboard providers (QueryClient, DisplaySettings)
│   │   │   ├── workspace/[id]/       # Main workspace/kanban view
│   │   │   ├── projects/[id]/        # Project detail view
│   │   │   ├── search/               # Global search page
│   │   │   ├── personas/             # Synthetic personas management
│   │   │   └── knowledgebase/        # Knowledge base browser
│   │   ├── api/                      # API route handlers
│   │   │   ├── workspaces/
│   │   │   ├── projects/
│   │   │   ├── jobs/
│   │   │   ├── documents/
│   │   │   ├── runs/
│   │   │   ├── chat/
│   │   │   ├── skills/
│   │   │   ├── workers/
│   │   │   └── ... (18 total)
│   │   ├── page.tsx                  # Root home page
│   │   ├── layout.tsx                # Root layout with fonts & theme
│   │   ├── globals.css               # Global styles (Tailwind v4)
│   │   └── favicon.ico
│   ├── components/                   # Reusable React components
│   │   ├── kanban/                   # Kanban board components
│   │   │   ├── KanbanBoard.tsx       # Main board container
│   │   │   ├── ProjectCard.tsx       # Draggable project card
│   │   │   ├── IterationLoopLanes.tsx
│   │   │   ├── NewProjectDialog.tsx
│   │   │   └── ... (9 total)
│   │   ├── execution/                # Execution UI (logs, artifacts, status)
│   │   │   └── ... (run visualization)
│   │   ├── jobs/                     # Job management UI
│   │   │   └── ... (job panels)
│   │   ├── chrome/                   # Window chrome (Window, Navbar, CommandChip)
│   │   ├── ui/                       # Radix UI wrapped components (button, input, dialog, etc.)
│   │   ├── display/                  # DisplayMode provider (immersive vs focus)
│   │   ├── documents/                # Document viewers/editors
│   │   ├── chat/                     # Chat interface components
│   │   ├── providers/                # React providers (Theme, Query, Display)
│   │   ├── brand/                    # Elmer branding (logos, wordmarks)
│   │   ├── backgrounds/              # Animated backgrounds (aurora, stars, etc.)
│   │   ├── aurora/                   # Aurora animation component
│   │   └── ... (18 total categories)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useJobPolling.ts          # Poll jobs/runs for updates
│   │   ├── useRealtimeJobs.ts        # SSE for real-time updates
│   │   ├── useBrowserNotifications.ts
│   │   ├── useRunStatus.ts
│   │   └── ... (8 total)
│   ├── lib/                          # Core business logic
│   │   ├── db/                       # Database layer
│   │   │   ├── schema.ts             # Drizzle ORM schema (all tables)
│   │   │   ├── queries.ts            # Database query builders
│   │   │   ├── index.ts              # DB client initialization
│   │   │   └── migrate.ts            # Migration runner
│   │   ├── agent/                    # Legacy agent job execution
│   │   │   ├── executor.ts           # AgentExecutor - Anthropic SDK integration
│   │   │   ├── worker.ts             # JobWorker - polling & job execution
│   │   │   ├── tools.ts              # Tool definitions (24+ tools for jobs)
│   │   │   ├── prompts.ts            # System prompts per job type
│   │   │   ├── types.ts              # Type definitions
│   │   │   └── index.ts              # Exports
│   │   ├── execution/                # New durable execution system
│   │   │   ├── worker.ts             # ExecutionWorker - polling & run management
│   │   │   ├── run-manager.ts        # Run CRUD, transitions, artifacts, logs
│   │   │   ├── providers.ts          # ExecutionProvider interface & implementations
│   │   │   ├── verification.ts       # Verification/quality checks
│   │   │   ├── default-recipes.ts    # Default stage automation recipes
│   │   │   ├── stage-executors/      # Stage-specific automation
│   │   │   │   ├── inbox-executor.ts
│   │   │   │   ├── discovery-executor.ts
│   │   │   │   ├── prd-executor.ts
│   │   │   │   ├── design-executor.ts
│   │   │   │   ├── prototype-executor.ts
│   │   │   │   ├── validate-executor.ts
│   │   │   │   ├── tickets-executor.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Exports
│   │   ├── jobs/                     # Job processing utilities
│   │   │   ├── executor.ts
│   │   │   ├── processor.ts
│   │   │   └── index.ts
│   │   ├── knowledgebase/            # Knowledge base management
│   │   │   ├── sync.ts               # Sync context files to KB
│   │   │   └── ... (KB queries)
│   │   ├── skills/                   # AI skills definitions
│   │   │   └── ... (skill modules)
│   │   ├── rules/                    # Business rules engine
│   │   │   └── ... (rule definitions)
│   │   ├── context/                  # Context/state utilities
│   │   ├── cursor/                   # Cursor IDE integration
│   │   ├── git/                      # Git operations
│   │   ├── queue/                    # Job queue utilities
│   │   ├── prototypes/               # Prototype building utilities
│   │   ├── store.ts                  # Zustand store (project cards, columns)
│   │   ├── utils.ts                  # Utility functions
│   │   ├── animations.ts             # Animation constants
│   │   └── get-strict-context.tsx    # Context helpers
│   ├── worker.ts                     # Background worker entry point (Agent)
│   ├── execution-worker.ts           # Background worker entry point (Execution)
│   └── __tests__/                    # Test files
│       └── execution/
├── public/
│   ├── fonts/                        # Custom fonts (Chillax, Synonym)
│   └── ... (assets)
├── drizzle/                          # Generated Drizzle migrations
│   └── meta/
├── data/                             # Static data files
├── scripts/                          # Build/deployment scripts
│   └── start-local.sh
├── Chillax/                          # Chillax font files
├── Synonym/                          # Synonym font files
├── package.json                      # Dependencies (React 19, Next 16, etc.)
├── tsconfig.json                     # TypeScript config with path aliases
├── next.config.ts                    # Next.js config
├── drizzle.config.ts                 # Drizzle ORM config
├── .env.example                      # Environment variables template
└── README.md
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router - pages, layouts, API routes
- Contains: React Server Components, Client Components, route handlers
- Key files: `page.tsx` (pages), `layout.tsx` (layouts), `route.ts` (API endpoints)

**src/app/(dashboard)/**
- Purpose: Grouped layout for authenticated dashboard
- Contains: All dashboard pages and their client components
- Pattern: Group routes to share layout context (QueryClient, DisplaySettings provider)

**src/app/api/**
- Purpose: HTTP API endpoints
- Contains: RESTful route handlers for data operations
- Pattern: Standard Next.js route handlers with GET/POST methods

**src/components/**
- Purpose: Reusable React components
- Contains: UI components organized by feature/domain
- Pattern: Feature-based grouping (kanban, jobs, documents, etc.)

**src/lib/db/**
- Purpose: Database abstraction layer
- Contains: Drizzle ORM schema, query builders, migrations
- Key files: `schema.ts` (table definitions), `queries.ts` (query builders), `index.ts` (client)

**src/lib/agent/**
- Purpose: Legacy automated job execution system
- Contains: AgentExecutor, job tools, system prompts, job worker
- Pattern: Polls pending jobs, executes with Anthropic SDK, stores results

**src/lib/execution/**
- Purpose: New durable execution system for stage automation
- Contains: ExecutionWorker, run management, stage executors, execution providers
- Pattern: Polls queued runs, executes stage-specific automation, streams logs, creates artifacts

**src/lib/knowledgebase/**
- Purpose: Knowledge base management and synchronization
- Contains: Sync logic from context files, KB queries
- Pattern: Ingest local docs, make searchable, use in prompts

**src/hooks/**
- Purpose: Custom React hooks for client-side logic
- Contains: Data fetching hooks, polling hooks, notification hooks
- Pattern: Reusable stateful logic across components

**public/**
- Purpose: Static assets
- Contains: Fonts (Chillax, Synonym), images, favicon
- Pattern: Served directly via Next.js static file serving

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root home page (workspace listing)
- `src/app/(dashboard)/workspace/[id]/page.tsx`: Main workspace/kanban view
- `src/worker.ts`: Background job worker process
- `src/execution-worker.ts`: Background execution worker process

**Configuration:**
- `src/app/layout.tsx`: Root layout with fonts, theme provider
- `src/app/(dashboard)/layout.tsx`: Dashboard layout with QueryClient provider
- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript compiler options with path aliases
- `drizzle.config.ts`: Database configuration

**Core Logic:**
- `src/lib/db/schema.ts`: Database schema (50+ types, 15+ tables)
- `src/lib/db/queries.ts`: Query builders for all operations
- `src/lib/store.ts`: Zustand store for UI state
- `src/lib/agent/executor.ts`: Job execution engine
- `src/lib/execution/run-manager.ts`: Run lifecycle management
- `src/lib/execution/worker.ts`: Execution worker main loop

**Testing:**
- `src/__tests__/execution/`: Execution system tests

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: PascalCase, e.g., `KanbanBoard.tsx`, `ProjectCard.tsx`
- Utilities: camelCase, e.g., `useJobPolling.ts`, `utils.ts`
- Types: Exported as `interface` or `type` within files

**Directories:**
- Page groups: `(name)` for shared layouts (Next.js convention)
- Dynamic routes: `[param]` for single, `[...slug]` for catch-all
- Feature domains: kebab-case, e.g., `kanban`, `execution`, `knowledgebase`

**Exports:**
- Index files (`index.ts`): Re-export public API from modules
- Types: Exported at top of module files
- Functions: Named exports preferred, default exports for page components

## Where to Add New Code

**New Feature:**
- Primary code: `src/lib/` (business logic) or `src/lib/{domain}/` (new domain)
- Components: `src/components/{feature}/`
- API: `src/app/api/{resource}/route.ts`
- Tests: `src/__tests__/{domain}/`

**New Component/Module:**
- Implementation: `src/components/{feature}/{ComponentName}.tsx`
- If complex: Create subdirectory with component + related utilities
- Export from feature index if needed

**Utilities:**
- General: `src/lib/utils.ts`
- Domain-specific: `src/lib/{domain}/utils.ts` or inline in module

**Hooks:**
- Client-side logic: `src/hooks/use{FeatureName}.ts`
- Export from `src/hooks/index.ts`

**Database Changes:**
- Schema updates: `src/lib/db/schema.ts`
- Query builders: `src/lib/db/queries.ts`
- Run migrations: `npm run db:generate` then `npm run db:push`

**Worker/Backend:**
- Job processing: Add method to `src/lib/agent/executor.ts` or executor module
- Execution: Add stage executor to `src/lib/execution/stage-executors/`
- Tools: Add tool definition to `src/lib/agent/tools.ts`

## Special Directories

**drizzle/**
- Purpose: Generated database migrations
- Generated: Yes (via `npm run db:generate`)
- Committed: Yes (for version control and reproduction)
- Usage: Read-only; don't edit manually

**data/**
- Purpose: Static data files (personas, recipes, constants)
- Generated: No
- Committed: Yes
- Usage: Loaded by initialization scripts or manually

**public/**
- Purpose: Static assets served via CDN/Next.js
- Generated: No
- Committed: Yes
- Usage: Fonts, images, favicon

**Chillax/, Synonym/**
- Purpose: Font source files
- Generated: No
- Committed: Yes
- Usage: Font files linked in layout.tsx

**.next/**
- Purpose: Next.js build output
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)
- Usage: Development and production builds

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)
- Usage: Runtime dependencies

## Path Aliases

From `tsconfig.json`:
- `@/*` → `./src/*`

Usage in imports:
```typescript
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { createRun } from "@/lib/execution";
import { useJobPolling } from "@/hooks";
```

Avoid relative paths (`../../../`) by using aliases throughout codebase.

## Related Packages

- **Monorepo Structure:** This is `orchestrator/` - main Next.js app within multi-package repo
- **Related:** `mcp-server/` (Model Context Protocol server), `elephant-ai/` (AI module), `prototypes/` (test projects)
- **Integration:** `elmer-docs/` (knowledge base, loaded as context)
