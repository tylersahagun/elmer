# External Integrations

**Analysis Date:** 2026-01-24

## APIs & External Services

**AI/LLM:**
- Claude (Anthropic) - LLM for content generation, signal extraction, and execution automation
  - SDK/Client: `@anthropic-ai/sdk` 0.71.2
  - Auth: `ANTHROPIC_API_KEY` env var
  - Usage: `src/lib/execution/providers.ts`, `src/lib/agent/executor.ts`, `src/app/api/chat/route.ts`, `src/app/api/ai/generate/route.ts`, `src/lib/ai/extraction.ts`
  - Models used: claude-sonnet-4-20250514 (generation), claude-3-5-haiku (classification)

- OpenAI - Embeddings for signal similarity and classification
  - SDK/Client: `openai` package
  - Auth: `OPENAI_API_KEY` env var
  - Model: text-embedding-3-small (1536 dimensions)
  - Usage: `src/lib/ai/embeddings.ts`
  - Purpose: Generate embeddings for signals and projects for pgvector similarity search

**Skills Marketplace:**
- SkillsMP - Skills/template marketplace for stage automation
  - SDK/Client: Custom client at `src/lib/skills/skillsmp-client.ts`
  - Auth: `SKILLMP_API_KEY` env var
  - Base URL: https://skillsmp.com/api/v1
  - Capabilities: Keyword search, AI semantic search, skill fetching
  - Usage: `src/lib/skills/skills-service.ts`, `src/lib/skills/stage-recipes-service.ts`

## Data Storage

**Databases:**
- PostgreSQL (local Docker with pgvector)
  - Connection: `DATABASE_URL` env var
  - Default: `postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator`
  - Client/ORM: Drizzle ORM 0.45.1 with `pg` driver
  - Location: `src/lib/db/`
  - Schema: `src/lib/db/schema.ts`
  - Migrations: `drizzle/` directory
  - Extensions: pgvector (for embeddings/similarity search)
  - Container: `elmer-postgres` via Docker Compose

**File Storage:**
- Local filesystem (documents, artifacts, prototypes stored locally)
  - Implementation: Node.js `fs/promises`
  - Used in: `src/lib/jobs/executor.ts`, `src/lib/execution/` stage executors
  - Paths: Configurable per workspace (contextPath, prototypesPath in settings)

**Caching:**
- React Query (client-side data caching)
  - Package: `@tanstack/react-query` 5.90.18
  - Configured for server state sync

## Authentication & Identity

**Auth Provider:**
- Custom (no external auth service currently)
  - Implementation: Workspace-based (workspaceId context)
  - No user authentication layer in schema
  - No API key validation middleware found

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Rollbar, etc.)

**Logs:**
- Console logging (simple console.log throughout codebase)
- Database logging: Run logs stored in `jobRuns` and execution logs
  - Storage location: `src/lib/execution/run-manager.ts`
  - Streaming: Real-time log streaming to WebSocket/API

**Analytics (Optional):**
- PostHog - Optional analytics integration
  - Status: Configured in schema but not yet integrated
  - Env var: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
  - Documentation: Would be used for tracking feature adoption

## CI/CD & Deployment

**Hosting:**
- Self-hosted via Cloudflare Tunnel
  - Public URL: https://elmer.studio
  - Tunnel name: `elmer`
  - Config: `~/.cloudflared/config.yml`
  - Start: `cloudflared tunnel run elmer`
  - **Note:** Site only available when local Mac is running

**Local Services:**
- PostgreSQL: Docker container `elmer-postgres` on port 5432
- Next.js Dev Server: `npm run dev` on port 3000
- Cloudflare Tunnel: Proxies localhost:3000 to elmer.studio

**CI Pipeline:**
- GitHub Actions for PR validation
- Storybook: Chromatic for visual regression
- Local development focus (no automated production deployment)

**Quick Start:**
- Use `/local` command in Cursor to start all services
- Or manually: `docker compose up -d && npm run dev && cloudflared tunnel run elmer`

## Integrations In Schema (Planned/Not Yet Integrated)

**Linear API (Ticket Management):**
- Status: Schema prepared, not actively integrated
  - Env var: `LINEAR_API_KEY` (commented in .env.example)
  - Reference: `linearMappings` table in schema, `src/lib/db/schema.ts`
  - Placeholder in: `src/lib/execution/stage-executors/tickets-executor.ts`
  - Purpose: Sync generated tickets to Linear workspace

**Notion API (Knowledge Base Sync):**
- Status: Schema prepared, not actively integrated
  - Env var: `NOTION_API_KEY` (commented in .env.example)
  - Reference: `notionWorkspaceId` in workspace settings
  - Purpose: Sync knowledge base entries from Notion

**Chromatic (Storybook Deployment):**
- Status: Partially integrated (deployment queued, not fully implemented)
  - Env var: `CHROMATIC_PROJECT_TOKEN`
  - Usage: `src/lib/jobs/executor.ts` - queues deployment job
  - Purpose: Auto-publish Storybook to Chromatic for visual regression testing
  - Note: Requires `CHROMATIC_PROJECT_TOKEN` to be set

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string (default: `postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator`)
- `ANTHROPIC_API_KEY` - Claude API key (critical for execution and signal extraction)
- `OPENAI_API_KEY` - OpenAI API key (critical for embeddings/similarity search)
- `AUTH_SECRET` - NextAuth session encryption key
- `AUTH_URL` - Public URL (https://elmer.studio)
- `CRON_SECRET` - Secret for cron endpoint authentication

**Optional env vars:**
- `CHROMATIC_PROJECT_TOKEN` - Storybook deployment
- `LINEAR_API_KEY` - Linear ticket integration (prepared, not used)
- `NOTION_API_KEY` - Notion sync (prepared, not used)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (default: https://app.posthog.com)
- `WORKER_ID` - Custom worker ID (auto-generated if not set)
- `DEFAULT_WORKSPACE_ID` - Default workspace for worker (optional)
- `POLL_INTERVAL` - Job polling interval in ms (default: 5000)
- `MAX_CONCURRENT` - Max concurrent job executions (default: 1)

**Secrets location:**
- `.env.local` (git-ignored, contains actual credentials)
- `.env.example` (template for developers)

## Webhooks & Callbacks

**Incoming:**
- Not detected (no webhook endpoints for external services)

**Outgoing:**
- Chromatic deployment trigger via exec command
- Git push after job completion (optional, via `src/lib/git/branches.ts`)

## Data Integration Patterns

**Job Processing:**
- External API calls from background workers (`src/execution-worker.ts`)
- Execution workers poll for queued runs and execute against Claude API
- Results persisted to PostgreSQL with artifact storage

**Knowledge Base:**
- Documents stored locally and in PostgreSQL
- Can be synced from Notion (prepared, not active)
- Searchable via vector-like features in knowledge base

**Skills Integration:**
- Skills fetched from SkillsMP via API
- Stored in memory during execution
- No persistent cache of skills (fetched on demand)

---

*Integration audit: 2026-01-24*
*Updated: Removed Vercel/Neon references, added self-hosted Cloudflare Tunnel setup, added OpenAI embeddings*
