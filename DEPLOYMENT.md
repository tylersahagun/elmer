# Elmer Deployment Guide

> **Note:** This guide covers the current local stack (PostgreSQL + Cloudflare Tunnel). A Post-Convex section at the bottom covers how deployment changes after the Convex migration completes (Phases 7–8). The new Chat & Agent Hub feature is Convex-first and will not function on the legacy PostgreSQL backend.
> **Source-of-truth note:** Linear is canonical for implementation and milestone status. This guide is the operational runbook for auth, deployment, release gates, and cutover behavior.

**Infrastructure:** Local PostgreSQL + Cloudflare Tunnel  
**Public URL:** https://elmer.studio  
**Status:** Self-hosted on local Mac

## Architecture Overview

Elmer runs as a self-hosted application:

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Mac                                │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Next.js App   │  │   PostgreSQL    │                  │
│  │  localhost:3000 │──│  localhost:5433 │                  │
│  └────────┬────────┘  └─────────────────┘                  │
│           │                                                 │
│  ┌────────▼────────┐                                       │
│  │ Cloudflare      │                                       │
│  │ Tunnel (elmer)  │                                       │
│  └────────┬────────┘                                       │
└───────────│─────────────────────────────────────────────────┘
            │
            ▼
    https://elmer.studio
```

**Important:** The site is only available when your Mac is running with all services active.

---

## Quick Start

### Option 1: Use the `/local` Command (Recommended)

In Cursor, run:

```
/local
```

This automatically:

1. Starts Docker if needed
2. Starts PostgreSQL container
3. Runs database migrations
4. Starts the dev server
5. Starts the Cloudflare Tunnel

### Option 2: Manual Setup

```bash
cd orchestrator

# Start PostgreSQL
docker compose up -d

# Wait for database to be ready
docker exec elmer-postgres pg_isready -U elmer -d orchestrator

# Run migrations
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5433/orchestrator" npm run db:migrate

# Start dev server
npm run dev

# Start tunnel (in another terminal)
cloudflared tunnel run elmer
```

---

## Current Release Gate

### Platform Readiness

- [ ] Clerk frontend API, app origin, and Convex envs are aligned (`GTM-94`, `GTM-96`)
- [ ] `npm run check:auth` passes against the intended environment (`GTM-98`)
- [ ] The public login route is healthy at `https://elmer.studio/login`
- [ ] GitHub App webhook is still verified against the active Convex deployment

`npm run check:auth` should fail if the Clerk publishable key cannot be decoded,
if `CLERK_JWT_ISSUER_DOMAIN` disagrees with that frontend API host, if
`AUTH_URL` and `NEXTAUTH_URL` disagree, or if `NEXT_PUBLIC_CONVEX_URL` is
missing or points at a `.convex.site` URL before it verifies that `/login`
returns HTML with Clerk bootstrap markers and performs Clerk DNS checks.

### Delivery Readiness

- [ ] The first Convex migration tranche is stable on `/`, `/workspace/[id]`, and `/workspace/[id]/signals`
- [ ] Playwright smoke coverage is reliable enough to gate deploys (`GTM-78`, `GTM-82`, `GTM-83`, `GTM-84`)
- [ ] Remaining Phase 7 blockers are tracked as named tickets, not hidden in broad migration epics
- [ ] Deployment docs match the real current stack and the intended cutover sequence

### Database Requirements

**PostgreSQL with pgvector extension for the remaining legacy SQL path:**

```bash
# Connect to local database
docker exec -it elmer-postgres psql -U elmer -d orchestrator

# Verify pgvector is available
SELECT * FROM pg_extension WHERE extname = 'vector';

# If not installed, run:
CREATE EXTENSION IF NOT EXISTS vector;
```

**Note:** Convex is the intended primary runtime store, but the current branch
still needs PostgreSQL for the leftover Drizzle migrations, parity checks, and
DB-backed tests. The official PostgreSQL Docker image includes pgvector. If
using a different setup, ensure pgvector 0.5+ is installed.

### Environment Variables

Create/update `.env.local` in the `orchestrator/` directory:

```bash
# Database (local PostgreSQL)
DATABASE_URL=postgresql://elmer:elmer_local_dev@localhost:5433/orchestrator

# Authentication
AUTH_SECRET=<generate with: openssl rand -base64 32>
AUTH_URL=https://elmer.studio

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# AI Services
ANTHROPIC_API_KEY=<for signal extraction and document generation>
OPENAI_API_KEY=<for embeddings via text-embedding-3-small>

# Automation (for cron jobs)
CRON_SECRET=<generate with: openssl rand -base64 32>
```

### Database Migrations

Run migrations to apply schema changes:

```bash
cd orchestrator
npm run db:migrate
```

**Migrations for v1.1:**

1. `0006_brave_purifiers.sql` - signals, signalProjects, signalPersonas tables
2. `0007_mute_warbird.sql` - webhookKeys table
3. `0008_colossal_havok.sql` - integrations table
4. `0009_pgvector_classification.sql` - embeddingVector columns, HNSW indexes
5. `0010_signal_automation.sql` - automationActions table

---

## Services

### PostgreSQL (Docker)

**Container:** `elmer-postgres`  
**Image:** `pgvector/pgvector:pg16`  
**Port:** 5433

```bash
# Start
docker compose up -d

# Stop (keeps data)
docker compose stop

# Stop and delete data
docker compose down -v

# View logs
docker compose logs -f postgres

# Connect directly
docker exec -it elmer-postgres psql -U elmer -d orchestrator
```

**Connection Details:**

- Host: `localhost`
- Port: `5433`
- Database: `orchestrator`
- User: `elmer`
- Password: `elmer_local_dev`

### Next.js Dev Server

**Port:** 3000

```bash
# Start
npm run dev

# Or with explicit database URL
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5433/orchestrator" npm run dev
```

### Cloudflare Tunnel

**Tunnel Name:** `elmer`  
**Public URL:** https://elmer.studio

The app tunnel only serves `elmer.studio`. Clerk uses separate DNS records for
its hosted frontend API and account portal. For the current custom-domain
configuration, these records must also exist:

- `clerk.elmer.studio` -> `frontend-api.clerk.services`
- `accounts.elmer.studio` -> `accounts.clerk.services`

```bash
# Start tunnel
cloudflared tunnel run elmer

# Check tunnel status
cloudflared tunnel info elmer

# List all tunnels
cloudflared tunnel list

# View config
cat ~/.cloudflared/config.yml
```

**Tunnel Configuration** (`~/.cloudflared/config.yml`):

```yaml
tunnel: <tunnel-id>
credentials-file: ~/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: elmer.studio
    service: http://localhost:3000
  - service: http_status:404
```

---

## Cron Jobs

Instead of serverless cron (Vercel), cron jobs run locally or via launchd/cron:

### Signal Automation

The `/api/cron/signal-automation` endpoint processes signals hourly.

**Option 1: Manual trigger**

```bash
curl -X GET http://localhost:3000/api/cron/signal-automation \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Option 2: macOS launchd** (create `~/Library/LaunchAgents/com.elmer.signal-automation.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.elmer.signal-automation</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/curl</string>
        <string>-X</string>
        <string>GET</string>
        <string>http://localhost:3000/api/cron/signal-automation</string>
        <string>-H</string>
        <string>Authorization: Bearer YOUR_CRON_SECRET</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer>
</dict>
</plist>
```

Load with: `launchctl load ~/Library/LaunchAgents/com.elmer.signal-automation.plist`

---

## Post-Deployment Verification

### 1. Database Check

```bash
# Verify tables exist
docker exec elmer-postgres psql -U elmer -d orchestrator -c "
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'signal%'
ORDER BY table_name;"

# Should return:
# - signal_personas
# - signal_projects
# - signals

# Verify pgvector
docker exec elmer-postgres psql -U elmer -d orchestrator -c "
SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### 2. Service Health

```bash
# Check all services
/local status

# Or manually:
docker ps  # PostgreSQL running
curl http://localhost:3000  # Dev server responding
pgrep -f cloudflared  # Tunnel running
curl https://elmer.studio  # Public URL accessible
```

### 3. E2E Workflow Tests

**Test 1: Manual Signal Creation**

1. Navigate to Signals page at https://elmer.studio/signals
2. Click "Add Signal"
3. Paste some feedback text
4. Submit form
5. Verify signal appears in list
6. Wait 5 seconds, refresh
7. Check signal has severity/frequency populated (AI processing worked)

**Test 2: PRD Generation with Citations**

1. Create a new project
2. Link 2-3 signals to the project
3. Trigger PRD generation
4. Verify PRD includes "Supporting User Evidence" section

---

## Troubleshooting

### Docker won't start

```bash
# Open Docker Desktop manually, wait for it to start
open -a Docker

# Then retry
/local
```

### PostgreSQL connection refused

```bash
# Check if container is running
docker ps | grep elmer-postgres

# If not, start it
docker compose up -d

# Check logs for errors
docker compose logs postgres
```

### pgvector extension not available

```bash
# Connect and install
docker exec -it elmer-postgres psql -U elmer -d orchestrator
CREATE EXTENSION IF NOT EXISTS vector;
```

### Cloudflare Tunnel not connecting

```bash
# Check tunnel status
cloudflared tunnel info elmer

# Re-authenticate if needed
cloudflared tunnel login

# Verify DNS
dig elmer.studio
```

### Site not accessible at elmer.studio

1. Verify tunnel is running: `pgrep -f cloudflared`
2. Verify dev server is running: `lsof -i :3000`
3. Check tunnel config: `cat ~/.cloudflared/config.yml`
4. Restart tunnel: `pkill -f cloudflared && cloudflared tunnel run elmer`

---

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker exec elmer-postgres pg_dump -U elmer orchestrator > backup-$(date +%Y%m%d).sql

# Restore from backup
cat backup-20260124.sql | docker exec -i elmer-postgres psql -U elmer -d orchestrator
```

### Full Reset

```bash
# Stop all services
pkill -f cloudflared
pkill -f "next dev"
docker compose down -v

# Restart fresh
/local
```

---

## Quick Reference

| Service        | URL/Port       | Start Command                  |
| -------------- | -------------- | ------------------------------ |
| PostgreSQL     | localhost:5433 | `docker compose up -d`         |
| Dev Server     | localhost:3000 | `npm run dev`                  |
| Tunnel         | elmer.studio   | `cloudflared tunnel run elmer` |
| Drizzle Studio | localhost:4983 | `npm run db:studio`            |

| Command         | Purpose                    |
| --------------- | -------------------------- |
| `/local`        | Start all services         |
| `/local status` | Check service health       |
| `/local reset`  | Wipe and recreate database |
| `/local tunnel` | Start only the tunnel      |

---

---

## Post-Convex Deployment (After Phase 7 Migration)

When the Convex migration completes, the deployment model changes significantly:

### New Stack

| Service | Old | New |
|---|---|---|
| Backend DB | PostgreSQL in Docker | **Convex** (managed cloud) |
| Auth | NextAuth + Google OAuth | **Clerk** (Google OAuth, `@askelephant.ai` domain) |
| Hosting | Local Mac + Cloudflare Tunnel | **Vercel** (always-on) |
| Vector search | pgvector sidecar | **Neon PostgreSQL** (embeddings only) |
| Cron jobs | launchd on local Mac | **Convex crons** (cloud-native) |

### New Environment Variables (Convex Era)

```bash
# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from Clerk dashboard>
CLERK_SECRET_KEY=<from Clerk dashboard>
CLERK_JWT_ISSUER_DOMAIN=<must match Clerk frontend API origin>

# Convex
NEXT_PUBLIC_CONVEX_URL=<from Convex dashboard>
CONVEX_DEPLOY_KEY=<for CI/CD>

# Neon (vector sidecar only)
NEON_DATABASE_URL=<from Neon dashboard>

# AI
ANTHROPIC_API_KEY=<for agents + chat>
OPENAI_API_KEY=<for embeddings via text-embedding-3-small>

# Integrations
COMPOSIO_API_KEY=<for Slack, Linear, Notion, HubSpot>
BRAVE_SEARCH_API_KEY=<for web search>
```

If you use Clerk on a custom domain, `CLERK_JWT_ISSUER_DOMAIN` must match the
same frontend API host encoded in `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. A
mismatch causes login pages to load partially while Clerk JS assets fail to
resolve.

### Chat & Agent Hub (Convex-required)

The new ElmerPanel chat system (`convex/chat.ts`) requires Convex to be deployed. It does **not** have a PostgreSQL fallback. Key features only available after migration:
- Persistent conversation threads (`chatThreads` + `chatMessages` tables)
- Streaming chat responses via Convex HTTP endpoint
- Agent Hub with live Convex subscriptions
- Context Peek with cached summaries in Convex

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from orchestrator/)
cd orchestrator
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_JWT_ISSUER_DOMAIN production
# (etc. for all vars above)
```

### Convex Deployment

```bash
# Install Convex CLI
npm i -g convex

# Deploy from the orchestrator/convex/ directory
cd orchestrator
npx convex deploy --prod
```

The local Mac + Docker setup is no longer needed once Vercel + Convex are live. The Cloudflare Tunnel can be retired.

---

---

## E2E Test Commands

Playwright is installed and configured. Run tests from `orchestrator/`:

```bash
# Run all E2E tests (requires local server running or PLAYWRIGHT_BASE_URL set)
npm run test:e2e

# Smoke tests only — fast, post-deploy validation (~30s)
npm run test:e2e:smoke

# Interactive UI mode
npm run test:e2e:ui

# Against a specific URL (e.g. Vercel Preview)
PLAYWRIGHT_BASE_URL=https://your-preview.vercel.app npm run test:e2e:smoke
```

### Auth Setup
Before running E2E tests, create `e2e/.auth/user.json` by running:
```bash
# Set credentials in .env.local first:
# E2E_TEST_EMAIL=test@askelephant.ai
# E2E_TEST_PASSWORD=...
npm run test:e2e -- --project=setup
```

### Deterministic E2E Fixtures

The current E2E suite now uses Convex-backed deterministic seed helpers for repeatable scenarios:

- `orchestrator/e2e/fixtures/inbox.ts`
- `orchestrator/e2e/fixtures/jobs.ts`

These seed through the Convex MCP HTTP surface and require:

```bash
CONVEX_SITE_URL=https://fortunate-parakeet-796.convex.site
MCP_SECRET=elmer-mcp-internal
```

The new dev-only seed routes are:

- `POST /mcp/e2e/inbox`
- `POST /mcp/e2e/questions`

---

## MCP UI Apps

The 5 MCP UI apps are pre-built in `mcp-server/apps/dist/`. To rebuild after source changes:

```bash
cd mcp-server
npm run build:apps
# Builds: initiative-dashboard, signal-map, agent-monitor, pm-navigator, jury-viewer
```

Apps are automatically served as MCP resources when `mcp-server` runs.

---

## GitHub App Verification

The GitHub App for Elmer is configured and verified against the active Convex webhook.

### Verified Working

- GitHub App installed on the Elmer repo
- Convex env vars set: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_B64`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_WEBHOOK_SECRET`
- Webhook URL active: `https://fortunate-parakeet-796.convex.site/webhooks/github`
- Signed GitHub pushes return `200`
- Unsigned test requests return `401` (expected, confirms HMAC verification is active)

### Important Current Behavior

- The active webhook currently targets the **dev Convex deployment** (`fortunate-parakeet-796`)
- The webhook route accepts pushes from both:
  - `tylersahagun/elmer` — current source of agent definitions and docs
  - `AskElephant/pm-workspace` — future repo split
- MCP HTTP routes require:

```bash
Authorization: Bearer <MCP_SECRET>
```

Not `x-mcp-secret`.

### Before Prod Cutover

When Phase 7 migration is ready and production traffic moves fully to the production Convex deployment, update the GitHub App webhook URL from the dev deployment to the production Convex URL.

---

## Swarm Execution Order

Recommended next swarm after the Phase 0-5 work and GTM-33 completion:

1. **Platform-reliability lane** — finish `GTM-94`, `GTM-95`, `GTM-96`, `GTM-97`, `GTM-98`
2. **Testing lane** — finish `GTM-78`, `GTM-82`, `GTM-83`, `GTM-84`, then extend the CI/test baseline
3. **Team-awareness lane** — ship `GTM-69`, `GTM-70`, then `GTM-55` to `GTM-58`
4. **Migration lane** — continue `GTM-59` and burn down `GTM-99` to `GTM-103`
5. **Chat-readiness lane** — keep `GTM-71` to `GTM-77` at spec/contract level until migration is holding

The best parallelism pattern right now is:
- Lane 0: Clerk/app-origin/auth reliability
- Lane A: E2E / Playwright / POM expansion
- Lane B: Presence + blame thread + orchestrator surfaces
- Lane C: Migration inventory + named blocker tickets + Clerk/Vercel cutover prep
- Lane D: Chat surface contracts only

Current checkpoint after this wave:
- Lane 0 added auth-health checks in `orchestrator/scripts/check-auth-health.ts`
- Lane A shipped seeded inbox fixtures, expanded smoke coverage, and the first agent-execution spec
- Lane B shipped canonical job attribution and minimal live presence
- Lane C shipped `orchestrator/MIGRATION-READINESS.md` and spun the named blocker tickets out of the migration epic
- Migration tranche 1 has started:
  - `/` is now Convex-backed for workspace list/create
  - `/workspace/[id]` is now Convex-backed for workspace/project loading
  - `/workspace/[id]/signals` is now Convex-backed for core signal list/create/update/delete flows
- Migration tranche 2 checkpoint:
  - `/workspace/[id]/agents` is now Convex-backed for agent definition list + enabled toggle
  - `/projects/[id]` now consumes Convex-backed project/workspace/document state through a compatibility merge while blocked tabs remain on legacy paths
- Migration tranche 3 checkpoint:
  - core project-detail actions now use Convex-backed job scheduling and document save flows
  - project detail still intentionally preserves legacy-only publish / file-backed / blocked tab edges until their parity work lands
- Migration tranche 4 checkpoint:
  - project-detail command execution and prototype iteration now queue jobs through Convex
  - project signal linking in the picker flow now uses Convex-backed signal queries and link mutations
- Migration tranche 5 checkpoint:
  - project branch metadata updates now use Convex-backed project mutation
  - the linked-signals section in project detail now uses Convex-backed signal queries and unlink mutation
- Migration tranche 6 checkpoint:
  - the project-detail prototype list now overlays Convex-backed prototype variants
  - manual prototype link and delete flows now use Convex prototype mutations rather than the legacy prototype routes
- Membership/auth parity foundation checkpoint:
  - Convex now stores workspace members and invitations
  - the existing workspace member/invitation/token routes are bridged to the Convex-backed parity layer
  - permission checks now consult Convex membership first, with legacy fallback during migration
- Membership/auth parity consumer checkpoint:
  - workspace settings now consumes the Convex-backed member/invitation parity layer
  - workspace settings saves now flow through the Convex workspace mutation path
  - invite creation in the modal now goes directly to the Convex invitation mutation
- Settings lane unblock checkpoint:
  - the missing workspace-columns route is restored
  - the settings page now rehydrates pipeline columns from the dedicated columns route under the new auth/membership layer
  - graduation criteria and column settings can load again without depending on the old `workspace.columnConfigs` response shape
- Activity parity checkpoint:
  - Convex now stores workspace activity logs
  - the legacy activity helper dual-writes new events into Convex during migration
  - the workspace activity route now reads from the Convex-backed activity feed, so the settings activity tab is no longer a Drizzle-only surface
- Column / graduation parity checkpoint:
  - Convex now stores `columnConfigs`
  - default pipeline columns are seeded into Convex for new or uninitialized workspaces
  - the `/api/columns*` and `/api/workspaces/[id]/columns` bridges now point at the Convex-backed column model
  - the settings page’s column and graduation cards now operate on that Convex-backed source of truth through the existing route layer
- Settings lane status:
  - the core settings surfaces now have parity across members, invitations, workspace save, activity feed, and pipeline columns / graduation criteria
  - remaining settings work is concentrated in narrower admin/settings exceptions and external/file-backed edges
- Convex-native context lane checkpoint:
  - Convex now stores first-class personas and signal-persona links
  - Convex now backs the workspace search surface across documents, memory, knowledgebase, and personas
  - runtime personas, signal-persona links, search, and knowledgebase routes now bridge to Convex-backed sources of truth
  - persona writes still dual-write to repo files for compatibility while runtime reads are Convex-first

---

**Deployment Guide Version:** 2.17  
**Last Updated:** 2026-03-06  
**Infrastructure (current):** Local PostgreSQL + Cloudflare Tunnel  
**Infrastructure (post-migration):** Vercel + Convex + Neon
