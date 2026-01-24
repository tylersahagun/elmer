# Elmer Deployment Guide

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
│  │  localhost:3000 │──│  localhost:5432 │                  │
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
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator" npm run db:migrate

# Start dev server
npm run dev

# Start tunnel (in another terminal)
cloudflared tunnel run elmer
```

---

## Pre-Deployment Checklist (v1.1)

### Code Readiness

- [x] All 10 phases complete (45 plans executed)
- [x] All 40 requirements satisfied
- [x] TypeScript compiles without errors
- [x] Integration quality: 100%

### Database Requirements

**PostgreSQL with pgvector extension:**

```bash
# Connect to local database
docker exec -it elmer-postgres psql -U elmer -d orchestrator

# Verify pgvector is available
SELECT * FROM pg_extension WHERE extname = 'vector';

# If not installed, run:
CREATE EXTENSION IF NOT EXISTS vector;
```

**Note:** The official PostgreSQL Docker image includes pgvector. If using a different setup, ensure pgvector 0.5+ is installed.

### Environment Variables

Create/update `.env.local` in the `orchestrator/` directory:

```bash
# Database (local PostgreSQL)
DATABASE_URL=postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator

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
**Port:** 5432

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
- Port: `5432`
- Database: `orchestrator`
- User: `elmer`
- Password: `elmer_local_dev`

### Next.js Dev Server

**Port:** 3000

```bash
# Start
npm run dev

# Or with explicit database URL
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator" npm run dev
```

### Cloudflare Tunnel

**Tunnel Name:** `elmer`  
**Public URL:** https://elmer.studio

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
| PostgreSQL     | localhost:5432 | `docker compose up -d`         |
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

**Deployment Guide Version:** 2.0  
**Last Updated:** 2026-01-24  
**Infrastructure:** Local PostgreSQL + Cloudflare Tunnel
